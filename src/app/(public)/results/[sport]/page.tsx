import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { SportGallerySection } from "../_components/sport-gallery-section";
import { SwimmingRankingTable } from "../_components/swimming-ranking-table";
import { getRankingGroupsBySlug, getResultSports, getSportGalleries } from "../_lib/results-data";

const sportHero: Record<string, string> = {
  badminton: "/images/badminton-results.png",
  basketball: "/images/basketball-results.png",
  football: "/images/football-results.png",
  soccer: "/images/football-results.png",
  swimming: "/images/swimming-results.png",
  volleyball: "/images/volleyball-results.png",
};

export default async function SportResultsPage({ params }: PageProps<"/results/[sport]">) {
  const { sport } = await params;

  try {
    const [result, sports] = await Promise.all([getRankingGroupsBySlug(sport), getResultSports()]);
    if (!result) notFound();

    const { sportId, sportName, groups } = result;
    const galleries = sportId ? await getSportGalleries(sportId).catch(() => []) : [];
    const isSwimming = sportName.toLowerCase() === "swimming";
    const swimmingTeams = groups
      .flatMap((group) => group.teams)
      .filter((team, index, teams) => teams.findIndex((candidate) => candidate.id === team.id) === index)
      .map((team, index) => ({ ...team, ranking: index + 1 }));
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
          {isSwimming && swimmingTeams.length > 0 ? (
            <SwimmingRankingTable teams={swimmingTeams} />
          ) : groups.length > 0 ? (
            <div className="space-y-14">
              {groups.map((group) => {
                const headingId = `ranking-${group.title.toLowerCase().replaceAll(" ", "-")}`;
                return (
                  <section key={group.title} aria-labelledby={headingId}>
                    <h2 id={headingId} className="mb-6 font-serif font-bold text-3xl text-slate-800 tracking-tight sm:text-5xl">
                      {group.title}
                    </h2>
                    <Table className="bg-white text-base sm:text-lg">
                      <TableHeader className="bg-sky-100">
                        <TableRow className="hover:bg-sky-100">
                          <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Ranking</TableHead>
                          <TableHead className="h-14 px-3 font-black text-slate-950 sm:px-5">Team</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.teams.map((team, index) => (
                          <TableRow key={team.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                            <TableCell className="h-14 px-3 sm:px-5">{index + 1}</TableCell>
                            <TableCell className="h-14 px-3 font-medium sm:px-5">{team.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-600">No teams are available for this sport yet.</p>
          )}
          <SportGallerySection galleries={galleries} sportName={sportName} />
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
