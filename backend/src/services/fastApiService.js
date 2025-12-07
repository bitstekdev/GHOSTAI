const axios = require('axios');

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

const fastApiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 600000, // 10 minutes for long-running operations
  headers: {
    'Content-Type': 'application/json'
  }
});

// Questionnaire endpoints
exports.startQuestionnaire = async () => {
  const response = await fastApiClient.post('/start');
  return response.data;
};

exports.nextQuestion = async (conversation, answer) => {
  const response = await fastApiClient.post('/next', {
    conversation,
    answer
  });
  return response.data;
};

exports.generateGist = async (conversation, genre) => {
  const response = await fastApiClient.post('/gist', {
    conversation,
    genre
  });
  return response.data;
};

// Story generation
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

// Image generation
exports.generateImages = async (pages, orientation) => {
  const response = await fastApiClient.post('/images/generate', {
    pages,
    orientation
  });
  return response.data;
};

exports.generateSDXLBackgrounds = async (pages, orientation) => {
  const response = await fastApiClient.post('/images/sdxl_generate', {
    pages,
    orientation
  });
  return response.data;
};

// Title generation
exports.generateTitles = async (story, genre) => {
  const response = await fastApiClient.post('/title/generate', {
    story,
    genre
  });
  return response.data;
};

exports.regenerateTitles = async (story, genre, previousTitles) => {
  const response = await fastApiClient.post('/title/regenerate', {
    story,
    genre,
    previous_titles: previousTitles
  });
  return response.data;
};

// Cover generation
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
