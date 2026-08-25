export type Fixture = {
  match: string;
  time: string;
  division?: string;
  venue?: string;
  home?: string;
  away?: string;
  activity?: string;
  startAt?: string;
  endAt?: string;
  homePlayers?: string[];
  awayPlayers?: string[];
};

export type SportFixture = {
  slug: string;
  name: string;
  description: string;
  venueLabel: string;
  fixtures: Fixture[];
  lunchTime?: string;
  equipment?: string[];
  officials: string[];
  notes?: string[];
};

export const sports: SportFixture[] = [
  {
    slug: "football",
    name: "Football",
    description: "Two-field schedule across junior and senior male and female divisions.",
    venueLabel: "2 fields",
    fixtures: [],
    lunchTime: "12:00-1:00 PM",
    equipment: ["8 soccer balls", "2 scoreboards", "2 pairs of goal nets"],
    officials: [
      "Match Commissioner: Vladislav Bogushev / Yangon AD",
      "Committee: U Wai Yan Soe",
      "Committee: U Sai Htet Aung",
    ],
    notes: ["4 male teachers and 4 female teachers required", "Finals begin at 6:00 PM"],
  },
  {
    slug: "volleyball",
    name: "Volleyball",
    description: "Separate male and female round-robin schedules.",
    venueLabel: "1 court",
    fixtures: [],
    officials: ["Match Commissioner: Daw Hsu Myat Noe Oo", "Referee: U Zin Min Htet", "Referee: Daw Htar Htar Oo"],
    notes: ["Lunch break: 12:00-1:00 PM"],
  },
  {
    slug: "swimming",
    name: "Swimming",
    description: "Individual preliminaries, finals, and team medley relay events.",
    venueLabel: "4 lanes",
    fixtures: [],
    equipment: ["4-lane swimming pool", "3 bleachers", "Lifeguards and medical staff on standby"],
    officials: ["Match Commissioner: U Htun Lin Zan", "Starter: U Aung Yan Naing", "Five referees assigned"],
    notes: ["1st place: 3 points", "2nd place: 2 points", "3rd place: 1 point"],
  },
  {
    slug: "basketball",
    name: "Basketball",
    description: "Morning senior and afternoon junior tournament sessions.",
    venueLabel: "1 court",
    fixtures: [],
    officials: ["YIS In-charge: U Nay Zaw Aung", "Match Committee: D Zin Nwe Myint"],
    notes: ["Lunch break: 12:00-1:00 PM"],
  },
  {
    slug: "badminton",
    name: "Badminton",
    description: "Parallel male and female doubles fixtures across four courts.",
    venueLabel: "4 courts",
    fixtures: [],
    equipment: ["Shuttlecocks", "Badminton nets"],
    officials: ["G3 In-charge: U Htet Lin Aung", "Match Commissioner: U Nay Lin Htun", "Eight referee positions"],
  },
];

export function getSport(slug: string) {
  return sports.find((sport) => sport.slug === slug);
}
