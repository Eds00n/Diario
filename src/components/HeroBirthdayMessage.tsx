import { assetPath } from "@/lib/asset-path";
import { TextRevealOnMount } from "@/components/TextRevealOnMount";

const MEU_AMOR_SCRIPT = assetPath("/images/meu-amor-script-transparent.png");
const EDSON_SIGNATURE = assetPath("/images/edson-signature-transparent.png");

function HeroHeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function HeroHeartDivider() {
  return (
    <div className="hero-birthday-divider" aria-hidden>
      <span className="hero-birthday-divider__line" />
      <HeroHeartIcon className="hero-birthday-divider__heart" />
      <span className="hero-birthday-divider__line" />
    </div>
  );
}

export function HeroBirthdayMessage() {
  return (
    <div className="hero-birthday">
      <TextRevealOnMount startDelayMs={260} staggerMs={130}>
        <div className="hero-birthday-head">
          <p className="hero-birthday-kicker">Para o amor da minha vida</p>

          <h1 className="hero-birthday-title">
            <span className="hero-birthday-title__line">Feliz aniversário,</span>
            <span className="hero-birthday-title__script-wrap">
              <img
                src={MEU_AMOR_SCRIPT}
                alt="meu amor"
                className="hero-birthday-title__script-img"
                decoding="async"
              />
            </span>
          </h1>
        </div>

        <div className="hero-birthday-lead">
          <HeroHeartDivider />

          <p className="hero-birthday-body">
            Hoje não é só sobre comemorar mais um ano da sua vida.
          </p>

          <HeroHeartDivider />
        </div>

        <p className="hero-birthday-body">
          É sobre comemorar a sorte que eu tenho de viver momentos ao seu lado.
        </p>

        <p className="hero-birthday-body hero-birthday-body--gold">
          Você torna tudo melhor.
        </p>

        <p className="hero-birthday-body">
          Obrigado por ser você.
        </p>

        <p className="hero-birthday-signoff">Com amor,</p>
        <span className="hero-birthday-signature-wrap">
          <img
            src={EDSON_SIGNATURE}
            alt="Edson"
            className="hero-birthday-signature"
            decoding="async"
          />
        </span>
      </TextRevealOnMount>
    </div>
  );
}
