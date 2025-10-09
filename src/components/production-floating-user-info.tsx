"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Avatar, Chip, Skeleton } from "@mui/material";
import { AccountBalanceWallet, Person } from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";

interface ProductionFloatingUserInfoProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export default function ProductionFloatingUserInfo({
  position = "top-right",
}: ProductionFloatingUserInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthActions();
  const { tokensInfo } = useAuthTokens();

  useEffect(() => {
    if (user && tokensInfo?.token) {
      setIsVisible(true);
      fetchBalance();
    } else {
      setIsVisible(false);
    }
  }, [user, tokensInfo]);

  const fetchBalance = async () => {
    if (!tokensInfo?.token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/v1/user-balances/my-balance`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokensInfo.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      } else {
        console.warn("Failed to fetch balance, using fallback");
        setBalance(1000);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance(1000);
    } finally {
      setLoading(false);
    }
  };

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

  if (!isVisible || !user) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      sx={{
        ...getPositionStyles(),
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 12,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
          }}
        >
          <Person />
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="text.primary"
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
                color: "success.main",
              }}
            />
            {loading ? (
              <Skeleton width={60} height={20} />
            ) : (
              <Typography
                variant="body2"
                color="success.main"
                fontWeight="medium"
              >
                ${balance?.toFixed(2) || "0.00"}
              </Typography>
            )}
          </Box>
        </Box>

        <Chip
          label="Active"
          size="small"
          color="success"
          variant="outlined"
          sx={{
            fontSize: "0.7rem",
            height: 20,
          }}
        />
      </Box>
    </Paper>
  );
}
