import Link from "next/link";

import { ArrowRight, CalendarDays, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sports } from "@/lib/fixture-data";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4 py-10 sm:py-16">
        <Badge variant="outline">2026–27 event program</Badge>
        <h1 className="max-w-3xl font-semibold text-4xl tracking-tight sm:text-6xl">
          Every team. Every fixture. Together.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Schedules and results for all five Sports Together competitions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/fixtures">
              View fixtures <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/results">View results</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {sports.map((sport) => (
          <Card key={sport.slug}>
            <CardHeader>
              <CardTitle>{sport.name}</CardTitle>
              <CardDescription>{sport.venueLabel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarDays className="size-4" />
                {sport.fixtures.length} entries
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${sport.slug}`}>Open sport</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <Trophy className="size-4" />
        Five sports, one event program.
      </p>
    </div>
  );
}
