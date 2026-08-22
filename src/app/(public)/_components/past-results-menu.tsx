"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ResultSport = {
  id: number;
  name: string;
};

export function PastResultsMenu({ sports }: { sports: ResultSport[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 font-bold text-sky-600 text-xs uppercase tracking-[0.14em] outline-none hover:text-sky-800 focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-4">
        Past Results
        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={26}
        className="w-72 rounded-none border-0 bg-white p-4 shadow-xl ring-0"
      >
        {sports.map((sport) => (
          <DropdownMenuItem key={sport.id} asChild className="rounded-none p-0 focus:bg-slate-100">
            <Link
              href={`/results?sport=${sport.id}`}
              className="block w-full px-4 py-4 font-bold text-2xl text-slate-950 tracking-tight"
            >
              {sport.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
