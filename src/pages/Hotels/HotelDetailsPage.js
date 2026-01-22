import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Fab,
  IconButton,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  Restaurant as RestaurantIcon,
  Pool as PoolIcon,
  FitnessCenter as FitnessCenterIcon,
  Spa as SpaIcon,
  BusinessCenter as BusinessCenterIcon,
  Pets as PetsIcon,
  SmokingRooms as SmokingIcon,
  Accessible as AccessibleIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ModernDatePickerField from '../../components/Common/ModernDatePicker';

const HotelDetailsPage = () => {
  const theme = useTheme();
  const { hotelCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, apiRequest, API_BASE_URL } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [guestBookingLoading, setGuestBookingLoading] = useState(false);
  const [pendingGuestBooking, setPendingGuestBooking] = useState(null);
  const [guestHolder, setGuestHolder] = useState({
    name: '',
    surname: '',
    email: '',
    phone: ''
  });
  const [bookingParams, setBookingParams] = useState({
    checkIn: null,
    checkOut: null,
    rooms: 1,
    adults: 2,
    children: 0,
    childrenAges: []
  });

  useEffect(() => {
    if (hotelCode) {
      fetchHotelDetails();
      fetchHotelImages();
      fetchHotelReviews();
    }
  }, [hotelCode]);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, hotelCode]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      // Generate default dates if not already set
      let checkIn = bookingParams.checkIn;
      let checkOut = bookingParams.checkOut;
      
      if (!checkIn || !checkOut) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        
        checkIn = checkIn || tomorrow.toISOString().split('T')[0];
        checkOut = checkOut || dayAfter.toISOString().split('T')[0];
      }
      
      const response = await apiRequest(`${API_BASE_URL}/hotels/${hotelCode}?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (response.success) {
        setHotel(response.data);
        setError('');
      } else {
        console.warn('Hotel details API returned success: false');
        // Create basic hotel object as fallback
        setHotel({
          code: hotelCode,
          name: `Hotel ${hotelCode}`,
          categoryName: '4 STARS',
          city: 'Nairobi',
          country: 'Kenya',
          minRate: 0,
          maxRate: 0,
          currency: 'EUR',
          description: 'Hotel details loading...',
          images: [],
          facilities: [],
          rating: 0,
          reviews: { totalReviews: 0, averageRating: 0, reviews: [] }
        });
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      // Fallback: Create basic hotel object so page doesn't hang
      setHotel({
        code: hotelCode,
        name: `Hotel ${hotelCode}`,
        categoryName: '4 STARS',
        city: 'Nairobi',
        country: 'Kenya',
        minRate: 0,
        maxRate: 0,
        currency: 'EUR',
        description: 'Unable to load full hotel details.',
        images: [],
        facilities: [],
        rating: 0,
        reviews: { totalReviews: 0, averageRating: 0, reviews: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelImages = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/hotels/${hotelCode}/images`);
      if (response.success) {
        setImages(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching hotel images:', error);
      setImages([]);
    }
  };

  const fetchHotelReviews = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/hotels/${hotelCode}/reviews`);
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching hotel reviews:', error);
      setReviews([]);
    }
  };

  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const formatDateForAPI = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    if (date.toISOString) return date.toISOString().split('T')[0];
    return null;
  };

  const checkAvailability = async () => {
    if (!bookingParams.checkIn || !bookingParams.checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    setCheckingAvailability(true);
    setError('');

    try {
      const checkInDate = formatDateForAPI(bookingParams.checkIn);
      const checkOutDate = formatDateForAPI(bookingParams.checkOut);

      if (!checkInDate || !checkOutDate) {
        setError('Invalid date format');
        setCheckingAvailability(false);
        return;
      }

      const params = new URLSearchParams({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms: bookingParams.rooms,
        adults: bookingParams.adults,
        children: bookingParams.children,
        childrenAges: bookingParams.childrenAges.join(',')
      });

      console.log('Checking availability with params:', params.toString());

      const response = await apiRequest(`${API_BASE_URL}/hotels/${hotelCode}/availability?${params}`);
      console.log('Availability response:', response);
      
      if (response.success) {
        setAvailability(response.data);
        if (response.data.available) {
          setShowBookingDialog(true);
        } else {
          setError('No rooms available for selected dates');
        }
      } else {
        setError(response.message || 'Failed to check availability');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/hotels/favorites`);
      if (response.success) {
        setIsFavorite(response.data.some(fav => fav.hotel_code === hotelCode));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await apiRequest(`${API_BASE_URL}/hotels/favorites/${hotelCode}`, {
          method: 'DELETE'
        });
        setIsFavorite(false);
      } else {
        await apiRequest(`${API_BASE_URL}/hotels/favorites`, {
          method: 'POST',
          body: JSON.stringify({ hotelCode })
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const [isBooking, setIsBooking] = useState(false);

  const redirectToLoginForBooking = (pendingBooking) => {
    try {
      localStorage.setItem('pendingHotelBooking', JSON.stringify(pendingBooking));
    } catch (e) {
      // ignore
    }

    navigate('/login', {
      state: {
        from: { pathname: location.pathname, search: location.search }
      }
    });
  };

  const handleGuestBooking = async () => {
    if (!pendingGuestBooking) return;

    if (!guestHolder.name || !guestHolder.surname || !guestHolder.email || !guestHolder.phone) {
      setError('Please fill in all guest details');
      return;
    }

    setGuestBookingLoading(true);
    setError('');

    try {
      const adults = pendingGuestBooking.adults ?? bookingParams.adults;
      const children = pendingGuestBooking.children ?? bookingParams.children;
      const childrenAges = pendingGuestBooking.childrenAges ?? bookingParams.childrenAges;

      const bookingData = {
        holder: {
          name: guestHolder.name,
          surname: guestHolder.surname,
          email: guestHolder.email,
          phone: guestHolder.phone
        },
        hotelCode,
        rooms: [{
          code: pendingGuestBooking.roomCode,
          rateKey: pendingGuestBooking.rateKey,
          paxes: buildPaxes({ adults, children, childrenAges })
        }],
        checkIn: pendingGuestBooking.checkIn || formatDateForAPI(bookingParams.checkIn),
        checkOut: pendingGuestBooking.checkOut || formatDateForAPI(bookingParams.checkOut),
        clientReference: `GUEST_${Date.now()}`
      };

      const response = await apiRequest(`${API_BASE_URL}/hotels/bookings/guest`, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response.success) {
        setShowGuestDialog(false);
        setShowBookingDialog(false);
        setPendingGuestBooking(null);

        navigate(`/hotel-booking-success?reference=${response.data.bookingReference}`, {
          state: { bookingDetails: response.data }
        });
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Guest booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setGuestBookingLoading(false);
    }
  };

  const handleBooking = async (roomCode, rateKey, overrides = {}) => {
    if (!user) {
      const pendingBooking = {
        hotelCode,
        roomCode,
        rateKey,
        checkIn: overrides.checkIn || formatDateForAPI(bookingParams.checkIn),
        checkOut: overrides.checkOut || formatDateForAPI(bookingParams.checkOut),
        rooms: overrides.rooms ?? bookingParams.rooms,
        adults: overrides.adults ?? bookingParams.adults,
        children: overrides.children ?? bookingParams.children,
        childrenAges: overrides.childrenAges ?? bookingParams.childrenAges
      };

      setPendingGuestBooking(pendingBooking);
      setShowGuestDialog(true);
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      const adults = overrides.adults ?? bookingParams.adults;
      const children = overrides.children ?? bookingParams.children;
      const childrenAges = overrides.childrenAges ?? bookingParams.childrenAges;

      const bookingData = {
        holder: {
          name: user.first_name,
          surname: user.last_name,
          email: user.email,
          phone: user.phone
        },
        hotelCode,
        rooms: [{
          code: roomCode,
          rateKey,
          paxes: buildPaxes({ adults, children, childrenAges })
        }],
        checkIn: overrides.checkIn || formatDateForAPI(bookingParams.checkIn),
        checkOut: overrides.checkOut || formatDateForAPI(bookingParams.checkOut),
        clientReference: `SHASHA_${Date.now()}`
      };

      console.log('Creating booking with data:', bookingData);

      const response = await apiRequest(`${API_BASE_URL}/hotels/bookings`, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      console.log('Booking response:', response);

      if (response.success) {
        try {
          localStorage.removeItem('pendingHotelBooking');
        } catch (e) {
          // ignore
        }
        navigate(`/hotel-booking-success?reference=${response.data.bookingReference}`);
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    if (!user || !hotelCode) return;

    try {
      const pendingRaw = localStorage.getItem('pendingHotelBooking');
      if (!pendingRaw) return;
      const pending = JSON.parse(pendingRaw);
      if (!pending || pending.hotelCode !== hotelCode) return;
      if (!pending.roomCode || !pending.rateKey) return;

      handleBooking(pending.roomCode, pending.rateKey, {
        checkIn: pending.checkIn,
        checkOut: pending.checkOut,
        rooms: pending.rooms,
        adults: pending.adults,
        children: pending.children,
        childrenAges: pending.childrenAges
      });
    } catch (e) {
      // ignore
    }
  }, [user, hotelCode]);

  const buildPaxes = (params = bookingParams) => {
    const paxes = [];
    
    // Add adults
    for (let i = 0; i < (params.adults || 0); i++) {
      paxes.push({
        type: 'AD',
        age: 30
      });
    }
    
    // Add children with ages
    for (let i = 0; i < (params.children || 0); i++) {
      paxes.push({
        type: 'CH',
        age: params.childrenAges?.[i] || 8
      });
    }
    
    return paxes;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    // Handle string dates
    if (typeof date === 'string') {
      date = new Date(date);
    }
    if (!(date instanceof Date) || isNaN(date)) return 'N/A';
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFacilityIcon = (facility) => {
    // Handle both string and object formats
    const facilityName = typeof facility === 'string' ? facility : (facility?.name || facility?.code || '');
    const facilityLower = facilityName.toLowerCase();
    if (facilityLower.includes('wifi') || facilityLower.includes('internet')) return <WifiIcon />;
    if (facilityLower.includes('parking')) return <ParkingIcon />;
    if (facilityLower.includes('restaurant') || facilityLower.includes('food')) return <RestaurantIcon />;
    if (facilityLower.includes('pool')) return <PoolIcon />;
    if (facilityLower.includes('fitness') || facilityLower.includes('gym')) return <FitnessCenterIcon />;
    if (facilityLower.includes('spa')) return <SpaIcon />;
    if (facilityLower.includes('business') || facilityLower.includes('meeting')) return <BusinessCenterIcon />;
    if (facilityLower.includes('pet')) return <PetsIcon />;
    if (facilityLower.includes('smoking')) return <SmokingIcon />;
    if (facilityLower.includes('accessible') || facilityLower.includes('wheelchair')) return <AccessibleIcon />;
    return <HotelIcon />;
  };
  
  const getFacilityName = (facility) => {
    return typeof facility === 'string' ? facility : (facility?.name || facility?.code || 'Amenity');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !hotel) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            position: 'relative',
            height: 400,
            backgroundImage: `url(${images[0]?.path || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            color: 'white'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)`
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', pb: 4 }}>
            <IconButton
              sx={{ color: 'white', mb: 2 }}
              onClick={() => navigate('/hotels')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              {hotel?.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating value={hotel?.reviews?.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body1">
                ({hotel?.reviews?.totalReviews || 0} reviews)
              </Typography>
              <Chip label={hotel?.categoryName} color="primary" />
            </Box>
          </Container>
          <Fab
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
            onClick={toggleFavorite}
          >
            {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </Fab>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Hotel Info */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    About This Hotel
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {hotel?.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {[
                        hotel?.address,
                        hotel?.city,
                        hotel?.country
                      ].filter(Boolean).join(', ') || 'Location information not available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {hotel?.contact?.phone || 'Contact hotel for phone number'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {hotel?.contact?.email || 'Contact hotel for email'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Facilities */}
              {hotel?.facilities && hotel.facilities.length > 0 && (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Facilities
                    </Typography>
                    <Grid container spacing={2}>
                      {hotel.facilities.slice(0, 12).map((facility, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getFacilityIcon(facility)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {getFacilityName(facility)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Tabs */}
              <Card>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                  <Tab label="Rooms & Rates" />
                  <Tab label="Photos" />
                  <Tab label="Reviews" />
                  <Tab label="Policies" />
                </Tabs>

                <Box sx={{ p: 3, overflow: 'visible' }}>
                  {/* Rooms Tab */}
                  {selectedTab === 0 && (
                    <Box sx={{ overflow: 'visible' }}>
                      <Typography variant="h6" gutterBottom>
                        Select Your Dates
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3, overflow: 'visible' }}>
                        <Grid item xs={12} sm={6}>
                          <ModernDatePickerField
                            label="Check-in"
                            value={bookingParams.checkIn}
                            onChange={(date) => setBookingParams(prev => ({ ...prev, checkIn: date }))}
                            minDate={new Date()}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <ModernDatePickerField
                            label="Check-out"
                            value={bookingParams.checkOut}
                            onChange={(date) => setBookingParams(prev => ({ ...prev, checkOut: date }))}
                            minDate={bookingParams.checkIn || new Date()}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Rooms"
                            value={bookingParams.rooms}
                            onChange={(e) => setBookingParams(prev => ({ ...prev, rooms: parseInt(e.target.value) || 1 }))}
                            inputProps={{ min: 1, max: 10 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Adults"
                            value={bookingParams.adults}
                            onChange={(e) => setBookingParams(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                            inputProps={{ min: 1, max: 20 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Children"
                            value={bookingParams.children}
                            onChange={(e) => {
                              const children = parseInt(e.target.value) || 0;
                              setBookingParams(prev => ({ 
                                ...prev, 
                                children,
                                childrenAges: Array(children).fill(8)
                              }));
                            }}
                            inputProps={{ min: 0, max: 10 }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={checkAvailability}
                        sx={{ mb: 3 }}
                      >
                        Check Availability
                      </Button>

                      {availability && availability.hotels?.[0]?.rooms && (
                        <List>
                          {availability.hotels[0].rooms.map((room, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                <ListItemText
                                  primary={room.name}
                                  secondary={room.description}
                                />
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="h6" color="primary.main">
                                    {formatPrice(room.total)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Total for {Math.ceil((new Date(bookingParams.checkOut) - new Date(bookingParams.checkIn)) / (1000 * 60 * 60 * 24))} nights
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    onClick={() => handleBooking(room.code, room.rateKey)}
                                    sx={{ mt: 1 }}
                                  >
                                    Book Now
                                  </Button>
                                </Box>
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}

                  {/* Photos Tab */}
                  {selectedTab === 1 && (
                    <Grid container spacing={2}>
                      {images.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={image.path}
                            alt={image.description || `Hotel image ${index + 1}`}
                            sx={{ borderRadius: 1 }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* Reviews Tab */}
                  {selectedTab === 2 && (
                    <Box>
                      {reviews.length > 0 ? (
                        <List>
                          {reviews.map((review, index) => (
                            <React.Fragment key={index}>
                              <ListItem alignItems="flex-start">
                                <ListItemText
                                  primary={
                                    <Box>
                                      <Typography variant="subtitle1">
                                        {review.clientName}
                                      </Typography>
                                      <Rating value={review.rating} readOnly size="small" />
                                      <Typography variant="body2" color="text.secondary">
                                        {new Date(review.date).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      {review.comment}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No reviews yet. Be the first to review this hotel!
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Policies Tab */}
                  {selectedTab === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Check-in Policy
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {hotel?.checkInPolicy || 'Standard check-in time is 2:00 PM. Early check-in may be available upon request.'}
                      </Typography>

                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Check-out Policy
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {hotel?.checkOutPolicy || 'Standard check-out time is 11:00 AM. Late check-out may be available upon request.'}
                      </Typography>

                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Cancellation Policy
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {hotel?.cancellationPolicy || 'Free cancellation up to 24 hours before check-in. Cancellation within 24 hours may incur charges.'}
                      </Typography>

                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Payment Methods
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {hotel?.paymentMethods?.join(', ') || 'Credit cards, debit cards, and cash accepted.'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Quick Booking */}
              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Quick Booking
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={checkingAvailability || !bookingParams.checkIn || !bookingParams.checkOut}
                    onClick={checkAvailability}
                    sx={{ mb: 2 }}
                  >
                    {checkingAvailability ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Checking...
                      </>
                    ) : (
                      'Book Now'
                    )}
                  </Button>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Best prices guaranteed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Booking Dialog - Modern Design */}
        <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
          <Box sx={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: 'white', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '2rem' }}>🏨</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Complete Your Booking</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{hotel?.name}</Typography>
              </Box>
            </Box>
          </Box>
          <DialogContent sx={{ p: 0 }}>
            {/* Booking Summary */}
            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography>📅</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Check-in</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(bookingParams.checkIn)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography>📅</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Check-out</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(bookingParams.checkOut)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography>👥</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Guests</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{bookingParams.adults} Adults{bookingParams.children > 0 ? `, ${bookingParams.children} Children` : ''}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Room Selection */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                🛏️ Select Your Room
              </Typography>
              {availability && availability.hotels?.[0]?.rooms && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {availability.hotels[0].rooms.map((room, index) => (
                    <Paper key={index} elevation={0} sx={{ 
                      p: 2.5, borderRadius: 2, border: '2px solid #e2e8f0', transition: 'all 0.2s',
                      '&:hover': { borderColor: '#3b82f6', boxShadow: '0 4px 12px rgba(59,130,246,0.15)' }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{room.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {room.boardName && (
                              <Chip size="small" label={room.boardName} sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 500 }} />
                            )}
                            {room.beds && (
                              <Chip size="small" icon={<Typography sx={{ fontSize: '0.8rem', pl: 0.5 }}>🛏️</Typography>} label={room.beds} variant="outlined" />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#059669' }}>{formatPrice(room.total)}</Typography>
                          <Typography variant="caption" color="text.secondary">Total price</Typography>
                        </Box>
                        <Button variant="contained" size="large" disabled={isBooking}
                          onClick={() => handleBooking(room.code, room.rateKey)}
                          sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600, textTransform: 'none',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }
                          }}>
                          {isBooking ? '⏳ Booking...' : '✓ Book Now'}
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Button onClick={() => setShowBookingDialog(false)} sx={{ borderRadius: 2, px: 3 }}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Guest Details Dialog - Modern Design */}
        <Dialog open={showGuestDialog} onClose={() => setShowGuestDialog(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
          <Box sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '2rem' }}>👤</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Guest Details</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Enter your information to continue</Typography>
              </Box>
            </Box>
          </Box>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" variant="outlined" value={guestHolder.name}
                  onChange={(e) => setGuestHolder(prev => ({ ...prev, name: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" variant="outlined" value={guestHolder.surname}
                  onChange={(e) => setGuestHolder(prev => ({ ...prev, surname: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email Address" type="email" variant="outlined" value={guestHolder.email}
                  onChange={(e) => setGuestHolder(prev => ({ ...prev, email: e.target.value }))}
                  InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>📧</Box> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone Number" variant="outlined" placeholder="+254 712 345 678" value={guestHolder.phone}
                  onChange={(e) => setGuestHolder(prev => ({ ...prev, phone: e.target.value }))}
                  InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>📱</Box> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }}>
              <Chip label="OR" size="small" />
            </Divider>

            <Button fullWidth variant="outlined" size="large"
              onClick={() => {
                if (pendingGuestBooking) {
                  redirectToLoginForBooking(pendingGuestBooking);
                } else {
                  navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } });
                }
              }}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'none', fontWeight: 600 }}>
              🔐 Login with your account
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5 }}>
            <Button onClick={() => setShowGuestDialog(false)} sx={{ borderRadius: 2, px: 3 }}>Cancel</Button>
            <Button variant="contained" size="large" disabled={guestBookingLoading} onClick={handleGuestBooking}
              sx={{ borderRadius: 2, px: 4, fontWeight: 600, textTransform: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)' }
              }}>
              {guestBookingLoading ? '⏳ Booking...' : '✓ Continue as Guest'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Box>
  );
};

export default HotelDetailsPage;
