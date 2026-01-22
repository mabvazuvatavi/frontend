import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Hotel as HotelIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  LocalPrintshop as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const HotelBookingSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, apiRequest, API_BASE_URL } = useAuth();
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const bookingReference = new URLSearchParams(location.search).get('reference');

  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
      setLoading(false);
      return;
    }

    if (bookingReference) {
      fetchBookingDetails();
    } else {
      setError('No booking reference found');
      setLoading(false);
    }
  }, [bookingReference, location.state, user]);

  const fetchBookingDetails = async () => {
    try {
      if (user) {
        const response = await apiRequest(`${API_BASE_URL}/hotels/bookings/${bookingReference}`);
        if (response.success) {
          setBookingDetails(response.data);
        } else {
          setError(response.message || 'Failed to fetch booking details');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/hotels/bookings/public/${bookingReference}`);
        const data = await response.json();
        if (data.success) {
          setBookingDetails(data.data);
        } else {
          setError(data.message || 'Failed to fetch booking details');
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hotel Booking Confirmation',
          text: `I've successfully booked ${bookingDetails?.hotel?.name} for ${bookingDetails?.stay?.checkIn} to ${bookingDetails?.stay?.checkOut}.`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const steps = [
    'Search & Select',
    'Enter Details',
    'Payment',
    'Confirmation'
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/hotels')}
          sx={{ mt: 2 }}
        >
          Back to Hotels
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 2
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="success.main">
            Booking Confirmed!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your hotel booking has been successfully confirmed
          </Typography>
          <Chip
            label={`Reference: ${bookingReference}`}
            color="primary"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </Box>

        {/* Stepper */}
        <Stepper activeStep={3} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Booking Details */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Booking Details
          </Typography>
          
          <Grid container spacing={3}>
            {/* Hotel Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Hotel Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <HotelIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={bookingDetails?.hotel?.name}
                    secondary={`${bookingDetails?.hotel?.categoryName} • ${bookingDetails?.hotel?.city}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={bookingDetails?.hotel?.address}
                    secondary={`${bookingDetails?.hotel?.city}, ${bookingDetails?.hotel?.country}`}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Booking Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Booking Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Check-in / Check-out"
                    secondary={`${formatDate(bookingDetails?.stay?.checkIn)} - ${formatDate(bookingDetails?.stay?.checkOut)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Guests"
                    secondary={`${bookingDetails?.rooms?.reduce((sum, room) => sum + (room.adults || 0), 0)} Adults, ${bookingDetails?.rooms?.reduce((sum, room) => sum + (room.children || 0), 0)} Children`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Rooms"
                    secondary={`${bookingDetails?.rooms?.length} ${bookingDetails?.rooms?.length === 1 ? 'Room' : 'Rooms'}`}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Guest Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Guest Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Name"
                    secondary={`${bookingDetails?.holder?.name} ${bookingDetails?.holder?.surname}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={bookingDetails?.holder?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={bookingDetails?.holder?.phone}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary.main">
                Payment Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Amount"
                    secondary={formatPrice(bookingDetails?.total)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Currency"
                    secondary={bookingDetails?.currency}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Booking Date"
                    secondary={formatDate(bookingDetails?.creationDate)}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          {/* Room Details */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom color="primary.main">
            Room Details
          </Typography>
          {bookingDetails?.rooms?.map((room, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {room.name}
                </Typography>
                {room.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {room.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2">
                    {room.adults || 0} Adults, {room.children || 0} Children
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatPrice(room.total)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Cancellation Policy */}
          {bookingDetails?.cancellationPolicies && bookingDetails.cancellationPolicies.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom color="primary.main">
                Cancellation Policy
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {bookingDetails.cancellationPolicies[0]?.description || 'Please review the cancellation policy carefully.'}
                </Typography>
              </Alert>
            </>
          )}
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Confirmation
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            Share Booking
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </Button>
        </Box>

        {/* Important Information */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Important Information:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Please bring a valid ID and this booking confirmation when checking in</li>
            <li>Check-in time is typically 2:00 PM, check-out time is 11:00 AM</li>
            <li>Contact the hotel directly if you need to modify your booking</li>
            <li>Keep this booking reference for any future inquiries</li>
          </ul>
        </Alert>

        {/* Next Steps */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              What's Next?
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="You'll receive a confirmation email shortly"
                  secondary="Check your inbox for booking details and hotel information"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Contact the hotel if you have special requests"
                  secondary="Early check-in, late check-out, room preferences, etc."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Enjoy your stay!"
                  secondary="Have a wonderful time at your chosen hotel"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/hotels')}
          >
            Book Another Hotel
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HotelBookingSuccessPage;
