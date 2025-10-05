import { Bet, MyBetsResponse } from "../types/bet";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

export const getMyBets = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  tournamentId?: number;
}) => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  if (params?.status) {
    searchParams.append("filters", JSON.stringify({ status: params.status }));
  }
  if (params?.tournamentId) {
    searchParams.append(
      "filters",
      JSON.stringify({ tournamentId: params.tournamentId })
    );
  }

  const queryString = searchParams.toString();
  const url = `${API_URL}/v1/bets/my-bets${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return wrapperFetchJsonResponse<MyBetsResponse>(response);
};

export const getBetById = async (betId: number) => {
  const response = await fetch(`${API_URL}/bets/${betId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return wrapperFetchJsonResponse<{ data: Bet }>(response);
};
