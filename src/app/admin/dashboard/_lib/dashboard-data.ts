import "server-only";

import { cookies } from "next/headers";

export type DashboardOverviewData = {
  available: boolean;
  totals: {
    sports: number;
    tournaments: number;
    teams: number;
    fixtures: number;
    players: number;
    venues: number;
  };
  operations: {
    activeSports: number;
    ongoingTournaments: number;
    upcomingTournaments: number;
    liveFixtures: number;
    scheduledFixtures: number;
    pendingResults: number;
  };
};

const emptyOverview: DashboardOverviewData = {
  available: false,
  totals: { sports: 0, tournaments: 0, teams: 0, fixtures: 0, players: 0, venues: 0 },
  operations: {
    activeSports: 0,
    ongoingTournaments: 0,
    upcomingTournaments: 0,
    liveFixtures: 0,
    scheduledFixtures: 0,
    pendingResults: 0,
  },
};

export async function getDashboardOverview(): Promise<DashboardOverviewData> {
  const accessToken = (await cookies()).get("admin_access_token")?.value;
  if (!accessToken) return emptyOverview;

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return emptyOverview;

    const overview = (await response.json()) as Omit<DashboardOverviewData, "available">;
    return { available: true, ...overview };
  } catch {
    return emptyOverview;
  }
}
