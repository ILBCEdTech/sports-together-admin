"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Medal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { Badge } from "@/components/ui/badge";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api.client";
import { type AdminListMeta, type AdminListPayload, normalizeAdminListPayload } from "@/lib/admin-list";
import type {
  FixtureRecord,
  FixtureTeamRecord,
  PlayerRecord,
  ResultRecord,
  ResultStatus,
  TeamPlayerRecord,
  TeamRecord,
  TournamentRecord,
  VenueRecord,
} from "@/lib/admin-records";
import { AdminFilterBar, AdminListPagination } from "@/components/admin/admin-list-controls";
import { useAdminListQuery } from "@/hooks/use-admin-list-query";

type ResultForm = {
  fixture_id: number;
  winner_team_id: number | null;
  team_a_score: string;
  team_b_score: string;
  status: ResultStatus;
  remark: string;
  name: string[];
  team: string;
  lane: string;
  record: string;
  points: string;
  style: string;
};

type SportLookup = {
  id: number;
  name: string;
};

const statuses = ["PENDING", "FINAL"] as const;
const resultStatusLabel = (status: ResultStatus) => (status === "FINAL" ? "Final" : "Complete");
const fixtureDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});
const swimmingStyles = [
  "Male Freestyle Final",
  "Male Backstroke Final",
  "Male Breaststroke Final",
  "Male Butterfly Final",
  "Female Freestyle Final",
  "Female Backstroke Final",
  "Female Breaststroke Final",
  "Female Butterfly Final",
  "Male Team Medley Relay",
  "Female Team Medley Relay",
] as const;
const schema = z.object({
  fixture_id: z.number().int().positive("Choose a fixture."),
  winner_team_id: z.number().int().positive().nullable(),
  team_a_score: z.string().refine((value) => value === "" || /^\d+$/.test(value), "Enter zero or a positive score."),
  team_b_score: z.string().refine((value) => value === "" || /^\d+$/.test(value), "Enter zero or a positive score."),
  status: z.enum(statuses),
  remark: z.string().trim().max(500, "Use 500 characters or fewer."),
  name: z.array(z.string().trim()),
  team: z.string().trim(),
  lane: z.string(),
  record: z.string().trim(),
  points: z.string(),
  style: z.string().trim(),
});
const swimmingSchema = z.object({
  name: z.array(z.string().trim()).min(1, "Choose at least one swimmer."),
  team: z.string().trim().min(1, "Enter the swimmer's team."),
  lane: z.string().regex(/^\d+$/, "Enter a valid position number."),
  record: z.string().trim().min(1, "Enter the swimmer's record."),
  points: z.string().regex(/^\d+(?:\.\d+)?$/, "Enter zero or a positive number of points."),
  style: z.enum(swimmingStyles, "Choose a swimming style."),
});
const emptyForm: ResultForm = {
  fixture_id: 0,
  winner_team_id: null,
  team_a_score: "",
  team_b_score: "",
  status: "PENDING",
  remark: "",
  name: [],
  team: "",
  lane: "",
  record: "",
  points: "",
  style: "",
};

export function ResultsManager() {
  const listQuery = useAdminListQuery();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [fixtures, setFixtures] = useState<FixtureRecord[]>([]);
  const [fixtureTeams, setFixtureTeams] = useState<FixtureTeamRecord[]>([]);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayerRecord[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [sports, setSports] = useState<SportLookup[]>([]);
  const [tournaments, setTournaments] = useState<TournamentRecord[]>([]);
  const [meta, setMeta] = useState<AdminListMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ResultRecord | null>(null);
  const [deleting, setDeleting] = useState<ResultRecord | null>(null);
  const activeSportId = listQuery.values.get("sportId") ?? "";
  const [form, setForm] = useState<ResultForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ResultForm, string>>>({});

  useEffect(() => {
    Promise.all([
      adminApi<FixtureRecord[]>("fixtures"),
      adminApi<FixtureTeamRecord[]>("fixture-teams"),
      adminApi<TeamRecord[]>("teams"),
      adminApi<PlayerRecord[]>("players"),
      adminApi<TeamPlayerRecord[]>("team-players"),
      adminApi<VenueRecord[]>("venues"),
      adminApi<SportLookup[]>("sports"),
      adminApi<TournamentRecord[]>("tournaments"),
    ])
      .then(
        ([fixtureRows, fixtureTeamRows, teamRows, playerRows, teamPlayerRows, venueRows, sportRows, tournamentRows]) => {
          setFixtures(fixtureRows);
          setFixtureTeams(fixtureTeamRows);
          setTeams(teamRows);
          setPlayers(playerRows);
          setTeamPlayers(teamPlayerRows);
          setVenues(venueRows);
          setSports(sportRows);
          setTournaments(tournamentRows);
        },
      )
      .catch((error: Error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi<AdminListPayload<ResultRecord>>(`results?${listQuery.requestQuery}`)
      .then((payload) => {
        const response = normalizeAdminListPayload(payload);
        setResults(response.data);
        setMeta(response.meta);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [listQuery.requestQuery]);

  const selectableFixtures = useMemo(
    () =>
      fixtures.filter(
        (fixture) =>
          (!activeSportId || fixture.sport_id === Number(activeSportId)) &&
          (editing?.fixture_id === fixture.id || !results.some((row) => row.fixture_id === fixture.id)),
      ),
    [activeSportId, editing, fixtures, results],
  );
  const filteredResults = results;
  const activeSport = sports.find((sport) => sport.id === Number(activeSportId));
  const swimmingSport = sports.find((sport) => sport.name.trim().toLowerCase() === "swimming");
  const showsSwimmingResults =
    activeSport?.id === swimmingSport?.id ||
    (Boolean(swimmingSport) &&
      filteredResults.length > 0 &&
      filteredResults.every(
        (result) => fixtures.find((fixture) => fixture.id === result.fixture_id)?.sport_id === swimmingSport?.id,
      ));
  const selectedTeams = fixtureTeams
    .filter((link) => link.fixture_id === form.fixture_id)
    .sort((left, right) => (left.side === "HOME" ? 0 : 1) - (right.side === "HOME" ? 0 : 1));
  const selectedFixture = fixtures.find((fixture) => fixture.id === form.fixture_id);
  const selectedFixtureSport = sports.find((sport) => sport.id === selectedFixture?.sport_id);
  const selectedTeamRecords = teams.filter((team) => team.sport_id === selectedFixture?.sport_id);
  const selectedTeam = selectedTeamRecords.find((team) => team.name === form.team);
  const selectedTeamPlayerIds = new Set(
    teamPlayers.filter((link) => link.team_id === selectedTeam?.id).map((link) => link.player_id),
  );
  const selectedTeamPlayers = players.filter((player) => selectedTeamPlayerIds.has(player.id));
  const allSwimmersSelected =
    selectedTeamPlayers.length > 0 && selectedTeamPlayers.every((player) => form.name.includes(player.name));
  const selectedFixtureSportName = selectedFixtureSport?.name.trim().toLowerCase();
  const isSwimming = selectedFixtureSportName === "swimming";
  const isFootball = selectedFixtureSportName === "football";
  const isBasketball = selectedFixtureSportName === "basketball";

  function resultWinnerLabel(result: ResultRecord) {
    const winner = teams.find((team) => team.id === result.winner_team_id)?.name;
    if (winner) return winner;

    const fixture = fixtures.find((item) => item.id === result.fixture_id);
    const fixtureSport = sports.find((sport) => sport.id === fixture?.sport_id);
    const isFootballResult = fixtureSport?.name.trim().toLowerCase() === "football";
    const isDraw =
      isFootballResult &&
      result.team_a_score !== null &&
      result.team_a_score === result.team_b_score;

    return isDraw ? "Draw" : "Not declared";
  }

  function fixtureLabel(fixtureId: number) {
    const fixture = fixtures.find((item) => item.id === fixtureId);
    const sportName = sports.find((sport) => sport.id === fixture?.sport_id)?.name ?? "Unknown sport";
    const links = fixtureTeams
      .filter((item) => item.fixture_id === fixtureId)
      .sort((left, right) => (left.side === "HOME" ? 0 : 1) - (right.side === "HOME" ? 0 : 1));
    const names = links.map((link) => teams.find((team) => team.id === link.team_id)?.name).filter(Boolean);
    const label = names.length === 2
      ? `${sportName} · ${names[0]} vs ${names[1]}`
      : `${sportName} · Fixture ${fixtureId}${fixture?.round ? ` · ${fixture.round}` : ""}`;
    const normalizedSportName = sportName.trim().toLowerCase();
    if (normalizedSportName === "basketball" && fixture?.start_at) {
      return `${label} · ${fixtureDateTimeFormatter.format(new Date(fixture.start_at))}`;
    }
    if (normalizedSportName !== "badminton") return label;

    const badmintonFixtures = fixtures.filter((item) => item.sport_id === fixture?.sport_id);
    const fallbackMatchNo = badmintonFixtures.findIndex((item) => item.id === fixtureId) + 1;
    const matchNo =
      fixture?.match_number?.replace(/^match\s*(?:no\.?\s*)?/i, "").trim() || String(fallbackMatchNo);
    const venueName = venues.find((venue) => venue.id === fixture?.venue_id)?.name;
    const explicitCourtNo = venueName?.match(/^court\s*(?:no\.?\s*)?(\d+)$/i)?.[1];
    const simultaneousFixtures = badmintonFixtures
      .filter((item) => item.start_at === fixture?.start_at)
      .sort((left, right) => left.id - right.id);
    const inferredCourtNo = simultaneousFixtures.findIndex((item) => item.id === fixtureId) + 1;
    const courtNo = explicitCourtNo ?? (inferredCourtNo > 0 ? String(inferredCourtNo) : "—");

    return `${label} · Match No. ${matchNo} · Court No. ${courtNo}`;
  }

  function startCreate() {
    const fixtureId = selectableFixtures[0]?.id ?? 0;
    setEditing(null);
    setForm({ ...emptyForm, fixture_id: fixtureId });
    setErrors({});
    setOpen(true);
  }

  function startEdit(result: ResultRecord) {
    setEditing(result);
    setForm({
      fixture_id: result.fixture_id,
      winner_team_id: result.winner_team_id,
      team_a_score: result.team_a_score?.toString() ?? "",
      team_b_score: result.team_b_score?.toString() ?? "",
      status: result.status,
      remark: result.remark ?? "",
      name: result.name?.split(", ").filter(Boolean) ?? [],
      team: result.team ?? "",
      lane: result.lane?.toString() ?? "",
      record: result.record ?? "",
      points: result.points?.toString() ?? "",
      style: result.style ?? "",
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fields).map(([key, messages]) => [key, messages?.[0]])));
      return;
    }
    if (isSwimming) {
      const swimming = swimmingSchema.safeParse(parsed.data);
      if (!swimming.success) {
        const fields = swimming.error.flatten().fieldErrors;
        setErrors(Object.fromEntries(Object.entries(fields).map(([key, messages]) => [key, messages?.[0]])));
        return;
      }
      if (!selectedTeam) {
        setErrors({ team: "Choose a swimming team." });
        return;
      }
      const selectedPlayerNames = new Set(selectedTeamPlayers.map((player) => player.name));
      if (parsed.data.name.some((name) => !selectedPlayerNames.has(name))) {
        setErrors({ name: "Choose swimmers from the selected team." });
        return;
      }
    }
    const participantIds = fixtureTeams
      .filter((link) => link.fixture_id === parsed.data.fixture_id)
      .map((link) => link.team_id);
    if (!isSwimming && parsed.data.winner_team_id && !participantIds.includes(parsed.data.winner_team_id)) {
      setErrors({ winner_team_id: "Choose a team assigned to this fixture." });
      return;
    }
    const values = {
      winner_team_id: isSwimming ? null : parsed.data.winner_team_id,
      team_a_score: isSwimming || parsed.data.team_a_score === "" ? null : Number(parsed.data.team_a_score),
      team_b_score: isSwimming || parsed.data.team_b_score === "" ? null : Number(parsed.data.team_b_score),
      status: parsed.data.status,
      remark: parsed.data.remark || null,
      ...(isSwimming
        ? {
            name: parsed.data.name.join(", "),
            team: parsed.data.team,
            lane: Number(parsed.data.lane),
            record: parsed.data.record,
            points: Number(parsed.data.points),
            style: parsed.data.style,
          }
        : {}),
    };
    setSaving(true);
    try {
      const savedResult = await adminApi<ResultRecord>(editing ? `results/${editing.id}` : "results", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ ...values, fixture_id: parsed.data.fixture_id }),
      });
      setResults((current) => {
        return [...current.filter((item) => item.id !== savedResult.id), savedResult];
      });
      toast.success(`Result ${editing ? "updated" : "created"}`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Result could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResult() {
    if (!deleting) return;
    setSaving(true);
    try {
      await adminApi(`results/${deleting.id}`, { method: "DELETE" });
      setResults((current) => current.filter((item) => item.id !== deleting.id));
      toast.success("Result deleted");
      setDeleting(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Result could not be deleted.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Results</h1>
          <p className="mt-1 text-muted-foreground">Record, finalize, and maintain fixture scores.</p>
        </div>
        <Button onClick={startCreate} disabled={loading}>
          <Plus data-icon="inline-start" />
          New result
        </Button>
      </div>
      <Card>
        <CardHeader className="gap-4 border-b">
          <CardTitle>Result records</CardTitle>
          <AdminFilterBar
            search={listQuery.search}
            searchPlaceholder="Search team or match number"
            onSearchChange={listQuery.setSearch}
            values={listQuery.values}
            onFilterChange={listQuery.setFilter}
            onClear={listQuery.clearFilters}
            hasFilters={listQuery.hasFilters}
            fields={[
              { key: "tournamentId", label: "Tournaments", options: tournaments.map((item) => ({ label: item.name, value: String(item.id) })) },
              { key: "from", label: "From date", type: "date" },
              { key: "to", label: "To date", type: "date" },
              {
                key: "status",
                label: "Statuses",
                options: statuses.map((status) => ({ label: resultStatusLabel(status), value: status })),
              },
              { key: "round", label: "Round", type: "text" },
            ]}
          />
          {sports.length > 0 && (
            <Tabs value={activeSportId} onValueChange={(value) => listQuery.setFilter("sportId", value)} className="mx-auto w-full max-w-3xl">
              <TabsList className="grid h-10 w-full grid-flow-col overflow-hidden">
                {sports.map((sport) => (
                  <TabsTrigger
                    key={sport.id}
                    value={String(sport.id)}
                    className="h-8 min-w-0 px-3 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
                  >
                    {sport.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </CardHeader>
        <CardContent className="px-0">
          {loading || listQuery.isPending ? (
            <p className="p-6 text-sm text-muted-foreground">Loading results...</p>
          ) : filteredResults.length ? (
            <Table>
              <TableHeader className={showsSwimmingResults ? "bg-sky-100" : undefined}>
                <TableRow className={showsSwimmingResults ? "hover:bg-sky-100" : undefined}>
                  <TableHead className="w-14 pl-4">Sr.</TableHead>
                  {showsSwimmingResults ? (
                    <>
                      <TableHead>Name</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Point</TableHead>
                      <TableHead>Style</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Fixture</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead>Status</TableHead>
                    </>
                  )}
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result, index) => (
                  <TableRow key={result.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">
                      {(meta.page - 1) * meta.pageSize + index + 1}
                    </TableCell>
                    {showsSwimmingResults ? (
                      <>
                        <TableCell className="font-medium">{result.name ?? "—"}</TableCell>
                        <TableCell>{result.team ?? "—"}</TableCell>
                        <TableCell className="tabular-nums">{result.lane ?? "—"}</TableCell>
                        <TableCell className="tabular-nums">{result.record ?? "—"}</TableCell>
                        <TableCell className="tabular-nums">{result.points ?? "—"}</TableCell>
                        <TableCell className="font-medium">{result.style ?? "—"}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{fixtureLabel(result.fixture_id)}</TableCell>
                        <TableCell>
                          {result.team_a_score ?? "—"} – {result.team_b_score ?? "—"}
                        </TableCell>
                        <TableCell>{resultWinnerLabel(result)}</TableCell>
                        <TableCell>
                          <Badge variant={result.status === "FINAL" ? "default" : "outline"}>
                            {resultStatusLabel(result.status)}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => startEdit(result)}
                        aria-label={`Edit result ${result.id}`}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setDeleting(result)}
                        aria-label={`Delete result ${result.id}`}
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
                  <Medal />
                </EmptyMedia>
                <EmptyTitle>{listQuery.hasFilters ? "No results match these filters" : "No results for this sport"}</EmptyTitle>
                <EmptyDescription>
                  {listQuery.hasFilters ? "Clear or adjust the filters to see more records." : "Create a result after a fixture in this sport has been played."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <AdminListPagination meta={meta} onPageChange={listQuery.setPage} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit result" : "Create result"}</DialogTitle>
              <DialogDescription>
                Each fixture can have one result record. Select one or more swimmers for a swimming result.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-5 grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2" data-invalid={Boolean(errors.fixture_id)}>
                <FieldLabel id="result-fixture-label">Fixture</FieldLabel>
                <NativeSelect
                  id="result-fixture"
                  className="w-full"
                  aria-labelledby="result-fixture-label"
                  value={form.fixture_id}
                  disabled={Boolean(editing)}
                  onChange={(event) => {
                    const fixtureId = Number(event.target.value);
                    setForm({
                      ...form,
                      fixture_id: fixtureId,
                      winner_team_id: null,
                      team: "",
                      name: [],
                    });
                  }}
                >
                  {!selectableFixtures.length && (
                    <NativeSelectOption value={0}>No unused fixtures available</NativeSelectOption>
                  )}
                  {selectableFixtures.map((fixture) => (
                    <NativeSelectOption key={fixture.id} value={fixture.id}>
                      {fixtureLabel(fixture.id)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {(isFootball || isBasketball) && selectedFixture ? (
                  <div className="grid gap-3 rounded-lg border bg-muted/50 p-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Start time</p>
                      <p className="mt-1 font-medium">
                        {fixtureDateTimeFormatter.format(new Date(selectedFixture.start_at))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End time</p>
                      <p className="mt-1 font-medium">
                        {selectedFixture.end_at
                          ? fixtureDateTimeFormatter.format(new Date(selectedFixture.end_at))
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                ) : null}
                <FieldError>{errors.fixture_id}</FieldError>
              </Field>
              {!editing && !selectableFixtures.length ? (
                <p
                  role="status"
                  className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground sm:col-span-2"
                >
                  This sport has no fixtures awaiting a result. Create a fixture first, or edit an existing result.
                </p>
              ) : null}
              {isSwimming ? (
                <>
                  <Field data-invalid={Boolean(errors.team)}>
                    <FieldLabel htmlFor="swimming-team">Team</FieldLabel>
                    <NativeSelect
                      id="swimming-team"
                      className="w-full"
                      value={form.team}
                      onChange={(event) => setForm({ ...form, team: event.target.value, name: [] })}
                      aria-invalid={Boolean(errors.team)}
                    >
                      <NativeSelectOption value="" disabled>
                        Choose a team
                      </NativeSelectOption>
                      {selectedTeamRecords.map((team) => (
                        <NativeSelectOption key={team.id} value={team.name}>
                          {team.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError>{errors.team}</FieldError>
                  </Field>
                  <Field data-invalid={Boolean(errors.name)}>
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel id="swimming-name-label">Swimmers</FieldLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={!selectedTeamPlayers.length}
                        onClick={() => {
                          const names = allSwimmersSelected
                            ? []
                            : [...new Set(selectedTeamPlayers.map((player) => player.name))];
                          setForm({ ...form, name: names });
                          setErrors((current) => ({ ...current, name: undefined }));
                        }}
                      >
                        {allSwimmersSelected ? "Unselect all" : "Select all"}
                      </Button>
                    </div>
                    <div
                      id="swimming-name"
                      className="max-h-44 space-y-1 overflow-y-auto rounded-lg border p-2"
                      role="group"
                      aria-labelledby="swimming-name-label"
                      aria-invalid={Boolean(errors.name)}
                    >
                      {selectedTeamPlayers.map((player) => {
                        const checked = form.name.includes(player.name);
                        return (
                          <label
                            key={player.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(nextChecked) => {
                                const names = nextChecked
                                  ? [...form.name, player.name]
                                  : form.name.filter((name) => name !== player.name);
                                setForm({ ...form, name: names });
                                setErrors((current) => ({ ...current, name: undefined }));
                              }}
                            />
                            <span>{player.name}</span>
                          </label>
                        );
                      })}
                      {!selectedTeam ? (
                        <p className="px-2 py-3 text-sm text-muted-foreground">Choose a team first.</p>
                      ) : null}
                      {selectedTeam && !selectedTeamPlayers.length ? (
                        <p className="px-2 py-3 text-sm text-muted-foreground">No swimmers found for this team.</p>
                      ) : null}
                    </div>
                    <FieldDescription>Select one or more swimmers from the chosen team.</FieldDescription>
                    <FieldError>{errors.name}</FieldError>
                  </Field>
                  <NumberField
                    id="swimming-lane"
                    label="Position"
                    value={form.lane}
                    error={errors.lane}
                    step={1}
                    onChange={(value) => setForm({ ...form, lane: value })}
                  />
                  <TextField
                    id="swimming-record"
                    label="Record"
                    value={form.record}
                    error={errors.record}
                    placeholder="e.g. 00:58.42"
                    onChange={(value) => setForm({ ...form, record: value })}
                  />
                  <NumberField
                    id="swimming-points"
                    label="Points"
                    value={form.points}
                    error={errors.points}
                    step="any"
                    onChange={(value) => setForm({ ...form, points: value })}
                  />
                  <Field data-invalid={Boolean(errors.style)}>
                    <FieldLabel htmlFor="swimming-style">Style</FieldLabel>
                    <NativeSelect
                      id="swimming-style"
                      className="w-full"
                      value={form.style}
                      onChange={(event) => setForm({ ...form, style: event.target.value })}
                      aria-invalid={Boolean(errors.style)}
                    >
                      <NativeSelectOption value="" disabled>
                        Choose a swimming style
                      </NativeSelectOption>
                      {swimmingStyles.map((style) => (
                        <NativeSelectOption key={style} value={style}>
                          {style}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError>{errors.style}</FieldError>
                  </Field>
                </>
              ) : null}
              {!isSwimming ? (
                <>
                  <ScoreField
                    id="team-a-score"
                    label="Team A score"
                    value={form.team_a_score}
                    error={errors.team_a_score}
                    onChange={(value) => setForm({ ...form, team_a_score: value })}
                  />
                  <ScoreField
                    id="team-b-score"
                    label="Team B score"
                    value={form.team_b_score}
                    error={errors.team_b_score}
                    onChange={(value) => setForm({ ...form, team_b_score: value })}
                  />
                  <Field data-invalid={Boolean(errors.winner_team_id)}>
                    <FieldLabel htmlFor="result-winner">Winner</FieldLabel>
                    <NativeSelect
                      id="result-winner"
                      className="w-full"
                      value={form.winner_team_id ?? ""}
                      onChange={(event) =>
                        setForm({ ...form, winner_team_id: event.target.value ? Number(event.target.value) : null })
                      }
                    >
                      <NativeSelectOption value="">{isFootball ? "Draw" : "Not declared"}</NativeSelectOption>
                      {selectedTeams.map((link) => (
                        <NativeSelectOption key={link.team_id} value={link.team_id}>
                          {teams.find((team) => team.id === link.team_id)?.name ?? `Team ${link.team_id}`}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError>{errors.winner_team_id}</FieldError>
                  </Field>
                </>
              ) : null}
              <Field>
                <FieldLabel htmlFor="result-status">Status</FieldLabel>
                <NativeSelect
                  id="result-status"
                  className="w-full"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as ResultStatus })}
                >
                  {statuses.map((status) => (
                    <NativeSelectOption key={status} value={status}>
                      {resultStatusLabel(status)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field className="sm:col-span-2" data-invalid={Boolean(errors.remark)}>
                <FieldLabel htmlFor="result-remark">
                  Remark <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="result-remark"
                  value={form.remark}
                  onChange={(event) => setForm({ ...form, remark: event.target.value })}
                  aria-invalid={Boolean(errors.remark)}
                />
                <FieldDescription>Use this for tie-breaks, forfeits, or corrections.</FieldDescription>
                <FieldError>{errors.remark}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.fixture_id}
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Create result"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(nextOpen) => !nextOpen && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this result?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the score and publication status for{" "}
              {deleting ? fixtureLabel(deleting.fixture_id) : "this fixture"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={saving} onClick={deleteResult}>
              {saving ? "Deleting..." : "Delete result"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ScoreField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function TextField({
  id,
  label,
  value,
  error,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function NumberField({
  id,
  label,
  value,
  error,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  step: number | "any";
  onChange: (value: string) => void;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        min={0}
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
