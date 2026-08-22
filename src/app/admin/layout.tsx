import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  CalendarRange,
  FileUp,
  LayoutDashboard,
  MapPin,
  Medal,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import logo from "../../../logo.png";

const links = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Sports", "/admin/sports", Trophy],
  ["Tournaments", "/admin/tournaments", CalendarRange],
  ["Teams", "/admin/teams", UsersRound],
  ["Players", "/admin/players", UserRound],
  ["Fixtures", "/admin/fixtures", CalendarDays],
  ["Venues", "/admin/venues", MapPin],
  ["Results", "/admin/results", Medal],
  ["Import", "/admin/import", FileUp],
] as const;

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-theme min-h-screen bg-muted/30 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-primary/20 border-b bg-background p-4 lg:min-h-screen lg:border-r lg:border-b-0">
        <Link href="/admin/dashboard" className="mb-5 flex items-center gap-2 px-2 font-semibold text-primary">
          <Image src={logo} alt="" className="size-10 shrink-0 object-contain" />
          Sports Together Admin
        </Link>
        <nav aria-label="Admin navigation" className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
          {links.map(([label, href, Icon]) => (
            <Button key={href} asChild variant="ghost" className="justify-start">
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link href="/">View public site</Link>
        </Button>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
