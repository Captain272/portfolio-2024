import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Briefcase, Calendar, CheckCircle, MapPin } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent } from 'framer-motion';
import { experiences } from '../data/resume';

/* ─── 3D Shape Components (one per experience) ─── */

function FloatingShape({ children, speed = 1 }: { children: React.ReactNode; speed?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (!group.current) return;
    group.current.rotation.x = t * 0.25;
    group.current.rotation.y = t * 0.35;
    group.current.position.y = Math.sin(t * 0.7) * 0.15;
  });
  return <group ref={group}>{children}</group>;
}

// Stop 1: Founding Engineer — Dodecahedron + inner tetrahedron
function ShapeFounder() {
  return (
    <FloatingShape speed={1.1}>
      <mesh scale={1.3}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.3} wireframe transparent opacity={0.6} />
      </mesh>
      <mesh scale={0.6} rotation={[0.5, 0.5, 0]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4} wireframe transparent opacity={0.4} />
      </mesh>
    </FloatingShape>
  );
}

// Stop 2: AI Developer — Octahedron + orbiting sphere
function ShapeAI() {
  return (
    <FloatingShape speed={0.9}>
      <mesh scale={1.4}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4} wireframe transparent opacity={0.6} />
      </mesh>
      <mesh position={[1.8, 0, 0]} scale={0.15}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1} />
      </mesh>
    </FloatingShape>
  );
}

// Stop 3: Backend/NFT — Nested cubes
function ShapeBlockchain() {
  return (
    <FloatingShape speed={0.8}>
      <mesh scale={1.1}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.3} wireframe transparent opacity={0.6} />
      </mesh>
      <mesh scale={0.65} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} wireframe transparent opacity={0.4} />
      </mesh>
    </FloatingShape>
  );
}

// Stop 4: Full Stack — Torus Knot
function ShapeFullStack() {
  return (
    <FloatingShape speed={0.7}>
      <mesh scale={0.8}>
        <torusKnotGeometry args={[1, 0.3, 64, 8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} wireframe transparent opacity={0.6} />
      </mesh>
    </FloatingShape>
  );
}

// Stop 5: ML/AI — Nested icosahedrons
function ShapeML() {
  return (
    <FloatingShape speed={1.0}>
      <mesh scale={1.2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} wireframe transparent opacity={0.5} />
      </mesh>
      <mesh scale={0.7}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.4} wireframe transparent opacity={0.4} />
      </mesh>
    </FloatingShape>
  );
}

const SHAPES = [ShapeFounder, ShapeAI, ShapeBlockchain, ShapeFullStack, ShapeML];
const LABELS = ['System Architecture', 'AI Automation', 'Blockchain APIs', 'Full Stack', 'ML Pipelines'];

function Tech3DScene({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const Shape = SHAPES[index % SHAPES.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full"
    >
      <div className="w-full h-44 md:h-52">
        {isInView && (
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1]}>
            <ambientLight intensity={0.15} />
            <pointLight position={[3, 3, 3]} intensity={0.7} color="#00f0ff" />
            <pointLight position={[-3, -3, 3]} intensity={0.3} color="#8b5cf6" />
            <Shape />
          </Canvas>
        )}
      </div>
      <p className="text-center text-cyan-400/25 text-[10px] font-mono tracking-[0.2em] mt-1 uppercase">
        {LABELS[index % LABELS.length]}
      </p>
    </motion.div>
  );
}

/* ─── Particle Burst ─── */

function ParticleBurst({ active }: { active: boolean }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return { x: Math.cos(angle) * 30, y: Math.sin(angle) * 30 };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={active ? { x: [0, p.x], y: [0, p.y], opacity: [0, 1, 0], scale: [0, 1, 0] } : {}}
          transition={{ duration: 0.8, delay: i * 0.03, ease: 'easeOut' }}
          className="absolute w-1 h-1 rounded-full bg-cyan-400"
          style={{ boxShadow: '0 0 4px #00f0ff' }}
        />
      ))}
    </div>
  );
}

/* ─── Route Stop Marker ─── */

function RouteStop({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30% 0px -30% 0px' });

  return (
    <div ref={ref} className="relative flex items-center justify-center w-8 h-8">
      <ParticleBurst active={isInView} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: [0, 2.5, 2.5], opacity: [0, 0.3, 0] } : {}}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute w-6 h-6 rounded-full border border-cyan-400/40"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: [0, 0.4, 0.2], scale: [0.8, 1.3, 1.1] } : {}}
        transition={{ duration: 2, delay: 0.3, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute w-5 h-5 rounded-full bg-cyan-400/20"
        style={{ filter: 'blur(4px)' }}
      />

      <motion.div
        initial={{ scale: 0, rotate: 45 }}
        animate={isInView ? { scale: 1, rotate: 45 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
        className="relative w-3 h-3 rounded-sm bg-cyan-400 z-10"
        style={{ boxShadow: '0 0 12px rgba(0,240,255,0.8), 0 0 30px rgba(0,240,255,0.4)' }}
      />
    </div>
  );
}

/* ─── Experience Card ─── */

function ExperienceCard({ exp, index }: { exp: typeof experiences[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: [0, 0.15, 0.05] } : {}}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-violet-500/10 pointer-events-none"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-cyan-400 font-mono text-xs tracking-wider uppercase">Stop {index + 1}</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <h3 className="text-xl font-semibold text-white">{exp.title}</h3>
        </div>

        <div className="flex flex-wrap items-center text-gray-400 text-sm mb-3 gap-x-2">
          <span className="text-cyan-400 font-medium">{exp.company}</span>
          <span>|</span>
          <span>{exp.location}</span>
          <span>|</span>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{exp.period}</span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">{exp.description}</p>

        <ul className="space-y-2 mb-4">
          {exp.responsibilities.map((resp, idx) => (
            <li key={idx} className="flex items-start text-sm">
              <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">{resp}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {exp.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded-full border border-cyan-400/30 text-cyan-400 bg-cyan-400/5"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Travelling Cursor Arrow ─── */

function TravellingCursor({
  pathD,
  progress,
  svgHeight,
}: {
  pathD: string;
  progress: ReturnType<typeof useSpring>;
  svgHeight: number;
}) {
  const [pos, setPos] = useState({ x: 50, y: 20, angle: 90 });
  const pathElRef = useRef<SVGPathElement>(null);

  useMotionValueEvent(progress, 'change', (v) => {
    if (!pathElRef.current) return;
    const len = pathElRef.current.getTotalLength();
    const point = pathElRef.current.getPointAtLength(v * len);
    const ahead = pathElRef.current.getPointAtLength(Math.min(v * len + 2, len));
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * (180 / Math.PI);
    setPos({ x: point.x, y: point.y, angle });
  });

  return (
    <svg
      viewBox={`0 0 100 ${svgHeight}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <path ref={pathElRef} d={pathD} fill="none" stroke="none" />

      {/* Cursor group */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}>
        {/* Outer glow */}
        <circle cx="0" cy="0" r="6" fill="rgba(0,240,255,0.15)" filter="url(#cursorGlow)" />
        {/* Arrow body */}
        <polygon
          points="7,0 -4,-4 -1.5,0 -4,4"
          fill="#00f0ff"
          stroke="rgba(0,240,255,0.8)"
          strokeWidth="0.5"
        />
        {/* Bright core */}
        <circle cx="1" cy="0" r="1.5" fill="white" opacity="0.95" />
        {/* Trail dots */}
        <circle cx="-6" cy="0" r="0.8" fill="#00f0ff" opacity="0.5" />
        <circle cx="-10" cy="0" r="0.5" fill="#00f0ff" opacity="0.3" />
        <circle cx="-13" cy="0" r="0.3" fill="#00f0ff" opacity="0.15" />
      </g>

      <defs>
        <filter id="cursorGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/* ─── Main Experience Component ─── */

const Experience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 95%', 'end 5%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    restDelta: 0.0005,
  });

  const dashOffset = useTransform(smoothProgress, [0, 1], [pathLength, 0]);

  const measurePath = useCallback(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    measurePath();
    window.addEventListener('resize', measurePath);
    return () => window.removeEventListener('resize', measurePath);
  }, [measurePath]);

  // Build SVG route path — evenly distributed stops
  const total = experiences.length;
  const svgH = 1000;
  const pad = 30;
  const usable = svgH - pad * 2;
  const midX = 50;
  const amp = 15;

  const stopYs = Array.from({ length: total }, (_, i) => pad + usable * ((i + 0.5) / total));

  let pathD = `M ${midX} ${pad}`;
  for (let i = 0; i < total; i++) {
    const sy = stopYs[i];
    const dir = i % 2 === 0 ? 1 : -1;
    const sx = midX + dir * amp;
    const prevY = i === 0 ? pad : stopYs[i - 1];
    const prevDir = i === 0 ? 0 : ((i - 1) % 2 === 0 ? 1 : -1);
    const prevX = i === 0 ? midX : midX + prevDir * amp;
    const midY = (prevY + sy) / 2;
    pathD += ` C ${prevX} ${midY + 20}, ${sx} ${midY - 20}, ${sx} ${sy}`;
  }
  // Extend past last stop to the bottom
  const lastDir = (total - 1) % 2 === 0 ? 1 : -1;
  const lastX = midX + lastDir * amp;
  pathD += ` C ${lastX} ${stopYs[total - 1] + 30}, ${midX} ${svgH - pad - 20}, ${midX} ${svgH - pad}`;

  return (
    <section id="experience" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent text-glow-cyan">
            The Journey
          </span>
        </h2>

        <div ref={containerRef} className="relative">
          {/* SVG Route Path */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-12 pointer-events-none z-0">
            <svg viewBox={`0 0 100 ${svgH}`} className="w-full h-full" preserveAspectRatio="none" fill="none">
              {/* Dashed ghost trail */}
              <path
                d={pathD}
                stroke="rgba(0,240,255,0.06)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="4 6"
              />
              {/* Animated drawn path */}
              <motion.path
                ref={pathRef}
                d={pathD}
                stroke="url(#routeGrad)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                style={{ strokeDashoffset: dashOffset }}
              />
              {/* Wide glow layer */}
              <motion.path
                d={pathD}
                stroke="rgba(0,240,255,0.2)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                style={{ strokeDashoffset: dashOffset }}
                filter="url(#pathGlow)"
              />
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="pathGlow">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>

          {/* Travelling cursor */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-12 pointer-events-none z-20">
            <TravellingCursor pathD={pathD} progress={smoothProgress} svgHeight={svgH} />
          </div>

          {/* Experience rows */}
          {experiences.map((exp, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={index} className="relative mb-10 md:mb-12">
                {/* Card + route stop (card side determines height) */}
                <div
                  className={`relative pl-16 md:pl-0 md:w-[calc(50%-2rem)] ${
                    isEven ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10'
                  }`}
                >
                  {/* Route stop - mobile */}
                  <div className="absolute left-[14px] top-4 md:hidden z-10">
                    <RouteStop index={index} />
                  </div>

                  {/* Route stop - desktop */}
                  <div
                    className={`hidden md:block absolute top-4 z-10 ${
                      isEven ? 'right-[-22px]' : 'left-[-22px]'
                    }`}
                  >
                    <RouteStop index={index} />
                  </div>

                  {/* Connector line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true, margin: '-25%' }}
                    className={`hidden md:block absolute top-[22px] h-[1px] w-8 ${
                      isEven
                        ? 'right-[-2px] origin-right bg-gradient-to-l from-cyan-400/60 to-transparent'
                        : 'left-[-2px] origin-left bg-gradient-to-r from-cyan-400/60 to-transparent'
                    }`}
                  />

                  <ExperienceCard exp={exp} index={index} />
                </div>

                {/* 3D Scene on opposite side — desktop only */}
                <div
                  className={`hidden md:flex md:items-center md:justify-center absolute top-0 bottom-0 w-[calc(50%-3rem)] ${
                    isEven ? 'right-0' : 'left-0'
                  }`}
                >
                  <Tech3DScene index={index} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
