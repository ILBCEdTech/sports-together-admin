"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { adminApi } from "@/lib/admin-api.client";
import { type AdminListMeta, type AdminListPayload, normalizeAdminListPayload } from "@/lib/admin-list";
import type { PlayerRecord } from "@/lib/admin-records";
import { AdminFilterBar, AdminListPagination } from "@/components/admin/admin-list-controls";
import { useAdminListQuery } from "@/hooks/use-admin-list-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PlayerForm = {
  name: string;
  school_name: string;
};

const playerSchema = z.object({
  name: z.string().trim().min(2, "Enter the player's name.").max(100, "Use 100 characters or fewer."),
  school_name: z.string().trim().max(150, "Use 150 characters or fewer."),
});
const emptyForm: PlayerForm = { name: "", school_name: "" };

export function PlayersManager() {
  const listQuery = useAdminListQuery();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [sports, setSports] = useState<Array<{ id: number; name: string }>>([]);
  const [teams, setTeams] = useState<Array<{ id: number; name: string }>>([]);
  const [meta, setMeta] = useState<AdminListMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlayerRecord | null>(null);
  const [form, setForm] = useState<PlayerForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PlayerForm, string>>>({});

  useEffect(() => {
    Promise.all([adminApi<Array<{ id: number; name: string }>>("sports"), adminApi<Array<{ id: number; name: string }>>("teams")])
      .then(([sportRows, teamRows]) => {
        setSports(sportRows);
        setTeams(teamRows);
      })
      .catch((error: Error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi<AdminListPayload<PlayerRecord>>(`players?${listQuery.requestQuery}`)
      .then((payload) => {
        const response = normalizeAdminListPayload(payload);
        setPlayers(response.data);
        setMeta(response.meta);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [listQuery.requestQuery]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  }

  function startEdit(player: PlayerRecord) {
    setEditing(player);
    setForm({
      name: player.name,
      school_name: player.school_name,
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = playerSchema.safeParse(form);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({
        name: fields.name?.[0],
        school_name: fields.school_name?.[0],
      });
      return;
    }

    setSaving(true);
    try {
      const saved = await adminApi<PlayerRecord>(editing ? `players/${editing.id}` : "players", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(result.data),
      });
      setPlayers((current) =>
        editing ? current.map((player) => (player.id === saved.id ? saved : player)) : [...current, saved],
      );
      toast.success(`${saved.name} ${editing ? "updated" : "created"}`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Player could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Players</h1>
          <p className="mt-1 text-muted-foreground">Create and update registered players.</p>
        </div>
        <Button onClick={startCreate} disabled={loading}>
          <Plus />
          New player
        </Button>
      </div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Player records</CardTitle>
          <AdminFilterBar
            search={listQuery.search}
            searchPlaceholder="Search name or registration number"
            onSearchChange={listQuery.setSearch}
            values={listQuery.values}
            onFilterChange={listQuery.setFilter}
            onClear={listQuery.clearFilters}
            hasFilters={listQuery.hasFilters}
            fields={[
              { key: "sportId", label: "Sports", options: sports.map((item) => ({ label: item.name, value: String(item.id) })) },
              { key: "teamId", label: "Teams", options: teams.map((item) => ({ label: item.name, value: String(item.id) })) },
              { key: "gender", label: "Genders", options: [{ label: "Male", value: "MALE" }, { label: "Female", value: "FEMALE" }] },
            ]}
          />
        </CardHeader>
        <CardContent className="px-0">
          {loading || listQuery.isPending ? (
            <p className="p-6 text-sm text-muted-foreground">Loading players...</p>
          ) : players.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-4">Sr.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">
                      {(meta.page - 1) * meta.pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.school_name || "—"}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => startEdit(player)}
                        aria-label={`Edit ${player.name}`}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Pencil />
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
                  <UserRound />
                </EmptyMedia>
                <EmptyTitle>{listQuery.hasFilters ? "No players match these filters" : "No players yet"}</EmptyTitle>
                <EmptyDescription>
                  {listQuery.hasFilters ? "Clear or adjust the filters to see more records." : "Create the first database player."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <AdminListPagination meta={meta} onPageChange={listQuery.setPage} />
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit player" : "Create player"}</DialogTitle>
              <DialogDescription>Enter the player name and an optional school name.</DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-5 grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2" data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="player-name">Name</FieldLabel>
                <Input
                  id="player-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  aria-invalid={Boolean(errors.name)}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field className="sm:col-span-2" data-invalid={Boolean(errors.school_name)}>
                <FieldLabel htmlFor="player-school">School name (optional)</FieldLabel>
                <Input
                  id="player-school"
                  value={form.school_name}
                  onChange={(event) => setForm({ ...form, school_name: event.target.value })}
                  aria-invalid={Boolean(errors.school_name)}
                />
                <FieldError>{errors.school_name}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create player"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
