import { z } from "zod";

const publicSportSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  is_active: z.boolean(),
});

export type PublicSport = z.infer<typeof publicSportSchema>;

export async function getPublicSports(): Promise<PublicSport[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/sports`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Sports request failed with status ${response.status}.`);
  }

  return z.array(publicSportSchema).parse(await response.json());
}
