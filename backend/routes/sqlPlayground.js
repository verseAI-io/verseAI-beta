/**
 * SQL Playground Routes
 *
 * Handles the Advanced SQL Playground feature:
 * - Parse questions
 * - Create BigQuery tables dynamically
 * - Execute SQL queries
 * - Natural language to SQL (Gemini API)
 * - Import to permanent datasets
 */

const express = require('express');
const router = express.Router();
const { parseQuestion, validateParsedQuestion } = require('../services/questionParser');
const {
  createTempTable,
  executeQuery,
  importToPermanent,
  getTableSchema,
  getSampleData,
  deleteTable,
  listTables
} = require('../services/bigqueryManager');

/**
 * POST /api/sql-playground/parse
 * Parse a SQL question and create BigQuery table
 */
router.post('/parse', async (req, res) => {
  try {
    const { questionText } = req.body;

    if (!questionText || typeof questionText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'questionText is required'
      });
    }

    // Parse the question (NO AI - pure code logic!)
    const parsed = parseQuestion(questionText);
    validateParsedQuestion(parsed);

    // Create temporary BigQuery table
    const tableInfo = await createTempTable(parsed);

    res.json({
      success: true,
      parsed: {
        tableName: parsed.tableName,
        fullTableName: parsed.fullTableName,
        schema: parsed.schema,
        rowCount: parsed.inputData.length,
        columnCount: parsed.schema.length,
        expectedOutput: parsed.expectedOutput
      },
      bigquery: tableInfo,
      message: `Table created successfully: ${tableInfo.fullTablePath}`
    });

  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/sql-playground/execute
 * Execute a SQL query
 */
router.post('/execute', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    // Execute the query
    const result = await executeQuery(query);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      executionTime: result.executionTime,
      bytesProcessed: result.bytesProcessedFormatted,
      cacheHit: result.cacheHit,
      jobId: result.jobId
    });

  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sql-playground/nl-to-sql
 * Convert natural language to SQL using Gemini API
 */
router.post('/nl-to-sql', async (req, res) => {
  try {
    const { prompt, tableSchema, model } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    // Build context prompt
    let contextPrompt = `You are an expert SQL developer. Convert the following natural language request to a SQL query.

User request: ${prompt}

`;

    if (tableSchema && tableSchema.length > 0) {
      contextPrompt += `Available table schema:\n`;
      tableSchema.forEach(col => {
        contextPrompt += `  - ${col.name} (${col.type})\n`;
      });
      contextPrompt += `\n`;
    }

    contextPrompt += `Return ONLY the SQL query, no explanations. Use proper BigQuery syntax.`;

    // Determine which Gemini model to use
    const modelName = model || 'gemini-1.5-pro';
    const modelMap = {
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-1.0-pro': 'gemini-pro'
    };
    const selectedModel = modelMap[modelName] || 'gemini-1.5-pro';

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more deterministic SQL
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    let generatedSQL = data.candidates[0].content.parts[0].text;

    // Clean up the response (remove markdown code blocks if present)
    generatedSQL = generatedSQL.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

    res.json({
      success: true,
      sql: generatedSQL,
      model: selectedModel
    });

  } catch (error) {
    console.error('NL-to-SQL error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sql-playground/explain
 * Explain a SQL query using Gemini API
 */
router.post('/explain', async (req, res) => {
  try {
    const { query, model } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    const prompt = `Explain this SQL query in simple terms:

${query}

Provide a clear explanation of what this query does and how it works.`;

    const modelName = model || 'gemini-1.5-flash'; // Use Flash for faster explanations
    const modelMap = {
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-1.0-pro': 'gemini-pro'
    };
    const selectedModel = modelMap[modelName] || 'gemini-1.5-flash';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
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
            maxOutputTokens: 1024,
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
      explanation: explanation,
      model: selectedModel
    });

  } catch (error) {
    console.error('Explain error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sql-playground/optimize
 * Get query optimization suggestions using Gemini API
 */
router.post('/optimize', async (req, res) => {
  try {
    const { query, model } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    const prompt = `Analyze this SQL query and suggest optimizations for BigQuery:

${query}

Provide:
1. Potential performance issues
2. Optimization suggestions
3. An optimized version of the query (if applicable)

Be specific and actionable.`;

    const modelName = model || 'gemini-1.5-pro';
    const modelMap = {
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-1.0-pro': 'gemini-pro'
    };
    const selectedModel = modelMap[modelName] || 'gemini-1.5-pro';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
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

    const suggestions = data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      suggestions: suggestions,
      model: selectedModel
    });

  } catch (error) {
    console.error('Optimize error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sql-playground/import
 * Import table to permanent dataset
 */
router.post('/import', async (req, res) => {
  try {
    const { sourceTable, destinationDataset, destinationTable, overwrite } = req.body;

    if (!sourceTable || !destinationDataset || !destinationTable) {
      return res.status(400).json({
        success: false,
        error: 'sourceTable, destinationDataset, and destinationTable are required'
      });
    }

    const result = await importToPermanent(
      sourceTable,
      destinationDataset,
      destinationTable,
      overwrite || false
    );

    res.json(result);

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sql-playground/schema/:datasetId/:tableId
 * Get table schema
 */
router.get('/schema/:datasetId/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const result = await getTableSchema(datasetId, tableId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sql-playground/sample/:datasetId/:tableId
 * Get sample data from table
 */
router.get('/sample/:datasetId/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getSampleData(datasetId, tableId, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sql-playground/table/:datasetId/:tableId
 * Delete a table
 */
router.delete('/table/:datasetId/:tableId', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const result = await deleteTable(datasetId, tableId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sql-playground/tables/:datasetId
 * List all tables in a dataset
 */
router.get('/tables/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const result = await listTables(datasetId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
