import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VerseAILogo from './VerseAILogo';

export default function LandingPage({ onEnterMatrix }) {
  const [currentText, setCurrentText] = useState(0);
  const [yearFlicker, setYearFlicker] = useState(true);
  const [email, setEmail] = useState('');
  const [gridNodes, setGridNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef(null);

  const flickeringTexts = ['GCP', 'Python', 'MCP', 'SQL', 'AI'];

  // Flickering text animation (slower)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % flickeringTexts.length);
    }, 3000); // Changed from 1500ms to 3000ms for slower rotation
    return () => clearInterval(interval);
  }, []);

  // Year flickering animation
  useEffect(() => {
    const interval = setInterval(() => {
      setYearFlicker((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Audio and vibration effects on page visit
  useEffect(() => {
    const playWelcomeEffects = async () => {
      try {
        console.log('🎵 Starting welcome effects...');
        
        // Create a simple beep sound using Web Audio API
        const createBeepSound = () => {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 2);
          
          console.log('🔊 Beep sound created and playing');
        };

        // Try to create and play beep sound
        try {
          createBeepSound();
          setAudioEnabled(true);
          console.log('✅ Welcome audio playing successfully');
        } catch (audioError) {
          console.log('❌ Audio creation failed:', audioError);
          // Fallback: try to play a simple audio file
          try {
            const audio = new Audio();
            // Create a simple data URL for a short beep
            audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT';
            audio.volume = 0.3;
            audioRef.current = audio;
            await audio.play();
            console.log('✅ Fallback audio playing');
          } catch (fallbackError) {
            console.log('❌ Fallback audio also failed:', fallbackError);
          }
        }

        // Vibration effect for mobile devices
        if ('vibrate' in navigator) {
          // Welcome vibration pattern: short-long-short
          navigator.vibrate([100, 200, 100, 200, 100]);
          console.log('📳 Welcome vibration triggered successfully');
        } else {
          console.log('📳 Vibration not supported on this device');
        }

      } catch (error) {
        console.log('❌ Audio/vibration setup error:', error);
      }
    };

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(playWelcomeEffects, 1000);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Generate optimized electric grid background
  useEffect(() => {
    const nodeCount = 25; // Reduced from 80 to 25 for better performance
    const newNodes = [];
    const newConnections = [];
    
    // Create grid nodes with better distribution
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.4 + 0.4,
        pulseDelay: Math.random() * 2,
        pulseDuration: 3 + Math.random() * 2,
        color: ['#00ff41', '#00bfff', '#ff1493', '#ffd700'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Create fewer, more strategic connections
    for (let i = 0; i < newNodes.length; i += 2) {
      for (let j = i + 2; j < newNodes.length; j += 2) {
        const distance = Math.sqrt(
          Math.pow(newNodes[i].x - newNodes[j].x, 2) + 
          Math.pow(newNodes[i].y - newNodes[j].y, 2)
        );
        if (distance < 30 && newConnections.length < 15) { // Limit connections
          newConnections.push({
            id: `${i}-${j}`,
            from: newNodes[i],
            to: newNodes[j],
            opacity: Math.random() * 0.3 + 0.2,
            flowDelay: Math.random() * 2,
            flowDuration: 3 + Math.random() * 1
          });
        }
      }
    }
    
    setGridNodes(newNodes);
    setConnections(newConnections);
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log('Beta signup email:', email);
    // Here you would typically send the email to your backend
    alert('Thank you for signing up for beta access!');
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // Here you would integrate with Google OAuth
    alert('Google signup integration coming soon!');
  };

  // Enable audio on user interaction (required by browsers)
  const enableAudio = async () => {
    console.log('🖱️ User interaction detected');
    if (audioRef.current && !audioEnabled) {
      try {
        await audioRef.current.play();
        setAudioEnabled(true);
        console.log('✅ Audio enabled by user interaction');
      } catch (error) {
        console.log('❌ Audio play failed:', error);
      }
    } else if (!audioEnabled) {
      // Create a new beep sound on user interaction
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        setAudioEnabled(true);
        console.log('✅ User interaction audio played');
      } catch (error) {
        console.log('❌ User interaction audio failed:', error);
      }
    }
  };

  // Handle any user interaction to enable audio
  const handleUserInteraction = () => {
    enableAudio();
  };

  return (
    <div style={styles.container} onClick={handleUserInteraction} onTouchStart={handleUserInteraction}>
      <style>{`
        @keyframes nodePulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale3d(1, 1, 1);
            filter: brightness(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale3d(1.2, 1.2, 1);
            filter: brightness(1.5);
          }
        }
        
        @keyframes connectionFlow {
          0% { 
            opacity: 0.2;
            stroke-dashoffset: 10;
          }
          50% { 
            opacity: 0.6;
            stroke-dashoffset: 5;
          }
          100% { 
            opacity: 0.2;
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -10px, 0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale3d(1, 1, 1); }
          50% { opacity: 1; transform: scale3d(1.05, 1.05, 1); }
        }
        
        @keyframes neonFlicker {
          0%, 100% { 
            text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor, 0 0 20px currentColor;
            opacity: 1;
          }
          50% { 
            text-shadow: 0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor, 0 0 12px currentColor;
            opacity: 0.8;
          }
        }
        
        @keyframes matrixGlow {
          0%, 100% { 
            text-shadow: 
              0 0 3px #00ff41, 
              0 0 6px #00ff41, 
              0 0 9px #00ff41, 
              0 0 12px #00ff41;
            color: #00ff41;
            filter: brightness(1.1);
          }
          25% { 
            text-shadow: 
              0 0 2px #00ff41, 
              0 0 4px #00ff41, 
              0 0 6px #00ff41, 
              0 0 8px #00ff41;
            color: #00ff41;
            filter: brightness(1.2);
          }
          50% { 
            text-shadow: 
              0 0 4px #00ff41, 
              0 0 8px #00ff41, 
              0 0 12px #00ff41, 
              0 0 16px #00ff41;
            color: #00ff41;
            filter: brightness(1.3);
          }
          75% { 
            text-shadow: 
              0 0 2px #00ff41, 
              0 0 4px #00ff41, 
              0 0 6px #00ff41, 
              0 0 10px #00ff41;
            color: #00ff41;
            filter: brightness(1.15);
          }
        }
        
        @keyframes indianFlag {
          0% { 
            background: linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #000080 33%, #000080 66%, #138808 66%, #138808 100%);
            background-size: 300% 100%;
            background-position: 0% 50%;
          }
          25% { 
            background: linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #000080 33%, #000080 66%, #138808 66%, #138808 100%);
            background-size: 300% 100%;
            background-position: 25% 50%;
          }
          50% { 
            background: linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #000080 33%, #000080 66%, #138808 66%, #138808 100%);
            background-size: 300% 100%;
            background-position: 50% 50%;
          }
          75% { 
            background: linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #000080 33%, #000080 66%, #138808 66%, #138808 100%);
            background-size: 300% 100%;
            background-position: 75% 50%;
          }
          100% { 
            background: linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #000080 33%, #000080 66%, #138808 66%, #138808 100%);
            background-size: 300% 100%;
            background-position: 100% 50%;
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(0, 255, 65, 0.2), 0 0 60px rgba(0, 255, 65, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(0, 255, 65, 0.5), 0 0 60px rgba(0, 255, 65, 0.3), 0 0 90px rgba(0, 255, 65, 0.2);
          }
        }
        
        @keyframes backgroundPulse {
          0%, 100% { 
            background: radial-gradient(ellipse at center, #0a0a2e 0%, #16213e 50%, #000000 100%);
          }
          50% { 
            background: radial-gradient(ellipse at center, #0f0f3e 0%, #1a2a4e 50%, #0a0a0a 100%);
          }
        }
        
        .grid-node {
          animation: nodePulse linear infinite;
          will-change: transform, opacity, filter;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        .grid-connection {
          animation: connectionFlow linear infinite;
          will-change: opacity, stroke-dashoffset;
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        
        .pulsing {
          animation: pulse 2s ease-in-out infinite;
          will-change: transform, opacity;
          transform: translateZ(0);
        }
        
        .neon-flicker {
          animation: neonFlicker 1.5s ease-in-out infinite;
          will-change: opacity, text-shadow;
        }
        
        .matrix-glow {
          animation: matrixGlow 2s ease-in-out infinite;
          will-change: text-shadow, color, filter;
        }
        
        .indian-flag {
          animation: indianFlag 4s ease-in-out infinite;
          will-change: background, background-position;
        }
        
        .glow-effect {
          animation: glow 2s ease-in-out infinite;
          will-change: box-shadow;
        }
        
        .background-pulse {
          animation: backgroundPulse 4s ease-in-out infinite;
          will-change: background;
        }
        
        .emailInput:focus {
          border-color: #00ff41;
          box-shadow: 0 0 30px rgba(0, 255, 65, 0.4), 0 0 60px rgba(0, 255, 65, 0.2);
        }
        
        .emailInput:focus + .inputGlow {
          opacity: 1;
        }
        
        .submitButton:hover .buttonGlow {
          opacity: 1;
        }
        
        .matrixButton:hover .matrixButtonGlow {
          opacity: 1;
        }
      `}</style>

      {/* Electric Grid Background */}
      <div className="background-pulse" style={styles.gridBackground}>
        {/* SVG for connections */}
        <svg style={styles.connectionSvg}>
          {connections.map((connection) => (
            <motion.line
              key={connection.id}
              className="grid-connection"
              x1={`${connection.from.x}%`}
              y1={`${connection.from.y}%`}
              x2={`${connection.to.x}%`}
              y2={`${connection.to.y}%`}
              stroke="#00ff41"
              strokeWidth="1"
              opacity={connection.opacity}
              style={{
                strokeDasharray: "5,5",
                animationDelay: `${connection.flowDelay}s`,
                animationDuration: `${connection.flowDuration}s`
              }}
            />
          ))}
        </svg>
        
        {/* Grid nodes */}
        {gridNodes.map((node) => (
          <motion.div
            key={node.id}
            className="grid-node"
            style={{
              ...styles.gridNode,
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: node.color,
              opacity: node.opacity,
              animationDelay: `${node.pulseDelay}s`,
              animationDuration: `${node.pulseDuration}s`
            }}
          />
        ))}
        
        {/* Energy waves */}
        <div style={styles.energyWave1} />
        <div style={styles.energyWave2} />
        <div style={styles.energyWave3} />
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={styles.header}
        >
          <motion.div
            className="floating"
            style={styles.logoContainer}
          >
            <VerseAILogo 
              width={400} 
              height={200} 
              style={styles.logo}
            />
          </motion.div>
        </motion.div>

        {/* Upskill Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={styles.upskillContainer}
        >
          <span style={styles.upskillText}>Upskill with </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentText}
              className="neon-flicker"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.3 }}
              style={{
                ...styles.flickeringText,
                color: ['#00ff41', '#ff1493', '#00bfff', '#ffd700', '#ff6b35'][currentText]
              }}
            >
              {flickeringTexts[currentText]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={styles.comingSoon}
        >
          <span style={styles.comingText}>Coming in 20</span>
          <motion.span
            className="pulsing"
            style={styles.flickeringYear}
            animate={{ opacity: yearFlicker ? 1 : 0.3 }}
            transition={{ duration: 0.1 }}
          >
            {yearFlicker ? '26' : '25'}
          </motion.span>
        </motion.div>

        {/* Beta Signup Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="glow-effect"
          style={styles.formContainer}
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={styles.formTitle}
          >
            Sign up for beta access
          </motion.h2>

          {/* Scanning line effect for form */}
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

          <form onSubmit={handleEmailSubmit} style={styles.form}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
              style={styles.inputGroup}
            >
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="emailInput"
                  style={styles.emailInput}
                  required
                />
                <div style={styles.inputGlow} />
              </div>
              <motion.button
                type="submit"
                className="submitButton"
                style={styles.submitButton}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(0, 255, 65, 0.8)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔘 Join Beta button clicked');
                  handleUserInteraction();
                  if ('vibrate' in navigator) {
                    navigator.vibrate(50); // Short vibration on button click
                    console.log('📳 Button vibration triggered');
                  }
                }}
              >
                <span style={styles.buttonText}>Join Beta</span>
                <div style={styles.buttonGlow} />
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            style={styles.divider}
          >
            <span style={styles.dividerText}>or</span>
          </motion.div>

          <motion.button
            onClick={() => {
              console.log('🔘 Google signup button clicked');
              handleGoogleSignup();
              handleUserInteraction();
              if ('vibrate' in navigator) {
                navigator.vibrate(50); // Short vibration on button click
                console.log('📳 Google button vibration triggered');
              }
            }}
            style={styles.googleButton}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(66, 133, 244, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={styles.googleIcon}>G</span>
            Sign up with Google
          </motion.button>
        </motion.div>

        {/* Enter Matrix Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={styles.matrixButtonContainer}
        >
          <motion.button
            onClick={() => {
              console.log('🔘 Enter Matrix button clicked');
              onEnterMatrix();
              handleUserInteraction();
              if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]); // Special vibration for Matrix entry
                console.log('📳 Matrix button special vibration triggered');
              }
            }}
            style={styles.matrixButton}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={styles.matrixButtonText}>Enter the Matrix</span>
            <div style={styles.matrixButtonGlow} />
          </motion.button>
        </motion.div>

        {/* Floating Tech Icons - Optimized */}
        <div style={styles.floatingIcons}>
          {['</>', '{}', '[]'].map((icon, index) => (
            <motion.div
              key={index}
              style={{
                ...styles.techIcon,
                left: `${15 + index * 35}%`,
                top: `${25 + (index % 2) * 50}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5 + index,
                repeat: Infinity,
                delay: index * 0.8,
                ease: "easeInOut"
              }}
            >
              {icon}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #0a0a2e 0%, #16213e 50%, #000000 100%)',
    color: '#ffffff',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden',
  },
  connectionSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  gridNode: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    willChange: 'transform, opacity, filter',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  },
  energyWave1: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0, 255, 65, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    animation: 'pulse 4s ease-in-out infinite',
  },
  energyWave2: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(0, 191, 255, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(45px)',
    animation: 'pulse 5s ease-in-out infinite 1s',
  },
  energyWave3: {
    position: 'absolute',
    bottom: '15%',
    left: '25%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(255, 20, 147, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'pulse 6s ease-in-out infinite 2s',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    maxWidth: '600px',
    padding: '40px 20px',
  },
  header: {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
  },
  logo: {
    maxWidth: '100%',
    height: 'auto',
  },
  upskillContainer: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    marginBottom: '30px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  upskillText: {
    color: '#ffffff',
    opacity: 0.9,
  },
  flickeringText: {
    fontWeight: '800',
    textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
    fontSize: '1.2em',
  },
  comingSoon: {
    fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
    marginBottom: '50px',
    color: '#ffffff',
    opacity: 0.9,
  },
  comingText: {
    fontWeight: '300',
  },
  flickeringYear: {
    fontWeight: '700',
    color: '#00ff41',
    textShadow: '0 0 15px #00ff41',
  },
  formContainer: {
    background: 'rgba(0, 255, 65, 0.05)',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '25px',
    padding: '50px 40px',
    marginBottom: '40px',
    boxShadow: '0 0 50px rgba(0, 255, 65, 0.2), inset 0 0 50px rgba(0, 255, 65, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '30px',
    color: '#ffffff',
  },
  form: {
    marginBottom: '20px',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(transparent, #00ff41, transparent)',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  inputGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  emailInput: {
    width: '100%',
    padding: '18px 25px',
    fontSize: '16px',
    border: '2px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    color: '#00ff41',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: '"Courier New", monospace',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.1)',
  },
  inputGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '15px',
    background: 'linear-gradient(45deg, transparent, rgba(0, 255, 65, 0.1), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  submitButton: {
    padding: '18px 35px',
    fontSize: '16px',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #00ff41, #00cc33)',
    border: '2px solid #00ff41',
    borderRadius: '15px',
    color: '#000000',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(0, 255, 65, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"Courier New", monospace',
    letterSpacing: '1px',
  },
  buttonText: {
    position: 'relative',
    zIndex: 2,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  divider: {
    position: 'relative',
    margin: '20px 0',
  },
  dividerText: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0 20px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px',
  },
  googleButton: {
    width: '100%',
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(66, 133, 244, 0.3)',
    borderRadius: '10px',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(66, 133, 244, 0.2)',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
    background: 'linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  matrixButtonContainer: {
    marginTop: '20px',
  },
  matrixButton: {
    padding: '15px 40px',
    fontSize: '16px',
    fontWeight: '700',
    background: 'transparent',
    border: '2px solid #00ff41',
    borderRadius: '10px',
    color: '#00ff41',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textShadow: '0 0 10px #00ff41',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden',
  },
  matrixButtonText: {
    position: 'relative',
    zIndex: 2,
  },
  matrixButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent, rgba(0, 255, 65, 0.1), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  floatingIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  techIcon: {
    position: 'absolute',
    fontSize: '24px',
    color: 'rgba(0, 255, 65, 0.4)',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  },
};
