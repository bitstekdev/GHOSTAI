const axios = require("axios");
const FormData = require("form-data");


const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

const fastApiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 600000 // 10 minutes for long-running operations
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
exports.generateGist = async (conversation, genre) => {
  const response = await fastApiClient.post('/gist', {
    conversation,
    genre
  });
  return response.data;
};

// Story generation--------------------------------------------------
exports.generateStory = async (gist, numCharacters, fixedCharacterDetails, genre, numPages) => {
  const response = await fastApiClient.post('/story/generate', {
    gist,
    num_characters: numCharacters,
    character_details: fixedCharacterDetails,
    genre,
    num_pages: numPages
  });
  return response.data;
};

// Image generation--------------------------------------------------
exports.generateImages = async (pages, orientation) => {
  const response = await fastApiClient.post('/images/generate', {
    pages,
    orientation
  });
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
        timeout: 600000, // 10 minutes - explicit timeout for long RunPod operations
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