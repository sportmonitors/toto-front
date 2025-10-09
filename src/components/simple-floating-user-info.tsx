"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Avatar, Chip } from "@mui/material";
import { AccountBalanceWallet, Person } from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import useUserBalance from "@/services/auth/use-user-balance";

interface SimpleFloatingUserInfoProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export default function SimpleFloatingUserInfo({
  position = "top-right",
}: SimpleFloatingUserInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuthActions();
  const { tokensInfo } = useAuthTokens();
  const { balance, loading } = useUserBalance();

  useEffect(() => {
    if (user && tokensInfo?.token) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, tokensInfo]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 1000,
      maxWidth: "200px",
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
      elevation={6}
      sx={{
        ...getPositionStyles(),
        p: 1.5,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 8,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            fontSize: "0.8rem",
          }}
        >
          <Person fontSize="small" />
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.primary"
            noWrap
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.75rem",
            }}
          >
            {user.firstName}
          </Typography>

          <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
            <AccountBalanceWallet
              sx={{
                fontSize: 12,
                color: "success.main",
              }}
            />
            <Typography
              variant="caption"
              color="success.main"
              fontWeight="bold"
              sx={{ fontSize: "0.7rem" }}
            >
              ${loading ? "..." : balance?.balance?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
        </Box>

        <Chip
          label="●"
          size="small"
          color="success"
          sx={{
            fontSize: "0.5rem",
            height: 16,
            width: 16,
            minWidth: 16,
            "& .MuiChip-label": {
              px: 0.5,
            },
          }}
        />
      </Box>
    </Paper>
  );
}
