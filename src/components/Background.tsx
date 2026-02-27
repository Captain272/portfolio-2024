import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

function CyberpunkGrid() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') },
  }), []);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      vec2 grid = abs(fract(vUv * 40.0 - 0.5) - 0.5) / fwidth(vUv * 40.0);
      float line = min(grid.x, grid.y);
      float gridAlpha = 1.0 - min(line, 1.0);

      float dist = distance(vUv, vec2(0.5));
      float pulse = sin(dist * 10.0 - uTime * 2.0) * 0.5 + 0.5;
      float fade = 1.0 - smoothstep(0.3, 0.5, dist);
      float alpha = gridAlpha * fade * (0.15 + pulse * 0.1);

      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function EnhancedParticles({ count = 8000 }) {
  const points = useRef<THREE.Points>(null!);
  const initialPositions = useRef<Float32Array>(null!);
  const circleMap = useCircleTexture();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 60;
      pos[i + 1] = (Math.random() - 0.5) * 60;
      pos[i + 2] = (Math.random() - 0.5) * 60;

      const r = Math.random();
      if (r < 0.4) {
        col[i] = 0; col[i + 1] = 0.94; col[i + 2] = 1; // cyan
      } else if (r < 0.7) {
        col[i] = 0.48; col[i + 1] = 0.18; col[i + 2] = 0.96; // purple
      } else {
        col[i] = 0.93; col[i + 1] = 0.29; col[i + 2] = 0.6; // pink
      }
    }
    return [pos, col];
  }, [count]);

  useEffect(() => {
    initialPositions.current = new Float32Array(positions);
  }, [positions]);

  useFrame((state) => {
    if (!points.current || !initialPositions.current) return;
    const time = state.clock.getElapsedTime();

    points.current.rotation.y = time * 0.03;
    points.current.rotation.x = Math.sin(time * 0.02) * 0.1;

    const mouseX = state.pointer.x * 15;
    const mouseY = state.pointer.y * 15;

    const posArray = points.current.geometry.attributes.position.array as Float32Array;
    const initPos = initialPositions.current;

    for (let i = 0; i < count * 3; i += 3) {
      const dx = initPos[i] - mouseX;
      const dy = initPos[i + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5 && dist > 0) {
        const force = (5 - dist) * 0.3;
        posArray[i] = initPos[i] + (dx / dist) * force;
        posArray[i + 1] = initPos[i + 1] + (dy / dist) * force;
      } else {
        posArray[i] = initPos[i];
        posArray[i + 1] = initPos[i + 1];
      }
      posArray[i + 2] = initPos[i + 2] + Math.sin(time + i) * 0.02;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} vertexColors transparent opacity={0.4} sizeAttenuation depthWrite={false} map={circleMap} />
    </points>
  );
}

function MatrixRain({ count = 200 }) {
  const lines = useRef<THREE.LineSegments>(null!);

  const lineData = useMemo(() =>
    Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 80,
      y: Math.random() * 100 - 50,
      z: (Math.random() - 0.5) * 80,
      speed: Math.random() * 0.9 + 0.3,
      length: Math.random() * 2.5 + 0.5,
    })), [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const line = lineData[i];
      const idx = i * 6;
      pos[idx] = line.x;
      pos[idx + 1] = line.y;
      pos[idx + 2] = line.z;
      pos[idx + 3] = line.x;
      pos[idx + 4] = line.y - line.length;
      pos[idx + 5] = line.z;
    }
    return pos;
  }, [count, lineData]);

  useFrame(() => {
    if (!lines.current) return;
    const posArray = lines.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const line = lineData[i];
      line.y -= line.speed;
      if (line.y < -50) line.y = 50;

      const idx = i * 6;
      posArray[idx] = line.x;
      posArray[idx + 1] = line.y;
      posArray[idx + 2] = line.z;
      posArray[idx + 3] = line.x;
      posArray[idx + 4] = line.y - line.length;
      posArray[idx + 5] = line.z;
    }
    lines.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00f0ff" opacity={0.04} transparent />
    </lineSegments>
  );
}

function MouseLight() {
  const light = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    if (!light.current) return;
    light.current.position.x = state.pointer.x * 20;
    light.current.position.y = state.pointer.y * 20;
    light.current.position.z = 5;
  });

  return <pointLight ref={light} color="#00f0ff" intensity={2} distance={30} decay={2} />;
}

function ScrollCameraController() {
  const { camera } = useThree();

  useFrame(() => {
    const scroll = window.scrollY;
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = scroll / maxScroll;

    camera.position.y = -progress * 5;
    camera.rotation.x = progress * 0.1;
  });

  return null;
}

const Background = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10" style={{ background: '#050510' }}>
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00f0ff" />
        <pointLight position={[-10, -10, 10]} intensity={0.3} color="#8b5cf6" />
        <CyberpunkGrid />
        <EnhancedParticles />
        <MatrixRain />
        <MouseLight />
        <ScrollCameraController />
        <fog attach="fog" args={['#050510', 25, 80]} />
      </Canvas>
    </div>
  );
};

export default Background;
