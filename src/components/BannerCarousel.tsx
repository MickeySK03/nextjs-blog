"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const goTo = (index: number) => setCurrent(index);
  const goNext = () => setCurrent((prev) => (prev + 1) % banners.length);
  const goPrev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <section className="relative h-96 overflow-hidden bg-slate-900">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {banner.imageUrl && (
            <>
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 via-slate-900/50 to-transparent z-10" />
            </>
          )}
          <div className="absolute inset-0 -right-full flex items-center z-20">
            <div className="max-w-6xl mx-auto px-10 w-full">
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {banner.title}
              </h2>
              {banner.description && (
                <p className="text-slate-300 text-lg max-w-xl">{banner.description}</p>
              )}
              {banner.linkUrl && (
                <Link href={banner.linkUrl} className="mt-6 inline-block btn-primary">
                  Learn More →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Next banner"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
