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
} from "@mui/material";
import {
  Notifications,
  Work,
  Person,
} from "@mui/icons-material";
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
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar>
          <Work sx={{ mr: 2, color: "primary.main" }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Leave Management System
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                JD
              </Avatar>
              <Typography variant="body2" fontWeight="medium">
                John Doe
              </Typography>
            </Box>
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
            <Tab label="Admin Panel" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <LeaveForm />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <LeaveTable />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <AdminPanel />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}
