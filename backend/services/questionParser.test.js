/**
 * Test file for questionParser.js
 * Run with: node backend/services/questionParser.test.js
 */

const { parseQuestion, validateParsedQuestion } = require('./questionParser');

// Test Case 1: Electric Items Question
const electricItemsQuestion = `
table : electric_items.
Type  Status  Time_in_Minutes
===============================
light 'on'  100
light 'off'    110
fan   'on'  80
fan   'off'    120
light 'on'  150
light 'off'    200
Output:
===========
Type     Time_Duration
=========================
light       60
fan      40
`;

console.log('Testing Electric Items Question...\n');
console.log('Input Question:');
console.log('─'.repeat(60));
console.log(electricItemsQuestion);
console.log('─'.repeat(60));

try {
  const parsed = parseQuestion(electricItemsQuestion);
  validateParsedQuestion(parsed);

  console.log('\n✅ PARSING SUCCESSFUL!\n');
  console.log('Parsed Result:');
  console.log(JSON.stringify(parsed, null, 2));

  console.log('\n\nTable Details:');
  console.log('─'.repeat(60));
  console.log(`Table Name: ${parsed.tableName}`);
  console.log(`Full Name (with timestamp): ${parsed.fullTableName}`);
  console.log(`\nSchema:`);
  parsed.schema.forEach(col => {
    console.log(`  - ${col.name.padEnd(20)} [${col.type}]`);
  });

  console.log(`\nInput Data (${parsed.inputData.length} rows):`);
  parsed.inputData.forEach((row, index) => {
    console.log(`  Row ${index + 1}: [${row.join(', ')}]`);
  });

  if (parsed.expectedOutput) {
    console.log(`\nExpected Output:`);
    console.log(`  Columns: ${parsed.expectedOutput.columns.join(', ')}`);
    parsed.expectedOutput.rows.forEach((row, index) => {
      console.log(`  Row ${index + 1}: [${row.join(', ')}]`);
    });
  }

  console.log('\n' + '─'.repeat(60));

} catch (error) {
  console.error('❌ PARSING FAILED!');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}

// Test Case 2: Simple Customers Table
const customersQuestion = `
table: customers
customer_id  first_name  last_name  age
1  John  Doe  31
2  Robert  Luna  22
3  David  Robinson  22

Output:
first_name  age
John  31
Robert  22
David  22
`;

console.log('\n\n' + '='.repeat(60));
console.log('Testing Customers Question...\n');
console.log('Input Question:');
console.log('─'.repeat(60));
console.log(customersQuestion);
console.log('─'.repeat(60));

try {
  const parsed = parseQuestion(customersQuestion);
  validateParsedQuestion(parsed);

  console.log('\n✅ PARSING SUCCESSFUL!\n');
  console.log('Parsed Result:');
  console.log(JSON.stringify(parsed, null, 2));

} catch (error) {
  console.error('❌ PARSING FAILED!');
  console.error('Error:', error.message);
}

// Test Case 3: Edge Case - Decimal Numbers
const decimalsQuestion = `
table: products
product_id  name  price
1  Laptop  1299.99
2  Mouse  29.50
3  'Keyboard Pro'  89.99

Output:
name  price
Laptop  1299.99
`;

console.log('\n\n' + '='.repeat(60));
console.log('Testing Decimals Question...\n');

try {
  const parsed = parseQuestion(decimalsQuestion);
  console.log('\n✅ PARSING SUCCESSFUL!\n');
  console.log('Schema:');
  parsed.schema.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}`);
  });
  console.log('\nData:');
  console.log(JSON.stringify(parsed.inputData, null, 2));

} catch (error) {
  console.error('❌ PARSING FAILED!');
  console.error('Error:', error.message);
}

console.log('\n\n' + '='.repeat(60));
console.log('ALL TESTS COMPLETED!');
console.log('='.repeat(60));
