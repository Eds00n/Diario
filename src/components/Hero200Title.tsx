import hero200 from "@/assets/hero-200.png";

export function Hero200Title() {
  return (
    <h1 className="mx-auto w-full">
      <img
        src={hero200.src}
        alt="200 dias juntos"
        width={hero200.width}
        height={hero200.height}
        className="mx-auto h-auto w-full max-w-[min(100%,clamp(300px,78vw,620px))] object-contain"
        decoding="async"
        fetchPriority="high"
      />
    </h1>
  );
}
