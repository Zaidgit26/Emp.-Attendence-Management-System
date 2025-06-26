import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import { format } from "date-fns";
import * as yup from "yup";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
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

// Updated validation schema to match backend requirements
const insertLeaveSchema = yup.object({
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

interface LeaveFormValues {
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
}

export default function LeaveForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const { state } = useAuth();

  const applyLeaveMutation = useMutation({
    mutationFn: async (data: LeaveFormValues) => {
      const response = await apiRequest("POST", "/api/apply-leave", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
    },
  });

  const initialValues: LeaveFormValues = {
    employee_name: state.user?.username || "",
    leave_type: "",
    from_date: "",
    to_date: "",
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
              console.log('Form values being submitted:', values);
              await applyLeaveMutation.mutateAsync(values);
              resetForm();
            } catch (error) {
              console.error('Form submission error:', error);
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
                    onChange={(date) => {
                      if (date && !isNaN(date.getTime())) {
                        setFieldValue("from_date", format(date, "yyyy-MM-dd"));
                      } else {
                        setFieldValue("from_date", "");
                      }
                    }}
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
                    onChange={(date) => {
                      if (date && !isNaN(date.getTime())) {
                        setFieldValue("to_date", format(date, "yyyy-MM-dd"));
                      } else {
                        setFieldValue("to_date", "");
                      }
                    }}
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
