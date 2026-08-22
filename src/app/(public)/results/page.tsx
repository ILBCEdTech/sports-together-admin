import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { SwimmingRankingTable } from "./_components/swimming-ranking-table";
import { getRankingGroups } from "./_lib/results-data";

export default async function ResultsPage({ searchParams }: PageProps<"/results">) {
  const sportParam = (await searchParams).sport;
  const sportId = typeof sportParam === "string" ? Number(sportParam) : undefined;

  try {
    const { sportName, groups } = await getRankingGroups(Number.isInteger(sportId) ? sportId : undefined);
    const isSwimming = sportName.toLowerCase() === "swimming";
    const swimmingTeams = groups
      .flatMap((group) => group.teams)
      .filter((team, index, teams) => teams.findIndex((candidate) => candidate.id === team.id) === index)
      .map((team, index) => ({ ...team, ranking: index + 1 }));

    return (
      <main className="min-h-screen bg-slate-100 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold text-sky-600 text-sm uppercase tracking-[0.16em]">Past Results</p>
          <h1 className="mt-3 font-serif font-bold text-4xl text-slate-900 tracking-tight sm:text-6xl">
            {sportName} Rankings
          </h1>

          {isSwimming && swimmingTeams.length > 0 ? (
            <div className="mt-12">
              <SwimmingRankingTable teams={swimmingTeams} />
            </div>
          ) : groups.length > 0 ? (
            <div className="mt-12 space-y-14">
              {groups.map((group) => {
                const headingId = `ranking-${group.title.toLowerCase().replaceAll(" ", "-")}`;
                return (
                  <section key={group.title} aria-labelledby={headingId}>
                    <h2
                      id={headingId}
                      className="mb-6 font-serif font-bold text-3xl text-slate-800 tracking-tight sm:text-5xl"
                    >
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
            <p className="mt-12 text-slate-600">No teams are available for this sport yet.</p>
          )}
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-[60vh] bg-slate-100 py-20">
        <p className="mx-auto max-w-7xl px-5 text-slate-600 lg:px-8">Results are temporarily unavailable.</p>
      </main>
    );
  }
}
