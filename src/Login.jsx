import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VerseAILogo from './VerseAILogo';

export default function MatrixLogin({ onSuccess } = {}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [matrixColumns, setMatrixColumns] = useState([]);

  useEffect(() => {
    const columns = [];
    const columnCount = Math.floor(window.innerWidth / 20);
    
    for (let i = 0; i < columnCount; i++) {
      columns.push({
        id: i,
        characters: generateMatrixColumn(),
        left: `${(i / columnCount) * 100}%`,
        animationDelay: Math.random() * 5,
        duration: 10 + Math.random() * 10
      });
    }
    
    setMatrixColumns(columns);
  }, []);

  const generateMatrixColumn = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const columnHeight = 30;
    return Array.from({ length: columnHeight }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    );
  };

  const handleSubmit = () => {
    console.log('Login attempted with:', { username, password });
    if (typeof onSuccess === 'function') {
      onSuccess({ username });
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        .matrix-column {
          animation: matrixRain linear infinite;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #00ff41;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
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
              <div
                key={idx}
                style={{
                  ...styles.matrixChar,
                  opacity: 1 - (idx / column.characters.length) * 0.8
                }}
              >
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        style={styles.loginCard}
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 1
        }}
      >
        <motion.div
          style={styles.logoContainer}
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
          <VerseAILogo 
            width={200} 
            height={100} 
            style={styles.verseLogo}
          />
          <div style={styles.logoText}>MATRIX</div>
        </motion.div>

        <motion.h1 
          style={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ACCESS TERMINAL
        </motion.h1>
        
        <motion.p 
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Enter your credentials to connect
        </motion.p>

        <div style={styles.formContainer}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div style={styles.inputGroup}>
              <label style={styles.label}>&gt; USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                style={styles.input}
                placeholder="Enter username..."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div style={styles.inputGroup}>
              <label style={styles.label}>&gt; PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={styles.input}
                placeholder="Enter password..."
              />
            </div>
          </motion.div>

          <motion.button
            onClick={handleSubmit}
            style={styles.button}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              &gt;&gt; ACCESS MATRIX
            </motion.span>
          </motion.button>
        </div>

        <motion.div 
          style={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <a href="#" style={styles.link}>Forgot access code?</a>
        </motion.div>

        {/* Scanning Line Effect */}
        <motion.div
          style={styles.scanLine}
          animate={{ 
            top: ['0%', '100%'],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Corner Brackets */}
      <motion.div
        style={styles.cornerBrackets}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div style={{...styles.bracket, ...styles.topLeft}}>╔</div>
        <div style={{...styles.bracket, ...styles.topRight}}>╗</div>
        <div style={{...styles.bracket, ...styles.bottomLeft}}>╚</div>
        <div style={{...styles.bracket, ...styles.bottomRight}}>╝</div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
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
  },
  matrixColumn: {
    position: 'absolute',
    top: '-100%',
    fontSize: '14px',
    color: '#00ff41',
    textShadow: '0 0 5px #00ff41',
    lineHeight: '20px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
  },
  matrixChar: {
    display: 'block',
  },
  loginCard: {
    background: 'rgba(0, 0, 0, 0.9)',
    border: '2px solid #00ff41',
    borderRadius: '0',
    padding: '50px 40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 0 50px rgba(0, 255, 65, 0.3), inset 0 0 50px rgba(0, 255, 65, 0.05)',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(transparent, #00ff41, transparent)',
    opacity: 0.3,
    pointerEvents: 'none',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    gap: '10px',
  },
  verseLogo: {
    maxWidth: '100%',
    height: 'auto',
    filter: 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.4))',
  },
  logoText: {
    color: '#00ff41',
    fontSize: '36px',
    fontWeight: 'bold',
    letterSpacing: '8px',
    textShadow: '0 0 10px #00ff41',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#00ff41',
    textAlign: 'center',
    marginBottom: '10px',
    marginTop: '0',
    letterSpacing: '3px',
    textShadow: '0 0 10px #00ff41',
  },
  subtitle: {
    fontSize: '14px',
    color: '#00ff41',
    textAlign: 'center',
    marginBottom: '40px',
    marginTop: '0',
    opacity: 0.7,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#00ff41',
    letterSpacing: '2px',
    textShadow: '0 0 5px #00ff41',
  },
  input: {
    padding: '14px 16px',
    fontSize: '16px',
    border: '1px solid #00ff41',
    borderRadius: '0',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#00ff41',
    fontFamily: '"Courier New", monospace',
  },
  button: {
    padding: '16px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#000000',
    background: '#00ff41',
    border: '2px solid #00ff41',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)',
    letterSpacing: '2px',
    fontFamily: '"Courier New", monospace',
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
  },
  link: {
    color: '#00ff41',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textShadow: '0 0 5px #00ff41',
  },
  cornerBrackets: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '20px',
    pointerEvents: 'none',
    zIndex: 2,
  },
  bracket: {
    position: 'absolute',
    fontSize: '48px',
    color: '#00ff41',
    textShadow: '0 0 10px #00ff41',
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
};