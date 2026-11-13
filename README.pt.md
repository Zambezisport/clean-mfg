# clean-mfg

[English](README.md) | **Português**

Pequenos utilitários TypeScript sem dependências para decisões de manufatura
limpa — as escolhas do dia a dia que decidem se as alegações ambientais de uma
oficina são reais, da [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| ficheiro | o que é |
|---|---|
| [`embodied-carbon.ts`](embodied-carbon.ts) | CO₂e por peça: massa do material × fator de emissão + energia do processo × intensidade da rede, com o termo dominante assinalado |
| [`nesting.ts`](nesting.ts) | Nesting guilhotinado de chapas para listas de corte — rendimento % e área de retalho por chapa |
| [`material-passport.ts`](material-passport.ts) | Registo portátil da peça: origem, conteúdo reciclado, histórico de processos, plano de fim de vida — com validador |
| [`repair-vs-replace.ts`](repair-vs-replace.ts) | A decisão do paddock formalizada: CO₂e de reparar vs peça nova, por unidade de serviço esperada |

```ts
import { partFootprint } from "./embodied-carbon"

partFootprint([{ material: "aluminium-primary", massKg: 2.4 }])  // 39.6 kg CO₂e
partFootprint([{ material: "aluminium-recycled", massKg: 2.4 }]) // 5.52 kg — 7× menos
```

Fatores indicativos de gama média, não um ACV certificado — documente as fontes
dos fatores para qualquer alegação pública. Licença MIT.
