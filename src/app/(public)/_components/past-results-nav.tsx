import { getPublicSports } from "../_lib/sports";
import { sportSlug } from "../results/_lib/results-data";
import { ActiveNavLink } from "./active-nav-link";
import { PastResultsMenu } from "./past-results-menu";

export async function PastResultsNav() {
  try {
    const sports = (await getPublicSports())
      .filter((sport) => sport.is_active)
      .sort((left, right) => left.name.localeCompare(right.name));

    if (sports.length > 0) {
      return <PastResultsMenu sports={sports.map((sport) => ({ ...sport, slug: sportSlug(sport.name) }))} />;
    }
  } catch {
    // Keep navigation available when the public sports API cannot be reached.
  }

  return <ActiveNavLink label="Results" href="/results" />;
}
