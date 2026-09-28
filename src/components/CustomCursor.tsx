import { useEffect, useRef, useState } from "react";

export const CURSOR_KEY = "fsociety-cursor-style-v1";
export const CURSOR_EVENT = "fsociety-cursor-change";

export type CursorMode = "native" | "halo" | "minimal" | "crosshair" | "comet";

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>(() => (localStorage.getItem(CURSOR_KEY) as CursorMode) || "halo");
  const [point, setPoint] = useState({ x: -100, y: -100 });
  const [lagPoint, setLagPoint] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const target = useRef({ x: -100, y: -100 });
  const lag = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const refresh = () => setMode((localStorage.getItem(CURSOR_KEY) as CursorMode) || "halo");
    window.addEventListener(CURSOR_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CURSOR_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    document.documentElement.classList.toggle("custom-cursor-enabled", !coarse && mode !== "native");
    document.documentElement.dataset.cursorMode = mode;
    return () => document.documentElement.classList.remove("custom-cursor-enabled");
  }, [mode]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || mode === "native") return;

    const move = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
      setPoint(target.current);
      setVisible(true);
      const element = event.target as HTMLElement | null;
      setActive(Boolean(element?.closest("a,button,input,[data-cursor='active'],.react-flow__node")));
    };
    const leave = () => setVisible(false);

    let frame = 0;
    const animate = () => {
      lag.current.x += (target.current.x - lag.current.x) * 0.17;
      lag.current.y += (target.current.y - lag.current.y) * 0.17;
      setLagPoint({ ...lag.current });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [mode]);

  if (!visible || mode === "native") return null;

  const fastTransform = { transform: "translate3d(" + point.x + "px," + point.y + "px,0) translate(-50%,-50%)" };
  const lagTransform = { transform: "translate3d(" + lagPoint.x + "px," + lagPoint.y + "px,0) translate(-50%,-50%)" };

  return (
    <div className={"cursor-layer mode-" + mode + (active ? " is-active" : "")} aria-hidden="true">
      <div className="cursor-core" style={fastTransform} />
      <div className="cursor-orbit" style={lagTransform} />
      {mode === "crosshair" && (
        <>
          <div className="cursor-cross-x" style={fastTransform} />
          <div className="cursor-cross-y" style={fastTransform} />
        </>
      )}
      {mode === "comet" && (
        <>
          <div className="cursor-tail tail-a" style={lagTransform} />
          <div className="cursor-tail tail-b" style={{ transform: "translate3d(" + (lagPoint.x - 8) + "px," + (lagPoint.y - 8) + "px,0) translate(-50%,-50%)" }} />
        </>
      )}
    </div>
  );
}
