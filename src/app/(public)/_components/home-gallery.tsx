"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGalleryImageUrl } from "@/lib/gallery-image-url";

import type { SchoolLifeGallery } from "../school-life/_lib/school-life-data";

type Category = {
  name: string;
  galleries: SchoolLifeGallery[];
};

function getCategories(galleries: SchoolLifeGallery[]): Category[] {
  const categories = new Map<string, SchoolLifeGallery[]>();

  for (const gallery of galleries) {
    if (gallery.images.length === 0) continue;

    const categoryName = gallery.sport_id === null ? "Other" : gallery.sportName;
    const categoryGalleries = categories.get(categoryName) ?? [];
    categoryGalleries.push(gallery);
    categories.set(categoryName, categoryGalleries);
  }

  return Array.from(categories, ([name, categoryGalleries]) => ({ name, galleries: categoryGalleries }));
}

export function HomeGallery({ galleries }: { galleries: SchoolLifeGallery[] }) {
  const categories = getCategories(galleries);

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="home-gallery-heading" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 font-bold text-sky-700 text-xs uppercase tracking-[0.18em]">
              <Images className="size-4" aria-hidden="true" />
              Gallery
            </p>
            <h2 id="home-gallery-heading" className="mt-4 font-serif text-4xl text-sky-950 uppercase sm:text-5xl">
              Moments from the games.
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600 leading-7">
              Explore the teamwork, energy, and sportsmanship of Sports Together by category.
            </p>
          </div>

          <Link
            href="/school-life"
            className="inline-flex items-center gap-2 self-start font-bold text-sky-800 text-sm uppercase tracking-wide hover:text-sky-600 sm:self-auto"
          >
            View all photos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <Tabs defaultValue={categories[0].name} className="mt-10 gap-8">
          <TabsList
            aria-label="Gallery categories"
            className="flex h-auto w-full justify-start gap-px overflow-x-auto rounded-none bg-slate-200 p-0"
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category.name}
                value={category.name}
                className="h-20 min-w-40 flex-1 rounded-none border-0 bg-white px-4 font-bold text-base text-sky-950 shadow-none hover:bg-slate-50 data-active:bg-sky-950 data-active:text-white data-active:shadow-none"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const images = category.galleries
              .flatMap((gallery) =>
                gallery.images.map((image) => ({
                  ...image,
                  galleryTitle: gallery.title,
                })),
              )
              .slice(0, 6);

            return (
              <TabsContent key={category.name} value={category.name}>
                <div className="grid auto-rows-[13rem] gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[16rem]">
                  {images.map((image, index) => (
                    <figure
                      key={image.id}
                      className={`group relative overflow-hidden bg-slate-200 ${
                        index === 0 && images.length > 3 ? "sm:row-span-2 sm:min-h-[27rem] lg:min-h-[33rem]" : ""
                      }`}
                    >
                      <Image
                        src={getGalleryImageUrl(image)}
                        alt={image.alt_text ?? `${category.name}: ${image.galleryTitle}`}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent px-5 pt-16 pb-5 text-white">
                        <span className="font-bold text-xs uppercase tracking-[0.14em]">{category.name}</span>
                        <span className="mt-1 block font-serif text-xl">{image.galleryTitle}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
