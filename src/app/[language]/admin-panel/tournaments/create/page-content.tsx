"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TournamentStatus,
  PrizeDistributionType,
} from "@/services/api/types/tournament";
import { createTournament } from "@/services/api/services/tournaments";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSnackbar } from "@/hooks/use-snackbar";

function CreateTournamentAdmin() {
  const { t } = useTranslation("tournaments");
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    cutoffTime: new Date(),
    linePrice: 1.6,
    status: TournamentStatus.DRAFT,
    prizeDistributionType: PrizeDistributionType.FIXED,
    prizeGold: 5000,
    prizeSilver: 2000,
    prizeBronze: 1000,
    prizeGoldPercentage: 50,
    prizeSilverPercentage: 30,
    prizeBronzePercentage: 20,
    minLines: 1,
    maxLines: 10000,
    maxParticipants: 1000,
    minValidMatches: 8,
    backgroundImage: "",
    backgroundColor: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const tournamentData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        cutoffTime: formData.cutoffTime.toISOString(),
      };

      await createTournament(tournamentData);
      // snackbar.success("Tournament created successfully");
      enqueueSnackbar(t("Tournament created successfully"), {
        variant: "success",
      });
      router.push("/admin-panel/tournaments");
    } catch (error) {
      console.error("Failed to create tournament:", error);
      enqueueSnackbar(t("Failed to create tournament"), {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: string) => (value: string | number | Date | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h3" gutterBottom>
            Create New Tournament
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Basic Information
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Tournament Name"
                        value={formData.name}
                        onChange={(e) => handleChange("name")(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) =>
                            handleChange("status")(e.target.value)
                          }
                        >
                          <MenuItem value={TournamentStatus.DRAFT}>
                            Draft
                          </MenuItem>
                          <MenuItem value={TournamentStatus.ACTIVE}>
                            Active
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description")(e.target.value)
                        }
                        multiline
                        rows={3}
                      />
                    </Grid>

                    {/* Dates */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Schedule
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <DateTimePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(date) => handleChange("startDate")(date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <DateTimePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(date) => handleChange("endDate")(date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <DateTimePicker
                        label="Betting Cutoff Time"
                        value={formData.cutoffTime}
                        onChange={(date) => handleChange("cutoffTime")(date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    {/* Pricing */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Pricing & Limits
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Line Price ($)"
                        type="number"
                        value={formData.linePrice}
                        onChange={(e) =>
                          handleChange("linePrice")(parseFloat(e.target.value))
                        }
                        inputProps={{ step: 0.1, min: 0 }}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Min Lines"
                        type="number"
                        value={formData.minLines}
                        onChange={(e) =>
                          handleChange("minLines")(parseInt(e.target.value))
                        }
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Max Lines"
                        type="number"
                        value={formData.maxLines}
                        onChange={(e) =>
                          handleChange("maxLines")(parseInt(e.target.value))
                        }
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>

                    {/* Prizes */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Prize Configuration
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Prize Distribution Type</InputLabel>
                        <Select
                          value={formData.prizeDistributionType}
                          onChange={(e) =>
                            handleChange("prizeDistributionType")(
                              e.target.value
                            )
                          }
                        >
                          <MenuItem value={PrizeDistributionType.FIXED}>
                            Fixed Amount
                          </MenuItem>
                          <MenuItem value={PrizeDistributionType.PERCENTAGE}>
                            Percentage
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {formData.prizeDistributionType ===
                    PrizeDistributionType.FIXED ? (
                      <>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Gold Prize ($)"
                            type="number"
                            value={formData.prizeGold}
                            onChange={(e) =>
                              handleChange("prizeGold")(
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Silver Prize ($)"
                            type="number"
                            value={formData.prizeSilver}
                            onChange={(e) =>
                              handleChange("prizeSilver")(
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Bronze Prize ($)"
                            type="number"
                            value={formData.prizeBronze}
                            onChange={(e) =>
                              handleChange("prizeBronze")(
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Gold Prize (%)"
                            type="number"
                            value={formData.prizeGoldPercentage}
                            onChange={(e) =>
                              handleChange("prizeGoldPercentage")(
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.1, min: 0, max: 100 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Silver Prize (%)"
                            type="number"
                            value={formData.prizeSilverPercentage}
                            onChange={(e) =>
                              handleChange("prizeSilverPercentage")(
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.1, min: 0, max: 100 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Bronze Prize (%)"
                            type="number"
                            value={formData.prizeBronzePercentage}
                            onChange={(e) =>
                              handleChange("prizeBronzePercentage")(
                                parseFloat(e.target.value)
                              )
                            }
                            inputProps={{ step: 0.1, min: 0, max: 100 }}
                          />
                        </Grid>
                      </>
                    )}

                    {/* Advanced Settings */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Advanced Settings
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Max Participants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) =>
                          handleChange("maxParticipants")(
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Min Valid Matches"
                        type="number"
                        value={formData.minValidMatches}
                        onChange={(e) =>
                          handleChange("minValidMatches")(
                            parseInt(e.target.value)
                          )
                        }
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Background Color"
                        value={formData.backgroundColor}
                        onChange={(e) =>
                          handleChange("backgroundColor")(e.target.value)
                        }
                        placeholder="#ffffff"
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Background Image URL"
                        value={formData.backgroundImage}
                        onChange={(e) =>
                          handleChange("backgroundImage")(e.target.value)
                        }
                      />
                    </Grid>

                    {/* Actions */}
                    <Grid size={{ xs: 12 }}>
                      <Box display="flex" gap={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => router.back()}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                        >
                          {loading ? "Creating..." : "Create Tournament"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(CreateTournamentAdmin, {
  roles: [RoleEnum.ADMIN],
});
