"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Pencil, Plus, Search, Trophy } from "lucide-react";
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
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/admin-api.client";

type SportRecord = {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SportFormValues = {
  name: string;
  code: string;
  is_active: boolean;
};

type FormErrors = Partial<Record<keyof SportFormValues, string>>;

const sportSchema = z.object({
  name: z.string().trim().min(2, "Enter a sport name.").max(80, "Use 80 characters or fewer."),
  code: z
    .string()
    .trim()
    .min(2, "Enter a sport code.")
    .max(12, "Use 12 characters or fewer.")
    .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, hyphens, or underscores."),
  is_active: z.boolean(),
});

const emptyForm: SportFormValues = { name: "", code: "", is_active: true };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function SportsManager() {
  const [sports, setSports] = useState<SportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportRecord | null>(null);
  const [formValues, setFormValues] = useState<SportFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    adminApi<SportRecord[]>("sports")
      .then(setSports)
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredSports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sports;
    return sports.filter(
      (sport) =>
        sport.name.toLowerCase().includes(normalizedQuery) || sport.code.toLowerCase().includes(normalizedQuery),
    );
  }, [query, sports]);

  const activeCount = sports.filter((sport) => sport.is_active).length;

  function openCreateDialog() {
    setEditingSport(null);
    setFormValues(emptyForm);
    setErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(sport: SportRecord) {
    setEditingSport(sport);
    setFormValues({ name: sport.name, code: sport.code, is_active: sport.is_active });
    setErrors({});
    setDialogOpen(true);
  }

  function updateField<Key extends keyof SportFormValues>(key: Key, value: SportFormValues[Key]) {
    setFormValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedValues = {
      ...formValues,
      name: formValues.name.trim(),
      code: formValues.code.trim().toUpperCase(),
    };
    const result = sportSchema.safeParse(normalizedValues);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        code: fieldErrors.code?.[0],
        is_active: fieldErrors.is_active?.[0],
      });
      return;
    }

    const duplicateCode = sports.some(
      (sport) => sport.code.toUpperCase() === result.data.code && sport.id !== editingSport?.id,
    );
    if (duplicateCode) {
      setErrors({ code: "This sport code is already in use." });
      return;
    }

    setSaving(true);
    try {
      const saved = await adminApi<SportRecord>(editingSport ? `sports/${editingSport.id}` : "sports", {
        method: editingSport ? "PATCH" : "POST",
        body: JSON.stringify(result.data),
      });
      setSports((current) =>
        editingSport ? current.map((sport) => (sport.id === saved.id ? saved : sport)) : [...current, saved],
      );
      toast.success(`${result.data.name} ${editingSport ? "updated" : "created"}`);
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sport could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Sports</h1>
          <p className="mt-1 text-muted-foreground">Create and maintain the sports available to tournaments.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus data-icon="inline-start" />
          New sport
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Total sports</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{sports.length}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{activeCount}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Inactive</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{sports.length - activeCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Sport records</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Codes must be unique across all records.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or code"
                aria-label="Search sports"
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading sports...</p>
          ) : filteredSports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-4">Sr.</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last updated</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSports.map((sport, index) => (
                  <TableRow key={sport.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">{index + 1}</TableCell>
                    <TableCell className="font-medium">{sport.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{sport.code}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sport.is_active ? "secondary" : "outline"}>
                        {sport.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(sport.updated_at)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(sport)}
                        aria-label={`Edit ${sport.name}`}
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
                  <Trophy />
                </EmptyMedia>
                <EmptyTitle>No sports found</EmptyTitle>
                <EmptyDescription>Try a different search or create a new sport record.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>{editingSport ? "Edit sport" : "Create sport"}</DialogTitle>
              <DialogDescription>
                {editingSport
                  ? "Update this sport record."
                  : "Add a sport that can be assigned to teams and tournaments."}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="my-5">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="sport-name">Name</FieldLabel>
                <Input
                  id="sport-name"
                  value={formValues.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Football"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.name)}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.code)}>
                <FieldLabel htmlFor="sport-code">Code</FieldLabel>
                <Input
                  id="sport-code"
                  value={formValues.code}
                  onChange={(event) => updateField("code", event.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="e.g. FB"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.code)}
                  className="font-mono uppercase"
                />
                <FieldDescription>A short, unique identifier used by the backend.</FieldDescription>
                <FieldError>{errors.code}</FieldError>
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="sport-active">Active</FieldLabel>
                  <FieldDescription>Inactive sports remain available as historical records.</FieldDescription>
                </FieldContent>
                <Switch
                  id="sport-active"
                  checked={formValues.is_active}
                  onCheckedChange={(checked) => updateField("is_active", checked)}
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingSport ? "Save changes" : "Create sport"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
