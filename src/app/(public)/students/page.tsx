import { getStudentSports } from "../_components/students-nav";
import { StudentRosterTabs } from "./_components/student-roster-tabs";

export default async function StudentsPage() {
  try {
    const sports = await getStudentSports();

    return (
      <main className="min-h-[70vh] bg-slate-100 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="font-bold text-sky-700 text-sm uppercase tracking-[0.16em]">Student athletes</p>
          <h1 className="mt-3 font-serif font-bold text-4xl text-slate-900 tracking-tight sm:text-6xl">
            Teams & players
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
            Team rosters shown in their original registration order.
          </p>
          <StudentRosterTabs sports={sports} />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-[60vh] bg-slate-100 py-20">
        <p className="mx-auto max-w-7xl px-5 text-slate-600 lg:px-8">Student rosters are temporarily unavailable.</p>
      </main>
    );
  }
}
