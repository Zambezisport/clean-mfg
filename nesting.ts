/**
 * nesting.ts — guillotine sheet nesting for cut lists.
 *
 * First-fit-decreasing into horizontal strips: sort parts by height
 * descending, place left-to-right on open strips, open a new strip when
 * nothing fits, a new sheet when strips run out. Not optimal packing —
 * good enough to quote yield and kill the worst offcut waste.
 */

export interface Rect {
  w: number;
  h: number;
  /** Optional label carried through to the plan. */
  id?: string;
}

export interface SheetSpec {
  w: number;
  h: number;
  /** Saw kerf — material lost to the cut itself. Default 3 mm-equivalents. */
  kerf?: number;
}

export interface PlacedPart extends Rect {
  x: number;
  y: number;
  sheet: number;
}

export interface NestPlan {
  placed: PlacedPart[];
  sheetsUsed: number;
  /** 0–1 — the number that matters for waste. */
  yieldPct: number;
  offcutArea: number;
}

export function nest(parts: Rect[], sheet: SheetSpec): NestPlan {
  const kerf = sheet.kerf ?? 3;
  const sw = sheet.w;
  const sh = sheet.h;

  // Sort by height then width, descending — tall parts define strip height.
  const sorted = [...parts].sort((a, b) => b.h - a.h || b.w - a.w);
  const placed: PlacedPart[] = [];

  interface Strip { y: number; h: number; x: number; sheet: number }
  const strips: Strip[] = [];
  let sheetIdx = 0;
  let nextY = 0;

  const newSheet = () => {
    sheetIdx++;
    nextY = 0;
  };
  newSheet(); // sheet 1

  for (const p of sorted) {
    if (p.w > sw || p.h > sh) {
      throw new Error(`part ${p.id ?? ""} (${p.w}×${p.h}) exceeds sheet ${sw}×${sh}`);
    }
    // First strip that fits height and remaining width.
    const strip = strips.find(
      (s) => p.h <= s.h && p.w + kerf <= sw - s.x,
    );
    if (strip) {
      placed.push({ ...p, x: strip.x, y: strip.y, sheet: strip.sheet });
      strip.x += p.w + kerf;
      continue;
    }
    // New strip on current sheet if vertical room remains.
    if (nextY + p.h <= sh) {
      const s: Strip = { y: nextY, h: p.h, x: 0, sheet: sheetIdx };
      strips.push(s);
      placed.push({ ...p, x: 0, y: nextY, sheet: sheetIdx });
      s.x = p.w + kerf;
      nextY += p.h + kerf;
      continue;
    }
    // New sheet.
    newSheet();
    const s: Strip = { y: 0, h: p.h, x: 0, sheet: sheetIdx };
    strips.push(s);
    placed.push({ ...p, x: 0, y: 0, sheet: sheetIdx });
    s.x = p.w + kerf;
    nextY = p.h + kerf;
  }

  const partArea = placed.reduce((a, p) => a + p.w * p.h, 0);
  const sheetArea = sheetsUsed(strips) * sw * sh;
  return {
    placed,
    sheetsUsed: sheetsUsed(strips),
    yieldPct: sheetArea > 0 ? Math.round((partArea / sheetArea) * 1000) / 10 : 0,
    offcutArea: Math.max(0, sheetArea - partArea),
  };
}

const sheetsUsed = (strips: Array<{ sheet: number }>) =>
  strips.length === 0 ? 0 : Math.max(...strips.map((s) => s.sheet));
