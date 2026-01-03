import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ThreeDEnvironment from './ThreeDEnvironment';
import { API_BASE_URL } from './config';

export default function ProblemSolving({ isOpen, onClose }) {
  const [currentScreen, setCurrentScreen] = useState('input'); // 'input', 'processing'
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [matrixColumns, setMatrixColumns] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);

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
    const chars = '01SOLVE PROBLEM αβγδ⚡';
    const columnHeight = 20;
    return Array.from({ length: columnHeight }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    );
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError('Please enter your problem description');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCurrentScreen('processing');

    try {
      // Call Gemini API to parse and create BigQuery table
      const response = await axios.post(`${API_BASE_URL}/sql-playground/parse`, {
        questionText: userInput
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
      } else {
        setError(response.data.error || 'Failed to process your input');
        // KEEP showing 3D environment even on error
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to process your input');
      // KEEP showing 3D environment even on error
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentScreen('input');
    setUserInput('');
    setParsedData(null);
    setError(null);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setUserMessage('');
    setIsAITyping(true);
    setIsSpeaking(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/neocortex/chat`, {
        message: userMessage,
        conversationId: conversationId
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: response.data.response,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, aiMessage]);
        setConversationId(response.data.conversationId);

        // Simulate speaking duration
        setTimeout(() => {
          setIsSpeaking(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Sorry, I couldn\'t process that. Try again!',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setIsSpeaking(false);
    } finally {
      setIsAITyping(false);
    }
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
            10% { opacity: 0.25; }
            90% { opacity: 0.25; }
            100% { transform: translateY(100vh); opacity: 0; }
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }

          @keyframes textChange {
            0%, 45% { opacity: 1; }
            50% { opacity: 0; }
            55%, 100% { opacity: 1; }
          }

          .matrix-column {
            animation: matrixRain linear infinite;
          }

          .pulse-glow {
            animation: pulse 2s ease-in-out infinite;
          }

          /* Force Three.js Canvas to fill container */
          canvas {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Typing indicator animation */
          @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
          }

          .typingIndicator span:nth-child(1) {
            animation: typingDot 1.4s infinite;
          }
          .typingIndicator span:nth-child(2) {
            animation: typingDot 1.4s infinite 0.2s;
          }
          .typingIndicator span:nth-child(3) {
            animation: typingDot 1.4s infinite 0.4s;
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
                <motion.span
                  style={styles.titleIcon}
                  animate={{
                    textShadow: [
                      '0 0 10px #00ff41',
                      '0 0 20px #00ff41',
                      '0 0 30px #00ff41',
                      '0 0 20px #00ff41',
                      '0 0 10px #00ff41'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ⚡
                </motion.span>
                <h2 style={styles.title}>PROBLEM SOLVING</h2>
              </div>
              <motion.button
                onClick={onClose}
                style={styles.closeButton}
                whileHover={{ scale: 1.1, rotate: 90, boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>
            <p style={styles.subtitle}>AI-Powered Problem Analysis & BigQuery Integration</p>
          </motion.div>

          {/* Main Content */}
          <div style={styles.content}>
            <AnimatePresence mode="wait">
              {/* Input Screen */}
              {currentScreen === 'input' && (
                <motion.div
                  key="input"
                  style={styles.screenContainer}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={styles.inputSection}>
                    <motion.h3
                      style={styles.sectionTitle}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      DESCRIBE YOUR PROBLEM
                    </motion.h3>

                    <motion.p
                      style={styles.sectionDescription}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Enter your problem in natural language. AI will analyze it and create the necessary BigQuery tables.
                    </motion.p>

                    <motion.textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Example: Create a table with the following data:&#10;&#10;Table: sales_data&#10;Columns: product, category, price, quantity&#10;Data:&#10;Laptop, Electronics, 1200, 5&#10;Phone, Electronics, 800, 10&#10;&#10;I need to analyze total revenue..."
                      style={styles.textarea}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      disabled={isProcessing}
                    />

                    {error && (
                      <motion.div
                        style={styles.errorBox}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        ❌ {error}
                      </motion.div>
                    )}

                    <motion.div
                      style={styles.buttonContainer}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        style={{
                          ...styles.submitButton,
                          opacity: isProcessing ? 0.6 : 1,
                          cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                        whileHover={!isProcessing ? {
                          scale: 1.05,
                          boxShadow: '0 0 30px rgba(0, 255, 65, 0.6)',
                          background: '#00ff41',
                          color: '#000'
                        } : {}}
                        whileTap={!isProcessing ? { scale: 0.95 } : {}}
                      >
                        {isProcessing ? '⚡ PROCESSING...' : '🚀 ANALYZE & SOLVE'}
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Processing Screen */}
              {currentScreen === 'processing' && (
                <motion.div
                  key="processing"
                  style={styles.screenContainer}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* 3D Environment - Full Screen with Character */}
                  <div style={styles.threeDContainer}>
                    <ThreeDEnvironment isActive={true} isSpeaking={isSpeaking} />
                  </div>

                  {/* UI Buttons Hidden - Clean 3D interaction space */}

                  {/* Chat Interface */}
                  <AnimatePresence>
                    {showChat && (
                      <motion.div
                        style={styles.chatPanel}
                        initial={{ opacity: 0, x: 400 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 400 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      >
                        <div style={styles.chatHeader}>
                          <span style={styles.chatTitle}>🍜 SAGE NARUTO AI</span>
                          <button
                            onClick={() => setShowChat(false)}
                            style={styles.chatClose}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div style={styles.chatMessages}>
                          {chatMessages.length === 0 && (
                            <div style={styles.welcomeMessage}>
                              <p style={styles.welcomeText}>👋 Hey! I'm Naruto!</p>
                              <p style={styles.welcomeSubtext}>Ask me anything about ninjutsu, ramen, or life! Believe it! 🍜</p>
                            </div>
                          )}

                          {chatMessages.map(msg => (
                            <motion.div
                              key={msg.id}
                              style={msg.type === 'user' ? styles.userMessage : styles.aiMessage}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div style={styles.messageContent}>{msg.text}</div>
                            </motion.div>
                          ))}

                          {isAITyping && (
                            <motion.div
                              style={styles.aiMessage}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div style={styles.typingIndicator} className="typingIndicator">
                                <span>●</span>
                                <span>●</span>
                                <span>●</span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Chat Input */}
                        <div style={styles.chatInputContainer}>
                          <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            style={styles.chatInput}
                            disabled={isAITyping}
                          />
                          <motion.button
                            onClick={handleSendMessage}
                            disabled={!userMessage.trim() || isAITyping}
                            style={{
                              ...styles.sendButton,
                              opacity: (!userMessage.trim() || isAITyping) ? 0.5 : 1
                            }}
                            whileHover={!isAITyping ? { scale: 1.05 } : {}}
                            whileTap={!isAITyping ? { scale: 0.95 } : {}}
                          >
                            ➤
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading indicator - subtle */}
                  {isProcessing && (
                    <motion.div
                      style={styles.loadingIndicator}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        style={styles.loadingDot}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        ⚡
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Success Result - Only show when done processing */}
                  {parsedData && !isProcessing && (
                    <motion.div
                      style={styles.successBox}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 style={styles.successTitle}>✅ TABLE CREATED SUCCESSFULLY</h3>
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
                        onClick={handleReset}
                        style={styles.resetButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🔄 NEW PROBLEM
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
    background: 'rgba(0, 0, 0, 0.90)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(8px)',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    height: '85vh',
    background: 'rgba(0, 0, 0, 0.95)',
    border: '3px solid #00ff41',
    borderRadius: '15px',
    boxShadow: '0 0 60px rgba(0, 255, 65, 0.4), inset 0 0 60px rgba(0, 255, 65, 0.08)',
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
    opacity: 0.12,
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
  header: {
    position: 'relative',
    zIndex: 2,
    padding: '25px 30px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.05)',
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
    fontSize: '36px',
    color: '#00ff41',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#00ff41',
    textShadow: '0 0 20px #00ff41',
    letterSpacing: '4px',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#00ff41',
    opacity: 0.8,
  },
  closeButton: {
    width: '40px',
    height: '40px',
    background: 'transparent',
    border: '2px solid #ff0000',
    borderRadius: '50%',
    color: '#ff0000',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    overflow: 'hidden',
  },
  screenContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
  },
  threeDContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  inputSection: {
    width: '100%',
    maxWidth: '800px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#00ff41',
    textAlign: 'center',
    marginBottom: '15px',
    letterSpacing: '3px',
    textShadow: '0 0 15px #00ff41',
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#00ff41',
    textAlign: 'center',
    marginBottom: '30px',
    opacity: 0.8,
    lineHeight: '1.6',
  },
  textarea: {
    width: '100%',
    height: '300px',
    padding: '20px',
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    color: '#00ff41',
    fontSize: '14px',
    fontFamily: '"Courier New", monospace',
    resize: 'vertical',
    lineHeight: '1.6',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.05)',
  },
  buttonContainer: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'center',
  },
  submitButton: {
    padding: '18px 50px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    borderRadius: '10px',
    letterSpacing: '2px',
    border: '2px solid #00ff41',
    background: 'transparent',
    color: '#00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  errorBox: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(20, 0, 0, 0.95)',
    border: '2px solid #ff0000',
    borderRadius: '8px',
    color: '#ff6b6b',
    fontSize: '14px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 0 30px rgba(255, 0, 0, 0.4)',
  },
  helperWindow: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '300px',
    background: 'rgba(0, 20, 0, 0.95)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    boxShadow: '0 0 30px rgba(0, 255, 65, 0.5)',
    overflow: 'hidden',
    zIndex: 10,
  },
  helperHeader: {
    padding: '15px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  helperIcon: {
    fontSize: '24px',
  },
  helperTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ff41',
    letterSpacing: '2px',
  },
  helperBody: {
    padding: '20px',
  },
  helperText: {
    fontSize: '16px',
    color: '#00ff41',
    textAlign: 'center',
    lineHeight: '1.6',
    fontStyle: 'italic',
  },
  userInputDisplay: {
    width: '100%',
    maxWidth: '700px',
    marginTop: '100px',
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },
  displayHeader: {
    padding: '15px 20px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
  },
  displayLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#00ff41',
    letterSpacing: '2px',
  },
  displayContent: {
    padding: '20px',
    color: '#00ff41',
    fontSize: '14px',
    lineHeight: '1.6',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  processingBox: {
    marginTop: '30px',
    padding: '20px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
  },
  processingText: {
    fontSize: '14px',
    color: '#00ff41',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  successBox: {
    width: '100%',
    maxWidth: '600px',
    marginTop: '30px',
    padding: '25px',
    background: 'rgba(0, 20, 0, 0.95)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 0 40px rgba(0, 255, 65, 0.4)',
  },
  successTitle: {
    color: '#00ff41',
    margin: '0 0 20px 0',
    fontSize: '18px',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  dataInfo: {
    marginBottom: '20px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
  },
  infoLabel: {
    color: '#00ff41',
    fontWeight: 'bold',
  },
  infoValue: {
    color: '#ffffff',
  },
  schemaSection: {
    marginBottom: '20px',
  },
  schemaTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ff41',
    marginBottom: '10px',
  },
  schemaList: {
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '13px',
    color: '#00ff41',
  },
  schemaItem: {
    marginBottom: '6px',
  },
  schemaType: {
    color: '#00bfff',
  },
  resetButton: {
    width: '100%',
    padding: '15px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    borderRadius: '8px',
    letterSpacing: '2px',
    border: '2px solid #00ff41',
    background: '#00ff41',
    color: '#000',
  },
  errorResetButton: {
    marginTop: '15px',
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    borderRadius: '6px',
    border: '2px solid #ff0000',
    background: 'transparent',
    color: '#ff0000',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(transparent, #00ff41, transparent)',
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 3,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
  },
  loadingDot: {
    fontSize: '48px',
    color: '#00ff41',
    textShadow: '0 0 20px #00ff41',
  },
  voiceButton: {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '3px solid #00ff41',
    color: '#00ff41',
    fontSize: '36px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  chatToggle: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '12px 24px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '2px solid #00ff41',
    borderRadius: '8px',
    color: '#00ff41',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: '"Courier New", monospace',
    cursor: 'pointer',
    zIndex: 20,
    letterSpacing: '1px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
  },
  chatPanel: {
    position: 'absolute',
    top: '70px',
    right: '20px',
    width: '400px',
    height: 'calc(100% - 100px)',
    background: 'rgba(0, 0, 0, 0.95)',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    boxShadow: '0 0 40px rgba(0, 255, 65, 0.5)',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '15px 20px',
    borderBottom: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#00ff41',
    letterSpacing: '2px',
  },
  chatClose: {
    width: '30px',
    height: '30px',
    background: 'transparent',
    border: '2px solid #ff0000',
    borderRadius: '50%',
    color: '#ff0000',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  welcomeMessage: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  welcomeText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#00ff41',
    marginBottom: '10px',
  },
  welcomeSubtext: {
    fontSize: '14px',
    color: '#00ff41',
    opacity: 0.7,
    lineHeight: '1.6',
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '70%',
    padding: '12px 16px',
    background: 'rgba(0, 255, 65, 0.2)',
    border: '1px solid #00ff41',
    borderRadius: '12px 12px 0 12px',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    maxWidth: '70%',
    padding: '12px 16px',
    background: 'rgba(0, 100, 30, 0.3)',
    border: '1px solid #00cc33',
    borderRadius: '12px 12px 12px 0',
  },
  messageContent: {
    fontSize: '14px',
    color: '#00ff41',
    lineHeight: '1.6',
    fontFamily: '"Courier New", monospace',
  },
  typingIndicator: {
    display: 'flex',
    gap: '5px',
    fontSize: '20px',
    color: '#00ff41',
  },
  chatInputContainer: {
    padding: '15px',
    borderTop: '2px solid #00ff41',
    background: 'rgba(0, 255, 65, 0.05)',
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '12px 15px',
    background: 'rgba(0, 20, 0, 0.8)',
    border: '2px solid #00ff41',
    borderRadius: '8px',
    color: '#00ff41',
    fontSize: '14px',
    fontFamily: '"Courier New", monospace',
    outline: 'none',
  },
  sendButton: {
    width: '50px',
    height: '46px',
    background: '#00ff41',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
