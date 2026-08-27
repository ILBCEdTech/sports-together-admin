import { z } from "zod";

const sportSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const galleryImageSchema = z.object({
  id: z.number().int(),
  image_url: z.string().url(),
  presigned_url: z.string().url().nullable().optional(),
  alt_text: z.string().nullable(),
  sort_order: z.number().int(),
});

const sportGallerySchema = z.object({
  id: z.number().int(),
  sport_id: z.number().int().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  images: z.array(galleryImageSchema),
});

async function getResource<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${path} request failed with status ${response.status}.`);
  }

  return schema.parse(await response.json());
}

export async function getSchoolLifeGalleries() {
  const [sports, galleries] = await Promise.all([
    getResource("sports", z.array(sportSchema)),
    getResource("sport-galleries", z.array(sportGallerySchema)),
  ]);
  const sportsById = new Map(sports.map((sport) => [sport.id, sport.name]));

  return galleries
    .map((gallery) => ({
      ...gallery,
      sportName: gallery.sport_id === null ? "School Life" : (sportsById.get(gallery.sport_id) ?? "School sport"),
      images: [...gallery.images].sort((left, right) => left.sort_order - right.sort_order),
    }))
    .filter((gallery) => gallery.images.length > 0);
}

export type SchoolLifeGallery = Awaited<ReturnType<typeof getSchoolLifeGalleries>>[number];
