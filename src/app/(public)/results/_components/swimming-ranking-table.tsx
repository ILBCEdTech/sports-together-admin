"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RankingTeam = {
  id: number;
  name: string;
  ranking: number;
};

type SortKey = "ranking" | "team";

export function SwimmingRankingTable({ teams }: { teams: RankingTeam[] }) {
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>({ key: "ranking", ascending: true });
  const sortedTeams = useMemo(() => {
    return [...teams].sort((left, right) => {
      const comparison = sort.key === "ranking" ? left.ranking - right.ranking : left.name.localeCompare(right.name);
      return sort.ascending ? comparison : -comparison;
    });
  }, [sort, teams]);

  function toggleSort(key: SortKey) {
    setSort((current) => ({ key, ascending: current.key === key ? !current.ascending : true }));
  }

  return (
    <Table className="bg-white text-base sm:text-lg">
      <TableHeader className="bg-sky-100">
        <TableRow className="hover:bg-sky-100">
          <TableHead className="h-14 w-1/2 p-0">
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full justify-between rounded-none px-3 font-black text-base text-slate-950 hover:bg-sky-200 sm:px-5 sm:text-lg"
              onClick={() => toggleSort("ranking")}
            >
              Ranking
              <ChevronsUpDown className="size-5 text-slate-400" aria-hidden="true" />
            </Button>
          </TableHead>
          <TableHead className="h-14 w-1/2 p-0">
            <Button
              type="button"
              variant="ghost"
              className="h-14 w-full justify-between rounded-none px-3 font-black text-base text-slate-950 hover:bg-sky-200 sm:px-5 sm:text-lg"
              onClick={() => toggleSort("team")}
            >
              Team
              <ChevronsUpDown className="size-5 text-slate-400" aria-hidden="true" />
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTeams.map((team) => (
          <TableRow key={team.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100">
            <TableCell className="h-14 px-3 sm:px-5">{team.ranking}</TableCell>
            <TableCell className="h-14 px-3 font-medium sm:px-5">{team.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
