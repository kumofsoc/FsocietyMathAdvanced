export function HistoryDock() {
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
