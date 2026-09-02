"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/data/mockData";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { mapSlide } from "@/lib/mappers";
import { getLocalItem, setLocalItem, storageKeys } from "@/lib/storage";
import SafeImage from "@/components/SafeImage";
import type { HeroSlide } from "@/data/mockData";
import type { SlideRow } from "@/lib/types";

const INTERVAL = 7000;
const customKey = "arda_user_custom_slides_v1";

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(heroSlides);
  const [index, setIndex] = useState(0);
  const slidesRef = useRef<HeroSlide[]>(slides);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  const persistRows = useCallback((rows: SlideRow[]) => {
    const publicSlides = rows.map(mapSlide);
    setLocalItem(storageKeys.slides, publicSlides);
    localStorage.setItem("arda_admin_slides_list", JSON.stringify(rows));
    localStorage.setItem("arda_slides_override", JSON.stringify(rows));
  }, []);

  const parseRows = useCallback((rows: unknown[]): HeroSlide[] | null => {
    const active = rows
      .filter((s: any) => s.active !== false)
      .map((s: any) => {
        if (s.image_url) return mapSlide(s as SlideRow);
        return s as HeroSlide;
      });
    return active.length > 0 ? active : null;
  }, []);

  const loadFromStorage = useCallback((): HeroSlide[] | null => {
    if (typeof window === "undefined") return null;

    try {
      const customRaw = localStorage.getItem(customKey);
      if (customRaw) {
        const custom = JSON.parse(customRaw) as {
          userModified?: boolean;
          slides?: unknown[];
        };
        if (
          custom.userModified &&
          Array.isArray(custom.slides) &&
          custom.slides.length > 0
        ) {
          const active = parseRows(custom.slides);
          if (active) return active;
        }
      }
    } catch {
      // ignore
    }

    const raw =
      localStorage.getItem("arda_slides_override") ||
      localStorage.getItem("arda_admin_slides_list") ||
      localStorage.getItem(storageKeys.slides);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as unknown[];
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      return parseRows(parsed);
    } catch {
      return null;
    }
  }, [parseRows]);

  useEffect(() => {
    async function loadFromSupabase() {
      if (!isSupabaseConfigured()) return false;
      const supabase = createSupabaseClient();
      if (!supabase) return false;
      try {
        const { data, error } = await supabase
          .from("slides")
          .select("*")
          .eq("active", true)
          .order("order_index", { ascending: true });
        if (error || !data || data.length === 0) return false;
        const rows = data as SlideRow[];
        const active = parseRows(rows);
        if (!active) return false;
        setSlides(active);
        persistRows(rows);
        return true;
      } catch {
        return false;
      }
    }

    async function init() {
      const synced = await loadFromSupabase();
      if (!synced) {
        const cached = loadFromStorage();
        if (cached) setSlides(cached);
      }
    }

    init();

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === customKey ||
        e.key === "arda_slides_override" ||
        e.key === "arda_admin_slides_list" ||
        e.key === storageKeys.slides
      ) {
        const cached = loadFromStorage();
        if (cached) setSlides(cached);
      }
    };

    const onUpdate = () => {
      const cached = loadFromStorage();
      if (cached) setSlides(cached);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("arda-slides-updated", onUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("arda-slides-updated", onUpdate);
    };
  }, [loadFromStorage, parseRows, persistRows]);

  const go = useCallback((direction: number) => {
    setIndex((current) => {
      const total = slidesRef.current.length;
      if (total === 0) return 0;
      const next = current + direction;
      if (next < 0) return total - 1;
      if (next >= total) return 0;
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => go(1), INTERVAL);
    return () => window.clearInterval(timer);
  }, [go]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <section className="relative h-[78vh] min-h-[520px] sm:min-h-[600px] overflow-hidden bg-navy">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <SafeImage
            src={slide.image}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/25" />
        </motion.div>
      </AnimatePresence>

      <div className="container-arda relative z-10 flex h-full items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-copy`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex rounded-full bg-relief px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {slide.category}
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl lg:text-[3.25rem]">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              {slide.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={slide.primaryCta.href} className="btn-action">
                {slide.primaryCta.label}
              </Link>
              <Link href={slide.secondaryCta.href} className="btn-outline">
                {slide.secondaryCta.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-10">
        <div className="container-arda flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-action" : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-action text-white transition hover:bg-action-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-action text-white transition hover:bg-action-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
