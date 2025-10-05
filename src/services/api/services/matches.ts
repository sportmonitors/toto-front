import { Match } from "../types/match";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

export const getMatches = async (params?: {
  page?: number;
  limit?: number;
  tournamentId?: string | number;
}) => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    searchParams.append("limit", params.limit.toString());
  }
  if (params?.tournamentId) {
    searchParams.append(
      "filters",
      JSON.stringify({ tournamentId: params.tournamentId })
    );
  }

  const url = `${API_URL}/v1/matches${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return wrapperFetchJsonResponse<{
    data: Match[];
    hasNextPage: boolean;
  }>({
    url,
    options: {
      method: "GET",
    },
  });
};

export const getMatchesByTournament = async (tournamentId: string | number) => {
  return wrapperFetchJsonResponse<Match[]>({
    url: `${API_URL}/v1/matches/tournament/${tournamentId}`,
    options: {
      method: "GET",
    },
  });
};

export const getMatch = async (id: string | number) => {
  return wrapperFetchJsonResponse<Match>({
    url: `${API_URL}/v1/matches/${id}`,
    options: {
      method: "GET",
    },
  });
};

export const createMatch = async (data: Partial<Match>) => {
  return wrapperFetchJsonResponse<Match>({
    url: `${API_URL}/v1/matches`,
    options: {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
};

export const updateMatch = async (
  id: string | number,
  data: Partial<Match>
) => {
  return wrapperFetchJsonResponse<Match>({
    url: `${API_URL}/v1/matches/${id}`,
    options: {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
};

export const setMatchResult = async (
  id: string | number,
  data: {
    result: string;
    homeScore?: number;
    awayScore?: number;
    status?: string;
  }
) => {
  return wrapperFetchJsonResponse<Match>({
    url: `${API_URL}/v1/matches/${id}/result`,
    options: {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
};
