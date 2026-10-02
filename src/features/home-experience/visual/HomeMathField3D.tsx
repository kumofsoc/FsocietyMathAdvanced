import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { HomeMotionTier } from "../model/homeExperience";

function MathField() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.09;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh rotation={[0.7, 0.2, 0.35]}>
        <torusKnotGeometry args={[1.35, 0.18, 180, 24, 2, 5]} />
        <meshStandardMaterial
          color="#a9a1ff"
          emissive="#675dff"
          emissiveIntensity={0.42}
          metalness={0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>
      <mesh rotation={[1.15, -0.4, 0]}>
        <torusGeometry args={[2.25, 0.014, 8, 180]} />
        <meshBasicMaterial color="#6fe7d7" transparent opacity={0.48} />
      </mesh>
      <mesh rotation={[0.25, 0.85, 0.5]}>
        <torusGeometry args={[1.85, 0.01, 8, 180]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export function HomeMathField3D({ tier }: { tier: HomeMotionTier }) {
  if (tier !== "cinematic") {
    return (
      <div className="math-field-fallback" aria-hidden="true">
        <i /><i /><i /><span>∇</span>
      </div>
    );
  }

  return (
    <div className="math-field-canvas" aria-hidden="true">
      <Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 6], fov: 48 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={3.5} color="#8074ff" />
        <pointLight position={[-3, -2, 3]} intensity={18} color="#6fe7d7" />
        <MathField />
      </Canvas>
    </div>
  );
}
