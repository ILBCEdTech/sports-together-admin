type StudentRosterResponse = Array<{
  id: number;
  name: string;
  teams: Array<{
    id: number;
    name: string;
    code: string | null;
    players: Array<{
      jersey_no: number | null;
      player: {
        id: number;
        name: string;
        school_name: string;
      };
    }>;
  }>;
}>;

export async function getStudentSports() {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/student-rosters`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Student roster request failed with status ${response.status}.`);
  }

  const sports = (await response.json()) as StudentRosterResponse;

  return sports.map((sport) => ({
    id: sport.id,
    name: sport.name,
    teams: sport.teams.map((team) => ({
      id: team.id,
      name: team.name,
      code: team.code,
      players: team.players.map(({ jersey_no, player }) => ({
        id: player.id,
        name: player.name,
        school_name: player.school_name,
        jerseyNo: jersey_no,
      })),
    })),
  }));
}
