"use client";

import { useState, useEffect } from "react";
import useAuthTokens from "./use-auth-tokens";

interface UserProfile {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  balance: {
    balance: number;
    lockedBalance: number;
  };
}

export default function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tokensInfo } = useAuthTokens();

  const fetchProfile = async () => {
    if (!tokensInfo?.token) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user info and balance in parallel
      const [userResponse, balanceResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokensInfo.token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/user-balances/my-balance`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokensInfo.token}`,
              "Content-Type": "application/json",
            },
          }
        )
      ]);

      if (userResponse.ok && balanceResponse.ok) {
        const [userData, balanceData] = await Promise.all([
          userResponse.json(),
          balanceResponse.json()
        ]);

        setProfile({
          user: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
          },
          balance: {
            balance: balanceData.balance || 0,
            lockedBalance: balanceData.lockedBalance || 0,
          }
        });
      } else {
        throw new Error("Failed to fetch user profile data");
      }
    } catch (err: any) {
      console.error("Failed to fetch user profile:", err);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [tokensInfo?.token]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}
