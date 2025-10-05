"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsIcon from "@mui/icons-material/Sports";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Match, MatchStatus, MatchResult } from "@/services/api/types/match";
import { Tournament } from "@/services/api/types/tournament";
import { getMatch, setMatchResult } from "@/services/api/services/matches";
import { getTournamentById } from "@/services/api/services/tournaments";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useSnackbar } from "@/hooks/use-snackbar";
import Grid from "@mui/material/Grid";

const MatchDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();

  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultData, setResultData] = useState({
    result: "",
    homeScore: "",
    awayScore: "",
    status: MatchStatus.FINISHED,
  });

  const loadMatch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMatch(matchId);
      const matchData = response.data as Match;
      setMatch(matchData);

      // Load tournament data
      if (matchData.tournamentId) {
        const tournamentResponse = await getTournamentById(
          matchData.tournamentId as any
        );
        setTournament(tournamentResponse.data as Tournament);
      }

      // Set initial result data
      setResultData({
        result: matchData.result || "",
        homeScore: matchData.homeScore?.toString() || "",
        awayScore: matchData.awayScore?.toString() || "",
        status: matchData.status,
      });
    } catch (error) {
      console.error("Failed to load match:", error);
      setError("Failed to load match details");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const handleSetResult = async () => {
    try {
      setSaving(true);
      await setMatchResult(matchId, {
        result: resultData.result,
        homeScore: resultData.homeScore
          ? parseInt(resultData.homeScore)
          : undefined,
        awayScore: resultData.awayScore
          ? parseInt(resultData.awayScore)
          : undefined,
        status: resultData.status,
      });
      enqueueSnackbar("Match result updated successfully!", {
        variant: "success",
      });
      loadMatch(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to update match result:", error);
      enqueueSnackbar("Failed to update match result", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return "default";
      case MatchStatus.LIVE:
        return "error";
      case MatchStatus.FINISHED:
        return "success";
      case MatchStatus.CANCELLED:
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return "Scheduled";
      case MatchStatus.LIVE:
        return "Live";
      case MatchStatus.FINISHED:
        return "Finished";
      case MatchStatus.CANCELLED:
        return "Cancelled";
      default:
        return status;
    }
  };

  const getResultLabel = (result: MatchResult) => {
    switch (result) {
      case MatchResult.HOME:
        return "Home Win";
      case MatchResult.DRAW:
        return "Draw";
      case MatchResult.AWAY:
        return "Away Win";
      default:
        return "Not Set";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    loadMatch();
  }, [matchId, loadMatch]);

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

  if (!match) {
    return (
      <Box p={3}>
        <Alert severity="warning">Match not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Match Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Match Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Match Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Home Team
                  </Typography>
                  <Typography variant="h6">{match.homeTeam}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Away Team
                  </Typography>
                  <Typography variant="h6">{match.awayTeam}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Sport Type
                  </Typography>
                  <Chip
                    label={match.sportType}
                    icon={<SportsIcon />}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(match.status)}
                    color={
                      getStatusColor(match.status) as
                        | "default"
                        | "primary"
                        | "secondary"
                        | "error"
                        | "info"
                        | "success"
                        | "warning"
                    }
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Match Order
                  </Typography>
                  <Typography variant="body1">{match.matchOrder}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Start Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(match.startsAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tournament Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tournament
              </Typography>
              {tournament ? (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Tournament Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {tournament.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      router.push(`/admin-panel/tournaments/${tournament.id}`)
                    }
                  >
                    View Tournament
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No tournament information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Current Result */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Result
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Result
                  </Typography>
                  <Typography variant="body1">
                    {match.result ? getResultLabel(match.result) : "Not Set"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Home Score
                  </Typography>
                  <Typography variant="body1">
                    {match.homeScore !== null ? match.homeScore : "-"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Away Score
                  </Typography>
                  <Typography variant="body1">
                    {match.awayScore !== null ? match.awayScore : "-"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Set Result */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Set Match Result
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Result</InputLabel>
                    <Select
                      value={resultData.result}
                      onChange={(e) =>
                        setResultData((prev) => ({
                          ...prev,
                          result: e.target.value,
                        }))
                      }
                      label="Result"
                    >
                      <MenuItem value={MatchResult.HOME}>Home Win</MenuItem>
                      <MenuItem value={MatchResult.DRAW}>Draw</MenuItem>
                      <MenuItem value={MatchResult.AWAY}>Away Win</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Home Score"
                    type="number"
                    value={resultData.homeScore}
                    onChange={(e) =>
                      setResultData((prev) => ({
                        ...prev,
                        homeScore: e.target.value,
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Away Score"
                    type="number"
                    value={resultData.awayScore}
                    onChange={(e) =>
                      setResultData((prev) => ({
                        ...prev,
                        awayScore: e.target.value,
                      }))
                    }
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={resultData.status}
                      onChange={(e) =>
                        setResultData((prev) => ({
                          ...prev,
                          status: e.target.value as MatchStatus,
                        }))
                      }
                      label="Status"
                    >
                      <MenuItem value={MatchStatus.SCHEDULED}>
                        Scheduled
                      </MenuItem>
                      <MenuItem value={MatchStatus.LIVE}>Live</MenuItem>
                      <MenuItem value={MatchStatus.FINISHED}>Finished</MenuItem>
                      <MenuItem value={MatchStatus.CANCELLED}>
                        Cancelled
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    onClick={handleSetResult}
                    disabled={saving || !resultData.result}
                    startIcon={<EditIcon />}
                  >
                    {saving ? "Updating..." : "Update Result"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withPageRequiredAuth(MatchDetailPageContent, {
  roles: [RoleEnum.ADMIN],
});
