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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Sports as SportsIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Match,
  MatchStatus,
  MatchResult,
  SportType,
} from "@/services/api/types/match";
import { Tournament } from "@/services/api/types/tournament";
import { getTournamentById } from "@/services/api/services/tournaments";
import {
  getMatchesByTournament,
  createMatch,
  updateMatch,
} from "@/services/api/services/matches";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useTranslation } from "react-i18next";

const TournamentMatchesPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("tournaments");

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    startsAt: new Date(),
    sportType: SportType.FOOTBALL,
    matchOrder: 1,
  });

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tournamentResponse, matchesResponse] = await Promise.all([
        getTournamentById(Number(tournamentId)),
        getMatchesByTournament(Number(tournamentId)),
      ]);

      setTournament(tournamentResponse.data);
      setMatches(matchesResponse.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load tournament and matches data");
    } finally {
      setLoading(false);
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
        return t("matches.statusLabels.scheduled");
      case MatchStatus.LIVE:
        return t("matches.statusLabels.live");
      case MatchStatus.FINISHED:
        return t("matches.statusLabels.finished");
      case MatchStatus.CANCELLED:
        return t("matches.statusLabels.cancelled");
      default:
        return status;
    }
  };

  const getResultLabel = (result: MatchResult) => {
    switch (result) {
      case MatchResult.HOME:
        return t("matches.resultLabels.homeWin");
      case MatchResult.DRAW:
        return t("matches.resultLabels.draw");
      case MatchResult.AWAY:
        return t("matches.resultLabels.awayWin");
      default:
        return t("matches.resultLabels.notSet");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCreateMatch = async () => {
    try {
      await createMatch({
        ...formData,
        tournamentId: Number(tournamentId),
      });
      enqueueSnackbar("Match created successfully!", {
        variant: "success",
      });
      setCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Failed to create match:", error);
      enqueueSnackbar("Failed to create match", {
        variant: "error",
      });
    }
  };

  const handleUpdateMatch = async () => {
    if (!selectedMatch) return;

    try {
      await updateMatch(selectedMatch.id, formData);
      enqueueSnackbar("Match updated successfully!", {
        variant: "success",
      });
      setEditDialogOpen(false);
      setSelectedMatch(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Failed to update match:", error);
      enqueueSnackbar("Failed to update match", {
        variant: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      homeTeam: "",
      awayTeam: "",
      startsAt: new Date(),
      sportType: SportType.FOOTBALL,
      matchOrder: 1,
    });
  };

  const openEditDialog = (match: Match) => {
    setSelectedMatch(match);
    setFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      startsAt: new Date(match.startsAt),
      sportType: match.sportType,
      matchOrder: match.matchOrder,
    });
    setEditDialogOpen(true);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h4" component="h1">
              {t("matches.title")}
            </Typography>
            {tournament && (
              <Typography variant="subtitle1" color="textSecondary">
                {tournament.name}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t("matches.addMatch")}
          </Button>
        </Box>

        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("matches.order")}</TableCell>
                    <TableCell>{t("matches.teams")}</TableCell>
                    <TableCell>{t("matches.sport")}</TableCell>
                    <TableCell>{t("matches.startTime")}</TableCell>
                    <TableCell>{t("matches.status")}</TableCell>
                    <TableCell>{t("matches.result")}</TableCell>
                    <TableCell>{t("matches.score")}</TableCell>
                    <TableCell>{t("matches.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{match.matchOrder}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {match.homeTeam} vs {match.awayTeam}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={match.sportType}
                          size="small"
                          icon={<SportsIcon />}
                        />
                      </TableCell>
                      <TableCell>{formatDate(match.startsAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(match.status)}
                          color={getStatusColor(match.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {match.result ? getResultLabel(match.result) : "-"}
                      </TableCell>
                      <TableCell>
                        {match.homeScore !== null && match.awayScore !== null
                          ? `${match.homeScore} - ${match.awayScore}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(match)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(`/admin-panel/matches/${match.id}`)
                          }
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Create Match Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t("matches.createNewMatch")}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("matches.homeTeam")}
                  value={formData.homeTeam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      homeTeam: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("matches.awayTeam")}
                  value={formData.awayTeam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      awayTeam: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("matches.matchOrder")}
                  type="number"
                  value={formData.matchOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      matchOrder: parseInt(e.target.value),
                    }))
                  }
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("matches.sportType")}</InputLabel>
                  <Select
                    value={formData.sportType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sportType: e.target.value as SportType,
                      }))
                    }
                    label={t("matches.sportType")}
                  >
                    <MenuItem value={SportType.FOOTBALL}>Football</MenuItem>
                    <MenuItem value={SportType.BASKETBALL}>Basketball</MenuItem>
                    <MenuItem value={SportType.VOLLEYBALL}>Volleyball</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <DateTimePicker
                  label={t("matches.startTime")}
                  value={formData.startsAt}
                  onChange={(newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      startsAt: newValue || new Date(),
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              {t("matches.cancel")}
            </Button>
            <Button onClick={handleCreateMatch} variant="contained">
              {t("matches.create")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Match Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t("matches.editMatch")}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("matches.homeTeam")}
                  value={formData.homeTeam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      homeTeam: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("matches.awayTeam")}
                  value={formData.awayTeam}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      awayTeam: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t("matches.matchOrder")}
                  type="number"
                  value={formData.matchOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      matchOrder: parseInt(e.target.value),
                    }))
                  }
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("matches.sportType")}</InputLabel>
                  <Select
                    value={formData.sportType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sportType: e.target.value as SportType,
                      }))
                    }
                    label={t("matches.sportType")}
                  >
                    <MenuItem value={SportType.FOOTBALL}>Football</MenuItem>
                    <MenuItem value={SportType.BASKETBALL}>Basketball</MenuItem>
                    <MenuItem value={SportType.VOLLEYBALL}>Volleyball</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <DateTimePicker
                  label={t("matches.startTime")}
                  value={formData.startsAt}
                  onChange={(newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      startsAt: newValue || new Date(),
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              {t("matches.cancel")}
            </Button>
            <Button onClick={handleUpdateMatch} variant="contained">
              {t("matches.update")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default withPageRequiredAuth(TournamentMatchesPageContent, [
  RoleEnum.ADMIN,
]);
