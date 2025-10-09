"use client";

import { useState, useEffect } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  Skeleton,
  Tooltip,
  Fade,
  Collapse,
  IconButton,
  Divider
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  Person, 
  ExpandMore,
  ExpandLess,
  Refresh,
  Lock,
  AccountBalance
} from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import useUserProfile from "@/services/auth/use-user-profile";

interface AdvancedFloatingUserInfoProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export default function AdvancedFloatingUserInfo({
  position = "top-right",
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: AdvancedFloatingUserInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuthActions();
  const { tokensInfo } = useAuthTokens();
  const { profile, loading, refetch } = useUserProfile();

  useEffect(() => {
    if (user && tokensInfo?.token) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, tokensInfo]);

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh || !isVisible) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isVisible, refreshInterval, refetch]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 1000,
      maxWidth: "320px",
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

  const displayName = profile?.user ? 
    `${profile.user.firstName} ${profile.user.lastName}` : 
    `${user?.firstName} ${user?.lastName}` || "User";

  const totalBalance = (profile?.balance?.balance || 0) + (profile?.balance?.lockedBalance || 0);

  return (
    <Fade in={isVisible} timeout={500}>
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
              {displayName}
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
                  ${profile?.balance?.balance?.toFixed(2) || "0.00"}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
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

            {showDetails && (
              <Tooltip title={expanded ? "Hide details" : "Show details"}>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    p: 0.5,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Refresh balance">
              <IconButton
                size="small"
                onClick={refetch}
                disabled={loading}
                sx={{
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {showDetails && (
          <Collapse in={expanded}>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <AccountBalance fontSize="small" color="primary" />
                  <Typography variant="caption" color="text.secondary">
                    Available Balance
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  ${profile?.balance?.balance?.toFixed(2) || "0.00"}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Lock fontSize="small" color="warning" />
                  <Typography variant="caption" color="text.secondary">
                    Locked Balance
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium" color="warning.main">
                  ${profile?.balance?.lockedBalance?.toFixed(2) || "0.00"}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight="bold" color="text.primary">
                  Total Balance
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  ${totalBalance.toFixed(2)}
                </Typography>
              </Box>

              {autoRefresh && (
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                    Auto-refresh every {refreshInterval / 1000}s
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        )}
      </Paper>
    </Fade>
  );
}
