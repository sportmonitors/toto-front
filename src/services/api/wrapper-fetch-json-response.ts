import { FetchJsonResponse } from "./types/fetch-json-response";
import HTTP_CODES_ENUM from "./types/http-codes";
import { FetchInputType, FetchInitType } from "./types/fetch-params";
import { getTokensInfo } from "../auth/auth-tokens-info";

async function wrapperFetchJsonResponse<T>(config: {
  url: string;
  options?: FetchInitType;
}): Promise<FetchJsonResponse<T>> {
  const tokens = getTokensInfo();

  let headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (tokens?.token) {
    headers = {
      ...headers,
      Authorization: `Bearer ${tokens.token}`,
    };
  }

  const response = await fetch(config.url, {
    ...config.options,
    headers: {
      ...headers,
      ...config.options?.headers,
    },
  });

  const status = response.status as FetchJsonResponse<T>["status"];
  return {
    status,
    data: [
      HTTP_CODES_ENUM.NO_CONTENT,
      HTTP_CODES_ENUM.SERVICE_UNAVAILABLE,
      HTTP_CODES_ENUM.INTERNAL_SERVER_ERROR,
    ].includes(status)
      ? undefined
      : await response.json(),
  };
}

export default wrapperFetchJsonResponse;

// Export the function with a different name for compatibility
export const fetchJsonResponse = wrapperFetchJsonResponse;
