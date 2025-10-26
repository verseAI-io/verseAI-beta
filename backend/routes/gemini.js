const express = require('express');
const router = express.Router();

/**
 * Gemini API Integration for AI-Powered Coding Challenges
 *
 * This route uses Gemini API (via API key) instead of Vertex AI
 * for providing hints, explanations, and code reviews
 */

/**
 * POST /api/gemini/hint
 * Get a hint for a coding problem without revealing the solution
 */
router.post('/hint', async (req, res) => {
  try {
    const { questionTitle, questionDescription, userCode, hintLevel } = req.body;

    if (!questionTitle || !questionDescription) {
      return res.status(400).json({
        success: false,
        error: 'Question details are required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    // Build prompt based on hint level
    const prompt = buildHintPrompt(questionTitle, questionDescription, userCode, hintLevel || 1);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const hint = data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      hint: hint,
      hintLevel: hintLevel || 1
    });

  } catch (error) {
    console.error('Error getting hint from Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gemini/explain
 * Explain a coding concept or approach
 */
router.post('/explain', async (req, res) => {
  try {
    const { topic, questionContext } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    const prompt = `
Explain the following coding concept in a clear, beginner-friendly way:

Topic: ${topic}

${questionContext ? `Context: ${questionContext}` : ''}

Provide:
1. A simple explanation with examples
2. Common use cases
3. Time and space complexity considerations (if applicable)
4. Common pitfalls to avoid

Keep the explanation concise but thorough.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const explanation = data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      explanation: explanation
    });

  } catch (error) {
    console.error('Error getting explanation from Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gemini/review-code
 * Review user's code and provide feedback
 */
router.post('/review-code', async (req, res) => {
  try {
    const { code, language, questionDescription } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    const prompt = `
Review the following ${language || 'code'} solution:

Problem: ${questionDescription || 'Coding challenge'}

Code:
\`\`\`${language || 'text'}
${code}
\`\`\`

Provide constructive feedback on:
1. Correctness - Does the logic seem correct?
2. Code quality - Is it readable and well-structured?
3. Efficiency - Time and space complexity
4. Potential bugs or edge cases missed
5. Suggestions for improvement

Be encouraging but honest. Point out both strengths and areas for improvement.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const review = data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      review: review
    });

  } catch (error) {
    console.error('Error reviewing code with Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to build hint prompt based on level
 */
function buildHintPrompt(title, description, userCode, level) {
  const baseProm = `
You are a helpful coding mentor. A student is working on this problem:

Problem: ${title}
Description: ${description}

${userCode ? `Their current code:\n\`\`\`\n${userCode}\n\`\`\`` : 'They haven\'t started coding yet.'}

`;

  if (level === 1) {
    return baseProm + `
Provide a GENTLE hint that points them in the right direction without revealing the solution.
Focus on:
- What data structure or approach might be helpful
- What pattern this problem follows
- A guiding question to help them think

DO NOT provide code or reveal the solution.
`;
  } else if (level === 2) {
    return baseProm + `
Provide a MORE SPECIFIC hint.
You can:
- Suggest the specific algorithm or technique
- Outline the step-by-step approach at a high level
- Mention important edge cases to consider

Still DO NOT provide the actual code solution.
`;
  } else {
    return baseProm + `
Provide a DETAILED hint with pseudocode.
You can:
- Show pseudocode or algorithm steps
- Explain the complete approach
- Provide code snippets for tricky parts

Still encourage them to implement it themselves. Don't give the complete solution.
`;
  }
}

module.exports = router;
