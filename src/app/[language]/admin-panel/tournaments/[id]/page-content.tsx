"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Sports as SportsIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import {
  Tournament,
  TournamentStatus,
  PrizeDistributionType,
} from "@/services/api/types/tournament";
import { getTournamentById } from "@/services/api/services/tournaments";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";

const TournamentDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTournamentById(Number(tournamentId));
      setTournament(response.data);
    } catch (error) {
      console.error("Failed to load tournament:", error);
      setError("Failed to load tournament details");
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
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.DRAFT:
        return "Draft";
      case TournamentStatus.ACTIVE:
        return "Active";
      case TournamentStatus.CLOSED:
        return "Closed";
      case TournamentStatus.SETTLED:
        return "Settled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Box p={3}>
        <Alert severity="warning">Tournament not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Tournament Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() =>
              router.push(`/admin-panel/tournaments/${tournamentId}/edit`)
            }
            sx={{ mr: 1 }}
          >
            Edit Tournament
          </Button>
          <Button
            variant="contained"
            startIcon={<SportsIcon />}
            onClick={() =>
              router.push(`/admin-panel/tournaments/${tournamentId}/matches`)
            }
          >
            Manage Matches
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{tournament.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(tournament.status)}
                    color={getStatusColor(tournament.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {tournament.description || "No description provided"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tournament Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tournament Settings
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <MoneyIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Line Price
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(tournament.linePrice)}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Max Participants
                  </Typography>
                  <Typography variant="body1">
                    {tournament.maxParticipants || "Unlimited"}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <SportsIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Min Valid Matches
                  </Typography>
                  <Typography variant="body1">
                    {tournament.minValidMatches}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(tournament.startDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        End Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(tournament.endDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Betting Cutoff
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(tournament.cutoffTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Prize Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prize Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Distribution Type
                  </Typography>
                  <Typography variant="body1">
                    {tournament.prizeDistributionType ===
                    PrizeDistributionType.FIXED
                      ? "Fixed Amounts"
                      : "Percentage Based"}
                  </Typography>
                </Grid>
                {tournament.prizeDistributionType ===
                PrizeDistributionType.FIXED ? (
                  <>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Gold Prize
                      </Typography>
                      <Typography variant="body1">
                        {tournament.prizeGold
                          ? formatCurrency(tournament.prizeGold)
                          : "Not set"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Silver Prize
                      </Typography>
                      <Typography variant="body1">
                        {tournament.prizeSilver
                          ? formatCurrency(tournament.prizeSilver)
                          : "Not set"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Bronze Prize
                      </Typography>
                      <Typography variant="body1">
                        {tournament.prizeBronze
                          ? formatCurrency(tournament.prizeBronze)
                          : "Not set"}
                      </Typography>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Gold Percentage
                      </Typography>
                      <Typography variant="body1">
                        {tournament.prizeGoldPercentage
                          ? `${tournament.prizeGoldPercentage}%`
                          : "Not set"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Silver Percentage
                      </Typography>
                      <Typography variant="body1">
                        {tournament.prizeSilverPercentage
                          ? `${tournament.prizeSilverPercentage}%`
                          : "Not set"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Bronze Percentage
                      </Typography>
                      <Typography variant="body1">
                        {tournament.prizeBronzePercentage
                          ? `${tournament.prizeBronzePercentage}%`
                          : "Not set"}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Limits */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Line Limits
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Minimum Lines
                  </Typography>
                  <Typography variant="body1">{tournament.minLines}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Maximum Lines
                  </Typography>
                  <Typography variant="body1">{tournament.maxLines}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withPageRequiredAuth(TournamentDetailPageContent, [
  RoleEnum.ADMIN,
]);
