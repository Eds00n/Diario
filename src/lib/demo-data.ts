import type { Entry, SpecialDate } from "@/lib/types";

export const demoEntries: Entry[] = [
  {
    id: "demo-1",
    data: "2026-07-20",
    texto:
      "Um dia tranquilo, só nós dois. Ficamos conversando até tarde sobre os planos pro próximo ano.",
    fotos: [
      "https://images.unsplash.com/photo-1522673607200-1648831e7f13?w=800&q=80",
    ],
    is_data_especial: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    data: "2026-07-12",
    texto:
      "Primeira vez que fomos àquele restaurante. Ela pediu o mesmo prato duas vezes só porque amou.",
    fotos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    ],
    is_data_especial: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    data: "2026-07-03",
    texto:
      "Fim de semana na praia. O sol estava perfeito e tiramos várias fotos que ficaram lindas.",
    fotos: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    ],
    is_data_especial: true,
    created_at: new Date().toISOString(),
  },
];

export const demoSpecialDates: SpecialDate[] = [
  {
    id: "demo-sd-1",
    nome: "Nosso compromisso",
    data: "2026-02-02",
    recorrente: false,
    created_at: new Date().toISOString(),
  },
];
