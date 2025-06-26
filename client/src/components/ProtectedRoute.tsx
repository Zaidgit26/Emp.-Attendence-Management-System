import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { state } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      setLocation('/login');
    }
  }, [state.isLoading, state.isAuthenticated, setLocation]);

  if (state.isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!state.isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requireAdmin && state.user?.role !== 'admin') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          You don't have permission to access this page. Admin privileges required.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
