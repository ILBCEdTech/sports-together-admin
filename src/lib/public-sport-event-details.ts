import { z } from "zod";

const eventDetailsSchema = z.array(z.object({
  id: z.number().int(),
  name: z.string(),
  fixtures: z.array(z.object({
    start_at: z.string(),
    venue: z.object({ name: z.string(), location: z.string().nullable() }).nullable(),
  })),
}));

export type PublicSportEventDetails = {
  date: string;
  venue: string | null;
};

export async function getPublicSportEventDetails(sportName: string): Promise<PublicSportEventDetails | null> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/sport-event-details`, { cache: "no-store" });
    if (!response.ok) return null;
    const sports = eventDetailsSchema.parse(await response.json());
    const fixture = sports.find((sport) => sport.name.toLowerCase() === sportName.toLowerCase())?.fixtures[0];
    if (!fixture) return null;
    return { date: fixture.start_at, venue: fixture.venue?.name ?? fixture.venue?.location ?? null };
  } catch {
    return null;
  }
}
