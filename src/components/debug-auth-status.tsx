"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Chip, Divider } from "@mui/material";
import { Person, VpnKey, Storage, Refresh } from "@mui/icons-material";
import useAuth from "@/services/auth/use-auth";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import useFetch from "@/services/api/use-fetch";

export default function DebugAuthStatus() {
  const [tokensFromStorage, setTokensFromStorage] = useState<any>(null);
  const [authTest, setAuthTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const fetchBase = useFetch();

  useEffect(() => {
    setIsMounted(true);
    const tokens = getTokensInfo();
    setTokensFromStorage(tokens);
  }, []);

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await fetchBase(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/auth/me`,
        { method: "GET" }
      );

      const data = await response.json();
      setAuthTest({
        status: response.status,
        data: data,
        ok: response.ok,
      });
    } catch (error: any) {
      setAuthTest({
        status: "ERROR",
        data: error.message,
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const testBalance = async () => {
    setLoading(true);
    try {
      const response = await fetchBase(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/user-balances/my-balance`,
        { method: "GET" }
      );

      const data = await response.json();
      setAuthTest({
        status: response.status,
        data: data,
        ok: response.ok,
        endpoint: "balance",
      });
    } catch (error: any) {
      setAuthTest({
        status: "ERROR",
        data: error.message,
        ok: false,
        endpoint: "balance",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 1000,
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(255, 0, 0, 0.9)",
        color: "white",
        border: "3px solid red",
        maxWidth: "400px",
      }}
    >
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" fontWeight="bold">
          🔍 Auth Debug Panel
        </Typography>

        <Divider sx={{ backgroundColor: "white", my: 1 }} />

        {/* User Status */}
        <Box display="flex" alignItems="center" gap={1}>
          <Person sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            User:{" "}
            {isMounted
              ? user
                ? `${user.firstName} ${user.lastName}`
                : "None"
              : "Loading..."}
          </Typography>
          <Chip
            label={isMounted ? (user ? "LOGGED" : "GUEST") : "LOADING"}
            size="small"
            color={isMounted ? (user ? "success" : "error") : "default"}
          />
        </Box>

        {/* Context Token */}
        <Box display="flex" alignItems="center" gap={1}>
          <VpnKey sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            Context Token:{" "}
            {isMounted ? (tokensFromStorage?.token ? "Yes" : "No") : "Loading..."}
          </Typography>
        </Box>

        {/* Storage Token */}
        <Box display="flex" alignItems="center" gap={1}>
          <Storage sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            Storage Token:{" "}
            {isMounted
              ? tokensFromStorage?.token
                ? "Yes"
                : "No"
              : "Loading..."}
          </Typography>
        </Box>

        {isMounted && tokensFromStorage?.token && (
          <Typography variant="caption" color="white">
            Token: {tokensFromStorage.token.substring(0, 20)}...
          </Typography>
        )}

        <Divider sx={{ backgroundColor: "white", my: 1 }} />

        {/* API Test Results */}
        {authTest && (
          <Box
            sx={{ p: 1, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 1 }}
          >
            <Typography variant="caption" color="white">
              <strong>API Test ({authTest.endpoint || "auth"}):</strong>
              <br />
              Status: {authTest.status}
              <br />
              OK: {authTest.ok ? "Yes" : "No"}
              <br />
              Data: {JSON.stringify(authTest.data, null, 2)}
            </Typography>
          </Box>
        )}

        {/* Test Buttons */}
        <Box display="flex" gap={1} mt={1}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Refresh />}
            onClick={testAuth}
            disabled={loading || !isMounted}
            sx={{
              backgroundColor: "white",
              color: "red",
              fontSize: "0.7rem",
            }}
          >
            Test Auth
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={testBalance}
            disabled={loading || !isMounted}
            sx={{
              borderColor: "white",
              color: "white",
              fontSize: "0.7rem",
            }}
          >
            Test Balance
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
