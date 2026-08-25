"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/lib/admin-api.client";
import { normalizeAdminListPayload, type AdminListPayload } from "@/lib/admin-list";

type Sport = { id: number; name: string; code: string; is_active: boolean };
type Coach = { id: number; sport_id: number; name: string; role: string | null; contact: string | null };
type Commissioner = { id: number; sport_id: number; name: string; role: string | null; contact: string | null };
type StaffKind = "coach" | "commissioner";
type StaffForm = { kind: StaffKind; sportId: number; name: string; role: string; contact: string };

const schema = z.object({
  name: z.string().trim().min(2, "Enter a name."),
  role: z.string().trim().min(2, "Enter a role."),
  sportId: z.number().int().positive("Choose a sport."),
});

const emptyForm: StaffForm = { kind: "coach", sportId: 0, name: "", role: "Coach", contact: "" };

export function SportStaffManager() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [commissioners, setCommissioners] = useState<Commissioner[]>([]);
  const [activeSport, setActiveSport] = useState("");
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ kind: StaffKind; id: number; name: string } | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [sportData, coachData, commissionerData] = await Promise.all([
        adminApi<Sport[]>("sports"),
        adminApi<AdminListPayload<Coach>>("coaches?pageSize=100"),
        adminApi<AdminListPayload<Commissioner>>("commissioners?pageSize=100"),
      ]);
      setSports(sportData.filter((sport) => sport.is_active));
      setCoaches(normalizeAdminListPayload(coachData).data);
      setCommissioners(normalizeAdminListPayload(commissionerData).data);
      setActiveSport((current) => current || String(sportData.find((sport) => sport.is_active)?.id ?? ""));
    } catch (loadError) {
      toast.error(loadError instanceof Error ? loadError.message : "Sport staff could not be loaded.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const sportId = Number(activeSport);
  const sportCoaches = coaches.filter((coach) => coach.sport_id === sportId);
  const sportCommissioners = commissioners.filter((commissioner) => commissioner.sport_id === sportId);

  function startCreate(kind: StaffKind) {
    setEditingId(null);
    setError("");
    setForm({
      ...emptyForm,
      kind,
      sportId,
      role: kind === "coach" ? "Coach" : "Match Commissioner",
    });
    setOpen(true);
  }

  function startEdit(kind: StaffKind, record: Coach | Commissioner) {
    const isCoach = kind === "coach";
    const coach = isCoach ? (record as Coach) : null;
    const commissioner = isCoach ? null : (record as Commissioner);
    setEditingId(record.id);
    setError("");
    setForm({
      kind,
      sportId: commissioner?.sport_id ?? coach?.sport_id ?? sportId,
      name: record.name,
      role: record.role ?? (isCoach ? "Coach" : "Match Commissioner"),
      contact: isCoach ? "" : (record.contact ?? ""),
    });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setSaving(true);
    const resource = form.kind === "coach" ? "coaches" : "commissioners";
    const body = form.kind === "coach"
      ? { sport_id: form.sportId, name: form.name.trim(), role: form.role.trim() }
      : { sport_id: form.sportId, name: form.name.trim(), role: form.role.trim(), contact: form.contact.trim() || null };
    try {
      await adminApi(`${resource}${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      toast.success(`${form.name} ${editingId ? "updated" : "added"}.`);
      setOpen(false);
      await load();
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Staff member could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!pendingDelete) return;
    try {
      await adminApi(`${pendingDelete.kind === "coach" ? "coaches" : "commissioners"}/${pendingDelete.id}`, { method: "DELETE" });
      toast.success(`${pendingDelete.name} removed.`);
      setPendingDelete(null);
      await load();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Staff member could not be removed.");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-semibold text-2xl tracking-tight">Sport Staff</h1><p className="text-muted-foreground text-sm">Manage coaches and commissioners for each sport.</p></div>
        <div className="flex gap-2"><Button onClick={() => startCreate("coach")}><Plus /> Add coach</Button><Button variant="outline" onClick={() => startCreate("commissioner")}><Plus /> Add commissioner</Button></div>
      </div>

      <Tabs value={activeSport} onValueChange={setActiveSport}>
        <div className="overflow-x-auto"><TabsList className="min-w-max">{sports.map((sport) => <TabsTrigger key={sport.id} value={String(sport.id)}>{sport.name}</TabsTrigger>)}</TabsList></div>
        {sports.map((sport) => <TabsContent key={sport.id} value={String(sport.id)} className="grid gap-6 lg:grid-cols-2">
          <StaffCard title="Coaches" description="Sport-wide coaching assignments" empty="No coaches assigned to this sport.">
            {sportCoaches.map((coach) => <StaffRow key={coach.id} role={coach.role ?? "Coach"} name={coach.name} onEdit={() => startEdit("coach", coach)} onDelete={() => setPendingDelete({ kind: "coach", id: coach.id, name: coach.name })} />)}
          </StaffCard>
          <StaffCard title="Commissioners & committees" description="Sport-wide officials and committee members" empty="No commissioners assigned to this sport.">
            {sportCommissioners.map((commissioner) => <StaffRow key={commissioner.id} role={commissioner.role ?? "Commissioner"} name={commissioner.name} onEdit={() => startEdit("commissioner", commissioner)} onDelete={() => setPendingDelete({ kind: "commissioner", id: commissioner.id, name: commissioner.name })} />)}
          </StaffCard>
        </TabsContent>)}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} {form.kind}</DialogTitle><DialogDescription>Assign this person to a sport.</DialogDescription></DialogHeader><form onSubmit={submit}><FieldGroup>
        <Field><FieldLabel htmlFor="staff-sport">Sport</FieldLabel><NativeSelect id="staff-sport" value={form.sportId} onChange={(event) => setForm((current) => ({ ...current, sportId: Number(event.target.value) }))}><NativeSelectOption value={0}>Choose sport</NativeSelectOption>{sports.map((sport) => <NativeSelectOption key={sport.id} value={sport.id}>{sport.name}</NativeSelectOption>)}</NativeSelect></Field>
        <Field><FieldLabel htmlFor="staff-name">Name</FieldLabel><Input id="staff-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field>
        <Field><FieldLabel htmlFor="staff-role">Role</FieldLabel><Input id="staff-role" placeholder="e.g. Jr & Sr Coach or Match Commissioner" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} /></Field>
        {form.kind === "commissioner" && <Field><FieldLabel htmlFor="staff-contact">Contact (optional)</FieldLabel><Input id="staff-contact" value={form.contact} onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))} /></Field>}
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter></form></DialogContent></Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(next) => !next && setPendingDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove staff member?</AlertDialogTitle><AlertDialogDescription>This removes {pendingDelete?.name} from the sport staff list.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function StaffCard({ title, description, empty, children }: { title: string; description: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{hasChildren ? <Table><TableHeader><TableRow><TableHead>Assignment / role</TableHead><TableHead>Name</TableHead><TableHead className="w-24 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{children}</TableBody></Table> : <div className="grid min-h-32 place-items-center text-muted-foreground text-sm"><UserCog className="mb-2 size-7" />{empty}</div>}</CardContent></Card>;
}

function StaffRow({ role, name, onEdit, onDelete }: { role: string; name: string; onEdit: () => void; onDelete: () => void }) {
  return <TableRow><TableCell className="font-medium">{role}</TableCell><TableCell>{name}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${name}`}><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={`Delete ${name}`}><Trash2 /></Button></div></TableCell></TableRow>;
}
