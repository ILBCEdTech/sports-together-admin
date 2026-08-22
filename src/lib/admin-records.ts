export type VenueType = "FIELD" | "COURT" | "POOL" | "HALL" | "OTHER";
export type FixtureStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "POSTPONED";
export type TournamentStatus = "UPCOMING" | "ONGOING" | "COMPLETED";
export type PlayerRecord = {
  id: number;
  name: string;
  school_name: string;
  created_at: string;
  updated_at: string;
};

export type TeamRecord = {
  id: number;
  name: string;
  code: string | null;
  sport_id: number;
  created_at: string;
  updated_at: string;
};

export type TeamPlayerRecord = {
  team_id: number;
  player_id: number;
  jersey_no: number | null;
};

export type FixtureTeamRecord = { fixture_id: number; team_id: number; side: "HOME" | "AWAY" };
export type FixturePlayerRecord = { fixture_id: number; team_id: number; player_id: number };

export type TournamentRecord = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  created_at: string;
  updated_at: string;
};

export type VenueRecord = {
  id: number;
  name: string;
  type: VenueType;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type OfficialRecord = {
  id: number;
  name: string;
  role: string | null;
  contact: string | null;
  created_at: string;
  updated_at: string;
};

export type FixtureRecord = {
  id: number;
  tournament_id: number;
  sport_id: number;
  venue_id: number | null;
  match_number: string | null;
  round: string | null;
  start_at: string;
  end_at: string | null;
  status: FixtureStatus;
  created_at: string;
  updated_at: string;
};

export type ResultStatus = "PENDING" | "FINAL";

export type ResultRecord = {
  id: number;
  fixture_id: number;
  winner_team_id: number | null;
  team_a_score: number | null;
  team_b_score: number | null;
  status: ResultStatus;
  remark: string | null;
  created_at: string;
  updated_at: string;
};
