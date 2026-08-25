import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { sports } from "@/lib/fixture-data";

const sportStyles = [
  { accent: "bg-blue-600", soft: "bg-blue-50 text-blue-700", number: "text-blue-100" },
  { accent: "bg-red-500", soft: "bg-red-50 text-red-700", number: "text-red-100" },
  { accent: "bg-sky-600", soft: "bg-sky-50 text-sky-700", number: "text-sky-100" },
  { accent: "bg-amber-400", soft: "bg-amber-50 text-amber-800", number: "text-amber-100" },
  { accent: "bg-lime-500", soft: "bg-lime-50 text-lime-800", number: "text-lime-100" },
] as const;

export function FixturesOverview() {
  const totalEntries = sports.reduce((total, sport) => total + sport.fixtures.length, 0);

  return (
    <div className="min-h-[75vh] bg-slate-100">
      <section className="relative overflow-hidden bg-sky-950 text-white">
        <div className="absolute -top-24 right-0 size-80 rounded-full border-[48px] border-sky-800/50" aria-hidden="true" />
        <div className="absolute right-72 -bottom-36 size-64 rounded-full border-[38px] border-amber-400/20" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <Badge className="h-7 border-0 bg-amber-400 px-3 font-black text-slate-950 uppercase tracking-[0.14em] hover:bg-amber-400">Tournament schedule</Badge>
            <h1 className="mt-6 font-serif font-bold text-5xl leading-none tracking-tight sm:text-6xl lg:text-7xl">Fixtures</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100">Every match, race, and event in one place. Choose a sport and follow the complete competition schedule.</p>
          </div>
          <div className="grid grid-cols-2 overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
            <div className="min-w-32 border-white/20 border-r p-5"><span className="block font-serif font-bold text-4xl">{sports.length}</span><span className="mt-1 block text-sky-200 text-xs uppercase tracking-[0.14em]">Sports</span></div>
            <div className="min-w-32 p-5"><span className="block font-serif font-bold text-4xl">{totalEntries}</span><span className="mt-1 block text-sky-200 text-xs uppercase tracking-[0.14em]">Events</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-bold text-sky-700 text-xs uppercase tracking-[0.18em]">Select a competition</p><h2 className="mt-2 font-serif font-bold text-3xl text-sky-950 sm:text-4xl">Explore by sport</h2></div>
          <p className="max-w-md text-slate-600 text-sm leading-6 sm:text-right">Schedules include match times, divisions, teams, and venue information.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sports.map((sport, index) => {
            const style = sportStyles[index % sportStyles.length];
            return (
              <Card key={sport.slug} className="group relative gap-0 overflow-hidden rounded-none bg-white py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`h-2 ${style.accent}`} />
                <CardHeader className="relative min-h-44 px-6 pt-6 pb-5">
                  <span className={`absolute top-1 right-5 font-serif font-black text-8xl leading-none ${style.number}`} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className={`relative grid size-11 place-items-center rounded-full ${style.soft}`}><Trophy className="size-5" aria-hidden="true" /></div>
                  <CardTitle className="relative mt-5 font-serif font-bold text-2xl text-sky-950">{sport.name}</CardTitle>
                  <p className="relative mt-2 max-w-sm text-slate-600 text-sm leading-6">{sport.description}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 border-slate-200 border-t px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600"><CalendarDays className="size-4 text-sky-700" aria-hidden="true" /><span className="font-semibold text-sm">{sport.fixtures.length} entries</span></div>
                  <div className="flex items-center justify-end gap-2 text-slate-600"><MapPin className="size-4 text-sky-700" aria-hidden="true" /><span className="truncate text-sm">{sport.venueLabel}</span></div>
                </CardContent>
                <CardFooter className="border-0 bg-sky-950 p-0">
                  <Button asChild className="h-12 w-full justify-between rounded-none bg-transparent px-6 font-bold text-white uppercase tracking-[0.12em] hover:bg-sky-900">
                    <Link href={`/${sport.slug}`}>View full schedule <ArrowUpRight className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
