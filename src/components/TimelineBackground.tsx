"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type TimelineBackgroundContextValue = {
  immersiveUrl: string | null;
  setImmersiveZoneActive: (
    zoneId: string,
    url: string | null,
    active: boolean,
  ) => void;
};

const TimelineBackgroundContext =
  createContext<TimelineBackgroundContextValue | null>(null);

export function TimelineBackgroundProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [immersiveUrl, setImmersiveUrlState] = useState<string | null>(null);
  const activeZonesRef = useRef(new Map<string, string>());

  const setImmersiveZoneActive = useCallback(
    (zoneId: string, url: string | null, active: boolean) => {
      if (active && url) {
        activeZonesRef.current.set(zoneId, url);
      } else {
        activeZonesRef.current.delete(zoneId);
      }
      const next =
        activeZonesRef.current.size > 0
          ? ([...activeZonesRef.current.values()].at(-1) ?? null)
          : null;
      setImmersiveUrlState(next);
    },
    [],
  );

  const value = useMemo(
    () => ({ immersiveUrl, setImmersiveZoneActive }),
    [immersiveUrl, setImmersiveZoneActive],
  );

  return (
    <TimelineBackgroundContext.Provider value={value}>
      {children}
    </TimelineBackgroundContext.Provider>
  );
}

export function useTimelineBackground() {
  const ctx = useContext(TimelineBackgroundContext);
  if (!ctx) {
    throw new Error(
      "useTimelineBackground must be used within TimelineBackgroundProvider",
    );
  }
  return ctx;
}

export function useTimelineBackgroundOptional() {
  return useContext(TimelineBackgroundContext);
}
