import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Naruto3D from './Naruto3D';
import ActionButtons from './ActionButtons';

export default function NarutoCharacter({ questionsCompleted = 0 }) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [characterPose, setCharacterPose] = useState('idle');
  const [powerUpLevel, setPowerUpLevel] = useState(1); // 1: Naruto (2D), 2: Sage Mode (3D), 3: Kurama Mode (3D)

  // Ability system state
  const [activeAbility, setActiveAbility] = useState(null);
  const [cooldowns, setCooldowns] = useState({});

  // Handle ability trigger
  const handleAbilityTrigger = (ability) => {
    // Set ability as active
    setActiveAbility(ability);
    setCharacterPose('celebrate'); // Use celebrate pose for abilities

    // Set cooldown
    const newCooldowns = { ...cooldowns };
    newCooldowns[ability.id] = Date.now() + ability.cooldown;
    setCooldowns(newCooldowns);

    // Clear ability after duration
    setTimeout(() => {
      setActiveAbility(null);
      setCharacterPose('idle');
    }, ability.duration);
  };

  // XP needed for each level (increases progressively)
  const getXPForLevel = (lvl) => lvl * 100;
  const xpNeeded = getXPForLevel(level);
  const xpProgress = (xp / xpNeeded) * 100;

  // Calculate level and XP based on questions completed
  useEffect(() => {
    const xpPerQuestion = 50;
    const totalXP = questionsCompleted * xpPerQuestion;

    let currentLevel = 1;
    let remainingXP = totalXP;

    // Calculate level based on total XP
    while (remainingXP >= getXPForLevel(currentLevel)) {
      remainingXP -= getXPForLevel(currentLevel);
      currentLevel++;
    }

    // Check if leveled up
    if (currentLevel > level) {
      setShowLevelUp(true);
      setCharacterPose('celebrate');
      setTimeout(() => {
        setShowLevelUp(false);
        setCharacterPose('idle');
      }, 3000);
    }

    setLevel(currentLevel);
    setXp(remainingXP);
  }, [questionsCompleted]);

  const getRankName = (lvl) => {
    if (lvl < 5) return 'Academy Student';
    if (lvl < 10) return 'Genin';
    if (lvl < 20) return 'Chunin';
    if (lvl < 35) return 'Jonin';
    if (lvl < 50) return 'ANBU';
    return 'Hokage';
  };

  const getRankColor = (lvl) => {
    if (lvl < 5) return '#9e9e9e';
    if (lvl < 10) return '#4caf50';
    if (lvl < 20) return '#2196f3';
    if (lvl < 35) return '#9c27b0';
    if (lvl < 50) return '#ff9800';
    return '#ffd700';
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -100 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              textAlign: 'center'
            }}
          >
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffd700',
              textShadow: '0 0 20px #ffd700, 0 0 40px #ffd700',
              marginBottom: '10px'
            }}>
              LEVEL UP!
            </div>
            <div style={{
              fontSize: '32px',
              color: '#00bfff',
              textShadow: '0 0 10px #00bfff'
            }}>
              Level {level}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power Up Button */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 20
      }}>
        <button
          onClick={() => setPowerUpLevel(powerUpLevel === 3 ? 1 : powerUpLevel + 1)}
          style={{
            padding: '10px 15px',
            background: powerUpLevel === 1
              ? 'linear-gradient(135deg, #00bfff 0%, #0080ff 100%)'
              : powerUpLevel === 2
              ? 'linear-gradient(135deg, #ffa500 0%, #ff8800 100%)'
              : 'linear-gradient(135deg, #ff6600 0%, #ff0000 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: powerUpLevel === 1
              ? '0 4px 15px rgba(0, 191, 255, 0.5)'
              : powerUpLevel === 2
              ? '0 4px 15px rgba(255, 165, 0, 0.5)'
              : '0 4px 15px rgba(255, 102, 0, 0.5)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = powerUpLevel === 1
              ? '0 6px 25px rgba(0, 191, 255, 0.7)'
              : powerUpLevel === 2
              ? '0 6px 25px rgba(255, 165, 0, 0.7)'
              : '0 6px 25px rgba(255, 102, 0, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = powerUpLevel === 1
              ? '0 4px 15px rgba(0, 191, 255, 0.5)'
              : powerUpLevel === 2
              ? '0 4px 15px rgba(255, 165, 0, 0.5)'
              : '0 4px 15px rgba(255, 102, 0, 0.5)';
          }}
        >
          {powerUpLevel === 1 ? '🥷 Naruto' : powerUpLevel === 2 ? '⚡ Sage Mode' : '🔥 Kurama Mode'}
          <span style={{ fontSize: '9px', opacity: 0.8 }}>▶</span>
        </button>
      </div>

      {/* Naruto Character - 3 Power-Up Levels */}
      {powerUpLevel === 1 ? (
        /* Level 1: Naruto (2D) */
        <motion.div
          animate={{
            y: characterPose === 'celebrate' ? [0, -20, 0] : [0, -5, 0],
            rotate: characterPose === 'celebrate' ? [0, 5, -5, 0] : 0
          }}
          transition={{
            duration: characterPose === 'celebrate' ? 0.5 : 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            marginBottom: '20px',
            filter: showLevelUp ? 'drop-shadow(0 0 30px #ffd700)' : 'drop-shadow(0 0 10px rgba(0, 191, 255, 0.5))'
          }}
        >
          <img
            src="/naruto-character.png"
            alt="Naruto"
            style={{
              width: '180px',
              height: '180px',
              objectFit: 'contain',
              imageRendering: 'crisp-edges'
            }}
          />
        </motion.div>
      ) : (
        /* Level 2 & 3: Sage Mode (3D) & Kurama Mode (3D) */
        <Naruto3D
          characterPose={characterPose}
          showLevelUp={showLevelUp}
          powerUpLevel={powerUpLevel}
          activeAbility={activeAbility}
        />
      )}

      {/* Action Buttons - Show at bottom */}
      <ActionButtons
        powerUpLevel={powerUpLevel}
        onAbilityTrigger={handleAbilityTrigger}
        cooldowns={cooldowns}
        activeAbility={activeAbility}
      />

      {/* Level & Rank Badge */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: showLevelUp ? 1.1 : 1 }}
        style={{
          background: `linear-gradient(135deg, ${getRankColor(level)}33 0%, ${getRankColor(level)}11 100%)`,
          border: `2px solid ${getRankColor(level)}`,
          borderRadius: '15px',
          padding: '12px 20px',
          marginBottom: '15px',
          boxShadow: `0 0 20px ${getRankColor(level)}44`,
          textAlign: 'center',
          minWidth: '200px'
        }}
      >
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: getRankColor(level),
          textShadow: `0 0 10px ${getRankColor(level)}`,
          marginBottom: '5px'
        }}>
          Level {level}
        </div>
        <div style={{
          fontSize: '11px',
          color: getRankColor(level),
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 'bold',
          opacity: 0.9
        }}>
          {getRankName(level)}
        </div>
      </motion.div>

      {/* XP Progress Bar */}
      <div style={{
        width: '100%',
        maxWidth: '250px',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '11px',
          color: '#00bfff',
          fontWeight: 'bold'
        }}>
          <span>XP</span>
          <span>{xp} / {xpNeeded}</span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '6px',
          border: '1px solid #00bfff',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00bfff 0%, #00ff64 100%)',
              boxShadow: '0 0 10px rgba(0, 191, 255, 0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.div
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                width: '50%'
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        width: '100%',
        maxWidth: '250px',
        background: 'rgba(0, 191, 255, 0.1)',
        border: '1px solid #00bfff',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '12px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 191, 255, 0.3)'
        }}>
          <span style={{ opacity: 0.8 }}>Questions Solved</span>
          <span style={{ fontWeight: 'bold', color: '#00ff64' }}>{questionsCompleted}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ opacity: 0.8 }}>Next Level</span>
          <span style={{ fontWeight: 'bold', color: '#ffd700' }}>{xpNeeded - xp} XP</span>
        </div>
      </div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        style={{
          marginTop: '15px',
          fontSize: '10px',
          fontStyle: 'italic',
          textAlign: 'center',
          color: '#ffa500',
          maxWidth: '220px',
          lineHeight: '1.4'
        }}
      >
        "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way!"
      </motion.div>
    </div>
  );
}
