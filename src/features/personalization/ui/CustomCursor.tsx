import { useEffect, useRef, useState } from "react";
import { getLocalStorageItem } from "@/shared/lib/browserStorage";

export const CURSOR_KEY = "fsociety-cursor-style-v1";
export const CURSOR_EVENT = "fsociety-cursor-change";

export type CursorMode = "native" | "halo" | "minimal" | "crosshair" | "comet";

const CURSOR_ACTIVE_SELECTOR =
  "a,button,input,select,textarea,[role='button'],[data-cursor='active'],.react-flow__node";

function readCursorMode(): CursorMode {
  const stored = getLocalStorageItem(CURSOR_KEY);
  return stored === "native" ||
    stored === "halo" ||
    stored === "minimal" ||
    stored === "crosshair" ||
    stored === "comet"
    ? stored
    : "halo";
}

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>(readCursorMode);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const coreRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const crossXRef = useRef<HTMLDivElement>(null);
  const crossYRef = useRef<HTMLDivElement>(null);
  const tailARef = useRef<HTMLDivElement>(null);
  const tailBRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: -100, y: -100 });
  const lag = useRef({ x: -100, y: -100 });
  const frameRef = useRef(0);

  useEffect(() => {
    const refresh = () => setMode(readCursorMode());
    window.addEventListener(CURSOR_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CURSOR_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const enabled = !coarse && mode !== "native";
    document.documentElement.classList.toggle("custom-cursor-enabled", enabled);
    document.documentElement.dataset.cursorMode = mode;

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
      delete document.documentElement.dataset.cursorMode;
    };
  }, [mode]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || mode === "native") return;

    const setTransform = (element: HTMLElement | null, x: number, y: number) => {
      if (!element) return;
      element.style.transform =
        `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    };

    const renderFastCursor = (x: number, y: number) => {
      setTransform(coreRef.current, x, y);
      setTransform(crossXRef.current, x, y);
      setTransform(crossYRef.current, x, y);
    };

    const renderLagCursor = (x: number, y: number) => {
      setTransform(orbitRef.current, x, y);
      setTransform(tailARef.current, x, y);
      setTransform(tailBRef.current, x - 8, y - 8);
    };

    const animateLag = () => {
      const dx = target.current.x - lag.current.x;
      const dy = target.current.y - lag.current.y;

      lag.current.x += dx * 0.17;
      lag.current.y += dy * 0.17;
      renderLagCursor(lag.current.x, lag.current.y);

      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        lag.current = { ...target.current };
        renderLagCursor(lag.current.x, lag.current.y);
        frameRef.current = 0;
        return;
      }

      frameRef.current = requestAnimationFrame(animateLag);
    };

    const startLagAnimation = () => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(animateLag);
    };

    const move = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
      if (lag.current.x < -50 || lag.current.y < -50) {
        lag.current = { ...target.current };
        renderLagCursor(lag.current.x, lag.current.y);
      }

      renderFastCursor(event.clientX, event.clientY);
      startLagAnimation();
      setVisible((current) => current || true);

      const element = event.target instanceof Element ? event.target : null;
      const nextActive = Boolean(element?.closest(CURSOR_ACTIVE_SELECTOR));
      setActive((current) => (current === nextActive ? current : nextActive));
    };

    const leave = () => {
      setVisible(false);
      setActive(false);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [mode]);

  if (mode === "native") return null;

  return (
    <div
      className={
        "cursor-layer mode-" +
        mode +
        (active ? " is-active" : "") +
        (visible ? " is-visible" : " is-hidden")
      }
      aria-hidden="true"
    >
      <div ref={coreRef} className="cursor-core" />
      <div ref={orbitRef} className="cursor-orbit" />
      {mode === "crosshair" && (
        <>
          <div ref={crossXRef} className="cursor-cross-x" />
          <div ref={crossYRef} className="cursor-cross-y" />
        </>
      )}
      {mode === "comet" && (
        <>
          <div ref={tailARef} className="cursor-tail tail-a" />
          <div ref={tailBRef} className="cursor-tail tail-b" />
        </>
      )}
    </div>
  );
}
