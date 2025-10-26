import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import NarutoCharacter from './NarutoCharacter';

const API_BASE_URL = 'http://localhost:5001/api';

export default function SQLInterviewV2({ onBackToHome }) {
  const [mode, setMode] = useState('chat');
  const [sqlQuery, setSqlQuery] = useState('');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [queryResults, setQueryResults] = useState(null);
  const [queryMetadata, setQueryMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);

  const [windows, setWindows] = useState([
    { id: 'problem', title: '📋 Problem Description', x: 50, y: 100, width: 450, height: 600, minimized: false, zIndex: 1 },
    { id: 'editor', title: '⚡ Most Powerful SQL Editor in the World', x: 520, y: 100, width: 750, height: 600, minimized: false, zIndex: 2 },
    { id: 'results', title: '✨ Query Results & Test Cases', x: 50, y: 720, width: 850, height: 300, minimized: false, zIndex: 3 },
    { id: 'info', title: '🍜 Naruto\'s Training Progress', x: 920, y: 720, width: 350, height: 600, minimized: false, zIndex: 4 }
  ]);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);

  const [matrixColumns, setMatrixColumns] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const columns = [];
    const columnCount = Math.floor(window.innerWidth / 25);
    for (let i = 0; i < columnCount; i++) {
      columns.push({
        id: i,
        characters: Array.from({ length: 20 }, () => '01SELECT*FROMWHEREαβγδ'[Math.floor(Math.random() * 23)]),
        left: `${(i / columnCount) * 100}%`,
        animationDelay: Math.random() * 5,
        duration: 15 + Math.random() * 10
      });
    }
    setMatrixColumns(columns);
  }, []);

  const handleGenerateSQL = async () => {
    if (!naturalLanguage.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const userMessage = { role: 'user', content: naturalLanguage };
      setChatHistory(prev => [...prev, userMessage]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const generatedSQL = `-- Generated SQL for: "${naturalLanguage}"\nSELECT \n  column1,\n  column2,\n  COUNT(*) as total\nFROM \`project.dataset.table\`\nWHERE condition = true\nGROUP BY column1, column2\nORDER BY total DESC\nLIMIT 10;`;

      setSqlQuery(generatedSQL);

      const aiMessage = {
        role: 'assistant',
        content: `I've generated the SQL query for you! The query will ${naturalLanguage.toLowerCase()}.`
      };
      setChatHistory(prev => [...prev, aiMessage]);

      setTimeout(() => {
        setMode('floating');
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
        // Increment questions completed on successful query
        setQuestionsCompleted(prev => prev + 1);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute query');
      console.error('Error running query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
  };

  const toggleMinimize = (id) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging && !isLayoutLocked) {
        setWindows(prev => prev.map(w =>
          w.id === dragging.id
            ? { ...w, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY }
            : w
        ));
      }
      if (resizing && !isLayoutLocked) {
        const win = windows.find(w => w.id === resizing.id);
        const newWidth = Math.max(200, e.clientX - win.x);
        const newHeight = Math.max(150, e.clientY - win.y);
        setWindows(prev => prev.map(w =>
          w.id === resizing.id ? { ...w, width: newWidth, height: newHeight } : w
        ));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
    };

    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, resizing, windows, isLayoutLocked]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const renderWindowContent = (windowId) => {
    switch (windowId) {
      case 'problem':
        return (
          <div style={{ height: '100%', overflowY: 'auto', padding: '20px' }}>
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#00bfff'
                }}>
                  176. Second Highest Salary
                </h2>
                <span style={{
                  padding: '3px 10px',
                  background: 'rgba(255, 193, 7, 0.2)',
                  border: '1px solid #ffc107',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#ffc107'
                }}>
                  Medium
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#00bfff',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Problem Description
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                opacity: 0.9,
                fontFamily: 'Arial, sans-serif'
              }}>
                Write a solution to find the second highest salary from the <code style={{
                  background: 'rgba(0, 191, 255, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '13px'
                }}>Employee</code> table. If there is no second highest salary, return <code style={{
                  background: 'rgba(0, 191, 255, 0.2)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '13px'
                }}>null</code>.
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#00bfff',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Table Schema
              </h3>
              <div style={{
                background: 'rgba(0, 191, 255, 0.05)',
                border: '1px solid #00bfff',
                borderRadius: '8px',
                padding: '15px',
                fontFamily: '"Courier New", monospace'
              }}>
                <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>Employee</div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #00bfff' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Column Name</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', opacity: 0.9 }}>id</td>
                      <td style={{ padding: '8px', opacity: 0.7 }}>int</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', opacity: 0.9 }}>salary</td>
                      <td style={{ padding: '8px', opacity: 0.7 }}>int</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ fontSize: '11px', marginTop: '10px', opacity: 0.6 }}>
                  id is the primary key (column with unique values) for this table.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#00bfff',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Example 1
              </h3>
              <div style={{
                background: 'rgba(0, 191, 255, 0.05)',
                border: '1px solid #00bfff',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Input:</div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: '"Courier New", monospace'
                  }}>
                    <div style={{ marginBottom: '5px', opacity: 0.8 }}>Employee table:</div>
                    <table style={{ width: '100%', fontSize: '11px', marginTop: '8px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #00bfff' }}>id</th>
                          <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #00bfff' }}>salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ padding: '5px' }}>1</td><td style={{ padding: '5px' }}>100</td></tr>
                        <tr><td style={{ padding: '5px' }}>2</td><td style={{ padding: '5px' }}>200</td></tr>
                        <tr><td style={{ padding: '5px' }}>3</td><td style={{ padding: '5px' }}>300</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Output:</div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: '"Courier New", monospace'
                  }}>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #00bfff' }}>SecondHighestSalary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ padding: '5px' }}>200</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#00bfff',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Example 2
              </h3>
              <div style={{
                background: 'rgba(0, 191, 255, 0.05)',
                border: '1px solid #00bfff',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Input:</div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: '"Courier New", monospace'
                  }}>
                    <div style={{ marginBottom: '5px', opacity: 0.8 }}>Employee table:</div>
                    <table style={{ width: '100%', fontSize: '11px', marginTop: '8px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #00bfff' }}>id</th>
                          <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #00bfff' }}>salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ padding: '5px' }}>1</td><td style={{ padding: '5px' }}>100</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Output:</div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: '"Courier New", monospace'
                  }}>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #00bfff' }}>SecondHighestSalary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ padding: '5px' }}>null</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'editor':
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '12px 15px',
              borderBottom: '2px solid #00bfff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0, 191, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  fontFamily: 'Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Write your solution
                </span>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  background: 'rgba(0, 191, 255, 0.2)',
                  border: '1px solid #00bfff',
                  borderRadius: '10px',
                  opacity: 0.8
                }}>
                  BigQuery SQL
                </span>
              </div>
              <button
                onClick={handleRunQuery}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  background: isLoading ? 'rgba(0, 191, 255, 0.5)' : '#00bfff',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  boxShadow: isLoading ? 'none' : '0 0 15px rgba(0, 191, 255, 0.5)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? '⏳ Running...' : '▶ Run Query'}
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              {!sqlQuery && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 1,
                  pointerEvents: 'none',
                  opacity: 0.4
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚡</div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#00bfff'
                  }}>
                    Start typing your SQL solution
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Use Ctrl+Space for autocomplete
                  </div>
                </div>
              )}
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sqlQuery}
                onChange={(value) => setSqlQuery(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>
        );

      case 'results':
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '10px 15px',
              borderBottom: '2px solid #00bfff',
              background: 'rgba(0, 191, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '11px',
                opacity: 0.7,
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Query Output
              </span>
              {queryResults && (
                <span style={{
                  fontSize: '10px',
                  padding: '3px 10px',
                  background: 'rgba(0, 255, 100, 0.2)',
                  border: '1px solid #00ff64',
                  borderRadius: '12px',
                  color: '#00ff64',
                  fontWeight: 'bold'
                }}>
                  ✓ {queryResults.length} {queryResults.length === 1 ? 'row' : 'rows'}
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {!queryResults && !error && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  opacity: 0.4
                }}>
                  <div style={{ fontSize: '42px', marginBottom: '15px' }}>✨</div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Run your query to see results
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'Arial, sans-serif' }}>
                    Test cases will appear here
                  </div>
                </div>
              )}
              {error && (
                <div style={{
                  background: 'rgba(255, 0, 0, 0.15)',
                  border: '2px solid #ff4444',
                  borderRadius: '8px',
                  padding: '15px',
                  color: '#ff6b6b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>❌</span>
                    <strong style={{ fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>Query Failed</strong>
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif', opacity: 0.9 }}>
                    {error}
                  </div>
                </div>
              )}
              {queryResults && queryResults.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {Object.keys(queryResults[0]).map((key) => (
                          <th key={key} style={{
                            padding: '10px',
                            textAlign: 'left',
                            borderBottom: '2px solid #00bfff',
                            background: 'rgba(0, 191, 255, 0.15)',
                            fontWeight: 'bold',
                            position: 'sticky',
                            top: 0
                          }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, idx) => (
                        <tr key={idx} style={{
                          background: idx % 2 === 0 ? 'rgba(0, 191, 255, 0.05)' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}>
                          {Object.values(row).map((value, colIdx) => (
                            <td key={colIdx} style={{
                              padding: '8px 10px',
                              borderBottom: '1px solid rgba(0, 191, 255, 0.2)',
                              fontFamily: '"Courier New", monospace'
                            }}>
                              {value !== null && value !== undefined ? String(value) : <span style={{ opacity: 0.5, fontStyle: 'italic' }}>NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'info':
        return <NarutoCharacter questionsCompleted={questionsCompleted} />;

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#00bfff',
      fontFamily: '"Courier New", monospace',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .matrix-column { animation: matrixRain linear infinite; }
        input:focus, textarea:focus {
          outline: none;
          border-color: #00bfff !important;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.4) !important;
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.5); }
        ::-webkit-scrollbar-thumb { background: #00bfff; border-radius: 4px; }
      `}</style>

      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        opacity: 0.1
      }}>
        {matrixColumns.map((column) => (
          <div
            key={column.id}
            className="matrix-column"
            style={{
              position: 'absolute',
              top: '-100%',
              fontSize: '12px',
              color: '#00bfff',
              lineHeight: '16px',
              fontWeight: 'bold',
              left: column.left,
              animationDelay: `${column.animationDelay}s`,
              animationDuration: `${column.duration}s`
            }}
          >
            {column.characters.map((char, idx) => <div key={idx}>{char}</div>)}
          </div>
        ))}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '20px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '20px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {onBackToHome && (
              <motion.button
                onClick={onBackToHome}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '2px solid #00bfff',
                  borderRadius: '5px',
                  color: '#00bfff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← BACK
              </motion.button>
            )}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0 0 5px 0',
                textShadow: '0 0 15px #00bfff',
                letterSpacing: '2px'
              }}>
                <span style={{ color: '#00bfff' }}>VERSE</span>AI INTERVIEW PREP
              </h1>
              <p style={{
                fontSize: '14px',
                opacity: 0.7,
                margin: 0,
                fontFamily: 'Arial, sans-serif'
              }}>
                Practice SQL interview questions with instant feedback
              </p>
            </div>
            <div style={{ width: '80px' }} />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'chat' ? (
            <motion.div
              key="chat-mode"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{
                width: '100%',
                maxWidth: '800px',
                height: '70vh',
                background: 'rgba(0, 20, 40, 0.9)',
                border: '2px solid #00bfff',
                borderRadius: '20px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 0 40px rgba(0, 191, 255, 0.3)'
              }}>
                {chatHistory.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      margin: '0 0 15px 0',
                      color: '#00bfff',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      Hi! Let's practice SQL interviews
                    </h2>
                    <p style={{
                      fontSize: '18px',
                      opacity: 0.8,
                      marginBottom: '40px',
                      fontFamily: 'Arial, sans-serif',
                      maxWidth: '600px'
                    }}>
                      Type your question and watch 4 draggable windows appear! 🎨
                    </p>
                  </motion.div>
                )}

                {chatHistory.length > 0 && (
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    {chatHistory.map((message, idx) => (
                      <motion.div
                        key={idx}
                        style={{
                          alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: message.role === 'user' ? 'rgba(0, 191, 255, 0.15)' : 'rgba(0, 100, 255, 0.15)',
                          border: '1px solid #00bfff',
                          borderRadius: '15px',
                          padding: '15px'
                        }}
                        initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '18px' }}>
                            {message.role === 'user' ? '👤' : '🤖'}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            opacity: 0.8,
                            fontFamily: 'Arial, sans-serif'
                          }}>
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '15px',
                          lineHeight: '1.5',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px'
                  }}>
                    <input
                      type="text"
                      value={naturalLanguage}
                      onChange={(e) => setNaturalLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGenerateSQL()}
                      placeholder="Type anything to see floating windows..."
                      style={{
                        flex: 1,
                        padding: '15px 20px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '2px solid #00bfff',
                        borderRadius: '25px',
                        color: '#00bfff',
                        fontSize: '15px',
                        fontFamily: 'Arial, sans-serif'
                      }}
                      disabled={isLoading}
                      autoFocus
                    />
                    <motion.button
                      onClick={handleGenerateSQL}
                      style={{
                        padding: '15px 30px',
                        background: '#00bfff',
                        border: 'none',
                        borderRadius: '25px',
                        color: '#000',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'Arial, sans-serif',
                        boxShadow: '0 0 20px rgba(0, 191, 255, 0.4)'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading || !naturalLanguage.trim()}
                    >
                      {isLoading ? '⏳' : '✨'} {isLoading ? 'Thinking...' : 'Start Solving'}
                    </motion.button>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    textAlign: 'center',
                    margin: 0,
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    💡 Watch the magic happen!
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div key="floating-mode" style={{ flex: 1, position: 'relative' }}>
              {windows.map((win, idx) => (
                <motion.div
                  key={win.id}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: idx % 2 === 0 ? -200 : 200,
                    y: idx < 2 ? -100 : 100
                  }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  transition={{ delay: idx * 0.1, type: 'spring', damping: 20 }}
                  style={{
                    position: 'absolute',
                    left: win.x,
                    top: win.y,
                    width: win.minimized ? 300 : win.width,
                    height: win.minimized ? 40 : win.height,
                    background: 'rgba(0, 20, 40, 0.95)',
                    border: '2px solid #00bfff',
                    borderRadius: '10px',
                    boxShadow: '0 0 30px rgba(0, 191, 255, 0.4)',
                    zIndex: win.zIndex,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseDown={() => bringToFront(win.id)}
                >
                  <div
                    style={{
                      padding: '10px 15px',
                      borderBottom: win.minimized ? 'none' : '2px solid #00bfff',
                      background: 'rgba(0, 191, 255, 0.15)',
                      cursor: isLayoutLocked ? 'default' : 'move',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      userSelect: 'none'
                    }}
                    onMouseDown={(e) => {
                      if (!isLayoutLocked) {
                        setDragging({
                          id: win.id,
                          offsetX: e.clientX - win.x,
                          offsetY: e.clientY - win.y
                        });
                      }
                    }}
                  >
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      letterSpacing: '1px'
                    }}>
                      {win.title}
                    </span>
                    <button
                      onClick={() => toggleMinimize(win.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #00bfff',
                        borderRadius: '3px',
                        color: '#00bfff',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        fontSize: '12px'
                      }}
                    >
                      {win.minimized ? '□' : '_'}
                    </button>
                  </div>

                  {!win.minimized && (
                    <div style={{
                      flex: 1,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {renderWindowContent(win.id)}
                      {!isLayoutLocked && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '15px',
                            height: '15px',
                            cursor: 'se-resize',
                            background: 'linear-gradient(135deg, transparent 50%, #00bfff 50%)'
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizing({ id: win.id });
                          }}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {!isLayoutLocked && (
                <motion.button
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setIsLayoutLocked(true)}
                  style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    padding: '15px 30px',
                    background: '#00bfff',
                    border: 'none',
                    borderRadius: '25px',
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(0, 191, 255, 0.6)',
                    zIndex: 10000
                  }}
                >
                  🔒 Lock Layout
                </motion.button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
