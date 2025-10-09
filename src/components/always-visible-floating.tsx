"use client";

import { Box, Paper, Typography, Avatar, Chip } from "@mui/material";
import { AccountBalanceWallet, Person } from "@mui/icons-material";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";

export default function AlwaysVisibleFloating() {
  const { user } = useAuthActions();
  const { tokensInfo } = useAuthTokens();

  console.log("AlwaysVisibleFloating - User:", user);
  console.log("AlwaysVisibleFloating - TokensInfo:", tokensInfo);

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
        backgroundColor: "rgba(0, 255, 0, 0.9)",
        color: "white",
        border: "3px solid green",
        maxWidth: "300px",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "white",
            color: "green",
          }}
        >
          <Person />
        </Avatar>
        
        <Box flex={1}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="white"
          >
            {user ? `${user.firstName} ${user.lastName}` : "No User"}
          </Typography>
          
          <Typography
            variant="caption"
            color="white"
            display="block"
          >
            Token: {tokensInfo?.token ? "Yes" : "No"}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <AccountBalanceWallet 
              sx={{ 
                fontSize: 16, 
                color: "white" 
              }} 
            />
            <Typography
              variant="body2"
              color="white"
              fontWeight="medium"
            >
              $1,000.00
            </Typography>
          </Box>
        </Box>

        <Chip
          label={user ? "LOGGED" : "GUEST"}
          size="small"
          sx={{
            backgroundColor: "white",
            color: "green",
            fontSize: "0.7rem",
            height: 20,
          }}
        />
      </Box>
    </Paper>
  );
}
