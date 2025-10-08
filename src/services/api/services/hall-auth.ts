const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface HallTokenLoginRequest {
  token: string;
  hall: number;
  login: string;
}

export interface HallTokenLoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: any;
}

export const hallTokenLogin = async (
  data: HallTokenLoginRequest
): Promise<HallTokenLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/hall/token-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-custom-lang": "en",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result as HallTokenLoginResponse;
};
