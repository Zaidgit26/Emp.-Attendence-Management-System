import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
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
  Pagination,
  Stack,
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

// Validation schema for edit form
const editLeaveSchema = yup.object({
  employee_name: yup.string().required("Employee name is required"),
  leave_type: yup.string().oneOf(leaveTypes.map(t => t.value), "Invalid leave type").required("Leave type is required"),
  from_date: yup.string().required("From date is required"),
  to_date: yup.string().required("To date is required"),
  reason: yup.string().min(10, "Reason must be at least 10 characters").max(500, "Reason cannot exceed 500 characters").required("Reason is required"),
}).test('date-validation', 'To date must be after from date', function(values) {
  const { from_date, to_date } = values;
  if (from_date && to_date) {
    return new Date(to_date) >= new Date(from_date);
  }
  return true;
});

interface Leave {
  id: number;
  user_id: number;
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

interface PaginatedLeaves {
  leaves: Leave[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function LeaveTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewDetailsDialog, setViewDetailsDialog] = useState<{ open: boolean; leave: Leave | null }>({
    open: false,
    leave: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; leave: Leave | null }>({
    open: false,
    leave: null,
  });

  const limit = 10;

  const { data, isLoading, refetch } = useQuery<PaginatedLeaves>({
    queryKey: ["/api/leaves", { page, limit, status: statusFilter !== "all" ? statusFilter : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await apiRequest("GET", `/api/leaves?${params}`);
      return response.json();
    },
  });

  const leaves = data?.leaves || [];
  const totalPages = data?.totalPages || 1;

  const updateLeaveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/leaves/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
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
          <>
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
                            bgcolor: getAvatarColor(leave.employee_name),
                            width: 32,
                            height: 32,
                            mr: 2,
                            fontSize: "0.875rem",
                          }}
                        >
                          {getInitials(leave.employee_name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {leave.employee_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave`}
                        color={getLeaveTypeChipColor(leave.leave_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(leave.from_date), "MMM dd, yyyy")} - {format(new Date(leave.to_date), "MMM dd, yyyy")}
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

          {data && data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, data.totalCount)} of {data.totalCount} records
                </Typography>
              </Stack>
            </Box>
          )}
          </>
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
                    {viewDetailsDialog.leave.employee_name}
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
                    label={`${viewDetailsDialog.leave.leave_type.charAt(0).toUpperCase() + viewDetailsDialog.leave.leave_type.slice(1)} Leave`}
                    color={getLeaveTypeChipColor(viewDetailsDialog.leave.leave_type)}
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
                    {format(new Date(viewDetailsDialog.leave.from_date), "MMMM dd, yyyy")}
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
                    {format(new Date(viewDetailsDialog.leave.to_date), "MMMM dd, yyyy")}
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
                    {format(new Date(viewDetailsDialog.leave.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
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
                employee_name: editDialog.leave.employee_name,
                leave_type: editDialog.leave.leave_type,
                from_date: format(new Date(editDialog.leave.from_date), "yyyy-MM-dd"),
                to_date: format(new Date(editDialog.leave.to_date), "yyyy-MM-dd"),
                reason: editDialog.leave.reason,
              }}
              validationSchema={editLeaveSchema}
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
                        name="employee_name"
                        label="Employee Name"
                        value={values.employee_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.employee_name && Boolean(errors.employee_name)}
                        helperText={touched.employee_name && errors.employee_name}
                        required
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                      />

                      <TextField
                        name="leave_type"
                        label="Leave Type"
                        select
                        value={values.leave_type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.leave_type && Boolean(errors.leave_type)}
                        helperText={touched.leave_type && errors.leave_type}
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
                        value={values.from_date ? new Date(values.from_date) : null}
                        onChange={(date) => setFieldValue("from_date", date ? format(date, "yyyy-MM-dd") : "")}
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            error: touched.from_date && Boolean(errors.from_date),
                            helperText: touched.from_date && errors.from_date,
                            required: true,
                            fullWidth: true,
                            size: isMobile ? "small" : "medium",
                          },
                        }}
                      />

                      <DatePicker
                        label="To Date"
                        value={values.to_date ? new Date(values.to_date) : null}
                        onChange={(date) => setFieldValue("to_date", date ? format(date, "yyyy-MM-dd") : "")}
                        minDate={values.from_date ? new Date(values.from_date) : new Date()}
                        slotProps={{
                          textField: {
                            error: touched.to_date && Boolean(errors.to_date),
                            helperText: touched.to_date && errors.to_date,
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
