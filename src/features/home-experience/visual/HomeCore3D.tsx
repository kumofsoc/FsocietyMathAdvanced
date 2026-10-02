import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import type { HomeMotionTier } from "../model/homeExperience";

function CoreObject() {
  const group = useRef<Group>(null);
  const inner = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.16;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.28) * 0.12;
    }
    if (inner.current) {
      inner.current.rotation.x -= delta * 0.34;
      inner.current.rotation.z += delta * 0.23;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshPhysicalMaterial
          color="#11131b"
          roughness={0.18}
          metalness={0.72}
          transmission={0.22}
          thickness={0.8}
          emissive="#5d52ff"
          emissiveIntensity={0.18}
          wireframe
        />
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[0.76, 1]} />
        <meshStandardMaterial
          color="#d9dcff"
          emissive="#6f63ff"
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.24}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.25, 0]}>
        <torusGeometry args={[1.9, 0.018, 10, 180]} />
        <meshBasicMaterial color="#6fe7d7" transparent opacity={0.62} />
      </mesh>
      <mesh rotation={[0.28, Math.PI / 2.25, 0.6]}>
        <torusGeometry args={[2.18, 0.012, 10, 180]} />
        <meshBasicMaterial color="#c6beff" transparent opacity={0.34} />
      </mesh>
    </group>
  );
}

export function HomeCore3D({ tier }: { tier: HomeMotionTier }) {
  if (tier !== "cinematic") {
    return (
      <div className="future-core-fallback" aria-hidden="true">
        <i className="future-core-shell shell-a" />
        <i className="future-core-shell shell-b" />
        <i className="future-core-shell shell-c" />
        <b>VM</b>
      </div>
    );
  }

  return (
    <div className="future-core-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.75} />
        <pointLight position={[3, 3, 4]} intensity={24} color="#7067ff" />
        <pointLight position={[-4, -1, 2]} intensity={18} color="#6fe7d7" />
        <CoreObject />
      </Canvas>
    </div>
  );
}
