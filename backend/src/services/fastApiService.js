const axios = require("axios");
const FormData = require("form-data");


const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

const fastApiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 3600000 // 30 minutes for long-running operations
});

// Questionnaire endpoints--------------------------------------------------
exports.startQuestionnaire = async () => {
  const response = await fastApiClient.post('/start');
  return response.data;
};

// Get next question based on previous answer----------------------------------
exports.nextQuestion = async (conversation, answer) => {
  const response = await fastApiClient.post('/next', {
    conversation,
    answer
  });
  return response.data;
};

// Gist generation--------------------------------------------------
exports.generateGist = async (conversation, genre, userId) => {
  const payload = {
    user_id: userId,
    conversation,
    genre,
    use_custom_genre: false
  };

  const response = await fastApiClient.post('/gist', payload);
  return response.data;
};

// Story generation--------------------------------------------------
exports.generateStory = async (
  gist,
  numCharacters,
  fixedCharacterDetails,
  genre,
  numPages,
  options = {}
) => {
  const response = await fastApiClient.post('/story/generate', {
    gist,
    num_characters: numCharacters,
    character_details: fixedCharacterDetails,
    genre,
    num_pages: numPages,
    ...options
  });
  return response.data;
};

// Generate temporary preview images from a gist (no storage)
// FastAPI: POST /gist/preview-images
exports.generateGistPreviewImages = async ({ userId, genre, gist }) => {
  console.log("Generating gist preview images in FastAPI service for user:", userId, "genre:", genre, "gist:", gist);
  try {
    const response = await fastApiClient.post('/gist/preview-images', {
      user_id: userId,
      genres: [genre || "Family"],
      gist
    });

    console.log("Received gist preview images response:", response);

    return response.data;

  } catch (err) {
    console.error(
      'FastAPI gist preview error:',
      err.response?.data || err.message
    );
    throw new Error('Failed to generate gist preview images');
  }
};

// Image generation--------------------------------------------------
exports.generateImages = async (pages, orientation, genre) => {
  const payload = { pages, orientation };
  if (genre) payload.genre = genre;

  const response = await fastApiClient.post('/images/generate', payload);
  return response.data;
};

// SDXL Background generation------------------------------------------
exports.generateSDXLBackgrounds = async (pages, orientation) => {
  const response = await fastApiClient.post('/images/sdxl_generate', {
    pages,
    orientation
  });
  return response.data;
};

// Cover generation--------------------------------------------------------
exports.generateCoverAndBack = async (pages, genre, orientation, storyTitle, qrUrl) => {
  const response = await fastApiClient.post('/coverback/generate', {
    pages,
    genre,
    orientation,
    story_title: storyTitle,
    qr_url: qrUrl
  });
  return response.data;
};

// Title generation-----------------------------------------------------
exports.generateTitles = async (fullText, genre) => {
  const response = await fastApiClient.post('/title/generate', {
    story: fullText,
    genre
  });
  return response.data;
};


// Title regeneration-----------------------------------------------------
exports.regenerateTitles = async (story, genre, previousTitles) => {
  const response = await fastApiClient.post('/title/regenerate', {
    story,
    genre,
    previous_titles: previousTitles
  });
  return response.data;
};



// Face swap--------------------------------------------------------------
exports.faceSwap = async (sourceBuffer, targetBuffer, options) => {
  try {
    // Defensive sanitization: ensure index values are valid for model
    const sanitizeIndex = (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 ? n : 0;
    };

    // Sanitize indexes before sending to model
    if (options.source_index !== undefined) {
      options.source_index = sanitizeIndex(options.source_index);
    }
    if (options.target_index !== undefined) {
      options.target_index = sanitizeIndex(options.target_index);
    }

    const form = new FormData();

    form.append("source", sourceBuffer, {
      filename: "source.png",
      contentType: "image/png"
    });

    form.append("target", targetBuffer, {
      filename: "target.png",
      contentType: "image/png"
    });

    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    }

    const response = await axios.post(
      `${FASTAPI_BASE_URL}/faceswap`,
      form,
      {
        timeout: 1800000, // 30 minutes - explicit timeout for long RunPod operations
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: form.getHeaders(), // REQUIRED for `form-data`
      }
    );

    return response.data;

  } catch (err) {
    console.error("Error in faceSwap:", err);
    throw err;
  }
};

// Edit image --------------------------------------------------------
exports.editImage = async (targetBuffer, prompt) => {
  console.log("Editing image with prompt in fast api:", prompt);
  try {
    const form = new FormData();
    form.append("file", targetBuffer, {
      filename: "target.png",
      contentType: "image/png"
    });
    form.append("prompt", prompt);
    const response = await axios.post(
      `${FASTAPI_BASE_URL}/edit-image`,
      form,
      {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: form.getHeaders(), // REQUIRED for `form-data`
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error in editImage:", err);
    throw err;
  }
};

// regenerate image--------------------------------------------------
exports.regenerateImages = async (payload) => {
  try {
    const response = await fastApiClient.post( "/images/regenerate", payload );

    return response.data;

  } catch (err) {
    console.error("FastAPI regenerate error:", err.response?.data || err);
    throw err;
  }
};

// Upload genre reference / books ------------------------------------------
exports.uploadBooks = async (files, userId) => {
  try {
    const form = new FormData();

    files.forEach((file) => {
      form.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    // Note: FastAPI expects `user_id` as a query param (Query(...)), not in the multipart form
    const response = await axios.post(
      `${FASTAPI_BASE_URL}/upload-books?user_id=${encodeURIComponent(userId)}`,
      form,
      {
        timeout: 1800000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: form.getHeaders(),
      }
    );

    return response.data;
  } catch (err) {
    console.error("uploadBooks error:", err.response?.data || err);
    throw err;
  }
};

// Trigger FastAPI to process uploaded books for a user
// FastAPI expects user_id as a query parameter on /process-books
exports.processBooksFromS3 = async (userId) => {
  try {
    const response = await fastApiClient.post(
      `/process-books?user_id=${encodeURIComponent(userId)}`
    );

    return response.data;
  } catch (err) {
    console.error(
      "processBooksFromS3 error:",
      err.response?.data || err
    );
    throw err;
  }
};

// Get learned genres for a user -------------------------------
exports.getUserGenres = async (userId) => {
  try {
    const response = await fastApiClient.get(
      "/genres",
      { params: { user_id: userId } }
    );
    return response.data;
  } catch (err) {
    console.error("getUserGenres error:", err.response?.data || err);
    throw err;
  }
};
