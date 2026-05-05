function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const int = parseInt(full, 16);
  if (isNaN(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function getContrastText(hex: string): "black" | "white" {
  const rgb = hexToRgb(hex);
  if (!rgb) return "black";
  // Perceived luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "black" : "white";
}

export function derivePrimaryShades(hex: string): {
  hover: string;
  muted: string;
  tint: string;
} {
  const rgb = hexToRgb(hex);
  if (!rgb) return { hover: hex, muted: hex, tint: hex };

  const darken = (v: number, amt: number) => v * (1 - amt);
  const lighten = (v: number, amt: number) => v + (255 - v) * amt;

  return {
    hover: rgbToHex(darken(rgb.r, 0.1), darken(rgb.g, 0.1), darken(rgb.b, 0.1)),
    muted: rgbToHex(lighten(rgb.r, 0.4), lighten(rgb.g, 0.4), lighten(rgb.b, 0.4)),
    tint: rgbToHex(lighten(rgb.r, 0.85), lighten(rgb.g, 0.85), lighten(rgb.b, 0.85)),
  };
}
