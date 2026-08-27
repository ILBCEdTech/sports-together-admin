"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImageUrl } from "@/lib/gallery-image-url";

import type { SchoolLifeGallery as SchoolLifeGalleryData } from "../_lib/school-life-data";

const autoplayDelay = 4000;
const imagesPerSlide = 3;

function GalleryCarousel({ gallery }: { gallery: SchoolLifeGalleryData }) {
  const slides = Array.from({ length: Math.ceil(gallery.images.length / imagesPerSlide) }, (_, index) =>
    gallery.images.slice(index * imagesPerSlide, index * imagesPerSlide + imagesPerSlide),
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [maximizedImage, setMaximizedImage] = useState<SchoolLifeGalleryData["images"][number] | null>(null);
  const [maximizedImageSize, setMaximizedImageSize] = useState({ width: 4, height: 3 });

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, autoplayDelay);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  function showAdjacentMaximizedImage(direction: -1 | 1) {
    if (!maximizedImage) return;

    const currentIndex = gallery.images.findIndex((image) => image.id === maximizedImage.id);
    const nextIndex = (currentIndex + direction + gallery.images.length) % gallery.images.length;
    setMaximizedImageSize({ width: 4, height: 3 });
    setMaximizedImage(gallery.images[nextIndex]);
  }

  return (
    <section aria-labelledby={`gallery-${gallery.id}`}>
      <div className="flex flex-col gap-2 border-slate-300 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold text-sky-700 text-xs uppercase tracking-[0.16em]">{gallery.sportName}</p>
          <h2 id={`gallery-${gallery.id}`} className="mt-2 font-serif font-bold text-3xl text-slate-900">
            {gallery.title}
          </h2>
          {gallery.description && <p className="mt-2 max-w-2xl text-slate-600">{gallery.description}</p>}
        </div>
        <p className="text-slate-500 text-sm">
          {gallery.images.length} {gallery.images.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      <section
        aria-roledescription="carousel"
        aria-label={`${gallery.sportName}: ${gallery.title}`}
        className="relative mt-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div className="relative h-36 sm:h-44 lg:h-52">
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === activeSlide;
            return (
              <div
                key={slide.map((image) => image.id).join("-")}
                aria-hidden={!active}
                className={`absolute inset-0 grid grid-cols-3 gap-2 transition-all duration-500 ease-out sm:gap-4 ${
                  active ? "z-10 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                {slide.map((image, imageIndex) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => {
                      setPaused(true);
                      setMaximizedImageSize({ width: 4, height: 3 });
                      setMaximizedImage(image);
                    }}
                    aria-label={`Maximize ${image.alt_text ?? `${gallery.sportName} photo ${slideIndex * imagesPerSlide + imageIndex + 1}`}`}
                    className="group relative h-full min-w-0 overflow-hidden bg-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
                  >
                    <Image
                      src={getGalleryImageUrl(image)}
                      alt={
                        image.alt_text ??
                        `${gallery.sportName}: ${gallery.title} photo ${slideIndex * imagesPerSlide + imageIndex + 1}`
                      }
                      fill
                      unoptimized
                      sizes="(max-width: 1280px) 33vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-slate-950/60 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Maximize2 className="size-4" aria-hidden="true" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pt-12 pb-4 text-left text-white">
                      <span className="font-bold text-xs uppercase tracking-[0.14em]">{gallery.sportName}</span>
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
              className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-white/90 text-slate-900 shadow-md hover:bg-white"
              aria-label={`Show previous ${gallery.sportName} photos`}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
              className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-white/90 text-slate-900 shadow-md hover:bg-white"
              aria-label={`Show next ${gallery.sportName} photos`}
            >
              <ChevronRight />
            </Button>
            <nav
              className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-slate-950/30 px-3 py-2 backdrop-blur-sm"
              aria-label="Choose a gallery slide"
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.map((image) => image.id).join("-")}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    index === activeSlide ? "w-8 bg-white" : "w-2 bg-white/60 hover:bg-white/85"
                  }`}
                />
              ))}
            </nav>
          </>
        )}
      </section>

      <Dialog
        open={Boolean(maximizedImage)}
        onOpenChange={(open) => {
          if (!open) setMaximizedImage(null);
          setPaused(open);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-auto max-w-none overflow-visible rounded-none bg-transparent p-0 text-white shadow-none ring-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">{gallery.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {maximizedImage?.alt_text ?? `Maximized ${gallery.sportName} gallery photo`}
          </DialogDescription>
          {maximizedImage && (
            <div
              className="relative"
              style={{
                aspectRatio: `${maximizedImageSize.width} / ${maximizedImageSize.height}`,
                width: `min(calc(100vw - 2rem), ${(90 * maximizedImageSize.width) / maximizedImageSize.height}vh)`,
              }}
            >
              <Image
                src={getGalleryImageUrl(maximizedImage)}
                alt={maximizedImage.alt_text ?? `${gallery.sportName}: ${gallery.title}`}
                fill
                unoptimized
                sizes="100vw"
                className="object-contain"
                onLoad={(event) => {
                  setMaximizedImageSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  });
                }}
              />
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3 z-10 rounded-full bg-white text-slate-950 shadow-lg hover:bg-slate-100"
                  aria-label="Close maximized image"
                >
                  <X />
                </Button>
              </DialogClose>
              {gallery.images.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => showAdjacentMaximizedImage(-1)}
                    className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-white/90 text-slate-950 shadow-lg hover:bg-white"
                    aria-label="Show previous image"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => showAdjacentMaximizedImage(1)}
                    className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-white/90 text-slate-950 shadow-lg hover:bg-white"
                    aria-label="Show next image"
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function SchoolLifeGallery({ galleries }: { galleries: SchoolLifeGalleryData[] }) {
  if (galleries.length === 0) {
    return (
      <div className="mt-12 border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <Camera className="mx-auto size-8 text-sky-700" aria-hidden="true" />
        <h2 className="mt-4 font-serif font-bold text-2xl text-slate-900">More moments are coming soon</h2>
        <p className="mt-2 text-slate-500">Sport gallery images will appear here once they are published.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {galleries.map((gallery) => (
        <GalleryCarousel key={gallery.id} gallery={gallery} />
      ))}
    </div>
  );
}
