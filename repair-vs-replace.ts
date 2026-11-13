/**
 * repair-vs-replace.ts — the paddock decision, formalised.
 *
 * A panel cracks, a bracket bends: repair it or machine a new one? The green
 * answer is usually repair — but not always (a glued patch on a part that
 * fails again in two hours is worse than a new part). Compare embodied CO₂e
 * and expected service life; get a verdict and the breakeven life ratio.
 */

export interface Option {
  label: string;
  /** CO₂e to execute this option now, kg. */
  co2eKg: number;
  /** Expected remaining service life after this option, in the same units
   *  for both options (hours, km, events — pick one). */
  serviceUnits: number;
}

export interface RepairVerdict {
  choice: "repair" | "replace";
  /** CO₂e per service unit for each option — the fair comparison. */
  perUnit: { repair: number; replace: number };
  /** Repair wins unless its expected life is below this fraction of the
   *  replacement's life. */
  breakevenLifeRatio: number;
  reasoning: string;
}

export function repairVsReplace(repair: Option, replace: Option): RepairVerdict {
  const perUnit = {
    repair: repair.co2eKg / Math.max(repair.serviceUnits, 1e-9),
    replace: replace.co2eKg / Math.max(replace.serviceUnits, 1e-9),
  };
  const breakevenLifeRatio = repair.co2eKg / replace.co2eKg;
  const repairWins = perUnit.repair <= perUnit.replace;
  const reasoning = repairWins
    ? `Repair at ${repair.co2eKg} kg CO₂e beats a new part at ${replace.co2eKg} kg — ` +
      `provided the repair holds ≥${(breakevenLifeRatio * 100).toFixed(0)}% of new-part life.`
    : `New part wins on CO₂e/service-unit — the repair either costs too much ` +
      `embodied carbon or won't last ${(breakevenLifeRatio * 100).toFixed(0)}% of replacement life.`;
  return {
    choice: repairWins ? "repair" : "replace",
    perUnit: {
      repair: Math.round(perUnit.repair * 1000) / 1000,
      replace: Math.round(perUnit.replace * 1000) / 1000,
    },
    breakevenLifeRatio: Math.round(breakevenLifeRatio * 100) / 100,
    reasoning,
  };
}
