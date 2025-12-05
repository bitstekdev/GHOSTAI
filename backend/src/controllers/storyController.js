const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const fastApiService = require('../services/fastApiService');

// @desc    Start questionnaire
// @route   POST /api/story/start
// @access  Private
exports.startQuestionnaire = async (req, res, next) => {
  try {
    const result = await fastApiService.startQuestionnaire();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next question
// @route   POST /api/story/next
// @access  Private
exports.nextQuestion = async (req, res, next) => {
  try {
    const { conversation, answer } = req.body;

    const result = await fastApiService.nextQuestion(conversation, answer);

    res.status(200).json({
      success: true,
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
    const { conversation, genre } = req.body;

    const result = await fastApiService.generateGist(conversation, genre);

    res.status(200).json({
      success: true,
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
      // title,
      gist,
      genre,
      numCharacters,
      characterDetails,
      numPages,
      conversation,
      // orientation
    } = req.body;

    // Create story document
    const story = await Story.create({
      user: req.user.id,
      // title,
      genre, //model
      gist, //model
      conversation,
      numCharacters, //model
      characterDetails, //model
      // orientation: orientation || 'Portrait',
      status: 'generating'
    });

    console.log('yaha tak aa aaya');
    // Generate story pages from FastAPI
    const storyResult = await fastApiService.generateStory(
      gist,
      numCharacters,
      characterDetails,
      genre,
      numPages
    );

    // Create story page documents
    const pagePromises = storyResult.pages.map(page =>
      StoryPage.create({
        story: story._id,
        pageNumber: page.page,
        text: page.text,
        prompt: page.prompt,
        status: 'pending'
      })
    );

    await Promise.all(pagePromises);

    // Update story status
    story.status = 'completed';
    story.generationMetadata = {
      completedAt: Date.now()
    };
    await story.save();

    // Populate pages
    const populatedStory = await Story.findById(story._id)
      .populate('user', 'name email');

    const pages = await StoryPage.find({ story: story._id }).sort({ pageNumber: 1 });

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
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
      .populate('coverImage')
      .populate('backCoverImage');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    const pages = await StoryPage.find({ story: story._id })
      .sort({ pageNumber: 1 })
      .populate('characterImage')
      .populate('backgroundImage')
      .populate('finalCompositeImage');

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
    const { story, genre } = req.body;

    const result = await fastApiService.generateTitles(story, genre);

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
    const { story, genre, previousTitles } = req.body;

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