"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const teamHeaderClasses = [
  "bg-blue-600 text-white",
  "bg-lime-500 text-slate-950",
  "bg-red-500 text-white",
  "bg-yellow-300 text-slate-950",
  "bg-sky-600 text-white",
] as const;

export function StudentRosterTabs({ sports }: { sports: StudentSport[] }) {
  if (sports.length === 0) return <p className="mt-10 text-slate-600">No student teams are available.</p>;

  return (
    <Tabs defaultValue={String(sports[0].id)} className="mt-10">
      <div className="overflow-x-auto pb-1">
        <TabsList className="h-auto min-w-max rounded-none bg-white p-1 shadow-sm" aria-label="Choose a sport">
          {sports.map((sport) => (
            <TabsTrigger
              key={sport.id}
              value={String(sport.id)}
              className="rounded-none px-5 py-3 font-bold data-active:bg-sky-700 data-active:text-white"
            >
              {sport.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {sports.map((sport) => (
        <TabsContent key={sport.id} value={String(sport.id)} className="mt-6 overflow-x-auto pb-4">
          <div className="grid w-max grid-flow-col auto-cols-[18rem] border-slate-300 border-t border-l">
            {sport.teams.map((team, index) => (
              <article key={team.id} className="border-slate-300 border-r border-b">
                <header className={`px-3 py-2 ${teamHeaderClasses[index % teamHeaderClasses.length]}`}>
                  <div className="text-xs opacity-80">Sr. {index + 1}</div>
                  <div className="mt-0.5 flex items-center justify-between gap-3">
                    <h2 className="font-bold text-lg leading-tight">{team.name}</h2>
                    {team.code && <span className="text-xs uppercase opacity-80">{team.code}</span>}
                  </div>
                  <p className="mt-0.5 font-semibold text-sm leading-tight">{sport.name}</p>
                </header>

                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9 px-3 font-bold text-slate-700">Name</TableHead>
                      <TableHead className="h-9 w-20 px-3 text-right font-bold text-slate-700">District</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.players.length > 0 ? (
                      team.players.map((player) => (
                        <TableRow key={player.id} className="h-14 hover:bg-slate-50">
                          <TableCell className="whitespace-normal px-3 py-2 font-medium text-slate-900">
                            {player.name}
                          </TableCell>
                          <TableCell className="w-20 px-3 py-2 text-right text-slate-500">
                            {player.school_name || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={2} className="px-3 py-5 text-slate-500">
                          No players assigned.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </article>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
