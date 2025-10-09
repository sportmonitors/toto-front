"use client";

import { Box, Paper, Typography, Avatar, Chip } from "@mui/material";
import { AccountBalanceWallet, Person } from "@mui/icons-material";

export default function TestSimpleFloating() {
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
        backgroundColor: "rgba(255, 0, 0, 0.9)",
        color: "white",
        border: "3px solid red",
        maxWidth: "250px",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "white",
            color: "red",
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
            Test User
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
          label="TEST"
          size="small"
          sx={{
            backgroundColor: "white",
            color: "red",
            fontSize: "0.7rem",
            height: 20,
          }}
        />
      </Box>
    </Paper>
  );
}
