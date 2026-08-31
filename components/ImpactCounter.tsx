"use client";

import { useEffect, useState } from "react";
import { impactStats } from "@/data/mockData";
import { getImpactStats } from "@/lib/content";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);

  return value;
}

function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  const counted = useCountUp(value, visible);

  useEffect(() => {
    setVisible(true);
  }, []);

  const display =
    value >= 1000 ? `${Math.round(counted / 1000)}K` : String(counted);

  return (
    <div className="text-center">
      <p className="font-display text-4xl text-white sm:text-5xl">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wide text-white/75">
        {label}
      </p>
    </div>
  );
}

export default function ImpactCounter() {
  const [stats, setStats] = useState(impactStats);

  useEffect(() => {
    getImpactStats().then((s) => setStats(s.length ? s : impactStats));
  }, []);

  return (
    <section className="bg-navy">
      <div className="container-arda grid gap-8 py-10 sm:grid-cols-3">
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
