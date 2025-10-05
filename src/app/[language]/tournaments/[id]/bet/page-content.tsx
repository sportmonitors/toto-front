"use client";

import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
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

  const completedGames = matches.filter(
    (match) => match.status === "finished"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "primary";
      case "active":
        return "success";
      case "finished":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "Active";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          background: theme.palette.background.gradient,
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
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
          backgroundColor: theme.palette.background.default,
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
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Grid container spacing={isMobile ? 1 : 3} pt={isMobile ? 1 : 3}>
        {/* Pool Info Cards */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box minWidth={0} flex={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Status
                      </Typography>
                      <Box mt={0.5}>
                        <Chip
                          label={getStatusText(tournament.status)}
                          color={getStatusColor(tournament.status)}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>
                    <AccessTimeIcon
                      sx={{
                        fontSize: isMobile ? 16 : 20,
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box minWidth={0} flex={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Games Progress
                      </Typography>
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                          fontSize: isMobile ? "1rem" : "1.25rem",
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {completedGames}/{matches.length}
                      </Typography>
                    </Box>
                    <GroupIcon
                      sx={{
                        fontSize: isMobile ? 16 : 20,
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box minWidth={0} flex={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Your Score
                      </Typography>
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                          fontSize: isMobile ? "1rem" : "1.25rem",
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                        }}
                      >
                        0/{completedGames}
                      </Typography>
                    </Box>
                    <EmojiEventsIcon
                      sx={{
                        fontSize: isMobile ? 16 : 20,
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                  boxShadow: "none",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box minWidth={0} flex={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Participants
                      </Typography>
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                          fontSize: isMobile ? "1rem" : "1.25rem",
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {tournament.maxParticipants?.toLocaleString() || "N/A"}
                      </Typography>
                    </Box>
                    <GroupIcon
                      sx={{
                        fontSize: isMobile ? 16 : 20,
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Prize Information */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: isMobile ? 2 : 3,
              boxShadow: "none",
              mb: isMobile ? 2 : 3,
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                      }}
                    >
                      ${tournament.prizeGold || 0} Points
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: isMobile ? "0.7rem" : "0.75rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Perfect Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                      }}
                    >
                      ${tournament.prizeSilver || 0} Points
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: isMobile ? "0.7rem" : "0.75rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      One Wrong
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                      }}
                    >
                      ${tournament.prizeBronze || 0} Points
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: isMobile ? "0.7rem" : "0.75rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Two Wrong
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                      }}
                    >
                      $0 Points
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: isMobile ? "0.7rem" : "0.75rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      No Wrong
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Matches */}
        <Grid size={{ xs: 12, md: 8 }}>
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
                        boxShadow: "none",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: 1,
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

                        <ButtonGroup
                          variant="outlined"
                          fullWidth
                          sx={{ border: 0 }}
                        >
                          <Button
                            variant={
                              matchSelections.includes(MatchResult.HOME)
                                ? "contained"
                                : "outlined"
                            }
                            onClick={() =>
                              toggleSelection(match.id, MatchResult.HOME)
                            }
                            sx={{ flex: 1, borderRight: 0 }}
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
                            sx={{
                              flex: 1,
                            }}
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
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 2,
                boxShadow: "none",
                border: "1px solid #e0e0e0",
                backgroundColor: "#ffffff",
                "& .MuiTable-root": {
                  backgroundColor: "#ffffff",
                },
                "& .MuiTableHead-root": {
                  backgroundColor: "#f5f5f5",
                },
                "& .MuiTableBody-root": {
                  backgroundColor: "#ffffff",
                },
              }}
            >
              <Table sx={{ backgroundColor: "#ffffff" }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Match
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Teams
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Date & Time
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Home (1)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Draw (X)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Away (2)
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      Selected
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: "#ffffff" }}>
                  {matches.map((match) => {
                    const matchSelections =
                      selections.find((s) => s.matchId === match.id)
                        ?.selectedResults || [];

                    return (
                      <TableRow
                        key={match.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f9f9f9",
                          },
                          "&:nth-of-type(even)": {
                            backgroundColor: "#fafafa",
                          },
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center">
                            <SportsSoccerIcon
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              #{match.matchOrder}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={theme.palette.text.primary}
                          >
                            {match.homeTeam} vs {match.awayTeam}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant="body2"
                            color={theme.palette.text.secondary}
                          >
                            {format(new Date(match.startsAt), "MMM dd, HH:mm")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
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
                        <TableCell align="center" sx={{ py: 2 }}>
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
                        <TableCell align="center" sx={{ py: 2 }}>
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
                        <TableCell sx={{ py: 2 }}>
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
                            <Typography
                              variant="body2"
                              color={theme.palette.text.secondary}
                            >
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
        <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 2 }}>
          <Card
            sx={{
              position: "sticky",
              top: 20,
              backgroundColor: "#ffffff",
              borderRadius: isMobile ? 2 : 3,
              boxShadow: "none",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                sx={{
                  fontSize: isMobile ? "1.125rem" : undefined,
                  fontWeight: 600,
                  color: theme.palette.primary.main,
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
                    color: theme.palette.primary.main,
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
                size={isMobile ? "small" : "large"}
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

              {!calculateBet.isValid && calculateBet?.validSelections > 0 && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    mt: 1,
                    fontSize: isMobile ? "0.8rem" : undefined,
                    lineHeight: isMobile ? 1.3 : undefined,
                  }}
                >
                  {calculateBet?.validSelections < matches.length
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
