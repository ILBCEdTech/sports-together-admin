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

const footballRounds = [
  ["8:00-8:40 AM", "Female Jr", "Team I", "Team L", "Team B", "Team C"],
  ["8:40-9:20 AM", "Male Jr", "Team C", "Team L", "Team B", "Team I"],
  ["9:20-10:00 AM", "Female Sr", "Team C", "Team I", "Team L", "Team B"],
  ["10:00-10:40 AM", "Male Sr", "Team L", "Team I", "Team C", "Team B"],
  ["10:40-11:20 AM", "Female Jr", "Team I", "Team B", "Team L", "Team C"],
  ["11:20-12:00 PM", "Male Jr", "Team L", "Team B", "Team C", "Team I"],
  ["1:00-1:40 PM", "Female Sr", "Team C", "Team B", "Team C", "Team B"],
  ["1:40-2:20 PM", "Male Sr", "Team L", "Team C", "Team L", "Team I"],
  ["2:20-3:00 PM", "Female Jr", "Team C", "Team I", "Team L", "Team B"],
  ["3:00-3:40 PM", "Male Jr", "Team L", "Team I", "Team C", "Team B"],
  ["3:40-4:20 PM", "Female Sr", "Team I", "Team B", "Team L", "Team C"],
  ["4:20-5:00 PM", "Male Sr", "Team C", "Team I", "Team L", "Team B"],
];

const footballFixtures: Fixture[] = footballRounds.flatMap((round, index) => [
  {
    match: index < 4 ? "Match 1" : index < 8 ? "Match 2" : "Match 3",
    time: round[0],
    division: round[1],
    venue: "Field 1",
    home: round[2],
    away: round[3],
  },
  {
    match: index < 4 ? "Match 1" : index < 8 ? "Match 2" : "Match 3",
    time: round[0],
    division: round[1],
    venue: "Field 2",
    home: round[4],
    away: round[5],
  },
]);

footballFixtures.push(
  {
    match: "Final",
    time: "5:30-6:30 PM",
    division: "Male Sr",
    venue: "Field 1",
    home: "Group Winner",
    away: "Group Winner",
  },
  {
    match: "Final",
    time: "5:30-6:30 PM",
    division: "Female Sr",
    venue: "Field 2",
    home: "Group Winner",
    away: "Group Winner",
  },
);

const volleyballFixtures: Fixture[] = [
  ["Match 1", "8:00-8:45 AM", "Male", "Team I", "Team L"],
  ["Match 2", "8:50-9:35 AM", "Male", "Team B", "Team C"],
  ["Match 3", "9:40-10:25 AM", "Male", "Team L", "Team B"],
  ["Match 4", "10:30-11:25 AM", "Male", "Team I", "Team C"],
  ["Match 5", "1:00-1:45 PM", "Male", "Team B", "Team I"],
  ["Match 6", "1:50-2:35 PM", "Male", "Team L", "Team C"],
  ["Match 1", "8:00-8:30 AM", "Female", "Team I", "Team L"],
  ["Match 2", "8:35-9:05 AM", "Female", "Team B", "Team C"],
  ["Match 3", "9:10-9:45 AM", "Female", "Team L", "Team B"],
  ["Match 4", "9:50-10:20 AM", "Female", "Team I", "Team C"],
  ["Match 5", "10:25-10:55 AM", "Female", "Team B", "Team I"],
  ["Match 6", "11:00-11:30 AM", "Female", "Team L", "Team C"],
].map(([match, time, division, home, away]) => ({ match, time, division, home, away, venue: "Volleyball court" }));

const swimmingFixtures: Fixture[] = [
  ["8:30-9:00 AM", "Male Freestyle preliminary — 4 rounds"],
  ["9:00-9:15 AM", "Male Freestyle final — top 4"],
  ["9:15-9:30 AM", "Male Backstroke preliminary — 4 rounds"],
  ["9:30-9:45 AM", "Male Backstroke final — top 4"],
  ["9:45-10:00 AM", "Male Breaststroke preliminary — 4 rounds"],
  ["10:00-10:15 AM", "Male Breaststroke final — top 4"],
  ["10:15-10:20 AM", "Male Butterfly preliminary — 2 rounds"],
  ["10:20-10:30 AM", "Male Butterfly final — top 4"],
  ["10:30-11:00 AM", "Male team medley relay"],
  ["11:00-11:30 AM", "Record review and awards selection"],
  ["12:00-1:25 PM", "Lunch break"],
  ["1:30-2:00 PM", "Female Freestyle preliminary — 4 rounds"],
  ["2:00-2:15 PM", "Female Freestyle final — top 4"],
  ["2:15-2:30 PM", "Female Backstroke preliminary — 4 rounds"],
  ["2:30-2:45 PM", "Female Backstroke final — top 4"],
  ["2:45-3:20 PM", "Female Breaststroke preliminary — 4 rounds"],
  ["3:20-3:30 PM", "Female Breaststroke final — top 4"],
  ["3:30-3:40 PM", "Female Butterfly preliminary — 2 rounds"],
  ["3:40-3:45 PM", "Female Butterfly final — top 4"],
  ["3:45-4:00 PM", "Female team medley relay"],
  ["4:00-4:30 PM", "Record review and awards selection"],
].map(([time, activity], index) => ({ match: `Event ${index + 1}`, time, activity, venue: "Swimming pool" }));

const basketballTeams = [
  ["Team I", "Team L"],
  ["Team B", "Team C"],
  ["Team I", "Team L"],
  ["Team B", "Team C"],
  ["Team I", "Team L"],
  ["Team B", "Team C"],
  ["Team I", "Team L"],
  ["Team B", "Team C"],
  ["Team I", "Team B"],
  ["Team L", "Team C"],
  ["Team I", "Team B"],
  ["Team L", "Team C"],
  ["Team I", "Team B"],
  ["Team L", "Team C"],
  ["Team I", "Team B"],
  ["Team L", "Team C"],
  ["Team I", "Team C"],
  ["Team L", "Team B"],
  ["Team I", "Team C"],
  ["Team L", "Team B"],
  ["Team I", "Team C"],
  ["Team L", "Team B"],
  ["Team I", "Team C"],
  ["Team L", "Team B"],
];
const basketballTimes = [
  "8:00-8:16 AM",
  "8:21-8:37 AM",
  "8:42-8:58 AM",
  "9:03-9:19 AM",
  "9:24-9:40 AM",
  "9:45-10:01 AM",
  "10:06-10:22 AM",
  "10:27-10:43 AM",
  "10:48-11:04 AM",
  "11:09-11:25 AM",
  "11:30-11:46 AM",
  "11:51 AM-12:07 PM",
  "1:00-1:16 PM",
  "1:21-1:37 PM",
  "1:42-1:58 PM",
  "2:03-2:19 PM",
  "2:24-2:40 PM",
  "2:45-3:01 PM",
  "3:06-3:22 PM",
  "3:27-3:43 PM",
  "3:48-4:04 PM",
  "4:09-4:25 PM",
  "4:30-4:46 PM",
  "4:51-5:07 PM",
];
const basketballDivisions = [
  "Male Sr",
  "Male Sr",
  "Female Sr",
  "Female Sr",
  "Male Jr",
  "Male Jr",
  "Female Jr",
  "Female Jr",
  "Male Sr",
  "Male Sr",
  "Female Sr",
  "Female Sr",
  "Male Jr",
  "Male Jr",
  "Female Jr",
  "Female Jr",
  "Male Sr",
  "Male Sr",
  "Female Sr",
  "Female Sr",
  "Male Jr",
  "Male Jr",
  "Female Jr",
  "Female Jr",
];
const basketballFixtures: Fixture[] = basketballTimes.map((time, index) => ({
  match: `Match ${index + 1}`,
  time,
  division: basketballDivisions[index],
  venue: "Basketball court",
  home: basketballTeams[index][0],
  away: basketballTeams[index][1],
}));

const badmintonTimes = [
  "8:00-8:15 AM",
  "8:20-8:35 AM",
  "8:40-8:55 AM",
  "9:00-9:15 AM",
  "9:20-9:35 AM",
  "9:40-9:55 AM",
  "10:00-10:15 AM",
  "10:20-10:35 AM",
  "10:40-10:55 AM",
  "11:00-11:15 AM",
  "1:00-1:15 PM",
  "1:20-1:35 PM",
  "1:40-1:55 PM",
  "2:00-2:15 PM",
  "2:20-2:35 PM",
  "2:40-2:55 PM",
  "3:00-3:15 PM",
  "3:20-3:35 PM",
];
const badmintonFixtures: Fixture[] = badmintonTimes.flatMap((time, index) => {
  const firstHalf = index < 6;
  const middle = index >= 6 && index < 10;
  const pairA = firstHalf ? ["Team I", "Team L"] : middle ? ["Team I", "Team B"] : ["Team I", "Team C"];
  const pairB = firstHalf ? ["Team B", "Team C"] : middle ? ["Team L", "Team C"] : ["Team B", "Team L"];
  return [
    {
      match: `Match ${index + 1}`,
      time,
      division: "Male",
      venue: "Court 1",
      home: pairA[0],
      away: pairA[1],
    },
    {
      match: `Match ${index + 1}`,
      time,
      division: "Male",
      venue: "Court 2",
      home: pairB[0],
      away: pairB[1],
    },
    {
      match: `Match ${index + 1}`,
      time,
      division: "Female",
      venue: "Court 3",
      home: pairA[0],
      away: pairA[1],
    },
    {
      match: `Match ${index + 1}`,
      time,
      division: "Female",
      venue: "Court 4",
      home: pairB[0],
      away: pairB[1],
    },
  ];
});

export const sports: SportFixture[] = [
  {
    slug: "football",
    name: "Football",
    description: "Two-field schedule across junior and senior male and female divisions.",
    venueLabel: "2 fields",
    fixtures: footballFixtures,
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
    fixtures: volleyballFixtures,
    officials: ["Match Commissioner: Daw Hsu Myat Noe Oo", "Referee: U Zin Min Htet", "Referee: Daw Htar Htar Oo"],
    notes: ["Lunch break: 12:00-1:00 PM"],
  },
  {
    slug: "swimming",
    name: "Swimming",
    description: "Individual preliminaries, finals, and team medley relay events.",
    venueLabel: "4 lanes",
    fixtures: swimmingFixtures,
    equipment: ["4-lane swimming pool", "3 bleachers", "Lifeguards and medical staff on standby"],
    officials: ["Match Commissioner: U Htun Lin Zan", "Starter: U Aung Yan Naing", "Five referees assigned"],
    notes: ["1st place: 3 points", "2nd place: 2 points", "3rd place: 1 point"],
  },
  {
    slug: "basketball",
    name: "Basketball",
    description: "Morning senior and afternoon junior tournament sessions.",
    venueLabel: "1 court",
    fixtures: basketballFixtures,
    officials: ["YIS In-charge: U Nay Zaw Aung", "Match Committee: D Zin Nwe Myint"],
    notes: ["Lunch break: 12:00-1:00 PM"],
  },
  {
    slug: "badminton",
    name: "Badminton",
    description: "Parallel male and female doubles fixtures across four courts.",
    venueLabel: "4 courts",
    fixtures: badmintonFixtures,
    equipment: ["Shuttlecocks", "Badminton nets"],
    officials: ["G3 In-charge: U Htet Lin Aung", "Match Commissioner: U Nay Lin Htun", "Eight referee positions"],
  },
];

export function getSport(slug: string) {
  return sports.find((sport) => sport.slug === slug);
}
