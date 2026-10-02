import { useState } from "react";
import { CURSOR_EVENT, CURSOR_KEY, type CursorMode } from "@/features/personalization/ui/CustomCursor";

const modes: { id: CursorMode; title: string; copy: string }[] = [
  { id: "halo", title: "Halo", copy: "Точка + пружинящее кольцо. Основной режим." },
  { id: "minimal", title: "Minimal", copy: "Только компактная точка без лишнего шума." },
  { id: "crosshair", title: "Crosshair", copy: "Технический прицел для графиков и 3D." },
  { id: "comet", title: "Comet", copy: "Курсор с инерционным хвостом." },
  { id: "native", title: "System", copy: "Вернуть системный курсор браузера." },
];

export function CursorStudio() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CursorMode>(() => (localStorage.getItem(CURSOR_KEY) as CursorMode) || "halo");

  const choose = (next: CursorMode) => {
    localStorage.setItem(CURSOR_KEY, next);
    setMode(next);
    window.dispatchEvent(new CustomEvent(CURSOR_EVENT));
  };

  return (
    <div className="cursor-studio-shell">
      <button className="ghost-button" onClick={() => setOpen((value) => !value)}>
        Cursor · {modes.find((item) => item.id === mode)?.title}
      </button>
      {open && (
        <div className="cursor-popover">
          <div className="mini-kicker">CURSOR SYSTEM</div>
          <p>Во всех кастомных режимах настоящий курсор браузера отключён.</p>
          <div className="cursor-mode-grid">
            {modes.map((item) => (
              <button
                key={item.id}
                className={item.id === mode ? "active" : ""}
                onClick={() => choose(item.id)}
              >
                <span className={"cursor-preview preview-" + item.id} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.copy}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
