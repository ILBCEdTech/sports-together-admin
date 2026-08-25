import type { Metadata } from "next";

import { FixturesOverview } from "./_components/fixtures-overview";

export const metadata: Metadata = {
  title: "Fixtures | ILBC Sports",
  description: "Explore the complete ILBC tournament schedule by sport.",
};

export default function FixturesPage() {
  return <FixturesOverview />;
}
