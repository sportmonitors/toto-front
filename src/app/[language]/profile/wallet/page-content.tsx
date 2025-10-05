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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSnackbar } from "@/hooks/use-snackbar";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { RoleEnum } from "@/services/api/types/role";

interface UserBalance {
  id: string | number;
  balance: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface BalanceTransaction {
  id: string | number;
  type: "deposit" | "withdrawal" | "bet" | "win" | "refund" | "bonus";
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

function WalletPageContent() {
  const { t } = useTranslation("wallet");
  const snackbar = useSnackbar();

  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositDialog, setDepositDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [balanceResponse, transactionsResponse] = await Promise.all([
      //   getUserBalance(),
      //   getUserTransactions()
      // ]);

      // Mock data for now
      setBalance({
        id: "1",
        balance: 250.75,
        lockedBalance: 15.3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setTransactions([
        {
          id: "1",
          type: "deposit",
          amount: 100.0,
          balanceAfter: 250.75,
          description: "Manual deposit",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "2",
          type: "bet",
          amount: -9.6,
          balanceAfter: 150.75,
          description: "Bet on Premier League Week 1",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "3",
          type: "win",
          amount: 160.35,
          balanceAfter: 160.35,
          description: "Prize from Premier League Week 1",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
      snackbar.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      snackbar.error("Please enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      // TODO: Call deposit API
      console.log("Depositing:", amount);

      snackbar.success("Deposit successful");
      setDepositDialog(false);
      setAmount("");
      loadWalletData();
    } catch (error) {
      console.error("Deposit failed:", error);
      snackbar.error("Deposit failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      snackbar.error("Please enter a valid amount");
      return;
    }

    if (balance && parseFloat(amount) > balance.balance) {
      snackbar.error("Insufficient balance");
      return;
    }

    try {
      setProcessing(true);
      // TODO: Call withdraw API
      console.log("Withdrawing:", amount);

      snackbar.success("Withdrawal successful");
      setWithdrawDialog(false);
      setAmount("");
      loadWalletData();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      snackbar.error("Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
      case "refund":
      case "bonus":
        return "success";
      case "withdrawal":
      case "bet":
        return "error";
      default:
        return "default";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
      case "refund":
      case "bonus":
        return "+";
      case "withdrawal":
      case "bet":
        return "-";
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
          <Typography>Loading wallet...</Typography>
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
            My Wallet
          </Typography>
        </Grid>

        {/* Balance Cards */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Available Balance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ${balance?.balance.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Locked Balance
              </Typography>
              <Typography variant="h4" color="warning.main">
                ${balance?.lockedBalance.toFixed(2) || "0.00"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funds locked in pending bets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Balance
              </Typography>
              <Typography variant="h4">
                $
                {(
                  (balance?.balance || 0) + (balance?.lockedBalance || 0)
                ).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available + Locked
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDepositDialog(true)}
              color="success"
            >
              Deposit
            </Button>
            <Button
              variant="outlined"
              startIcon={<RemoveIcon />}
              onClick={() => setWithdrawDialog(true)}
              disabled={!balance || balance.balance <= 0}
            >
              Withdraw
            </Button>
          </Box>
        </Grid>

        {/* Transaction History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Balance After</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(
                            new Date(transaction.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type.toUpperCase()}
                            color={getTransactionColor(transaction.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.description || "-"}</TableCell>
                        <TableCell align="right">
                          <Typography
                            color={
                              transaction.amount >= 0
                                ? "success.main"
                                : "error.main"
                            }
                            fontWeight="medium"
                          >
                            {getTransactionIcon(transaction.type)}$
                            {Math.abs(transaction.amount).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          ${transaction.balanceAfter.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {transactions.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    No transactions yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deposit Dialog */}
      <Dialog
        open={depositDialog}
        onClose={() => setDepositDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount ($)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            variant="contained"
            disabled={processing}
          >
            {processing ? "Processing..." : "Deposit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={withdrawDialog}
        onClose={() => setWithdrawDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount ($)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01, max: balance?.balance || 0 }}
            helperText={`Available: $${balance?.balance.toFixed(2) || "0.00"}`}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setWithdrawDialog(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={processing}
          >
            {processing ? "Processing..." : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withPageRequiredAuth(WalletPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
