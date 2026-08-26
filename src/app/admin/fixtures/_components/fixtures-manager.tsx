"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AdminFilterBar, AdminListPagination } from "@/components/admin/admin-list-controls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/admin-api.client";
import { type AdminListMeta, type AdminListPayload, normalizeAdminListPayload } from "@/lib/admin-list";
import type {
  FixturePlayerRecord,
  FixtureRecord,
  FixtureStatus,
  FixtureTeamRecord,
  PlayerRecord,
  TeamPlayerRecord,
  TeamRecord,
  VenueRecord,
} from "@/lib/admin-records";
import { useAdminListQuery } from "@/hooks/use-admin-list-query";

type Lookup = { id: number; name: string; code?: string | null };
type FixtureForm = {
  tournament_id: number;
  sport_id: number;
  venue_id: number | null;
  match_number: string;
  round: string;
  start_at: string;
  end_at: string;
  status: FixtureStatus;
  home_team_id: number;
  away_team_id: number;
  home_player_ids: number[];
  away_player_ids: number[];
};

const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED"] as const;
const footballFixtureLevels = ["Male Jr", "Female Jr", "Male Sr", "Female Sr"] as const;
const basketballFixtureLevels = ["Male Sr", "Male Jr", "Female Sr", "Female Jr"] as const;
const volleyballFixtureLevels = ["Male", "Female"] as const;

const fixtureLevelOptions = (sport: Lookup | undefined): readonly string[] => {
  const name = sport?.name.trim().toLowerCase();
  const code = sport?.code?.trim().toLowerCase();
  if (name === "volleyball" || code === "volleyball") return volleyballFixtureLevels;
  if (name === "basketball" || code === "basketball") return basketballFixtureLevels;
  if (name === "football" || code === "football") return footballFixtureLevels;
  return [];
};
const usesFixtureLevel = (sport: Lookup | undefined) => fixtureLevelOptions(sport).length > 0;
const usesTeamMatchup = (sport: Lookup | undefined) => {
  const supportedSports = ["football", "volleyball", "basketball", "badminton"];
  const name = sport?.name.trim().toLowerCase();
  const code = sport?.code?.trim().toLowerCase();
  return supportedSports.includes(name ?? "") || supportedSports.includes(code ?? "");
};
const isBadminton = (sport: Lookup | undefined) => {
  const name = sport?.name.trim().toLowerCase();
  const code = sport?.code?.trim().toLowerCase();
  return name === "badminton" || code === "badminton";
};
const schema = z
  .object({
    tournament_id: z.number().int().positive("Choose a tournament."),
    sport_id: z.number().int().positive("Choose a sport."),
    venue_id: z.number().int().positive("Choose a venue."),
    match_number: z.string().trim().max(60, "Use 60 characters or fewer."),
    round: z.string().trim().max(60, "Use 60 characters or fewer."),
    start_at: z.string().min(1, "Choose a start date and time."),
    end_at: z.string().min(1, "Choose an end date and time."),
    status: z.enum(statuses),
  })
  .refine((data) => !data.end_at || new Date(data.end_at) > new Date(data.start_at), {
    message: "End time must be after the start time.",
    path: ["end_at"],
  });

const emptyForm: FixtureForm = {
  tournament_id: 0,
  sport_id: 0,
  venue_id: null,
  match_number: "",
  round: "",
  start_at: "",
  end_at: "",
  status: "SCHEDULED",
  home_team_id: 0,
  away_team_id: 0,
  home_player_ids: [],
  away_player_ids: [],
};

const dateInput = (value: string | null) => value?.slice(0, 16) ?? "";
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
export function FixturesManager() {
  const listQuery = useAdminListQuery();
  const [fixtures, setFixtures] = useState<FixtureRecord[]>([]);
  const [meta, setMeta] = useState<AdminListMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 1 });
  const [sports, setSports] = useState<Lookup[]>([]);
  const [tournaments, setTournaments] = useState<Lookup[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayerRecord[]>([]);
  const [fixtureTeams, setFixtureTeams] = useState<FixtureTeamRecord[]>([]);
  const [fixturePlayers, setFixturePlayers] = useState<FixturePlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FixtureRecord | null>(null);
  const [deleting, setDeleting] = useState<FixtureRecord | null>(null);
  const [form, setForm] = useState<FixtureForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FixtureForm, string>>>({});
  const hasRequiredLookups = sports.length > 0 && tournaments.length > 0 && venues.length > 0;
  const selectedSport = sports.find((sport) => sport.id === form.sport_id);
  const levelOptions = fixtureLevelOptions(selectedSport);
  const usesLevel = levelOptions.length > 0;
  const usesTeams = usesTeamMatchup(selectedSport);
  const usesBadmintonPlayers = isBadminton(selectedSport);
  const homeRosterIds = new Set(
    teamPlayers.filter((row) => row.team_id === form.home_team_id).map((row) => row.player_id),
  );
  const awayRosterIds = new Set(
    teamPlayers.filter((row) => row.team_id === form.away_team_id).map((row) => row.player_id),
  );
  const homeRoster = players.filter((player) => homeRosterIds.has(player.id));
  const awayRoster = players.filter((player) => awayRosterIds.has(player.id));

  useEffect(() => {
    Promise.all([
      adminApi<Lookup[]>("sports"),
      adminApi<Lookup[]>("tournaments"),
      adminApi<VenueRecord[]>("venues"),
      adminApi<TeamRecord[]>("teams"),
      adminApi<PlayerRecord[]>("players"),
      adminApi<TeamPlayerRecord[]>("team-players"),
      adminApi<FixtureTeamRecord[]>("fixture-teams"),
      adminApi<FixturePlayerRecord[]>("fixture-players"),
    ])
      .then(([sportRows, tournamentRows, venueRows, teamRows, playerRows, rosterRows, teamLinks, playerLinks]) => {
        setSports(sportRows);
        setTournaments(tournamentRows);
        setVenues(venueRows);
        setTeams(teamRows);
        setPlayers(playerRows);
        setTeamPlayers(rosterRows);
        setFixtureTeams(teamLinks);
        setFixturePlayers(playerLinks);
      })
      .catch((error: Error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi<AdminListPayload<FixtureRecord>>(`fixtures?${listQuery.requestQuery}`)
      .then((payload) => {
        const response = normalizeAdminListPayload(payload);
        setFixtures(response.data);
        setMeta(response.meta);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [listQuery.requestQuery]);

  function startCreate() {
    setEditing(null);
    setForm({ ...emptyForm, tournament_id: tournaments[0]?.id ?? 0, sport_id: sports[0]?.id ?? 0 });
    setErrors({});
    setOpen(true);
  }

  function startEdit(item: FixtureRecord) {
    const teamLinks = fixtureTeams.filter((row) => row.fixture_id === item.id);
    const homeTeamId = teamLinks.find((row) => row.side === "HOME")?.team_id ?? 0;
    const awayTeamId = teamLinks.find((row) => row.side === "AWAY")?.team_id ?? 0;
    const playerLinks = fixturePlayers.filter((row) => row.fixture_id === item.id);
    setEditing(item);
    setForm({
      tournament_id: item.tournament_id,
      sport_id: item.sport_id,
      venue_id: item.venue_id,
      match_number: item.match_number ?? "",
      round: item.round ?? "",
      start_at: dateInput(item.start_at),
      end_at: dateInput(item.end_at),
      status: item.status,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      home_player_ids: playerLinks.filter((row) => row.team_id === homeTeamId).map((row) => row.player_id),
      away_player_ids: playerLinks.filter((row) => row.team_id === awayTeamId).map((row) => row.player_id),
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usesLevel && !levelOptions.includes(form.round)) {
      setErrors((current) => ({ ...current, round: "Choose a level." }));
      return;
    }
    if (usesTeams && (!form.home_team_id || !form.away_team_id || form.home_team_id === form.away_team_id)) {
      setErrors((current) => ({ ...current, home_team_id: "Choose two different teams." }));
      return;
    }
    if (usesBadmintonPlayers && (form.home_player_ids.length !== 2 || form.away_player_ids.length !== 2)) {
      setErrors((current) => ({
        ...current,
        home_player_ids: form.home_player_ids.length === 2 ? undefined : "Choose exactly two players.",
        away_player_ids: form.away_player_ids.length === 2 ? undefined : "Choose exactly two players.",
      }));
      return;
    }
    const result = schema.safeParse(form);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fields).map(([key, messages]) => [key, messages?.[0]])));
      return;
    }
    const payload = {
      tournament_id: result.data.tournament_id,
      sport_id: result.data.sport_id,
      venue_id: result.data.venue_id,
      status: result.data.status,
      match_number: usesBadmintonPlayers ? result.data.match_number || null : null,
      round: result.data.round || null,
      start_at: new Date(result.data.start_at).toISOString(),
      end_at: result.data.end_at ? new Date(result.data.end_at).toISOString() : null,
    };
    setSaving(true);
    try {
      const saved = await adminApi<FixtureRecord>(editing ? `fixtures/${editing.id}` : "fixtures", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      if (usesTeams) await syncFixtureTeams(saved.id);
      else if (editing) await clearFixtureTeams(saved.id);
      if (usesBadmintonPlayers) await syncFixturePlayers(saved.id);
      else if (editing) await clearFixturePlayers(saved.id);
      setFixtures((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved],
      );
      toast.success(`Fixture ${editing ? "updated" : "created"}`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fixture could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function syncFixtureTeams(fixtureId: number) {
    await clearFixtureTeams(fixtureId);
    const newTeams: FixtureTeamRecord[] = [
      { fixture_id: fixtureId, team_id: form.home_team_id, side: "HOME" },
      { fixture_id: fixtureId, team_id: form.away_team_id, side: "AWAY" },
    ];
    await Promise.all(newTeams.map((row) => adminApi("fixture-teams", { method: "POST", body: JSON.stringify(row) })));
    setFixtureTeams((current) => [...current.filter((row) => row.fixture_id !== fixtureId), ...newTeams]);
  }

  async function clearFixtureTeams(fixtureId: number) {
    const oldTeams = fixtureTeams.filter((row) => row.fixture_id === fixtureId);
    await Promise.all(
      oldTeams.map((row) => adminApi(`fixture-teams/${fixtureId}/${row.team_id}`, { method: "DELETE" })),
    );
    setFixtureTeams((current) => current.filter((row) => row.fixture_id !== fixtureId));
  }

  async function syncFixturePlayers(fixtureId: number) {
    await clearFixturePlayers(fixtureId);
    const newPlayers: FixturePlayerRecord[] = [
      ...form.home_player_ids.map((playerId) => ({
        fixture_id: fixtureId,
        team_id: form.home_team_id,
        player_id: playerId,
      })),
      ...form.away_player_ids.map((playerId) => ({
        fixture_id: fixtureId,
        team_id: form.away_team_id,
        player_id: playerId,
      })),
    ];
    await Promise.all(
      newPlayers.map((row) => adminApi("fixture-players", { method: "POST", body: JSON.stringify(row) })),
    );
    setFixturePlayers((current) => [...current.filter((row) => row.fixture_id !== fixtureId), ...newPlayers]);
  }

  async function clearFixturePlayers(fixtureId: number) {
    const oldPlayers = fixturePlayers.filter((row) => row.fixture_id === fixtureId);
    await Promise.all(
      oldPlayers.map((row) => adminApi(`fixture-players/${fixtureId}/${row.player_id}`, { method: "DELETE" })),
    );
    setFixturePlayers((current) => current.filter((row) => row.fixture_id !== fixtureId));
  }

  async function deleteFixture() {
    if (!deleting) return;
    setSaving(true);
    try {
      await adminApi(`fixtures/${deleting.id}`, { method: "DELETE" });
      setFixtures((current) => current.filter((fixture) => fixture.id !== deleting.id));
      setFixtureTeams((current) => current.filter((row) => row.fixture_id !== deleting.id));
      setFixturePlayers((current) => current.filter((row) => row.fixture_id !== deleting.id));
      setMeta((current) => {
        const total = Math.max(0, current.total - 1);
        return { ...current, total, pageCount: Math.max(1, Math.ceil(total / current.pageSize)) };
      });
      toast.success("Fixture deleted");
      setDeleting(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fixture could not be deleted.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Fixtures</h1>
          <p className="mt-1 text-muted-foreground">Create and update tournament fixtures.</p>
        </div>
        <Button onClick={startCreate} disabled={loading}>
          <Plus />
          New fixture
        </Button>
      </div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Fixture records</CardTitle>
          <AdminFilterBar
            search={listQuery.search}
            searchPlaceholder="Search match number or team"
            onSearchChange={listQuery.setSearch}
            values={listQuery.values}
            onFilterChange={listQuery.setFilter}
            onClear={listQuery.clearFilters}
            hasFilters={listQuery.hasFilters}
            fields={[
              { key: "sportId", label: "Sports", options: sports.map((item) => ({ label: item.name, value: String(item.id) })) },
              { key: "tournamentId", label: "Tournaments", options: tournaments.map((item) => ({ label: item.name, value: String(item.id) })) },
              { key: "venueId", label: "Venues", options: venues.map((item) => ({ label: item.name, value: String(item.id) })) },
              { key: "from", label: "From date", type: "date" },
              { key: "to", label: "To date", type: "date" },
              { key: "status", label: "Statuses", options: statuses.map((status) => ({ label: status.replaceAll("_", " "), value: status })) },
              { key: "round", label: "Round", type: "text" },
            ]}
          />
        </CardHeader>
        <CardContent className="px-0">
          {loading || listQuery.isPending ? (
            <p className="p-6 text-sm text-muted-foreground">Loading fixtures...</p>
          ) : fixtures.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-4">Sr.</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Fixture</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixtures.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">
                      {(meta.page - 1) * meta.pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      {tournaments.find((tournament) => tournament.id === item.tournament_id)?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.match_number ?? `Event ${index + 1}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.round ??
                          (usesFixtureLevel(sports.find((sport) => sport.id === item.sport_id))
                            ? "No level"
                            : "No round")}
                      </div>
                    </TableCell>
                    <TableCell>{sports.find((sport) => sport.id === item.sport_id)?.name ?? "Unknown"}</TableCell>
                    <TableCell>{dateLabel(item.start_at)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button size="icon-sm" variant="ghost" className="text-blue-600 hover:text-blue-700" asChild>
                        <Link href={`/admin/fixtures/${item.id}`} aria-label={`View fixture ${item.id}`}>
                          <Eye />
                        </Link>
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit fixture ${item.id}`}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setDeleting(item)}
                        aria-label={`Delete fixture ${item.id}`}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="min-h-56">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CalendarDays />
                </EmptyMedia>
                <EmptyTitle>{listQuery.hasFilters ? "No fixtures match these filters" : "No fixtures yet"}</EmptyTitle>
                <EmptyDescription>
                  {listQuery.hasFilters ? "Clear or adjust the filters to see more records." : "Create the first database fixture."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <AdminListPagination meta={meta} onPageChange={listQuery.setPage} />
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit fixture" : "Create fixture"}</DialogTitle>
              <DialogDescription>Set the fixture schedule, venue, and participating teams.</DialogDescription>
            </DialogHeader>
            {!hasRequiredLookups && (
              <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                Create at least one tournament, sport, and venue before saving a fixture.
              </p>
            )}
            <FieldGroup className="my-5 grid gap-4 sm:grid-cols-2">
              <LookupField
                id="tournament"
                label="Tournament"
                value={form.tournament_id}
                options={tournaments}
                onChange={(value) => setForm({ ...form, tournament_id: value })}
                error={errors.tournament_id}
              />
              <LookupField
                id="sport"
                label="Sport"
                value={form.sport_id}
                options={sports}
                onChange={(value) => {
                  const nextLevelOptions = fixtureLevelOptions(sports.find((sport) => sport.id === value));
                  setForm({
                    ...form,
                    sport_id: value,
                    match_number: "",
                    round: nextLevelOptions.includes(form.round) ? form.round : "",
                    home_team_id: 0,
                    away_team_id: 0,
                    home_player_ids: [],
                    away_player_ids: [],
                  });
                  setErrors((current) => ({ ...current, sport_id: undefined, round: undefined }));
                }}
                error={errors.sport_id}
              />
              {usesBadmintonPlayers && (
                <Field data-invalid={Boolean(errors.match_number)}>
                  <FieldLabel htmlFor="fixture-match">Match (optional)</FieldLabel>
                  <Input
                    id="fixture-match"
                    value={form.match_number}
                    aria-invalid={Boolean(errors.match_number)}
                    placeholder="Match 1"
                    onChange={(event) => {
                      setForm({ ...form, match_number: event.target.value });
                      setErrors((current) => ({ ...current, match_number: undefined }));
                    }}
                  />
                  <FieldError>{errors.match_number}</FieldError>
                </Field>
              )}
              {usesLevel ? (
                <Field data-invalid={Boolean(errors.round)}>
                  <FieldLabel htmlFor="fixture-level">Level</FieldLabel>
                  <NativeSelect
                    id="fixture-level"
                    className="w-full"
                    value={form.round}
                    aria-invalid={Boolean(errors.round)}
                    onChange={(event) => {
                      setForm({ ...form, round: event.target.value });
                      setErrors((current) => ({ ...current, round: undefined }));
                    }}
                  >
                    <NativeSelectOption value="" disabled>
                      Select level
                    </NativeSelectOption>
                    {levelOptions.map((level) => (
                      <NativeSelectOption key={level} value={level}>
                        {level}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError>{errors.round}</FieldError>
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="fixture-round">Round (optional)</FieldLabel>
                  <Input
                    id="fixture-round"
                    value={form.round}
                    onChange={(event) => setForm({ ...form, round: event.target.value })}
                  />
                  <FieldError>{errors.round}</FieldError>
                </Field>
              )}
              {usesTeams && (
                <>
                  <LookupField
                    id="home-team"
                    label="Home team"
                    value={form.home_team_id}
                    options={teams.filter((team) => team.sport_id === form.sport_id)}
                    onChange={(value) => {
                      setForm({ ...form, home_team_id: value, home_player_ids: [] });
                      setErrors((current) => ({
                        ...current,
                        home_team_id: undefined,
                        home_player_ids: undefined,
                      }));
                    }}
                    error={errors.home_team_id}
                  />
                  <LookupField
                    id="away-team"
                    label="Away team"
                    value={form.away_team_id}
                    options={teams.filter((team) => team.sport_id === form.sport_id)}
                    onChange={(value) => {
                      setForm({ ...form, away_team_id: value, away_player_ids: [] });
                      setErrors((current) => ({
                        ...current,
                        away_team_id: undefined,
                        away_player_ids: undefined,
                      }));
                    }}
                    error={errors.away_team_id}
                  />
                </>
              )}
              {usesBadmintonPlayers && (
                <>
                  <PlayerPicker
                    label="First team players"
                    players={homeRoster}
                    selectedIds={form.home_player_ids}
                    error={errors.home_player_ids}
                    onChange={(homePlayerIds) => {
                      setForm({ ...form, home_player_ids: homePlayerIds });
                      setErrors((current) => ({ ...current, home_player_ids: undefined }));
                    }}
                  />
                  <PlayerPicker
                    label="Second team players"
                    players={awayRoster}
                    selectedIds={form.away_player_ids}
                    error={errors.away_player_ids}
                    onChange={(awayPlayerIds) => {
                      setForm({ ...form, away_player_ids: awayPlayerIds });
                      setErrors((current) => ({ ...current, away_player_ids: undefined }));
                    }}
                  />
                </>
              )}
              <Field data-invalid={Boolean(errors.start_at)}>
                <FieldLabel htmlFor="fixture-start">Start time</FieldLabel>
                <Input
                  id="fixture-start"
                  type="datetime-local"
                  value={form.start_at}
                  aria-invalid={Boolean(errors.start_at)}
                  onChange={(event) => {
                    setForm({ ...form, start_at: event.target.value });
                    setErrors((current) => ({ ...current, start_at: undefined }));
                  }}
                />
                <FieldError>{errors.start_at}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.end_at)}>
                <FieldLabel htmlFor="fixture-end">End time</FieldLabel>
                <Input
                  id="fixture-end"
                  type="datetime-local"
                  value={form.end_at}
                  aria-invalid={Boolean(errors.end_at)}
                  onChange={(event) => {
                    setForm({ ...form, end_at: event.target.value });
                    setErrors((current) => ({ ...current, end_at: undefined }));
                  }}
                />
                <FieldError>{errors.end_at}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.venue_id)}>
                <FieldLabel htmlFor="fixture-venue">Venue</FieldLabel>
                <NativeSelect
                  id="fixture-venue"
                  className="w-full"
                  value={form.venue_id ?? ""}
                  aria-invalid={Boolean(errors.venue_id)}
                  onChange={(event) => {
                    setForm({ ...form, venue_id: event.target.value ? Number(event.target.value) : null });
                    setErrors((current) => ({ ...current, venue_id: undefined }));
                  }}
                >
                  <NativeSelectOption value="" disabled>
                    Select venue
                  </NativeSelectOption>
                  {venues.map((item) => (
                    <NativeSelectOption key={item.id} value={item.id}>
                      {item.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError>{errors.venue_id}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !hasRequiredLookups}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create fixture"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(nextOpen) => !nextOpen && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fixture?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the fixture
              {deleting?.match_number ? ` ${deleting.match_number}` : ""} and its linked teams, players, and result.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={saving} onClick={deleteFixture}>
              {saving ? "Deleting..." : "Delete fixture"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PlayerPicker({
  label,
  players,
  selectedIds,
  onChange,
  error,
}: {
  label: string;
  players: PlayerRecord[];
  selectedIds: number[];
  onChange: (playerIds: number[]) => void;
  error?: string;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel>{label} (choose 2)</FieldLabel>
      <div className="grid min-h-24 gap-2 rounded-md border p-3">
        {players.length > 0 ? (
          players.map((player) => {
            const checked = selectedIds.includes(player.id);
            const checkboxId = `fixture-${label.replaceAll(" ", "-").toLowerCase()}-${player.id}`;
            return (
              <label key={player.id} htmlFor={checkboxId} className="flex items-center gap-3 text-sm">
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  disabled={!checked && selectedIds.length >= 2}
                  onCheckedChange={(nextChecked) =>
                    onChange(
                      nextChecked
                        ? [...selectedIds, player.id]
                        : selectedIds.filter((playerId) => playerId !== player.id),
                    )
                  }
                />
                <span>{player.name}</span>
                <span className="ml-auto text-muted-foreground">{player.school_name}</span>
              </label>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Choose a team with registered players.</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{selectedIds.length} of 2 selected</p>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function LookupField({
  id,
  label,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number;
  options: Lookup[];
  onChange: (value: number) => void;
  error?: string;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`fixture-${id}`}>{label}</FieldLabel>
      <NativeSelect
        id={`fixture-${id}`}
        className="w-full"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {Boolean(options.length) && !value && (
          <NativeSelectOption value={0} disabled>
            Select {label.toLowerCase()}
          </NativeSelectOption>
        )}
        {!options.length && (
          <NativeSelectOption value={0} disabled>
            No {label.toLowerCase()} records available
          </NativeSelectOption>
        )}
        {options.map((item) => (
          <NativeSelectOption key={item.id} value={item.id}>
            {item.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
