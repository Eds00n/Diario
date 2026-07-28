import {
  Anton,
  Bebas_Neue,
  Oswald,
  Pacifico,
  Permanent_Marker,
  Rubik_Glitch,
} from "next/font/google";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"] });
const oswald = Oswald({ weight: "700", subsets: ["latin"] });
const anton = Anton({ weight: "400", subsets: ["latin"] });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"] });
const glitch = Rubik_Glitch({ weight: "400", subsets: ["latin"] });

/** Classes aplicadas em ciclo no efeito “font shuffle”. */
export const fontShuffleClasses = [
  bebas.className,
  pacifico.className,
  oswald.className,
  anton.className,
  marker.className,
  glitch.className,
  "font-display",
  "font-body font-black uppercase tracking-wide",
];
