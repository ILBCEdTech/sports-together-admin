import { Fragment } from "react";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Fixture, SportFixture } from "@/lib/fixture-data";
import { fixtureFallbacks } from "@/lib/fixture-fallback-data";
import { getPublicSportEventDetails } from "@/lib/public-sport-event-details";
import { getPublicSportSchedule } from "@/lib/public-sport-schedule";
import { getPublicSportStaff } from "@/lib/public-sport-staff";
import { getTeamColorClass } from "@/lib/team-colors";

function FixturePlayers({ players }: { players?: string[] }) {
  if (!players?.length) return null;

  return (
    <div className="mt-2 min-w-0 border-current/25 border-t pt-2">
      <p className="font-bold text-[0.65rem] uppercase tracking-wider opacity-70">Players</p>
      <ul className="mt-1 grid min-w-0 gap-1 font-medium text-xs leading-4">
        {players.map((player, index) => (
          <li key={`${player}-${index}`} className="min-w-0 whitespace-normal break-words">
            {player}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventSchedule({
  fixtures,
  lunchTime,
  renumberMatches = false,
  groupBySession = false,
  showFixturePlayers = false,
}: {
  fixtures: Fixture[];
  lunchTime?: string;
  renumberMatches?: boolean;
  groupBySession?: boolean;
  showFixturePlayers?: boolean;
}) {
  const schedules = new Map<string, { venue: string; division: string | null; fixtures: Fixture[] }>();
  for (const fixture of fixtures) {
    const venue = fixture.venue || "Event venue";
    const startHour = fixture.startAt
      ? Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Yangon" }).format(new Date(fixture.startAt)))
      : (() => {
          const startTime = fixture.time.split("-")[0];
          const hour = Number(startTime.match(/^\d+/)?.[0] ?? 0);
          return startTime.includes("PM") && hour !== 12 ? hour + 12 : hour;
        })();
    const division = groupBySession
      ? (startHour >= 13 ? "Afternoon Session" : "Morning Session")
      : fixture.division?.startsWith("Male")
        ? "Male"
        : fixture.division?.startsWith("Female")
          ? "Female"
          : (fixture.division ?? null);
    const key = `${venue}::${division ?? "events"}`;
    const schedule = schedules.get(key) ?? { venue, division, fixtures: [] };
    schedule.fixtures.push(fixture);
    schedules.set(key, schedule);
  }

  return (
    <div className="grid gap-5 p-4 sm:p-5">
      {[...schedules.values()].map((schedule, scheduleIndex) => {
        const { venue, division, fixtures: scheduleFixtures } = schedule;
        const title = groupBySession ? (division ?? venue) : division ? `${venue} — ${division}` : venue;
        const scheduleId = `schedule-${title.replace(/\W+/g, "-").toLowerCase()}`;
        const teamSchedule = scheduleFixtures.some((fixture) => fixture.home || fixture.away);
        const showLevel = teamSchedule && new Set(scheduleFixtures.map((fixture) => fixture.division)).size > 1;
        let scheduleLunchTime = lunchTime;
        let lunchIndex = lunchTime
          ? scheduleFixtures.findIndex((fixture) => /^(?:1|2|3|4):.* PM$/.test(fixture.time))
          : -1;
        if (!scheduleLunchTime) {
          lunchIndex = scheduleFixtures.findIndex((fixture, index) => {
            if (index === 0 || !fixture.startAt || !scheduleFixtures[index - 1].endAt) return false;
            const start = new Date(fixture.startAt);
            const previousEnd = new Date(scheduleFixtures[index - 1].endAt!);
            return start.getTime() - previousEnd.getTime() >= 45 * 60 * 1000 &&
              Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Yangon" }).format(start)) >= 13;
          });
          if (lunchIndex > 0 && scheduleFixtures[lunchIndex].startAt) {
            const lunchEnd = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Yangon" }).format(new Date(scheduleFixtures[lunchIndex].startAt!));
            scheduleLunchTime = `12:00 PM-${lunchEnd}`;
          }
        }
        return (
          <div key={title} className={scheduleIndex > 0 ? "border-slate-300 border-t-2 pt-5" : undefined}>
          <section aria-labelledby={scheduleId} className="min-w-0 overflow-hidden border border-slate-300">
            <h3 id={scheduleId} className="bg-sky-800 px-4 py-2 text-center font-black text-sm text-white uppercase tracking-[0.12em]">
              {title}
            </h3>
            <Table className="w-full table-fixed bg-white">
              <TableHeader className="bg-sky-100">
                <TableRow className="hover:bg-sky-100">
                  <TableHead className="w-24 px-2 text-center font-bold text-slate-950">Match</TableHead>
                  <TableHead className="w-32 px-2 text-center font-bold text-slate-950">Time</TableHead>
                  {!teamSchedule && <TableHead className="px-2 text-center font-bold text-slate-950">Event</TableHead>}
                  {showLevel && <TableHead className="w-28 px-2 text-center font-bold text-slate-950">Level</TableHead>}
                  {teamSchedule && (
                    <>
                      <TableHead className="px-2 text-center font-bold text-slate-950">
                        {showFixturePlayers ? "Home team & players" : "Home"}
                      </TableHead>
                      <TableHead className="w-16 px-2 text-center font-bold text-slate-950">Score</TableHead>
                      <TableHead className="px-2 text-center font-bold text-slate-950">
                        {showFixturePlayers ? "Away team & players" : "Away"}
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleFixtures.map((fixture, index) => (
                  <Fragment key={`${fixture.match}-${fixture.time}-${index}`}>
                  {index === lunchIndex && <TableRow className="bg-fuchsia-300 hover:bg-fuchsia-300">
                    <TableCell colSpan={teamSchedule ? (showLevel ? 6 : 5) : 3} className="h-10 text-center font-black text-slate-950 uppercase tracking-wider">
                      Lunch · {scheduleLunchTime}
                    </TableCell>
                  </TableRow>}
                  <TableRow key={`${fixture.match}-${fixture.time}-${index}`} className="hover:bg-slate-50">
                    <TableCell className="px-2 text-center font-bold text-sky-900">
                      {renumberMatches ? `Match ${index + 1}` : fixture.match}
                    </TableCell>
                    <TableCell className="px-2 text-center whitespace-nowrap">{fixture.time}</TableCell>
                    {!teamSchedule && <TableCell className="px-2 text-center">{fixture.activity}</TableCell>}
                    {showLevel && <TableCell className="px-2 text-center">{fixture.division}</TableCell>}
                    {teamSchedule && <>
                      <TableCell className={`min-w-0 whitespace-normal px-2 py-3 text-center font-semibold ${fixture.home ? getTeamColorClass(fixture.home) : "bg-slate-100"}`}>
                        <span className="block">{fixture.home ?? "—"}</span>
                        {showFixturePlayers && <FixturePlayers players={fixture.homePlayers} />}
                      </TableCell>
                      <TableCell className="bg-slate-100 px-2 text-center text-slate-400">—</TableCell>
                      <TableCell className={`min-w-0 whitespace-normal px-2 py-3 text-center font-semibold ${fixture.away ? getTeamColorClass(fixture.away) : "bg-slate-100"}`}>
                        <span className="block">{fixture.away ?? "—"}</span>
                        {showFixturePlayers && <FixturePlayers players={fixture.awayPlayers} />}
                      </TableCell>
                    </>}
                  </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </section>
          </div>
        );
      })}
    </div>
  );
}

export async function SportPage({ sport }: { sport: SportFixture }) {
  const [sportStaff, eventDetails, backendFixtures] = await Promise.all([
    getPublicSportStaff(sport.name),
    getPublicSportEventDetails(sport.name),
    getPublicSportSchedule(sport.name),
  ]);
  const scheduleFixtures = backendFixtures.length > 0 ? backendFixtures : (fixtureFallbacks[sport.slug] ?? []);
  const eventDate = eventDetails ? new Date(eventDetails.date) : null;
  const dateLabel = eventDate
    ? `${eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Yangon" }).replaceAll("/", ".")} (${eventDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Yangon" })})`
    : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="relative overflow-hidden bg-sky-950 text-white">
        <Trophy className="absolute -right-10 -bottom-16 size-64 rotate-12 text-sky-900" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Badge className="border-0 bg-amber-400 font-black text-slate-950 uppercase tracking-[0.12em] hover:bg-amber-400">
            ILBC School Sports Together 2026–27
          </Badge>
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-bold text-sky-300 text-xs uppercase tracking-[0.18em]">Tournament schedule</p>
              <h1 className="mt-2 font-serif font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                {sport.name} fixtures
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-sky-100 sm:text-lg">{sport.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex min-h-16 items-center gap-3 border border-white/20 bg-white/10 px-4 backdrop-blur-sm">
                <CalendarDays className="size-5 text-amber-300" aria-hidden="true" />
                <div><span className="block font-bold text-xl">{scheduleFixtures.length}</span><span className="text-sky-200 text-xs uppercase tracking-wider">Scheduled entries</span></div>
              </div>
              <div className="flex min-h-16 items-center gap-3 border border-white/20 bg-white/10 px-4 backdrop-blur-sm">
                <MapPin className="size-5 text-amber-300" aria-hidden="true" />
                <div><span className="block font-bold text-base">{sport.venueLabel}</span><span className="text-sky-200 text-xs uppercase tracking-wider">Event venue</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-6 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8 lg:py-14">
        <section className="min-w-0">
          {eventDetails && <div className="mb-8 flex flex-col gap-3 border-sky-800 border-b-2 pb-4 font-serif font-bold text-lg text-sky-900 uppercase tracking-wide sm:flex-row sm:items-center sm:justify-between">
            {eventDetails.venue && <p><span className="text-sky-700">Venue:</span> {eventDetails.venue}</p>}
            {dateLabel && <p><span className="text-sky-700">Date:</span> {dateLabel}</p>}
          </div>}
          <h2 className="font-serif font-bold text-3xl text-sky-950">Event schedule</h2>
          <div className="mt-6">
            {scheduleFixtures.length > 0 ? (
              <EventSchedule
                fixtures={scheduleFixtures}
                lunchTime={backendFixtures.length > 0 ? undefined : sport.lunchTime}
                renumberMatches={sport.slug === "volleyball"}
                groupBySession={sport.slug === "basketball"}
                showFixturePlayers={sport.slug === "badminton"}
              />
            ) : (
              <div className="border border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
                No {sport.name} fixtures are currently available.
              </div>
            )}
          </div>
        </section>

        <aside className={`grid auto-rows-fr gap-4 self-start ${eventDetails ? "lg:mt-40" : "lg:mt-28"}`}>
          {sport.equipment && (
            <Card size="sm" className="h-full rounded-none border-t-4 border-t-amber-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-4" />
                  Equipment & setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  {sport.equipment.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {sportStaff.length > 0 && <Card size="sm" className="h-full rounded-none border-t-4 border-t-sky-600 bg-white shadow-sm">
            <CardContent className="pt-1">
              <div className="divide-y divide-slate-200">
                {sportStaff.map((person) => (
                    <div key={`${person.id}-${person.name}`} className="py-3 first:pt-0 last:pb-0">
                      {person.role && <p className="font-bold text-sky-800 text-xs uppercase tracking-wider">{person.role}</p>}
                      <p className={`${person.role ? "mt-1" : ""} font-medium text-slate-700 text-sm leading-6`}>
                        {person.name}
                      </p>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>}
          {sport.notes && (
            <Card size="sm" className="h-full rounded-none border-t-4 border-t-lime-500 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Event notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  {sport.notes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
