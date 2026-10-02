import { useEffect, useMemo, useState } from "react";
import { getThemeTone } from "@/features/personalization/model/themeTone";

type Theme = Record<string, string>;

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

const tokenLabels: Record<string, string> = {
  bg: "Background",
  surface: "Surface",
  elevated: "Raised surface",
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

function applyTheme(theme: Theme, name: string) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));

  const tone = getThemeTone(theme.bg);
  root.dataset.theme = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  root.dataset.themeTone = tone;
  root.style.colorScheme = tone;
}

export function ThemeStudio() {
  const [name, setName] = useState(() => localStorage.getItem("math-theme-name") || "Black");
  const [custom, setCustom] = useState<Theme>(() => {
    const saved = localStorage.getItem("math-theme-custom");
    return saved ? JSON.parse(saved) : { ...themes.Black };
  });
  const [open, setOpen] = useState(false);

  const current = useMemo(() => name === "Custom" ? custom : themes[name] ?? themes.Black, [name, custom]);

  useEffect(() => {
    applyTheme(current, name);
    localStorage.setItem("math-theme-name", name);
    if (name === "Custom") localStorage.setItem("math-theme-custom", JSON.stringify(custom));
  }, [current, name, custom]);

  const choose = (next: string) => {
    if (next !== "Custom") setCustom({ ...(themes[next] ?? themes.Black) });
    setName(next);
  };

  return (
    <div className="theme-shell">
      <button className="ghost-button" onClick={() => setOpen((value) => !value)}>
        Theme · {name}
      </button>

      {open && (
        <div className="theme-popover">
          <div className="theme-grid">
            {[...Object.keys(themes), "Custom"].map((themeName) => (
              <button
                key={themeName}
                className={`theme-option ${themeName === name ? "active" : ""}`}
                onClick={() => choose(themeName)}
              >
                {themeName}
              </button>
            ))}
          </div>

          {name === "Custom" && (
            <div className="custom-theme-editor">
              <div className="mini-kicker">CUSTOM THEME STUDIO</div>
              {Object.entries(tokenLabels).map(([token, label]) => (
                <label className="color-row" key={token}>
                  <span>{label}</span>
                  <input
                    type="color"
                    value={custom[token]}
                    onChange={(event) => setCustom((state) => ({ ...state, [token]: event.target.value }))}
                  />
                  <input
                    value={custom[token]}
                    onChange={(event) => setCustom((state) => ({ ...state, [token]: event.target.value }))}
                  />
                </label>
              ))}
              <button className="ghost-button full" onClick={() => setCustom({ ...themes.Black })}>
                Reset to Black
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
