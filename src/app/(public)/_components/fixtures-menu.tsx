"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FixtureSport = {
  slug: string;
  name: string;
  description: string;
  venueLabel: string;
  fixtureCount: number;
};

export function FixturesMenu({ sports }: { sports: FixtureSport[] }) {
  const pathname = usePathname();
  const active = pathname === "/fixtures" || sports.some((sport) => pathname === `/${sport.slug}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`group flex items-center gap-2 font-bold text-xs uppercase tracking-[0.14em] outline-none hover:text-sky-900 focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-4 ${active ? "text-sky-700" : "text-slate-500"}`}>
        Fixtures
        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={26}
        className="w-96 rounded-none border-0 bg-white p-3 shadow-xl ring-0"
      >
        <DropdownMenuLabel className="px-3 py-2 font-bold text-sky-700 text-xs uppercase tracking-[0.14em]">
          Fixture schedules
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />
        {sports.map((sport) => (
          <DropdownMenuItem key={sport.slug} asChild className="rounded-none p-0 focus:bg-slate-100">
            <Link href={`/${sport.slug}`} className="flex w-full items-start gap-3 px-3 py-3">
              <CalendarDays className="mt-1 size-4 shrink-0 text-sky-700" aria-hidden="true" />
              <span className="min-w-0">
                <span className="flex items-center justify-between gap-4">
                  <span className="font-bold text-base text-slate-950">{sport.name}</span>
                  <span className="shrink-0 text-slate-500 text-xs">{sport.fixtureCount} entries</span>
                </span>
                <span className="mt-1 block text-slate-600 text-xs leading-5">{sport.description}</span>
                <span className="mt-1 block font-medium text-sky-700 text-xs">{sport.venueLabel}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuItem asChild className="rounded-none p-0 focus:bg-slate-100">
          <Link href="/fixtures" className="block w-full px-3 py-3 font-bold text-sky-800 text-sm">
            View all fixtures
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
