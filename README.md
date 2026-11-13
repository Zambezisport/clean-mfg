# clean-mfg

**English** | [Português](README.pt.md)

Small dependency-free TypeScript utilities for clean manufacturing decisions —
the everyday calls that decide whether a shop's environmental claims are real,
from [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| file | what it is |
|---|---|
| [`embodied-carbon.ts`](embodied-carbon.ts) | Per-part CO₂e: material mass × emission factor + process energy × grid intensity, with the dominant term flagged |
| [`nesting.ts`](nesting.ts) | Guillotine sheet nesting for cut lists — yield % and offcut area per sheet |
| [`material-passport.ts`](material-passport.ts) | Portable part record: origin, recycled content, process history, end-of-life plan — with a validator that calls out datasheets masquerading as passports |
| [`repair-vs-replace.ts`](repair-vs-replace.ts) | The paddock decision formalised: repair CO₂e vs new-part CO₂e, per expected service unit, with breakeven life ratio |

```ts
import { partFootprint } from "./embodied-carbon"
import { nest } from "./nesting"
import { repairVsReplace } from "./repair-vs-replace"

// Primary vs recycled aluminium — the single biggest easy win in metal:
partFootprint([{ material: "aluminium-primary", massKg: 2.4 }])
// → { totalCo2eKg: 39.6, dominant: "material:aluminium-primary" }
partFootprint([{ material: "aluminium-recycled", massKg: 2.4 }])
// → { totalCo2eKg: 5.52, dominant: "material:aluminium-recycled" }  7× lower

nest([{ w: 900, h: 400 }, { w: 600, h: 350 }, { w: 500, h: 500 }],
     { w: 2440, h: 1220, kerf: 3 })
// → { sheetsUsed: 1, yieldPct: 71.9, … }

repairVsReplace(
  { label: "carbon patch", co2eKg: 1.8, serviceUnits: 30 },
  { label: "new panel",    co2eKg: 9.4, serviceUnits: 60 },
)
// → { choice: "repair", breakevenLifeRatio: 0.19, … }
```

Indicative mid-range factors, not a certified LCA — document your factor
sources for any public claim. MIT licensed.
