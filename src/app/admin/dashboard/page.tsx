import { DashboardOverview } from "./_components/dashboard-overview";
import { getDashboardOverview } from "./_lib/dashboard-data";

export default async function Page() {
  const overview = await getDashboardOverview();

  return <DashboardOverview overview={overview} />;
}
