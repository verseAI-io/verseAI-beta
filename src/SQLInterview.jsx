import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export default function SQLInterview({ onBackToHome }) {
  // State management
  const [mode, setMode] = useState('setup'); // 'setup', 'solving'
  const [questionTitle, setQuestionTitle] = useState('');
  const [inputTable, setInputTable] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [actualOutput, setActualOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchStatus, setMatchStatus] = useState(null); // 'match', 'mismatch', null

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

  const handleStartSolving = () => {
    if (!questionTitle.trim() || !inputTable.trim() || !expectedOutput.trim()) {
      alert('Please fill in all fields!');
      return;
    }
    setMode('solving');

    // Add initial context to chat
    const contextMessage = {
      role: 'assistant',
      content: `Great! Let's solve "${questionTitle}". I can see the input and expected output. How would you like to approach this?`
    };
    setChatHistory([contextMessage]);
  };

  const handleGenerateSQL = async () => {
    if (!naturalLanguage.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      const userMessage = { role: 'user', content: naturalLanguage };
      setChatHistory(prev => [...prev, userMessage]);

      // Simulate SQL generation with context
      await new Promise(resolve => setTimeout(resolve, 1000));

      const generatedSQL = `-- Solution for: ${questionTitle}\n-- Based on your question: "${naturalLanguage}"\n\nSELECT \n  Type,\n  MAX(Time_in_Minutes) - MIN(Time_in_Minutes) as Time_Duration\nFROM electric_items\nWHERE Status IN ('on', 'off')\nGROUP BY Type;`;

      setSqlQuery(generatedSQL);

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: `Here's the SQL solution! The query calculates the time duration by finding the difference between the maximum and minimum time for each type. Try running it to see if it matches the expected output.`
      };
      setChatHistory(prev => [...prev, aiMessage]);

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
    setActualOutput(null);
    setMatchStatus(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/bigquery/query`, {
        query: sqlQuery,
        maxResults: 1000
      });

      if (response.data.success) {
        setActualOutput(response.data.data);

        // Compare with expected output
        const match = compareOutputs(response.data.data);
        setMatchStatus(match ? 'match' : 'mismatch');

        // Add result to chat
        const resultMessage = {
          role: 'assistant',
          content: match
            ? '🎉 Perfect! Your query output matches the expected result!'
            : '⚠️ The output doesn\'t match yet. Let me help you debug this.'
        };
        setChatHistory(prev => [...prev, resultMessage]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute query');
      console.error('Error running query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const compareOutputs = (actual) => {
    // Simple comparison logic - can be enhanced
    try {
      const expected = parseExpectedOutput(expectedOutput);
      if (actual.length !== expected.length) return false;

      // Compare each row (simplified)
      return JSON.stringify(actual) === JSON.stringify(expected);
    } catch {
      return false;
    }
  };

  const parseExpectedOutput = (text) => {
    // Parse the expected output text format
    // This is a simplified parser
    return [];
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

        textarea:focus, input:focus {
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
                <span style={styles.titleAccent}>SQL</span> INTERVIEW QUESTIONS
              </h1>
              <p style={styles.subtitle}>Practice real interview questions with AI assistance</p>
            </div>
            <div style={{ width: '80px' }} />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'setup' ? (
            // SETUP MODE - Input Question Details
            <motion.div
              key="setup-mode"
              style={styles.setupMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div style={styles.setupWindow}>
                <motion.div
                  style={styles.welcomeContainer}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div style={styles.welcomeIcon}>📝</div>
                  <h2 style={styles.welcomeTitle}>Share an Interview Question</h2>
                  <p style={styles.welcomeText}>
                    Paste the question details below and let AI help you solve it
                  </p>
                </motion.div>

                <div style={styles.formContainer}>
                  {/* Question Title */}
                  <motion.div
                    style={styles.formGroup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label style={styles.label}>Question Title</label>
                    <input
                      type="text"
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      placeholder="e.g., Calculate Time Duration for Electric Items"
                      style={styles.input}
                    />
                  </motion.div>

                  {/* Input Table */}
                  <motion.div
                    style={styles.formGroup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label style={styles.label}>📥 Input Table</label>
                    <textarea
                      value={inputTable}
                      onChange={(e) => setInputTable(e.target.value)}
                      placeholder={`table: electric_items\nType    Status  Time_in_Minutes\n================================\nlight   'on'    100\nlight   'off'   110\nfan     'on'    80\nfan     'off'   120`}
                      style={styles.textarea}
                      rows={8}
                    />
                  </motion.div>

                  {/* Expected Output */}
                  <motion.div
                    style={styles.formGroup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label style={styles.label}>📤 Expected Output</label>
                    <textarea
                      value={expectedOutput}
                      onChange={(e) => setExpectedOutput(e.target.value)}
                      placeholder={`Type        Time_Duration\n==========================\nlight       60\nfan         40`}
                      style={styles.textarea}
                      rows={6}
                    />
                  </motion.div>

                  {/* Start Button */}
                  <motion.button
                    onClick={handleStartSolving}
                    style={styles.startButton}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 65, 0.6)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚀 Start Solving
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            // SOLVING MODE - 4 Panel Layout with Chat
            <motion.div
              key="solving-mode"
              style={styles.solvingMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={styles.solvingGrid}>
                {/* Left Side: Input/Output Display */}
                <div style={styles.leftColumn}>
                  {/* Question Title */}
                  <motion.div
                    style={styles.questionTitleBox}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 style={styles.questionTitleText}>📝 {questionTitle}</h3>
                  </motion.div>

                  {/* Input Table Display */}
                  <motion.div
                    style={styles.ioPanel}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div style={styles.ioPanelHeader}>
                      <span style={styles.ioPanelTitle}>📥 INPUT</span>
                    </div>
                    <div style={styles.ioContent}>
                      <pre style={styles.preText}>{inputTable}</pre>
                    </div>
                  </motion.div>

                  {/* Expected Output Display */}
                  <motion.div
                    style={styles.ioPanel}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div style={styles.ioPanelHeader}>
                      <span style={styles.ioPanelTitle}>📤 EXPECTED OUTPUT</span>
                    </div>
                    <div style={styles.ioContent}>
                      <pre style={styles.preText}>{expectedOutput}</pre>
                    </div>
                  </motion.div>

                  {/* Actual Output Display */}
                  {actualOutput && (
                    <motion.div
                      style={{
                        ...styles.ioPanel,
                        border: matchStatus === 'match'
                          ? '2px solid #00ff41'
                          : '2px solid #ff6b6b'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div style={styles.ioPanelHeader}>
                        <span style={styles.ioPanelTitle}>
                          {matchStatus === 'match' ? '✅ YOUR OUTPUT (MATCH!)' : '⚠️ YOUR OUTPUT (MISMATCH)'}
                        </span>
                      </div>
                      <div style={styles.ioContent}>
                        <div style={styles.tableWrapper}>
                          <table style={styles.resultTable}>
                            <thead>
                              <tr>
                                {Object.keys(actualOutput[0]).map((key) => (
                                  <th key={key} style={styles.resultTh}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {actualOutput.map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((value, colIdx) => (
                                    <td key={colIdx} style={styles.resultTd}>
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Side: Chat + SQL Editor */}
                <div style={styles.rightColumn}>
                  {/* Chat Panel */}
                  <motion.div
                    style={styles.chatPanel}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div style={styles.chatHeader}>
                      <span style={styles.chatHeaderTitle}>💬 AI ASSISTANT</span>
                    </div>
                    <div style={styles.chatMessages}>
                      {chatHistory.map((message, idx) => (
                        <motion.div
                          key={idx}
                          style={message.role === 'user' ? styles.userMessage : styles.aiMessage}
                          initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div style={styles.messageHeader}>
                            <span style={styles.messageIcon}>
                              {message.role === 'user' ? '👤' : '🤖'}
                            </span>
                            <span style={styles.messageRole}>
                              {message.role === 'user' ? 'You' : 'AI'}
                            </span>
                          </div>
                          <div style={styles.messageText}>{message.content}</div>
                        </motion.div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div style={styles.chatInputContainer}>
                      <input
                        type="text"
                        value={naturalLanguage}
                        onChange={(e) => setNaturalLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerateSQL()}
                        placeholder="Ask for help or hints..."
                        style={styles.chatInput}
                        disabled={isLoading}
                      />
                      <motion.button
                        onClick={handleGenerateSQL}
                        style={styles.chatSendButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                      >
                        {isLoading ? '⏳' : '💡'}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* SQL Editor Panel */}
                  <motion.div
                    style={styles.editorPanel}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div style={styles.editorHeader}>
                      <span style={styles.editorHeaderTitle}>⚡ YOUR SQL SOLUTION</span>
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
                    <div style={styles.editorContainer}>
                      <Editor
                        height="100%"
                        defaultLanguage="sql"
                        theme="vs-dark"
                        value={sqlQuery}
                        onChange={(value) => setSqlQuery(value || '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          fontFamily: '"Courier New", monospace',
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
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
  setupMode: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  setupWindow: {
    width: '100%',
    maxWidth: '900px',
    background: 'rgba(0, 20, 0, 0.9)',
    border: '2px solid #00ff41',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 0 40px rgba(0, 255, 65, 0.3)',
  },
  welcomeContainer: {
    textAlign: 'center',
    marginBottom: '40px',
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
    fontSize: '16px',
    opacity: 0.8,
    fontFamily: 'Arial, sans-serif',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ff41',
    fontFamily: 'Arial, sans-serif',
  },
  input: {
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    color: '#00ff41',
    fontSize: '15px',
    fontFamily: 'Arial, sans-serif',
  },
  textarea: {
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    color: '#00ff41',
    fontSize: '13px',
    fontFamily: '"Courier New", monospace',
    resize: 'vertical',
  },
  startButton: {
    padding: '18px 40px',
    background: '#00ff41',
    border: 'none',
    borderRadius: '15px',
    color: '#000',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    alignSelf: 'center',
    marginTop: '20px',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.5)',
  },
  solvingMode: {
    flex: 1,
    overflow: 'hidden',
  },
  solvingGrid: {
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '20px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    overflowY: 'auto',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  questionTitleBox: {
    background: 'rgba(0, 255, 65, 0.15)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    padding: '15px',
  },
  questionTitleText: {
    margin: 0,
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ff41',
  },
  ioPanel: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  ioPanelHeader: {
    padding: '12px 15px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
  },
  ioPanelTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  ioContent: {
    padding: '15px',
    maxHeight: '250px',
    overflowY: 'auto',
  },
  preText: {
    margin: 0,
    fontSize: '12px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    fontFamily: '"Courier New", monospace',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  resultTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  resultTh: {
    padding: '8px',
    textAlign: 'left',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
    fontWeight: 'bold',
  },
  resultTd: {
    padding: '8px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
    fontFamily: 'Arial, sans-serif',
  },
  chatPanel: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    height: '40%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '12px 15px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
  },
  chatHeaderTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    background: 'rgba(0, 255, 65, 0.15)',
    border: '1px solid #00ff41',
    borderRadius: '12px',
    padding: '12px',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    maxWidth: '75%',
    background: 'rgba(0, 100, 255, 0.15)',
    border: '1px solid #00bfff',
    borderRadius: '12px',
    padding: '12px',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  messageIcon: {
    fontSize: '16px',
  },
  messageRole: {
    fontSize: '11px',
    fontWeight: 'bold',
    opacity: 0.8,
    fontFamily: 'Arial, sans-serif',
  },
  messageText: {
    fontSize: '13px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
  },
  chatInputContainer: {
    padding: '12px',
    borderTop: '2px solid #00ff41',
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #00ff41',
    borderRadius: '8px',
    color: '#00ff41',
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
  },
  chatSendButton: {
    padding: '12px 20px',
    background: '#00ff41',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  editorPanel: {
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  editorHeader: {
    padding: '12px 15px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorHeaderTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
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
  editorContainer: {
    flex: 1,
  },
};
