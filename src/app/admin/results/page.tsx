import { Suspense } from "react";
import { ResultsManager } from "./_components/results-manager";

export default function Page() {
  return <Suspense fallback={null}><ResultsManager /></Suspense>;
}
