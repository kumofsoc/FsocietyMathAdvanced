import { useEffect, useState } from "react";

export function HistoryDock() {
  const [, force] = useState(0);

  useEffect(() => {
    const update = () => force((value) => value + 1);
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  return (
    <div className="history-dock" aria-label="История навигации">
      <button onClick={() => window.history.back()} title="Назад по истории">
        <span>←</span>
        <small>Назад</small>
      </button>
      <button onClick={() => window.history.forward()} title="Вперёд по истории">
        <small>Вперёд</small>
        <span>→</span>
      </button>
    </div>
  );
}
