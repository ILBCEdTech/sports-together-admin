"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getTeamColorClass } from "@/lib/team-colors";

type StudentSport = {
  id: number;
  name: string;
  teams: Array<{
    id: number;
    name: string;
    code: string | null;
    players: Array<{
      id: number;
      name: string;
      school_name: string;
      jerseyNo: number | null;
    }>;
  }>;
};

export function StudentRosterTabs({
  sports,
}: {
  sports: StudentSport[];
}) {
  if (sports.length === 0) {
    return (
      <p className="mt-10 text-slate-600">
        No student teams are available.
      </p>
    );
  }

  return (
    <Tabs
      defaultValue={String(sports[0].id)}
      className="mt-10 w-full"
    >
      {/* Sport Tabs */}
      <div className="w-full overflow-x-auto pb-1">
        <TabsList
          className="h-auto min-w-max rounded-none bg-white p-1 shadow-sm"
          aria-label="Choose a sport"
        >
          {sports.map((sport) => (
            <TabsTrigger
              key={sport.id}
              value={String(sport.id)}
              className="
                rounded-none
                px-5
                py-3
                font-bold
                data-[state=active]:bg-sky-700
                data-[state=active]:text-white
              "
            >
              {sport.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Sport Content */}
      {sports.map((sport) => (
        <TabsContent
          key={sport.id}
          value={String(sport.id)}
          className="mt-6 w-full pb-4"
        >
          {/* 
            Team Layout
            Mobile: 1 team per row
            Tablet: 2 teams per row
            Desktop: 4 teams per row

            Team 1 | Team 2 | Team 3 | Team 4
            Team 5 | Team 6 | Team 7 | Team 8
          */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sport.teams.map((team, index) => (
              <article
                key={team.id}
                className="
                  min-w-0
                  overflow-hidden
                  border
                  border-slate-300
                  bg-white
                "
              >
                {/* Team Header */}
                <header
                  className={`px-3 py-2 ${getTeamColorClass(team.name)}`}
                >
                  <div className="text-xs opacity-80">
                    Sr. {index + 1}
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-3">
                    <h2 className="min-w-0 break-words text-lg font-bold leading-tight">
                      {team.name}
                    </h2>

                    {team.code && (
                      <span className="shrink-0 text-xs uppercase opacity-80">
                        {team.code}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm font-semibold leading-tight">
                    {sport.name}
                  </p>
                </header>

                {/* Players Table */}
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9 px-3 font-bold text-slate-700">
                        Name
                      </TableHead>

                      <TableHead className="h-9 w-28 px-3 text-right font-bold text-slate-700">
                        District
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {team.players.length > 0 ? (
                      team.players.map((player) => (
                        <TableRow
                          key={player.id}
                          className="min-h-14 hover:bg-slate-50"
                        >
                          <TableCell className="whitespace-normal break-words px-3 py-3 align-top font-medium text-slate-900">
                            {player.name}
                          </TableCell>

                          <TableCell className="w-28 whitespace-normal break-words px-3 py-3 text-right align-top text-sm text-slate-500">
                            {player.school_name || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={2}
                          className="px-3 py-5 text-center text-slate-500"
                        >
                          No players assigned.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </article>
            ))}
          </div>

          {/* No Teams */}
          {sport.teams.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              No teams are available for {sport.name}.
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
