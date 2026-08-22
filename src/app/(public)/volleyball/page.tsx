import { SportPage } from "@/components/sport-page";
import { getSport } from "@/lib/fixture-data";
export default function Page() {
  return <SportPage sport={getSport("volleyball")!} />;
}
