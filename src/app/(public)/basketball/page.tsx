import { notFound } from "next/navigation";

import { SportPage } from "@/components/sport-page";
import { getSport } from "@/lib/fixture-data";

export default function Page() {
  const sport = getSport("basketball");
  if (!sport) notFound();

  return <SportPage sport={sport} />;
}
