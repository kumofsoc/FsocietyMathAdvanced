import { useEffect, useRef, useState } from "react";
import { readLocalStorage } from "@/shared/lib/browserStorage";
import { CURSOR_KEY } from "@/features/personalization/model/preferences";

export { CURSOR_KEY };
export const CURSOR_EVENT = "fsociety-cursor-change";

export type CursorMode = "native" | "halo" | "minimal" | "crosshair" | "comet";

const INTERACTIVE_SELECTOR =
  "a,button,input,select,textarea,[data-cursor='active'],.react-flow__node";

function transformAt(x: number, y: number) {
  return `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
}

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>(
    () => (readLocalStorage(CURSOR_KEY) as CursorMode) || "halo",
  );
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const coreRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const crossXRef = useRef<HTMLDivElement>(null);
  const crossYRef = useRef<HTMLDivElement>(null);
  const tailARef = useRef<HTMLDivElement>(null);
  const tailBRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const lagRef = useRef({ x: -100, y: -100 });
  const frameRef = useRef(0);

  useEffect(() => {
    const refresh = () =>
      setMode((readLocalStorage(CURSOR_KEY) as CursorMode) || "halo");

    window.addEventListener(CURSOR_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CURSOR_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    document.documentElement.classList.toggle(
      "custom-cursor-enabled",
      !coarse && mode !== "native",
    );
    document.documentElement.dataset.cursorMode = mode;

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
    };
  }, [mode]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || mode === "native") {
      setVisible(false);
      return;
    }

    const renderFastLayer = (x: number, y: number) => {
      const transform = transformAt(x, y);
      if (coreRef.current) coreRef.current.style.transform = transform;
      if (crossXRef.current) crossXRef.current.style.transform = transform;
      if (crossYRef.current) crossYRef.current.style.transform = transform;
    };

    const renderLagLayer = () => {
      const lag = lagRef.current;
      const target = targetRef.current;
      lag.x += (target.x - lag.x) * 0.17;
      lag.y += (target.y - lag.y) * 0.17;

      const transform = transformAt(lag.x, lag.y);
      if (orbitRef.current) orbitRef.current.style.transform = transform;
      if (tailARef.current) tailARef.current.style.transform = transform;
      if (tailBRef.current) {
        tailBRef.current.style.transform = transformAt(lag.x - 8, lag.y - 8);
      }

      const settled =
        Math.abs(target.x - lag.x) < 0.1 &&
        Math.abs(target.y - lag.y) < 0.1;

      if (settled) {
        frameRef.current = 0;
        return;
      }

      frameRef.current = requestAnimationFrame(renderLagLayer);
    };

    const ensureLagAnimation = () => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(renderLagLayer);
    };

    const move = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      if (lagRef.current.x < -50) {
        lagRef.current = { x: event.clientX, y: event.clientY };
      }

      renderFastLayer(event.clientX, event.clientY);
      ensureLagAnimation();
      setVisible(true);

      const element = event.target as Element | null;
      setActive(Boolean(element?.closest(INTERACTIVE_SELECTOR)));
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

  if (!visible || mode === "native") return null;

  return (
    <div
      className={"cursor-layer mode-" + mode + (active ? " is-active" : "")}
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
