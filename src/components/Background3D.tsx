import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Points } from '@react-three/drei';
import * as THREE from 'three';

function RandomPoints({ count = 5000 }) {
  const points = useRef();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 50;     // x
    positions[i + 1] = (Math.random() - 0.5) * 50; // y
    positions[i + 2] = (Math.random() - 0.5) * 50; // z

    // Cyberpunk colors: pink, cyan, purple
    if (Math.random() < 0.33) {
      colors[i] = 1;     // R (pink)
      colors[i + 1] = 0; // G
      colors[i + 2] = 0.5; // B
    } else if (Math.random() < 0.66) {
      colors[i] = 0;     // R (cyan)
      colors[i + 1] = 1; // G
      colors[i + 2] = 1; // B
    } else {
      colors[i] = 0.44;     // R (purple)
      colors[i + 1] = 0; // G
      colors[i + 2] = 1; // B
    }
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <Points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

function NeonLines({ count = 100 }) {
  const lines = useRef();
  const positions = new Float32Array(count * 6); // 2 points per line * 3 coordinates
  const lineData = Array(count).fill(0).map(() => ({
    x: (Math.random() - 0.5) * 50,
    y: Math.random() * 100 - 50,
    z: (Math.random() - 0.5) * 50,
    speed: Math.random() * 0.5 + 0.5,
    length: Math.random() * 2 + 1
  }));

  useFrame(() => {
    if (lines.current) {
      const positions = lines.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        const line = lineData[i];
        line.y -= line.speed;
        if (line.y < -50) line.y = 50;

        const idx = i * 6;
        positions[idx] = line.x;
        positions[idx + 1] = line.y;
        positions[idx + 2] = line.z;
        positions[idx + 3] = line.x;
        positions[idx + 4] = line.y - line.length;
        positions[idx + 5] = line.z;
      }
      
      lines.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Initialize positions
  for (let i = 0; i < count; i++) {
    const line = lineData[i];
    const idx = i * 6;
    positions[idx] = line.x;
    positions[idx + 1] = line.y;
    positions[idx + 2] = line.z;
    positions[idx + 3] = line.x;
    positions[idx + 4] = line.y - line.length;
    positions[idx + 5] = line.z;
  }

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
      <lineBasicMaterial color="#00ff00" opacity={0.3} transparent />
    </lineSegments>
  );
}

const Background3D = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <div className="absolute inset-0 bg-black/90" />
      <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RandomPoints />
        <NeonLines />
        <fog attach="fog" args={['#000', 30, 100]} />
      </Canvas>
    </div>
  );
};

export default Background3D;