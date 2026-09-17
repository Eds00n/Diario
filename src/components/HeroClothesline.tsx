"use client";

import { useMemo, useState } from "react";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import {
  getHeroClotheslinePhotos,
  isVideoMediaUrl,
} from "@/lib/heroImportantPhotos";
import { daysTogether } from "@/lib/dates";
import type { Entry } from "@/lib/types";

/** Espaçamento dos "delays" negativos — distribui as fotos ao longo do loop
 * de 48s em intervalos iguais (48/7≈7s), cada uma entrando num ponto diferente
 * da corda. Menos fotos simultâneas = mais respiro entre elas. */
const TRAVEL_DELAYS = ["-2s", "-9s", "-16s", "-23s", "-30s", "-37s", "-44s"];
/** Duração do balanço de cada foto pendurada — período próprio por foto, pra
 * não ficarem todas balançando em sincronia. */
const HANG_DURATIONS = [9, 11.5, 13, 10.5, 12.2, 11, 9.8];
const PHOTO_COUNT = TRAVEL_DELAYS.length;

export function HeroClothesline({ entries }: { entries: Entry[] }) {
  const photos = useMemo(
    () => getHeroClotheslinePhotos(entries, PHOTO_COUNT),
    [entries],
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const days = daysTogether();

  return (
    <div className="hero-clothesline">
      {/* Filtro SVG do "deckle" (borda irregular de papel) usado no fundo da carta. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="hero-clothesline-deckle" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves={3} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {photos.length > 0 ? (
        <div className="hero-clothesline__rope-zone">
          {/* Corda e fotos compartilham a mesma altura de referência (esta
           * faixa fina), pra "top: X%" da animação de viagem coincidir de
           * verdade com o ponto da curva — em vez de ser % da faixa toda
           * (que é bem mais alta, só pra caber as fotos penduradas). O
           * balanço do vento fica só na corda (windgroup) — as fotos NÃO
           * ficam dentro dele, porque animar left/top de um filho dentro de
           * um pai com transform animado é o que causava o tremor de
           * sub-pixel no celular. */}
          <div className="hero-clothesline__curve">
            <div className="hero-clothesline__windgroup">
              <svg
                className="hero-clothesline__rope"
                viewBox="0 0 1000 140"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M -20 40 Q 500 132 1020 40"
                  fill="none"
                  stroke="#c4a67c"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M -20 40 Q 500 132 1020 40"
                  fill="none"
                  stroke="rgba(122,96,60,.45)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray="3 5"
                />
              </svg>
              <span className="hero-clothesline__anchor hero-clothesline__anchor--left" aria-hidden />
              <span className="hero-clothesline__anchor hero-clothesline__anchor--right" aria-hidden />
            </div>

            {photos.map((photo, i) => {
              const isVideo = isVideoMediaUrl(photo.url);
              return (
                // O "carrinho" tem o tamanho do contêiner e anda por transform
                // (composição pura na GPU); o polaroid vai dentro dele. Animar
                // left/top aqui — como era antes — remede o layout a cada frame
                // e arredonda a posição pra pixel inteiro, o que aparece como
                // tremor na tela.
                <div
                  key={photo.key}
                  className="hero-clothesline__traveler"
                  style={{ animationDelay: TRAVEL_DELAYS[i % TRAVEL_DELAYS.length] }}
                >
                  <button
                    type="button"
                    className="hero-clothesline__print"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`Ampliar ${isVideo ? "vídeo" : "foto"}`}
                  >
                    <span className="hero-clothesline__peg" aria-hidden />
                    <span
                      className="hero-clothesline__frame"
                      style={{
                        animationDuration: `${HANG_DURATIONS[i % HANG_DURATIONS.length]}s`,
                      }}
                    >
                      <span className="hero-clothesline__media">
                        {isVideo ? (
                          <video src={photo.url} muted loop autoPlay playsInline />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photo.url}
                            alt=""
                            style={{ objectPosition: photo.objectPosition }}
                          />
                        )}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="hero-clothesline__letter">
        <div className="hero-clothesline__letter-bg" aria-hidden />
        <div className="hero-clothesline__letter-sheen" aria-hidden />
        <span className="hero-clothesline__letter-tape" aria-hidden />
        <div className="hero-clothesline__letter-content">
          <p className="hero-clothesline__letter-title">Feliz aniversário,</p>
          <p className="hero-clothesline__letter-kicker">meu amor</p>
          <span className="hero-clothesline__letter-divider" aria-hidden />
          <p className="hero-clothesline__letter-intro">
            Hoje é o seu dia.
            <br />
            Mais uma página do nosso diário para guardar.
          </p>
          <p className="hero-clothesline__letter-intro">
            Hoje, além de comemorar o seu aniversário, a gente também comemora{" "}
            <span className="hero-clothesline__letter-highlight">
              {days} dias juntos
            </span>
            , desde 02.02.2026.
          </p>
          <p className="hero-clothesline__letter-body">
            Essa será só uma das muitas páginas que ainda vamos escrever
            juntos.
          </p>
          <p className="hero-clothesline__letter-sign">Edson C.</p>
        </div>
      </div>

      <div className="hero-clothesline__scroll-hint" aria-hidden>
        rolar para o primeiro dia
      </div>

      {openIndex !== null && (
        <PhotoCarousel
          urls={photos.map((p) => p.url)}
          initialIndex={openIndex}
          slideFit="contain"
          onClosed={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
