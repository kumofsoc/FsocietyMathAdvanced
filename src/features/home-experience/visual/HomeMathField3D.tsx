import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { HomeMotionTier } from "../model/homeExperience";
import type { HomeCanvasPalette } from "./useHomeCanvasRuntime";
import { useHomeCanvasRuntime } from "./useHomeCanvasRuntime";

function MathField({ palette }: { palette: HomeCanvasPalette }) {
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
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={0.42}
          metalness={0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>
      <mesh rotation={[1.15, -0.4, 0]}>
        <torusGeometry args={[2.25, 0.014, 8, 180]} />
        <meshBasicMaterial color={palette.accent2} transparent opacity={0.48} />
      </mesh>
      <mesh rotation={[0.25, 0.85, 0.5]}>
        <torusGeometry args={[1.85, 0.01, 8, 180]} />
        <meshBasicMaterial color={palette.text} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function FieldFallback() {
  return (
    <div className="math-field-fallback" aria-hidden="true">
      <i /><i /><i /><span>∇</span>
    </div>
  );
}

export function HomeMathField3D({ tier }: { tier: HomeMotionTier }) {
  const { containerRef, palette, shouldRenderCanvas } = useHomeCanvasRuntime(tier);

  return (
    <div ref={containerRef} className="math-field-runtime" aria-hidden="true">
      {!shouldRenderCanvas ? (
        <FieldFallback />
      ) : (
        <div className="math-field-canvas">
          <Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 6], fov: 48 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 4]} intensity={3.5} color={palette.accent} />
            <pointLight position={[-3, -2, 3]} intensity={18} color={palette.accent2} />
            <MathField palette={palette} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
