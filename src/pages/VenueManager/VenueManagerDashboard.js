import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Alert,
  Fab,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  Business,
  Event,
  Edit,
  Visibility,
  People,
  Payment,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import VenueTicketTypeManager from '../../components/VenueManager/VenueTicketTypeManager';
import VenuePricingTiersManager from '../../components/VenueManager/VenuePricingTiersManager';

const VenueManagerDashboard = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch venues managed by this user (apiRequest returns parsed JSON)
      const venuesData = await apiRequest(`${API_BASE_URL}/venues?manager_id=${user.id}`);

      let managedVenues = [];
      if (venuesData?.success) {
        if (Array.isArray(venuesData.data)) {
          managedVenues = venuesData.data;
        } else if (Array.isArray(venuesData.data?.venues)) {
          managedVenues = venuesData.data.venues;
        }
      }

      setVenues(managedVenues);
      if (managedVenues.length > 0) setSelectedVenueId(managedVenues[0].id);

      // Use basic stats from venue list (events/stats endpoints not available yet)
      const totalCapacity = managedVenues.reduce((sum, v) => sum + Number(v.capacity || 0), 0);

      setEvents([]);
      setStats({
        total_revenue: 0,
        total_attendees: 0,
        total_venues: managedVenues.length,
        total_events: 0,
        total_capacity: totalCapacity,
      });

    } catch (err) {
      console.error('Fetch dashboard data error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getVenueTypeColor = (type) => {
    const colors = {
      stadium: 'primary',
      theater: 'secondary',
      arena: 'success',
      concert_hall: 'warning',
      sports_complex: 'info',
      conference_center: 'error',
      airport: 'default',
      bus_station: 'default',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      published: 'success',
      draft: 'warning',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const handleViewVenue = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  const handleEditVenue = (venueId) => {
    navigate(`/venues/${venueId}/edit`);
  };

  const handleManageTicketTypes = (venueId) => {
    navigate(`/venues/${venueId}/ticket-types`);
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Your Venues Overview
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Business sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">
              {venues.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Venues
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Event sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h5">
              {events.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Events at Your Venues
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h5">
              ${stats?.total_revenue ? `$${stats.total_revenue.toLocaleString()}` : '$0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h5">
              {stats?.total_attendees || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Attendees
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Your Venues
        </Typography>
      </Grid>
      
      <Grid container spacing={3}>
        {venues.map((venue) => (
          <Grid item xs={12} sm={6} md={4} key={venue.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      {venue.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {venue.city} • {venue.capacity} capacity
                    </Typography>
                    <Chip 
                      label={venue.venue_type?.replace('_', ' ')} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditVenue(venue.id)}
                      color="primary"
                      title="Edit venue"
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {venue.description || 'No description available'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {venue.facilities?.slice(0, 3).map((facility, index) => (
                    <Chip key={index} label={facility} size="small" />
                  ))}
                  {venue.facilities?.length > 3 && (
                    <Chip label={`+${venue.facilities.length - 3} more`} size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  const renderTicketTypes = () => {
    const selectedVenue = venues.find(v => v.id === selectedVenueId);
    
    return (
      <Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Select Venue:
          </Typography>
          <select 
            value={selectedVenueId || ''}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
          >
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name} ({venue.city})
              </option>
            ))}
          </select>
        </Box>
        
        {selectedVenue && (
          <VenueTicketTypeManager 
            venueId={selectedVenue.id} 
            venueData={selectedVenue}
            onSave={() => {
              toast.success('Ticket types saved successfully!');
            }}
          />
        )}
      </Box>
    );
  };

  const renderPricingTiers = () => {
    const selectedVenue = venues.find(v => v.id === selectedVenueId);
    
    return (
      <Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Select Venue:
          </Typography>
          <select 
            value={selectedVenueId || ''}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
          >
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>
                {venue.name} ({venue.city})
              </option>
            ))}
          </select>
        </Box>
        
        {selectedVenue && (
          <VenuePricingTiersManager venue={selectedVenue} />
        )}
      </Box>
    );
  };

  const renderBookings = () => (
    <Container>
      <Typography variant="h4" gutterBottom>
        Venue Bookings Management
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        View and manage all bookings at your venues
      </Alert>
      <Typography variant="body2" color="text.secondary">
        Booking management feature coming soon...
      </Typography>
    </Container>
  );

  const renderSettings = () => (
    <Container>
      <Typography variant="h4" gutterBottom>
        Venue Settings
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure venue settings and preferences
      </Alert>
      <Typography variant="body2" color="text.secondary">
        Settings management feature coming soon...
      </Typography>
    </Container>
  );

  const renderRevenue = () => (
    <Container>
      <Typography variant="h4" gutterBottom>
        Revenue Reports
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        View detailed revenue analytics and reports
      </Alert>
      <Typography variant="body2" color="text.secondary">
        Revenue reports feature coming soon...
      </Typography>
    </Container>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'ticket-types':
        return renderTicketTypes();
      case 'pricing-tiers':
        return renderPricingTiers();
      case 'bookings':
        return renderBookings();
      case 'settings':
        return renderSettings();
      case 'revenue':
        return renderRevenue();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Venue Manager Dashboard
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/venues')}
        >
          Back to Venues
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Ticket Types" value="ticket-types" />
          <Tab label="Pricing Tiers" value="pricing-tiers" />
          <Tab label="Bookings" value="bookings" />
          <Tab label="Settings" value="settings" />
          <Tab label="Revenue" value="revenue" />
        </Tabs>
      </Box>

      {getTabContent()}
    </Container>
  );
};

export default VenueManagerDashboard;
