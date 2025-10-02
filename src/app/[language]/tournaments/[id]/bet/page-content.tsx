"use client";

import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tournament } from "@/services/api/types/tournament";
import { Match, MatchResult } from "@/services/api/types/match";
import { getTournament } from "@/services/api/services/tournaments";
import { getMatchesByTournament } from "@/services/api/services/matches";
import { format } from "date-fns";
import { useSnackbar } from "@/hooks/use-snackbar";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { RoleEnum } from "@/services/api/types/role";

interface BetSelection {
  matchId: string | number;
  selectedResults: MatchResult[];
}

interface Props {
  tournamentId: string;
}

function BetPageContent({ tournamentId }: Props) {
  const { t } = useTranslation("tournaments");
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tournamentResponse, matchesResponse] = await Promise.all([
        getTournament(tournamentId),
        getMatchesByTournament(tournamentId),
      ]);
      //  console.log("tournamentResponse", tournamentResponse);
      //  console.log("matchesResponse", matchesResponse);

      setTournament(tournamentResponse?.data);
      const matches = matchesResponse?.data || [];
      setMatches(matches.sort((a, b) => a.matchOrder - b.matchOrder));

      // Initialize selections for all matches
      const initialSelections = matches.map((match) => ({
        matchId: match.id,
        selectedResults: [] as MatchResult[],
      }));
      setSelections(initialSelections);
    } catch (error) {
      console.error("Failed to load data:", error);
      enqueueSnackbar("Failed to load tournament data", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (matchId: string | number, result: MatchResult) => {
    setSelections((prev) =>
      prev.map((selection) => {
        if (selection.matchId === matchId) {
          const isSelected = selection.selectedResults.includes(result);
          if (isSelected) {
            return {
              ...selection,
              selectedResults: selection.selectedResults.filter(
                (r) => r !== result
              ),
            };
          } else {
            return {
              ...selection,
              selectedResults: [...selection.selectedResults, result],
            };
          }
        }
        return selection;
      })
    );
  };

  const calculateBet = useMemo(() => {
    const validSelections = selections.filter(
      (s) => s.selectedResults.length > 0
    );

    if (validSelections.length === 0) {
      return { totalLines: 0, totalAmount: 0, isValid: false };
    }

    // Calculate total lines: product of all selection counts
    const totalLines = validSelections.reduce(
      (product, selection) => product * selection.selectedResults.length,
      1
    );

    const linePrice = tournament?.linePrice || 0;
    const totalAmount = totalLines * linePrice;
    const maxLines = tournament?.maxLines || 10000;
    const minLines = tournament?.minLines || 1;

    const isValid =
      totalLines >= minLines &&
      totalLines <= maxLines &&
      validSelections.length === matches.length;

    return {
      totalLines,
      totalAmount,
      isValid,
      validSelections: validSelections.length,
    };
  }, [selections, tournament, matches.length]);

  const handleSubmitBet = async () => {
    if (!calculateBet.isValid) {
      enqueueSnackbar("Please complete all selections", {
        variant: "error",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare bet data
      const betData = {
        tournamentId: tournamentId,
        selections: selections
          .filter((s) => s.selectedResults.length > 0)
          .map((s) => ({
            matchId: s.matchId,
            selectedResults: s.selectedResults,
          })),
      };

      // TODO: Call API to create bet
      console.log("Submitting bet:", betData);

      enqueueSnackbar("Bet placed successfully!", {
        variant: "success",
      });
      router.push("/profile/bets");
    } catch (error) {
      console.error("Failed to place bet:", error);
      enqueueSnackbar("Failed to place bet", {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cutoffDate = tournament ? new Date(tournament.cutoffTime) : null;
  const canBet =
    tournament &&
    cutoffDate &&
    !isNaN(cutoffDate.getTime()) &&
    new Date() < cutoffDate &&
    tournament.status === "active";

  // Debug logging
  if (tournament) {
    const cutoffDate = new Date(tournament.cutoffTime);
    console.log("Tournament debug:", {
      status: tournament.status,
      cutoffTime: tournament.cutoffTime,
      currentTime: new Date().toISOString(),
      cutoffTimeDate: isNaN(cutoffDate.getTime())
        ? "Invalid Date"
        : cutoffDate.toISOString(),
      isBeforeCutoff: !isNaN(cutoffDate.getTime()) && new Date() < cutoffDate,
      canBet: canBet,
    });
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
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

  if (!tournament || !canBet) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={4}>
          <Typography variant="h5" color="error" gutterBottom>
            Betting is closed for this tournament
          </Typography>
          <Button variant="contained" onClick={() => router.back()}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        {/* Tournament Header */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {tournament.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {tournament.description}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <Chip
                  label={`$${tournament.linePrice} per line`}
                  color="primary"
                />
                <Chip
                  label={`Betting closes: ${format(new Date(tournament.cutoffTime), "PPp")}`}
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Matches */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" gutterBottom>
            Select Your Predictions
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose 1-3 outcomes for each match. More selections = more lines =
            higher cost but better winning chances.
          </Typography>

          <Grid container spacing={2}>
            {matches.map((match, index) => {
              const matchSelections =
                selections.find((s) => s.matchId === match.id)
                  ?.selectedResults || [];

              return (
                <Grid size={{ xs: 12 }} key={match.id}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <SportsSoccerIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Match {match.matchOrder}: {match.homeTeam} vs{" "}
                        {match.awayTeam}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {format(new Date(match.startsAt), "PPp")}
                    </Typography>

                    <ButtonGroup variant="outlined" fullWidth>
                      <Button
                        variant={
                          matchSelections.includes(MatchResult.HOME)
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() =>
                          toggleSelection(match.id, MatchResult.HOME)
                        }
                        sx={{ flex: 1 }}
                      >
                        1 - {match.homeTeam}
                      </Button>
                      <Button
                        variant={
                          matchSelections.includes(MatchResult.DRAW)
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() =>
                          toggleSelection(match.id, MatchResult.DRAW)
                        }
                        sx={{ flex: 1 }}
                      >
                        X - Draw
                      </Button>
                      <Button
                        variant={
                          matchSelections.includes(MatchResult.AWAY)
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() =>
                          toggleSelection(match.id, MatchResult.AWAY)
                        }
                        sx={{ flex: 1 }}
                      >
                        2 - {match.awayTeam}
                      </Button>
                    </ButtonGroup>

                    {matchSelections.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="body2" color="primary">
                          Selected: {matchSelections.join(", ")} (
                          {matchSelections.length} option
                          {matchSelections.length > 1 ? "s" : ""})
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Bet Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: "sticky", top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bet Summary
              </Typography>

              <Box mb={2}>
                <Typography variant="body2">
                  Completed Matches: {calculateBet.validSelections} /{" "}
                  {matches.length}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={1}>
                <Typography variant="body2">
                  Total Lines:{" "}
                  <strong>{calculateBet.totalLines.toLocaleString()}</strong>
                </Typography>
              </Box>

              <Box mb={1}>
                <Typography variant="body2">
                  Line Price: <strong>${tournament.linePrice}</strong>
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="h6" color="primary">
                  Total Cost:{" "}
                  <strong>${calculateBet.totalAmount.toFixed(2)}</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  <strong>Prize Structure:</strong>
                </Typography>
                <Typography variant="body2">
                  🥇 Gold (0 wrong): ${tournament.prizeGold || 0}
                </Typography>
                <Typography variant="body2">
                  🥈 Silver (1 wrong): ${tournament.prizeSilver || 0}
                </Typography>
                <Typography variant="body2">
                  🥉 Bronze (2 wrong): ${tournament.prizeBronze || 0}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmitBet}
                disabled={!calculateBet.isValid || submitting}
              >
                {submitting
                  ? "Placing Bet..."
                  : `Place Bet - $${calculateBet.totalAmount.toFixed(2)}`}
              </Button>

              {!calculateBet.isValid && calculateBet.validSelections > 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {calculateBet.validSelections < matches.length
                    ? "Please complete all matches"
                    : calculateBet.totalLines > (tournament.maxLines || 10000)
                      ? "Too many lines selected"
                      : calculateBet.totalLines < (tournament.minLines || 1)
                        ? "Not enough lines selected"
                        : "Invalid selection"}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(BetPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
