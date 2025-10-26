const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

const router = express.Router();

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(__dirname, '..', process.env.GCP_CREDENTIALS_PATH)
});

/**
 * GET /api/bigquery/datasets
 * List all datasets in the project
 */
router.get('/datasets', async (req, res) => {
  try {
    const [datasets] = await bigquery.getDatasets();

    const datasetList = datasets.map(dataset => ({
      id: dataset.id,
      location: dataset.location,
      metadata: dataset.metadata
    }));

    res.json({
      success: true,
      datasets: datasetList,
      count: datasetList.length
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bigquery/datasets/:datasetId/tables
 * List all tables in a specific dataset
 */
router.get('/datasets/:datasetId/tables', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const dataset = bigquery.dataset(datasetId);
    const [tables] = await dataset.getTables();

    const tableList = await Promise.all(
      tables.map(async (table) => {
        try {
          const [metadata] = await table.getMetadata();
          return {
            id: table.id,
            datasetId: datasetId,
            numRows: metadata.numRows || '0',
            numBytes: metadata.numBytes || '0',
            creationTime: metadata.creationTime,
            description: metadata.description || '',
            schema: metadata.schema?.fields || []
          };
        } catch (err) {
          console.error(`Error fetching metadata for ${table.id}:`, err);
          return {
            id: table.id,
            datasetId: datasetId,
            error: 'Could not fetch metadata'
          };
        }
      })
    );

    res.json({
      success: true,
      datasetId,
      tables: tableList,
      count: tableList.length
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bigquery/tables/:datasetId/:tableId/schema
 * Get schema for a specific table
 */
router.get('/tables/:datasetId/:tableId/schema', async (req, res) => {
  try {
    const { datasetId, tableId } = req.params;
    const table = bigquery.dataset(datasetId).table(tableId);
    const [metadata] = await table.getMetadata();

    res.json({
      success: true,
      datasetId,
      tableId,
      schema: metadata.schema?.fields || [],
      numRows: metadata.numRows || '0',
      numBytes: metadata.numBytes || '0'
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/bigquery/query
 * Execute a SQL query
 */
router.post('/query', async (req, res) => {
  try {
    const { query, maxResults = 1000, useLegacySql = false } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const options = {
      query: query,
      location: 'US',
      useLegacySql: useLegacySql,
      maxResults: parseInt(maxResults)
    };

    const startTime = Date.now();
    const [job] = await bigquery.createQueryJob(options);

    // Get query results
    const [rows] = await job.getQueryResults();
    const endTime = Date.now();

    // Get job metadata for billing info
    const [metadata] = await job.getMetadata();

    res.json({
      success: true,
      data: rows,
      metadata: {
        totalRows: rows.length,
        executionTime: endTime - startTime,
        jobId: job.id,
        totalBytesProcessed: metadata.statistics?.query?.totalBytesProcessed || '0',
        totalBytesBilled: metadata.statistics?.query?.totalBytesBilled || '0',
        cacheHit: metadata.statistics?.query?.cacheHit || false,
        statementType: metadata.statistics?.query?.statementType || 'SELECT'
      }
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors || []
    });
  }
});

/**
 * POST /api/bigquery/validate
 * Validate SQL syntax without executing
 */
router.post('/validate', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Query is required'
      });
    }

    const options = {
      query: query,
      location: 'US',
      dryRun: true, // Don't actually run the query
      useLegacySql: false
    };

    const [job] = await bigquery.createQueryJob(options);
    const [metadata] = await job.getMetadata();

    res.json({
      success: true,
      valid: true,
      message: 'Query is valid',
      estimatedBytes: metadata.statistics?.query?.totalBytesProcessed || '0',
      statementType: metadata.statistics?.query?.statementType || 'UNKNOWN'
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      valid: false,
      error: error.message,
      details: error.errors || []
    });
  }
});

/**
 * POST /api/bigquery/explain
 * Get query execution plan
 */
router.post('/explain', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const options = {
      query: query,
      location: 'US',
      dryRun: true
    };

    const [job] = await bigquery.createQueryJob(options);
    const [metadata] = await job.getMetadata();

    res.json({
      success: true,
      queryPlan: metadata.statistics?.query?.queryPlan || [],
      timeline: metadata.statistics?.query?.timeline || [],
      totalBytesProcessed: metadata.statistics?.query?.totalBytesProcessed || '0',
      estimatedCost: calculateEstimatedCost(metadata.statistics?.query?.totalBytesProcessed)
    });
  } catch (error) {
    console.error('Error explaining query:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to calculate estimated query cost
 * BigQuery pricing: $5 per TB processed
 */
function calculateEstimatedCost(bytesProcessed) {
  if (!bytesProcessed) return '$0.00';

  const bytes = parseInt(bytesProcessed);
  const terabytes = bytes / (1024 ** 4);
  const cost = terabytes * 5; // $5 per TB

  return `$${cost.toFixed(6)}`;
}

module.exports = router;
