import { User } from "./user";
import { Tournament } from "./tournament";
import { Match } from "./match";

export interface BetSelection {
  id: number;
  betId: number;
  matchId: number;
  selectedResults: string[];
  isWinning: boolean;
  bet: string;
  match: Match;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface Bet {
  id: number;
  userId: number;
  tournamentId: number;
  totalLines: number;
  totalAmount: number;
  linePrice: number;
  status: string;
  wrongPredictions: number;
  prizeGroup: string;
  prizeAmount: number;
  isPaid: boolean;
  user: User;
  tournament: Tournament;
  selections: BetSelection[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface MyBetsResponse {
  data: Bet[];
}

