"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { teacherLinks } from "./teacher-links";

export function TeachersNav() {
  const pathname = usePathname();
  const active = pathname === "/teachers" || pathname.startsWith("/teachers/");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`group flex items-center gap-2 font-bold text-xs uppercase tracking-[0.14em] outline-none hover:text-sky-900 focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-4 ${active ? "text-sky-700" : "text-slate-500"}`}
      >
        Teachers
        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={26}
        className="w-64 rounded-none border-0 bg-white p-2 shadow-xl ring-0"
      >
        {teacherLinks.map((item) => (
          <DropdownMenuItem key={item.href} asChild className="rounded-none p-0 focus:bg-slate-100">
            <Link href={item.href} className="block w-full px-3 py-3 font-bold text-slate-800 text-sm">
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
