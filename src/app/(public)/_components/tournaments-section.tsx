import Image from "next/image";

import { getPublicTournaments, type PublicTournament } from "../_lib/tournaments";

const seasonNames = ["Fall Season", "Winter Season", "Spring Season"] as const;

function seasonIndex(tournament: PublicTournament) {
  const month = new Date(tournament.start_date).getUTCMonth();
  if (month >= 7 && month <= 10) return 0;
  if (month === 11 || month <= 1) return 1;
  return 2;
}

function schoolYearLabel(tournaments: PublicTournament[]) {
  const firstDate = new Date(tournaments[0]?.start_date ?? Date.now());
  const calendarYear = firstDate.getUTCFullYear();
  const startYear = firstDate.getUTCMonth() >= 7 ? calendarYear : calendarYear - 1;
  return `${startYear}–${String(startYear + 1).slice(-2)}`;
}

export async function TournamentsSection() {
  let tournaments: PublicTournament[] = [];
  let failed = false;

  try {
    tournaments = (await getPublicTournaments()).sort(
      (left, right) => new Date(left.start_date).getTime() - new Date(right.start_date).getTime(),
    );
  } catch {
    failed = true;
  }

  const tournamentSeasons = seasonNames.map((name, index) => ({
    name,
    tournaments: tournaments.filter((tournament) => seasonIndex(tournament) === index),
  }));

  return (
    <section id="tournaments" aria-labelledby="tournaments-title" className="scroll-mt-20 bg-slate-100">
      <div className="relative isolate h-64 overflow-hidden sm:h-80 lg:h-96">
        <Image
          src="/images/reference-0.jpg"
          alt="ILBC student athletes representing the school sports program"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/40" />
        <div className="relative mx-auto flex h-full max-w-7xl items-start justify-center px-5 pt-10 text-center sm:pt-14 lg:px-8">
          <h2
            id="tournaments-title"
            className="font-serif font-bold text-4xl text-white uppercase tracking-tight drop-shadow-lg sm:text-6xl"
          >
            {schoolYearLabel(tournaments)} Tournaments
          </h2>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:py-20 md:grid-cols-3 md:gap-10 lg:px-8 lg:py-24">
        {failed ? (
          <p className="text-slate-600 md:col-span-3">Tournament information is temporarily unavailable.</p>
        ) : tournaments.length === 0 ? (
          <p className="text-slate-600 md:col-span-3">No tournaments have been published yet.</p>
        ) : (
          tournamentSeasons.map((season) => (
            <article key={season.name}>
              <h3 className="font-serif font-bold text-3xl text-sky-950 tracking-tight">{season.name}</h3>
              {season.tournaments.length > 0 ? (
                <ul className="mt-7 list-disc space-y-2 pl-6 text-base text-slate-800 leading-6 sm:text-lg">
                  {season.tournaments.map((tournament) => (
                    <li key={tournament.id} className="pl-1">
                      {tournament.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-7 text-slate-500">No tournaments scheduled.</p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
