import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAbilitiesForLevel, getCooldownRemaining } from './abilityConfig';

export default function ActionButtons({
  powerUpLevel,
  onAbilityTrigger,
  cooldowns = {},
  activeAbility
}) {
  const abilities = getAbilitiesForLevel(powerUpLevel);

  const handleAbilityClick = (ability) => {
    const cooldownRemaining = getCooldownRemaining(ability.id, cooldowns);
    if (cooldownRemaining === 0 && !activeAbility) {
      onAbilityTrigger(ability);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      zIndex: 30
    }}>
      {abilities.map((ability, index) => {
        const cooldownRemaining = getCooldownRemaining(ability.id, cooldowns);
        const isOnCooldown = cooldownRemaining > 0;
        const isActive = activeAbility?.id === ability.id;

        return (
          <motion.div
            key={ability.id}
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
          >
            <motion.button
              onClick={() => handleAbilityClick(ability)}
              disabled={isOnCooldown || activeAbility}
              whileHover={!isOnCooldown && !activeAbility ? { scale: 1.1, y: -5 } : {}}
              whileTap={!isOnCooldown && !activeAbility ? { scale: 0.95 } : {}}
              style={{
                position: 'relative',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                border: `3px solid ${ability.color}`,
                background: isOnCooldown
                  ? 'rgba(50, 50, 50, 0.8)'
                  : isActive
                  ? `linear-gradient(135deg, ${ability.color} 0%, ${ability.particleColor} 100%)`
                  : `linear-gradient(135deg, ${ability.color}22 0%, ${ability.color}44 100%)`,
                color: isOnCooldown ? '#666' : '#fff',
                fontSize: '28px',
                cursor: isOnCooldown || activeAbility ? 'not-allowed' : 'pointer',
                boxShadow: isOnCooldown
                  ? '0 2px 10px rgba(0, 0, 0, 0.5)'
                  : isActive
                  ? `0 0 30px ${ability.color}, 0 0 60px ${ability.color}`
                  : `0 4px 20px ${ability.color}66`,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}
            >
              {/* Animated border ring */}
              {isActive && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: `3px solid ${ability.particleColor}`,
                    borderTopColor: 'transparent',
                    top: '-8px',
                    left: '-8px'
                  }}
                />
              )}

              {/* Ability emoji */}
              <div style={{
                fontSize: '32px',
                filter: isOnCooldown ? 'grayscale(100%)' : 'none',
                opacity: isOnCooldown ? 0.3 : 1
              }}>
                {ability.emoji}
              </div>

              {/* Cooldown overlay */}
              {isOnCooldown && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    transparent ${((ability.cooldown / 1000 - cooldownRemaining) / (ability.cooldown / 1000)) * 360}deg,
                    rgba(0, 0, 0, 0.7) 0deg
                  )`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {cooldownRemaining}s
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: '#ffd700',
                    boxShadow: '0 0 10px #ffd700'
                  }}
                />
              )}
            </motion.button>

            {/* Ability name label - Now on RIGHT side */}
            <AnimatePresence>
              {!isOnCooldown && !activeAbility && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{
                    position: 'absolute',
                    left: '85px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: `linear-gradient(135deg, ${ability.color}dd 0%, ${ability.particleColor}dd 100%)`,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    textAlign: 'left',
                    width: 'max-content',
                    boxShadow: `0 4px 15px ${ability.color}66`,
                    border: `2px solid ${ability.particleColor}`,
                  }}
                >
                  {ability.emoji} {ability.name}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Ability description banner (when active) - Top center */}
      <AnimatePresence>
        {activeAbility && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: `linear-gradient(135deg, ${activeAbility.color}dd 0%, ${activeAbility.particleColor}dd 100%)`,
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              textAlign: 'center',
              boxShadow: `0 8px 40px ${activeAbility.color}aa`,
              border: `3px solid ${activeAbility.particleColor}`,
              minWidth: '250px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '5px' }}>
              {activeAbility.emoji} {activeAbility.name}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              {activeAbility.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
