import { fetchJsonResponse } from "../wrapper-fetch-json-response";
import {
  Bet,
  CreateBetRequest,
  CreateBetResponse,
  GetBetsParams,
} from "../types/bet";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const createBet = async (
  betData: CreateBetRequest,
  token: string
): Promise<CreateBetResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/bets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-custom-lang": "en",
    },
    body: JSON.stringify(betData),
  });

  return fetchJsonResponse<CreateBetResponse>(response);
};

export const getBets = async (
  token: string,
  params?: GetBetsParams
): Promise<{ data: Bet[]; meta: any }> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.tournamentId)
    searchParams.append("tournamentId", params.tournamentId.toString());

  const url = `${API_BASE_URL}/v1/bets${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-custom-lang": "en",
    },
  });

  return fetchJsonResponse<{ data: Bet[]; meta: any }>(response);
};

export const getMyBets = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    tournamentId?: number;
  }
): Promise<{ data: Bet[]; meta: any }> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.tournamentId)
    searchParams.append("tournamentId", params.tournamentId.toString());

  const url = `${API_BASE_URL}/v1/bets/my-bets${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-custom-lang": "en",
    },
  });

  return fetchJsonResponse<{ data: Bet[]; meta: any }>(response);
};

export const getBetById = async (
  betId: string,
  token: string
): Promise<{ data: Bet }> => {
  const response = await fetch(`${API_BASE_URL}/v1/bets/${betId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-custom-lang": "en",
    },
  });

  return fetchJsonResponse<{ data: Bet }>(response);
};
