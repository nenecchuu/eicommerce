import SlugifyLib from "slugify";

export function generateSlug(text: string): string {
  return SlugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function generateSlugWithSuffix(text: string): string {
  const base = generateSlug(text);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
