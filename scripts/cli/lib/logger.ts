import pc from "picocolors";

export const log = {
  info: (msg: string) => console.log(pc.cyan("ℹ"), msg),
  success: (msg: string) => console.log(pc.green("✓"), msg),
  warn: (msg: string) => console.log(pc.yellow("⚠"), msg),
  error: (msg: string) => console.error(pc.red("✗"), msg),
  dim: (msg: string) => console.log(pc.dim(msg)),
  blank: () => console.log(),
  table: (rows: Record<string, string>[]) => {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const widths = keys.map((k) =>
      Math.max(k.length, ...rows.map((r) => (r[k] ?? "").length))
    );
    const header = keys.map((k, i) => k.padEnd(widths[i])).join("  ");
    const divider = widths.map((w) => "─".repeat(w)).join("  ");
    console.log(pc.bold(header));
    console.log(pc.dim(divider));
    for (const row of rows) {
      console.log(keys.map((k, i) => (row[k] ?? "").padEnd(widths[i])).join("  "));
    }
  },
};
