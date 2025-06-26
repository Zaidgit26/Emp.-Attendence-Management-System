import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Leave, LeaveStats } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Skeleton,
  Box,
  Grid,
  Avatar,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Shield,
  CheckCircle,
  Cancel,
  Schedule,
  People,
  Warning,
  CalendarToday,
} from "@mui/icons-material";

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = ["#1976d2", "#388e3c", "#7b1fa2", "#f57c00", "#e91e63"];
  return colors[(name?.length || 0) % colors.length];
};

// Helper component for rendering leave request sections
interface LeaveRequestSectionProps {
  title: string;
  leaves: Leave[];
  emptyMessage: string;
  emptyIcon: React.ReactNode;
  sectionColor: string;
  showActions?: boolean;
  onApprove?: (leave: Leave) => void;
  onReject?: (leave: Leave) => void;
  isMobile: boolean;
  isLoading?: boolean;
}

function LeaveRequestSection({
  title,
  leaves,
  emptyMessage,
  emptyIcon,
  sectionColor,
  showActions = false,
  onApprove,
  onReject,
  isMobile,
  isLoading = false
}: LeaveRequestSectionProps) {
  return (
    <Card sx={{ mb: 3, border: `2px solid ${sectionColor}`, borderRadius: 2 }}>
      <CardHeader sx={{ bgcolor: `${sectionColor}15` }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: sectionColor, fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={`${leaves.length} ${leaves.length === 1 ? 'Request' : 'Requests'}`}
            sx={{
              bgcolor: sectionColor,
              color: 'white',
              fontWeight: 600
            }}
            size="small"
          />
        </Box>
      </CardHeader>

      <CardContent>
        {leaves.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            {emptyIcon}
            <Typography variant="h6" color="text.primary" sx={{ mt: 2 }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {leaves.map((leave) => (
              <Card key={leave.id} variant="outlined" sx={{
                "&:hover": { bgcolor: "grey.50" },
                transition: "all 0.2s ease-in-out",
                border: `1px solid ${sectionColor}30`
              }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(leave.employee_name),
                            mr: 2,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getInitials(leave.employee_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {leave.employee_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Applied on {format(new Date(leave.created_at), "MMM dd, yyyy")}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Leave Type
                          </Typography>
                          <Typography variant="body2">
                            {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body2">
                            {format(new Date(leave.from_date), "MMM dd")} - {format(new Date(leave.to_date), "MMM dd, yyyy")}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={leave.status}
                            color={leave.status === 'Pending' ? 'warning' : leave.status === 'Approved' ? 'success' : 'error'}
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Reason
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {leave.reason}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {showActions && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        flexDirection: isMobile ? "column" : "row"
                      }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Cancel />}
                          disabled={isLoading}
                          onClick={() => onReject?.(leave)}
                          fullWidth={isMobile}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle />}
                          disabled={isLoading}
                          onClick={() => onApprove?.(leave)}
                          fullWidth={isMobile}
                        >
                          Approve
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; leave: Leave | null }>({
    open: false,
    leave: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; leave: Leave | null }>({
    open: false,
    leave: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: allLeavesData, isLoading } = useQuery({
    queryKey: ["/api/leaves"],
  });

  const { data: pendingLeavesData } = useQuery({
    queryKey: ["/api/leaves", "?status=Pending"],
  });

  const { data: approvedLeavesData } = useQuery({
    queryKey: ["/api/leaves", "?status=Approved"],
  });

  const { data: rejectedLeavesData } = useQuery({
    queryKey: ["/api/leaves", "?status=Rejected"],
  });

  // Extract leaves array from paginated response
  const allLeaves = allLeavesData?.leaves || [];
  const pendingLeaves = pendingLeavesData?.leaves || [];
  const approvedLeaves = approvedLeavesData?.leaves || [];
  const rejectedLeaves = rejectedLeavesData?.leaves || [];

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/leaves/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all leave queries to refresh all sections
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      setApproveDialog({ open: false, leave: null });
      setSnackbar({
        open: true,
        message: "✅ Leave request approved successfully! Moved to approved section.",
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "❌ Failed to approve leave request.",
        severity: "error",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/leaves/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all leave queries to refresh all sections
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      setRejectDialog({ open: false, leave: null });
      setSnackbar({
        open: true,
        message: "❌ Leave request rejected successfully! Moved to rejected section.",
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "❌ Failed to reject leave request.",
        severity: "error",
      });
    },
  });

  const stats: LeaveStats = {
    pending: allLeaves.filter(leave => leave.status === "Pending").length,
    approved: allLeaves.filter(leave => leave.status === "Approved").length,
    rejected: allLeaves.filter(leave => leave.status === "Rejected").length,
    total: allLeaves.length,
  };

  if (isLoading) {
    return (
      <Card sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
        <CardHeader>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Shield color="primary" />
            <Typography variant="h5">Admin Panel</Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={128} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3, px: isMobile ? 2 : 0 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardHeader>
          <Box sx={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Shield color="primary" />
              <Typography variant={isMobile ? "h6" : "h5"}>Admin Panel</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                icon={<Schedule />}
                label={`${stats.pending} Pending`}
                color="warning"
                size="small"
              />
              <Chip
                icon={<CheckCircle />}
                label={`${stats.approved} Approved`}
                color="success"
                size="small"
              />
              <Chip
                icon={<Cancel />}
                label={`${stats.rejected} Rejected`}
                color="error"
                size="small"
              />
            </Box>
          </Box>
        </CardHeader>
      </Card>

      {/* Pending Requests Section */}
      <LeaveRequestSection
        title="⏳ Pending Leave Requests"
        leaves={pendingLeaves}
        emptyMessage="No pending requests"
        emptyIcon={<CheckCircle sx={{ fontSize: 48, color: "text.secondary" }} />}
        sectionColor="#ed6c02"
        showActions={true}
        onApprove={(leave) => setApproveDialog({ open: true, leave })}
        onReject={(leave) => setRejectDialog({ open: true, leave })}
        isMobile={isMobile}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />

      {/* Approved Requests Section */}
      <LeaveRequestSection
        title="✅ Recently Approved Requests"
        leaves={approvedLeaves.slice(0, 5)} // Show only recent 5
        emptyMessage="No approved requests yet"
        emptyIcon={<CheckCircle sx={{ fontSize: 48, color: "success.main" }} />}
        sectionColor="#2e7d32"
        showActions={false}
        isMobile={isMobile}
      />

      {/* Rejected Requests Section */}
      <LeaveRequestSection
        title="❌ Recently Rejected Requests"
        leaves={rejectedLeaves.slice(0, 5)} // Show only recent 5
        emptyMessage="No rejected requests yet"
        emptyIcon={<Cancel sx={{ fontSize: 48, color: "error.main" }} />}
        sectionColor="#d32f2f"
        showActions={false}
        isMobile={isMobile}
      />

      {/* Statistics Section */}
      <Card>
        <CardHeader>
          <Typography variant="h6">Leave Statistics</Typography>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "primary.light", color: "primary.contrastText" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <Schedule sx={{ fontSize: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.pending}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "success.light", color: "success.contrastText" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <CheckCircle sx={{ fontSize: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Approved
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.approved}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "error.light", color: "error.contrastText" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <Cancel sx={{ fontSize: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Rejected
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.rejected}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "secondary.light", color: "secondary.contrastText" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <People sx={{ fontSize: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog
        open={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, leave: null })}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle color="success" />
          Confirm Approval
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this leave request from{" "}
            {approveDialog.leave?.employee_name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: isMobile ? "column" : "row", gap: isMobile ? 1 : 0 }}>
          <Button
            onClick={() => setApproveDialog({ open: false, leave: null })}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            onClick={() => approveDialog.leave && approveMutation.mutate(approveDialog.leave.id)}
            variant="contained"
            color="success"
            disabled={approveMutation.isPending}
            fullWidth={isMobile}
          >
            Approve Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, leave: null })}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="warning" />
          Confirm Rejection
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this leave request from{" "}
            {rejectDialog.leave?.employee_name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: isMobile ? "column" : "row", gap: isMobile ? 1 : 0 }}>
          <Button
            onClick={() => setRejectDialog({ open: false, leave: null })}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            onClick={() => rejectDialog.leave && rejectMutation.mutate(rejectDialog.leave.id)}
            variant="contained"
            color="error"
            disabled={rejectMutation.isPending}
            fullWidth={isMobile}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontSize: "1rem",
            fontWeight: 500,
            "& .MuiAlert-icon": {
              fontSize: "1.5rem"
            }
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
