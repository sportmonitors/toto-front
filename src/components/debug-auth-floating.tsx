"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Avatar, Chip, Button } from "@mui/material";
import {
  AccountBalanceWallet,
  Person,
  Login,
  Logout,
} from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";

export default function DebugAuthFloating() {
  const { user, setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const [tokensFromStorage, setTokensFromStorage] = useState<any>(null);

  useEffect(() => {
    // Check tokens from localStorage
    const tokens = getTokensInfo();
    setTokensFromStorage(tokens);
  }, []);

  const handleLogin = () => {
    // Simulate login with test data
    const testUser = {
      id: "1",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      role: { id: 2 },
    };

    const testTokens = {
      token: "test-token-123",
      refreshToken: "test-refresh-token-123",
      tokenExpires: Date.now() + 3600000,
    };

    setUser(testUser);
    setTokensInfo(testTokens);
    setTokensFromStorage(testTokens);
  };

  const handleLogout = () => {
    setUser(null);
    setTokensInfo(null);
    setTokensFromStorage(null);
  };

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
        backgroundColor: "rgba(0, 0, 255, 0.9)",
        color: "white",
        border: "3px solid blue",
        maxWidth: "350px",
      }}
    >
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "white",
              color: "blue",
            }}
          >
            <Person />
          </Avatar>

          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="bold" color="white">
              {user ? `${user.firstName} ${user.lastName}` : "No User"}
            </Typography>

            <Typography variant="caption" color="white" display="block">
              Token: {tokensFromStorage?.token ? "Yes" : "No"}
            </Typography>

            <Typography variant="caption" color="white" display="block">
              Storage Token:{" "}
              {tokensFromStorage?.token
                ? tokensFromStorage.token.substring(0, 10) + "..."
                : "None"}
            </Typography>
          </Box>

          <Chip
            label={user ? "LOGGED" : "GUEST"}
            size="small"
            sx={{
              backgroundColor: "white",
              color: "blue",
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <AccountBalanceWallet
            sx={{
              fontSize: 16,
              color: "white",
            }}
          />
          <Typography variant="body2" color="white" fontWeight="medium">
            $1,000.00
          </Typography>
        </Box>

        <Box display="flex" gap={1} mt={1}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Login />}
            onClick={handleLogin}
            sx={{
              backgroundColor: "white",
              color: "blue",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            Test Login
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              borderColor: "white",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
