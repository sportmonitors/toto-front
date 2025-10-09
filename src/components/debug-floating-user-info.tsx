"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Avatar, Chip } from "@mui/material";
import { AccountBalanceWallet, Person } from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";

interface DebugFloatingUserInfoProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export default function DebugFloatingUserInfo({ 
  position = "top-right" 
}: DebugFloatingUserInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuthActions();
  const { tokensInfo } = useAuthTokens();

  useEffect(() => {
    console.log("DebugFloatingUserInfo - User:", user);
    console.log("DebugFloatingUserInfo - TokensInfo:", tokensInfo);
    
    if (user && tokensInfo?.token) {
      console.log("DebugFloatingUserInfo - Setting visible to true");
      setIsVisible(true);
    } else {
      console.log("DebugFloatingUserInfo - Setting visible to false");
      setIsVisible(false);
    }
  }, [user, tokensInfo]);

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 1000,
      maxWidth: "250px",
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

  console.log("DebugFloatingUserInfo - isVisible:", isVisible);
  console.log("DebugFloatingUserInfo - user:", user);

  if (!isVisible || !user) {
    console.log("DebugFloatingUserInfo - Not rendering (not visible or no user)");
    return null;
  }

  console.log("DebugFloatingUserInfo - Rendering component");

  return (
    <Paper
      elevation={8}
      sx={{
        ...getPositionStyles(),
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "2px solid red", // Debug border
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
            <Typography
              variant="body2"
              color="success.main"
              fontWeight="medium"
            >
              $1,000.00
            </Typography>
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
