export enum MatchStatus {
  SCHEDULED = "scheduled",
  LIVE = "live",
  FINISHED = "finished",
  CANCELLED = "cancelled",
  POSTPONED = "postponed",
}

export enum MatchResult {
  HOME = "1",
  DRAW = "X",
  AWAY = "2",
}

export enum SportType {
  FOOTBALL = "football",
  VOLLEYBALL = "volleyball",
  BASKETBALL = "basketball",
}

export type Match = {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
  startsAt: string;
  sportType: SportType;
  status: MatchStatus;
  result?: MatchResult;
  homeScore?: number;
  awayScore?: number;
  matchOrder: number;
  tournamentId: string | number;
  createdAt: string;
  updatedAt: string;
};
