"use client";

import { useSnackbar } from "@/hooks/use-snackbar";
import { getMatch, setMatchResult } from "@/services/api/services/matches";
import { getTournamentById } from "@/services/api/services/tournaments";
import { Match, MatchResult, MatchStatus } from "@/services/api/types/match";
import { RoleEnum } from "@/services/api/types/role";
import { Tournament } from "@/services/api/types/tournament";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SportsIcon from "@mui/icons-material/Sports";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const MatchDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
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
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!match) {
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
          <Alert severity="warning">Match not found</Alert>
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
      <Box
        display="flex"
        alignItems={isMobile ? "flex-start" : "center"}
        flexDirection={isMobile ? "column" : "row"}
        mb={3}
        pt={isMobile ? 2 : 3}
        gap={isMobile ? 2 : 0}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            mr: isMobile ? 0 : 2,
            backgroundColor: "#093453",
            color: "white",
            fontWeight: 600,
            borderRadius: 2,
            fontSize: isMobile ? "0.875rem" : "1rem",
            py: isMobile ? 1 : 1.5,
            px: isMobile ? 2 : 3,
            "&:hover": {
              backgroundColor: "#0a3d5f",
            },
          }}
        >
          Back
        </Button>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            textAlign: isMobile ? "center" : "left",
            width: isMobile ? "100%" : "auto",
          }}
        >
          Match Details
        </Typography>
      </Box>

      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Match Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 3,
              boxShadow: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant={isMobile ? "h6" : "h6"}
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: isMobile ? "1.1rem" : "1.25rem",
                }}
              >
                Match Information
              </Typography>
              <Grid container spacing={isMobile ? 1.5 : 2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000",
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      mb: 0.5,
                    }}
                  >
                    Home Team
                  </Typography>
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    sx={{
                      fontWeight: 600,
                      color: "#333333",
                      fontSize: isMobile ? "1rem" : "1.25rem",
                    }}
                  >
                    {match.homeTeam}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000",
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      mb: 0.5,
                    }}
                  >
                    Away Team
                  </Typography>
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    sx={{
                      fontWeight: 600,
                      color: "#333333",
                      fontSize: isMobile ? "1rem" : "1.25rem",
                    }}
                  >
                    {match.awayTeam}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000",
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      mb: 0.5,
                    }}
                  >
                    Sport Type
                  </Typography>
                  <Chip
                    label={match.sportType}
                    icon={<SportsIcon />}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      backgroundColor: "#4caf50",
                      color: "white",
                      fontWeight: 600,
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000",
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      mb: 0.5,
                    }}
                  >
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
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      backgroundColor:
                        getStatusColor(match.status) === "success"
                          ? "#4caf50"
                          : getStatusColor(match.status) === "error"
                            ? "#f44336"
                            : getStatusColor(match.status) === "warning"
                              ? "#ff9800"
                              : "#666",
                      color: "white",
                      fontWeight: 600,
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000",
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      mb: 0.5,
                    }}
                  >
                    Match Order
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "#333333",
                      fontSize: isMobile ? "1rem" : "1rem",
                    }}
                  >
                    {match.matchOrder}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    flexDirection={isMobile ? "column" : "row"}
                    gap={isMobile ? 1 : 0}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      width={isMobile ? "100%" : "auto"}
                    >
                      <ScheduleIcon
                        sx={{
                          mr: 1,
                          color: "#666666",
                          fontSize: isMobile ? "1.2rem" : "1.5rem",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000",
                          fontSize: isMobile ? "0.8rem" : "0.875rem",
                        }}
                      >
                        Start Time
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: "#333333",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        textAlign: isMobile ? "center" : "left",
                        width: isMobile ? "100%" : "auto",
                      }}
                    >
                      {formatDate(match.startsAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tournament Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 3,
              boxShadow: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              >
                Tournament
              </Typography>
              {tournament ? (
                <Box>
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    Tournament Name
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: "#333333",
                    }}
                  >
                    {tournament.name}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      router.push(`/admin-panel/tournaments/${tournament.id}`)
                    }
                    sx={{
                      backgroundColor: "#093453",
                      color: "white",
                      fontWeight: 600,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#0a3d5f",
                      },
                    }}
                  >
                    View Tournament
                  </Button>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666666",
                    fontWeight: 600,
                  }}
                >
                  No tournament information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Current Result */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 3,
              boxShadow: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              >
                Current Result
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    Result
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "#333333",
                    }}
                  >
                    {match.result ? getResultLabel(match.result) : "Not Set"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    Home Score
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "#333333",
                    }}
                  >
                    {match.homeScore !== null ? match.homeScore : "-"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    Away Score
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {match.awayScore !== null ? match.awayScore : "-"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Set Result */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 3,
              boxShadow: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              >
                Set Match Result
              </Typography>
              <Grid container spacing={isMobile ? 1.5 : 2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: theme.palette.primary.main }}>
                      Result
                    </InputLabel>
                    <Select
                      value={resultData.result}
                      onChange={(e) =>
                        setResultData((prev) => ({
                          ...prev,
                          result: e.target.value,
                        }))
                      }
                      label="Result"
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                        "& .MuiSelect-select": {
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                        },
                        "& .MuiSelect-icon": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem
                        value={MatchResult.HOME}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Home Win
                      </MenuItem>
                      <MenuItem
                        value={MatchResult.DRAW}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Draw
                      </MenuItem>
                      <MenuItem
                        value={MatchResult.AWAY}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Away Win
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                      "& .MuiInputLabel-root": {
                        color: theme.palette.primary.main,
                      },
                      "&.Mui-focused .MuiInputLabel-root": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                      "& .MuiInputLabel-root": {
                        color: theme.palette.primary.main,
                      },
                      "&.Mui-focused .MuiInputLabel-root": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: theme.palette.primary.main }}>
                      Status
                    </InputLabel>
                    <Select
                      value={resultData.status}
                      onChange={(e) =>
                        setResultData((prev) => ({
                          ...prev,
                          status: e.target.value as MatchStatus,
                        }))
                      }
                      label="Status"
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                        "& .MuiSelect-select": {
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                        },
                        "& .MuiSelect-icon": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <MenuItem
                        value={MatchStatus.SCHEDULED}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Scheduled
                      </MenuItem>
                      <MenuItem
                        value={MatchStatus.LIVE}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Live
                      </MenuItem>
                      <MenuItem
                        value={MatchStatus.FINISHED}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        Finished
                      </MenuItem>
                      <MenuItem
                        value={MatchStatus.CANCELLED}
                        sx={{
                          color: "#333333",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
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
                    fullWidth={isMobile}
                    sx={{
                      backgroundColor: "#093453",
                      color: "white",
                      fontWeight: 700,
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      borderRadius: 2,
                      py: isMobile ? 1.5 : 1.5,
                      px: isMobile ? 2 : 3,
                      minHeight: isMobile ? "48px" : "56px",
                      "&:hover": {
                        backgroundColor: "#0a3d5f",
                      },
                      "&:disabled": {
                        backgroundColor: "#ccc",
                        color: "#666",
                      },
                    }}
                  >
                    {saving ? "Updating..." : "Update Result"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default withPageRequiredAuth(MatchDetailPageContent, {
  roles: [RoleEnum.ADMIN],
});
