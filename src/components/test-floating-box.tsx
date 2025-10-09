"use client";

import { Box, Paper, Typography } from "@mui/material";

export default function TestFloatingBox() {
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
        backgroundColor: "rgba(255, 0, 0, 0.8)",
        color: "white",
        border: "2px solid red",
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        TEST FLOATING BOX
      </Typography>
      <Typography variant="body2">
        This should always be visible!
      </Typography>
    </Paper>
  );
}
