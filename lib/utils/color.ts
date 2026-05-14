type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
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

function relativeChannel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * relativeChannel(rgb.r) +
    0.7152 * relativeChannel(rgb.g) +
    0.0722 * relativeChannel(rgb.b)
  );
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  };
}

export function getContrastText(hex: string): "black" | "white" {
  const rgb = hexToRgb(hex);
  if (!rgb) return "black";
  const blackContrast = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
  const whiteContrast = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
  return blackContrast > whiteContrast ? "black" : "white";
}

export function getAccessiblePrimaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const white = { r: 255, g: 255, b: 255 };
  if (contrastRatio(rgb, white) >= 4.5) return hex;

  const black = { r: 0, g: 0, b: 0 };
  for (let amount = 0.02; amount <= 1; amount += 0.02) {
    const candidate = mix(rgb, black, amount);
    if (contrastRatio(candidate, white) >= 4.5) {
      return rgbToHex(candidate.r, candidate.g, candidate.b);
    }
  }

  return "#000000";
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
