"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Trophy, UsersRound, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { adminApi } from "@/lib/admin-api.client";
import type {
  FixtureRecord,
  FixtureTeamRecord,
  PlayerRecord,
  TeamPlayerRecord,
  TeamRecord,
  TournamentRecord,
  VenueRecord,
} from "@/lib/admin-records";

type Lookup = { id: number; name: string };

type DetailsData = {
  fixture: FixtureRecord;
  tournaments: TournamentRecord[];
  sports: Lookup[];
  venues: VenueRecord[];
  teams: TeamRecord[];
  players: PlayerRecord[];
  fixtureTeams: FixtureTeamRecord[];
  teamPlayers: TeamPlayerRecord[];
};

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const statusLabel = (value: FixtureRecord["status"]) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const enumLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const usesFixtureLevel = (sport: Lookup | undefined) =>
  sport ? ["football", "volleyball"].includes(sport.name.trim().toLowerCase()) : false;

export function FixtureDetails({ fixtureId }: { fixtureId: string }) {
  const [data, setData] = useState<DetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!/^\d+$/.test(fixtureId)) {
      setError("Invalid fixture ID.");
      setLoading(false);
      return;
    }

    Promise.all([
      adminApi<FixtureRecord>(`fixtures/${fixtureId}`),
      adminApi<TournamentRecord[]>("tournaments"),
      adminApi<Lookup[]>("sports"),
      adminApi<VenueRecord[]>("venues"),
      adminApi<TeamRecord[]>("teams"),
      adminApi<PlayerRecord[]>("players"),
      adminApi<FixtureTeamRecord[]>("fixture-teams"),
      adminApi<TeamPlayerRecord[]>("team-players"),
    ])
      .then(([fixture, tournaments, sports, venues, teams, players, fixtureTeams, teamPlayers]) =>
        setData({ fixture, tournaments, sports, venues, teams, players, fixtureTeams, teamPlayers }),
      )
      .catch((requestError: Error) => {
        setError(requestError.message);
        toast.error(requestError.message);
      })
      .finally(() => setLoading(false));
  }, [fixtureId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading fixture details...</p>;

  if (!data || error) {
    return (
      <Empty className="min-h-96 rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays />
          </EmptyMedia>
          <EmptyTitle>Fixture unavailable</EmptyTitle>
          <EmptyDescription>{error ?? "This fixture could not be found."}</EmptyDescription>
          <Button variant="outline" asChild>
            <Link href="/admin/fixtures">Back to fixtures</Link>
          </Button>
        </EmptyHeader>
      </Empty>
    );
  }

  const { fixture } = data;
  const tournament = data.tournaments.find((item) => item.id === fixture.tournament_id);
  const sport = data.sports.find((item) => item.id === fixture.sport_id);
  const venue = data.venues.find((item) => item.id === fixture.venue_id);
  const teamLinks = data.fixtureTeams.filter((item) => item.fixture_id === fixture.id);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/admin/fixtures">
            <ArrowLeft /> Back to fixtures
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Fixture {fixture.id}</p>
            <h1 className="font-medium text-3xl tracking-tight">{sport?.name ?? "Fixture details"}</h1>
            <p className="mt-1 text-muted-foreground">{tournament?.name ?? "Unknown tournament"}</p>
          </div>
          <Badge variant={fixture.status === "CANCELLED" ? "destructive" : "outline"}>
            {statusLabel(fixture.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard icon={Trophy} label="Tournament" value={tournament?.name ?? "Unknown"} />
        <SummaryCard
          icon={CalendarDays}
          label={usesFixtureLevel(sport) ? "Level" : "Round"}
          value={fixture.round ?? "Not specified"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Detail label="Start time" value={dateTime(fixture.start_at)} />
          <Detail label="End time" value={fixture.end_at ? dateTime(fixture.end_at) : "Not specified"} />
          <Detail label="Venue" value={venue?.name ?? "Unassigned"} />
          <Detail label="Venue type" value={venue?.type ? enumLabel(venue.type) : "Not specified"} />
          <Detail label="Location" value={venue?.location ?? "Not specified"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teams and rosters</CardTitle>
        </CardHeader>
        <CardContent>
          {teamLinks.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {teamLinks.map((link) => {
                const team = data.teams.find((item) => item.id === link.team_id);
                const playerIds = data.teamPlayers
                  .filter((item) => item.team_id === link.team_id)
                  .map((item) => item.player_id);
                const selectedPlayers = data.players.filter((player) => playerIds.includes(player.id));
                return (
                  <div key={link.team_id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-medium">{team?.name ?? "Unknown team"}</h2>
                      <Badge variant="secondary">{link.side === "HOME" ? "Home" : "Away"}</Badge>
                    </div>
                    <Separator className="my-4" />
                    {selectedPlayers.length ? (
                      <ul className="space-y-2">
                        {selectedPlayers.map((player) => (
                          <li key={player.id} className="flex items-center justify-between gap-3 text-sm">
                            <span>{player.name}</span>
                            <span className="text-muted-foreground">{player.school_name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No players assigned to this team.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty className="min-h-48">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersRound />
                </EmptyMedia>
                <EmptyTitle>No teams assigned</EmptyTitle>
                <EmptyDescription>This fixture does not have team assignments.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="rounded-lg bg-muted p-2">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-medium break-words">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
