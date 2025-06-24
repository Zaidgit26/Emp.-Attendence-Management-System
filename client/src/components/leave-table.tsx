import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Formik, Form } from "formik";
import { insertLeaveSchema, type InsertLeave } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import type { Leave } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  useMediaQuery,
  useTheme,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Visibility,
  Edit,
  Refresh,
  Assignment,
  Person,
  Close,
  CalendarToday,
  Work,
  Description,
  Save,
} from "@mui/icons-material";

const getStatusChipColor = (status: string): "success" | "error" | "warning" | "default" => {
  switch (status.toLowerCase()) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const getLeaveTypeChipColor = (leaveType: string): "primary" | "error" | "secondary" | "default" => {
  switch (leaveType.toLowerCase()) {
    case "annual":
      return "primary";
    case "sick":
      return "error";
    case "maternity":
    case "paternity":
      return "secondary";
    case "emergency":
      return "default";
    default:
      return "default";
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = ["#1976d2", "#388e3c", "#7b1fa2", "#f57c00", "#e91e63"];
  return colors[name.length % colors.length];
};

const leaveTypes = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Personal", label: "Personal Leave" },
  { value: "Maternity", label: "Maternity Leave" },
  { value: "Paternity", label: "Paternity Leave" },
  { value: "Emergency", label: "Emergency Leave" },
];

export default function LeaveTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewDetailsDialog, setViewDetailsDialog] = useState<{ open: boolean; leave: Leave | null }>({
    open: false,
    leave: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; leave: Leave | null }>({
    open: false,
    leave: null,
  });

  const { data: leaves = [], isLoading, refetch } = useQuery<Leave[]>({
    queryKey: ["/api/leaves", statusFilter === "all" ? "" : `?status=${statusFilter}`],
  });

  const updateLeaveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertLeave }) => {
      const response = await apiRequest("PUT", `/api/leaves/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      setEditDialog({ open: false, leave: null });
    },
  });

  const handleViewDetails = (leave: Leave) => {
    setViewDetailsDialog({ open: true, leave });
  };

  const handleEditRequest = (leave: Leave) => {
    if (leave.status === "Pending") {
      setEditDialog({ open: true, leave });
    }
  };

  const handleCloseViewDetails = () => {
    setViewDetailsDialog({ open: false, leave: null });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, leave: null });
  };

  if (isLoading) {
    return (
      <Card sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
        <CardHeader>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment color="primary" />
            <Typography variant="h5">Leave Records</Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={64} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
      <CardHeader>
        <Box sx={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment color="primary" />
            <Typography variant={isMobile ? "h6" : "h5"}>Leave Records</Typography>
          </Box>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto"
          }}>
            <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 180 }}>
              <InputLabel>Filter by status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              onClick={() => refetch()}
              startIcon={<Refresh />}
              fullWidth={isMobile}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </CardHeader>
      <CardContent sx={{ p: 0 }}>
        {leaves.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <Assignment sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.primary">
              No leave records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusFilter === "all"
                ? "No leave applications have been submitted yet."
                : `No ${statusFilter.toLowerCase()} leave applications found.`}
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'grey.100',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'grey.400',
                borderRadius: 4,
              },
            }}
          >
            <Table sx={{ minWidth: isMobile ? 800 : 'auto' }}>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary", minWidth: 150 }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary", minWidth: 120 }}>
                    Leave Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary", minWidth: 200 }}>
                    Date Range
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary", minWidth: 150 }}>
                    Reason
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary", minWidth: 100 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary", minWidth: 120 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(leave.employeeName),
                            width: 32,
                            height: 32,
                            mr: 2,
                            fontSize: "0.875rem",
                          }}
                        >
                          {getInitials(leave.employeeName)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {leave.employeeName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave`}
                        color={getLeaveTypeChipColor(leave.leaveType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(leave.fromDate), "MMM dd, yyyy")} - {format(new Date(leave.toDate), "MMM dd, yyyy")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>
                        {leave.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={getStatusChipColor(leave.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(leave)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={leave.status !== "Pending" ? "Cannot edit non-pending requests" : "Edit Request"}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={leave.status !== "Pending"}
                              color="default"
                              onClick={() => handleEditRequest(leave)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* View Details Modal */}
      <Dialog
        open={viewDetailsDialog.open}
        onClose={handleCloseViewDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility color="primary" />
            <Typography variant="h6">Leave Request Details</Typography>
          </Box>
          <IconButton onClick={handleCloseViewDetails} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {viewDetailsDialog.leave && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Person color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Employee Name
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {viewDetailsDialog.leave.employeeName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Work color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Leave Type
                    </Typography>
                  </Box>
                  <Chip
                    label={`${viewDetailsDialog.leave.leaveType.charAt(0).toUpperCase() + viewDetailsDialog.leave.leaveType.slice(1)} Leave`}
                    color={getLeaveTypeChipColor(viewDetailsDialog.leave.leaveType)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarToday color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      From Date
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {format(new Date(viewDetailsDialog.leave.fromDate), "MMMM dd, yyyy")}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarToday color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      To Date
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {format(new Date(viewDetailsDialog.leave.toDate), "MMMM dd, yyyy")}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Description color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Reason
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {viewDetailsDialog.leave.reason}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Assignment color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                  </Box>
                  <Chip
                    label={viewDetailsDialog.leave.status}
                    color={getStatusChipColor(viewDetailsDialog.leave.status)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarToday color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Applied On
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {format(new Date(viewDetailsDialog.leave.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDetails} variant="outlined">
            Close
          </Button>
          {viewDetailsDialog.leave?.status === "Pending" && (
            <Button
              onClick={() => {
                handleCloseViewDetails();
                handleEditRequest(viewDetailsDialog.leave!);
              }}
              variant="contained"
              startIcon={<Edit />}
            >
              Edit Request
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog
        open={editDialog.open}
        onClose={handleCloseEdit}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Edit color="primary" />
              <Typography variant="h6">Edit Leave Request</Typography>
            </Box>
            <IconButton onClick={handleCloseEdit} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editDialog.leave && (
            <Formik
              initialValues={{
                employeeName: editDialog.leave.employeeName,
                leaveType: editDialog.leave.leaveType,
                fromDate: format(new Date(editDialog.leave.fromDate), "yyyy-MM-dd"),
                toDate: format(new Date(editDialog.leave.toDate), "yyyy-MM-dd"),
                reason: editDialog.leave.reason,
              }}
              validationSchema={insertLeaveSchema}
              onSubmit={async (values) => {
                try {
                  await updateLeaveMutation.mutateAsync({
                    id: editDialog.leave!.id,
                    data: values,
                  });
                } catch (error) {
                  // Error handling is done in the mutation
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                <Form>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                    {updateLeaveMutation.isError && (
                      <Alert severity="error">
                        Failed to update leave request. Please try again.
                      </Alert>
                    )}

                    <Box sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: isMobile ? 2 : 3
                    }}>
                      <TextField
                        name="employeeName"
                        label="Employee Name"
                        value={values.employeeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.employeeName && Boolean(errors.employeeName)}
                        helperText={touched.employeeName && errors.employeeName}
                        required
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                      />

                      <TextField
                        name="leaveType"
                        label="Leave Type"
                        select
                        value={values.leaveType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.leaveType && Boolean(errors.leaveType)}
                        helperText={touched.leaveType && errors.leaveType}
                        required
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                      >
                        {leaveTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <DatePicker
                        label="From Date"
                        value={values.fromDate ? new Date(values.fromDate) : null}
                        onChange={(date) => setFieldValue("fromDate", date ? format(date, "yyyy-MM-dd") : "")}
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            error: touched.fromDate && Boolean(errors.fromDate),
                            helperText: touched.fromDate && errors.fromDate,
                            required: true,
                            fullWidth: true,
                            size: isMobile ? "small" : "medium",
                          },
                        }}
                      />

                      <DatePicker
                        label="To Date"
                        value={values.toDate ? new Date(values.toDate) : null}
                        onChange={(date) => setFieldValue("toDate", date ? format(date, "yyyy-MM-dd") : "")}
                        minDate={values.fromDate ? new Date(values.fromDate) : new Date()}
                        slotProps={{
                          textField: {
                            error: touched.toDate && Boolean(errors.toDate),
                            helperText: touched.toDate && errors.toDate,
                            required: true,
                            fullWidth: true,
                            size: isMobile ? "small" : "medium",
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      name="reason"
                      label="Reason"
                      multiline
                      rows={isMobile ? 3 : 4}
                      value={values.reason}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.reason && Boolean(errors.reason)}
                      helperText={touched.reason && errors.reason}
                      placeholder="Please provide reason for leave"
                      required
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                    />

                    <Box sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      flexDirection: isMobile ? "column" : "row"
                    }}>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleCloseEdit}
                        fullWidth={isMobile}
                        disabled={isSubmitting || updateLeaveMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || updateLeaveMutation.isPending}
                        startIcon={
                          isSubmitting || updateLeaveMutation.isPending ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Save />
                          )
                        }
                        fullWidth={isMobile}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
