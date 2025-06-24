import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import { format } from "date-fns";
import { insertLeaveSchema, type InsertLeave } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CheckCircle, Send } from "@mui/icons-material";

const leaveTypes = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Sick", label: "Sick Leave" },
  { value: "Personal", label: "Personal Leave" },
  { value: "Maternity", label: "Maternity Leave" },
  { value: "Paternity", label: "Paternity Leave" },
  { value: "Emergency", label: "Emergency Leave" },
];

export default function LeaveForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  const applyLeaveMutation = useMutation({
    mutationFn: async (data: InsertLeave) => {
      const response = await apiRequest("POST", "/api/apply-leave", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
    },
  });

  const initialValues: InsertLeave = {
    employeeName: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  };

  return (
    <Card sx={{ maxWidth: 800, mx: isMobile ? 2 : "auto", mt: 3 }}>
      <CardHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle color="primary" />
          <Typography variant={isMobile ? "h6" : "h5"} component="h1">
            Apply for Leave
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={insertLeaveSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              await applyLeaveMutation.mutateAsync(values);
              resetForm();
            } catch (error) {
              // Error handling is done in the mutation
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {applyLeaveMutation.isSuccess && (
                  <Alert severity="success">
                    Leave application submitted successfully!
                  </Alert>
                )}

                {applyLeaveMutation.isError && (
                  <Alert severity="error">
                    Failed to submit leave application. Please try again.
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
                    onClick={() => setFieldValue("employeeName", "")}
                    size={isMobile ? "medium" : "large"}
                    fullWidth={isMobile}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || applyLeaveMutation.isPending}
                    startIcon={
                      isSubmitting || applyLeaveMutation.isPending ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Send />
                      )
                    }
                    size={isMobile ? "medium" : "large"}
                    fullWidth={isMobile}
                  >
                    Submit Application
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
