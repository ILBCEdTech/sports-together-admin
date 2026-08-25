import { z } from "zod";

const staffSchema = z.array(z.object({
  id: z.number(),
  name: z.string(),
  coaches: z.array(z.object({ id: z.number(), name: z.string(), role: z.string().nullable() })),
  commissioners: z.array(z.object({ id: z.number(), name: z.string(), role: z.string().nullable() })),
}));

export type SportStaff = z.infer<typeof staffSchema>[number];

export async function getSportStaff(): Promise<SportStaff[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/sport-staff`, { cache: "no-store" });
  if (!response.ok) throw new Error("Sport staff is unavailable.");
  return staffSchema.parse(await response.json()).filter((sport) =>
    sport.commissioners.length > 0 || sport.coaches.length > 0,
  );
}
