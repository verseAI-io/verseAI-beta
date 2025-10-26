import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VerseAILogo from './VerseAILogo';

export default function Home({ onOpenSQLEditor, onOpenInterview, onOpenAICoding, onOpenPlayground, onOpenProblemSolving, onOpenCharacter }) {
  const [showModal, setShowModal] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);

  useEffect(() => {
    const items = [];
    const labels = ['ACCESS GRANTED', 'WELCOME', 'NODE-42', 'DECRYPTED', 'ONLINE'];
    const count = 18;
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        text: labels[i % labels.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 6 + Math.random() * 6,
      });
    }
    setFloatingTexts(items);
  }, []);

  const matrixChars = useMemo(() => '01█░▓'.split(''), []);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: .25; }
          90% { opacity: .25; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .scanline { animation: scan 4s linear infinite; }
        .linklike { cursor: pointer; }
      `}</style>

      <div style={styles.bg}>
        {Array.from({ length: 24 }).map((_, col) => (
          <motion.div
            key={col}
            initial={{ y: '-110%' }}
            animate={{ y: '110%' }}
            transition={{ duration: 7 + Math.random() * 8, repeat: Infinity, ease: 'linear', delay: Math.random() * 3 }}
            style={{ ...styles.col, left: `${(col / 24) * 100}%` }}
          >
            {Array.from({ length: 28 }).map((_, row) => (
              <div key={row} style={styles.char}>{matrixChars[Math.floor(Math.random() * matrixChars.length)]}</div>
            ))}
          </motion.div>
        ))}
      </div>

      <div style={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
          style={styles.logoContainer}
        >
          <VerseAILogo 
            width={300} 
            height={150} 
            style={styles.logo}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: 0.2 }}
          style={styles.title}
        >
          WELCOME TO THE GRID
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: .2 }}
          style={styles.subtitle}
        >
          SELECT A NODE TO CONTINUE
        </motion.h2>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #00ff41' }}
            whileTap={{ scale: .97 }}
            style={styles.cta}
            className="linklike"
          >
            {">"} CONTROL PANEL
          </motion.div>
          <motion.div
            onClick={onOpenSQLEditor}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #00ff41', boxShadow: '0 0 30px rgba(0,255,65,.4)' }}
            whileTap={{ scale: .97 }}
            style={{...styles.cta, background: '#00ff41', color: '#000', border: '2px solid #00ff41'}}
            className="linklike"
          >
            {"⚡"} SQL EDITOR
          </motion.div>
          <motion.div
            onClick={onOpenInterview}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #00bfff', boxShadow: '0 0 30px rgba(0,191,255,.4)' }}
            whileTap={{ scale: .97 }}
            style={{...styles.cta, background: 'transparent', color: '#00bfff', border: '2px solid #00bfff', boxShadow: '0 0 20px rgba(0,191,255,.25)'}}
            className="linklike"
          >
            {"📝"} INTERVIEW PREP
          </motion.div>
          <motion.div
            onClick={onOpenAICoding}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #ff1493', boxShadow: '0 0 30px rgba(255,20,147,.4)' }}
            whileTap={{ scale: .97 }}
            style={{...styles.cta, background: 'transparent', color: '#ff1493', border: '2px solid #ff1493', boxShadow: '0 0 20px rgba(255,20,147,.25)'}}
            className="linklike"
          >
            {"🤖"} AI CODING CHALLENGE
          </motion.div>
          <motion.div
            onClick={onOpenPlayground}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #ffd700', boxShadow: '0 0 30px rgba(255,215,0,.4)' }}
            whileTap={{ scale: .97 }}
            style={{...styles.cta, background: 'transparent', color: '#ffd700', border: '2px solid #ffd700', boxShadow: '0 0 20px rgba(255,215,0,.25)'}}
            className="linklike"
          >
            {"⚡"} SQL PLAYGROUND
          </motion.div>
          <motion.div
            onClick={onOpenProblemSolving}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #00ff41', boxShadow: '0 0 30px rgba(0,255,65,.4)' }}
            whileTap={{ scale: .97 }}
            style={{...styles.cta, background: 'transparent', color: '#00ff41', border: '2px solid #00ff41', boxShadow: '0 0 20px rgba(0,255,65,.25)'}}
            className="linklike"
          >
            {"🎯"} PROBLEM SOLVING
          </motion.div>
          <motion.div
            onClick={onOpenCharacter}
            whileHover={{ scale: 1.05, textShadow: '0 0 12px #9932cc', boxShadow: '0 0 30px rgba(153,50,204,.4)' }}
            whileTap={{ scale: .97 }}
            style={{...styles.cta, background: 'transparent', color: '#9932cc', border: '2px solid #9932cc', boxShadow: '0 0 20px rgba(153,50,204,.25)'}}
            className="linklike"
          >
            {"🤖"} NEOCORTEX CHARACTER
          </motion.div>
        </div>
      </div>

      {floatingTexts.map((item) => (
        <motion.div
          key={item.id}
          initial={{ x: `${item.x}vw`, y: `${item.y}vh`, opacity: 0 }}
          animate={{
            x: [`${item.x}vw`, `${(item.x + 10) % 100}vw`, `${item.x}vw`],
            y: [`${item.y}vh`, `${(item.y + 8) % 100}vh`, `${item.y}vh`],
            opacity: [0, .6, 0],
          }}
          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={styles.float}
        >
          {item.text}
        </motion.div>
      ))}

      <div className="scanline" style={styles.scan} />

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: .8, rotateX: 15, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: .9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>CONTROL PANEL</div>
              <div style={styles.modalBody}>
                <p>Text is going here and there. Click outside to close.</p>
                <p>Status: ACTIVE • Channel: ALPHA • Latency: 12ms</p>
              </div>
              <div style={styles.modalFooter}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: .95 }}
                  style={styles.button}
                  onClick={() => setShowModal(false)}
                >
                  CLOSE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000',
    color: '#00ff41',
    fontFamily: 'Courier New, monospace',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  col: {
    position: 'absolute',
    top: '-110%',
    color: '#00ff41',
    fontSize: '14px',
    textShadow: '0 0 6px #00ff41',
    lineHeight: '18px',
    fontWeight: '700',
  },
  char: {
    userSelect: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '24px',
    textAlign: 'center',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    filter: 'drop-shadow(0 0 15px rgba(0, 255, 65, 0.4))',
  },
  logo: {
    maxWidth: '100%',
    height: 'auto',
  },
  title: {
    margin: 0,
    letterSpacing: '3px',
    textShadow: '0 0 10px #00ff41',
  },
  subtitle: {
    margin: 0,
    opacity: .8,
  },
  cta: {
    marginTop: '12px',
    border: '2px solid #00ff41',
    padding: '12px 18px',
    background: 'rgba(0,0,0,.6)',
    color: '#00ff41',
    fontWeight: '700',
    letterSpacing: '2px',
    boxShadow: '0 0 20px rgba(0,255,65,.25)',
  },
  float: {
    position: 'fixed',
    zIndex: 1,
    fontSize: '12px',
    color: '#00ff41',
    textShadow: '0 0 8px #00ff41',
    pointerEvents: 'none',
  },
  scan: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '2px',
    background: 'linear-gradient(transparent,#00ff41,transparent)',
    opacity: .35,
    zIndex: 2,
    pointerEvents: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.75)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modal: {
    width: '100%',
    maxWidth: '520px',
    background: 'rgba(0,0,0,.9)',
    border: '2px solid #00ff41',
    boxShadow: '0 0 40px rgba(0,255,65,.35), inset 0 0 40px rgba(0,255,65,.08)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '2px solid #00ff41',
    fontWeight: '800',
    letterSpacing: '2px',
  },
  modalBody: {
    padding: '16px 20px',
    lineHeight: 1.6,
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '2px solid #00ff41',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '10px 14px',
    fontWeight: '800',
    color: '#000',
    background: '#00ff41',
    border: '2px solid #00ff41',
    letterSpacing: '2px',
    cursor: 'pointer',
  },
};


