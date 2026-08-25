import { SchoolLifeGallery } from "./_components/school-life-gallery";
import { getSchoolLifeGalleries } from "./_lib/school-life-data";

export default async function SchoolLifePage() {
  try {
    const galleries = await getSchoolLifeGalleries();

    return (
      <main className="min-h-[70vh] bg-slate-100 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <p className="font-bold text-sky-700 text-sm uppercase tracking-[0.16em]">Beyond the classroom</p>
          <h1 className="mt-3 font-serif font-bold text-4xl text-slate-900 tracking-tight sm:text-6xl">School Life</h1>
          <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
            Explore the energy, teamwork, and memorable moments that shape sporting life at ILBC.
          </p>
          <SchoolLifeGallery galleries={galleries} />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-[60vh] bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h1 className="font-serif font-bold text-4xl text-slate-900">School Life</h1>
          <p className="mt-4 text-slate-600">School life galleries are temporarily unavailable.</p>
        </div>
      </main>
    );
  }
}
