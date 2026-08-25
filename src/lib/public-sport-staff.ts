import { z } from "zod";

const personSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  role: z.string().nullable(),
});

const sportStaffSchema = z.array(z.object({
  id: z.number().int(),
  name: z.string(),
  coaches: z.array(personSchema),
  commissioners: z.array(personSchema),
}));

export type PublicSportStaffPerson = z.infer<typeof personSchema>;

export async function getPublicSportStaff(sportName: string): Promise<PublicSportStaffPerson[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/sport-staff`, { cache: "no-store" });
    if (!response.ok) return [];
    const sports = sportStaffSchema.parse(await response.json());
    const sport = sports.find((item) => item.name.toLowerCase() === sportName.toLowerCase());
    return sport ? [...sport.coaches, ...sport.commissioners] : [];
  } catch {
    return [];
  }
}
