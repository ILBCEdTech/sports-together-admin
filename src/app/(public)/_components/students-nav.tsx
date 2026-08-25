import { z } from "zod";

const rosterSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
    teams: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        code: z.string().nullable(),
        players: z.array(
          z.object({
            jersey_no: z.number().int().nullable(),
            player: z.object({
              id: z.number().int(),
              name: z.string(),
              school_name: z.string(),
            }),
          }),
        ),
      }),
    ),
  }),
);

export async function getStudentSports() {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/student-rosters`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Student roster request failed with status ${response.status}.`);
  const sports = rosterSchema.parse(await response.json());

  return sports
    .map((sport) => ({
      id: sport.id,
      name: sport.name,
      teams: sport.teams.map((team) => ({
        id: team.id,
        name: team.name,
        code: team.code,
        players: team.players.map(({ player, jersey_no }) => ({ ...player, jerseyNo: jersey_no })),
      })),
    }))
    .filter((sport) => sport.teams.length > 0);
}
