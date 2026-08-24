import Image from "next/image";

import { getPublicTournaments, type PublicTournament } from "../_lib/tournaments";

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
            Tournaments
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
        {failed ? (
          <p className="text-slate-600">Tournament information is temporarily unavailable.</p>
        ) : tournaments.length === 0 ? (
          <p className="text-slate-600">No tournaments have been published yet.</p>
        ) : (
          <ul className="list-disc space-y-2 pl-6 text-base text-slate-800 leading-6 sm:text-lg">
            {tournaments.map((tournament) => (
              <li key={tournament.id} className="pl-1">
                {tournament.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
