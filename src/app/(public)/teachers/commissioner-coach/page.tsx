import type { Metadata } from "next";

import { TeachersBySport } from "../_components/teachers-by-sport";
import { getSportStaff } from "../_lib/sport-staff";

export const metadata: Metadata = { title: "Commissioner & Coach | ILBC Sports" };

export default async function CommissionerCoachPage() {
  try {
    const sports = await getSportStaff();

    return (
      <div className="min-h-[70vh] bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="font-bold text-sky-700 text-xs uppercase tracking-[0.18em]">Sports leadership</p>
          <h1 className="mt-2 font-serif font-bold text-4xl text-sky-950 sm:text-5xl">Commissioner & Coach</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Meet the coaches, commissioners, and committee members supporting each sport.
          </p>
          <TeachersBySport sports={sports} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="min-h-[70vh] bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 py-24 text-center text-slate-600 lg:px-8">
          Sport staff is temporarily unavailable.
        </div>
      </div>
    );
  }
}
