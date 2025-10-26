import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import codingQuestions from './data/codingQuestions.json';
import NarutoCharacter from './NarutoCharacter';

export default function AICodingChallenge({ onBackToHome }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [hintLevel, setHintLevel] = useState(1);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [xp, setXp] = useState(0);
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentQuestion = codingQuestions[currentQuestionIndex];

  // Initialize code with starter code when question changes
  useEffect(() => {
    setCode(currentQuestion.starterCode);
    setTestResults([]);
    setAiHint('');
    setHintLevel(1);
  }, [currentQuestionIndex]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      if (currentQuestion.language === 'sql') {
        // Run SQL query against BigQuery
        await runSQLTests();
      } else if (currentQuestion.language === 'python') {
        // Run Python code tests
        await runPythonTests();
      }
    } catch (error) {
      console.error('Error running code:', error);
      setTestResults([{
        id: 'error',
        name: 'Execution Error',
        passed: false,
        message: error.message
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runSQLTests = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/bigquery/query', {
        query: code
      });

      if (response.data.success) {
        // Check if query returned results
        const results = [{
          id: 1,
          name: 'Query Execution',
          passed: true,
          message: `Success! Returned ${response.data.rows?.length || 0} rows`,
          data: response.data.rows
        }];

        setTestResults(results);

        // Award XP if all tests passed
        if (results.every(r => r.passed)) {
          awardXP(currentQuestion.xpReward);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      }
    } catch (error) {
      setTestResults([{
        id: 'error',
        name: 'SQL Error',
        passed: false,
        message: error.response?.data?.error || error.message
      }]);
    }
  };

  const runPythonTests = async () => {
    // Simulate running Python tests locally
    // In production, you'd send this to a backend code execution service
    const results = currentQuestion.testCases.map((testCase, index) => {
      try {
        // Extract function name from starter code
        const funcMatch = code.match(/def\s+(\w+)\s*\(/);
        if (!funcMatch) {
          return {
            id: testCase.id,
            name: `Test ${index + 1}`,
            passed: false,
            message: 'No function definition found'
          };
        }

        // For demo purposes, we'll check if the code looks complete
        const hasReturnStatement = code.includes('return');
        const hasLogic = code.split('\n').length > 5;

        if (!hasReturnStatement || !hasLogic) {
          return {
            id: testCase.id,
            name: testCase.description || `Test ${index + 1}`,
            passed: false,
            message: 'Function appears incomplete',
            input: testCase.input,
            expected: testCase.expected
          };
        }

        // Simulate test passing for demo
        // In production, use a sandboxed code execution environment
        return {
          id: testCase.id,
          name: testCase.description || `Test ${index + 1}`,
          passed: true,
          message: '✓ Test passed',
          input: testCase.input,
          expected: testCase.expected
        };

      } catch (error) {
        return {
          id: testCase.id,
          name: `Test ${index + 1}`,
          passed: false,
          message: error.message
        };
      }
    });

    setTestResults(results);

    // Award XP if all tests passed
    if (results.every(r => r.passed)) {
      awardXP(currentQuestion.xpReward);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const awardXP = (xpAmount) => {
    setXp(prev => prev + xpAmount);
    setQuestionsSolved(prev => prev + 1);
  };

  const handleGetHint = async () => {
    setIsLoadingHint(true);
    try {
      const response = await axios.post('http://localhost:5001/api/gemini/hint', {
        questionTitle: currentQuestion.title,
        questionDescription: currentQuestion.description,
        userCode: code,
        hintLevel: hintLevel
      });

      if (response.data.success) {
        setAiHint(response.data.hint);
        setShowAIAssistant(true);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setAiHint('Sorry, I couldn\'t get a hint right now. Please try again.');
      setShowAIAssistant(true);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleExplainConcept = async (topic) => {
    setIsLoadingHint(true);
    try {
      const response = await axios.post('http://localhost:5001/api/gemini/explain', {
        topic: topic,
        questionContext: currentQuestion.description
      });

      if (response.data.success) {
        setAiHint(response.data.explanation);
        setShowAIAssistant(true);
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
      setAiHint('Sorry, I couldn\'t explain that right now.');
      setShowAIAssistant(true);
    } finally {
      setIsLoadingHint(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToHome}
          style={styles.backButton}
        >
          ← Back to Home
        </motion.button>
        <h1 style={styles.headerTitle}>AI Coding Challenge</h1>
        <div style={styles.questionNav}>
          {codingQuestions.map((q, idx) => (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentQuestionIndex(idx)}
              style={{
                ...styles.questionNavButton,
                ...(idx === currentQuestionIndex ? styles.questionNavButtonActive : {})
              }}
            >
              Q{idx + 1}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Left Panel - Question Description */}
        <div style={styles.leftPanel}>
          <div style={styles.questionHeader}>
            <h2 style={styles.questionTitle}>{currentQuestion.title}</h2>
            <span style={{
              ...styles.difficultyBadge,
              ...(currentQuestion.difficulty === 'Easy' ? styles.difficultyEasy :
                  currentQuestion.difficulty === 'Medium' ? styles.difficultyMedium :
                  styles.difficultyHard)
            }}>
              {currentQuestion.difficulty}
            </span>
            <span style={styles.xpBadge}>+{currentQuestion.xpReward} XP</span>
          </div>

          <div style={styles.questionContent}>
            <pre style={styles.questionDescription}>{currentQuestion.description}</pre>

            <div style={styles.tagsContainer}>
              {currentQuestion.tags.map(tag => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>

            <div style={styles.hintsSection}>
              <h3 style={styles.sectionTitle}>💡 Built-in Hints:</h3>
              {currentQuestion.hints.map((hint, idx) => (
                <details key={idx} style={styles.hintDetails}>
                  <summary style={styles.hintSummary}>Hint {idx + 1}</summary>
                  <p style={styles.hintText}>{hint}</p>
                </details>
              ))}
            </div>

            <div style={styles.aiHintSection}>
              <h3 style={styles.sectionTitle}>🤖 AI Assistant:</h3>
              <div style={styles.aiButtons}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetHint}
                  disabled={isLoadingHint}
                  style={styles.aiButton}
                >
                  {isLoadingHint ? '⏳ Loading...' : `Get Hint (Level ${hintLevel})`}
                </motion.button>
                <select
                  value={hintLevel}
                  onChange={(e) => setHintLevel(Number(e.target.value))}
                  style={styles.hintLevelSelect}
                >
                  <option value={1}>Gentle</option>
                  <option value={2}>Specific</option>
                  <option value={3}>Detailed</option>
                </select>
              </div>
              {currentQuestion.tags.slice(0, 3).map(tag => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExplainConcept(tag)}
                  style={styles.explainButton}
                >
                  Explain: {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Editor and Results */}
        <div style={styles.rightPanel}>
          {/* Code Editor */}
          <div style={styles.editorContainer}>
            <div style={styles.editorHeader}>
              <span style={styles.editorTitle}>
                {currentQuestion.language === 'sql' ? '📊 SQL Editor' : '🐍 Python Editor'}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRunCode}
                disabled={isRunning}
                style={styles.runButton}
              >
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </motion.button>
            </div>
            <Editor
              height="350px"
              language={currentQuestion.language === 'sql' ? 'sql' : 'python'}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Results */}
          <div style={styles.resultsContainer}>
            <h3 style={styles.resultsTitle}>📋 Test Results</h3>
            <div style={styles.resultsContent}>
              {testResults.length === 0 ? (
                <p style={styles.noResults}>Run your code to see results...</p>
              ) : (
                testResults.map((result, idx) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                      ...styles.testResult,
                      ...(result.passed ? styles.testPassed : styles.testFailed)
                    }}
                  >
                    <div style={styles.testResultHeader}>
                      <span>{result.passed ? '✓' : '✗'} {result.name}</span>
                    </div>
                    <p style={styles.testResultMessage}>{result.message}</p>
                    {result.input !== undefined && (
                      <div style={styles.testDetails}>
                        <span>Input: {JSON.stringify(result.input)}</span>
                        <span>Expected: {JSON.stringify(result.expected)}</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Character Progress */}
          <div style={styles.characterContainer}>
            <NarutoCharacter xp={xp} questionsSolved={questionsSolved} />
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAIAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowAIAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3>🤖 AI Assistant</h3>
                <button onClick={() => setShowAIAssistant(false)} style={styles.closeButton}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <pre style={styles.aiHintText}>{aiHint}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={styles.successNotification}
          >
            🎉 All tests passed! +{currentQuestion.xpReward} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#00ff41',
    fontFamily: 'Courier New, monospace',
  },
  header: {
    padding: '15px 20px',
    background: 'rgba(0,0,0,0.8)',
    borderBottom: '2px solid #00ff41',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  backButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '2px solid #00ff41',
    color: '#00ff41',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontSize: '14px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    flex: 1,
    textAlign: 'center',
    textShadow: '0 0 10px #00ff41',
  },
  questionNav: {
    display: 'flex',
    gap: '10px',
  },
  questionNavButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: '2px solid #444',
    color: '#888',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
  },
  questionNavButtonActive: {
    border: '2px solid #00ff41',
    color: '#00ff41',
    background: 'rgba(0,255,65,0.1)',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '0',
    height: 'calc(100vh - 70px)',
  },
  leftPanel: {
    background: '#111',
    borderRight: '2px solid #00ff41',
    overflowY: 'auto',
    padding: '20px',
  },
  questionHeader: {
    marginBottom: '20px',
  },
  questionTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    color: '#00ff41',
  },
  difficultyBadge: {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  difficultyEasy: {
    background: '#00ff41',
    color: '#000',
  },
  difficultyMedium: {
    background: '#ffa500',
    color: '#000',
  },
  difficultyHard: {
    background: '#ff4444',
    color: '#fff',
  },
  xpBadge: {
    padding: '4px 12px',
    background: '#ffd700',
    color: '#000',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  questionContent: {
    fontSize: '13px',
    lineHeight: '1.6',
  },
  questionDescription: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'Courier New, monospace',
    fontSize: '13px',
    marginBottom: '20px',
  },
  tagsContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  tag: {
    padding: '4px 10px',
    background: 'rgba(0,255,65,0.2)',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    fontSize: '11px',
  },
  hintsSection: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    marginBottom: '10px',
    color: '#00bfff',
  },
  hintDetails: {
    marginBottom: '8px',
    cursor: 'pointer',
  },
  hintSummary: {
    padding: '8px',
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid #00ff41',
    cursor: 'pointer',
    fontSize: '12px',
  },
  hintText: {
    padding: '10px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid #00ff41',
    borderTop: 'none',
    fontSize: '12px',
    margin: 0,
  },
  aiHintSection: {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0,191,255,0.1)',
    border: '2px solid #00bfff',
    borderRadius: '8px',
  },
  aiButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  aiButton: {
    flex: 1,
    padding: '10px',
    background: '#00bfff',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  hintLevelSelect: {
    padding: '10px',
    background: '#222',
    color: '#00ff41',
    border: '2px solid #00bfff',
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
  },
  explainButton: {
    padding: '8px 12px',
    background: 'transparent',
    color: '#00bfff',
    border: '1px solid #00bfff',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontSize: '11px',
    marginRight: '8px',
    marginTop: '8px',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0a',
  },
  editorContainer: {
    flex: '0 0 400px',
    borderBottom: '2px solid #00ff41',
  },
  editorHeader: {
    padding: '10px 15px',
    background: '#1e1e1e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
  },
  editorTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  runButton: {
    padding: '8px 20px',
    background: '#00ff41',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  resultsContainer: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
  },
  resultsTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    color: '#00bfff',
  },
  resultsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  noResults: {
    color: '#666',
    fontStyle: 'italic',
  },
  testResult: {
    padding: '12px',
    border: '2px solid',
    borderRadius: '4px',
  },
  testPassed: {
    borderColor: '#00ff41',
    background: 'rgba(0,255,65,0.1)',
  },
  testFailed: {
    borderColor: '#ff4444',
    background: 'rgba(255,68,68,0.1)',
  },
  testResultHeader: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  testResultMessage: {
    margin: '5px 0',
    fontSize: '12px',
  },
  testDetails: {
    fontSize: '11px',
    color: '#888',
    marginTop: '5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  characterContainer: {
    borderTop: '2px solid #00ff41',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: '600px',
    background: '#111',
    border: '2px solid #00bfff',
    borderRadius: '8px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '15px 20px',
    borderBottom: '2px solid #00bfff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#00bfff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '30px',
    height: '30px',
  },
  modalBody: {
    padding: '20px',
    overflowY: 'auto',
  },
  aiHintText: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'Courier New, monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#00ff41',
  },
  successNotification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    background: '#00ff41',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0,255,65,0.5)',
    zIndex: 2000,
  },
};
