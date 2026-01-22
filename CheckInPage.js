import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  PointOfSale as POSIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import CheckInSystem from '../components/CheckInSystem';
import CheckInDashboard from '../components/CheckInDashboard';
import HardwareSettings from '../components/HardwareSettings';

const CheckInPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get event ID from URL or context
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdFromUrl = urlParams.get('eventId');
    
    if (eventIdFromUrl) {
      setEventId(eventIdFromUrl);
    } else {
      // For demo purposes, use a default event ID
      setEventId('demo-event-123');
    }
    
    setLoading(false);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCheckInComplete = (result) => {
    console.log('Check-in completed:', result);
    // Could trigger refresh of dashboard stats
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Check-in System...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="h4" gutterBottom>
            Event Check-in System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Event ID: {eventId}
          </Typography>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Check-in system tabs"
          sx={{ px: 2 }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Dashboard" 
            iconPosition="start"
          />
          <Tab 
            icon={<POSIcon />} 
            label="Check-in" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Hardware Settings" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <CheckInDashboard eventId={eventId} />
        )}

        {activeTab === 1 && (
          <CheckInSystem 
            eventId={eventId} 
            onCheckInComplete={handleCheckInComplete}
          />
        )}

        {activeTab === 2 && (
          <HardwareSettings 
            open={activeTab === 2}
            onClose={() => setActiveTab(0)}
          />
        )}
      </Box>
    </Box>
  );
};

export default CheckInPage;
