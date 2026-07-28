import hero200 from "@/assets/hero-200.png";

export function Hero200Title() {
  return (
    <h1 className="mx-auto w-full">
      <img
        src={hero200.src}
        alt="200 dias juntos"
        width={hero200.width}
        height={hero200.height}
        className="mx-auto block h-auto w-full max-w-[620px]"
      />
    </h1>
  );
}
