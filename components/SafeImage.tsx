"use client";

import { useState } from "react";

export default function SafeImage({
  src,
  alt,
  className,
  fallback = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80",
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
