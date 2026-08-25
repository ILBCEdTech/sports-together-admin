import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";

import { TournamentsSection } from "./_components/tournaments-section";
import { SafeguardingPolicies } from "./_components/safeguarding-policies";

const principles = [
  {
    number: "01",
    title: "Our mission",
    icon: Trophy,
    text: "To build friendship, teamwork, sportsmanship, 21st Century skills, and wellness through the power of sports.",
  },
] as const;

const historyEditions = [
  {
    edition: "01",
    year: "2023-2024",
    city: "Yangon",
    label: "First Edition",
    text: "The ILBC Sports Together Programme was launched in Yangon, bringing together students and staff from various ILBC campuses through sports and friendly competition.",
  },
  {
    edition: "02",
    year: "Second Edition",
    city: "Nay Pyi Taw",
    label: "Growing Together",
    text: "The second edition was successfully held in Nay Pyi Taw, expanding participation and building greater enthusiasm across the ILBC community.",
  },
  {
    edition: "03",
    year: "2026-2027",
    city: "Mandalay",
    label: "Current Edition",
    text: "The third edition is hosted in Mandalay, with more participants, more sporting activities, and an even stronger spirit of unity across ILBC campuses.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative isolate min-h-[720px] overflow-hidden bg-sky-950 text-white">
        <Image
          src="/images/football.jpg"
          alt="ILBC student athletes gathered together"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 py-24 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-7 flex items-center gap-3 font-bold text-amber-400 text-sm uppercase tracking-[0.12em] before:h-1 before:w-8 before:bg-amber-400">
              ILBC School Sports Together (2026-2027)
            </p>

            <h1 className="font-serif text-5xl uppercase leading-[0.94] tracking-tight sm:text-7xl lg:text-[5.4rem]">
              Empowering{" "}
              <span className="text-amber-400">
                student-athletes
              </span>
              <br />
              through SPORTSMANSHIP
            </h1>

            <p className="mt-7 max-w-3xl text-base text-white/80 leading-7 sm:text-lg">
              The ILBC School Sports programme unites students from
              diverse backgrounds through team spirit, rigorous
              training, and a culture of respect, teamwork, and
              sportsmanship.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/results/football"
                className="inline-flex h-13 items-center bg-amber-400 px-7 font-black text-sky-950 text-sm uppercase hover:bg-amber-300"
              >
                Live Scores
                <ArrowRight className="ml-3 size-4" />
              </Link>

              <Link
                href="/fixtures"
                className="inline-flex h-13 items-center border-2 border-amber-400 px-7 font-black text-amber-400 text-sm uppercase hover:bg-amber-400 hover:text-sky-950"
              >
                View Schedules
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT / MISSION
      ========================================================== */}
      <section
        id="about"
        className="bg-slate-50 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-bold text-sky-700 text-xs uppercase tracking-[0.18em]">
              About Sports Together
            </p>

            <h2 className="mt-4 font-serif text-4xl text-sky-950 uppercase sm:text-5xl">
              More than competition.
            </h2>
          </div>

          <div className="mt-14 max-w-3xl">
            {principles.map(
              ({ number, title, icon: Icon, text }) => (
                <article
                  key={title}
                  className="relative overflow-hidden border border-slate-100 bg-white p-8 lg:p-10"
                >
                  <span className="absolute top-5 right-6 font-black text-5xl text-slate-100">
                    {number}
                  </span>

                  <Icon className="mb-7 size-7 text-amber-500" />

                  <h3 className="font-serif text-2xl text-sky-900 uppercase">
                    {title}
                  </h3>

                  <p className="mt-5 text-lg text-slate-600 leading-8">
                    {text}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          TOURNAMENTS
      ========================================================== */}
      <TournamentsSection />

      {/* =========================================================
          HISTORY
      ========================================================== */}
      <section
        id="history"
        className="overflow-hidden bg-sky-950 py-20 text-white lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* History heading */}
          <div className="grid gap-10 lg:grid-cols-[1fr_30rem] lg:items-end">
            <div>
              <p className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-[0.18em]">
                <Award
                  className="size-4"
                  aria-hidden="true"
                />
                Our Journey
              </p>

              <h2 className="mt-4 max-w-4xl font-serif text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl">
                History of the ILBC
                <br />
                <span className="text-amber-400">
                  Sports Together Programme
                </span>
              </h2>
            </div>

            <div className="border-amber-400 border-l-4 pl-6">
              <p className="text-white/70 leading-7">
                From its beginnings in Yangon to the third
                edition in Mandalay, Sports Together continues
                to bring the ILBC community together through
                friendship, competition, teamwork, and
                sportsmanship.
              </p>
            </div>
          </div>

          {/* =====================================================
              TIMELINE
          ====================================================== */}
          <div className="relative mt-16">
            {/* Desktop timeline line */}
            <div className="absolute top-10 right-0 left-0 hidden h-px bg-white/15 lg:block" />

            <div className="relative grid gap-6 lg:grid-cols-3">
              {historyEditions.map((item) => (
                <article
                  key={item.edition}
                  className="relative border border-white/10 bg-white/[0.05] p-7 backdrop-blur-sm lg:p-8"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div className="relative z-10 flex size-20 items-center justify-center bg-amber-400 font-serif text-3xl text-sky-950">
                      {item.edition}
                    </div>

                    <Trophy
                      className="size-8 text-white/20"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="font-bold text-amber-400 text-xs uppercase tracking-[0.16em]">
                    {item.label}
                  </p>

                  <h3 className="mt-3 font-serif text-3xl uppercase">
                    {item.city}
                  </h3>

                  <div className="mt-4 flex items-center gap-2 text-sm text-sky-200">
                    <MapPin
                      className="size-4"
                      aria-hidden="true"
                    />
                    {item.year}
                  </div>

                  <p className="mt-6 text-white/65 leading-7">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* =====================================================
              FULL HISTORY DESCRIPTION
          ====================================================== */}
          <div className="mt-16 grid gap-12 border-white/10 border-t pt-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex size-14 items-center justify-center bg-amber-400 text-sky-950">
                <Users
                  className="size-7"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-6 font-bold text-amber-400 text-xs uppercase tracking-[0.18em]">
                Three Editions. One Community.
              </p>

              <h3 className="mt-4 font-serif text-3xl uppercase leading-tight sm:text-4xl">
                Growing stronger
                <br />
                every year.
              </h3>
            </div>

            <div className="space-y-6 text-base text-white/70 leading-8 sm:text-lg">
              <p>
                The ILBC Sports Together Programme for the
                2026-2027 Academic Year marks the{" "}
                <strong className="font-semibold text-white">
                  third edition
                </strong>{" "}
                of this remarkable event and is being hosted in{" "}
                <strong className="font-semibold text-amber-400">
                  Mandalay
                </strong>
                .
              </p>

              <p>
                The programme was first launched during the
                2023-2024 Academic Year in Yangon, bringing
                together students and staff from various ILBC
                campuses through sports and friendly competition.
                The second edition was successfully held in Nay
                Pyi Taw, further expanding participation and
                enthusiasm across the ILBC community.
              </p>

              <p>
                Although the initial event featured a limited
                number of sports and participants, the programme
                has grown significantly each year. Both the
                variety of sporting activities and the number of
                participants have steadily increased, reflecting
                the programme&apos;s success and popularity.
              </p>

              <p>
                More than just a sporting event, the ILBC Sports
                Together Programme serves as a valuable platform
                for bringing all ILBC campuses together. It
                fosters unity, teamwork, sportsmanship, and a
                positive athletic mindset among students and
                staff.
              </p>

              <p>
                Through healthy competition and shared
                experiences, the programme continues to
                strengthen bonds within the ILBC family and
                promote the values of{" "}
                <strong className="font-semibold text-white">
                  cooperation, discipline, 21st Century skills,
                  and excellence.
                </strong>
              </p>
            </div>
          </div> 
        </div>
      </section>

      {/* =========================================================
          SAFEGUARDING + EVACUATION
      ========================================================== */}
      <SafeguardingPolicies />
    </>
  );
}