import { Suspense } from "react";
import { FixturesManager } from "./_components/fixtures-manager";

export default function Page() {
  return <Suspense fallback={null}><FixturesManager /></Suspense>;
}
