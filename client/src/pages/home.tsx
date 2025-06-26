import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Notifications,
  Work,
  Person,
  Logout,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import LeaveForm from "@/components/leave-form";
import LeaveTable from "@/components/leave-table";
import AdminPanel from "@/components/admin-panel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const { state, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    // Clear all React Query cache
    queryClient.clear();
    // Force page reload to clear all in-memory data
    window.location.href = '/login';
    handleMenuClose();
  };

  const getUserInitials = (username: string) => {
    return username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar>
          <Work sx={{ mr: 2, color: "primary.main" }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Employee Leave Management System
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  {getUserInitials(state.user?.username || 'U')}
                </Avatar>
              </IconButton>
              <Typography variant="body2" fontWeight="medium">
                {state.user?.username}
              </Typography>
              {state.user?.role === 'admin' && (
                <AdminPanelSettings color="warning" fontSize="small" />
              )}
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Person sx={{ mr: 1 }} />
                {state.user?.email}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ bgcolor: "transparent" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
          >
            <Tab label="Apply Leave" />
            <Tab label="Leave Records" />
            {state.user?.role === 'admin' && <Tab label="Admin Panel" />}
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <LeaveForm />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <LeaveTable />
          </TabPanel>

          {state.user?.role === 'admin' && (
            <TabPanel value={activeTab} index={2}>
              <AdminPanel />
            </TabPanel>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
