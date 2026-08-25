import { Download, ExternalLink, FileText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const policies = [
  { sport: "Football", file: "Sports Together (2026-2027) Football Rules and Regulations.pdf", accent: "bg-blue-600" },
  { sport: "Basketball", file: "Sports Together (2026-2027) Basketball Rules and Regulations.pdf", accent: "bg-red-500" },
  { sport: "Badminton", file: "Sports Together (2026-2027) Badminton Rules and Regulations.pdf", accent: "bg-lime-500" },
  { sport: "Swimming", file: "Sports Together (2026-2027) Swimming Rules and Regulations.pdf", accent: "bg-sky-600" },
] as const;

export function SafeguardingPolicies() {
  return (
    <section id="safeguarding" className="scroll-mt-20 bg-slate-100 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_30rem] lg:items-end">
          <div>
            <p className="flex items-center gap-2 font-bold text-sky-700 text-xs uppercase tracking-[0.18em]">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Safeguarding & policies
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl text-sky-950 uppercase leading-tight sm:text-5xl">
              Play safely. Compete fairly.
            </h2>
          </div>
          <p className="text-slate-600 leading-7">
            Review the official rules and regulations for each Sports Together competition.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {policies.map((policy) => {
            const href = `/policy/${encodeURIComponent(policy.file)}`;
            return (
              <Card key={policy.sport} className="gap-0 rounded-none bg-white py-0 shadow-sm">
                <div className={`h-2 ${policy.accent}`} />
                <CardHeader className="px-5 pt-6 pb-3">
                  <FileText className="mb-4 size-8 text-sky-700" aria-hidden="true" />
                  <CardTitle className="font-serif font-bold text-2xl text-sky-950">{policy.sport}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-5 pb-5 text-slate-500 text-sm leading-6">
                  Rules and Regulations<br />2026-2027
                </CardContent>
                <CardFooter className="grid grid-cols-2 border-slate-200 border-t bg-white p-0">
                  <Button asChild variant="ghost" className="h-11 rounded-none border-slate-200 border-r text-sky-800">
                    <a href={href} target="_blank" rel="noreferrer">View <ExternalLink /></a>
                  </Button>
                  <Button asChild variant="ghost" className="h-11 rounded-none text-sky-800">
                    <a href={href} download={policy.file}>Download <Download /></a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
