"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/lib/admin-api.client";
import { type AdminListMeta, type AdminListPayload, normalizeAdminListPayload } from "@/lib/admin-list";
import type { PlayerRecord, TeamPlayerRecord, TeamRecord } from "@/lib/admin-records";
import { AdminFilterBar, AdminListPagination } from "@/components/admin/admin-list-controls";
import { useAdminListQuery } from "@/hooks/use-admin-list-query";

type SportLookup = { id: number; name: string; code: string; is_active: boolean };
type TeamForm = { name: string; sport_id: number; player_ids: number[] };

const teamColors = [
  "bg-[#0070C0] text-white",
  "bg-[#92D050] text-black",
  "bg-[#FF0000] text-white",
  "bg-[#FFFF00] text-black",
];

const schema = z.object({
  name: z.string().trim().min(2, "Enter a team name.").max(120, "Use 120 characters or fewer."),
  sport_id: z.number().int().positive("Choose a sport."),
});

export function TeamsManager() {
  const listQuery = useAdminListQuery();
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [meta, setMeta] = useState<AdminListMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 1 });
  const [sports, setSports] = useState<SportLookup[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeamRecord | null>(null);
  const activeSportId = listQuery.values.get("sportId") ?? "";
  const [form, setForm] = useState<TeamForm>({ name: "", sport_id: 0, player_ids: [] });
  const [errors, setErrors] = useState<Partial<Record<keyof TeamForm, string>>>({});

  useEffect(() => {
    Promise.all([
      adminApi<SportLookup[]>("sports"),
      adminApi<PlayerRecord[]>("players"),
      adminApi<TeamPlayerRecord[]>("team-players"),
    ])
      .then(([sportRecords, playerRecords, rosterRecords]) => {
        setSports(sportRecords);
        setPlayers(playerRecords);
        setTeamPlayers(rosterRecords);
      })
      .catch((error: Error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi<AdminListPayload<TeamRecord>>(`teams?${listQuery.requestQuery}`)
      .then((payload) => {
        const response = normalizeAdminListPayload(payload);
        setTeams(response.data);
        setMeta(response.meta);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [listQuery.requestQuery]);

  const filteredTeams = teams;

  function startCreate() {
    setEditing(null);
    setForm({
      name: "",
      sport_id: Number(activeSportId) || sports.find((sport) => sport.is_active)?.id || sports[0]?.id || 0,
      player_ids: [],
    });
    setErrors({});
    setOpen(true);
  }

  function startEdit(team: TeamRecord) {
    setEditing(team);
    setForm({
      name: team.name,
      sport_id: team.sport_id,
      player_ids: teamPlayers.filter((item) => item.team_id === team.id).map((item) => item.player_id),
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({ name: fields.name?.[0], sport_id: fields.sport_id?.[0] });
      return;
    }
    setSaving(true);
    try {
      const saved = await adminApi<TeamRecord>(editing ? `teams/${editing.id}` : "teams", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(result.data),
      });
      await syncRoster(saved.id);
      setTeams((current) =>
        editing ? current.map((team) => (team.id === saved.id ? saved : team)) : [...current, saved],
      );
      toast.success(`${saved.name} ${editing ? "updated" : "created"}`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Team could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function syncRoster(teamId: number) {
    const current = teamPlayers.filter((item) => item.team_id === teamId);
    const currentIds = new Set(current.map((item) => item.player_id));
    const selectedIds = new Set(form.player_ids);
    const removed = current.filter((item) => !selectedIds.has(item.player_id));
    const added = form.player_ids.filter((playerId) => !currentIds.has(playerId));

    await Promise.all([
      ...removed.map((item) => adminApi(`team-players/${teamId}/${item.player_id}`, { method: "DELETE" })),
      ...added.map((player_id) =>
        adminApi("team-players", {
          method: "POST",
          body: JSON.stringify({ team_id: teamId, player_id, jersey_no: null }),
        }),
      ),
    ]);

    setTeamPlayers((records) => [
      ...records.filter((item) => item.team_id !== teamId),
      ...form.player_ids.map((player_id) => ({ team_id: teamId, player_id, jersey_no: null })),
    ]);
  }

  async function removeTeam() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminApi<unknown>(`teams/${pendingDelete.id}`, { method: "DELETE" });
      setTeams((current) => current.filter((team) => team.id !== pendingDelete.id));
      toast.success(`${pendingDelete.name} deleted`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Team could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Teams</h1>
          <p className="mt-1 text-muted-foreground">Create and manage teams for each sport.</p>
        </div>
        <Button onClick={startCreate} disabled={loading || sports.length === 0}>
          <Plus /> New team
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 border-b">
          <CardTitle>Team records</CardTitle>
          <AdminFilterBar
            search={listQuery.search}
            searchPlaceholder="Search team name or code"
            onSearchChange={listQuery.setSearch}
            values={listQuery.values}
            onFilterChange={listQuery.setFilter}
            onClear={listQuery.clearFilters}
            hasFilters={listQuery.hasFilters}
          />
          {sports.length > 0 && (
            <Tabs
              value={activeSportId}
              onValueChange={(value) => listQuery.setFilter("sportId", value)}
            >
              <TabsList variant="line" className="max-w-full justify-start overflow-x-auto">
                {sports.map((sport) => (
                  <TabsTrigger key={sport.id} value={String(sport.id)}>
                    {sport.name}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {teams.filter((team) => team.sport_id === sport.id).length}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </CardHeader>
        <CardContent className="px-0">
          {loading || listQuery.isPending ? (
            <p className="p-6 text-sm text-muted-foreground">Loading teams...</p>
          ) : filteredTeams.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {filteredTeams.map((team, index) => (
                    <TableHead
                      key={team.id}
                      className={`min-w-56 border-r p-0 last:border-r-0 ${teamColors[index % 4]}`}
                    >
                      <div className="flex min-h-14 items-center justify-between gap-2 px-3">
                        <div className="min-w-0">
                          <span className="block text-[10px] font-medium opacity-70">
                            Sr. {(meta.page - 1) * meta.pageSize + index + 1}
                          </span>
                          <span className="block truncate font-semibold">{team.name}</span>
                          <span className="block truncate text-xs opacity-80">
                            {sports.find((sport) => sport.id === team.sport_id)?.name ?? "Unknown sport"}
                          </span>
                        </div>
                        <span className="flex shrink-0 flex-col items-end">
                          <span className="text-[10px] font-medium opacity-80">Actions</span>
                          <span className="flex">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => startEdit(team)}
                              aria-label={`Edit ${team.name}`}
                              className="bg-background/90 text-green-600 hover:bg-background hover:text-green-700"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => setPendingDelete(team)}
                              aria-label={`Delete ${team.name}`}
                              className="hover:bg-black/10 hover:text-inherit"
                            >
                              <Trash2 />
                            </Button>
                          </span>
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({
                  length: Math.max(
                    1,
                    ...filteredTeams.map((team) => teamPlayers.filter((item) => item.team_id === team.id).length),
                  ),
                }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {filteredTeams.map((team) => {
                      const playerLink = teamPlayers.filter((item) => item.team_id === team.id)[rowIndex];
                      const player = players.find((item) => item.id === playerLink?.player_id);
                      return (
                        <TableCell key={team.id} className="h-11 border-r px-3 last:border-r-0">
                          {player ? (
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">{player.name}</span>
                              <span className="truncate text-xs text-muted-foreground">{player.school_name}</span>
                            </div>
                          ) : rowIndex === 0 ? (
                            <span className="text-muted-foreground">No players</span>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="min-h-56">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersRound />
                </EmptyMedia>
                <EmptyTitle>{listQuery.hasFilters ? "No teams found" : "No teams yet"}</EmptyTitle>
                <EmptyDescription>
                  {listQuery.hasFilters ? "Clear or adjust the filters." : "Create the first team for an active sport."}
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
              <DialogTitle>{editing ? "Edit team" : "Create team"}</DialogTitle>
              <DialogDescription>Set the team, sport, and registered players.</DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-5">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="team-name">Name</FieldLabel>
                <Input
                  id="team-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  aria-invalid={Boolean(errors.name)}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.sport_id)}>
                <FieldLabel htmlFor="team-sport">Sport</FieldLabel>
                <NativeSelect
                  id="team-sport"
                  className="w-full"
                  value={form.sport_id}
                  onChange={(event) => setForm({ ...form, sport_id: Number(event.target.value) })}
                  aria-invalid={Boolean(errors.sport_id)}
                >
                  {sports.map((sport) => (
                    <NativeSelectOption key={sport.id} value={sport.id}>
                      {sport.name}
                      {sport.is_active ? "" : " (inactive)"}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError>{errors.sport_id}</FieldError>
              </Field>
              <Field>
                <FieldLabel>Players</FieldLabel>
                <div className="max-h-64 divide-y overflow-y-auto rounded-lg border">
                  {players.length ? (
                    players.map((player) => {
                      const checked = form.player_ids.includes(player.id);
                      return (
                        <label key={player.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              setForm({
                                ...form,
                                player_ids: value
                                  ? [...form.player_ids, player.id]
                                  : form.player_ids.filter((id) => id !== player.id),
                              })
                            }
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{player.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{player.school_name}</span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground">Create player records before building a roster.</p>
                  )}
                </div>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(nextOpen) => !nextOpen && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the team. The backend may prevent deletion if it is used by fixtures or results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={removeTeam} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
