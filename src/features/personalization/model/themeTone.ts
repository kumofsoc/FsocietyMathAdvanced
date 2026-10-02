export type ThemeTone = "light" | "dark";

function hexChannel(value: string) {
  return Number.parseInt(value, 16) / 255;
}

function linearize(channel: number) {
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

export function getThemeTone(background: string): ThemeTone {
  const match = background.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return "dark";

  const hex = match[1];
  const r = linearize(hexChannel(hex.slice(0, 2)));
  const g = linearize(hexChannel(hex.slice(2, 4)));
  const b = linearize(hexChannel(hex.slice(4, 6)));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance >= 0.48 ? "light" : "dark";
}
