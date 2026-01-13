const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const Image = require('../models/Image');
const s3Service = require('../services/s3Service');
const fastApiService = require('../services/fastApiService');
const {sendStoryGeneratedEmail} = require('../services/emailService');
// @desc    Start questionnaire
// @route   POST /api/story/start
// @access  Private
exports.startQuestionnaire = async (req, res, next) => {
  const { title, genre, length, characterDetails, numCharacters } = req.body;
  try {

    // Create story document
    const story = await Story.create({
      user: req.user.id,
      title,
      genre,
      numOfPages: length,
      numCharacters,
      characterDetails,
      step: 1
    });

    const result = await fastApiService.startQuestionnaire();

    res.status(200).json({
      success: true,
      storyId: story._id,
      data: result
    });
  } catch (error) {
    console.error('Questionnaire error:', { userId: req.user.id });
    next(error);
  }
};

// @desc    Get next question
// @route   POST /api/story/next
// @access  Private
exports.nextQuestion = async (req, res, next) => {
  try {
    const { storyId, conversation, answer } = req.body;

    const result = await fastApiService.nextQuestion(conversation, answer);

    if (result) {
      // Update story conversation
      const story = await Story.findByIdAndUpdate(storyId);
      if (story) {
        conversation.push({
          question: result.question,
          answer: answer
        });
        story.conversation = conversation;
        story.step = 2;
        await story.save();
      }
    }

    res.status(200).json({
      success: true,
      storyId,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate gist
// @route   POST /api/story/gist
// @access  Private
exports.generateGist = async (req, res, next) => {
  try {
    const { storyId, conversation } = req.body;

    const story = await Story.findById(storyId);

    const result = await fastApiService.generateGist(conversation, story.genre);

    if (result) {
      // Update story gist and step
      if (story) {
        story.gist = result.gist;
        story.step = 3;
        await story.save();
      }
    }
    
    res.status(200).json({
      success: true,
      storyId,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create story with pages
// @route   POST /api/story/create
// @access  Private
exports.createStory = async (req, res, next) => {
  try {
    const {
      storyId,
      gist,
      genre,
      numCharacters,
      characterDetails,
      numPages,
      orientation
    } = req.body;
    
    // console.log("request body:", req.body);
    
    const fixedCharacterDetails = characterDetails.map(cd => `${cd.name}: ${cd.details}`).join('\n');
    // console.log("Fixed Character Details:", fixedCharacterDetails);
    // await new Promise(resolve => setTimeout(resolve, 20000));
    
    
    
    
    // Generate story pages from FastAPI
    const storyResult = await fastApiService.generateStory(
      gist,
      numCharacters,
      fixedCharacterDetails,
      genre,
      numPages
    );
    
    
    // update story document
    const story = await Story.findByIdAndUpdate(storyId, {
      gist,
      orientation: orientation || 'Portrait',
      step: 4,
      status: 'generating'
    }, { new: true });
    
    
    const pagePromises = storyResult.pages.map(page =>
      StoryPage.findOneAndUpdate(
        { story: story._id, pageNumber: page.page },   // Find existing page
        {
          text: page.text,
          html: page.html || page.text,
          prompt: page.prompt,
          status: 'pending'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );
    
    
    await Promise.all(pagePromises);
    
    // Update
    story.generationMetadata = {
      completedAt: Date.now()
    };
    await story.save();
    
    // Populate pages
    const populatedStory = await Story.findById(story._id)
    .populate('user', 'name email');
    
    const pages = await StoryPage.find({ story: story._id }).sort({ pageNumber: 1 });
    
    // emailN-notification
    sendStoryGeneratedEmail({
      user: populatedStory.user,
      story: populatedStory,
      pages
    }).catch(err => {
      console.error('Story email failed:', err);
    }); 
    
    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      storyId,
      data: {
        story: populatedStory,
        pages
      }
    });
  } catch (error) {
    // Update story status to failed
    if (req.body.storyId) {
      await Story.findByIdAndUpdate(req.body.storyId, {
        status: 'failed',
        'generationMetadata.errorMessage': error.message
      });
    }
    next(error);
  }
};



// @desc    Get all user stories
// @route   GET /api/story/my-stories
// @access  Private
exports.getMyStories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const stories = await Story.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('coverImage')
      .populate('backCoverImage');

    const total = await Story.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        stories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single story with pages
// @route   GET /api/story/:id
// @access  Private
exports.getStory = async (req, res, next) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('coverImage', '-base64Data')
      .populate('backCoverImage', '-base64Data');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const pages = await StoryPage.find({ story: story._id })
      .sort({ pageNumber: 1 })
      .populate({
        path: 'characterImage',
        select: '-base64Data'
      })
      .populate({
        path: 'backgroundImage',
        select: '-base64Data'
      })
      .populate({
        path: 'finalCompositeImage',
        select: '-base64Data'
      });

    res.status(200).json({
      success: true,
      data: {
        story,
        pages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate titles
// @route   POST /api/story/titles/generate
// @access  Private
exports.generateTitles = async (req, res, next) => {
  try {
    const { storyId, selectedTitle, genre } = req.body;

    const updatedStory = await Story.findByIdAndUpdate(storyId, { title: selectedTitle }, { new: true });

    const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });
    const fullText = pages.map(page => page.text).join(' ');

    await updatedStory.save();

    const result = await fastApiService.generateTitles(fullText, genre);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate titles
// @route   POST /api/story/titles/regenerate
// @access  Private
exports.regenerateTitles = async (req, res, next) => {
  try {
    const { storyId, story, genre, previousTitles, selectedTitle } = req.body;

    const updatedStory = await Story.findByIdAndUpdate(storyId, { title: selectedTitle }, { new: true });

    if (!updatedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    await updatedStory.save();

    const result = await fastApiService.regenerateTitles(story, genre, previousTitles);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete story
// @route   DELETE /api/story/:id
// @access  Private
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Delete associated pages
    await StoryPage.deleteMany({ story: story._id });

    // Delete story
    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};