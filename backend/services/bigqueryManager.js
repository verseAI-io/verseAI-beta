/**
 * BigQuery Manager
 *
 * Handles BigQuery operations:
 * - Create temporary tables from parsed questions
 * - Execute SQL queries
 * - Import to permanent datasets
 */

const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

// Initialize BigQuery client
let bigquery;

try {
  bigquery = new BigQuery({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: path.join(__dirname, '..', process.env.GCP_CREDENTIALS_PATH || 'cred.json')
  });
  console.log('✓ BigQuery client initialized');
} catch (error) {
  console.error('✗ BigQuery client initialization failed:', error.message);
}

/**
 * Create a temporary table from parsed question data
 *
 * @param {object} parsedQuestion - Output from questionParser.parseQuestion()
 * @param {string} datasetId - Dataset ID (default: customer_data)
 * @returns {object} Created table info
 */
async function createTempTable(parsedQuestion, datasetId = 'customer_data') {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  const { fullTableName, schema, inputData } = parsedQuestion;
  const projectId = process.env.GCP_PROJECT_ID;

  // Ensure dataset exists
  await ensureDatasetExists(datasetId);

  // Create table schema for BigQuery
  const tableSchema = {
    schema: {
      fields: schema.map(col => ({
        name: col.name,
        type: col.type,
        mode: 'NULLABLE'
      }))
    }
  };

  const tableId = fullTableName;
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);

  // Check if table already exists and delete it
  try {
    await table.delete();
    console.log(`Deleted existing table: ${tableId}`);
  } catch (error) {
    // Table doesn't exist, that's fine
  }

  // Create the table
  try {
    await dataset.createTable(tableId, tableSchema);
    console.log(`✓ Created table: ${datasetId}.${tableId}`);
  } catch (error) {
    console.error(`✗ Failed to create table: ${error.message}`);
    throw error;
  }

  // Insert data
  try {
    // Convert data rows to objects
    const rows = inputData.map(row => {
      const rowObj = {};
      schema.forEach((col, index) => {
        rowObj[col.name] = row[index];
      });
      return rowObj;
    });

    await table.insert(rows);
    console.log(`✓ Inserted ${rows.length} rows into ${tableId}`);

    return {
      success: true,
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId,
      fullTablePath: `${projectId}.${datasetId}.${tableId}`,
      rowsInserted: rows.length,
      schema: schema
    };
  } catch (error) {
    console.error(`✗ Failed to insert data: ${error.message}`);

    // Try to delete the table if insertion failed
    try {
      await table.delete();
    } catch (deleteError) {
      // Ignore deletion errors
    }

    throw error;
  }
}

/**
 * Execute a SQL query
 *
 * @param {string} query - SQL query to execute
 * @param {object} options - Query options
 * @returns {object} Query results
 */
async function executeQuery(query, options = {}) {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  const queryOptions = {
    query: query,
    location: options.location || 'US',
    useLegacySql: false,
    ...options
  };

  try {
    const startTime = Date.now();
    const [job] = await bigquery.createQueryJob(queryOptions);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();
    const executionTime = Date.now() - startTime;

    // Get job metadata for statistics
    const [metadata] = await job.getMetadata();
    const statistics = metadata.statistics;

    return {
      success: true,
      rows: rows,
      rowCount: rows.length,
      executionTime: executionTime,
      bytesProcessed: statistics.query?.totalBytesProcessed || 0,
      bytesProcessedFormatted: formatBytes(statistics.query?.totalBytesProcessed || 0),
      cacheHit: statistics.query?.cacheHit || false,
      jobId: job.id
    };
  } catch (error) {
    console.error('Query execution failed:', error.message);
    return {
      success: false,
      error: error.message,
      errorDetails: error.errors || []
    };
  }
}

/**
 * Import table to permanent dataset
 *
 * @param {string} sourceTable - Source table path
 * @param {string} destinationDataset - Destination dataset
 * @param {string} destinationTable - Destination table name
 * @param {boolean} overwrite - Whether to overwrite existing table
 * @returns {object} Import result
 */
async function importToPermanent(sourceTable, destinationDataset, destinationTable, overwrite = false) {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  try {
    // Parse source table path
    const [sourceDatasetId, sourceTableId] = sourceTable.split('.');

    const sourceDataset = bigquery.dataset(sourceDatasetId);
    const source = sourceDataset.table(sourceTableId);

    const destDataset = bigquery.dataset(destinationDataset);
    const destination = destDataset.table(destinationTable);

    // Check if destination exists
    const [destExists] = await destination.exists();

    if (destExists && !overwrite) {
      return {
        success: false,
        error: `Table ${destinationDataset}.${destinationTable} already exists. Use overwrite=true to replace.`
      };
    }

    // Copy the table
    const [job] = await source.copy(destination);
    console.log(`Copy job ${job.id} started.`);

    await job.promise();

    console.log(`✓ Table imported to ${destinationDataset}.${destinationTable}`);

    return {
      success: true,
      destinationTable: `${destinationDataset}.${destinationTable}`,
      message: 'Table successfully imported'
    };
  } catch (error) {
    console.error('Import failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Ensure dataset exists, create if not
 */
async function ensureDatasetExists(datasetId, location = 'US') {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  const dataset = bigquery.dataset(datasetId);

  try {
    const [exists] = await dataset.exists();

    if (!exists) {
      console.log(`Creating dataset: ${datasetId}`);
      await bigquery.createDataset(datasetId, { location: location });
      console.log(`✓ Created dataset: ${datasetId}`);
    }
  } catch (error) {
    // Dataset might already exist due to race condition
    if (error.code !== 409) {
      throw error;
    }
  }
}

/**
 * Get table schema
 */
async function getTableSchema(datasetId, tableId) {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  try {
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    const [metadata] = await table.getMetadata();

    return {
      success: true,
      schema: metadata.schema.fields,
      numRows: metadata.numRows,
      creationTime: metadata.creationTime,
      lastModified: metadata.lastModifiedTime
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get sample data from table
 */
async function getSampleData(datasetId, tableId, limit = 10) {
  const query = `
    SELECT *
    FROM \`${process.env.GCP_PROJECT_ID}.${datasetId}.${tableId}\`
    LIMIT ${limit}
  `;

  return await executeQuery(query);
}

/**
 * Delete a table
 */
async function deleteTable(datasetId, tableId) {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  try {
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    await table.delete();

    console.log(`✓ Deleted table: ${datasetId}.${tableId}`);
    return { success: true };
  } catch (error) {
    console.error(`✗ Failed to delete table: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * List tables in a dataset
 */
async function listTables(datasetId) {
  if (!bigquery) {
    throw new Error('BigQuery client not initialized');
  }

  try {
    const dataset = bigquery.dataset(datasetId);
    const [tables] = await dataset.getTables();

    return {
      success: true,
      tables: tables.map(table => ({
        id: table.id,
        fullId: `${datasetId}.${table.id}`
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper: Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  createTempTable,
  executeQuery,
  importToPermanent,
  getTableSchema,
  getSampleData,
  deleteTable,
  listTables,
  ensureDatasetExists
};
