import { Tournament, TournamentStatus } from "../types/tournament";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

export const getTournaments = async (params?: {
  page?: number;
  limit?: number;
  status?: TournamentStatus;
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

  const url = `${API_URL}/v1/tournaments${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return wrapperFetchJsonResponse<{
    data: Tournament[];
    hasNextPage: boolean;
  }>({
    url,
    options: {
      method: "GET",
    },
  });
};

export const getTournament = async (id: string | number) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments/${id}`,
    options: {
      method: "GET",
    },
  });
};

export const getActiveTournaments = async () => {
  return wrapperFetchJsonResponse<Tournament[]>({
    url: `${API_URL}/v1/tournaments/active`,
    options: {
      method: "GET",
    },
  });
};

export const getTournamentById = async (id: number) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments/${id}`,
    options: {
      method: "GET",
    },
  });
};

export const createTournament = async (data: Partial<Tournament>) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments`,
    options: {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
};

export const updateTournament = async (
  id: string | number,
  data: Partial<Tournament>
) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments/${id}`,
    options: {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
};

export const deleteTournament = async (id: string | number) => {
  return wrapperFetchJsonResponse<void>({
    url: `${API_URL}/v1/tournaments/${id}`,
    options: {
      method: "DELETE",
    },
  });
};

export const activateTournament = async (id: string | number) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments/${id}/activate`,
    options: {
      method: "POST",
    },
  });
};

export const closeTournament = async (id: string | number) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments/${id}/close`,
    options: {
      method: "POST",
    },
  });
};

export const settleTournament = async (id: string | number) => {
  return wrapperFetchJsonResponse<Tournament>({
    url: `${API_URL}/v1/tournaments/${id}/settle`,
    options: {
      method: "POST",
    },
  });
};
