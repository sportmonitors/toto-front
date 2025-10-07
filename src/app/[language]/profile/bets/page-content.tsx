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
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/hooks/use-snackbar";
import { getTokensInfo } from "@/services/auth/auth-tokens-info";

function BetsPageContent() {
  const { t } = useTranslation("bets");
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      setLoading(true);

      // Get authentication token
      const tokens = getTokensInfo();
      if (!tokens?.token) {
        enqueueSnackbar("Authentication required", {
          variant: "error",
        });
        return;
      }

      const response = await getMyBets(tokens.token);
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
            {t("loading")}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: isMobile ? 2 : 3,
        py: isMobile ? 2 : 3,
        background: theme.palette.background.gradient,
        minHeight: "100vh",
        pb: isMobile ? 4 : 6,
      }}
    >
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Header */}
        <Grid size={{ xs: 12 }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            {t("title")}
          </Typography>
          <Typography
            variant={isMobile ? "body2" : "body1"}
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
            }}
          >
            {t("description")}
          </Typography>
        </Grid>

        {/* Bets List */}
        <Grid size={{ xs: 12 }}>
          {bets.length === 0 ? (
            <Box textAlign="center" py={isMobile ? 6 : 8}>
              <SportsIcon
                sx={{
                  fontSize: isMobile ? 48 : 64,
                  color: "text.secondary",
                  mb: 2,
                }}
              />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                gutterBottom
                sx={{
                  fontSize: isMobile ? "1.25rem" : undefined,
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                {t("noBets")}
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  fontSize: isMobile ? "0.875rem" : undefined,
                  maxWidth: isMobile ? "280px" : "400px",
                  mx: "auto",
                  color: theme.palette.text.secondary,
                }}
              >
                {t("noBetsDescription")}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {bets.map((bet) => (
                <Grid size={{ xs: 12 }} key={bet.id}>
                  <Accordion
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: 3,
                      boxShadow: "none",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                      },
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{
                            color: theme.palette.primary.main,
                          }}
                        />
                      }
                      sx={{
                        px: isMobile ? 2 : 3,
                        py: isMobile ? 1.5 : 2,
                        "& .MuiAccordionSummary-content": {
                          margin: isMobile ? "8px 0" : "12px 0",
                        },
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems={isMobile ? "flex-start" : "center"}
                        width="100%"
                        gap={isMobile ? 1 : 2}
                        flexDirection={isMobile ? "column" : "row"}
                      >
                        <Box flexGrow={1} width="100%">
                          <Typography
                            variant={isMobile ? "subtitle1" : "h6"}
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.primary.main,
                              mb: 0.5,
                            }}
                          >
                            {bet.tournament.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                            }}
                          >
                            {t("placedOn")}{" "}
                            {format(
                              new Date(bet.createdAt),
                              isMobile ? "MMM dd, HH:mm" : "PPp"
                            )}
                          </Typography>
                        </Box>

                        <Box
                          display="flex"
                          alignItems="center"
                          gap={isMobile ? 0.5 : 1}
                          flexWrap="wrap"
                          justifyContent={isMobile ? "flex-start" : "flex-end"}
                        >
                          <Chip
                            label={bet.status.toUpperCase()}
                            color={getStatusColor(bet.status)}
                            size={isMobile ? "small" : "small"}
                            sx={{
                              fontWeight: 600,
                              fontSize: isMobile ? "0.7rem" : "0.75rem",
                            }}
                          />

                          {bet.prizeGroup !== "none" && (
                            <Chip
                              label={`${getPrizeGroupIcon(bet.prizeGroup)} ${bet.prizeGroup.toUpperCase()}`}
                              color={getPrizeGroupColor(bet.prizeGroup)}
                              size={isMobile ? "small" : "small"}
                              sx={{
                                fontWeight: 600,
                                fontSize: isMobile ? "0.7rem" : "0.75rem",
                              }}
                            />
                          )}

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                            }}
                          >
                            ${Number(bet.totalAmount).toFixed(2)}
                          </Typography>

                          {bet.prizeAmount && Number(bet.prizeAmount) > 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#4caf50",
                                fontWeight: 700,
                                fontSize: isMobile ? "0.75rem" : "0.875rem",
                              }}
                            >
                              +${Number(bet.prizeAmount).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}
                    >
                      <Grid container spacing={isMobile ? 2 : 3}>
                        {/* Bet Summary */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                              height: "fit-content",
                            }}
                          >
                            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                  fontWeight: 700,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                {t("betSummary")}
                              </Typography>

                              <Box mb={1}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                  }}
                                >
                                  {t("totalLines")}:{" "}
                                  <strong
                                    style={{
                                      color: theme.palette.text.primary,
                                    }}
                                  >
                                    {bet.totalLines.toLocaleString()}
                                  </strong>
                                </Typography>
                              </Box>

                              <Box mb={1}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                  }}
                                >
                                  {t("linePrice")}:{" "}
                                  <strong
                                    style={{
                                      color: theme.palette.text.primary,
                                    }}
                                  >
                                    ${bet.linePrice}
                                  </strong>
                                </Typography>
                              </Box>

                              <Box mb={1}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                  }}
                                >
                                  {t("totalCost")}:{" "}
                                  <strong
                                    style={{
                                      color: theme.palette.text.primary,
                                    }}
                                  >
                                    ${Number(bet.totalAmount).toFixed(2)}
                                  </strong>
                                </Typography>
                              </Box>

                              {bet.status !== "pending" &&
                                bet.status !== "active" && (
                                  <>
                                    <Box mb={1}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: theme.palette.text.secondary,
                                        }}
                                      >
                                        {t("wrongPredictions")}:{" "}
                                        <strong
                                          style={{
                                            color: theme.palette.text.primary,
                                          }}
                                        >
                                          {bet.wrongPredictions}
                                        </strong>
                                      </Typography>
                                    </Box>

                                    {bet.prizeAmount && bet.prizeAmount > 0 && (
                                      <Box mb={1}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "#4caf50",
                                          }}
                                        >
                                          {t("prizeWon")}:{" "}
                                          <strong>
                                            $
                                            {Number(bet.prizeAmount).toFixed(2)}
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
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.primary.main,
                            }}
                          >
                            {t("matchSelections")}
                          </Typography>

                          <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{
                              backgroundColor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <Table size={isMobile ? "small" : "small"}>
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: theme.palette.text.primary,
                                      fontSize: isMobile
                                        ? "0.75rem"
                                        : "0.875rem",
                                      padding: isMobile ? "8px 4px" : "16px",
                                    }}
                                  >
                                    {t("match")}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: theme.palette.text.primary,
                                      fontSize: isMobile
                                        ? "0.75rem"
                                        : "0.875rem",
                                      padding: isMobile ? "8px 4px" : "16px",
                                    }}
                                  >
                                    {t("teams")}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: theme.palette.text.primary,
                                      fontSize: isMobile
                                        ? "0.75rem"
                                        : "0.875rem",
                                      padding: isMobile ? "8px 4px" : "16px",
                                    }}
                                  >
                                    {t("selected")}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: theme.palette.text.primary,
                                      fontSize: isMobile
                                        ? "0.75rem"
                                        : "0.875rem",
                                      padding: isMobile ? "8px 4px" : "16px",
                                    }}
                                  >
                                    {t("result")}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: 700,
                                      color: theme.palette.text.primary,
                                      fontSize: isMobile
                                        ? "0.75rem"
                                        : "0.875rem",
                                      padding: isMobile ? "8px 4px" : "16px",
                                    }}
                                  >
                                    {t("status")}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {bet.selections.map((selection) => (
                                  <TableRow
                                    key={selection.id}
                                    sx={{
                                      "&:hover": {
                                        backgroundColor: "#f8f9fa",
                                      },
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: theme.palette.text.primary,
                                        fontSize: isMobile
                                          ? "0.7rem"
                                          : "0.875rem",
                                        padding: isMobile ? "8px 4px" : "16px",
                                      }}
                                    >
                                      #{selection.match.matchOrder}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        padding: isMobile ? "8px 4px" : "16px",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 600,
                                          color: theme.palette.text.primary,
                                          fontSize: isMobile
                                            ? "0.7rem"
                                            : "0.875rem",
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        {selection.match.homeTeam} vs{" "}
                                        {selection.match.awayTeam}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: theme.palette.text.secondary,
                                          fontSize: isMobile
                                            ? "0.65rem"
                                            : "0.75rem",
                                        }}
                                      >
                                        {format(
                                          new Date(selection.match.startsAt),
                                          isMobile ? "MMM dd" : "MMM dd, HH:mm"
                                        )}
                                      </Typography>
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        padding: isMobile ? "8px 4px" : "16px",
                                      }}
                                    >
                                      <Box
                                        display="flex"
                                        gap={isMobile ? 0.25 : 0.5}
                                        flexWrap="wrap"
                                      >
                                        {selection.selectedResults.map(
                                          (result) => (
                                            <Chip
                                              key={result}
                                              label={result}
                                              size="small"
                                              variant="outlined"
                                              sx={{
                                                fontWeight: 600,
                                                color:
                                                  theme.palette.primary.main,
                                                borderColor:
                                                  theme.palette.primary.main,
                                                fontSize: isMobile
                                                  ? "0.65rem"
                                                  : "0.75rem",
                                                height: isMobile
                                                  ? "20px"
                                                  : "24px",
                                                "&:hover": {
                                                  backgroundColor:
                                                    theme.palette.primary.main,
                                                  color: "white",
                                                },
                                              }}
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
                                          sx={{
                                            fontWeight: 600,
                                          }}
                                        />
                                      ) : (
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: theme.palette.text.secondary,
                                          }}
                                        >
                                          {t("pending")}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: "1.2rem",
                                        }}
                                      >
                                        {selection.match.result
                                          ? selection.isWinning
                                            ? "✅"
                                            : "❌"
                                          : "⏳"}
                                      </Typography>
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
