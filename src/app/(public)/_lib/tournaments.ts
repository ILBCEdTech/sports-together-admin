import { z } from "zod";

const tournamentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]),
});

export type PublicTournament = z.infer<typeof tournamentSchema>;

export async function getPublicTournaments(): Promise<PublicTournament[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/tournaments`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Tournament request failed with status ${response.status}.`);
  }

  return z.array(tournamentSchema).parse(await response.json());
}
