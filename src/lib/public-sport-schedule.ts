import { z } from "zod";

import type { Fixture } from "@/lib/fixture-data";

const scheduleSchema = z.array(z.object({
  id: z.number().int(),
  name: z.string(),
  fixtures: z.array(z.object({
    id: z.number().int(),
    match_number: z.string().nullable(),
    round: z.string().nullable(),
    start_at: z.string(),
    end_at: z.string().nullable(),
    venue: z.object({ name: z.string() }).nullable(),
    teams: z.array(z.object({
      side: z.enum(["HOME", "AWAY"]),
      team: z.object({ id: z.number().int(), name: z.string() }),
    })),
    players: z.array(z.object({
      team_id: z.number().int(),
      player: z.object({ id: z.number().int(), name: z.string() }),
    })),
  })),
}));

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Yangon",
});

export async function getPublicSportSchedule(sportName: string): Promise<Fixture[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/sport-schedules`, { cache: "no-store" });
    if (!response.ok) return [];
    const sport = scheduleSchema.parse(await response.json()).find(
      (item) => item.name.toLowerCase() === sportName.toLowerCase(),
    );
    if (!sport) return [];
    return sport.fixtures.map((fixture, index) => {
      const homeTeam = fixture.teams.find((team) => team.side === "HOME")?.team;
      const awayTeam = fixture.teams.find((team) => team.side === "AWAY")?.team;
      const start = new Date(fixture.start_at);
      const end = fixture.end_at ? new Date(fixture.end_at) : null;
      return {
        match: fixture.match_number?.trim() || `Match ${index + 1}`,
        time: `${timeFormatter.format(start)}${end ? `-${timeFormatter.format(end)}` : ""}`,
        division: fixture.round ?? undefined,
        venue: fixture.venue?.name ?? "Event venue",
        home: homeTeam?.name,
        away: awayTeam?.name,
        homePlayers: homeTeam
          ? fixture.players.filter((entry) => entry.team_id === homeTeam.id).map((entry) => entry.player.name)
          : [],
        awayPlayers: awayTeam
          ? fixture.players.filter((entry) => entry.team_id === awayTeam.id).map((entry) => entry.player.name)
          : [],
        startAt: fixture.start_at,
        endAt: fixture.end_at ?? undefined,
      };
    });
  } catch {
    return [];
  }
}
