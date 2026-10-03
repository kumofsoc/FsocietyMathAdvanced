import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";
import { MOTION_CHANGE_EVENT, parseMotionProfile } from "@/features/home-experience/model/homeExperience";

function backdropMotionEnabled() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 820px)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;

  const profile = parseMotionProfile(
    document.documentElement.dataset.motionProfile ?? null,
  );
  return profile === "full" || profile === "balanced";
}

function ScrollGeometry() {
  const knot = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    const progress =
      document.documentElement.scrollTop /
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    if (knot.current) {
      knot.current.rotation.x += delta * 0.06;
      knot.current.rotation.y = progress * Math.PI * 1.4;
      knot.current.position.y = 1.4 - progress * 2.8;
    }

    if (core.current) {
      core.current.rotation.x = progress * Math.PI;
      core.current.rotation.z += delta * 0.04;
      core.current.scale.setScalar(0.8 + progress * 0.45);
    }
  });

  return (
    <>
      <mesh ref={knot} position={[4.2, 1.4, -7]}>
        <torusKnotGeometry args={[1.2, 0.16, 120, 12]} />
        <meshBasicMaterial color="#7c72ff" wireframe transparent opacity={0.12} />
      </mesh>
      <mesh ref={core} position={[-4.5, -1.8, -8]}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#55d9c0" wireframe transparent opacity={0.08} />
      </mesh>
    </>
  );
}

export function MathBackdrop() {
  const [enabled, setEnabled] = useState(backdropMotionEnabled);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const refresh = () => setEnabled(backdropMotionEnabled());

    window.addEventListener(MOTION_CHANGE_EVENT, refresh);
    media.addEventListener("change", refresh);

    return () => {
      window.removeEventListener(MOTION_CHANGE_EVENT, refresh);
      media.removeEventListener("change", refresh);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="math-backdrop" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.25]}>
        <ScrollGeometry />
      </Canvas>
    </div>
  );
}
