import { Suspense } from "react";
import { PlayersManager } from "./_components/players-manager";

export default function Page() {
  return <Suspense fallback={null}><PlayersManager /></Suspense>;
}
