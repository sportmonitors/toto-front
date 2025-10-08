"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hallTokenLogin } from "@/services/api/services/hall-auth";
import useAuthActions from "./use-auth-actions";
import useAuthTokens from "./use-auth-tokens";

export default function useHallTokenLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTokenLogin = useCallback(async () => {
    const token = searchParams.get("token");
    const hall = searchParams.get("hall");
    const login = searchParams.get("login");

    if (token && hall && login && !hasProcessed) {
      setHasProcessed(true);
      setIsLoading(true);
      setError(null);

      try {
        const response = await hallTokenLogin({
          token,
          hall: parseInt(hall),
          login,
        });

        // Set tokens and user
        setTokensInfo({
          token: response.token,
          refreshToken: response.refreshToken,
          tokenExpires: response.tokenExpires,
        });
        setUser(response.user);

        // Remove token parameters from URL and redirect to tournaments
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("token");
        newUrl.searchParams.delete("hall");
        newUrl.searchParams.delete("login");

        router.replace(newUrl.pathname + newUrl.search);
      } catch (err: any) {
        console.error("Hall token login error:", err);
        setError(err.message || "Failed to login with token");
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchParams, setTokensInfo, setUser, router, hasProcessed]);

  useEffect(() => {
    handleTokenLogin();
  }, [handleTokenLogin]);

  return { isLoading, error };
}

