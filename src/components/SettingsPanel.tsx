import { useEffect, useMemo, useState } from "react";
import { CURSOR_EVENT, CURSOR_KEY, type CursorMode } from "./CustomCursor";
import { LEARNING_EVENT, loadSavedTheorems, saveTheorems } from "../lib/learning";

type Theme = Record<string, string>;
type MotionProfile = "full" | "balanced" | "eco" | "off";

const THEME_NAME_KEY = "math-theme-name";
const THEME_CUSTOM_KEY = "math-theme-custom";
const MOTION_KEY = "fsociety-motion-profile-v1";

const themes: Record<string, Theme> = {
  Black: {
    bg: "#050507", surface: "#0d0d12", elevated: "#13131b", text: "#f5f5f7",
    muted: "#8d8d9a", accent: "#8b7cff", accent2: "#36e4c2", border: "#252531",
    definition: "#53b6ff", theorem: "#a78bfa", proof: "#36e4c2", formula: "#ffcb6b",
  },
  White: {
    bg: "#f6f6f3", surface: "#ffffff", elevated: "#f0f0ec", text: "#17171a",
    muted: "#696970", accent: "#5b4bea", accent2: "#008f7a", border: "#ddddda",
    definition: "#006cc7", theorem: "#6241c7", proof: "#007f6e", formula: "#9a5b00",
  },
  "Catppuccin Mocha": {
    bg: "#1e1e2e", surface: "#181825", elevated: "#313244", text: "#cdd6f4",
    muted: "#a6adc8", accent: "#cba6f7", accent2: "#94e2d5", border: "#45475a",
    definition: "#89b4fa", theorem: "#cba6f7", proof: "#a6e3a1", formula: "#f9e2af",
  },
  "Catppuccin Latte": {
    bg: "#eff1f5", surface: "#e6e9ef", elevated: "#ffffff", text: "#4c4f69",
    muted: "#7c7f93", accent: "#8839ef", accent2: "#179299", border: "#ccd0da",
    definition: "#1e66f5", theorem: "#8839ef", proof: "#40a02b", formula: "#df8e1d",
  },
  Neovim: {
    bg: "#0f1419", surface: "#131a20", elevated: "#1a222a", text: "#d8dee9",
    muted: "#6f7882", accent: "#98c379", accent2: "#56b6c2", border: "#2c353d",
    definition: "#61afef", theorem: "#c678dd", proof: "#98c379", formula: "#e5c07b",
  },
  "Tokyo Night": {
    bg: "#1a1b26", surface: "#16161e", elevated: "#24283b", text: "#c0caf5",
    muted: "#787c99", accent: "#7aa2f7", accent2: "#2ac3de", border: "#3b4261",
    definition: "#7dcfff", theorem: "#bb9af7", proof: "#9ece6a", formula: "#e0af68",
  },
  Gruvbox: {
    bg: "#1d2021", surface: "#282828", elevated: "#32302f", text: "#ebdbb2",
    muted: "#a89984", accent: "#d79921", accent2: "#8ec07c", border: "#504945",
    definition: "#83a598", theorem: "#d3869b", proof: "#b8bb26", formula: "#fabd2f",
  },
  Nord: {
    bg: "#2e3440", surface: "#3b4252", elevated: "#434c5e", text: "#eceff4",
    muted: "#a7adba", accent: "#88c0d0", accent2: "#8fbcbb", border: "#4c566a",
    definition: "#81a1c1", theorem: "#b48ead", proof: "#a3be8c", formula: "#ebcb8b",
  },
};

const cursorModes: { id: CursorMode; title: string; copy: string }[] = [
  { id: "halo", title: "Halo", copy: "Точка + инерционное кольцо." },
  { id: "minimal", title: "Minimal", copy: "Компактная точка." },
  { id: "crosshair", title: "Crosshair", copy: "Технический прицел." },
  { id: "comet", title: "Comet", copy: "Инерционный хвост." },
  { id: "native", title: "System", copy: "Системный курсор браузера." },
];

const tokenLabels: Record<string, string> = {
  bg: "Background",
  surface: "Surface",
  elevated: "Raised",
  text: "Text",
  muted: "Muted",
  accent: "Accent",
  accent2: "Accent II",
  border: "Border",
  definition: "Definition",
  theorem: "Theorem",
  proof: "Proof",
  formula: "Formula",
};

function applyTheme(theme: Theme) {
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty("--" + key, value);
  });
}

function applyMotion(profile: MotionProfile) {
  document.documentElement.dataset.motionProfile = profile;
  localStorage.setItem(MOTION_KEY, profile);
  window.dispatchEvent(new CustomEvent("fsociety-motion-change"));
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"theme" | "cursor" | "motion" | "saved">("theme");
  const [themeName, setThemeName] = useState(() => localStorage.getItem(THEME_NAME_KEY) || "Black");
  const [custom, setCustom] = useState<Theme>(() => {
    try {
      return JSON.parse(localStorage.getItem(THEME_CUSTOM_KEY) || "null") || { ...themes.Black };
    } catch {
      return { ...themes.Black };
    }
  });
  const [customDirty, setCustomDirty] = useState(false);
  const [customSaved, setCustomSaved] = useState(false);
  const [cursor, setCursor] = useState<CursorMode>(() => (localStorage.getItem(CURSOR_KEY) as CursorMode) || "halo");
  const [motion, setMotion] = useState<MotionProfile>(() => (localStorage.getItem(MOTION_KEY) as MotionProfile) || "balanced");
  const [saved, setSaved] = useState(loadSavedTheorems);

  const activeTheme = useMemo(
    () => themeName === "Custom" ? custom : themes[themeName] ?? themes.Black,
    [themeName, custom],
  );

  useEffect(() => {
    applyTheme(activeTheme);
    localStorage.setItem(THEME_NAME_KEY, themeName);
  }, [activeTheme, themeName]);

  useEffect(() => {
    applyMotion(motion);
  }, [motion]);

  useEffect(() => {
    const refresh = () => setSaved(loadSavedTheorems());
    window.addEventListener(LEARNING_EVENT, refresh);
    return () => window.removeEventListener(LEARNING_EVENT, refresh);
  }, []);

  const updateCustom = (token: string, value: string) => {
    setCustom((state) => ({ ...state, [token]: value }));
    setCustomDirty(true);
    setCustomSaved(false);
  };

  const saveCustomTheme = () => {
    localStorage.setItem(THEME_CUSTOM_KEY, JSON.stringify(custom));
    localStorage.setItem(THEME_NAME_KEY, "Custom");
    setThemeName("Custom");
    setCustomDirty(false);
    setCustomSaved(true);
  };

  const restoreCustomTheme = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(THEME_CUSTOM_KEY) || "null");
      setCustom(stored || { ...themes.Black });
    } catch {
      setCustom({ ...themes.Black });
    }
    setCustomDirty(false);
    setCustomSaved(false);
  };

  const chooseCursor = (next: CursorMode) => {
    localStorage.setItem(CURSOR_KEY, next);
    setCursor(next);
    window.dispatchEvent(new CustomEvent(CURSOR_EVENT));
  };

  const removeSaved = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    saveTheorems(next);
    setSaved(next);
  };

  return (
    <div className="settings-shell">
      <button className="settings-trigger" onClick={() => setOpen((value) => !value)}>
        <span>⚙</span>
        Настройки
      </button>

      {open && (
        <div className="settings-backdrop" onMouseDown={() => setOpen(false)}>
          <aside className="settings-panel" onMouseDown={(event) => event.stopPropagation()}>
            <header className="settings-head">
              <div>
                <div className="mini-kicker">FSOCIETYMATH / PERSONALIZATION</div>
                <h2>Настройки</h2>
              </div>
              <button onClick={() => setOpen(false)}>×</button>
            </header>

            <nav className="settings-tabs">
              {[
                ["theme", "Темы"],
                ["cursor", "Курсор"],
                ["motion", "Анимации"],
                ["saved", "Сохранённое"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={tab === id ? "active" : ""}
                  onClick={() => setTab(id as typeof tab)}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="settings-content">
              {tab === "theme" && (
                <section>
                  <div className="settings-section-copy">
                    <h3>Тема интерфейса</h3>
                    <p>Тема меняет не только фон, но и цвета определений, теорем, доказательств и формул.</p>
                  </div>
                  <div className="settings-theme-grid">
                    {[...Object.keys(themes), "Custom"].map((name) => {
                      const preview = name === "Custom" ? custom : themes[name];
                      return (
                        <button
                          key={name}
                          className={themeName === name ? "active" : ""}
                          onClick={() => {
                            setThemeName(name);
                            setCustomSaved(false);
                          }}
                        >
                          <span className="theme-preview">
                            <i style={{ background: preview.bg }} />
                            <i style={{ background: preview.surface }} />
                            <i style={{ background: preview.accent }} />
                            <i style={{ background: preview.accent2 }} />
                          </span>
                          <strong>{name}</strong>
                        </button>
                      );
                    })}
                  </div>

                  {themeName === "Custom" && (
                    <div className="settings-custom-theme">
                      {Object.entries(tokenLabels).map(([token, label]) => (
                        <label key={token}>
                          <span>{label}</span>
                          <input
                            type="color"
                            value={custom[token]}
                            onChange={(event) => updateCustom(token, event.target.value)}
                          />
                          <input
                            value={custom[token]}
                            onChange={(event) => updateCustom(token, event.target.value)}
                          />
                        </label>
                      ))}
                      <div className="custom-theme-actions">
                        <button className="custom-save-button" onClick={saveCustomTheme}>
                          {customSaved ? "✓ Custom сохранена" : customDirty ? "Сохранить изменения" : "Сохранить Custom"}
                        </button>
                        <button className="custom-restore-button" onClick={restoreCustomTheme}>
                          Вернуть сохранённую
                        </button>
                      </div>
                      <p className="custom-save-note">
                        Изменения сразу видны в интерфейсе, но сохраняются между запусками только после нажатия «Сохранить».
                      </p>
                    </div>
                  )}
                </section>
              )}

              {tab === "cursor" && (
                <section>
                  <div className="settings-section-copy">
                    <h3>Система курсоров</h3>
                    <p>В кастомных режимах настоящий курсор браузера полностью скрывается и заменяется нашим.</p>
                  </div>
                  <div className="settings-cursor-grid">
                    {cursorModes.map((item) => (
                      <button
                        key={item.id}
                        className={cursor === item.id ? "active" : ""}
                        onClick={() => chooseCursor(item.id)}
                      >
                        <span className={"cursor-preview preview-" + item.id} />
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.copy}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {tab === "motion" && (
                <section>
                  <div className="settings-section-copy">
                    <h3>Профиль анимаций</h3>
                    <p>Можно выбрать полный визуальный режим, облегчённые профили или полностью статичный интерфейс без анимаций.</p>
                  </div>
                  <div className="motion-profile-grid">
                    {[
                      ["full", "Full", "Максимум GSAP / Three.js. Для мощного desktop."],
                      ["balanced", "Balanced", "Полный визуальный язык, но меньше GPU-нагрузка. По умолчанию."],
                      ["eco", "Eco", "Сохраняет переходы и scroll-story, но снижает частицы и тяжёлые эффекты."],
                      ["off", "Off", "0 анимаций: без GSAP, motion-переходов, автодвижения Three.js и декоративных трансформаций."],
                    ].map(([id, title, copy]) => (
                      <button
                        key={id}
                        className={motion === id ? "active" : ""}
                        onClick={() => setMotion(id as MotionProfile)}
                      >
                        <strong>{title}</strong>
                        <small>{copy}</small>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {tab === "saved" && (
                <section>
                  <div className="settings-section-copy">
                    <h3>Сохранённые теоремы</h3>
                    <p>Твоя личная библиотека утверждений для быстрого возврата.</p>
                  </div>
                  <div className="settings-saved-list">
                    {saved.length === 0 ? (
                      <div className="settings-empty">Пока пусто. Нажми ☆ рядом с теоремой.</div>
                    ) : saved.map((item) => (
                      <article key={item.id}>
                        <button
                          onClick={() => {
                            window.location.hash = item.topicId;
                            setOpen(false);
                          }}
                        >
                          <span>{item.topicTitle}</span>
                          <strong>{item.title}</strong>
                        </button>
                        <button onClick={() => removeSaved(item.id)}>×</button>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
