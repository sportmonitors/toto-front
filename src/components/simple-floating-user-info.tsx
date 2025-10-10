"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Skeleton,
  useTheme,
} from "@mui/material";
import { AccountBalanceWallet, Person } from "@mui/icons-material";
import useAuth from "@/services/auth/use-auth";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import useFetch from "@/services/api/use-fetch";

interface SimpleFloatingUserInfoProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export default function SimpleFloatingUserInfo({
  position = "top-right",
}: SimpleFloatingUserInfoProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useAuth();
  const fetchBase = useFetch();
  const theme = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isLoaded || !user) return;

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchBase(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/user-balances/my-balance`,
          { method: "GET" }
        );

        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance || 0);
        } else {
          setError("Failed to fetch balance");
          setBalance(0);
        }
      } catch (err: any) {
        console.error("Failed to fetch balance:", err);
        setError(err.message);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [isMounted, isLoaded, user, fetchBase]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 1000,
      maxWidth: "280px",
    };

    switch (position) {
      case "top-right":
        return { ...baseStyles, top: 20, right: 20 };
      case "top-left":
        return { ...baseStyles, top: 20, left: 20 };
      case "bottom-right":
        return { ...baseStyles, bottom: 20, right: 20 };
      case "bottom-left":
        return { ...baseStyles, bottom: 20, left: 20 };
      default:
        return { ...baseStyles, top: 20, right: 20 };
    }
  };

  if (!isMounted || !isLoaded) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        ...getPositionStyles(),
        p: 2,
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(30, 30, 30, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.palette.mode === "dark" ? 16 : 12,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(40, 40, 40, 0.98)"
              : "rgba(250, 250, 250, 0.98)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor:
              theme.palette.mode === "dark" ? "primary.dark" : "primary.main",
            color:
              theme.palette.mode === "dark"
                ? "primary.contrastText"
                : "primary.contrastText",
          }}
        >
          <Person />
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color={
              theme.palette.mode === "dark" ? "text.primary" : "text.primary"
            }
            noWrap
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.firstName} {user.lastName}
          </Typography>

          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <AccountBalanceWallet
              sx={{
                fontSize: 16,
                color:
                  theme.palette.mode === "dark"
                    ? "success.light"
                    : "success.main",
              }}
            />
            {loading ? (
              <Skeleton width={60} height={20} />
            ) : error ? (
              <Typography
                variant="body2"
                color="error.main"
                fontWeight="medium"
              >
                Error
              </Typography>
            ) : (
              <Typography
                variant="body2"
                color={
                  theme.palette.mode === "dark"
                    ? "success.light"
                    : "success.main"
                }
                fontWeight="medium"
              >
                ${balance || "0.00"}
              </Typography>
            )}
          </Box>
        </Box>

        <Chip
          label="Active"
          size="small"
          color="success"
          variant={theme.palette.mode === "dark" ? "filled" : "outlined"}
          sx={{
            fontSize: "0.7rem",
            height: 20,
            backgroundColor:
              theme.palette.mode === "dark" ? "success.dark" : "transparent",
            color:
              theme.palette.mode === "dark"
                ? "success.contrastText"
                : "success.main",
            borderColor:
              theme.palette.mode === "dark" ? "success.dark" : "success.main",
          }}
        />
      </Box>
    </Paper>
  );
}
