import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getResultSports } from "./_lib/results-data";

export default async function ResultsPage() {
  try {
    const sports = await getResultSports();

    return (
      <main className="min-h-[70vh] bg-slate-100 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold text-sky-600 text-sm uppercase tracking-[0.16em]">Past results</p>
          <h1 className="mt-3 font-serif font-bold text-4xl text-slate-900 tracking-tight sm:text-6xl">
            Choose a sport
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
            Each sport has its own rankings page, divisions, and results history.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/results/${sport.slug}`}
                className="group flex min-h-36 items-end justify-between bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-4"
              >
                <span className="font-serif font-bold text-2xl text-slate-900">{sport.name}</span>
                <ArrowRight className="size-5 text-sky-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
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
