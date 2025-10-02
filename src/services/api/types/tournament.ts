export enum TournamentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  CLOSED = "closed",
  SETTLED = "settled",
  CANCELLED = "cancelled",
}

export enum PrizeDistributionType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export type Tournament = {
  id: string | number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  cutoffTime: string;
  linePrice: number;
  status: TournamentStatus;
  prizeDistributionType: PrizeDistributionType;
  prizeGold?: number;
  prizeSilver?: number;
  prizeBronze?: number;
  prizeGoldPercentage?: number;
  prizeSilverPercentage?: number;
  prizeBronzePercentage?: number;
  minLines: number;
  maxLines: number;
  maxParticipants?: number;
  backgroundImage?: string;
  backgroundColor?: string;
  minValidMatches: number;
  createdAt: string;
  updatedAt: string;
};

