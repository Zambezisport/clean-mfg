/**
 * material-passport.ts — a portable record of what a part is made of.
 *
 * If you can't say what's in it and where it came from, you can't claim
 * anything about it. A passport follows a part through life: origin,
 * recycled content, process history, and the planned end-of-life path.
 * JSON-serialisable, diffable, signable.
 */

export type EndOfLife = "reuse" | "repair-loop" | "recycle" | "downcycle" | "landfill" | "unknown";

export interface PassportEntry {
  /** Unique part/lot identifier. */
  partId: string;
  createdAt: string; // ISO date
  materials: Array<{
    name: string;
    massKg: number;
    /** 0–100. */
    recycledContentPct: number;
    /** ISO country of material origin, if known. */
    origin?: string;
  }>;
  processes: Array<{
    name: string; // e.g. "cnc-mill", "layup", "powder-coat"
    date?: string;
    location?: string;
    energyKwh?: number;
  }>;
  endOfLife: {
    intended: EndOfLife;
    /** Free text: which stream, which partner. */
    route?: string;
  };
  /** Schema version for forward compatibility. */
  v: 1;
}

export interface PassportIssue {
  field: string;
  problem: string;
}

/** Validate a passport — returns issues, empty = clean. */
export function validatePassport(p: Partial<PassportEntry>): PassportIssue[] {
  const issues: PassportIssue[] = [];
  if (!p.partId) issues.push({ field: "partId", problem: "missing identifier" });
  if (!p.materials?.length) {
    issues.push({ field: "materials", problem: "no materials declared" });
  } else {
    p.materials.forEach((m, i) => {
      if (m.massKg == null || m.massKg <= 0)
        issues.push({ field: `materials[${i}].massKg`, problem: "mass must be > 0" });
      if (m.recycledContentPct == null || m.recycledContentPct < 0 || m.recycledContentPct > 100)
        issues.push({ field: `materials[${i}].recycledContentPct`, problem: "must be 0–100" });
    });
  }
  if (!p.endOfLife) {
    issues.push({ field: "endOfLife", problem: "no end-of-life plan declared" });
  } else if (p.endOfLife.intended === "unknown") {
    issues.push({ field: "endOfLife.intended", problem: '"unknown" — a passport without a destination is a datasheet' });
  }
  return issues;
}

/** Recycled-content share of total mass, 0–100. */
export function recycledSharePct(p: PassportEntry): number {
  const total = p.materials.reduce((a, m) => a + m.massKg, 0);
  if (total <= 0) return 0;
  const recycled = p.materials.reduce((a, m) => a + m.massKg * (m.recycledContentPct / 100), 0);
  return Math.round((recycled / total) * 1000) / 10;
}

/** Total logged process energy, kWh (NaN-safe: unlogged steps count 0). */
export function processEnergyKwh(p: PassportEntry): number {
  return p.processes.reduce((a, s) => a + (s.energyKwh ?? 0), 0);
}
