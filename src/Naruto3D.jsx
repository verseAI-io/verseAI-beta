import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import PlaygroundEnvironment from './PlaygroundEnvironment';
import AbilityEffects from './AbilityEffects';

// 3D Naruto Model Loader (works for both Sage and Kurama)
function Naruto3DModel({ characterPose, showLevelUp, modelPath }) {
  const groupRef = useRef();
  const { scene } = useGLTF(modelPath);

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();

  useEffect(() => {
    // Traverse the model and apply emissive glow when leveling up
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // Store original material properties
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000);
          child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;
        }

        // Apply level-up glow effect
        if (showLevelUp) {
          child.material.emissive = new THREE.Color('#ffd700');
          child.material.emissiveIntensity = 0.5;
        } else {
          child.material.emissive = child.userData.originalEmissive;
          child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
        }
      }
    });
  }, [showLevelUp, clonedScene]);

  // Animate the model
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (characterPose === 'celebrate' || showLevelUp) {
      // Celebration animation - fast spin and bounce
      groupRef.current.rotation.y = time * 2;
      groupRef.current.position.y = Math.abs(Math.sin(time * 5)) * 0.3;
      groupRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.05);
    } else {
      // Idle animation - gentle rotation and float
      groupRef.current.rotation.y += 0.008;
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
    }
  });

  return (
    <primitive
      ref={groupRef}
      object={clonedScene}
      scale={1.5}
      position={[0, -0.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Main 3D Canvas Component
export default function Naruto3D({ characterPose = 'idle', showLevelUp = false, powerUpLevel = 2, activeAbility = null }) {
  // Determine which model to load based on power-up level
  const modelPath = powerUpLevel === 3 ? '/models/naruto_kurama.glb' : '/models/naruto_sage.glb';
  return (
    <div style={{
      width: '100%',
      height: '220px',
      position: 'relative',
      marginBottom: '15px'
    }}>
      <Canvas
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%'
        }}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.5, 4], fov: 50 }}
      >
        {/* Playground Environment (ground, background, lighting) */}
        <PlaygroundEnvironment powerUpLevel={powerUpLevel} showLevelUp={showLevelUp} />

        {/* Character-specific lighting */}
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#00bfff" />
        <pointLight position={[0, 2, 2]} intensity={0.8} />

        {/* Naruto 3D Model (Sage or Kurama) */}
        <Naruto3DModel characterPose={characterPose} showLevelUp={showLevelUp} modelPath={modelPath} />

        {/* Ability Effects */}
        {activeAbility && (
          <AbilityEffects activeAbility={activeAbility} powerUpLevel={powerUpLevel} />
        )}

        {/* Controls - allows user to rotate the view */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={characterPose === 'idle'}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* 3D Mode Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        fontSize: '9px',
        color: powerUpLevel === 3 ? '#ff6600' : '#ffa500',
        opacity: 0.7,
        fontFamily: 'Arial, sans-serif',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '3px 8px',
        borderRadius: '4px',
        fontWeight: 'bold'
      }}>
        {powerUpLevel === 3 ? '🔥 Kurama Mode' : '⚡ Sage Mode'} • Drag to rotate
      </div>
    </div>
  );
}

// Preload both GLB models for better performance
useGLTF.preload('/models/naruto_sage.glb');
useGLTF.preload('/models/naruto_kurama.glb');
