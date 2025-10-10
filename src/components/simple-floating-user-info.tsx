"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Skeleton,
  useTheme,
} from "@mui/material";
import { FiberManualRecord } from "@mui/icons-material";
import useAuth from "@/services/auth/use-auth";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import useFetch from "@/services/api/use-fetch";
import useSocket from "@/services/socket/use-socket";

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
  const { isConnected: socketConnected } = useSocket();

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

  // Listen for real-time balance updates via Socket.IO
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      const data = event.detail;
      if (data.userId === user?.id) {
        console.log("Real-time balance update:", data);
        setBalance(data.balance);
        setError(null);
      }
    };

    window.addEventListener(
      "balance-update",
      handleBalanceUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "balance-update",
        handleBalanceUpdate as EventListener
      );
    };
  }, [user?.id]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 1000,
      maxWidth: position.includes("bottom") ? "220px" : "260px", // Compact design
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
        p: position.includes("bottom") ? 1.5 : 2, // Compact padding
        borderRadius: 3,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(20, 20, 20, 0.98)"
            : "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(15px)",
        border:
          theme.palette.mode === "dark"
            ? "2px solid rgba(255, 255, 255, 0.2)"
            : "2px solid rgba(0, 0, 0, 0.15)",
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
      <Box display="flex" alignItems="center" gap={1}>
        {/* Online/Offline Status Dot */}
        <FiberManualRecord
          sx={{
            fontSize: position.includes("bottom") ? 12 : 14,
            color: socketConnected ? "#4caf50" : "#f44336",
            filter: "drop-shadow(0 0 3px currentColor)",
          }}
        />

        {/* Username and Balance */}
        <Box flex={1} minWidth={0}>
          <Typography
            variant={position.includes("bottom") ? "body2" : "body1"}
            fontWeight="bold"
            color={theme.palette.mode === "dark" ? "#9c27b0" : "#7b1fa2"}
            noWrap
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: position.includes("bottom") ? "0.875rem" : "1rem",
            }}
          >
            {user.firstName} {user.lastName}:{" "}
            {loading ? (
              <Skeleton
                width={position.includes("bottom") ? 40 : 50}
                height={position.includes("bottom") ? 16 : 20}
                sx={{ display: "inline-block", ml: 0.5 }}
              />
            ) : error ? (
              <Typography
                component="span"
                variant={position.includes("bottom") ? "caption" : "body2"}
                color="error.main"
                fontWeight="medium"
                sx={{ ml: 0.5 }}
              >
                Error
              </Typography>
            ) : (
              <Typography
                component="span"
                variant={position.includes("bottom") ? "body2" : "body1"}
                color={
                  theme.palette.mode === "dark" ? "#4caf50" : "success.main"
                }
                fontWeight="bold"
                sx={{
                  fontSize: position.includes("bottom") ? "0.875rem" : "1rem",
                  ml: 0.5,
                }}
              >
                ${balance || "0.00"}
              </Typography>
            )}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
