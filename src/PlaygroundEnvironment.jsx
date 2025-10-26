import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Circular Platform/Ground
function CircularPlatform({ powerUpLevel }) {
  const meshRef = useRef();

  // Subtle rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001; // Very slow rotation
    }
  });

  // Platform color based on power-up level
  const getPlatformColor = () => {
    if (powerUpLevel === 1) return '#1a4d6d'; // Blue for Naruto
    if (powerUpLevel === 2) return '#6d4d1a'; // Orange-brown for Sage
    return '#6d1a1a'; // Red-brown for Kurama
  };

  return (
    <group>
      {/* Main circular platform */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial
          color={getPlatformColor()}
          roughness={0.8}
          metalness={0.2}
          opacity={0.9}
          transparent
        />
      </mesh>

      {/* Platform border/rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.19, 0]}>
        <ringGeometry args={[2.9, 3, 64]} />
        <meshStandardMaterial
          color={powerUpLevel === 1 ? '#00bfff' : powerUpLevel === 2 ? '#ffa500' : '#ff6600'}
          emissive={powerUpLevel === 1 ? '#00bfff' : powerUpLevel === 2 ? '#ffa500' : '#ff6600'}
          emissiveIntensity={0.3}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>

      {/* Grid lines on platform (optional detail) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}>
        <circleGeometry args={[2.8, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={0.1}
          transparent
          wireframe
        />
      </mesh>
    </group>
  );
}

// Background gradient glow
function BackgroundGlow({ powerUpLevel }) {
  const glowRef = useRef();

  useFrame((state) => {
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Subtle pulsing effect
      glowRef.current.material.opacity = 0.15 + Math.sin(time * 0.5) * 0.05;
    }
  });

  const getGlowColor = () => {
    if (powerUpLevel === 1) return '#00bfff'; // Blue
    if (powerUpLevel === 2) return '#ffa500'; // Orange
    return '#ff6600'; // Red
  };

  return (
    <mesh ref={glowRef} position={[0, 0, -5]}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial
        color={getGlowColor()}
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Simple fog/atmospheric effect
function AtmosphericFog({ powerUpLevel }) {
  const fogRef = useRef();

  useFrame((state) => {
    if (fogRef.current) {
      const time = state.clock.getElapsedTime();
      fogRef.current.rotation.y += 0.002;
      fogRef.current.position.y = -0.5 + Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={fogRef} position={[0, -0.5, 0]}>
      <torusGeometry args={[2.5, 0.3, 16, 32]} />
      <meshBasicMaterial
        color={powerUpLevel === 1 ? '#00bfff' : powerUpLevel === 2 ? '#ffa500' : '#ff6600'}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Main environment component
export default function PlaygroundEnvironment({ powerUpLevel = 1, showLevelUp = false }) {
  return (
    <group>
      {/* Circular platform ground */}
      <CircularPlatform powerUpLevel={powerUpLevel} />

      {/* Background atmospheric glow */}
      <BackgroundGlow powerUpLevel={powerUpLevel} />

      {/* Fog effect around the platform */}
      <AtmosphericFog powerUpLevel={powerUpLevel} />

      {/* Additional lighting for the environment */}
      <ambientLight intensity={0.4} />
      <hemisphereLight
        skyColor="#87CEEB"
        groundColor="#654321"
        intensity={0.3}
      />

      {/* Rim lighting for dramatic effect */}
      <pointLight
        position={[5, 2, 5]}
        intensity={0.5}
        color={powerUpLevel === 1 ? '#00bfff' : powerUpLevel === 2 ? '#ffa500' : '#ff6600'}
      />
      <pointLight
        position={[-5, 2, -5]}
        intensity={0.3}
        color={powerUpLevel === 1 ? '#00bfff' : powerUpLevel === 2 ? '#ffa500' : '#ff6600'}
      />

      {/* Level-up enhancement light */}
      {showLevelUp && (
        <pointLight
          position={[0, 3, 0]}
          intensity={2}
          color="#ffd700"
          distance={10}
        />
      )}
    </group>
  );
}
