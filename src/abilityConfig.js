// Ability Configuration for Each Power-Up Level

export const ABILITIES = {
  // Level 1: Naruto (2D)
  1: [
    {
      id: 'shadow_clone',
      name: 'Shadow Clone Jutsu',
      emoji: '🌀',
      description: 'Create shadow clones',
      duration: 3000, // 3 seconds
      cooldown: 10000, // 10 seconds
      color: '#00bfff',
      particleColor: '#ffffff',
      effectType: 'clone',
    },
    {
      id: 'rasengan',
      name: 'Rasengan',
      emoji: '💙',
      description: 'Spinning chakra sphere',
      duration: 4000, // 4 seconds
      cooldown: 12000, // 12 seconds
      color: '#0080ff',
      particleColor: '#00bfff',
      effectType: 'rasengan',
    },
    {
      id: 'summoning',
      name: 'Summoning Jutsu',
      emoji: '📜',
      description: 'Summon a toad ally',
      duration: 5000, // 5 seconds
      cooldown: 15000, // 15 seconds
      color: '#ffa500',
      particleColor: '#ff8800',
      effectType: 'summoning',
    },
  ],

  // Level 2: Sage Mode (3D)
  2: [
    {
      id: 'sage_rasengan',
      name: 'Sage Art: Rasengan',
      emoji: '🟠',
      description: 'Rasengan with nature energy',
      duration: 4000,
      cooldown: 12000,
      color: '#ffa500',
      particleColor: '#ffcc00',
      effectType: 'sage_rasengan',
    },
    {
      id: 'frog_kata',
      name: 'Frog Kata',
      emoji: '🐸',
      description: 'Sage Mode combat technique',
      duration: 5000,
      cooldown: 13000,
      color: '#00ff00',
      particleColor: '#90ff90',
      effectType: 'frog_kata',
    },
    {
      id: 'sage_aura',
      name: 'Sage Mode Aura',
      emoji: '✨',
      description: 'Nature energy cloak',
      duration: 6000,
      cooldown: 15000,
      color: '#ffaa00',
      particleColor: '#ffd700',
      effectType: 'sage_aura',
    },
  ],

  // Level 3: Kurama Mode (3D)
  3: [
    {
      id: 'tailed_beast_bomb',
      name: 'Tailed Beast Bomb',
      emoji: '💥',
      description: 'Ultimate destructive sphere',
      duration: 6000,
      cooldown: 15000,
      color: '#ff0000',
      particleColor: '#ff6600',
      effectType: 'tailed_beast_bomb',
    },
    {
      id: 'chakra_cloak',
      name: 'Nine-Tails Chakra Cloak',
      emoji: '🦊',
      description: 'Kurama chakra flames',
      duration: 7000,
      cooldown: 16000,
      color: '#ff3300',
      particleColor: '#ff6600',
      effectType: 'chakra_cloak',
    },
    {
      id: 'kurama_avatar',
      name: 'Kurama Avatar',
      emoji: '🔴',
      description: 'Manifest giant chakra form',
      duration: 8000,
      cooldown: 18000,
      color: '#cc0000',
      particleColor: '#ff0000',
      effectType: 'kurama_avatar',
    },
  ],
};

// Get abilities for a specific power-up level
export const getAbilitiesForLevel = (powerUpLevel) => {
  return ABILITIES[powerUpLevel] || ABILITIES[1];
};

// Check if ability is on cooldown
export const isAbilityOnCooldown = (abilityId, cooldowns) => {
  if (!cooldowns[abilityId]) return false;
  const timeRemaining = cooldowns[abilityId] - Date.now();
  return timeRemaining > 0;
};

// Get cooldown remaining time in seconds
export const getCooldownRemaining = (abilityId, cooldowns) => {
  if (!cooldowns[abilityId]) return 0;
  const timeRemaining = cooldowns[abilityId] - Date.now();
  return Math.max(0, Math.ceil(timeRemaining / 1000));
};
