import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getResultSports, getSportResultsBySlug } from "../_lib/results-data";

const sportHero: Record<string, string> = {
  badminton: "/images/badminton-results.png",
  basketball: "/images/basketball-results.png",
  football: "/images/football-results.png",
  soccer: "/images/football-results.png",
  swimming: "/images/swimming-results.png",
  volleyball: "/images/volleyball-results.png",
};

const resultDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Asia/Yangon",
});
const resultTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Yangon",
});

function resultDateAndTime(startAt: string, endAt: string | null) {
  const start = new Date(startAt);
  const date = resultDateFormatter.format(start);
  const startTime = resultTimeFormatter.format(start);
  return `${date} · ${startTime}${endAt ? ` – ${resultTimeFormatter.format(new Date(endAt))}` : ""}`;
}

export default async function SportResultsPage({ params }: PageProps<"/results/[sport]">) {
  const { sport } = await params;

  try {
    const [result, sports] = await Promise.all([getSportResultsBySlug(sport), getResultSports()]);
    if (!result) notFound();

    const { sportName, results } = result;
    const hero = sportHero[sport];

    return (
      <main className="min-h-screen bg-slate-100 pb-16 sm:pb-20">
        <section className="relative isolate h-64 overflow-hidden bg-sky-950 sm:h-80 lg:h-96">
          {hero && <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover object-center" />}
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center px-5 lg:px-8">
            <h1 className="font-serif font-bold text-5xl text-white drop-shadow-lg sm:text-7xl">{sportName}</h1>
          </div>
        </section>

        <nav
          aria-label="Sport results"
          className="mx-auto max-w-7xl overflow-x-auto bg-white shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max">
            {sports.map((item) => {
              const active = item.slug === sport;
              return (
                <Link
                  key={item.id}
                  href={`/results/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`relative min-w-40 flex-1 px-7 py-5 text-center font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-700 ${
                    active ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute top-full left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-slate-800" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          {results.length > 0 ? (
            <section aria-labelledby="sport-results-heading">
              <h2 id="sport-results-heading" className="mb-6 font-serif font-bold text-3xl text-slate-800 tracking-tight sm:text-5xl">
                Results
              </h2>
              <Table className="bg-white text-base">
                <TableHeader className="bg-sky-100">
                  <TableRow className="hover:bg-sky-100">
                    <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Match</TableHead>
                    <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Date</TableHead>
                    <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Round</TableHead>
                    <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Teams</TableHead>
                    <TableHead className="h-14 px-3 text-center font-black text-slate-950 sm:px-5">Score</TableHead>
                    <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Winner</TableHead>
                    <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item, index) => (
                    <TableRow key={item.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                      <TableCell className="h-16 px-3 font-semibold sm:px-5">Match {index + 1}</TableCell>
                      <TableCell className="h-16 whitespace-nowrap px-3 sm:px-5">
                        {resultDateAndTime(item.startAt, item.endAt)}
                      </TableCell>
                      <TableCell className="h-16 px-3 sm:px-5">{item.round || "—"}</TableCell>
                      <TableCell className="h-16 px-3 font-medium sm:px-5">
                        {item.homeTeam} vs {item.awayTeam}
                      </TableCell>
                      <TableCell className="h-16 px-3 text-center font-bold sm:px-5">
                        {item.homeScore ?? "—"} – {item.awayScore ?? "—"}
                      </TableCell>
                      <TableCell className="h-16 px-3 sm:px-5">{item.winner || "—"}</TableCell>
                      <TableCell className="h-16 px-3 sm:px-5">
                        {item.status === "FINAL" ? "Final" : "Pending"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          ) : (
            <p className="text-slate-600">No results are available for this sport yet.</p>
          )}
        </div>
      </main>
    );
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")) throw error;
    return (
      <main className="min-h-[60vh] bg-slate-100 py-20">
        <p className="mx-auto max-w-7xl px-5 text-slate-600 lg:px-8">Results are temporarily unavailable.</p>
      </main>
    );
  }
}
