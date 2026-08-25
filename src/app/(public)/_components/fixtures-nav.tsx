import { sports } from "@/lib/fixture-data";

import { FixturesMenu } from "./fixtures-menu";

export function FixturesNav() {
  return (
    <FixturesMenu
      sports={sports.map((sport) => ({
        slug: sport.slug,
        name: sport.name,
        description: sport.description,
        venueLabel: sport.venueLabel,
        fixtureCount: sport.fixtures.length,
      }))}
    />
  );
}
