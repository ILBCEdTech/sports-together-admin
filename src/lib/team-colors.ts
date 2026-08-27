const teamColorClasses: Record<string, string> = {
  "Team I": "bg-[#FFFF00] text-slate-950",
  "Team L": "bg-[#92D050] text-slate-950",
  "Team B": "bg-[#FF0000] text-white",
  "Team C": "bg-[#0070C0] text-white",
};

export function getTeamColorClass(teamName: string) {
  const normalizedName = teamName.trim().toLowerCase();
  const teamCode = Object.keys(teamColorClasses).find((name) => {
    const normalizedCode = name.toLowerCase();
    return normalizedName === normalizedCode || normalizedName.startsWith(`${normalizedCode} `);
  });

  return teamCode ? teamColorClasses[teamCode] : "bg-slate-100 text-slate-950";
}
