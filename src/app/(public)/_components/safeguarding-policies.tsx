import {
  Download,
  ExternalLink,
  FileText,
  MapPinned,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const policies = [
  {
    sport: "Football",
    file: "Sports Together (2026-2027) Football Rules and Regulations.pdf",
    accent: "bg-blue-600",
  },
  {
    sport: "Basketball",
    file: "Sports Together (2026-2027) Basketball Rules and Regulations.pdf",
    accent: "bg-red-500",
  },
  {
    sport: "Badminton",
    file: "Sports Together (2026-2027) Badminton Rules and Regulations.pdf",
    accent: "bg-lime-500",
  },
  {
    sport: "Swimming",
    file: "Sports Together (2026-2027) Swimming Rules and Regulations.pdf",
    accent: "bg-sky-600",
  },
  {
    sport: "Volleyball",
    file: "Sports Together (2026-2027) Volleyball Rules and Regulations.pdf",
    accent: "bg-yellow-600",
  },
  {
    sport: "Student Code of Conduct and Trip",
    file: "Student Code of Conduct and Trip.pdf",
    accent: "bg-emerald-600",
  },
] as const;

const evacuationPlans = [
  {
    name: "ILBC International School - 1",
    file: "G1 Evacuation Plan 26-27.pdf",
    type: "School",
  },
  {
    name: "ILBC International School - 3",
    file: "G3 Evacuation Plan 26-27 3.pdf",
    type: "School",
  },
  {
    name: "YIS (Mandalay)",
    file: "YIS (MDY) Emergency Escape Plan.png",
    type: "School",
  },
  {
    name: "Win Unity Hotel",
    file: "Win Unity Emergency Escape Plan.png",
    type: "Hotel",
  },
  {
    name: "Mandalay Lodge Hotel",
    file: "Mandalay Lodge Hotel Emergency Escape Plan.png",
    type: "Hotel",
  },
  {
    name: "Hotel Shwe Hinthar",
    file: "Hotel Shwe Hinthar Emergency Escape Plan.png",
    type: "Hotel",
  },
] as const;

const evacuationGuidelines = [
  "Stay calm and follow instructions from staff or emergency responders.",
  "Use the nearest safe emergency exit or staircase.",
  "Do not use lifts/elevators during an emergency unless authorized.",
  "Assist anyone who may need help.",
  "Avoid delays, running, pushing, or causing congestion.",
  "Proceed directly to the designated assembly point.",
  "Remain there until further instructions are given.",
  "Do not re-enter the building until it is declared safe.",
] as const;

export function SafeguardingPolicies() {
  return (
    <section
      id="safeguarding"
      className="scroll-mt-20 bg-slate-100 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* =========================================================
            SPORTS RULES & REGULATIONS
        ========================================================== */}
        <div className="grid gap-6 lg:grid-cols-[1fr_30rem] lg:items-end">
          <div>
            <p className="flex items-center gap-2 font-bold text-sky-700 text-xs uppercase tracking-[0.18em]">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Safeguarding & Policies
            </p>

            <h2 className="mt-4 max-w-3xl font-serif text-4xl text-sky-950 uppercase leading-tight sm:text-5xl">
              Play safely. Compete fairly.
            </h2>
          </div>

          <p className="text-slate-600 leading-7">
            Review the official rules and regulations for each Sports
            Together competition.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {policies.map((policy) => {
            const href = `/policy/${encodeURIComponent(policy.file)}`;

            return (
              <Card
                key={policy.sport}
                className="gap-0 rounded-none bg-white py-0 shadow-sm"
              >
                <div className={`h-2 ${policy.accent}`} />

                <CardHeader className="px-5 pt-6 pb-3">
                  <FileText
                    className="mb-4 size-8 text-sky-700"
                    aria-hidden="true"
                  />

                  <CardTitle className="font-bold font-serif text-2xl text-sky-950">
                    {policy.sport}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 px-5 pb-5 text-slate-500 text-sm leading-6">
                  Rules and Regulations
                  <br />
                  2026-2027
                </CardContent>

                <CardFooter className="grid grid-cols-2 border-slate-200 border-t bg-white p-0">
                  <Button
                    asChild
                    variant="ghost"
                    className="h-11 rounded-none border-slate-200 border-r text-sky-800"
                  >
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                      <ExternalLink />
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="h-11 rounded-none text-sky-800"
                  >
                    <a href={href} download={policy.file}>
                      Download
                      <Download />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* =========================================================
            EMERGENCY EVACUATION PLANS
        ========================================================== */}
        <div
          id="evacuation-plans"
          className="mt-20 border-slate-300 border-t pt-16 lg:mt-24 lg:pt-20"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_28rem] lg:items-start">
            <div>
              <p className="flex items-center gap-2 font-bold text-red-600 text-xs uppercase tracking-[0.18em]">
                <TriangleAlert className="size-4" aria-hidden="true" />
                Emergency Preparedness
              </p>

              <h2 className="mt-4 max-w-3xl font-serif text-4xl text-sky-950 uppercase leading-tight sm:text-5xl">
                Emergency Evacuation Plans
              </h2>

              <div className="mt-6 max-w-3xl space-y-4 text-slate-600 leading-7">
                <p>
                  To ensure the safety of all students, staff, visitors, and
                  guests, emergency evacuation plans are available for the
                  designated School and Hotel facilities.
                </p>

                <p>
                  These plans identify emergency exits, evacuation routes,
                  staircases, lifts, fire extinguishers, and assembly points.
                </p>

                <p className="font-semibold text-slate-800">
                  In any emergency, remain calm, follow the marked evacuation
                  route, and proceed safely to the designated assembly point.
                </p>
              </div>
            </div>

            {/* Emergency notice */}
            <div className="border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center bg-red-600 text-white">
                  <TriangleAlert className="size-5" aria-hidden="true" />
                </div>

                <div>
                  <h3 className="font-bold font-serif text-red-950 text-xl">
                    During an Emergency
                  </h3>

                  <p className="mt-2 text-red-900/80 text-sm leading-6">
                    Stay calm. Follow staff instructions and the marked
                    evacuation route. Proceed directly to the designated
                    assembly point.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================
              AVAILABLE EVACUATION PLANS
          ======================================================== */}
          <div className="mt-12">
            <div className="flex items-center gap-3">
              <MapPinned
                className="size-6 text-sky-700"
                aria-hidden="true"
              />

              <h3 className="font-bold font-serif text-2xl text-sky-950 sm:text-3xl">
                Available Evacuation Plans
              </h3>
            </div>

            <p className="mt-3 max-w-3xl text-slate-600 leading-7">
              Select your School or Hotel location below to view or download
              the relevant emergency evacuation plan.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {evacuationPlans.map((plan, index) => {
                const href = `/policy/${encodeURIComponent(plan.file)}`;

                return (
                  <Card
                    key={plan.name}
                    className="group gap-0 rounded-none border-slate-200 bg-white py-0 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="h-2 bg-red-600" />

                    <CardHeader className="px-6 pt-6 pb-3">
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex size-12 items-center justify-center bg-sky-950 text-white">
                          <MapPinned
                            className="size-6"
                            aria-hidden="true"
                          />
                        </div>

                        <span className="font-bold text-slate-400 text-xs uppercase tracking-[0.16em]">
                          Plan {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="font-bold text-red-600 text-xs uppercase tracking-[0.16em]">
                        {plan.type}
                      </p>

                      <CardTitle className="mt-2 min-h-[3.5rem] font-bold font-serif text-sky-950 text-xl leading-snug sm:text-2xl">
                        {plan.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 px-6 pb-6 text-slate-500 text-sm leading-6">
                      Emergency evacuation route, exits and assembly point
                      information.
                    </CardContent>

                    <CardFooter className="grid grid-cols-2 border-slate-200 border-t bg-white p-0">
                      <Button
                        asChild
                        variant="ghost"
                        className="h-12 rounded-none border-slate-200 border-r text-sky-800"
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                          <ExternalLink />
                        </a>
                      </Button>

                      <Button
                        asChild
                        variant="ghost"
                        className="h-12 rounded-none text-sky-800"
                      >
                        <a href={href} download={plan.file}>
                          Download
                          <Download />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* =======================================================
              EVACUATION GUIDELINES
          ======================================================== */}
          <div className="mt-14 bg-sky-950 px-6 py-10 text-white sm:px-10 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
              <div>
                <div className="flex size-12 items-center justify-center bg-red-600">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </div>

                <h3 className="mt-5 font-bold font-serif text-3xl">
                  Emergency Evacuation Guidelines
                </h3>

                <p className="mt-4 text-sky-100/80 text-sm leading-6">
                  Everyone should understand these instructions before an
                  emergency occurs.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {evacuationGuidelines.map((guideline, index) => (
                  <div
                    key={guideline}
                    className="flex items-start gap-4 border-white/10 border-b pb-4"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center bg-white/10 font-bold text-sky-200 text-xs">
                      {index + 1}
                    </span>

                    <p className="text-sky-50 text-sm leading-6">
                      {guideline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =======================================================
              FINAL INFORMATION
          ======================================================== */}
          <div className="mt-10 border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <FileText
                className="size-8 shrink-0 text-sky-700"
                aria-hidden="true"
              />

              <div>
                <h3 className="font-bold font-serif text-2xl text-sky-950">
                  Evacuation Plans
                </h3>

                <p className="mt-3 max-w-4xl text-slate-600 leading-7">
                  The evacuation plans above contain the emergency information
                  for each facility. Please familiarize yourself with the
                  nearest emergency exit, evacuation route, and assembly point
                  for your location, and follow the marked routes during any
                  emergency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
