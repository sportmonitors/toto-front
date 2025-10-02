"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Link from "@/components/link";
import { useState, useEffect } from "react";
import { Tournament, TournamentStatus } from "@/services/api/types/tournament";
import { getTournaments } from "@/services/api/services/tournaments";
import { format } from "date-fns";

function TournamentsAdmin() {
  const { t } = useTranslation("tournaments");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await getTournaments();
      console.log("getTournaments::::::", response);
      setTournaments(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.DRAFT:
        return "default";
      case TournamentStatus.ACTIVE:
        return "success";
      case TournamentStatus.CLOSED:
        return "warning";
      case TournamentStatus.SETTLED:
        return "info";
      case TournamentStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
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
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} pt={3}>
        <Grid container spacing={3} size={{ xs: 12 }}>
          <Grid size="grow">
            <Typography variant="h3">Tournament Management</Typography>
          </Grid>
          <Grid size="auto">
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/admin-panel/tournaments/create"
              color="success"
            >
              Create Tournament
            </Button>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3}>
            {tournaments.map((tournament) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={tournament.id}>
                <Card>
                  <CardContent>
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
                        label={tournament.status}
                        color={getStatusColor(tournament.status)}
                        size="small"
                      />
                    </Box>

                    {tournament.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {tournament.description}
                      </Typography>
                    )}

                    <Box mb={1}>
                      <Typography variant="body2">
                        <strong>Start:</strong>{" "}
                        {format(new Date(tournament.startDate), "PPp")}
                      </Typography>
                    </Box>

                    <Box mb={1}>
                      <Typography variant="body2">
                        <strong>End:</strong>{" "}
                        {format(new Date(tournament.endDate), "PPp")}
                      </Typography>
                    </Box>

                    <Box mb={1}>
                      <Typography variant="body2">
                        <strong>Cutoff:</strong>{" "}
                        {format(new Date(tournament.cutoffTime), "PPp")}
                      </Typography>
                    </Box>

                    <Box mb={1}>
                      <Typography variant="body2">
                        <strong>Line Price:</strong> ${tournament.linePrice}
                      </Typography>
                    </Box>

                    <Box mb={1}>
                      <Typography variant="body2">
                        <strong>Prizes:</strong> Gold: $
                        {tournament.prizeGold || 0} | Silver: $
                        {tournament.prizeSilver || 0} | Bronze: $
                        {tournament.prizeBronze || 0}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      LinkComponent={Link}
                      href={`/admin-panel/tournaments/${tournament.id}`}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      LinkComponent={Link}
                      href={`/admin-panel/tournaments/${tournament.id}/edit`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      LinkComponent={Link}
                      href={`/admin-panel/tournaments/${tournament.id}/matches`}
                    >
                      Matches
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {tournaments.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No tournaments found
              </Typography>
              <Button
                variant="contained"
                LinkComponent={Link}
                href="/admin-panel/tournaments/create"
                sx={{ mt: 2 }}
              >
                Create First Tournament
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(TournamentsAdmin, {
  roles: [RoleEnum.ADMIN],
});
