/**
 * SQL Question Parser
 *
 * Parses SQL questions in the format:
 *
 * table : electric_items.
 * Type  Status  Time_in_Minutes
 * ===============================
 * light 'on'  100
 * light 'off'    110
 * fan   'on'  80
 * ...
 * Output:
 * ===========
 * Type     Time_Duration
 * =========================
 * light       60
 * fan      40
 *
 * NO AI/Prompts - Pure deterministic parsing logic
 */

/**
 * Main parser function
 * @param {string} questionText - Raw question text
 * @returns {object} Parsed question structure
 */
function parseQuestion(questionText) {
  if (!questionText || typeof questionText !== 'string') {
    throw new Error('Invalid question text');
  }

  // Split into input and output sections
  const sections = splitInputOutput(questionText);

  // Parse input section
  const inputData = parseInputSection(sections.input);

  // Parse output section (if exists)
  const outputData = sections.output ? parseOutputSection(sections.output) : null;

  // Generate table name with timestamp
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const baseTableName = inputData.tableName || 'question_table';
  const fullTableName = `${baseTableName}_${timestamp}`;

  return {
    tableName: baseTableName,
    fullTableName: fullTableName,
    schema: inputData.schema,
    inputData: inputData.rows,
    expectedOutput: outputData,
    metadata: {
      rowCount: inputData.rows.length,
      columnCount: inputData.schema.length,
      timestamp: timestamp
    }
  };
}

/**
 * Split question into input and output sections
 */
function splitInputOutput(text) {
  // Look for "Output:" keyword (case-insensitive)
  const outputMatch = text.match(/output\s*:/i);

  if (outputMatch) {
    const splitIndex = outputMatch.index;
    return {
      input: text.substring(0, splitIndex).trim(),
      output: text.substring(splitIndex).trim()
    };
  }

  return {
    input: text.trim(),
    output: null
  };
}

/**
 * Parse input section to extract table name, schema, and data
 */
function parseInputSection(inputText) {
  const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Extract table name
  const tableName = extractTableName(lines);

  // Find column header line
  const headerIndex = findHeaderLine(lines);
  if (headerIndex === -1) {
    throw new Error('Could not find column headers in question');
  }

  const headerLine = lines[headerIndex];
  const columnNames = parseColumnNames(headerLine);

  // Find data start (after separator lines like ===)
  let dataStartIndex = headerIndex + 1;
  while (dataStartIndex < lines.length && isSeparatorLine(lines[dataStartIndex])) {
    dataStartIndex++;
  }

  // Parse data rows
  const dataLines = lines.slice(dataStartIndex);
  const rows = [];
  const sampleValues = {}; // Store first value for each column for type inference

  for (const line of dataLines) {
    // Skip separator lines and empty lines
    if (isSeparatorLine(line) || line.length === 0) {
      continue;
    }

    const rowData = parseDataRow(line, columnNames.length);
    if (rowData && rowData.length > 0) {
      rows.push(rowData);

      // Store first occurrence of each column for type inference
      rowData.forEach((value, index) => {
        if (!(index in sampleValues) && value !== null) {
          sampleValues[index] = value;
        }
      });
    }
  }

  // Infer schema from column names and sample values
  const schema = columnNames.map((colName, index) => {
    const sampleValue = sampleValues[index];
    const type = inferDataType(sampleValue);

    return {
      name: colName,
      type: type
    };
  });

  return {
    tableName: tableName,
    schema: schema,
    rows: rows
  };
}

/**
 * Extract table name from lines
 */
function extractTableName(lines) {
  for (const line of lines) {
    // Look for "table : xyz" or "table: xyz"
    const match = line.match(/table\s*:\s*([a-zA-Z_][a-zA-Z0-9_]*)/i);
    if (match) {
      return match[1].replace(/\.$/, ''); // Remove trailing period
    }
  }
  return 'parsed_table';
}

/**
 * Find the line containing column headers
 */
function findHeaderLine(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip table declaration line
    if (line.toLowerCase().includes('table')) {
      continue;
    }

    // Skip separator lines
    if (isSeparatorLine(line)) {
      continue;
    }

    // Check if this looks like a header (multiple words separated by spaces)
    // and the next line might be a separator or data
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      // This looks like a header line
      return i;
    }
  }

  return -1;
}

/**
 * Parse column names from header line
 */
function parseColumnNames(headerLine) {
  // Split by multiple spaces (assuming columns are separated by 2+ spaces)
  const columns = headerLine.split(/\s{2,}/).filter(col => col.trim().length > 0);

  if (columns.length === 0) {
    // Fallback: split by any whitespace
    return headerLine.split(/\s+/).filter(col => col.trim().length > 0);
  }

  return columns.map(col => col.trim());
}

/**
 * Check if a line is a separator (===, ---, etc.)
 */
function isSeparatorLine(line) {
  // Check if line consists only of separator characters
  return /^[=\-_]+$/.test(line.trim());
}

/**
 * Parse a single data row
 */
function parseDataRow(line, expectedColumns) {
  const values = [];

  // Try to intelligently split the line
  // Handle quoted strings first
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "'" || char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === ' ' || char === '\t') && !inQuotes) {
      if (current.trim().length > 0) {
        parts.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.trim().length > 0) {
    parts.push(current.trim());
  }

  // Parse each part
  for (const part of parts) {
    values.push(parseValue(part));
  }

  // If we have fewer values than expected columns, pad with nulls
  while (values.length < expectedColumns) {
    values.push(null);
  }

  // If we have more values, truncate
  return values.slice(0, expectedColumns);
}

/**
 * Parse a single value and determine its type
 */
function parseValue(value) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim();

  // Remove quotes if present
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }

  // Try to parse as number
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  if (/^-?\d+\.\d+$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  return trimmed;
}

/**
 * Infer BigQuery data type from a sample value
 */
function inferDataType(value) {
  if (value === null || value === undefined) {
    return 'STRING'; // Default to STRING for null values
  }

  const type = typeof value;

  if (type === 'number') {
    // Check if it's an integer or float
    return Number.isInteger(value) ? 'INTEGER' : 'FLOAT64';
  }

  if (type === 'string') {
    // Check if it looks like a date
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return 'DATE';
    }

    // Check if it looks like a timestamp
    if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/.test(value)) {
      return 'TIMESTAMP';
    }

    // Check if it's a boolean
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return 'BOOLEAN';
    }

    return 'STRING';
  }

  if (type === 'boolean') {
    return 'BOOLEAN';
  }

  return 'STRING'; // Default
}

/**
 * Parse output section to extract expected results
 */
function parseOutputSection(outputText) {
  const lines = outputText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Skip the "Output:" line and separator lines
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].toLowerCase().includes('output') && !isSeparatorLine(lines[i])) {
      startIndex = i;
      break;
    }
  }

  if (startIndex >= lines.length) {
    return null;
  }

  // First non-separator line should be column headers
  const headerLine = lines[startIndex];
  const columnNames = parseColumnNames(headerLine);

  // Find data start
  let dataStartIndex = startIndex + 1;
  while (dataStartIndex < lines.length && isSeparatorLine(lines[dataStartIndex])) {
    dataStartIndex++;
  }

  // Parse data rows
  const rows = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i];
    if (isSeparatorLine(line)) {
      continue;
    }

    const rowData = parseDataRow(line, columnNames.length);
    if (rowData && rowData.length > 0) {
      rows.push(rowData);
    }
  }

  return {
    columns: columnNames,
    rows: rows
  };
}

/**
 * Validate parsed question
 */
function validateParsedQuestion(parsed) {
  if (!parsed.tableName) {
    throw new Error('Table name is required');
  }

  if (!parsed.schema || parsed.schema.length === 0) {
    throw new Error('Schema must have at least one column');
  }

  if (!parsed.inputData || parsed.inputData.length === 0) {
    throw new Error('Input data must have at least one row');
  }

  // Validate each row has correct number of columns
  const expectedColumns = parsed.schema.length;
  for (let i = 0; i < parsed.inputData.length; i++) {
    const row = parsed.inputData[i];
    if (row.length !== expectedColumns) {
      throw new Error(
        `Row ${i + 1} has ${row.length} columns, expected ${expectedColumns}`
      );
    }
  }

  return true;
}

module.exports = {
  parseQuestion,
  validateParsedQuestion,
  // Export helper functions for testing
  extractTableName,
  parseColumnNames,
  inferDataType,
  parseValue
};
