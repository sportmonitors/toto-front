"use client";

import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Link from "@/components/link";
import { useState, useEffect } from "react";
import { Tournament } from "@/services/api/types/tournament";
import { getActiveTournaments } from "@/services/api/services/tournaments";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { format, isAfter } from "date-fns";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EuroIcon from "@mui/icons-material/Euro";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

function TournamentsUser() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await getActiveTournaments();

      // Check if response is successful and has data
      if (response.status === HTTP_CODES_ENUM.OK && response.data) {
        setTournaments(response.data);
      } else {
        console.error("Failed to load tournaments:", response);
        setTournaments([]);
      }
    } catch (error) {
      console.error("Failed to load tournaments:", error);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const canBet = (tournament: Tournament) => {
    return isAfter(new Date(tournament.cutoffTime), new Date());
  };

  const getTimeRemaining = (cutoffTime: string) => {
    const now = new Date();
    const cutoff = new Date(cutoffTime);
    const diff = cutoff.getTime() - now.getTime();

    if (diff <= 0) return "Betting Closed";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }

    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          background: theme.palette.background.gradient,
          minHeight: "100vh",
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          px={isMobile ? 2 : 3}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{ color: theme.palette.text.primary }}
          >
            Loading tournaments...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: isMobile ? 2 : 3,
        background: theme.palette.background.gradient,
        minHeight: "100vh",
      }}
    >
      <Grid container spacing={isMobile ? 2 : 3} pt={isMobile ? 2 : 3}>
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            {tournaments.map((tournament) => (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 6,
                  lg: 4,
                  xl: 3,
                }}
                key={tournament.id}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#ffffff",
                    borderRadius: isMobile ? 2 : 3,
                    boxShadow: isMobile ? 1 : 2,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: isMobile ? "none" : "translateY(-2px)",
                      boxShadow: isMobile ? 1 : 4,
                    },
                  }}
                >
                  {tournament.backgroundImage && (
                    <Box
                      sx={{
                        height: isMobile ? 100 : 120,
                        backgroundImage: `url(${tournament.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={isMobile ? 1.5 : 2}
                      flexDirection={isMobile ? "column" : "row"}
                      gap={isMobile ? 1 : 0}
                    >
                      <Typography
                        variant={isMobile ? "subtitle1" : "h6"}
                        component="h2"
                        sx={{
                          fontSize: isMobile ? "1rem" : undefined,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {tournament.name}
                      </Typography>
                      <Chip
                        label={canBet(tournament) ? "Open" : "Closed"}
                        color={canBet(tournament) ? "success" : "error"}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          fontSize: isMobile ? "0.75rem" : undefined,
                          height: isMobile ? 24 : undefined,
                        }}
                      />
                    </Box>

                    {tournament.description && (
                      <Typography
                        variant="body2"
                        mb={isMobile ? 1.5 : 2}
                        sx={{
                          fontSize: isMobile ? "0.8rem" : undefined,
                          lineHeight: isMobile ? 1.3 : undefined,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {tournament.description}
                      </Typography>
                    )}

                    <Box
                      display="flex"
                      alignItems="center"
                      mb={isMobile ? 0.75 : 1}
                    >
                      <AccessTimeIcon
                        fontSize={isMobile ? "small" : "medium"}
                        sx={{ mr: 1, fontSize: isMobile ? "1rem" : undefined }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: isMobile ? "0.8rem" : undefined,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {getTimeRemaining(tournament.cutoffTime)}
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      alignItems="center"
                      mb={isMobile ? 0.75 : 1}
                    >
                      <EuroIcon
                        fontSize={isMobile ? "small" : "medium"}
                        sx={{ mr: 1, fontSize: isMobile ? "1rem" : undefined }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: isMobile ? "0.8rem" : undefined,
                          color: theme.palette.text.primary,
                        }}
                      >
                        ${tournament.linePrice} per line
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      alignItems="center"
                      mb={isMobile ? 1.5 : 2}
                    >
                      <EmojiEventsIcon
                        fontSize={isMobile ? "small" : "medium"}
                        sx={{ mr: 1, fontSize: isMobile ? "1rem" : undefined }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: isMobile ? "0.8rem" : undefined,
                          color: theme.palette.text.primary,
                        }}
                      >
                        Prizes: ${tournament.prizeGold || 0} | $
                        {tournament.prizeSilver || 0} | $
                        {tournament.prizeBronze || 0}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: isMobile ? "0.8rem" : undefined,
                        lineHeight: isMobile ? 1.3 : undefined,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Tournament runs from{" "}
                      {format(new Date(tournament.startDate), "MMM dd")} to{" "}
                      {format(new Date(tournament.endDate), "MMM dd, yyyy")}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: isMobile ? 1.5 : 2, pt: 0 }}>
                    {/* <Button
                      size="small"
                      LinkComponent={Link}
                      href={`/tournaments/${tournament.id}`}
                      variant="outlined"
                      fullWidth
                    >
                      View Details
                    </Button> */}
                    {canBet(tournament) && (
                      <Button
                        size={isMobile ? "small" : "medium"}
                        LinkComponent={Link}
                        href={`/tournaments/${tournament.id}/bet`}
                        variant="contained"
                        fullWidth
                        sx={{
                          fontSize: isMobile ? "0.875rem" : undefined,
                          py: isMobile ? 1 : undefined,
                          fontWeight: 600,
                        }}
                      >
                        Place Bet
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {tournaments.length === 0 && (
            <Box textAlign="center" py={isMobile ? 6 : 8}>
              <EmojiEventsIcon
                sx={{
                  fontSize: isMobile ? 48 : 64,
                  color: "text.secondary",
                  mb: 2,
                }}
              />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                gutterBottom
                sx={{
                  fontSize: isMobile ? "1.25rem" : undefined,
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                No Active Tournaments
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  fontSize: isMobile ? "0.875rem" : undefined,
                  maxWidth: isMobile ? "280px" : "400px",
                  mx: "auto",
                  color: theme.palette.text.secondary,
                }}
              >
                Check back later for new tournaments to join!
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default TournamentsUser;
