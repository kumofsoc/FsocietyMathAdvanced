import { useEffect, useState } from "react";

const MIN_SCROLL_PX = 720;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const threshold = Math.max(MIN_SCROLL_PX, window.innerHeight * 0.8);
        setVisible(window.scrollY > threshold);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={"back-to-top " + (visible ? "is-visible" : "")}
      onClick={scrollToTop}
      aria-label="Наверх страницы"
      title="Наверх"
      tabIndex={visible ? 0 : -1}
    >
      <span aria-hidden="true">↑</span>
      <strong>Наверх</strong>
    </button>
  );
}
