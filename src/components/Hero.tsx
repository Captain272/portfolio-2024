import { useRef, useState, useEffect, useMemo } from 'react';
import { ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { personalInfo } from '../data/resume';

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

function HeroParticles({ count = 4000 }) {
  const points = useRef<THREE.Points>(null!);
  const circleMap = useCircleTexture();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40;
      pos[i + 1] = (Math.random() - 0.5) * 30;
      pos[i + 2] = (Math.random() - 0.5) * 30 - 5;

      const r = Math.random();
      if (r < 0.4) {
        col[i] = 0; col[i + 1] = 0.94; col[i + 2] = 1;
      } else if (r < 0.7) {
        col[i] = 0.55; col[i + 1] = 0.36; col[i + 2] = 1;
      } else {
        col[i] = 0.96; col[i + 1] = 0.29; col[i + 2] = 0.78;
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.02;
    points.current.rotation.x = Math.sin(time * 0.01) * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.5} sizeAttenuation depthWrite={false} map={circleMap} />
    </points>
  );
}

function FloatingWireframe() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = time * 0.15;
    mesh.current.rotation.y = time * 0.2;
    mesh.current.position.y = Math.sin(time * 0.6) * 0.3;
    mesh.current.rotation.y += (state.pointer.x * 0.2 - mesh.current.rotation.y) * 0.01;
    mesh.current.rotation.x += (-state.pointer.y * 0.1 - mesh.current.rotation.x) * 0.01;
  });

  return (
    <mesh ref={mesh} position={[1.5, 0, 0]} scale={2.2}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#00f0ff"
        emissive="#00f0ff"
        emissiveIntensity={0.3}
        wireframe
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function MouseLight() {
  const light = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    if (!light.current) return;
    light.current.position.x = state.pointer.x * 8;
    light.current.position.y = state.pointer.y * 5;
    light.current.position.z = 3;
  });

  return <pointLight ref={light} color="#00f0ff" intensity={3} distance={15} decay={2} />;
}

function useTypingAnimation(strings: string[], typingSpeed = 80, deletingSpeed = 40, pauseDuration = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentString = strings[currentIndex];

    if (!isDeleting && displayText === currentString) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % strings.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentString.substring(0, displayText.length + 1));
      } else {
        setDisplayText(currentString.substring(0, displayText.length - 1));
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, strings, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
}

const Hero = () => {
  const typedText = useTypingAnimation([
    'AI Developer',
    'Full Stack Engineer',
    'Founding Engineer',
    'ML Pipeline Builder',
  ]);

  return (
    <section id="hero" className="min-h-screen relative overflow-hidden">
      {/* 3D Canvas background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 5, 10]} intensity={0.8} color="#00f0ff" />
          <pointLight position={[-10, -5, 5]} intensity={0.3} color="#8b5cf6" />
          <HeroParticles />
          <FloatingWireframe />
          <MouseLight />
          <fog attach="fog" args={['#050510', 10, 30]} />
        </Canvas>
      </div>

      {/* Text overlay */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-cyan-400/60 font-mono text-sm tracking-widest mb-6"
            >
              {'>'} hello_world
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight"
            >
              I'm{' '}
              <span
                className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.3))',
                }}
              >
                0xC4p
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg md:text-xl text-gray-400 font-mono mb-8 h-8"
            >
              <span className="text-cyan-400">$ </span>
              <span>{typedText}</span>
              <span className="typing-cursor" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-gray-500 text-base leading-relaxed mb-10 max-w-xl"
            >
              {personalInfo.bio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
              >
                View Projects
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-cyan-400/30 text-cyan-400 px-8 py-3 rounded-lg text-sm hover:bg-cyan-400/10 transition-colors"
              >
                Contact Me
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ArrowDown className="w-5 h-5 text-cyan-400/50" />
      </motion.div>
    </section>
  );
};

export default Hero;
