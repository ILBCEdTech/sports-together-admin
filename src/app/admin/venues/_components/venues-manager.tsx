"use client";

import { type FormEvent, useEffect, useState } from "react";

import { MapPin, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import type { VenueRecord, VenueType } from "@/lib/admin-records";
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
import { type AdminListMeta, type AdminListPayload, normalizeAdminListPayload } from "@/lib/admin-list";
import { AdminFilterBar, AdminListPagination } from "@/components/admin/admin-list-controls";
import { useAdminListQuery } from "@/hooks/use-admin-list-query";

const venueTypes: VenueType[] = ["FIELD", "COURT", "POOL", "HALL", "OTHER"];
const venueSchema = z.object({
  name: z.string().trim().min(2, "Enter a venue name.").max(100, "Use 100 characters or fewer."),
  type: z.enum(venueTypes),
  location: z.string().trim().max(160, "Use 160 characters or fewer."),
});
type VenueForm = z.infer<typeof venueSchema>;
const emptyForm: VenueForm = { name: "", type: "FIELD", location: "" };

export function VenuesManager() {
  const listQuery = useAdminListQuery();
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [meta, setMeta] = useState<AdminListMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VenueRecord | null>(null);
  const [form, setForm] = useState<VenueForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof VenueForm, string>>>({});

  useEffect(() => {
    setLoading(true);
    adminApi<AdminListPayload<VenueRecord>>(`venues?${listQuery.requestQuery}`)
      .then((payload) => {
        const response = normalizeAdminListPayload(payload);
        setVenues(response.data);
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

  function startEdit(venue: VenueRecord) {
    setEditing(venue);
    setForm({ name: venue.name, type: venue.type, location: venue.location ?? "" });
    setErrors({});
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = venueSchema.safeParse(form);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      setErrors({ name: fields.name?.[0], type: fields.type?.[0], location: fields.location?.[0] });
      return;
    }
    const values = { ...result.data, location: result.data.location || null };
    setSaving(true);
    try {
      const saved = await adminApi<VenueRecord>(editing ? `venues/${editing.id}` : "venues", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(values),
      });
      setVenues((current) =>
        editing ? current.map((venue) => (venue.id === saved.id ? saved : venue)) : [...current, saved],
      );
      toast.success(`${result.data.name} ${editing ? "updated" : "created"}`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Venue could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Venues</h1>
          <p className="mt-1 text-muted-foreground">Manage fields, courts, pools, halls, and other locations.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus data-icon="inline-start" />
          New venue
        </Button>
      </div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Venue records</CardTitle>
          <AdminFilterBar
            search={listQuery.search}
            searchPlaceholder="Search venue name or location"
            onSearchChange={listQuery.setSearch}
            values={listQuery.values}
            onFilterChange={listQuery.setFilter}
            onClear={listQuery.clearFilters}
            hasFilters={listQuery.hasFilters}
          />
        </CardHeader>
        <CardContent className="px-0">
          {loading || listQuery.isPending ? (
            <p className="p-6 text-sm text-muted-foreground">Loading venues...</p>
          ) : venues.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 pl-4">Sr.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue, index) => (
                  <TableRow key={venue.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">
                      {(meta.page - 1) * meta.pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{venue.type.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{venue.location ?? "Not specified"}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => startEdit(venue)}
                        aria-label={`Edit ${venue.name}`}
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
                  <MapPin />
                </EmptyMedia>
                <EmptyTitle>{listQuery.hasFilters ? "No venues match this search" : "No venues yet"}</EmptyTitle>
                <EmptyDescription>
                  {listQuery.hasFilters ? "Clear the search to see all venues." : "Create a venue before assigning it to fixtures."}
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
              <DialogTitle>{editing ? "Edit venue" : "Create venue"}</DialogTitle>
              <DialogDescription>Venue fields match the backend Venue model.</DialogDescription>
            </DialogHeader>
            <FieldGroup className="my-5">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="venue-name">Name</FieldLabel>
                <Input
                  id="venue-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  aria-invalid={Boolean(errors.name)}
                  autoFocus
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.type)}>
                <FieldLabel htmlFor="venue-type">Type</FieldLabel>
                <NativeSelect
                  id="venue-type"
                  className="w-full"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as VenueType })}
                >
                  {venueTypes.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError>{errors.type}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.location)}>
                <FieldLabel htmlFor="venue-location">
                  Location <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="venue-location"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="Building or campus area"
                  aria-invalid={Boolean(errors.location)}
                />
                <FieldError>{errors.location}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create venue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
