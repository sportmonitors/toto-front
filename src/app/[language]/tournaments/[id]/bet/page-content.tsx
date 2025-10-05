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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
            Loading tournament data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!tournament || !canBet) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          px: isMobile ? 2 : 3,
          background: theme.palette.background.gradient,
          minHeight: "100vh",
        }}
      >
        <Box textAlign="center" py={isMobile ? 6 : 8}>
          <SportsSoccerIcon
            sx={{
              fontSize: isMobile ? 48 : 64,
              color: "error.main",
              mb: 2,
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            gutterBottom
            sx={{
              fontSize: isMobile ? "1.25rem" : undefined,
              fontWeight: 600,
              color: theme.palette.error.main,
            }}
          >
            Betting is closed for this tournament
          </Typography>
          <Typography
            variant={isMobile ? "body2" : "body1"}
            sx={{
              fontSize: isMobile ? "0.875rem" : undefined,
              maxWidth: isMobile ? "280px" : "400px",
              mx: "auto",
              color: theme.palette.text.secondary,
              mb: 3,
            }}
          >
            This tournament is no longer accepting bets.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.back()}
            sx={{
              fontSize: isMobile ? "0.875rem" : undefined,
              py: isMobile ? 1 : undefined,
              fontWeight: 600,
            }}
          >
            Go Back
          </Button>
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
        {/* Tournament Header */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                gutterBottom
                sx={{
                  fontSize: isMobile ? "1.5rem" : undefined,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: theme.palette.text.primary,
                }}
              >
                {tournament.name}
              </Typography>
              {tournament.description && (
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  color="text.secondary"
                  paragraph
                  sx={{
                    fontSize: isMobile ? "0.875rem" : undefined,
                    lineHeight: isMobile ? 1.3 : undefined,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {tournament.description}
                </Typography>
              )}
              <Box
                display="flex"
                gap={isMobile ? 1 : 2}
                alignItems="center"
                flexDirection={isMobile ? "column" : "row"}
                sx={{ mt: isMobile ? 2 : 0 }}
              >
                <Chip
                  label={`$${tournament.linePrice} per line`}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: isMobile ? "0.75rem" : undefined,
                    height: isMobile ? 24 : undefined,
                  }}
                />
                <Chip
                  label={`Betting closes: ${format(new Date(tournament.cutoffTime), "PPp")}`}
                  color="warning"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    fontSize: isMobile ? "0.75rem" : undefined,
                    height: isMobile ? 24 : undefined,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Matches */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            gutterBottom
            sx={{
              fontSize: isMobile ? "1.25rem" : undefined,
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Select Your Predictions
          </Typography>
          <Typography
            variant={isMobile ? "body2" : "body1"}
            color="text.secondary"
            paragraph
            sx={{
              fontSize: isMobile ? "0.875rem" : undefined,
              lineHeight: isMobile ? 1.3 : undefined,
              color: theme.palette.text.secondary,
            }}
          >
            Choose 1-3 outcomes for each match. More selections = more lines =
            higher cost but better winning chances.
          </Typography>

          {isMobile ? (
            // Mobile: Card-based layout
            <Grid container spacing={2}>
              {matches.map((match) => {
                const matchSelections =
                  selections.find((s) => s.matchId === match.id)
                    ?.selectedResults || [];

                return (
                  <Grid size={{ xs: 12 }} key={match.id}>
                    <Card
                      sx={{
                        backgroundColor: "#ffffff",
                        borderRadius: 2,
                        boxShadow: 1,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={1.5}>
                          <SportsSoccerIcon
                            sx={{
                              mr: 1,
                              color: "primary.main",
                              fontSize: "1rem",
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                            }}
                          >
                            Match {match.matchOrder}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          mb={1}
                          sx={{
                            fontSize: "0.875rem",
                            lineHeight: 1.3,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {match.homeTeam} vs {match.awayTeam}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={1.5}
                          sx={{
                            fontSize: "0.8rem",
                            lineHeight: 1.3,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {format(new Date(match.startsAt), "MMM dd, HH:mm")}
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
                            size="small"
                          >
                            1
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
                            size="small"
                          >
                            X
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
                            size="small"
                          >
                            2
                          </Button>
                        </ButtonGroup>

                        {matchSelections.length > 0 && (
                          <Box mt={1}>
                            <Typography
                              variant="body2"
                              color="primary"
                              sx={{
                                fontSize: "0.8rem",
                                lineHeight: 1.3,
                                fontWeight: 500,
                              }}
                            >
                              Selected: {matchSelections.join(", ")} (
                              {matchSelections.length} option
                              {matchSelections.length > 1 ? "s" : ""})
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            // Desktop: Table layout
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Match</TableCell>
                    <TableCell>Teams</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell align="center">Home (1)</TableCell>
                    <TableCell align="center">Draw (X)</TableCell>
                    <TableCell align="center">Away (2)</TableCell>
                    <TableCell>Selected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((match) => {
                    const matchSelections =
                      selections.find((s) => s.matchId === match.id)
                        ?.selectedResults || [];

                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <SportsSoccerIcon
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              #{match.matchOrder}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {match.homeTeam} vs {match.awayTeam}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(match.startsAt), "MMM dd, HH:mm")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={
                              matchSelections.includes(MatchResult.HOME)
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() =>
                              toggleSelection(match.id, MatchResult.HOME)
                            }
                            size="small"
                            sx={{ minWidth: 60 }}
                          >
                            1
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={
                              matchSelections.includes(MatchResult.DRAW)
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() =>
                              toggleSelection(match.id, MatchResult.DRAW)
                            }
                            size="small"
                            sx={{ minWidth: 60 }}
                          >
                            X
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={
                              matchSelections.includes(MatchResult.AWAY)
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() =>
                              toggleSelection(match.id, MatchResult.AWAY)
                            }
                            size="small"
                            sx={{ minWidth: 60 }}
                          >
                            2
                          </Button>
                        </TableCell>
                        <TableCell>
                          {matchSelections.length > 0 ? (
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                              {matchSelections.map((result) => (
                                <Chip
                                  key={result}
                                  label={result}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              None selected
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>

        {/* Bet Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              position: "sticky",
              top: 20,
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
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontSize: isMobile ? "1.125rem" : undefined,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Bet Summary
              </Typography>

              <Box mb={isMobile ? 1.5 : 2}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    color: theme.palette.text.primary,
                  }}
                >
                  Completed Matches: {calculateBet.validSelections} /{" "}
                  {matches.length}
                </Typography>
              </Box>

              <Divider sx={{ my: isMobile ? 1.5 : 2 }} />

              <Box mb={isMobile ? 0.75 : 1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    color: theme.palette.text.primary,
                  }}
                >
                  Total Lines:{" "}
                  <strong>{calculateBet.totalLines.toLocaleString()}</strong>
                </Typography>
              </Box>

              <Box mb={isMobile ? 0.75 : 1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    color: theme.palette.text.primary,
                  }}
                >
                  Line Price: <strong>${tournament.linePrice}</strong>
                </Typography>
              </Box>

              <Box mb={isMobile ? 1.5 : 2}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  color="primary"
                  sx={{
                    fontSize: isMobile ? "1.125rem" : undefined,
                    fontWeight: 600,
                  }}
                >
                  Total Cost:{" "}
                  <strong>${calculateBet.totalAmount.toFixed(2)}</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: isMobile ? 1.5 : 2 }} />

              <Box mb={isMobile ? 1.5 : 2}>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  <strong>Prize Structure:</strong>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    color: theme.palette.text.primary,
                  }}
                >
                  🥇 Gold (0 wrong): ${tournament.prizeGold || 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    color: theme.palette.text.primary,
                  }}
                >
                  🥈 Silver (1 wrong): ${tournament.prizeSilver || 0}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.8rem" : undefined,
                    color: theme.palette.text.primary,
                  }}
                >
                  🥉 Bronze (2 wrong): ${tournament.prizeBronze || 0}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size={isMobile ? "medium" : "large"}
                onClick={handleSubmitBet}
                disabled={!calculateBet.isValid || submitting}
                sx={{
                  fontSize: isMobile ? "0.875rem" : undefined,
                  py: isMobile ? 1.5 : undefined,
                  fontWeight: 600,
                }}
              >
                {submitting
                  ? "Placing Bet..."
                  : `Place Bet - $${calculateBet.totalAmount.toFixed(2)}`}
              </Button>

              {!calculateBet.isValid && calculateBet.validSelections > 0 && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    mt: 1,
                    fontSize: isMobile ? "0.8rem" : undefined,
                    lineHeight: isMobile ? 1.3 : undefined,
                  }}
                >
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
