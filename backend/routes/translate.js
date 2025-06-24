const express = require('express');
const axios = require('axios');
const router = express.Router();

// Azure Translator configuration
const TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
const TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com/';
const TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION;

// Translate text
router.post('/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;

    if (!text || !to) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    if (!TRANSLATOR_KEY) {
      return res.status(500).json({ error: 'Azure Translator key not configured' });
    }

    const headers = {
      'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY,
      'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
      'Content-Type': 'application/json'
    };

    const params = {
      'api-version': '3.0',
      'to': to
    };

    if (from && from !== 'auto') {
      params.from = from;
    }

    const body = [{
      'text': text
    }];

    const response = await axios.post(
      `${TRANSLATOR_ENDPOINT}/translate`,
      body,
      {
        headers: headers,
        params: params
      }
    );

    const translatedText = response.data[0].translations[0].text;
    const detectedLanguage = response.data[0].detectedLanguage;

    res.json({
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: from || detectedLanguage?.language,
      targetLanguage: to,
      detectedLanguage: detectedLanguage
    });

  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Translation failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get supported languages
router.get('/languages', async (req, res) => {
  try {
    const response = await axios.get(`${TRANSLATOR_ENDPOINT}/languages`, {
      params: {
        'api-version': '3.0',
        'scope': 'translation'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Languages error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch supported languages',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Detect language
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!TRANSLATOR_KEY) {
      return res.status(500).json({ error: 'Azure Translator key not configured' });
    }

    const headers = {
      'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY,
      'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
      'Content-Type': 'application/json'
    };

    const body = [{
      'text': text
    }];

    const response = await axios.post(
      `${TRANSLATOR_ENDPOINT}/detect`,
      body,
      {
        headers: headers,
        params: {
          'api-version': '3.0'
        }
      }
    );

    res.json(response.data[0]);
  } catch (error) {
    console.error('Detection error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Language detection failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;