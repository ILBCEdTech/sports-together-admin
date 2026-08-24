import { Suspense } from "react";
import { VenuesManager } from "./_components/venues-manager";

export default function Page() {
  return <Suspense fallback={null}><VenuesManager /></Suspense>;
}
