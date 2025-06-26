import * as yup from "yup";

// User validation schemas
export const loginSchema = yup.object({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export const registerSchema = yup.object({
  username: yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: yup.string().oneOf(['employee', 'admin'], "Role must be either employee or admin").optional(),
});

export const insertUserSchema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required"),
  role: yup.string().oneOf(['employee', 'admin'], "Role must be either employee or admin").optional(),
});

// Leave validation schemas
export const insertLeaveSchema = yup.object({
  user_id: yup.number().required("User ID is required"),
  employee_name: yup.string().required("Employee name is required"),
  leave_type: yup.string().oneOf(['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Emergency'], "Invalid leave type").required("Leave type is required"),
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

export const updateLeaveStatusSchema = yup.object({
  status: yup.string().oneOf(["Pending", "Approved", "Rejected"], "Invalid status").required("Status is required"),
});

// Pagination schema
export const paginationSchema = yup.object({
  page: yup.number().min(1, "Page must be at least 1").optional(),
  limit: yup.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional(),
  status: yup.string().oneOf(['all', 'Pending', 'Approved', 'Rejected'], "Invalid status filter").optional(),
});

// Type definitions
export type LoginData = yup.InferType<typeof loginSchema>;
export type RegisterData = yup.InferType<typeof registerSchema>;
export type InsertUser = yup.InferType<typeof insertUserSchema>;
export type InsertLeave = yup.InferType<typeof insertLeaveSchema>;
export type UpdateLeaveStatus = yup.InferType<typeof updateLeaveStatusSchema>;
export type PaginationParams = yup.InferType<typeof paginationSchema>;
