/**
 * embodied-carbon.ts — per-part embodied CO₂e estimate.
 *
 * embodied CO₂e = Σ(material mass × emission factor)
 *               + Σ(process energy × grid intensity)
 *
 * Factors are indicative mid-range values from public LCA data (ICE, ecoinvent
 * summaries) — good enough to compare design choices and spot the dominant
 * term, not a certified LCA. Always document your factor source for a claim.
 */

/** kg CO₂e per kg of material, cradle-to-gate, typical ranges midpoints. */
export const MATERIAL_FACTORS: Record<string, { kgCo2ePerKg: number; note: string }> = {
  "aluminium-primary": { kgCo2ePerKg: 16.5, note: "primary smelted, coal-heavy grid" },
  "aluminium-recycled": { kgCo2ePerKg: 2.3, note: "secondary billet — the biggest easy win in metal" },
  "steel-primary": { kgCo2ePerKg: 2.3, note: "blast furnace" },
  "steel-recycled": { kgCo2ePerKg: 0.4, note: "EAF scrap" },
  titanium: { kgCo2ePerKg: 35, note: "very energy-intensive extraction" },
  "cfrp-virgin": { kgCo2ePerKg: 30, note: "carbon fibre epoxy laminate" },
  gfrp: { kgCo2ePerKg: 8, note: "glass fibre composite" },
  abs: { kgCo2ePerKg: 3.1, note: "injection-moulding resin" },
  pla: { kgCo2ePerKg: 1.8, note: "bio-based filament" },
  "natural-fibre": { kgCo2ePerKg: 1.2, note: "flax/hemp composite — low energy, watch resin share" },
};

export interface MaterialUse {
  /** Key into MATERIAL_FACTORS, or use `factor` directly. */
  material?: string;
  /** kg CO₂e per kg — overrides MATERIAL_FACTORS. */
  factor?: number;
  massKg: number;
  /** Yield loss: scrap fraction generated making the part, 0–1. */
  scrapPct?: number;
}

export interface ProcessStep {
  name: string;
  /** Energy consumed, kWh. */
  kwh: number;
  /** Grid intensity, kg CO₂e per kWh. Default 0.45 (middling grid). */
  kgCo2ePerKwh?: number;
}

export interface PartFootprint {
  materialCo2eKg: number;
  processCo2eKg: number;
  totalCo2eKg: number;
  /** The largest single term — where to focus first. */
  dominant: string;
}

export function partFootprint(materials: MaterialUse[], processes: ProcessStep[] = []): PartFootprint {
  let materialCo2eKg = 0;
  let dominant = "";
  let dominantVal = 0;

  for (const m of materials) {
    const f = m.factor ?? (m.material ? MATERIAL_FACTORS[m.material]?.kgCo2ePerKg : undefined);
    if (f == null) throw new Error(`no emission factor for ${m.material ?? "material"}`);
    const billed = m.massKg * (1 + (m.scrapPct ?? 0));
    const co2e = billed * f;
    materialCo2eKg += co2e;
    if (co2e > dominantVal) {
      dominantVal = co2e;
      dominant = `material:${m.material ?? "custom"}`;
    }
  }

  let processCo2eKg = 0;
  for (const p of processes) {
    const co2e = p.kwh * (p.kgCo2ePerKwh ?? 0.45);
    processCo2eKg += co2e;
    if (co2e > dominantVal) {
      dominantVal = co2e;
      dominant = `process:${p.name}`;
    }
  }

  const total = materialCo2eKg + processCo2eKg;
  return {
    materialCo2eKg: r2(materialCo2eKg),
    processCo2eKg: r2(processCo2eKg),
    totalCo2eKg: r2(total),
    dominant,
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
