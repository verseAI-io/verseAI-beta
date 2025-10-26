/**
 * Neocortex AI Agent Routes
 *
 * Integrates with Neocortex API for AI character interactions
 */

const express = require('express');
const router = express.Router();

// Import API key and Character ID from cred.py
const NEOCORTEX_API_KEY = 'sk_53caf79a-7e95-442b-b409-09af2962d102';
const CHARACTER_ID = 'cmh66d4qb0001l40453e4ywfl'; // Neocortex Project/Character ID

/**
 * POST /api/neocortex/chat
 * Send a message to the Neocortex AI character
 */
router.post('/chat', async (req, res) => {
  console.log("###############################################Here in neocortex chat route");
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }
    var dynamicVar = {characterId: CHARACTER_ID, message, sessionId} ;

    // Call Neocortex API with session support
    const response = await fetch('https://neocortex.link/api/v2/chat', {
      method: 'POST',
      headers: {
        'x-api-key': NEOCORTEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dynamicVar)
    });
console.log("###############################################response received from neocortex api", dynamicVar);
    const data = await response.json();
    console.log('Neocortex response:', data);

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Neocortex API error');
    }

    res.json({
      success: true,
      sessionId: data.sessionId,
      response: data.message || data.response || data.text,
      action: data.action || null,
      emotion: data.emotion || null,
      character: 'Sage Naruto'
    });

  } catch (error) {
    console.error('Neocortex chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/neocortex/voice
 * Convert text to speech using character voice
 */
router.post('/voice', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }
    var dynamicVar = {characterId: CHARACTER_ID, text: text} ;
    // Call Neocortex TTS API (if available)
    const response = await fetch('https://api.neocortex.link/v2/audio/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEOCORTEX_API_KEY
      },
      body: JSON.stringify(dynamicVar)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS API error response:', errorData);
      throw new Error('TTS API error: ' + errorData);
    }

    // Get the audio buffer and send to client
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (error) {
    console.error('Neocortex TTS error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/neocortex/chat/session
 * Get chat history for a session
 */
router.post('/chat/session', async (req, res) => {
  try {
    const { sessionId, limit = 10 } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    const response = await fetch('https://neocortex.link/api/v2/chat/session', {
      method: 'POST',
      headers: {
        'x-api-key': NEOCORTEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        limit
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Neocortex chat history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/neocortex/audio/generate
 * Generate TTS audio for character response
 */
router.post('/audio/generate', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }
const dynamicVar = {characterId: CHARACTER_ID, message} ;
    const response = await fetch('https://neocortex.link/api/v2/audio/generate', {
      method: 'POST',
      headers: {
        'x-api-key': NEOCORTEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dynamicVar)
    });
console.log("###############################################response received from neocortex tts api", dynamicVar);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS API error response:', errorData);
      throw new Error('TTS API error: ' + errorData);
    }

    // Get the audio buffer and send to client
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (error) {
    console.error('Neocortex TTS error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



module.exports = router;
