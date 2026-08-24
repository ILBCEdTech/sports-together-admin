import { z } from "zod";

const sportSchema = z.object({ id: z.number().int(), name: z.string() });
const teamSchema = z.object({ id: z.number().int(), name: z.string(), sport_id: z.number().int() });
const fixtureSchema = z.object({
  id: z.number().int(),
  sport_id: z.number().int(),
  match_number: z.string().nullable(),
  round: z.string().nullable(),
  start_at: z.string(),
});
const fixtureTeamSchema = z.object({
  fixture_id: z.number().int(),
  team_id: z.number().int(),
  side: z.enum(["HOME", "AWAY"]),
});
const resultSchema = z.object({
  id: z.number().int(),
  fixture_id: z.number().int(),
  winner_team_id: z.number().int().nullable(),
  team_a_score: z.number().nullable(),
  team_b_score: z.number().nullable(),
  status: z.enum(["PENDING", "FINAL"]),
  remark: z.string().nullable(),
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
  sport_id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  images: z.array(galleryImageSchema),
});

type FixtureTeam = z.infer<typeof fixtureTeamSchema>;

async function getResource<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} request failed with status ${response.status}.`);
  return schema.parse(await response.json());
}

export type PublicResult = {
  id: number;
  matchNumber: string;
  round: string | null;
  startAt: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  status: "PENDING" | "FINAL";
  remark: string | null;
};
export type SportGallery = z.infer<typeof sportGallerySchema>;

export function sportSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getResultSports() {
  const sports = await getResource("sports", z.array(sportSchema));
  return sports.map((sport) => ({ ...sport, slug: sportSlug(sport.name) }));
}

export async function getSportResults(requestedSportId?: number) {
  const [sports, teams, fixtures, fixtureTeams, results] = await Promise.all([
    getResource("sports", z.array(sportSchema)),
    getResource("teams", z.array(teamSchema)),
    getResource("fixtures", z.array(fixtureSchema)),
    getResource("fixture-teams", z.array(fixtureTeamSchema)),
    getResource("results", z.array(resultSchema)),
  ]);

  const sport =
    sports.find((item) => item.id === requestedSportId) ??
    sports.find((item) => item.name.toLowerCase() === "basketball") ??
    sports[0];
  if (!sport) return { sportId: null, sportName: "Basketball", results: [] as PublicResult[] };

  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const sportFixtures = fixtures.filter((fixture) => fixture.sport_id === sport.id);
  const fixturesById = new Map(sportFixtures.map((fixture) => [fixture.id, fixture]));
  const linksByFixture = new Map<number, FixtureTeam[]>();
  for (const link of fixtureTeams) {
    const links = linksByFixture.get(link.fixture_id) ?? [];
    links.push(link);
    linksByFixture.set(link.fixture_id, links);
  }

  const sportResults = results
    .filter((result) => fixturesById.has(result.fixture_id))
    .map((result) => {
      const fixture = fixturesById.get(result.fixture_id)!;
      const links = linksByFixture.get(fixture.id) ?? [];
      const home = links.find((link) => link.side === "HOME");
      const away = links.find((link) => link.side === "AWAY");
      return {
        id: result.id,
        matchNumber: fixture.match_number?.trim() || "—",
        round: fixture.round,
        startAt: fixture.start_at,
        homeTeam: home ? (teamsById.get(home.team_id)?.name ?? "Unknown team") : "Unknown team",
        awayTeam: away ? (teamsById.get(away.team_id)?.name ?? "Unknown team") : "Unknown team",
        homeScore: result.team_a_score,
        awayScore: result.team_b_score,
        winner: result.winner_team_id ? (teamsById.get(result.winner_team_id)?.name ?? null) : null,
        status: result.status,
        remark: result.remark,
      } satisfies PublicResult;
    })
    .sort((left, right) => Date.parse(right.startAt) - Date.parse(left.startAt));

  return { sportId: sport.id, sportName: sport.name, results: sportResults };
}

export function getSportGalleries(sportId: number) {
  return getResource(`sport-galleries?sportId=${sportId}`, z.array(sportGallerySchema));
}

export async function getSportResultsBySlug(slug: string) {
  const sports = await getResource("sports", z.array(sportSchema));
  const sport = sports.find((item) => sportSlug(item.name) === slug);
  if (!sport) return null;
  return getSportResults(sport.id);
}
