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
import Link from "@/components/link";
import { useState, useEffect } from "react";
import { Tournament, TournamentStatus } from "@/services/api/types/tournament";
import { getActiveTournaments } from "@/services/api/services/tournaments";
import { format, isAfter } from "date-fns";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EuroIcon from "@mui/icons-material/Euro";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

function TournamentsUser() {
  const { t } = useTranslation("tournaments");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await getActiveTournaments();
      setTournaments(response.data || []);
    } catch (error) {
      console.error("Failed to load tournaments:", error);
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
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography>Loading tournaments...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} pt={3}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h3" gutterBottom>
            Active Tournaments
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Place your bets on active tournaments. Each tournament consists of
            multiple matches where you can predict outcomes.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3}>
            {tournaments.map((tournament) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={tournament.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: tournament.backgroundColor
                      ? `linear-gradient(135deg, ${tournament.backgroundColor}22, ${tournament.backgroundColor}11)`
                      : undefined,
                  }}
                >
                  {tournament.backgroundImage && (
                    <Box
                      sx={{
                        height: 120,
                        backgroundImage: `url(${tournament.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={2}
                    >
                      <Typography variant="h6" component="h2">
                        {tournament.name}
                      </Typography>
                      <Chip
                        label={canBet(tournament) ? "Open" : "Closed"}
                        color={canBet(tournament) ? "success" : "error"}
                        size="small"
                      />
                    </Box>

                    {tournament.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {tournament.description}
                      </Typography>
                    )}

                    <Box display="flex" alignItems="center" mb={1}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {getTimeRemaining(tournament.cutoffTime)}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <EuroIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        ${tournament.linePrice} per line
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <EmojiEventsIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Prizes: ${tournament.prizeGold || 0} | $
                        {tournament.prizeSilver || 0} | $
                        {tournament.prizeBronze || 0}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Tournament runs from{" "}
                      {format(new Date(tournament.startDate), "MMM dd")} to{" "}
                      {format(new Date(tournament.endDate), "MMM dd, yyyy")}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      LinkComponent={Link}
                      href={`/tournaments/${tournament.id}`}
                      variant="outlined"
                      fullWidth
                    >
                      View Details
                    </Button>
                    {canBet(tournament) && (
                      <Button
                        size="small"
                        LinkComponent={Link}
                        href={`/tournaments/${tournament.id}/bet`}
                        variant="contained"
                        fullWidth
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
            <Box textAlign="center" py={8}>
              <EmojiEventsIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Active Tournaments
              </Typography>
              <Typography variant="body1" color="text.secondary">
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
