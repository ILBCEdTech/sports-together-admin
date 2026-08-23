"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImageUrl } from "@/lib/gallery-image-url";

import type { SportGallery } from "../_lib/results-data";

const autoplayDelay = 4000;
const imagesPerSlide = 3;
type SliderImage = SportGallery["images"][number] & { galleryTitle: string };

export function SportGallerySection({ galleries, sportName }: { galleries: SportGallery[]; sportName: string }) {
  const images: SliderImage[] = galleries.flatMap((gallery) =>
    gallery.images.map((image) => ({ ...image, galleryTitle: gallery.title })),
  );
  const slides = Array.from({ length: Math.ceil(images.length / imagesPerSlide) }, (_, index) =>
    images.slice(index * imagesPerSlide, index * imagesPerSlide + imagesPerSlide),
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [previewImage, setPreviewImage] = useState<SliderImage | null>(null);
  const [previewRatio, setPreviewRatio] = useState(16 / 9);

  useEffect(() => {
    if (paused || previewImage || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, autoplayDelay);
    return () => window.clearInterval(timer);
  }, [paused, previewImage, slides.length]);

  if (images.length === 0) return null;

  function showPrevious() {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  function openPreview(image: SliderImage) {
    setPreviewRatio(16 / 9);
    setPreviewImage(image);
  }

  return (
    <section
      aria-labelledby="sport-gallery-heading"
      className="mt-16 border-t border-slate-300 pt-12 sm:mt-20 sm:pt-16"
    >
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 font-bold text-sky-700 text-sm uppercase tracking-[0.16em]">
            <Camera className="size-4" aria-hidden="true" /> Photo gallery
          </p>
          <h2
            id="sport-gallery-heading"
            className="mt-2 font-serif font-bold text-3xl text-slate-900 tracking-tight sm:text-5xl"
          >
            {sportName} moments
          </h2>
        </div>
        <p className="hidden text-slate-500 text-sm sm:block">{images.length} photos</p>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${sportName} photo gallery`}
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div className="relative h-64 w-full sm:h-80 lg:h-[26rem]">
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === activeSlide;
            return (
              <div
                key={slide.map((image) => image.id).join("-")}
                aria-hidden={!active}
                className={`absolute inset-0 grid grid-cols-3 gap-2 transition-all duration-500 ease-out sm:gap-3 ${
                  active ? "z-10 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
              >
                {slide.map((image, imageIndex) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => openPreview(image)}
                    onFocus={() => setPaused(true)}
                    className="group relative h-full min-w-0 overflow-hidden rounded-md bg-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
                    aria-label={`Preview ${image.alt_text ?? image.galleryTitle}`}
                  >
                    <Image
                      src={getGalleryImageUrl(image)}
                      alt={image.alt_text ?? `${image.galleryTitle} photo ${slideIndex * imagesPerSlide + imageIndex + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 1280px) 33vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={slideIndex === 0}
                    />
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
              onClick={showPrevious}
              className="absolute top-1/2 left-3 z-40 -translate-y-1/2 rounded-full bg-white/90 text-slate-900 shadow-md hover:bg-white"
              aria-label="Show previous photos"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={showNext}
              className="absolute top-1/2 right-3 z-40 -translate-y-1/2 rounded-full bg-white/90 text-slate-900 shadow-md hover:bg-white"
              aria-label="Show next photos"
            >
              <ChevronRight />
            </Button>
            <div
              className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm"
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
            </div>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="h-auto max-w-none border-0 bg-transparent p-0 text-white shadow-none ring-0 sm:max-w-none"
          style={{ width: `min(98vw, ${94 * previewRatio}vh)`, aspectRatio: previewRatio }}
        >
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <DialogDescription className="sr-only">Expanded preview of the selected gallery image.</DialogDescription>
          {previewImage && (
            <div className="relative size-full overflow-hidden rounded-lg">
              <Image
                src={getGalleryImageUrl(previewImage)}
                alt={previewImage.alt_text ?? previewImage.galleryTitle}
                fill
                unoptimized
                sizes="98vw"
                className="object-contain"
                onLoad={(event) => {
                  const { naturalHeight, naturalWidth } = event.currentTarget;
                  if (naturalHeight > 0) setPreviewRatio(naturalWidth / naturalHeight);
                }}
              />
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-3 right-3 z-10 rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-100"
                  aria-label="Close image preview"
                >
                  <X aria-hidden="true" />
                </Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
