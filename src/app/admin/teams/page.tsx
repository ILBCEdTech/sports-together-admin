import { Suspense } from "react";
import { TeamsManager } from "./_components/teams-manager";

export default function Page() {
  return <Suspense fallback={null}><TeamsManager /></Suspense>;
}
