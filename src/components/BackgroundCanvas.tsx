"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Line, Grid } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

function randomInSphere(radius: number): Vec3 {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

function NodeSphere({ position, hue }: { position: Vec3; hue: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.9 + 0.2 * Math.sin(t * 1.6 + hue * 10);
    ref.current.scale.setScalar(pulse);
    ref.current.rotation.y = t * 0.1;
  });
  const color = new THREE.Color().setHSL(hue, 0.7, 0.6);
  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.13, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.4} roughness={0.3} />
    </mesh>
  );
}

function Network() {
  const nodes = useMemo(() => {
    const arr: { p: Vec3; hue: number }[] = [];
    for (let i = 0; i < 28; i++) {
      arr.push({ p: randomInSphere(3.5), hue: 0.55 + (i % 7) * 0.02 });
    }
    return arr;
  }, []);

  const edges = useMemo(() => {
    const pairs: Array<[Vec3, Vec3]> = [];
    // connect each node to its two nearest neighbors
    for (let i = 0; i < nodes.length; i++) {
      const distances = nodes
        .map((n, j) => ({ j, d: Math.hypot(n.p[0] - nodes[i].p[0], n.p[1] - nodes[i].p[1], n.p[2] - nodes[i].p[2]) }))
        .filter((e) => e.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      distances.forEach(({ j }) => pairs.push([nodes[i].p, nodes[j].p]));
    }
    return pairs;
  }, [nodes]);

  return (
    <group>
      {nodes.map((n, idx) => (
        <NodeSphere key={idx} position={n.p} hue={n.hue} />
      ))}
      {edges.map((pair, idx) => (
        <Line key={idx} points={pair} color="#7dd3fc" transparent opacity={0.35} dashed dashSize={0.2} gapSize={0.6} />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 2]} intensity={1.2} color={new THREE.Color("#93c5fd")} />
      <Network />
      <Stars radius={80} depth={20} count={1200} factor={4} fade speed={0.6} />
      <Grid infiniteGrid sectionColor="#ffffff22" cellColor="#ffffff10" position={[0, -4.5, 0]} args={[16, 16]} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export function BackgroundCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <Scene />
      </Canvas>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
    </div>
  );
}