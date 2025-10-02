"use client";

import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SportsIcon from "@mui/icons-material/Sports";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { RoleEnum } from "@/services/api/types/role";

interface BetSelection {
  id: string | number;
  matchId: string | number;
  selectedResults: string[];
  isWinning?: boolean;
  match: {
    id: string | number;
    homeTeam: string;
    awayTeam: string;
    startsAt: string;
    result?: string;
    matchOrder: number;
  };
}

interface Bet {
  id: string | number;
  tournamentId: string | number;
  totalLines: number;
  totalAmount: number;
  linePrice: number;
  status: "pending" | "active" | "won" | "lost" | "void";
  wrongPredictions: number;
  prizeGroup: "gold" | "silver" | "bronze" | "none";
  prizeAmount?: number;
  isPaid: boolean;
  createdAt: string;
  tournament: {
    id: string | number;
    name: string;
    status: string;
  };
  selections: BetSelection[];
}

function BetsPageContent() {
  const { t } = useTranslation("bets");
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await getMyBets();

      // Mock data for now
      setBets([
        {
          id: "1",
          tournamentId: "1",
          totalLines: 6,
          totalAmount: 9.6,
          linePrice: 1.6,
          status: "won",
          wrongPredictions: 0,
          prizeGroup: "gold",
          prizeAmount: 1250.0,
          isPaid: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          tournament: {
            id: "1",
            name: "Premier League Week 1",
            status: "settled",
          },
          selections: [
            {
              id: "1",
              matchId: "1",
              selectedResults: ["1", "X"],
              isWinning: true,
              match: {
                id: "1",
                homeTeam: "Liverpool",
                awayTeam: "Manchester United",
                startsAt: new Date(Date.now() - 172800000).toISOString(),
                result: "1",
                matchOrder: 1,
              },
            },
            {
              id: "2",
              matchId: "2",
              selectedResults: ["X"],
              isWinning: true,
              match: {
                id: "2",
                homeTeam: "Chelsea",
                awayTeam: "Arsenal",
                startsAt: new Date(Date.now() - 172800000).toISOString(),
                result: "X",
                matchOrder: 2,
              },
            },
          ],
        },
        {
          id: "2",
          tournamentId: "2",
          totalLines: 3,
          totalAmount: 4.8,
          linePrice: 1.6,
          status: "active",
          wrongPredictions: 0,
          prizeGroup: "none",
          isPaid: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          tournament: {
            id: "2",
            name: "Premier League Week 2",
            status: "active",
          },
          selections: [
            {
              id: "3",
              matchId: "3",
              selectedResults: ["1"],
              match: {
                id: "3",
                homeTeam: "Manchester City",
                awayTeam: "Tottenham",
                startsAt: new Date(Date.now() + 86400000).toISOString(),
                matchOrder: 1,
              },
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Failed to load bets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "active":
        return "info";
      case "won":
        return "success";
      case "lost":
        return "error";
      case "void":
        return "default";
      default:
        return "default";
    }
  };

  const getPrizeGroupColor = (group: string) => {
    switch (group) {
      case "gold":
        return "warning";
      case "silver":
        return "default";
      case "bronze":
        return "error";
      default:
        return "default";
    }
  };

  const getPrizeGroupIcon = (group: string) => {
    switch (group) {
      case "gold":
        return "🥇";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography>Loading bets...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        {/* Header */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h3" gutterBottom>
            My Bets
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Track your betting history and winnings across all tournaments.
          </Typography>
        </Grid>

        {/* Bets List */}
        <Grid size={{ xs: 12 }}>
          {bets.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <SportsIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No bets placed yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start betting on active tournaments to see your bets here.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {bets.map((bet) => (
                <Grid size={{ xs: 12 }} key={bet.id}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        display="flex"
                        alignItems="center"
                        width="100%"
                        gap={2}
                      >
                        <Box flexGrow={1}>
                          <Typography variant="h6">
                            {bet.tournament.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Placed on {format(new Date(bet.createdAt), "PPp")}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={bet.status.toUpperCase()}
                            color={getStatusColor(bet.status)}
                            size="small"
                          />

                          {bet.prizeGroup !== "none" && (
                            <Chip
                              label={`${getPrizeGroupIcon(bet.prizeGroup)} ${bet.prizeGroup.toUpperCase()}`}
                              color={getPrizeGroupColor(bet.prizeGroup)}
                              size="small"
                            />
                          )}

                          <Typography variant="body2" fontWeight="medium">
                            ${bet.totalAmount.toFixed(2)}
                          </Typography>

                          {bet.prizeAmount && bet.prizeAmount > 0 && (
                            <Typography
                              variant="body2"
                              color="success.main"
                              fontWeight="medium"
                            >
                              +${bet.prizeAmount.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Bet Summary */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Bet Summary
                              </Typography>

                              <Box mb={1}>
                                <Typography variant="body2">
                                  Total Lines:{" "}
                                  <strong>
                                    {bet.totalLines.toLocaleString()}
                                  </strong>
                                </Typography>
                              </Box>

                              <Box mb={1}>
                                <Typography variant="body2">
                                  Line Price: <strong>${bet.linePrice}</strong>
                                </Typography>
                              </Box>

                              <Box mb={1}>
                                <Typography variant="body2">
                                  Total Cost:{" "}
                                  <strong>${bet.totalAmount.toFixed(2)}</strong>
                                </Typography>
                              </Box>

                              {bet.status !== "pending" &&
                                bet.status !== "active" && (
                                  <>
                                    <Box mb={1}>
                                      <Typography variant="body2">
                                        Wrong Predictions:{" "}
                                        <strong>{bet.wrongPredictions}</strong>
                                      </Typography>
                                    </Box>

                                    {bet.prizeAmount && bet.prizeAmount > 0 && (
                                      <Box mb={1}>
                                        <Typography
                                          variant="body2"
                                          color="success.main"
                                        >
                                          Prize Won:{" "}
                                          <strong>
                                            ${bet.prizeAmount.toFixed(2)}
                                          </strong>
                                        </Typography>
                                      </Box>
                                    )}
                                  </>
                                )}
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Selections */}
                        <Grid size={{ xs: 12, md: 8 }}>
                          <Typography variant="h6" gutterBottom>
                            Match Selections
                          </Typography>

                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Match</TableCell>
                                  <TableCell>Teams</TableCell>
                                  <TableCell>Selected</TableCell>
                                  <TableCell>Result</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {bet.selections.map((selection) => (
                                  <TableRow key={selection.id}>
                                    <TableCell>
                                      #{selection.match.matchOrder}
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {selection.match.homeTeam} vs{" "}
                                        {selection.match.awayTeam}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {format(
                                          new Date(selection.match.startsAt),
                                          "MMM dd, HH:mm"
                                        )}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box display="flex" gap={0.5}>
                                        {selection.selectedResults.map(
                                          (result) => (
                                            <Chip
                                              key={result}
                                              label={result}
                                              size="small"
                                              variant="outlined"
                                            />
                                          )
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      {selection.match.result ? (
                                        <Chip
                                          label={selection.match.result}
                                          size="small"
                                          color={
                                            selection.isWinning
                                              ? "success"
                                              : "error"
                                          }
                                        />
                                      ) : (
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          Pending
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {selection.match.result
                                        ? selection.isWinning
                                          ? "✅"
                                          : "❌"
                                        : "⏳"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(BetsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});

