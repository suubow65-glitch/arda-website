"use client";

import { useState } from "react";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/constants";

export default function SafeImage({
  src,
  alt,
  className,
  fallback = ACTIVITY_FALLBACK_IMAGE,
}: {
  src: string;
  alt?: string;
  className?: string;
  fallback?: string;
}) {
  const [current, setCurrent] = useState(src || fallback);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt || ""}
      className={className}
      onError={() => setCurrent(fallback)}
    />
  );
}
