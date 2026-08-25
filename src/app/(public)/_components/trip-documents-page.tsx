import { ClipboardCheck, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const documents = [
  {
    title: "Itinerary",
    description: "View the complete trip schedule, locations, meeting times, and planned activities.",
    files: [
      { label: "All Participants Itinerary", name: "SPTEvent_Itinerary.pdf" },
      { label: "Mandalay Students Itinerary", name: "SPTEvent_Itinerary_Mdy.pdf" },
    ],
    icon: FileText,
  },
  {
    title: "Check List",
    description: "View the preparation and packing checklist before departure.",
    files: [
      { label: "Accessories Check List", name: "Accessories Checklist for Sport Together at Mandalay.pdf" },
    ],
    icon: ClipboardCheck,
  },
] as const;

export function TripDocumentsPage({ audience }: { audience: "Student" | "Teacher" }) {
  return (
    <main className="min-h-[70vh] bg-slate-100 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="font-bold text-sky-700 text-sm uppercase tracking-[0.16em]">{audience} trip documents</p>
        <h1 className="mt-3 font-serif font-bold text-4xl text-slate-900 tracking-tight sm:text-6xl">
          Itinerary & Check List
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
          Access the latest trip itinerary and {audience.toLowerCase()} checklist in PDF format.
        </p>

        <div className="mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          {documents.map((document) => {
            const Icon = document.icon;

            return (
              <Card key={document.title} className="rounded-none bg-white py-0 ring-slate-200">
                <CardHeader className="gap-4 px-6 pt-6">
                  <div className="grid size-12 place-items-center bg-sky-100 text-sky-700">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="font-serif font-bold text-2xl text-slate-900">{document.title}</CardTitle>
                    <CardDescription className="mt-2 leading-6 text-slate-600">{document.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 px-6 pb-6">
                  {document.files.map((file) => (
                    <Button
                      key={file.name}
                      asChild
                      className="h-11 w-full rounded-none bg-amber-400 font-black text-white hover:bg-amber-300"
                    >
                      <a href={`/policy/${encodeURIComponent(file.name)}`} target="_blank" rel="noreferrer">
                        <FileText aria-hidden="true" />
                        {file.label}
                      </a>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
