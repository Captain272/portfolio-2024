import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Individual chain link — materializes in place, then locks/pulls/shatters ───

function AnimatedLink({
  index,
  total,
  side,
  phase,
  phaseTime,
  color,
}: {
  index: number;
  total: number;
  side: 'left' | 'right';
  phase: string;
  phaseTime: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const dir = side === 'left' ? -1 : 1;

  // Each link's unique personality
  const seed = useMemo(() => ({
    // Random orbit while forming
    orbitRadius: 1.5 + Math.random() * 2.5,
    orbitSpeed: 0.6 + Math.random() * 0.8,
    orbitPhase: Math.random() * Math.PI * 2,
    orbitTilt: (Math.random() - 0.5) * Math.PI * 0.6,
    spinSpeed: 2 + Math.random() * 4,
    spinAxis: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize(),
    // For after-materialize sway
    wobbleSpeed: 1.5 + Math.random() * 2,
    wobbleAmp: 0.06 + Math.random() * 0.04,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.8 + Math.random() * 1.2,
    spinOffset: Math.random() * Math.PI * 2,
    // Shatter
    shatterVel: new THREE.Vector3(
      (Math.random() - 0.5 + dir * 0.3) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    ),
    shatterRot: new THREE.Vector3(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15
    ),
    // Staggered forge timing — inner links form first, outer links later
    forgeDelay: Math.abs(index - (total - 1) / 2) * 0.15 + Math.random() * 0.1,
  }), [dir, index, total]);

  // Where this link lives when the chain is formed
  const restPosition = useMemo(() => {
    const spacing = 0.55;
    const chainCenter = dir * 0.35;
    const x = chainCenter + (index - (total - 1) / 2) * spacing * dir;
    return new THREE.Vector3(x, 0, 0);
  }, [dir, index, total]);

  useFrame((state) => {
    if (!meshRef.current || !matRef.current) return;
    const t = state.clock.getElapsedTime();
    const mesh = meshRef.current;
    const mat = matRef.current;

    const tipIndex = side === 'left' ? 0 : total - 1;
    const distFromTip = Math.abs(index - tipIndex);
    const waveDelay = distFromTip * 0.12;

    // Base interlock rotation
    const baseRotX = index % 2 === 0 ? 0 : Math.PI / 2;

    if (phase === 'enter') {
      // Links start as scattered orbiting particles, then converge into chain formation
      const forgeStart = seed.forgeDelay;
      const forgeDuration = 1.6;
      const p = Math.max(0, Math.min((phaseTime - forgeStart) / forgeDuration, 1));

      // Smooth ease: fast start, gentle landing
      const eased = 1 - Math.pow(1 - p, 3);

      // Orbiting position (scattered state)
      const angle = t * seed.orbitSpeed + seed.orbitPhase;
      const orbitX = Math.cos(angle) * seed.orbitRadius * Math.cos(seed.orbitTilt);
      const orbitY = Math.sin(angle) * seed.orbitRadius * 0.6;
      const orbitZ = Math.sin(angle) * seed.orbitRadius * Math.sin(seed.orbitTilt);

      // Converge from orbit to rest position
      mesh.position.x = orbitX + (restPosition.x - orbitX) * eased;
      mesh.position.y = orbitY + (restPosition.y - orbitY) * eased;
      mesh.position.z = orbitZ + (restPosition.z - orbitZ) * eased;

      // Rapid wild spin → settle into chain rotation
      const spinFade = 1 - eased;
      mesh.rotation.x = baseRotX * eased + t * seed.spinSpeed * seed.spinAxis.x * spinFade;
      mesh.rotation.y = t * seed.spinSpeed * seed.spinAxis.y * spinFade + Math.sin(t * 2 + waveDelay) * 0.1 * eased;
      mesh.rotation.z = t * seed.spinSpeed * seed.spinAxis.z * spinFade;

      // Fade in + scale up as link forges
      const fadeP = Math.max(0, Math.min((phaseTime - forgeStart * 0.5) / 0.8, 1));
      mat.opacity = fadeP * 0.85;
      mesh.scale.setScalar(0.3 + eased * 0.7);

      // Pulsing glow while forming
      mat.emissiveIntensity = 0.3 + Math.sin(t * 8 + index) * 0.2 * spinFade + 0.5 * eased;

    } else if (phase === 'lock') {
      // Chains are formed — slide together slightly + link glow pulse
      const targetX = restPosition.x * 0.85; // compress slightly toward center
      mesh.position.x += (targetX - mesh.position.x) * 0.06;
      mesh.position.y = Math.sin(t * seed.swaySpeed + seed.swayPhase + waveDelay) * seed.wobbleAmp * 0.6;
      mesh.position.z = Math.sin(t * seed.wobbleSpeed * 0.7 + seed.spinOffset) * 0.05;

      mesh.rotation.x = baseRotX + Math.sin(t * 3 + waveDelay) * 0.04;
      mesh.rotation.y = Math.sin(t * 2.5 + seed.spinOffset) * 0.08;
      mesh.rotation.z = Math.sin(t * 1.5 + waveDelay) * 0.03;

      mat.opacity = 0.85;
      mesh.scale.setScalar(1);
      mat.emissiveIntensity = 0.5 + Math.sin(t * 6) * 0.15;

    } else if (phase === 'pull') {
      // Strain and shake
      const intensity = Math.min(phaseTime * 0.8, 1);
      const spacing = 0.55;
      const chainCenter = dir * 0.35;
      const restX = chainCenter + (index - (total - 1) / 2) * spacing * dir;

      const pullForce = distFromTip * 0.04 * intensity * dir;
      const shake = Math.sin(t * 30 + index * 1.5) * 0.06 * intensity;
      const shakeY = Math.sin(t * 25 + index * 2) * 0.05 * intensity;
      const shakeZ = Math.cos(t * 20 + index * 1.8) * 0.04 * intensity;

      mesh.position.x = restX + pullForce + shake;
      mesh.position.y = shakeY + Math.sin(t * seed.swaySpeed * 2 + seed.swayPhase) * 0.03;
      mesh.position.z = shakeZ;

      mesh.rotation.x = baseRotX + Math.sin(t * 15 + waveDelay) * 0.12 * intensity;
      mesh.rotation.y = Math.sin(t * 18 + seed.spinOffset) * 0.1 * intensity;
      mesh.rotation.z = Math.sin(t * 22 + index) * 0.08 * intensity;

      mat.emissiveIntensity = 0.5 + Math.sin(t * 10 + index) * 0.3 * intensity;
      mat.opacity = 0.85;
      mesh.scale.setScalar(1);

    } else if (phase === 'shatter') {
      mesh.position.x += seed.shatterVel.x * 0.025;
      mesh.position.y += seed.shatterVel.y * 0.025;
      mesh.position.z += seed.shatterVel.z * 0.025;
      seed.shatterVel.y -= 0.08;

      mesh.rotation.x += seed.shatterRot.x * 0.02;
      mesh.rotation.y += seed.shatterRot.y * 0.02;
      mesh.rotation.z += seed.shatterRot.z * 0.02;

      if (mat.opacity > 0) mat.opacity -= 0.012;
    }
  });

  return (
    <mesh ref={meshRef} scale={0.3}>
      <torusGeometry args={[0.32, 0.07, 14, 36]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Forge sparks — particles that fly toward forming links ───

function ForgeSparks({ phase, phaseTime }: { phase: string; phaseTime: number }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 200;

  const [positions, velocities, colors, targets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tgt = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Start scattered far out
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 4;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 3;
      // Target near center (chain area)
      tgt[i * 3] = (Math.random() - 0.5) * 2;
      tgt[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      tgt[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      vel[i * 3] = 0; vel[i * 3 + 1] = 0; vel[i * 3 + 2] = 0;
      // Cyan/purple sparks
      const c = Math.random();
      if (c < 0.5) { col[i*3]=0; col[i*3+1]=0.94; col[i*3+2]=1; }
      else { col[i*3]=0.55; col[i*3+1]=0.36; col[i*3+2]=1; }
    }
    return [pos, vel, col, tgt];
  }, []);

  const circleMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(8,8,0,8,8,8);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,16,16);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pa = ref.current.geometry.attributes.position.array as Float32Array;
    const mat = ref.current.material as THREE.PointsMaterial;

    if (phase === 'enter') {
      // Particles spiral inward toward chain formation area
      const convergence = Math.min(phaseTime / 2.5, 1);
      for (let i = 0; i < count * 3; i += 3) {
        const dx = tgt[i] - pa[i];
        const dy = tgt[i+1] - pa[i+1];
        const dz = tgt[i+2] - pa[i+2];
        pa[i] += dx * 0.015 * convergence;
        pa[i+1] += dy * 0.015 * convergence;
        pa[i+2] += dz * 0.015 * convergence;
        // Slight orbital drift
        pa[i] += Math.sin(phaseTime * 2 + i) * 0.005;
        pa[i+1] += Math.cos(phaseTime * 3 + i * 0.5) * 0.003;
      }
      mat.opacity = Math.max(0, 0.7 - convergence * 0.5);
    } else if (phase === 'lock') {
      // Remaining sparks dissipate
      for (let i = 0; i < count * 3; i += 3) {
        pa[i] += (Math.random() - 0.5) * 0.02;
        pa[i+1] += 0.01;
        pa[i+2] += (Math.random() - 0.5) * 0.02;
      }
      if (mat.opacity > 0) mat.opacity -= 0.02;
    } else {
      mat.opacity = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.7} depthWrite={false} map={circleMap} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── Energy ring that forms at center when chains lock ───

function LockRing({ phase, phaseTime }: { phase: string; phaseTime: number }) {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.getElapsedTime();
    const mat = ringRef.current.material as THREE.MeshStandardMaterial;

    if (phase === 'enter') {
      // Faint ring forming
      const p = Math.min(phaseTime / 2.5, 1);
      ringRef.current.scale.setScalar(0.3 + p * 0.7);
      mat.opacity = p * 0.2;
      ringRef.current.rotation.z = t * 0.5;
    } else if (phase === 'lock') {
      ringRef.current.scale.setScalar(1);
      mat.opacity = 0.4 + Math.sin(t * 8) * 0.15;
      mat.emissiveIntensity = 1 + Math.sin(t * 6) * 0.3;
      ringRef.current.rotation.z = t * 1.5;
    } else if (phase === 'pull') {
      mat.opacity = 0.6 + Math.sin(t * 12) * 0.2;
      mat.emissiveIntensity = 1.5 + Math.sin(t * 10) * 0.5;
      ringRef.current.rotation.z = t * 3;
      // Pulsate scale
      ringRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.1);
    } else {
      mat.opacity = 0;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} scale={0.3}>
      <ringGeometry args={[0.5, 0.65, 64]} />
      <meshStandardMaterial
        color="#00f0ff"
        emissive="#00f0ff"
        emissiveIntensity={0.5}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Collision sparks + energy ring ───

function CollisionEffects({ phase }: { phase: string }) {
  const sparksRef = useRef<THREE.Points>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const count = 300;

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 0.18 + 0.06;
      vel[i * 3] = Math.cos(angle) * Math.cos(elev) * speed;
      vel[i * 3 + 1] = Math.sin(elev) * speed;
      vel[i * 3 + 2] = Math.sin(angle) * Math.cos(elev) * speed;
      const c = Math.random();
      if (c < 0.4) { col[i*3]=0; col[i*3+1]=0.94; col[i*3+2]=1; }
      else if (c < 0.7) { col[i*3]=0.55; col[i*3+1]=0.36; col[i*3+2]=1; }
      else { col[i*3]=1; col[i*3+1]=1; col[i*3+2]=1; }
    }
    return [pos, vel, col];
  }, []);

  const circleMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(8,8,0,8,8,8);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,16,16);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => {
    if (!sparksRef.current || phase !== 'shatter') return;
    const pa = sparksRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count * 3; i += 3) {
      pa[i] += velocities[i];
      pa[i+1] += velocities[i+1];
      pa[i+2] += velocities[i+2];
      velocities[i+1] -= 0.0015;
    }
    sparksRef.current.geometry.attributes.position.needsUpdate = true;
    const mat = sparksRef.current.material as THREE.PointsMaterial;
    if (mat.opacity > 0) mat.opacity -= 0.006;

    if (ringRef.current) {
      ringRef.current.scale.x += 0.08;
      ringRef.current.scale.y += 0.08;
      const rmat = ringRef.current.material as THREE.MeshStandardMaterial;
      if (rmat.opacity > 0) rmat.opacity -= 0.015;
    }
  });

  if (phase !== 'shatter') return null;

  return (
    <>
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={1} depthWrite={false} map={circleMap} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 64]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ─── Shatter debris ───

function Debris({ phase }: { phase: string }) {
  const groupRef = useRef<THREE.Group>(null!);
  const fragCount = 40;
  const frags = useMemo(() => Array.from({ length: fragCount }, () => ({
    vel: new THREE.Vector3((Math.random()-0.5)*0.25, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.25),
    rotV: new THREE.Vector3((Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4, (Math.random()-0.5)*0.4),
    scale: Math.random()*0.12+0.04,
    color: ['#00f0ff','#8b5cf6','#ec4899'][Math.floor(Math.random()*3)],
    geo: Math.floor(Math.random()*3),
  })), []);

  useFrame(() => {
    if (!groupRef.current || phase !== 'shatter') return;
    groupRef.current.children.forEach((child, i) => {
      const m = child as THREE.Mesh;
      const f = frags[i];
      m.position.add(f.vel);
      m.rotation.x += f.rotV.x;
      m.rotation.y += f.rotV.y;
      m.rotation.z += f.rotV.z;
      f.vel.y -= 0.003;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat.opacity > 0) mat.opacity -= 0.008;
    });
  });

  if (phase !== 'shatter') return null;
  return (
    <group ref={groupRef}>
      {frags.map((f, i) => (
        <mesh key={i} scale={f.scale}>
          {f.geo === 0 && <tetrahedronGeometry args={[1,0]} />}
          {f.geo === 1 && <octahedronGeometry args={[1,0]} />}
          {f.geo === 2 && <boxGeometry args={[1,1,1]} />}
          <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.8} wireframe transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Camera controller ───

function CameraController({ phase, phaseTime }: { phase: string; phaseTime: number }) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cam = state.camera;

    if (phase === 'enter') {
      // Slow orbit around the forming chains
      const orbitP = Math.min(phaseTime / 3, 1);
      cam.position.x = Math.sin(t * 0.4) * (0.5 - orbitP * 0.3);
      cam.position.y = Math.cos(t * 0.3) * 0.3 * (1 - orbitP * 0.5);
      cam.position.z = 6 - orbitP * 1; // slowly zoom in as chains form
    } else if (phase === 'lock') {
      cam.position.z = 5 - Math.min(phaseTime * 0.3, 0.5);
      cam.position.x = Math.sin(t * 0.4) * 0.1;
      cam.position.y = Math.cos(t * 0.3) * 0.1;
    } else if (phase === 'pull') {
      const intensity = Math.min(phaseTime * 0.3, 1) * 0.08;
      cam.position.x = (Math.random() - 0.5) * intensity;
      cam.position.y = (Math.random() - 0.5) * intensity;
      cam.position.z = 4.5;
    } else if (phase === 'shatter') {
      const decay = Math.max(0, 1 - phaseTime * 0.8);
      cam.position.x = (Math.random() - 0.5) * 0.2 * decay;
      cam.position.y = (Math.random() - 0.5) * 0.2 * decay;
      cam.position.z = 4.5 + phaseTime * 0.3;
    }
  });
  return null;
}

// ─── Ambient floating particles ───

function AmbientDust() {
  const ref = useRef<THREE.Points>(null!);
  const count = 400;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random()-0.5)*12;
      pos[i*3+1] = (Math.random()-0.5)*8;
      pos[i*3+2] = (Math.random()-0.5)*8;
      col[i*3] = 0; col[i*3+1] = 0.94; col[i*3+2] = 1;
    }
    return [pos, col];
  }, []);

  const circleMap = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(4,4,0,4,4,4);
    g.addColorStop(0, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,8,8);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.3} depthWrite={false} map={circleMap} sizeAttenuation />
    </points>
  );
}

// ─── Main scene ───

function ChainScene({ phase, phaseTime }: { phase: string; phaseTime: number }) {
  const linksPerSide = 6;

  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[5, 3, 5]} intensity={0.8} color="#00f0ff" />
      <pointLight position={[-5, -3, 5]} intensity={0.5} color="#8b5cf6" />

      {/* Forge glow — bright center light while links are forming */}
      {phase === 'enter' && (
        <pointLight
          position={[0, 0, 1]}
          intensity={Math.min(phaseTime * 0.5, 1.5)}
          color="#00f0ff"
          distance={6}
        />
      )}
      {/* Flash on lock */}
      {phase === 'lock' && phaseTime < 0.5 && (
        <pointLight position={[0, 0, 2]} intensity={4 * (1 - phaseTime * 2)} color="#ffffff" distance={6} />
      )}
      {/* Energy glow during pull */}
      {phase === 'pull' && (
        <pointLight position={[0, 0, 1]} intensity={1 + Math.sin(phaseTime * 10) * 0.5} color="#00f0ff" distance={4} />
      )}

      {/* Forge sparks — particles converging during enter phase */}
      <ForgeSparks phase={phase} phaseTime={phaseTime} />

      {/* Energy ring at center */}
      <LockRing phase={phase} phaseTime={phaseTime} />

      {/* Left chain (cyan) */}
      {Array.from({ length: linksPerSide }, (_, i) => (
        <AnimatedLink
          key={`l-${i}`}
          index={i}
          total={linksPerSide}
          side="left"
          phase={phase}
          phaseTime={phaseTime}
          color="#00f0ff"
        />
      ))}

      {/* Right chain (purple) */}
      {Array.from({ length: linksPerSide }, (_, i) => (
        <AnimatedLink
          key={`r-${i}`}
          index={i}
          total={linksPerSide}
          side="right"
          phase={phase}
          phaseTime={phaseTime}
          color="#8b5cf6"
        />
      ))}

      <CollisionEffects phase={phase} />
      <Debris phase={phase} />
      <AmbientDust />
      <CameraController phase={phase} phaseTime={phaseTime} />
      <fog attach="fog" args={['#050510', 5, 14]} />
    </>
  );
}

// ─── Main component ───

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'lock' | 'pull' | 'shatter'>('enter');
  const [visible, setVisible] = useState(true);
  const [phaseTime, setPhaseTime] = useState(0);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Progress timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1.2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Phase time tracker
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setPhaseTime((Date.now() - start) / 1000);
    }, 16);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase transitions
  useEffect(() => {
    if (progress >= 30 && phase === 'enter') {
      setPhase('lock');
      setPhaseTime(0);
    }
    if (progress >= 55 && phase === 'lock') {
      setPhase('pull');
      setPhaseTime(0);
    }
    if (progress >= 82 && phase === 'pull') {
      setPhase('shatter');
      setPhaseTime(0);
    }
  }, [progress, phase]);

  // Completion
  useEffect(() => {
    if (progress >= 100) {
      const t1 = setTimeout(() => setVisible(false), 900);
      const t2 = setTimeout(() => onComplete(), 1300);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress, onComplete]);

  const phaseLabel =
    phase === 'enter' ? 'FORGING LINKS'
    : phase === 'lock' ? 'CHAINS LOCKED'
    : phase === 'pull' ? 'BREAKING FREE'
    : 'UNLEASHED';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-[#050510]"
        >
          {/* 3D Scene */}
          <div className="w-full h-full absolute inset-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]}>
              <ChainScene phase={phase} phaseTime={phaseTime} />
            </Canvas>
          </div>

          {/* Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div className="flex flex-col items-center">
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: phase === 'shatter' ? [1, 1.15, 1] : 1,
                }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-7xl font-mono font-bold select-none glitch-text"
                data-text="0xC4p"
                style={{
                  color: '#00f0ff',
                  textShadow:
                    phase === 'shatter'
                      ? '0 0 60px rgba(0,240,255,0.9), 0 0 120px rgba(139,92,246,0.6)'
                      : phase === 'pull'
                        ? '0 0 50px rgba(0,240,255,0.7), 0 0 100px rgba(0,240,255,0.3)'
                        : '0 0 40px rgba(0,240,255,0.5), 0 0 80px rgba(0,240,255,0.2)',
                }}
              >
                0xC4p
              </motion.h1>

              <motion.p
                key={phaseLabel}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-cyan-400/60 text-xs font-mono tracking-[0.3em] mt-4"
              >
                {phaseLabel}
              </motion.p>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center z-10">
            <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background:
                    phase === 'shatter'
                      ? 'linear-gradient(90deg, #00f0ff, #8b5cf6, #ec4899)'
                      : phase === 'pull'
                        ? 'linear-gradient(90deg, #00f0ff, #ec4899)'
                        : 'linear-gradient(90deg, #00f0ff, #8b5cf6)',
                }}
              />
            </div>
            <p className="text-cyan-400/60 text-xs mt-3 font-mono tracking-widest">
              {Math.min(Math.round(progress), 100)}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
