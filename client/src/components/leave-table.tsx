import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
} from "@mui/material";
import {
  Visibility,
  Edit,
  Refresh,
  Assignment,
  Person,
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

export default function LeaveTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leaves = [], isLoading, refetch } = useQuery<Leave[]>({
    queryKey: ["/api/leaves", statusFilter === "all" ? "" : `?status=${statusFilter}`],
  });

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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment color="primary" />
            <Typography variant="h5">Leave Records</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary" }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary" }}>
                    Leave Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary" }}>
                    Date Range
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary" }}>
                    Reason
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "text.secondary" }}>
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
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={leave.status !== "Pending" ? "Cannot edit non-pending requests" : "Edit Request"}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={leave.status !== "Pending"}
                              color="default"
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
    </Card>
  );
}
