"use client";

import { RoleEnum } from "@/services/api/types/role";
import { Bet } from "@/services/api/types/bet";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { getMyBets } from "@/services/api/services/bets";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SportsIcon from "@mui/icons-material/Sports";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/hooks/use-snackbar";

function BetsPageContent() {
  const { t } = useTranslation("bets");
  const { enqueueSnackbar } = useSnackbar();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      setLoading(true);
      const response = await getMyBets();
      setBets(response?.data || []);
    } catch (error) {
      console.error("Failed to load bets:", error);
      enqueueSnackbar("Failed to load your bets", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "active":
        return "success";
      case "finished":
        return "default";
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
        return "secondary";
      case "none":
        return "default";
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
      case "none":
        return "";
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
          <Typography>{t("loading")}</Typography>
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
            {t("title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {t("description")}
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
                    {t("noBets")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t("noBetsDescription")}
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
                            {t("placedOn")}{" "}
                            {format(new Date(bet.createdAt), "PPp")}
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
                                {t("betSummary")}
                              </Typography>

                              <Box mb={1}>
                                <Typography variant="body2">
                                  {t("totalLines")}:{" "}
                                  <strong>
                                    {bet.totalLines.toLocaleString()}
                                  </strong>
                                </Typography>
                              </Box>

                              <Box mb={1}>
                                <Typography variant="body2">
                                  {t("linePrice")}:{" "}
                                  <strong>${bet.linePrice}</strong>
                                </Typography>
                              </Box>

                              <Box mb={1}>
                                <Typography variant="body2">
                                  {t("totalCost")}:{" "}
                                  <strong>${bet.totalAmount.toFixed(2)}</strong>
                                </Typography>
                              </Box>

                              {bet.status !== "pending" &&
                                bet.status !== "active" && (
                                  <>
                                    <Box mb={1}>
                                      <Typography variant="body2">
                                        {t("wrongPredictions")}:{" "}
                                        <strong>{bet.wrongPredictions}</strong>
                                      </Typography>
                                    </Box>

                                    {bet.prizeAmount && bet.prizeAmount > 0 && (
                                      <Box mb={1}>
                                        <Typography
                                          variant="body2"
                                          color="success.main"
                                        >
                                          {t("prizeWon")}:{" "}
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
                            {t("matchSelections")}
                          </Typography>

                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>{t("match")}</TableCell>
                                  <TableCell>{t("teams")}</TableCell>
                                  <TableCell>{t("selected")}</TableCell>
                                  <TableCell>{t("result")}</TableCell>
                                  <TableCell>{t("status")}</TableCell>
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
                                          {t("pending")}
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
