import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Sports Together",
  version: packageJson.version,
  copyright: `© ${currentYear}, Studio Admin.`,
  meta: {
    title: "Sports Together",
    description: "Fixtures, results, teams, and tournament administration for Sports Together.",
  },
};
