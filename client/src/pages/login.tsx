import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Work, Login as LoginIcon, PersonAdd } from '@mui/icons-material';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const registerSchema = yup.object({
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, register, state } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
  };

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setError(null);
      await login(values.email, values.password);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setError(null);
      await register(values.username, values.email, values.password);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ maxWidth: 500, mx: 'auto' }}>
          <CardHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Work color="primary" sx={{ fontSize: 40 }} />
              <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" textAlign="center">
                Employee Leave Management
              </Typography>
            </Box>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Login" icon={<LoginIcon />} />
              <Tab label="Register" icon={<PersonAdd />} />
            </Tabs>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {activeTab === 0 && (
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                  <Form>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Field
                        as={TextField}
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={isSubmitting || state.isLoading}
                      />

                      <Field
                        as={TextField}
                        name="password"
                        label="Password"
                        type="password"
                        fullWidth
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        disabled={isSubmitting || state.isLoading}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting || state.isLoading}
                        startIcon={
                          isSubmitting || state.isLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <LoginIcon />
                          )
                        }
                      >
                        {isSubmitting || state.isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            )}

            {activeTab === 1 && (
              <Formik
                initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={registerSchema}
                onSubmit={handleRegister}
              >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                  <Form>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Field
                        as={TextField}
                        name="username"
                        label="Username"
                        fullWidth
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.username && Boolean(errors.username)}
                        helperText={touched.username && errors.username}
                        disabled={isSubmitting || state.isLoading}
                      />

                      <Field
                        as={TextField}
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={isSubmitting || state.isLoading}
                      />

                      <Field
                        as={TextField}
                        name="password"
                        label="Password"
                        type="password"
                        fullWidth
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        disabled={isSubmitting || state.isLoading}
                      />

                      <Field
                        as={TextField}
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        disabled={isSubmitting || state.isLoading}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting || state.isLoading}
                        startIcon={
                          isSubmitting || state.isLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <PersonAdd />
                          )
                        }
                      >
                        {isSubmitting || state.isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Demo Credentials:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin: admin@company.com / admin123
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee: john.doe@company.com / employee123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
