import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stars } from '@react-three/drei';
import { AnimationMixer } from 'three';
import './NeocortexCharacter.css';

// Character component for 3D model and animations
const Character = ({ position, scale = [1.8, 1.8, 1.8], isSpeaking }) => {
  const model = useGLTF('/models/naruto_sage.glb');
  const [mixer, setMixer] = useState(null);
  const meshRef = useRef();

  // Initialize animation mixer
  useEffect(() => {
    const newMixer = new AnimationMixer(model.scene);
    setMixer(newMixer);

    // Set up shadow casting
    model.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Play default idle animation
    if (model.animations && model.animations.length > 0) {
      const action = newMixer.clipAction(model.animations[0]);
      action.play();
    }

    return () => newMixer.stopAllAction();
  }, [model]);

  // Update animations
  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);

    // Subtle bounce when speaking
    if (meshRef.current && isSpeaking) {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.005) * 0.02;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <primitive object={model.scene} scale={scale} />
    </group>
  );
};

// Ground component
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.2} />
    </mesh>
  );
};

// Speaking Glow Effect Component - SEPARATE FROM NARUTO MODEL
const SpeakingGlow = () => {
  const glowRef = useRef();
  const lightRef = useRef();

  useFrame(() => {
    if (glowRef.current && lightRef.current) {
      // Pulse the ring opacity
      const pulse = Math.sin(Date.now() * 0.003) * 0.15 + 0.3;
      glowRef.current.material.opacity = pulse;

      // Pulse the light intensity
      lightRef.current.intensity = 1 + Math.sin(Date.now() * 0.003) * 0.5;
    }
  });

  return (
    <>
      {/* Pulsing green point light */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 0]}
        intensity={1.5}
        color="#00ff41"
        distance={3}
        decay={2}
      />

      {/* Glowing ring at feet */}
      <mesh ref={glowRef} position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial
          color="#00ff41"
          transparent
          opacity={0.3}
          side={2}
        />
      </mesh>
    </>
  );
};

const NeocortexCharacter = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('neocortex-session-id') || '');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const audioRef = useRef(null);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save session ID to localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('neocortex-session-id', sessionId);
    }
  }, [sessionId]);

  // Generate speech using Neocortex TTS API
  const generateSpeech = useCallback(async (text) => {
    try {
      const response = await fetch('http://localhost:5001/api/neocortex/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsSpeaking(true);

        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
      }
    } catch (error) {
      console.error('TTS error:', error);
      setMessages(prev => [...prev, {
        type: 'system',
        text: '⚠️ Failed to generate speech'
      }]);
    }
  }, []);

  // Send text message to Neocortex Chat API
  const handleSendMessage = useCallback(async (messageText) => {
    // Get the message from parameter or input field
    const userMessage = (messageText || inputMessage || '').trim();
    if (!userMessage) return;

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/neocortex/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Update session ID
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add AI response to chat
      const aiMessage = data.response || data.message || 'No response';
      setMessages(prev => [...prev, { type: 'ai', text: aiMessage }]);

      // Generate TTS for AI response
      await generateSpeech(aiMessage);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'system',
        text: '❌ Error: ' + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, sessionId, generateSpeech]);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one phrase
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US'; // Language

      // When speech is recognized
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        setMessages(prev => [...prev, {
          type: 'system',
          text: `✅ Heard: "${transcript}"`
        }]);

        // Automatically send the transcribed text to Naruto
        handleSendMessage(transcript);
      };

      // When recognition ends
      recognition.onend = () => {
        setIsListening(false);
      };

      // On error
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setMessages(prev => [...prev, {
          type: 'system',
          text: `❌ Speech recognition error: ${event.error}`
        }]);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [handleSendMessage]);

  // Start listening with Speech Recognition
  const startListening = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, {
        type: 'system',
        text: '❌ Speech recognition not supported in this browser. Try Chrome or Edge.'
      }]);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);

      setMessages(prev => [...prev, {
        type: 'system',
        text: '🎤 Listening... (Speak now)'
      }]);
    } catch (error) {
      console.error('Recognition start error:', error);
      setMessages(prev => [...prev, {
        type: 'system',
        text: '❌ Could not start microphone. Try again.'
      }]);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setSessionId('');
    localStorage.removeItem('neocortex-session-id');
  };

  return (
    <div className="neocortex-playground-container">
      {/* Three.js Scene */}
      <div className="neocortex-scene">
        <Canvas
          shadows
          camera={{ position: [0, 2, 5], fov: 50 }}
          style={{ background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2e 100%)' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4169e1" />
          <pointLight position={[5, 3, 5]} intensity={0.3} color="#ffd700" />

          {/* Starry Sky */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Character */}
          <Suspense fallback={null}>
            <Character
              position={[0, 0.5, 0]}
              scale={[1.8, 1.8, 1.8]}
              isSpeaking={isSpeaking}
            />
          </Suspense>

          {/* Green Glow Effect When Speaking - DOESN'T TOUCH NARUTO MODEL */}
          {isSpeaking && <SpeakingGlow />}

          {/* Ground */}
          <Ground />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            target={[0, 1, 0]}
            maxDistance={8}
            minDistance={2}
          />
        </Canvas>
      </div>

      {/* Chat Interface */}
      <div className="chat-interface">
        <div className="chat-header">
          <h3>🎭 Neocortex AI Playground</h3>
          <button onClick={clearChat} className="clear-btn" title="Clear Chat">
            🗑️
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Welcome to the AI Character Playground!</p>
              <p>Start chatting with Naruto or use the microphone to speak.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.type}`}>
              <div className="message-content">
                {msg.type === 'user' && <span className="message-icon">👤</span>}
                {msg.type === 'ai' && <span className="message-icon">🎭</span>}
                {msg.type === 'system' && <span className="message-icon">ℹ️</span>}
                <span className="message-text">{msg.text}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message message-ai">
              <div className="message-content">
                <span className="message-icon">🎭</span>
                <span className="message-text typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="chat-input"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="send-btn"
          >
            ✉️
          </button>
          <button
            onClick={isListening ? stopListening : startListening}
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop Recording' : 'Start Recording'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
        </div>

        {/* Status Indicators */}
        <div className="status-bar">
          {isSpeaking && <span className="status-badge speaking">🔊 Speaking</span>}
          {isListening && <span className="status-badge listening">🎤 Listening</span>}
          {sessionId && <span className="status-badge connected">✓ Connected</span>}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default NeocortexCharacter;
