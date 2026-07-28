"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTimelineBackgroundOptional } from "@/components/TimelineBackground";

export function EntryImmersiveZone({
  zoneId,
  backgroundUrl,
  children,
}: {
  zoneId: string;
  backgroundUrl: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const setZoneActive =
    useTimelineBackgroundOptional()?.setImmersiveZoneActive;

  useEffect(() => {
    const el = ref.current;
    if (!el || !setZoneActive) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setZoneActive(zoneId, backgroundUrl, !!entry?.isIntersecting);
      },
      { threshold: 0.03, rootMargin: "10% 0px -38% 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      setZoneActive(zoneId, backgroundUrl, false);
    };
  }, [backgroundUrl, setZoneActive, zoneId]);

  return <div ref={ref}>{children}</div>;
}
