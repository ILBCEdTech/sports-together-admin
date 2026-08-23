import { z } from "zod";

const sportSchema = z.object({ id: z.number().int(), name: z.string() });
const teamSchema = z.object({ id: z.number().int(), name: z.string(), sport_id: z.number().int() });
const fixtureSchema = z.object({ id: z.number().int(), sport_id: z.number().int(), round: z.string().nullable() });
const fixtureTeamSchema = z.object({
  fixture_id: z.number().int(),
  team_id: z.number().int(),
  side: z.enum(["HOME", "AWAY"]),
});
const resultSchema = z.object({
  fixture_id: z.number().int(),
  winner_team_id: z.number().int().nullable(),
  team_a_score: z.number().nullable(),
  team_b_score: z.number().nullable(),
  status: z.enum(["PENDING", "FINAL"]),
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

type Team = z.infer<typeof teamSchema>;
type Fixture = z.infer<typeof fixtureSchema>;
type FixtureTeam = z.infer<typeof fixtureTeamSchema>;
type Result = z.infer<typeof resultSchema>;

async function getResource<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} request failed with status ${response.status}.`);
  return schema.parse(await response.json());
}

export type RankingGroup = { title: string; teams: Array<{ id: number; name: string }> };
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

function rankTeams(teams: Team[], fixtures: Fixture[], fixtureTeams: FixtureTeam[], results: Result[]) {
  const finalResults = new Map(
    results.filter((result) => result.status === "FINAL").map((result) => [result.fixture_id, result]),
  );
  const records = new Map(teams.map((team) => [team.id, { team, wins: 0, pointDifference: 0 }]));

  for (const fixture of fixtures) {
    const result = finalResults.get(fixture.id);
    if (!result) continue;
    const links = fixtureTeams.filter((link) => link.fixture_id === fixture.id);
    const home = links.find((link) => link.side === "HOME");
    const away = links.find((link) => link.side === "AWAY");
    if (!home || !away) continue;
    const homeRecord = records.get(home.team_id);
    const awayRecord = records.get(away.team_id);
    const homeScore = result.team_a_score ?? 0;
    const awayScore = result.team_b_score ?? 0;
    if (homeRecord) homeRecord.pointDifference += homeScore - awayScore;
    if (awayRecord) awayRecord.pointDifference += awayScore - homeScore;
    const winner = result.winner_team_id ? records.get(result.winner_team_id) : undefined;
    if (winner) winner.wins += 1;
  }

  return [...records.values()]
    .sort(
      (left, right) =>
        right.wins - left.wins ||
        right.pointDifference - left.pointDifference ||
        left.team.name.localeCompare(right.team.name),
    )
    .map(({ team }) => ({ id: team.id, name: team.name }));
}

export async function getRankingGroups(requestedSportId?: number) {
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
  if (!sport) return { sportId: null, sportName: "Basketball", groups: [] as RankingGroup[] };

  const sportTeams = teams.filter((team) => team.sport_id === sport.id);
  const sportFixtures = fixtures.filter((fixture) => fixture.sport_id === sport.id);
  const divisions = [...new Set(sportFixtures.map((fixture) => fixture.round?.trim() || "Division 1"))];
  if (divisions.length === 0) divisions.push("Division 1");

  const groups = divisions.map((division) => {
    const divisionFixtures = sportFixtures.filter((fixture) => (fixture.round?.trim() || "Division 1") === division);
    const fixtureIds = new Set(divisionFixtures.map((fixture) => fixture.id));
    const teamIds = new Set(
      fixtureTeams.filter((link) => fixtureIds.has(link.fixture_id)).map((link) => link.team_id),
    );
    const divisionTeams = teamIds.size > 0 ? sportTeams.filter((team) => teamIds.has(team.id)) : sportTeams;
    return {
      title: division.toLowerCase().includes(sport.name.toLowerCase()) ? division : `Boys ${sport.name} ${division}`,
      teams: rankTeams(divisionTeams, divisionFixtures, fixtureTeams, results),
    };
  });

  return { sportId: sport.id, sportName: sport.name, groups };
}

export function getSportGalleries(sportId: number) {
  return getResource(`sport-galleries?sportId=${sportId}`, z.array(sportGallerySchema));
}

export async function getRankingGroupsBySlug(slug: string) {
  const sports = await getResource("sports", z.array(sportSchema));
  const sport = sports.find((item) => sportSlug(item.name) === slug);
  if (!sport) return null;
  return getRankingGroups(sport.id);
}
