import { useEffect, useState } from "react";
import { LEARNING_EVENT, loadSavedTheorems, saveTheorems } from "../lib/learning";

export function SavedTheorems() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(loadSavedTheorems);

  useEffect(() => {
    const refresh = () => setItems(loadSavedTheorems());
    window.addEventListener(LEARNING_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LEARNING_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const remove = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    saveTheorems(next);
    setItems(next);
  };

  return (
    <div className="saved-shell">
      <button className="ghost-button" onClick={() => setOpen((value) => !value)}>
        Saved · {items.length}
      </button>
      {open && (
        <div className="saved-popover">
          <div className="mini-kicker">СОХРАНЁННЫЕ ТЕОРЕМЫ</div>
          {items.length === 0 ? (
            <p className="saved-empty">Нажми ☆ на карточке теоремы — она появится здесь.</p>
          ) : (
            <div className="saved-list">
              {items.map((item) => (
                <article key={item.id}>
                  <button
                    className="saved-open"
                    onClick={() => {
                      window.location.hash = item.topicId;
                      setOpen(false);
                    }}
                  >
                    <span>{item.topicTitle}</span>
                    <strong>{item.title}</strong>
                    {item.formula && <code>{item.formula}</code>}
                  </button>
                  <button className="saved-remove" onClick={() => remove(item.id)} aria-label="Удалить">×</button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
