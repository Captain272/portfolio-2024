import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

function useCircleTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function SwirlingParticles({ exploding }: { exploding: boolean }) {
  const points = useRef<THREE.Points>(null!);
  const circleMap = useCircleTexture();
  const count = 2500;

  const [positions, colors, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 2 + 0.5;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;

      const c = Math.random();
      if (c < 0.5) {
        col[i * 3] = 0; col[i * 3 + 1] = 0.94; col[i * 3 + 2] = 1;
      } else if (c < 0.8) {
        col[i * 3] = 0.55; col[i * 3 + 1] = 0.36; col[i * 3 + 2] = 1;
      } else {
        col[i * 3] = 0.96; col[i * 3 + 1] = 0.29; col[i * 3 + 2] = 0.78;
      }

      const speed = Math.random() * 0.12 + 0.04;
      vel[i * 3] = (pos[i * 3] / r) * speed;
      vel[i * 3 + 1] = (pos[i * 3 + 1] / r) * speed;
      vel[i * 3 + 2] = (pos[i * 3 + 2] / r) * speed;
    }
    return [pos, col, vel];
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.getElapsedTime();
    const posArray = points.current.geometry.attributes.position.array as Float32Array;

    if (exploding) {
      for (let i = 0; i < count * 3; i += 3) {
        posArray[i] += velocities[i] * 0.5;
        posArray[i + 1] += velocities[i + 1] * 0.5;
        posArray[i + 2] += velocities[i + 2] * 0.5;
      }
    } else {
      points.current.rotation.y = time * 0.3;
      points.current.rotation.x = Math.sin(time * 0.2) * 0.15;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} map={circleMap} />
    </points>
  );
}

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exploding, setExploding] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setExploding(true), 200);
      setTimeout(() => setVisible(false), 1200);
      setTimeout(() => onComplete(), 1500);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center"
        >
          <div className="w-full h-full absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 5, 5]} intensity={1} color="#00f0ff" />
              <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />
              <SwirlingParticles exploding={exploding} />
              <fog attach="fog" args={['#050510', 6, 15]} />
            </Canvas>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-mono font-bold select-none glitch-text"
              data-text="0xC4p"
              style={{
                color: '#00f0ff',
                textShadow: '0 0 40px rgba(0,240,255,0.5), 0 0 80px rgba(0,240,255,0.2)',
              }}
            >
              0xC4p
            </motion.h1>
          </div>

          <div className="absolute bottom-20 flex flex-col items-center z-10">
            <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-cyan-400/60 text-xs mt-3 font-mono tracking-widest">
              INITIALIZING {progress}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
