"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Tournament,
  TournamentStatus,
  PrizeDistributionType,
} from "@/services/api/types/tournament";
import {
  getTournamentById,
  updateTournament,
} from "@/services/api/services/tournaments";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { useSnackbar } from "@/hooks/use-snackbar";

const TournamentEditPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    cutoffTime: new Date(),
    linePrice: 1.6,
    status: TournamentStatus.DRAFT,
    prizeDistributionType: PrizeDistributionType.FIXED,
    prizeGold: 0,
    prizeSilver: 0,
    prizeBronze: 0,
    prizeGoldPercentage: 0,
    prizeSilverPercentage: 0,
    prizeBronzePercentage: 0,
    minLines: 1,
    maxLines: 10000,
    maxParticipants: 0,
    backgroundImage: "",
    backgroundColor: "",
    minValidMatches: 8,
  });

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTournamentById(Number(tournamentId));
      const tournamentData = response.data;
      setTournament(tournamentData);

      setFormData({
        name: tournamentData.name || "",
        description: tournamentData.description || "",
        startDate: new Date(tournamentData.startDate),
        endDate: new Date(tournamentData.endDate),
        cutoffTime: new Date(tournamentData.cutoffTime),
        linePrice: tournamentData.linePrice || 1.6,
        status: tournamentData.status,
        prizeDistributionType: tournamentData.prizeDistributionType,
        prizeGold: tournamentData.prizeGold || 0,
        prizeSilver: tournamentData.prizeSilver || 0,
        prizeBronze: tournamentData.prizeBronze || 0,
        prizeGoldPercentage: tournamentData.prizeGoldPercentage || 0,
        prizeSilverPercentage: tournamentData.prizeSilverPercentage || 0,
        prizeBronzePercentage: tournamentData.prizeBronzePercentage || 0,
        minLines: tournamentData.minLines || 1,
        maxLines: tournamentData.maxLines || 10000,
        maxParticipants: tournamentData.maxParticipants || 0,
        backgroundImage: tournamentData.backgroundImage || "",
        backgroundColor: tournamentData.backgroundColor || "",
        minValidMatches: tournamentData.minValidMatches || 8,
      });
    } catch (error) {
      console.error("Failed to load tournament:", error);
      setError("Failed to load tournament details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateTournament(tournamentId, formData);
      enqueueSnackbar("Tournament updated successfully!", {
        variant: "success",
      });
      router.push(`/admin-panel/tournaments/${tournamentId}`);
    } catch (error) {
      console.error("Failed to update tournament:", error);
      enqueueSnackbar("Failed to update tournament", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Tournament
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tournament Name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) =>
                            handleInputChange("status", e.target.value)
                          }
                          label="Status"
                        >
                          <MenuItem value={TournamentStatus.DRAFT}>
                            Draft
                          </MenuItem>
                          <MenuItem value={TournamentStatus.ACTIVE}>
                            Active
                          </MenuItem>
                          <MenuItem value={TournamentStatus.CLOSED}>
                            Closed
                          </MenuItem>
                          <MenuItem value={TournamentStatus.SETTLED}>
                            Settled
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>
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
                      <DateTimePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(date) =>
                          handleInputChange("startDate", date)
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DateTimePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(date) => handleInputChange("endDate", date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DateTimePicker
                        label="Betting Cutoff"
                        value={formData.cutoffTime}
                        onChange={(date) =>
                          handleInputChange("cutoffTime", date)
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tournament Settings */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tournament Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Line Price"
                        type="number"
                        value={formData.linePrice}
                        onChange={(e) =>
                          handleInputChange(
                            "linePrice",
                            parseFloat(e.target.value)
                          )
                        }
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Min Lines"
                        type="number"
                        value={formData.minLines}
                        onChange={(e) =>
                          handleInputChange(
                            "minLines",
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Max Lines"
                        type="number"
                        value={formData.maxLines}
                        onChange={(e) =>
                          handleInputChange(
                            "maxLines",
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Max Participants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) =>
                          handleInputChange(
                            "maxParticipants",
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 0 }}
                        helperText="0 = Unlimited"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Min Valid Matches"
                        type="number"
                        value={formData.minValidMatches}
                        onChange={(e) =>
                          handleInputChange(
                            "minValidMatches",
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Prize Settings */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Prize Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Prize Distribution Type</InputLabel>
                        <Select
                          value={formData.prizeDistributionType}
                          onChange={(e) =>
                            handleInputChange(
                              "prizeDistributionType",
                              e.target.value
                            )
                          }
                          label="Prize Distribution Type"
                        >
                          <MenuItem value={PrizeDistributionType.FIXED}>
                            Fixed Amounts
                          </MenuItem>
                          <MenuItem value={PrizeDistributionType.PERCENTAGE}>
                            Percentage Based
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {formData.prizeDistributionType ===
                    PrizeDistributionType.FIXED ? (
                      <>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Gold Prize"
                            type="number"
                            value={formData.prizeGold}
                            onChange={(e) =>
                              handleInputChange(
                                "prizeGold",
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Silver Prize"
                            type="number"
                            value={formData.prizeSilver}
                            onChange={(e) =>
                              handleInputChange(
                                "prizeSilver",
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Bronze Prize"
                            type="number"
                            value={formData.prizeBronze}
                            onChange={(e) =>
                              handleInputChange(
                                "prizeBronze",
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Gold Percentage"
                            type="number"
                            value={formData.prizeGoldPercentage}
                            onChange={(e) =>
                              handleInputChange(
                                "prizeGoldPercentage",
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0, max: 100 }}
                            helperText="Percentage of total bet amount"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Silver Percentage"
                            type="number"
                            value={formData.prizeSilverPercentage}
                            onChange={(e) =>
                              handleInputChange(
                                "prizeSilverPercentage",
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0, max: 100 }}
                            helperText="Percentage of total bet amount"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Bronze Percentage"
                            type="number"
                            value={formData.prizeBronzePercentage}
                            onChange={(e) =>
                              handleInputChange(
                                "prizeBronzePercentage",
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0, max: 100 }}
                            helperText="Percentage of total bet amount"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Visual Settings */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Visual Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Background Image URL"
                        value={formData.backgroundImage}
                        onChange={(e) =>
                          handleInputChange("backgroundImage", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Background Color"
                        value={formData.backgroundColor}
                        onChange={(e) =>
                          handleInputChange("backgroundColor", e.target.value)
                        }
                        placeholder="#ffffff"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? "Saving..." : "Update Tournament"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    router.push(`/admin-panel/tournaments/${tournamentId}`)
                  }
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default withPageRequiredAuth(TournamentEditPageContent, [
  RoleEnum.ADMIN,
]);
