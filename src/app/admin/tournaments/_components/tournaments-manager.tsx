"use client";

import { type FormEvent, useEffect, useState } from "react";
import { CalendarRange, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/admin-api.client";
import type { TournamentRecord, TournamentStatus } from "@/lib/admin-records";

const statuses = ["UPCOMING", "ONGOING", "COMPLETED"] as const;
const schema = z
  .object({
    name: z.string().trim().min(2, "Enter a tournament name.").max(120, "Use 120 characters or fewer."),
    start_date: z.string().min(1, "Choose a start date and time."),
    end_date: z.string().min(1, "Choose an end date and time."),
    status: z.enum(statuses),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date and time must be after the start date and time.",
    path: ["end_date"],
  });

type TournamentForm = z.input<typeof schema>;
const emptyForm: TournamentForm = { name: "", start_date: "", end_date: "", status: "UPCOMING" };
const dateInput = (value: string) => {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
const statusLabel = (value: TournamentStatus) => value.charAt(0) + value.slice(1).toLowerCase();

export function TournamentsManager() {
  const [tournaments, setTournaments] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TournamentRecord | null>(null);
  const [form, setForm] = useState<TournamentForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TournamentForm, string>>>({});

  useEffect(() => {
    adminApi<TournamentRecord[]>("tournaments")
      .then(setTournaments)
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  }

  function startEdit(item: TournamentRecord) {
    setEditing(item);
    setForm({
      name: item.name,
      start_date: dateInput(item.start_date),
      end_date: dateInput(item.end_date),
      status: item.status,
    });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({
        name: fields.name?.[0],
        start_date: fields.start_date?.[0],
        end_date: fields.end_date?.[0],
        status: fields.status?.[0],
      });
      return;
    }
    const payload = {
      ...result.data,
      start_date: new Date(result.data.start_date).toISOString(),
      end_date: new Date(result.data.end_date).toISOString(),
    };
    setSaving(true);
    try {
      const saved = await adminApi<TournamentRecord>(editing ? `tournaments/${editing.id}` : "tournaments", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setTournaments((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved],
      );
      toast.success(`${saved.name} ${editing ? "updated" : "created"}`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tournament could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Tournaments</h1>
          <p className="mt-1 text-muted-foreground">Manage event dates and lifecycle status.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus />
          New tournament
        </Button>
      </div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Tournament records</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading tournaments...</p>
          ) : tournaments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Tournament</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-4 font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateLabel(item.start_date)} - {dateLabel(item.end_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "ONGOING" ? "secondary" : "outline"}>
                        {statusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.name}`}
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
                  <CalendarRange />
                </EmptyMedia>
                <EmptyTitle>No tournaments yet</EmptyTitle>
                <EmptyDescription>Create a tournament before scheduling fixtures.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit tournament" : "Create tournament"}</DialogTitle>
              <DialogDescription>Dates and status are stored in the backend Tournament record.</DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-5">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="tournament-name">Name</FieldLabel>
                <Input
                  id="tournament-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.start_date)}>
                  <FieldLabel htmlFor="tournament-start">Start date and time</FieldLabel>
                  <Input
                    id="tournament-start"
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                  />
                  <FieldError>{errors.start_date}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.end_date)}>
                  <FieldLabel htmlFor="tournament-end">End date and time</FieldLabel>
                  <Input
                    id="tournament-end"
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                  />
                  <FieldError>{errors.end_date}</FieldError>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="tournament-status">Status</FieldLabel>
                <NativeSelect
                  id="tournament-status"
                  className="w-full"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as TournamentStatus })}
                >
                  {statuses.map((item) => (
                    <NativeSelectOption key={item} value={item}>
                      {statusLabel(item)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create tournament"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
