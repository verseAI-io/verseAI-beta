import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export default function SQLEditor({ onBackToHome }) {
  // State management
  const [sqlQuery, setSqlQuery] = useState('-- Enter your SQL query here\nSELECT * FROM `project.dataset.table` LIMIT 10');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [queryResults, setQueryResults] = useState(null);
  const [queryMetadata, setQueryMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [tables, setTables] = useState([]);
  const [examples, setExamples] = useState([]);
  const [showExampleBuilder, setShowExampleBuilder] = useState(false);

  // Matrix animation state
  const [matrixColumns, setMatrixColumns] = useState([]);
  const chatEndRef = useRef(null);

  // Initialize Matrix background
  useEffect(() => {
    const columns = [];
    const columnCount = Math.floor(window.innerWidth / 25);

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
  }, []);

  // Fetch datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  const generateMatrixColumn = () => {
    const chars = '01SELECT*FROMWHEREαβγδ';
    const columnHeight = 20;
    return Array.from({ length: columnHeight }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    );
  };

  const fetchDatasets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bigquery/datasets`);
      if (response.data.success) {
        setDatasets(response.data.datasets);
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
    }
  };

  const fetchTables = async (datasetId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bigquery/datasets/${datasetId}/tables`);
      if (response.data.success) {
        setTables(response.data.tables);
        setSelectedDataset(datasetId);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  const handleGenerateSQL = async () => {
    if (!naturalLanguage.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      const userMessage = { role: 'user', content: naturalLanguage };
      setChatHistory(prev => [...prev, userMessage]);

      // Generate SQL using Vertex AI
      const response = await axios.post(`${API_BASE_URL}/ai/generate-sql`, {
        prompt: naturalLanguage,
        examples: examples.length > 0 ? examples : undefined
      });

      if (response.data.success) {
        setSqlQuery(response.data.sql);

        // Add AI response to chat
        const aiMessage = {
          role: 'assistant',
          content: response.data.explanation || 'SQL query generated successfully!'
        };
        setChatHistory(prev => [...prev, aiMessage]);
      }

      setNaturalLanguage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate SQL');
      console.error('Error generating SQL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setQueryResults(null);
    setQueryMetadata(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/bigquery/query`, {
        query: sqlQuery,
        maxResults: 1000
      });

      if (response.data.success) {
        setQueryResults(response.data.data);
        setQueryMetadata(response.data.metadata);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute query');
      console.error('Error running query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateQuery = async () => {
    if (!sqlQuery.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/bigquery/validate`, {
        query: sqlQuery
      });

      if (response.data.valid) {
        alert(`✅ Query is valid!\n\nEstimated bytes: ${response.data.estimatedBytes}`);
      } else {
        alert(`❌ Query has errors:\n\n${response.data.error}`);
      }
    } catch (err) {
      alert(`❌ Validation failed:\n\n${err.response?.data?.error || err.message}`);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
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

        .monaco-editor {
          background: rgba(0, 0, 0, 0.8) !important;
        }

        .monaco-editor .margin {
          background: rgba(0, 20, 0, 0.5) !important;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #00ff41 !important;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.4) !important;
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: #00ff41;
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #00cc33;
        }
      `}</style>

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

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.headerContent}>
            {onBackToHome && (
              <motion.button
                onClick={onBackToHome}
                style={styles.backButton}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                ← BACK
              </motion.button>
            )}
            <div style={styles.titleContainer}>
              <h1 style={styles.title}>
                <span style={styles.titleAccent}>VERSE</span>AI SQL EDITOR
              </h1>
              <p style={styles.subtitle}>Powered by Google BigQuery & Vertex AI</p>
            </div>
            <div style={{ width: '80px' }} /> {/* Spacer for centering */}
          </div>
        </motion.div>

        {/* 4-Panel Layout */}
        <div style={styles.panelsContainer}>
          {/* Panel 1: Natural Language Chat */}
          <motion.div
            style={styles.panel}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>💬 NATURAL LANGUAGE INTERFACE</span>
            </div>
            <div style={styles.panelBody}>
              {/* Chat History */}
              <div style={styles.chatHistory}>
                {chatHistory.length === 0 && (
                  <div style={styles.chatPlaceholder}>
                    Ask me anything about your data... <br/>
                    Example: "Show me the top 10 users by revenue"
                  </div>
                )}
                {chatHistory.map((message, idx) => (
                  <motion.div
                    key={idx}
                    style={message.role === 'user' ? styles.userMessage : styles.aiMessage}
                    initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.messageRole}>
                      {message.role === 'user' ? '👤 YOU' : '🤖 AI'}
                    </div>
                    <div style={styles.messageContent}>{message.content}</div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div style={styles.chatInput}>
                <input
                  type="text"
                  value={naturalLanguage}
                  onChange={(e) => setNaturalLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateSQL()}
                  placeholder="Describe what you want in plain English..."
                  style={styles.input}
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleGenerateSQL}
                  style={styles.generateButton}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0, 255, 65, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  {isLoading ? '⚡ GENERATING...' : '⚡ GENERATE SQL'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Panel 2: SQL Editor */}
          <motion.div
            style={styles.panel}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>⚡ SQL QUERY EDITOR</span>
              <div style={styles.headerActions}>
                <motion.button
                  onClick={handleValidateQuery}
                  style={styles.smallButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✓ VALIDATE
                </motion.button>
                <motion.button
                  onClick={handleRunQuery}
                  style={{...styles.smallButton, ...styles.runButton}}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ RUNNING...' : '▶ RUN QUERY'}
                </motion.button>
              </div>
            </div>
            <div style={styles.editorContainer}>
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sqlQuery}
                onChange={(value) => setSqlQuery(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: '"Courier New", monospace',
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </motion.div>

          {/* Bottom Row: Results & Metadata */}
          <div style={styles.bottomRow}>
            {/* Panel 3: Query Results */}
            <motion.div
              style={styles.panel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div style={styles.panelHeader}>
                <span style={styles.panelTitle}>📊 QUERY RESULTS</span>
                {queryResults && (
                  <span style={styles.resultCount}>{queryResults.length} rows</span>
                )}
              </div>
              <div style={styles.resultsContainer}>
                {error && (
                  <div style={styles.errorBox}>
                    <strong>❌ ERROR:</strong> {error}
                  </div>
                )}
                {!queryResults && !error && (
                  <div style={styles.placeholder}>
                    Run a query to see results here...
                  </div>
                )}
                {queryResults && queryResults.length > 0 && (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {Object.keys(queryResults[0]).map((key) => (
                            <th key={key} style={styles.th}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResults.map((row, idx) => (
                          <tr key={idx} style={idx % 2 === 0 ? styles.evenRow : styles.oddRow}>
                            {Object.values(row).map((value, colIdx) => (
                              <td key={colIdx} style={styles.td}>
                                {value !== null && value !== undefined ? String(value) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Panel 4: Query Metadata */}
            <motion.div
              style={styles.metadataPanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div style={styles.panelHeader}>
                <span style={styles.panelTitle}>ℹ️ QUERY INFO</span>
              </div>
              <div style={styles.metadataBody}>
                {!queryMetadata && (
                  <div style={styles.placeholder}>
                    Metadata will appear here after running a query...
                  </div>
                )}
                {queryMetadata && (
                  <div style={styles.metadataGrid}>
                    <div style={styles.metadataItem}>
                      <div style={styles.metadataLabel}>Execution Time</div>
                      <div style={styles.metadataValue}>{queryMetadata.executionTime}ms</div>
                    </div>
                    <div style={styles.metadataItem}>
                      <div style={styles.metadataLabel}>Rows Returned</div>
                      <div style={styles.metadataValue}>{queryMetadata.totalRows}</div>
                    </div>
                    <div style={styles.metadataItem}>
                      <div style={styles.metadataLabel}>Bytes Processed</div>
                      <div style={styles.metadataValue}>
                        {(parseInt(queryMetadata.totalBytesProcessed) / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <div style={styles.metadataItem}>
                      <div style={styles.metadataLabel}>Cache Hit</div>
                      <div style={styles.metadataValue}>
                        {queryMetadata.cacheHit ? '✅ Yes' : '❌ No'}
                      </div>
                    </div>
                    <div style={styles.metadataItem}>
                      <div style={styles.metadataLabel}>Job ID</div>
                      <div style={{...styles.metadataValue, fontSize: '10px'}}>
                        {queryMetadata.jobId}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scan Line Effect */}
      <motion.div
        style={styles.scanLine}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000000',
    color: '#00ff41',
    fontFamily: '"Courier New", monospace',
    position: 'relative',
    overflow: 'hidden',
  },
  matrixBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
    opacity: 0.15,
  },
  matrixColumn: {
    position: 'absolute',
    top: '-100%',
    fontSize: '12px',
    color: '#00ff41',
    lineHeight: '16px',
    fontWeight: 'bold',
  },
  matrixChar: {
    display: 'block',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '20px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '20px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '2px solid #00ff41',
    borderRadius: '5px',
    color: '#00ff41',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    letterSpacing: '1px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '0 0 15px #00ff41',
    letterSpacing: '3px',
  },
  titleAccent: {
    color: '#00ff41',
    textShadow: '0 0 20px #00ff41',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.8,
    margin: 0,
  },
  panelsContainer: {
    flex: 1,
    display: 'grid',
    gridTemplateRows: '1fr 1fr 1fr',
    gap: '20px',
    overflow: 'hidden',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
  },
  panel: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)',
  },
  metadataPanel: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
  },
  panelHeader: {
    padding: '15px 20px',
    borderBottom: '2px solid #00ff41',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 255, 65, 0.1)',
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  smallButton: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    background: 'transparent',
    border: '2px solid #00ff41',
    borderRadius: '5px',
    color: '#00ff41',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    letterSpacing: '1px',
  },
  runButton: {
    background: '#00ff41',
    color: '#000',
  },
  panelBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHistory: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  chatPlaceholder: {
    opacity: 0.5,
    textAlign: 'center',
    padding: '30px',
    fontSize: '14px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'rgba(0, 255, 65, 0.2)',
    border: '1px solid #00ff41',
    borderRadius: '10px',
    padding: '10px 15px',
    maxWidth: '70%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    background: 'rgba(0, 100, 255, 0.2)',
    border: '1px solid #00bfff',
    borderRadius: '10px',
    padding: '10px 15px',
    maxWidth: '70%',
  },
  messageRole: {
    fontSize: '10px',
    fontWeight: 'bold',
    marginBottom: '5px',
    opacity: 0.8,
  },
  messageContent: {
    fontSize: '13px',
    lineHeight: '1.5',
  },
  chatInput: {
    padding: '15px',
    borderTop: '2px solid #00ff41',
    display: 'flex',
    gap: '10px',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  input: {
    flex: 1,
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00ff41',
    borderRadius: '5px',
    color: '#00ff41',
    fontSize: '14px',
    fontFamily: '"Courier New", monospace',
  },
  generateButton: {
    padding: '12px 24px',
    background: '#00ff41',
    border: '2px solid #00ff41',
    borderRadius: '5px',
    color: '#000',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    letterSpacing: '1px',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.4)',
  },
  editorContainer: {
    flex: 1,
    position: 'relative',
  },
  resultsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
  },
  placeholder: {
    opacity: 0.5,
    textAlign: 'center',
    padding: '30px',
    fontSize: '14px',
  },
  errorBox: {
    background: 'rgba(255, 0, 0, 0.2)',
    border: '2px solid #ff0000',
    borderRadius: '5px',
    padding: '15px',
    color: '#ff6b6b',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
  },
  td: {
    padding: '8px 10px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
  },
  evenRow: {
    background: 'rgba(0, 255, 65, 0.05)',
  },
  oddRow: {
    background: 'transparent',
  },
  resultCount: {
    fontSize: '12px',
    opacity: 0.8,
  },
  metadataBody: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px',
  },
  metadataItem: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '5px',
    padding: '12px',
  },
  metadataLabel: {
    fontSize: '10px',
    opacity: 0.7,
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  metadataValue: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(transparent, #00ff41, transparent)',
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 2,
  },
};
