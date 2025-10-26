import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export default function SQLPlayground({ isOpen, onClose }) {
  const [question, setQuestion] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [code, setCode] = useState('-- Write your SQL query here');
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [optimization, setOptimization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('question');
  const [matrixColumns, setMatrixColumns] = useState([]);

  const models = [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini Flash' },
  ];

  const sampleQuestion = `Create a table with the following data:

Table: electronics_sales
Columns: product, category, price, quantity
Data:
Laptop, Electronics, 1200, 5
Phone, Electronics, 800, 10
Tablet, Electronics, 500, 7

Write a SQL query to find the total revenue (price * quantity) for each product, ordered by revenue descending.`;

  // Initialize Matrix background
  useEffect(() => {
    if (isOpen) {
      const columns = [];
      const columnCount = Math.floor(window.innerWidth / 30);

      for (let i = 0; i < columnCount; i++) {
        columns.push({
          id: i,
          characters: generateMatrixColumn(),
          left: `${(i / columnCount) * 100}%`,
          animationDelay: Math.random() * 5,
          duration: 15 + Math.random() * 10
        });
      }

      setMatrixColumns(columns);
    }
  }, [isOpen]);

  const generateMatrixColumn = () => {
    const chars = '01SELECT*FROM WHERE⚡';
    const columnHeight = 20;
    return Array.from({ length: columnHeight }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    );
  };

  const handleParseQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/sql-playground/parse`, {
        questionText: question
      });

      if (response.data.success) {
        // Transform response to match expected structure
        const transformedData = {
          dataset: response.data.bigquery.datasetId,
          tableName: response.data.bigquery.tableId,
          schema: response.data.parsed.schema,
          rowsInserted: response.data.parsed.rowCount
        };
        setParsedData(transformedData);
        setActiveTab('query');
      } else {
        setError(response.data.error || 'Failed to parse question');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to parse question');
      console.error('Parse error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!parsedData) {
      setError('Please parse a question first');
      return;
    }

    if (!code.trim() || code.trim() === '-- Write your SQL query here') {
      setError('Please write a SQL query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/sql-playground/execute`, {
        query: code
      });

      if (response.data.success) {
        setResults(response.data.rows);
        setExecutionMetrics({
          executionTime: response.data.executionTime,
          bytesProcessed: response.data.bytesProcessed,
          rowCount: response.data.rowCount || 0
        });
        setActiveTab('results');
      } else {
        setError(response.data.error || 'Query execution failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Query execution failed');
      console.error('Execute error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNLToSQL = async (nlQuery) => {
    if (!parsedData) {
      setError('Please parse a question first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/sql-playground/nl-to-sql`, {
        prompt: nlQuery || question,
        tableSchema: parsedData.schema,
        model: selectedModel
      });

      if (response.data.success) {
        setCode(response.data.sql);
        setActiveTab('query');
      } else {
        setError(response.data.error || 'Failed to generate SQL');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate SQL');
      console.error('NL to SQL error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainQuery = async () => {
    if (!code.trim() || code.trim() === '-- Write your SQL query here') {
      setError('Please write a SQL query first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/sql-playground/explain`, {
        query: code,
        model: selectedModel
      });

      if (response.data.success) {
        setExplanation(response.data.explanation);
        setActiveTab('explain');
      } else {
        setError(response.data.error || 'Failed to explain query');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to explain query');
      console.error('Explain error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeQuery = async () => {
    if (!code.trim() || code.trim() === '-- Write your SQL query here') {
      setError('Please write a SQL query first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/sql-playground/optimize`, {
        query: code,
        model: selectedModel
      });

      if (response.data.success) {
        setOptimization(response.data.suggestions);
        setActiveTab('optimize');
      } else {
        setError(response.data.error || 'Failed to optimize query');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to optimize query');
      console.error('Optimize error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setQuestion(sampleQuestion);
  };

  const handleReset = () => {
    setQuestion('');
    setParsedData(null);
    setCode('-- Write your SQL query here');
    setResults(null);
    setExplanation('');
    setOptimization('');
    setError(null);
    setExecutionMetrics(null);
    setActiveTab('question');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        style={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <style>{`
          @keyframes matrixRain {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translateY(100vh); opacity: 0; }
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }

          @keyframes scanline {
            0% { transform: translateY(0); }
            100% { transform: translateY(100%); }
          }

          .matrix-column {
            animation: matrixRain linear infinite;
          }

          .pulse-glow {
            animation: pulse 2s ease-in-out infinite;
          }

          input:focus, textarea:focus {
            outline: none;
            border-color: #ffd700 !important;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
          }

          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.5);
          }

          ::-webkit-scrollbar-thumb {
            background: #ffd700;
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #ffed4e;
          }
        `}</style>

        <motion.div
          style={styles.container}
          initial={{ scale: 0, rotateY: 180, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.8
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Matrix Rain Background */}
          <div style={styles.matrixBackground}>
            {matrixColumns.map((column) => (
              <div
                key={column.id}
                className="matrix-column"
                style={{
                  ...styles.matrixColumn,
                  left: column.left,
                  animationDelay: `${column.animationDelay}s`,
                  animationDuration: `${column.duration}s`
                }}
              >
                {column.characters.map((char, idx) => (
                  <div key={idx} style={styles.matrixChar}>{char}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Header */}
          <motion.div
            style={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div style={styles.headerContent}>
              <div style={styles.titleContainer}>
                <span style={styles.titleIcon}>⚡</span>
                <h2 style={styles.title}>AI-POWERED SQL PLAYGROUND</h2>
              </div>
              <div style={styles.headerActions}>
                {models.map(model => (
                  <motion.button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    style={{
                      ...styles.modelButton,
                      background: selectedModel === model.id ? '#ffd700' : 'transparent',
                      color: selectedModel === model.id ? '#000' : '#ffd700',
                      border: `2px solid ${selectedModel === model.id ? '#ffd700' : 'rgba(255, 215, 0, 0.3)'}`
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {model.name}
                  </motion.button>
                ))}
                <motion.button
                  onClick={onClose}
                  style={styles.closeButton}
                  whileHover={{ scale: 1.1, rotate: 90, boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
            </div>
            <p style={styles.subtitle}>Ask questions and AI will create BigQuery tables, generate SQL, and analyze your queries</p>
          </motion.div>

          {/* Main Content - Two Column Layout */}
          <div style={styles.mainContent}>
            {/* Left Panel - Question & Info */}
            <motion.div
              style={styles.leftPanel}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>📝 SQL QUESTION</span>
              </div>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste your SQL question here with table data..."
                style={styles.questionTextarea}
                disabled={isLoading}
              />

              <div style={styles.buttonRow}>
                <motion.button
                  onClick={handleLoadSample}
                  style={{...styles.button, ...styles.secondaryButton}}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📋 Load Sample
                </motion.button>
                <motion.button
                  onClick={handleParseQuestion}
                  disabled={isLoading}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  whileHover={!isLoading ? { scale: 1.05, boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)' } : {}}
                  whileTap={!isLoading ? { scale: 0.95 } : {}}
                >
                  {isLoading ? '⏳ Parsing...' : '🚀 Parse & Create Table'}
                </motion.button>
              </div>

              {/* Table Created Success */}
              {parsedData && (
                <motion.div
                  style={styles.successBox}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 style={styles.successTitle}>✅ Table Created Successfully</h3>
                  <div style={styles.dataInfo}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Dataset:</span>
                      <span style={styles.infoValue}>{parsedData.dataset}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Table:</span>
                      <span style={styles.infoValue}>{parsedData.tableName}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Rows:</span>
                      <span style={styles.infoValue}>{parsedData.rowsInserted}</span>
                    </div>
                  </div>

                  {/* Schema */}
                  <div style={styles.schemaSection}>
                    <div style={styles.schemaTitle}>📋 Schema:</div>
                    <div style={styles.schemaList}>
                      {parsedData.schema?.map(field => (
                        <div key={field.name} style={styles.schemaItem}>
                          • {field.name} <span style={styles.schemaType}>({field.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={() => handleNLToSQL()}
                    disabled={isLoading}
                    style={{
                      ...styles.button,
                      ...styles.aiButton,
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isLoading ? { scale: 1.05 } : {}}
                    whileTap={!isLoading ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? '⏳ Generating...' : '🤖 Generate SQL with AI'}
                  </motion.button>
                </motion.div>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  style={styles.errorBox}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ❌ {error}
                </motion.div>
              )}

              {/* Reset Button */}
              <motion.button
                onClick={handleReset}
                style={{...styles.button, ...styles.resetButton}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Reset Playground
              </motion.button>
            </motion.div>

            {/* Right Panel - Tabs */}
            <motion.div
              style={styles.rightPanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Tab Navigation */}
              <div style={styles.tabNav}>
                {[
                  { id: 'query', label: '📝 SQL Query', color: '#00ff41' },
                  { id: 'results', label: '📊 Results', color: '#00bfff' },
                  { id: 'explain', label: '💡 Explain', color: '#ffd700' },
                  { id: 'optimize', label: '⚡ Optimize', color: '#ff1493' }
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      ...styles.tab,
                      background: activeTab === tab.id ? tab.color : 'transparent',
                      color: activeTab === tab.id ? '#000' : tab.color,
                      border: `2px solid ${tab.color}`,
                      fontWeight: activeTab === tab.id ? 'bold' : 'normal'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={styles.tabContent}>
                {activeTab === 'query' && (
                  <div style={styles.editorSection}>
                    <div style={styles.editorContainer}>
                      <Editor
                        height="100%"
                        defaultLanguage="sql"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true
                        }}
                      />
                    </div>
                    <div style={styles.editorActions}>
                      <motion.button
                        onClick={handleExecuteQuery}
                        disabled={isLoading}
                        style={{
                          ...styles.button,
                          ...styles.executeButton,
                          opacity: isLoading ? 0.6 : 1,
                          cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={!isLoading ? { scale: 1.05 } : {}}
                        whileTap={!isLoading ? { scale: 0.95 } : {}}
                      >
                        {isLoading ? '⏳ Executing...' : '▶️ Execute Query'}
                      </motion.button>
                      <motion.button
                        onClick={handleExplainQuery}
                        disabled={isLoading}
                        style={{...styles.button, ...styles.explainButton}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        💡 Explain
                      </motion.button>
                      <motion.button
                        onClick={handleOptimizeQuery}
                        disabled={isLoading}
                        style={{...styles.button, ...styles.optimizeButton}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ⚡ Optimize
                      </motion.button>
                    </div>
                  </div>
                )}

                {activeTab === 'results' && (
                  <div style={styles.resultsSection}>
                    {executionMetrics && (
                      <div style={styles.metricsBox}>
                        <div>⏱️ <strong>Time:</strong> {executionMetrics.executionTime}</div>
                        <div>💾 <strong>Bytes:</strong> {executionMetrics.bytesProcessed}</div>
                        <div>📊 <strong>Rows:</strong> {executionMetrics.rowCount}</div>
                      </div>
                    )}
                    {results && results.length > 0 ? (
                      <div style={styles.tableWrapper}>
                        <table style={styles.resultsTable}>
                          <thead>
                            <tr>
                              {Object.keys(results[0]).map(key => (
                                <th key={key} style={styles.tableHeader}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((row, idx) => (
                              <tr key={idx} style={styles.tableRow}>
                                {Object.values(row).map((value, i) => (
                                  <td key={i} style={styles.tableCell}>{String(value)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={styles.emptyState}>
                        No results yet. Execute a query to see results here.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'explain' && (
                  <div style={styles.textSection}>
                    {explanation ? (
                      <div style={styles.explainBox}>{explanation}</div>
                    ) : (
                      <div style={styles.emptyState}>
                        Click "Explain" to get an AI explanation of your query.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'optimize' && (
                  <div style={styles.textSection}>
                    {optimization ? (
                      <div style={styles.optimizeBox}>{optimization}</div>
                    ) : (
                      <div style={styles.emptyState}>
                        Click "Optimize" to get AI-powered optimization suggestions.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Scan Line Effect */}
          <motion.div
            style={styles.scanLine}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(5px)',
  },
  container: {
    width: '100%',
    maxWidth: '1400px',
    height: '90vh',
    background: 'rgba(0, 0, 0, 0.95)',
    border: '3px solid #ffd700',
    borderRadius: '15px',
    boxShadow: '0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 60px rgba(255, 215, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"Courier New", monospace',
  },
  matrixBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
    opacity: 0.08,
  },
  matrixColumn: {
    position: 'absolute',
    top: '-100%',
    fontSize: '12px',
    color: '#ffd700',
    lineHeight: '16px',
    fontWeight: 'bold',
  },
  matrixChar: {
    display: 'block',
  },
  header: {
    position: 'relative',
    zIndex: 2,
    padding: '20px 30px',
    borderBottom: '2px solid #ffd700',
    background: 'rgba(255, 215, 0, 0.05)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  titleIcon: {
    fontSize: '32px',
    textShadow: '0 0 20px #ffd700',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '0 0 15px #ffd700',
    letterSpacing: '2px',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#ffd700',
    opacity: 0.7,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modelButton: {
    padding: '8px 14px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    borderRadius: '5px',
    letterSpacing: '1px',
  },
  closeButton: {
    width: '36px',
    height: '36px',
    background: 'transparent',
    border: '2px solid #ff0000',
    borderRadius: '50%',
    color: '#ff0000',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
  },
  mainContent: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '350px',
    padding: '20px',
    borderRight: '2px solid #ffd700',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sectionHeader: {
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#ffd700',
    letterSpacing: '2px',
  },
  questionTextarea: {
    width: '100%',
    height: '200px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '8px',
    color: '#ffd700',
    fontSize: '13px',
    fontFamily: '"Courier New", monospace',
    resize: 'vertical',
    lineHeight: '1.5',
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 14px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    borderRadius: '6px',
    letterSpacing: '1px',
    border: 'none',
  },
  primaryButton: {
    flex: 1,
    background: '#ffd700',
    color: '#000',
    boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
  },
  secondaryButton: {
    flex: 1,
    background: 'transparent',
    border: '2px solid #00bfff',
    color: '#00bfff',
  },
  aiButton: {
    width: '100%',
    background: '#00bfff',
    color: '#000',
  },
  resetButton: {
    width: '100%',
    background: 'transparent',
    border: '2px solid #ff1493',
    color: '#ff1493',
  },
  successBox: {
    padding: '15px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '2px solid #00ff41',
    borderRadius: '8px',
  },
  successTitle: {
    color: '#00ff41',
    margin: '0 0 12px 0',
    fontSize: '14px',
  },
  dataInfo: {
    marginBottom: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '12px',
  },
  infoLabel: {
    color: '#00ff41',
    fontWeight: 'bold',
  },
  infoValue: {
    color: '#ffffff',
  },
  schemaSection: {
    marginBottom: '12px',
  },
  schemaTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#00ff41',
    marginBottom: '8px',
  },
  schemaList: {
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '11px',
    color: '#00ff41',
  },
  schemaItem: {
    marginBottom: '4px',
  },
  schemaType: {
    color: '#00bfff',
  },
  errorBox: {
    padding: '12px',
    background: 'rgba(255, 0, 0, 0.1)',
    border: '2px solid #ff0000',
    borderRadius: '8px',
    color: '#ff6b6b',
    fontSize: '12px',
  },
  tabNav: {
    display: 'flex',
    gap: '5px',
    padding: '15px 20px',
    borderBottom: '2px solid #ffd700',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  tab: {
    flex: 1,
    padding: '10px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    borderRadius: '6px 6px 0 0',
    letterSpacing: '1px',
  },
  tabContent: {
    flex: 1,
    overflow: 'hidden',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  editorSection: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  editorContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  editorActions: {
    display: 'flex',
    gap: '10px',
    padding: '15px 20px',
    borderTop: '2px solid #ffd700',
    background: 'rgba(0, 0, 0, 0.7)',
  },
  executeButton: {
    flex: 1,
    background: '#00ff41',
    color: '#000',
  },
  explainButton: {
    flex: 1,
    background: 'transparent',
    border: '2px solid #ffd700',
    color: '#ffd700',
  },
  optimizeButton: {
    flex: 1,
    background: 'transparent',
    border: '2px solid #ff1493',
    color: '#ff1493',
  },
  resultsSection: {
    padding: '20px',
    height: '100%',
    overflowY: 'auto',
  },
  metricsBox: {
    display: 'flex',
    gap: '20px',
    padding: '12px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '2px solid #00ff41',
    borderRadius: '8px',
    marginBottom: '15px',
    color: '#00ff41',
    fontSize: '12px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  resultsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'rgba(0, 0, 0, 0.6)',
    border: '2px solid #00ff41',
  },
  tableHeader: {
    padding: '10px',
    background: '#00ff41',
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: '12px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
  },
  tableCell: {
    padding: '8px 10px',
    color: '#00ff41',
    fontSize: '12px',
  },
  textSection: {
    padding: '20px',
    height: '100%',
    overflowY: 'auto',
  },
  explainBox: {
    padding: '20px',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid #ffd700',
    borderRadius: '8px',
    color: '#ffd700',
    fontSize: '13px',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
  },
  optimizeBox: {
    padding: '20px',
    background: 'rgba(255, 20, 147, 0.1)',
    border: '2px solid #ff1493',
    borderRadius: '8px',
    color: '#ff1493',
    fontSize: '13px',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'rgba(255, 215, 0, 0.5)',
    fontSize: '15px',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(transparent, #ffd700, transparent)',
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 3,
  },
};
