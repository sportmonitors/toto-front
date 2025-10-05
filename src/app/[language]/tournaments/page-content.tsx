"use client";

import Link from "@/components/link";
import { getActiveTournaments } from "@/services/api/services/tournaments";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { Tournament } from "@/services/api/types/tournament";
import { useTranslation } from "@/services/i18n/client";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { format, isAfter } from "date-fns";
import { useEffect, useState } from "react";
import useHallTokenLogin from "@/services/auth/use-hall-token-login";

function TournamentsUser() {
  const { t } = useTranslation("tournaments");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle hall token auto-login
  const { isLoading: isTokenLoginLoading, error: tokenLoginError } =
    useHallTokenLogin();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadTournaments();
  }, []);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  if (loading || isTokenLoginLoading) {
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
            {t("loading")}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (tokenLoginError) {
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
          <Typography variant="h6" color="error">
            Login failed: {tokenLoginError}
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
            {tournaments.map((tournament) => {
              const timeRemaining = getTimeRemaining(tournament.cutoffTime);
              const totalPrize =
                (tournament.prizeGold || 0) +
                (tournament.prizeSilver || 0) +
                (tournament.prizeBronze || 0);
              const gamesCompleted = Math.floor(Math.random() * 8) + 1; // Mock data - replace with actual data
              const totalGames = 8; // Mock data - replace with actual data

              return (
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
                      borderRadius: 3,
                      boxShadow: "none",
                      transition: "all 0.2s ease-in-out",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* Timer Section */}
                    <Box
                      sx={{
                        backgroundColor: "#fef2f2",
                        margin: "10px",
                        color: "#dc2626",
                        px: 2.5,
                        py: 1.5,
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={0.5}
                      >
                        <AccessTimeIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
                        <Typography variant="caption" fontWeight={600}>
                          {t("timeRemaining")}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Box
                          sx={{
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                            borderRadius: 1,
                            p: 0.5,
                            minWidth: "40px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 0.25,
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {timeRemaining.days}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {t("days")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                            borderRadius: 1,
                            p: 0.5,
                            minWidth: "40px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 0.25,
                            border: "1px solid rgba(220, 38, 38, 0.2)",
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {timeRemaining.hours.toString().padStart(2, "0")}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {t("hours")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                            borderRadius: 1,
                            p: 0.5,
                            minWidth: "40px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 0.25,
                            border: "1px solid rgba(220, 38, 38, 0.2)",
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {timeRemaining.minutes.toString().padStart(2, "0")}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {t("minutes")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                            borderRadius: 1,
                            p: 0.5,
                            minWidth: "40px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 0.25,
                            border: "1px solid rgba(220, 38, 38, 0.2)",
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {timeRemaining.seconds.toString().padStart(2, "0")}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {t("seconds")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Background Image Section */}
                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: tournament.backgroundImage
                          ? `url(${tournament.backgroundImage})`
                          : "linear-gradient(135deg, #667eea 0%, #000 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                        }}
                      >
                        <Chip
                          label={canBet(tournament) ? t("active") : t("closed")}
                          color={canBet(tournament) ? "success" : "error"}
                          size="small"
                          sx={{
                            backgroundColor: canBet(tournament)
                              ? "#4caf50"
                              : "#f44336",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                          textAlign: "center",
                          fontSize: "1.1rem",
                        }}
                      >
                        {tournament.name}
                      </Typography>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      {/* Title */}
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          mb: 1,
                        }}
                      >
                        {tournament.name}
                      </Typography>

                      {/* Description */}
                      {tournament.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 2,
                            lineHeight: 1.4,
                          }}
                        >
                          {tournament.description}
                        </Typography>
                      )}

                      {/* Event Details */}
                      <Box sx={{ mb: 1 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="body2" sx={{ color: "#000000" }}>
                            {t("startDate")}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {format(
                              new Date(tournament.startDate),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="body2" sx={{ color: "#000000" }}>
                            {t("endDate")}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {format(
                              new Date(tournament.endDate),
                              "MMM dd, yyyy 'at' h:mm a"
                            )}
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="body2" sx={{ color: "#000000" }}>
                            {t("totalPrize")}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {totalPrize.toLocaleString()} {t("points")}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ color: "#000000" }}>
                            {t("maxParticipants")}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {tournament.maxParticipants?.toLocaleString() ||
                              "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      {canBet(tournament) && (
                        <Button
                          LinkComponent={Link}
                          href={`/tournaments/${tournament.id}/bet`}
                          variant="contained"
                          fullWidth
                          size="large"
                          sx={{
                            backgroundColor: "#093453",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "1rem",
                            borderRadius: 2,
                            "&:hover": {
                              backgroundColor: "#0a3d5f",
                            },
                          }}
                        >
                          {t("joinNow")}
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
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
                {t("noActiveTournaments")}
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
                {t("noActiveTournamentsDescription")}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default TournamentsUser;
