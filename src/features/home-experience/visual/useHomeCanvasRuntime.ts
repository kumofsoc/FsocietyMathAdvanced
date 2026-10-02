import { useEffect, useRef, useState } from "react";
import type { HomeMotionTier } from "../model/homeExperience";

export interface HomeCanvasPalette {
  bg: string;
  surface: string;
  text: string;
  accent: string;
  accent2: string;
}

function readPalette(): HomeCanvasPalette {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    bg: read("--bg", "#050507"),
    surface: read("--surface", "#0d0d12"),
    text: read("--text", "#f5f5f7"),
    accent: read("--accent", "#8b7cff"),
    accent2: read("--accent2", "#36e4c2"),
  };
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }),
    );
  } catch {
    return false;
  }
}

export function useHomeCanvasRuntime(tier: HomeMotionTier) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState<HomeCanvasPalette>(() => readPalette());
  const [webglSupported] = useState(() => supportsWebGL());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const refresh = () => setPalette(readPalette());
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "220px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {
    containerRef,
    palette,
    shouldRenderCanvas: tier === "cinematic" && webglSupported && visible,
  };
}
