import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export default function SQLEditorV2({ onBackToHome }) {
  // State management
  const [mode, setMode] = useState('chat'); // 'chat' or 'expanded'
  const [sqlQuery, setSqlQuery] = useState('');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [queryResults, setQueryResults] = useState(null);
  const [queryMetadata, setQueryMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const generateMatrixColumn = () => {
    const chars = '01SELECT*FROMWHEREαβγδ';
    const columnHeight = 20;
    return Array.from({ length: columnHeight }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    );
  };

  const handleGenerateSQL = async () => {
    if (!naturalLanguage.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      const userMessage = { role: 'user', content: naturalLanguage };
      setChatHistory(prev => [...prev, userMessage]);

      // Simulate SQL generation (since Vertex AI is not enabled)
      // In production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const generatedSQL = `-- Generated SQL for: "${naturalLanguage}"\nSELECT \n  column1,\n  column2,\n  COUNT(*) as total\nFROM \`project.dataset.table\`\nWHERE condition = true\nGROUP BY column1, column2\nORDER BY total DESC\nLIMIT 10;`;

      setSqlQuery(generatedSQL);

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: `I've generated the SQL query for you! The query will ${naturalLanguage.toLowerCase()}.`
      };
      setChatHistory(prev => [...prev, aiMessage]);

      // Expand to 4-panel view
      setTimeout(() => {
        setMode('expanded');
      }, 500);

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

        .matrix-column {
          animation: matrixRain linear infinite;
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out;
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
                <span style={styles.titleAccent}>VERSE</span>AI SQL ASSISTANT
              </h1>
              <p style={styles.subtitle}>Ask me anything about your data in plain English</p>
            </div>
            <div style={{ width: '80px' }} />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'chat' ? (
            // CHAT MODE - Friendly Single Window
            <motion.div
              key="chat-mode"
              style={styles.chatMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div style={styles.chatWindow}>
                {/* Welcome Message */}
                {chatHistory.length === 0 && (
                  <motion.div
                    style={styles.welcomeContainer}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div style={styles.welcomeIcon}>👋</div>
                    <h2 style={styles.welcomeTitle}>Hi! I'm your SQL Assistant</h2>
                    <p style={styles.welcomeText}>
                      Tell me what data you need, and I'll write the SQL for you.
                    </p>
                    <div style={styles.examplesContainer}>
                      <p style={styles.examplesLabel}>Try asking:</p>
                      <div style={styles.examples}>
                        <motion.div
                          style={styles.exampleChip}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 65, 0.15)' }}
                          onClick={() => setNaturalLanguage('Show me the top 10 users by revenue')}
                        >
                          💰 Top 10 users by revenue
                        </motion.div>
                        <motion.div
                          style={styles.exampleChip}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 65, 0.15)' }}
                          onClick={() => setNaturalLanguage('Count total orders from last month')}
                        >
                          📊 Total orders last month
                        </motion.div>
                        <motion.div
                          style={styles.exampleChip}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 65, 0.15)' }}
                          onClick={() => setNaturalLanguage('Find inactive users who haven\'t logged in for 30 days')}
                        >
                          👥 Inactive users (30+ days)
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Chat Messages */}
                {chatHistory.length > 0 && (
                  <div style={styles.chatMessages}>
                    {chatHistory.map((message, idx) => (
                      <motion.div
                        key={idx}
                        style={message.role === 'user' ? styles.userMessageBubble : styles.aiMessageBubble}
                        initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={styles.messageHeader}>
                          <span style={styles.messageIcon}>
                            {message.role === 'user' ? '👤' : '🤖'}
                          </span>
                          <span style={styles.messageRole}>
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                        </div>
                        <div style={styles.messageText}>{message.content}</div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Input Area */}
                <div style={styles.inputContainer}>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      value={naturalLanguage}
                      onChange={(e) => setNaturalLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGenerateSQL()}
                      placeholder="What data do you need? Ask me in plain English..."
                      style={styles.inputField}
                      disabled={isLoading}
                      autoFocus
                    />
                    <motion.button
                      onClick={handleGenerateSQL}
                      style={styles.sendButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading || !naturalLanguage.trim()}
                    >
                      {isLoading ? '⏳' : '✨'} {isLoading ? 'Thinking...' : 'Generate SQL'}
                    </motion.button>
                  </div>
                  <p style={styles.hint}>
                    💡 I'll generate SQL and show you a full editor to refine it
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            // EXPANDED MODE - 4 Panel Layout
            <motion.div
              key="expanded-mode"
              style={styles.expandedMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={styles.panelsGrid}>
                {/* Top Row: Chat + SQL Editor */}
                <div style={styles.topRow}>
                  {/* Chat Panel */}
                  <motion.div
                    style={styles.panelSmall}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div style={styles.panelHeader}>
                      <span style={styles.panelTitle}>💬 CONVERSATION</span>
                    </div>
                    <div style={styles.chatHistorySmall}>
                      {chatHistory.map((message, idx) => (
                        <div
                          key={idx}
                          style={message.role === 'user' ? styles.userMessageSmall : styles.aiMessageSmall}
                        >
                          <div style={styles.messageRoleSmall}>
                            {message.role === 'user' ? '👤' : '🤖'}
                          </div>
                          <div style={styles.messageContentSmall}>{message.content}</div>
                        </div>
                      ))}
                    </div>
                    <div style={styles.inputContainerSmall}>
                      <input
                        type="text"
                        value={naturalLanguage}
                        onChange={(e) => setNaturalLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerateSQL()}
                        placeholder="Ask follow-up questions..."
                        style={styles.inputSmall}
                        disabled={isLoading}
                      />
                    </div>
                  </motion.div>

                  {/* SQL Editor Panel */}
                  <motion.div
                    style={styles.panelLarge}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div style={styles.panelHeader}>
                      <span style={styles.panelTitle}>⚡ SQL EDITOR</span>
                      <div style={styles.headerActions}>
                        <motion.button
                          onClick={handleRunQuery}
                          style={styles.runButton}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isLoading}
                        >
                          {isLoading ? '⏳ Running...' : '▶ Run Query'}
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
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Row: Results + Metadata */}
                <div style={styles.bottomRow}>
                  {/* Results Panel */}
                  <motion.div
                    style={styles.panelResults}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div style={styles.panelHeader}>
                      <span style={styles.panelTitle}>📊 RESULTS</span>
                      {queryResults && (
                        <span style={styles.rowCount}>{queryResults.length} rows</span>
                      )}
                    </div>
                    <div style={styles.resultsContainer}>
                      {!queryResults && !error && (
                        <div style={styles.placeholder}>
                          Click "Run Query" to see results here
                        </div>
                      )}
                      {error && (
                        <div style={styles.errorBox}>
                          <strong>Error:</strong> {error}
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

                  {/* Metadata Panel */}
                  <motion.div
                    style={styles.panelMetadata}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div style={styles.panelHeader}>
                      <span style={styles.panelTitle}>ℹ️ INFO</span>
                    </div>
                    <div style={styles.metadataBody}>
                      {!queryMetadata && (
                        <div style={styles.placeholder}>
                          Query info will appear here
                        </div>
                      )}
                      {queryMetadata && (
                        <div style={styles.metadataGrid}>
                          <div style={styles.metadataItem}>
                            <div style={styles.metadataLabel}>Time</div>
                            <div style={styles.metadataValue}>{queryMetadata.executionTime}ms</div>
                          </div>
                          <div style={styles.metadataItem}>
                            <div style={styles.metadataLabel}>Rows</div>
                            <div style={styles.metadataValue}>{queryMetadata.totalRows}</div>
                          </div>
                          <div style={styles.metadataItem}>
                            <div style={styles.metadataLabel}>Processed</div>
                            <div style={styles.metadataValue}>
                              {(parseInt(queryMetadata.totalBytesProcessed) / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
    opacity: 0.1,
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
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    textShadow: '0 0 15px #00ff41',
    letterSpacing: '2px',
  },
  titleAccent: {
    color: '#00ff41',
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.7,
    margin: 0,
    fontFamily: 'Arial, sans-serif',
  },
  chatMode: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  chatWindow: {
    width: '100%',
    maxWidth: '800px',
    height: '70vh',
    background: 'rgba(0, 20, 0, 0.9)',
    border: '2px solid #00ff41',
    borderRadius: '20px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 40px rgba(0, 255, 65, 0.3)',
  },
  welcomeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  welcomeIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#00ff41',
    fontFamily: 'Arial, sans-serif',
  },
  welcomeText: {
    fontSize: '18px',
    opacity: 0.8,
    marginBottom: '40px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
  },
  examplesContainer: {
    width: '100%',
  },
  examplesLabel: {
    fontSize: '14px',
    opacity: 0.7,
    marginBottom: '15px',
    fontFamily: 'Arial, sans-serif',
  },
  examples: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  exampleChip: {
    padding: '12px 20px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.3s',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  userMessageBubble: {
    alignSelf: 'flex-end',
    maxWidth: '70%',
    background: 'rgba(0, 255, 65, 0.15)',
    border: '1px solid #00ff41',
    borderRadius: '15px',
    padding: '15px',
  },
  aiMessageBubble: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
    background: 'rgba(0, 100, 255, 0.15)',
    border: '1px solid #00bfff',
    borderRadius: '15px',
    padding: '15px',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  messageIcon: {
    fontSize: '18px',
  },
  messageRole: {
    fontSize: '12px',
    fontWeight: 'bold',
    opacity: 0.8,
    fontFamily: 'Arial, sans-serif',
  },
  messageText: {
    fontSize: '15px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
  },
  inputContainer: {
    marginTop: 'auto',
  },
  inputWrapper: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  inputField: {
    flex: 1,
    padding: '15px 20px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00ff41',
    borderRadius: '25px',
    color: '#00ff41',
    fontSize: '15px',
    fontFamily: 'Arial, sans-serif',
  },
  sendButton: {
    padding: '15px 30px',
    background: '#00ff41',
    border: 'none',
    borderRadius: '25px',
    color: '#000',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)',
  },
  hint: {
    fontSize: '12px',
    opacity: 0.6,
    textAlign: 'center',
    margin: 0,
    fontFamily: 'Arial, sans-serif',
  },
  expandedMode: {
    flex: 1,
    overflow: 'hidden',
  },
  panelsGrid: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '15px',
    height: '50%',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '15px',
    height: '50%',
  },
  panelSmall: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelLarge: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelResults: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelMetadata: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '12px 15px',
    borderBottom: '2px solid #00ff41',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 255, 65, 0.1)',
  },
  panelTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  runButton: {
    padding: '8px 16px',
    background: '#00ff41',
    border: 'none',
    borderRadius: '5px',
    color: '#000',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  chatHistorySmall: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userMessageSmall: {
    alignSelf: 'flex-end',
    background: 'rgba(0, 255, 65, 0.2)',
    border: '1px solid #00ff41',
    borderRadius: '10px',
    padding: '8px 12px',
    maxWidth: '85%',
  },
  aiMessageSmall: {
    alignSelf: 'flex-start',
    background: 'rgba(0, 100, 255, 0.2)',
    border: '1px solid #00bfff',
    borderRadius: '10px',
    padding: '8px 12px',
    maxWidth: '85%',
  },
  messageRoleSmall: {
    fontSize: '14px',
    marginBottom: '5px',
  },
  messageContentSmall: {
    fontSize: '12px',
    lineHeight: '1.4',
    fontFamily: 'Arial, sans-serif',
  },
  inputContainerSmall: {
    padding: '10px',
    borderTop: '2px solid #00ff41',
  },
  inputSmall: {
    width: '100%',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '5px',
    color: '#00ff41',
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
  },
  editorContainer: {
    flex: 1,
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
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
  },
  errorBox: {
    background: 'rgba(255, 0, 0, 0.2)',
    border: '2px solid #ff0000',
    borderRadius: '5px',
    padding: '15px',
    color: '#ff6b6b',
    fontFamily: 'Arial, sans-serif',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
  },
  th: {
    padding: '8px',
    textAlign: 'left',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
  },
  td: {
    padding: '6px 8px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
    fontFamily: 'Arial, sans-serif',
  },
  evenRow: {
    background: 'rgba(0, 255, 65, 0.05)',
  },
  oddRow: {
    background: 'transparent',
  },
  rowCount: {
    fontSize: '11px',
    opacity: 0.8,
  },
  metadataBody: {
    flex: 1,
    padding: '15px',
  },
  metadataGrid: {
    display: 'grid',
    gap: '12px',
  },
  metadataItem: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    borderRadius: '5px',
    padding: '10px',
  },
  metadataLabel: {
    fontSize: '10px',
    opacity: 0.7,
    marginBottom: '5px',
    textTransform: 'uppercase',
  },
  metadataValue: {
    fontSize: '13px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  },
};
