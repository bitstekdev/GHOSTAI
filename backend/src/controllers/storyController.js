const Story = require('../models/Story');
const StoryPage = require('../models/StoryPage');
const Image = require('../models/Image');
const s3Service = require('../services/s3Service');
const fastApiService = require('../services/fastApiService');
const { consumeUsage, getActiveSubscriptionOrFail } = require("../services/subscriptionUsage.service");


// @desc    Start story (hybrid: questionnaire or direct gist)
// @route   POST /api/story/start
// @access  Private
const STATIC_GENRES = [
  'Fantasy','Adventure','Family','Mystery','Housewarming',
  'Corporate Promotion','Marriage','Baby Shower','Birthday','Sci-Fi'
];

exports.startStory = async (req, res, next) => {
  try {
    const {
      title,
      genre, // legacy single-string
      genres, // preferred array
      length,
      characterDetails,
      numCharacters,
      entryMode = 'questionnaire',
      gist
    } = req.body;

    // Treat any frontend placeholder like "Custom" as transient — do not store it.
    const rawInputGenres = Array.isArray(genres) ? genres : (genre ? [genre] : []);
    const inputGenres = rawInputGenres.filter(Boolean).filter(g => g !== 'Custom');

    if (!inputGenres || inputGenres.length === 0 || !length || !numCharacters) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate max 2 genres
    if (inputGenres.length > 2) {
      return res.status(400).json({ success: false, message: 'Maximum 2 genres allowed' });
    }

    // Prevent mixing static and custom genres
    const hasStatic = inputGenres.some(g => STATIC_GENRES.includes(g));
    const hasCustom = inputGenres.some(g => !STATIC_GENRES.includes(g));
    if (hasStatic && hasCustom) {
      return res.status(400).json({ success: false, message: 'Cannot mix static and custom genres' });
    }

    if (entryMode === 'gist') {
      if (!gist || gist.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid story idea'
        });
      }
    }

    const story = await Story.create({
      user: req.user.id,
      title,
      genres: inputGenres,
      numOfPages: length,
      numCharacters,
      characterDetails,
      entryMode,
      gist: entryMode === 'gist' ? gist : null,
      gistSource: entryMode === 'gist' ? 'user' : 'ai',
      step: entryMode === 'gist' ? 3 : 1
    });

    if (entryMode === "questionnaire") {
      const result = await fastApiService.startQuestionnaire();
      //Save initial conversation
      if (result?.conversation?.length) {
        story.conversation = result.conversation;
        story.step = 1;
        await story.save();
      }
      return res.status(200).json({
        success: true,
        storyId: story._id,
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      storyId: story._id
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
    const {storyId, conversation, answer } = req.body;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.entryMode === 'gist') {
      return res.status(400).json({
        message: 'Questionnaire not allowed for this story'
      });
    }

    const result = await fastApiService.nextQuestion(conversation, answer);

    if (result) {
      conversation.push({
        question: result.question,
        answer: answer
      });
      story.conversation = conversation;
      story.step = 2;
      await story.save();
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

    // Sanitize conversation: remove malformed entries
    const sanitizedConversation = Array.isArray(conversation)
      ? conversation.filter(q => q && q.question && q.answer)
      : [];

    // Log sanitization for diagnostic purposes
    try {
      console.log(
        'Sanitized conversation:',
        Array.isArray(conversation) ? conversation.length : 0,
        '→',
        sanitizedConversation.length
      );
    } catch (e) {
      // ignore logging errors
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.entryMode === 'gist') {
      return res.status(400).json({
        message: 'Questionnaire not allowed for this story'
      });
    }

    // Pass the learned style label (genre) verbatim to FastAPI. Do not send placeholders.
    const storyGenreString = Array.isArray(story.genres) ? story.genres.join(', ') : story.genre;

    if (!storyGenreString || storyGenreString === 'Custom') {
      return res.status(400).json({ success: false, message: 'Invalid style label for gist generation' });
    }

    const result = await fastApiService.generateGist(sanitizedConversation, storyGenreString, story.user.toString());
    
    if (result) {
      // Update story gist and step
      if (story) {
        story.gist = result.gist;
        story.gistSource = 'ai';
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
      genre, // legacy
      genres: genresFromBody, // optional
      numCharacters,
      characterDetails,
      numPages,
      orientation
    } = req.body;

    const story = await Story.findById(storyId);

    if (!story || !story.gist) {
      return res.status(400).json({
        success: false,
        message: 'Story gist not found'
      });
    }

    const gist = story.gist;
    const storyGenresArray = Array.isArray(genresFromBody) ? genresFromBody : (genre ? (Array.isArray(genre) ? genre : [genre]) : (story.genres || []));
    const storyGenre = Array.isArray(storyGenresArray) ? storyGenresArray.join(', ') : storyGenresArray;

    if (!storyGenre || (Array.isArray(storyGenresArray) && storyGenresArray.includes('Custom')) || storyGenre === 'Custom') {
      return res.status(400).json({ success: false, message: 'Invalid style label for story generation' });
    }
    
    const fixedCharacterDetails = characterDetails.map(cd => `${cd.name}: ${cd.details}`).join('\n');
    // console.log("Fixed Character Details:", fixedCharacterDetails);
    // await new Promise(resolve => setTimeout(resolve, 20000));
    

    // // numPages comes from req.body
    // await consumeUsage(subscription, "maxPages", numPages);

    const storyResult = await fastApiService.generateStory(
      gist,
      numCharacters,
      fixedCharacterDetails,
      storyGenre,
      numPages,
      {
        user_id: story.user.toString()
      }
    );


    story.orientation = orientation || story.orientation || 'Portrait';
    story.step = 4;
    story.status = 'generating';
    await story.save();


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

// @desc    Rename story
// @route   PATCH /api/story/rename/:storyId
// @access  Private

exports.renameStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title } = req.body;
    const userId = req.user._id;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    const story = await Story.findOneAndUpdate(
      { _id: storyId, user: userId },
      { title: title.trim() },
      { new: true }
    ).select("_id title");

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: { story }
    });
  } catch (error) {
    console.error("Rename story error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to rename story"
    });
  }
};

// @desc    Update story gist (user-provided)
// @route   PATCH /api/story/:id/gist
// @access  Private
exports.updateGist = async (req, res, next) => {
  try {
    const { gist } = req.body;

    if (!gist || gist.trim().length < 20) {
      return res.status(400).json({ message: 'Invalid gist' });
    }

    const story = await Story.findOne({ _id: req.params.id, user: req.user.id });
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    story.gist = gist;
    story.gistSource = 'user';
    story.step = Math.max(3, story.step || 3);
    await story.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
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

    const stories = await Story.find({ user: req.user.id, isDeleted: { $ne: true } })
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
      user: req.user.id,
      isDeleted: { $ne: true }
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
    const { storyId, selectedTitle, genre, genres } = req.body;

    const updatedStory = await Story.findByIdAndUpdate(storyId, { title: selectedTitle }, { new: true });

    const pages = await StoryPage.find({ story: storyId }).sort({ pageNumber: 1 });
    const fullText = pages.map(page => page.text).join(' ');
    
    await updatedStory.save();

    const genreString = Array.isArray(genres) ? genres.join(', ') : (Array.isArray(genre) ? genre.join(', ') : genre);
    const result = await fastApiService.generateTitles(fullText, genreString);

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
    const { storyId, story, genre, genres, previousTitles, selectedTitle } = req.body;

    const updatedStory = await Story.findByIdAndUpdate(storyId, { title: selectedTitle }, { new: true });

    if(!updatedStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      }); 
    }
    await updatedStory.save();

    const genreString = Array.isArray(genres) ? genres.join(', ') : (Array.isArray(genre) ? genre.join(', ') : genre);
    const result = await fastApiService.regenerateTitles(story, genreString, previousTitles);

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
exports.deleteStory = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  try {
    // Verify story ownership
    const story = await Story.findOne({ _id: storyId, user: userId });
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    //Find all images related to the story
    const images = await Image.find({ story: storyId });

    // Delete images from S3
    await Promise.all(
      images.map(img =>
        s3Service.deleteFromS3(img.s3Key, img.s3Bucket)
          .catch(err => {
            console.error("S3 delete failed:", img.s3Key, err);
          })
      )
    );

    // Delete images from DB
    await Image.deleteMany({ story: storyId });

    // Delete story pages
    await StoryPage.deleteMany({ story: storyId });

    // Delete the story
    await Story.deleteOne({ _id: storyId });

    return res.status(200).json({
      message: "Story and all related data deleted successfully"
    });

  } catch (error) {
    console.error("Delete story error:", error);
    return res.status(500).json({
      message: "Failed to delete story",
      error: error.message
    });
  }
};

// @desc  Delete story for user (archive)
// @route DELETE /api/story/archive/:storyId
// @access Private
exports.deleteStoryForUser = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;
  try {
    // Verify story ownership
    const story = await Story.findOne({ _id: storyId, user: userId });
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    // Soft delete: mark as deleted
    story.isDeleted = true;
    await story.save();
    return res.status(200).json({
      message: "Story Deleted successfully"
    });
  } catch (error) {
    console.error("Archive story error:", error);
    return res.status(500).json({
      message: "Failed to delete story",
      error: error.message
    });
  }
};

// @desc    Upload custom genre files AND process them
// @route   POST /api/story/upload-genre
// @access  Private
exports.customGenre = async (req, res) => {
  try {
    console.log("UPLOAD-GENRE HIT");

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // 1️⃣ Always upload files
    const uploadResult = await fastApiService.uploadBooks(req.files, req.user.id);

    // 2️⃣ Decide whether to process (allow retrain after interval)
    const retrainMs = parseInt(process.env.CUSTOM_GENRE_RETRAIN_MS || String(5 * 60 * 1000), 10); // default 5 minutes
    const lastProcessedAt = req.user.customGenreProcessedAt ? new Date(req.user.customGenreProcessedAt).getTime() : null;
    const shouldProcess = !lastProcessedAt || (Date.now() - lastProcessedAt) > retrainMs;

    let processResult = null;
    if (shouldProcess) {
      // Process: retry/poll to handle S3 eventual consistency.
      const maxAttempts = parseInt(process.env.PROCESS_RETRY_ATTEMPTS || '6', 10);
      const baseDelayMs = parseInt(process.env.PROCESS_RETRY_DELAY_MS || '2000', 10);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          processResult = await fastApiService.processBooksFromS3(req.user.id);
          break; // success
        } catch (err) {
          // If last attempt, rethrow
          if (attempt === maxAttempts) {
            throw err;
          }

          // Otherwise wait and retry (exponential backoff)
          const waitMs = baseDelayMs * attempt;
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }

      // mark processed timestamp
      req.user.customGenreProcessedAt = new Date();
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      upload: uploadResult,
      process: processResult,
      retrained: shouldProcess
    });

  } catch (err) {
    res.status(500).json({ message: "Custom genre upload failed", error: err.message });
  }
};

// @desc    Get learned custom genres
// @route   GET /api/story/custom-genres
// @access  Private
exports.getCustomGenres = async (req, res) => {
  try {
    const result = await fastApiService.getUserGenres(req.user.id);
    console.log("ye result", result);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch custom genres"
    });
  }
};

// @desc    Get story conversation and step
// @route   GET /api/v1/story/:storyId/conversation
// @access  Private
exports.getConversation = async (req, res) => {
  console.log("GET-CONVERSATION HIT");
  try {
    const { storyId } = req.params;

    const story = await Story.findOne({
      _id: storyId,
      user: req.user.id
    }).select("conversation step status");

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    res.json({
      success: true,
      data: {
        conversation: story.conversation,
        step: story.step,
        status: story.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load conversation" });
  }
};

