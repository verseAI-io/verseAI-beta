import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';

// Character 3D Model Component with Breathing Animation
function CharacterModel({ isSpeaking = false }) {
  const gltf = useGLTF('/models/naruto_sage.glb');
  const groupRef = useRef();

  // Breathing animation - gentle up and down movement
  useFrame((state) => {
    if (groupRef.current) {
      // Breathing: slow sine wave for vertical movement
      const breathe = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      groupRef.current.position.y = breathe;

      // Gentle chest expansion
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
      groupRef.current.scale.set(2, 2 * breathScale, 2);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Character Model */}
      <primitive
        object={gltf.scene}
        scale={2}
        rotation={[0, 0, 0]}
      />

      {/* AI Speaking Glow Effect */}
      {isSpeaking && (
        <>
          {/* Glowing ring at feet */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <ringGeometry args={[1.5, 2, 32]} />
            <meshBasicMaterial
              color="#00ff41"
              transparent
              opacity={0.6}
              side={2}
            />
          </mesh>

          {/* Vertical glow cylinder */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[2, 2, 4, 32, 1, true]} />
            <meshBasicMaterial
              color="#00ff41"
              transparent
              opacity={0.15}
              side={2}
            />
          </mesh>
        </>
      )}

      {/* Spotlight on character */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={isSpeaking ? 1.5 : 0.8}
        color={isSpeaking ? "#00ff41" : "#ffffff"}
        castShadow
      />
    </group>
  );
}

// Enhanced ground plane with grid
function Ground() {
  return (
    <group>
      {/* Solid base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Wireframe grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[100, 100, 40, 40]} />
        <meshBasicMaterial
          color="#00ff41"
          wireframe={true}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Glowing center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[5, 64]} />
        <meshBasicMaterial
          color="#00ff41"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

// Main 3D Environment Component
export default function ThreeDEnvironment({ isActive = true, isSpeaking = false }) {
  if (!isActive) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }}>
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        style={{
          width: '100%',
          height: '100%'
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
        dpr={1}
      >
        {/* Starry Space Background */}
        <color attach="background" args={['#000000']} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade={true}
          speed={1}
        />

        {/* Bright Lighting for Sharp Clear Naruto */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, 5, 3]} intensity={1.5} color="#ffffff" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.5}
          penumbra={0.5}
          intensity={2}
          color="#ffffff"
        />

        {/* Ground */}
        <Ground />

        {/* Character Model - Breathing and Interactive */}
        <Suspense fallback={
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#00ff41" wireframe />
          </mesh>
        }>
          <CharacterModel isSpeaking={isSpeaking} />
        </Suspense>

        {/* Static camera - no rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}

// Preload the character model for better performance
useGLTF.preload('/models/naruto_sage.glb');
