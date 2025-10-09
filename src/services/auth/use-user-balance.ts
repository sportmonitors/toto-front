"use client";

import { useState, useEffect } from "react";
import useAuthTokens from "./use-auth-tokens";

interface UserBalance {
  balance: number;
  lockedBalance: number;
}

export default function useUserBalance() {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tokensInfo } = useAuthTokens();

  const fetchBalance = async () => {
    if (!tokensInfo?.token) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/user-balances/me`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokensInfo.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBalance(data);
    } catch (err: any) {
      console.error("Failed to fetch user balance:", err);
      setError(err.message || "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [tokensInfo?.token]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
