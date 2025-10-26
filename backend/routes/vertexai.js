const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

const router = express.Router();

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  googleAuthOptions: {
    keyFilename: path.join(__dirname, '..', process.env.GCP_CREDENTIALS_PATH)
  }
});

// Get the generative model
const model = vertexAI.getGenerativeModel({
  model: process.env.VERTEX_AI_MODEL || 'gemini-pro'
});

/**
 * POST /api/ai/generate-sql
 * Generate SQL from natural language
 */
router.post('/generate-sql', async (req, res) => {
  try {
    const { prompt, schema, examples } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Build context for better SQL generation
    let contextPrompt = buildSQLGenerationPrompt(prompt, schema, examples);

    // Generate SQL using Vertex AI
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2, // Lower temperature for more deterministic code generation
        topP: 0.8,
        topK: 40
      }
    });

    const response = result.response;
    const generatedText = response.candidates[0].content.parts[0].text;

    // Extract SQL from the response (it might be wrapped in markdown code blocks)
    const sqlQuery = extractSQLFromResponse(generatedText);

    res.json({
      success: true,
      sql: sqlQuery,
      rawResponse: generatedText,
      explanation: extractExplanationFromResponse(generatedText)
    });
  } catch (error) {
    console.error('Error generating SQL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/explain-sql
 * Explain SQL query in natural language
 */
router.post('/explain-sql', async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql || sql.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'SQL query is required'
      });
    }

    const prompt = `
Explain the following SQL query in simple, clear English. Break down what each part does:

SQL Query:
\`\`\`sql
${sql}
\`\`\`

Provide:
1. A brief summary of what the query does
2. Step-by-step explanation of each clause
3. Any important notes about performance or best practices
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.3,
        topP: 0.8
      }
    });

    const response = result.response;
    const explanation = response.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      explanation: explanation
    });
  } catch (error) {
    console.error('Error explaining SQL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/optimize-sql
 * Get suggestions to optimize SQL query
 */
router.post('/optimize-sql', async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql || sql.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'SQL query is required'
      });
    }

    const prompt = `
Analyze the following SQL query and provide optimization suggestions for BigQuery:

SQL Query:
\`\`\`sql
${sql}
\`\`\`

Provide:
1. Potential performance issues
2. Optimization suggestions
3. Rewritten optimized version of the query (if applicable)
4. Best practices for BigQuery
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.3,
        topP: 0.8
      }
    });

    const response = result.response;
    const suggestions = response.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      suggestions: suggestions,
      optimizedSQL: extractSQLFromResponse(suggestions)
    });
  } catch (error) {
    console.error('Error optimizing SQL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/chat
 * General purpose chat about SQL and data
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    let prompt = message;

    // Add context if provided
    if (context && context.length > 0) {
      const contextStr = context.map(msg =>
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');

      prompt = `Previous conversation:\n${contextStr}\n\nCurrent question:\n${message}`;
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9
      }
    });

    const response = result.response;
    const reply = response.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      message: reply
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to build SQL generation prompt with context
 */
function buildSQLGenerationPrompt(userPrompt, schema, examples) {
  let prompt = `You are an expert SQL developer specializing in Google BigQuery. Generate a SQL query based on the user's request.

User Request: ${userPrompt}

`;

  // Add schema information if provided
  if (schema && schema.length > 0) {
    prompt += `Available Tables and Schemas:\n`;
    schema.forEach(table => {
      prompt += `\nTable: ${table.name}\n`;
      prompt += `Columns:\n`;
      table.columns.forEach(col => {
        prompt += `  - ${col.name} (${col.type})${col.description ? ': ' + col.description : ''}\n`;
      });
    });
    prompt += `\n`;
  }

  // Add examples if provided
  if (examples && examples.length > 0) {
    prompt += `Example Input/Output:\n`;
    examples.forEach((example, idx) => {
      prompt += `\nExample ${idx + 1}:\n`;
      prompt += `Input: ${JSON.stringify(example.input, null, 2)}\n`;
      prompt += `Expected Output: ${JSON.stringify(example.output, null, 2)}\n`;
    });
    prompt += `\n`;
  }

  prompt += `
Requirements:
1. Generate valid BigQuery SQL (Standard SQL, not Legacy SQL)
2. Use proper table and column references
3. Optimize for BigQuery (use partitioning hints if relevant)
4. Include comments explaining complex logic
5. Return ONLY the SQL query in a code block

Format your response as:
\`\`\`sql
-- Your SQL query here
\`\`\`

Then provide a brief explanation of the query.
`;

  return prompt;
}

/**
 * Extract SQL from AI response (removes markdown formatting)
 */
function extractSQLFromResponse(text) {
  // Try to extract SQL from code blocks
  const sqlBlockMatch = text.match(/```sql\n([\s\S]*?)\n```/i);
  if (sqlBlockMatch) {
    return sqlBlockMatch[1].trim();
  }

  // Try generic code blocks
  const codeBlockMatch = text.match(/```\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Return original if no code block found
  return text.trim();
}

/**
 * Extract explanation from AI response (text after code block)
 */
function extractExplanationFromResponse(text) {
  const parts = text.split(/```[\s\S]*?```/);
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return '';
}

module.exports = router;
