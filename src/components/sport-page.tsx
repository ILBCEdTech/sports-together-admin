import { CalendarDays, MapPin, ShieldCheck, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SportFixture } from "@/lib/fixture-data";

export function SportPage({ sport }: { sport: SportFixture }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Badge variant="outline">Sports Together 2026–27</Badge>
          <h1 className="font-medium text-2xl tracking-tight sm:text-3xl">{sport.name} fixtures</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">{sport.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <CalendarDays />
            {sport.fixtures.length} scheduled entries
          </Badge>
          <Badge variant="secondary">
            <MapPin />
            {sport.venueLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Event schedule</CardTitle>
            <CardDescription>Times and pairings transcribed from the supplied fixture workbook.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Match</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Division / event</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Fixture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sport.fixtures.map((fixture, index) => (
                  <TableRow key={`${fixture.match}-${fixture.venue}-${index}`}>
                    <TableCell className="pl-4 font-medium">{fixture.match}</TableCell>
                    <TableCell>{fixture.time}</TableCell>
                    <TableCell>{fixture.division ?? fixture.activity}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fixture.venue}</Badge>
                    </TableCell>
                    <TableCell>
                      {fixture.home && fixture.away ? `${fixture.home} vs ${fixture.away}` : fixture.activity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {sport.equipment && (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-4" />
                  Equipment & setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  {sport.equipment.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Officials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground text-sm">
                {sport.officials.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {sport.notes && (
            <Card size="sm">
              <CardHeader>
                <CardTitle>Event notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  {sport.notes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
