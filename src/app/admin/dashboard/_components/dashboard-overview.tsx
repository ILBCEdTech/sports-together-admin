import Link from "next/link";

import {
  CalendarDays,
  CalendarRange,
  CircleDot,
  MapPin,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardOverviewData } from "../_lib/dashboard-data";

type DashboardOverviewProps = {
  overview: DashboardOverviewData;
};

const totalCards = [
  { key: "sports", label: "Sports", description: "Configured disciplines", href: "/admin/sports", icon: Trophy },
  {
    key: "tournaments",
    label: "Tournaments",
    description: "All competitions",
    href: "/admin/tournaments",
    icon: CalendarRange,
  },
  { key: "teams", label: "Teams", description: "Registered teams", href: "/admin/teams", icon: UsersRound },
  {
    key: "fixtures",
    label: "Sports events",
    description: "Scheduled fixtures",
    href: "/admin/fixtures",
    icon: CalendarDays,
  },
  { key: "players", label: "Players", description: "Registered athletes", href: "/admin/players", icon: UserRound },
  { key: "venues", label: "Venues", description: "Event locations", href: "/admin/venues", icon: MapPin },
] as const;

export function DashboardOverview({ overview }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-medium text-3xl tracking-tight">Dashboard overview</h1>
        <p className="mt-1 text-muted-foreground">Sports Together tournament operations at a glance.</p>
      </div>

      {!overview.available ? (
        <Alert variant="destructive">
          <CircleDot />
          <AlertTitle>Overview unavailable</AlertTitle>
          <AlertDescription>
            The dashboard could not load data from the Sports Together backend. Check the service and refresh this page.
          </AlertDescription>
        </Alert>
      ) : null}

      <section aria-labelledby="totals-heading">
        <h2 id="totals-heading" className="sr-only">
          Record totals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {totalCards.map(({ key, label, description, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="h-full transition-colors hover:bg-muted/40" size="sm">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                  <CardAction className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-3xl tabular-nums">{overview.totals[key]}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="operations-heading">
        <Card>
          <CardHeader className="border-b">
            <CardTitle id="operations-heading">Current operations</CardTitle>
            <CardDescription>Items that may need attention during tournament administration.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <OperationalStat label="Active sports" value={overview.operations.activeSports} />
            <OperationalStat label="Ongoing tournaments" value={overview.operations.ongoingTournaments} active />
            <OperationalStat label="Upcoming tournaments" value={overview.operations.upcomingTournaments} />
            <OperationalStat label="Live events" value={overview.operations.liveFixtures} active />
            <OperationalStat label="Scheduled events" value={overview.operations.scheduledFixtures} />
            <OperationalStat label="Pending results" value={overview.operations.pendingResults} attention />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function OperationalStat({
  label,
  value,
  active = false,
  attention = false,
}: {
  label: string;
  value: number;
  active?: boolean;
  attention?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant={attention && value > 0 ? "destructive" : active && value > 0 ? "default" : "secondary"}>
        {value}
      </Badge>
    </div>
  );
}
