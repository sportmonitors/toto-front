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
  Collapse
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  Person, 
  ExpandMore,
  ExpandLess,
  Refresh
} from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import useUserBalance from "@/services/auth/use-user-balance";

interface FloatingUserInfoProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  showDetails?: boolean;
}

export default function FloatingUserInfo({ 
  position = "top-right",
  showDetails = false
}: FloatingUserInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuthActions();
  const { tokensInfo } = useAuthTokens();
  const { balance, loading, refetch } = useUserBalance();

  useEffect(() => {
    // Show floating info only if user is logged in
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
    <Fade in={isVisible} timeout={500}>
      <Paper
        elevation={8}
        sx={{
          ...getPositionStyles(),
          p: 2,
          borderRadius: 2,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(10px)",
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
                  color: "success.main" 
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
                  ${balance?.balance?.toFixed(2) || "0.00"}
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
                <Box
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    p: 0.5,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        {showDetails && (
          <Collapse in={expanded}>
            <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  Locked Balance
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${balance?.lockedBalance?.toFixed(2) || "0.00"}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Total Balance
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  ${((balance?.balance || 0) + (balance?.lockedBalance || 0)).toFixed(2)}
                </Typography>
              </Box>

              <Box mt={1} display="flex" justifyContent="center">
                <Tooltip title="Refresh balance">
                  <Box
                    onClick={refetch}
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      p: 0.5,
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Refresh fontSize="small" />
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Collapse>
        )}
      </Paper>
    </Fade>
  );
}
