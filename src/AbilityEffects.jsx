import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Particle system for abilities
function ParticleEffect({ count = 50, color, spread = 2, speed = 1, height = 0 }) {
  const particlesRef = useRef();

  // Generate particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random position in a sphere
      const radius = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = height + (Math.random() - 0.5) * spread;
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Random velocity
      velocities.push({
        x: (Math.random() - 0.5) * speed,
        y: Math.random() * speed * 0.5,
        z: (Math.random() - 0.5) * speed,
      });
    }

    return { positions, velocities };
  }, [count, spread, speed, height]);

  // Animate particles
  useFrame(() => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update positions
      positions[i3] += particles.velocities[i].x * 0.01;
      positions[i3 + 1] += particles.velocities[i].y * 0.01;
      positions[i3 + 2] += particles.velocities[i].z * 0.01;

      // Reset if too far
      if (Math.abs(positions[i3]) > spread * 2 ||
          Math.abs(positions[i3 + 2]) > spread * 2 ||
          positions[i3 + 1] > height + spread * 2) {
        positions[i3] = (Math.random() - 0.5) * 0.5;
        positions[i3 + 1] = height;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Spiral energy effect (for Rasengan-type abilities)
function SpiralEffect({ color, radius = 0.3 }) {
  const spiralRef = useRef();

  useFrame((state) => {
    if (!spiralRef.current) return;
    spiralRef.current.rotation.y += 0.2;
    spiralRef.current.rotation.x += 0.1;
  });

  return (
    <group ref={spiralRef} position={[0, 0, 0.5]}>
      <mesh>
        <torusGeometry args={[radius, 0.05, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.7, 0.04, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Energy sphere (for Tailed Beast Bomb, etc.)
function EnergySphere({ color, scale = 1 }) {
  const sphereRef = useRef();

  useFrame((state) => {
    if (!sphereRef.current) return;
    const time = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(time * 10) * 0.2;
    sphereRef.current.scale.setScalar(scale * pulse);
  });

  return (
    <mesh ref={sphereRef} position={[0, 0, 0.5]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// Aura/Cloak effect
function AuraEffect({ color }) {
  const auraRef = useRef();

  useFrame((state) => {
    if (!auraRef.current) return;
    const time = state.clock.getElapsedTime();
    auraRef.current.rotation.y += 0.02;
    auraRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
  });

  return (
    <group ref={auraRef}>
      <mesh>
        <cylinderGeometry args={[0.8, 0.6, 2, 32, 1, true]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Main Ability Effects Component
export default function AbilityEffects({ activeAbility, powerUpLevel }) {
  if (!activeAbility) return null;

  const { effectType, color, particleColor } = activeAbility;

  return (
    <group>
      {/* Rasengan Effects */}
      {(effectType === 'rasengan' || effectType === 'sage_rasengan') && (
        <>
          <SpiralEffect color={color} />
          <ParticleEffect count={100} color={particleColor} spread={0.5} speed={2} height={0} />
        </>
      )}

      {/* Shadow Clone Effect */}
      {effectType === 'clone' && (
        <ParticleEffect count={80} color={particleColor} spread={1.5} speed={3} height={0} />
      )}

      {/* Summoning Effect */}
      {effectType === 'summoning' && (
        <>
          <ParticleEffect count={120} color={particleColor} spread={2} speed={4} height={-1} />
          <AuraEffect color={color} />
        </>
      )}

      {/* Frog Kata Effect */}
      {effectType === 'frog_kata' && (
        <>
          <ParticleEffect count={60} color={particleColor} spread={1.2} speed={1.5} height={0} />
          <mesh position={[0, -0.5, 0]}>
            <torusGeometry args={[1.5, 0.05, 16, 32]} rotation={[-Math.PI / 2, 0, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
              transparent
              opacity={0.5}
            />
          </mesh>
        </>
      )}

      {/* Sage Aura Effect */}
      {effectType === 'sage_aura' && (
        <>
          <AuraEffect color={color} />
          <ParticleEffect count={150} color={particleColor} spread={1} speed={2} height={-0.5} />
        </>
      )}

      {/* Tailed Beast Bomb */}
      {effectType === 'tailed_beast_bomb' && (
        <>
          <EnergySphere color={color} scale={1.5} />
          <ParticleEffect count={200} color={particleColor} spread={1} speed={3} height={0} />
        </>
      )}

      {/* Chakra Cloak */}
      {effectType === 'chakra_cloak' && (
        <>
          <AuraEffect color={color} />
          <ParticleEffect count={180} color={particleColor} spread={0.8} speed={2.5} height={-0.5} />
        </>
      )}

      {/* Kurama Avatar */}
      {effectType === 'kurama_avatar' && (
        <>
          <AuraEffect color={color} />
          <EnergySphere color={color} scale={2} />
          <ParticleEffect count={250} color={particleColor} spread={1.5} speed={3} height={0} />
          {/* Giant aura behind character */}
          <mesh position={[0, 0, -2]} scale={[2, 3, 1]}>
            <planeGeometry args={[2, 3]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.4}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
