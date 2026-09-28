import { useEffect, useState } from "react";

export function CustomCursor() {
  const [point, setPoint] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (event: MouseEvent) => {
      setPoint({ x: event.clientX, y: event.clientY });
      setVisible(true);
      const target = event.target as HTMLElement | null;
      setActive(Boolean(target?.closest("a,button,input,[data-cursor='active'],.react-flow__node")));
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className="cursor-dot" style={{ transform: `translate3d(${point.x}px,${point.y}px,0)` }} />
      <div
        className={`cursor-ring ${active ? "is-active" : ""}`}
        style={{ transform: `translate3d(${point.x}px,${point.y}px,0) translate(-50%,-50%)` }}
      />
    </>
  );
}
