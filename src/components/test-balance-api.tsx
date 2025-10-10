"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Chip } from "@mui/material";
import { AccountBalanceWallet, Refresh } from "@mui/icons-material";
import useAuth from "@/services/auth/use-auth";
import useFetch from "@/services/api/use-fetch";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";

export default function TestBalanceAPI() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const fetchBase = useFetch();
  const [tokensFromStorage, setTokensFromStorage] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const tokens = getTokensInfo();
    setTokensFromStorage(tokens);
  }, []);

  const fetchBalance = async () => {
    const currentTokens = tokensFromStorage;

    if (!currentTokens?.token) {
      setError("No token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "Fetching balance with token:",
        currentTokens.token.substring(0, 10) + "..."
      );

      // Use the standard useFetch hook
      const response = await fetchBase(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/user-balances/my-balance`,
        {
          method: "GET",
        }
      );

      console.log("API Response status:", response.status);

      const data = await response.json();
      setApiResponse(data);
      console.log("API Response data:", data);

      if (response.ok) {
        setBalance(data.balance || 0);
        setError(null);
      } else {
        setError(
          `API Error: ${response.status} - ${data.message || "Unknown error"}`
        );
        setBalance(null);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(`Network Error: ${err.message}`);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted) return;

    const currentTokens = tokensFromStorage;
    if (currentTokens?.token) {
      fetchBalance();
    }
  }, [tokensFromStorage?.token, isMounted]);

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(0, 100, 0, 0.9)",
        color: "white",
        border: "3px solid green",
        maxWidth: "400px",
      }}
    >
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalanceWallet sx={{ fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold">
            Balance API Test
          </Typography>
          <Chip
            label={
              isMounted
                ? tokensFromStorage?.token
                  ? "TOKEN"
                  : "NO TOKEN"
                : "LOADING..."
            }
            size="small"
            color={
              isMounted
                ? tokensFromStorage?.token
                  ? "success"
                  : "error"
                : "default"
            }
            sx={{ ml: "auto" }}
          />
        </Box>

        <Box>
          <Typography variant="body2" color="white">
            Status: {loading ? "Loading..." : error ? "Error" : "Success"}
          </Typography>

          {balance !== null && (
            <Typography variant="h6" color="white" fontWeight="bold">
              Balance: ${balance}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="red" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>

        {apiResponse && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="white">
              API Response: {JSON.stringify(apiResponse, null, 2)}
            </Typography>
          </Box>
        )}

        <Button
          size="small"
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchBalance}
          disabled={loading || !isMounted || !tokensFromStorage?.token}
          sx={{
            backgroundColor: "white",
            color: "green",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
          }}
        >
          {loading ? "Loading..." : "Refresh Balance"}
        </Button>
      </Box>
    </Paper>
  );
}
