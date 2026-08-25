"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { SportStaff } from "../_lib/sport-staff";

export function TeachersBySport({ sports }: { sports: SportStaff[] }) {
  if (sports.length === 0) return <p className="mt-10 text-slate-600">No coaches or commissioners are available.</p>;

  return <Tabs defaultValue={String(sports[0].id)} className="mt-10">
    <div className="overflow-x-auto pb-1"><TabsList className="h-auto min-w-max rounded-none bg-white p-1 shadow-sm">{sports.map((sport) => <TabsTrigger key={sport.id} value={String(sport.id)} className="rounded-none px-5 py-3 font-bold data-active:bg-sky-700 data-active:text-white">{sport.name}</TabsTrigger>)}</TabsList></div>
    {sports.map((sport) => <TabsContent key={sport.id} value={String(sport.id)} className="mt-6 space-y-8">
      {sport.coaches.length > 0 && <section><div className="overflow-hidden border border-slate-300 bg-white"><Table><TableHeader><TableRow><TableHead>Match Commissioner</TableHead><TableHead>Name</TableHead></TableRow></TableHeader><TableBody>{sport.coaches.map((coach) => <TableRow key={coach.id}><TableCell className="font-medium">{coach.role ?? "Coach"}</TableCell><TableCell>{coach.name}</TableCell></TableRow>)}</TableBody></Table></div></section>}
      {sport.commissioners.length > 0 && <section><h2 className="mb-4 font-serif font-bold text-2xl text-sky-950">Commissioners & Committees</h2><div className="overflow-hidden border border-slate-300 bg-white"><Table><TableHeader><TableRow><TableHead>Match Commissioner</TableHead><TableHead>Name</TableHead></TableRow></TableHeader><TableBody>{sport.commissioners.map((person) => <TableRow key={person.id}><TableCell className="font-medium">{person.role ?? "Commissioner"}</TableCell><TableCell>{person.name}</TableCell></TableRow>)}</TableBody></Table></div></section>}
    </TabsContent>)}
  </Tabs>;
}
