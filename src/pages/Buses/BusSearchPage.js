import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  InputAdornment,
  IconButton,
  Stack,
  Rating,
  Autocomplete,
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  AccessTime,
  Person,
  ShoppingCart,
  Search as SearchIcon,
  FlightTakeoff,
  FlightLand,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import AddBusDialog from './AddBusDialog';
import { DateTime } from 'luxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import toast from 'react-hot-toast';

const BusSearchPage = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();
  const { addToCart } = useCart();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  // Search filters
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    page: 1,
    limit: 12,
  });

  // Booking dialog
  const [bookingDialog, setBookingDialog] = useState({ open: false, bus: null });
  const [seatsCount, setSeatsCount] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([{ name: '', email: '', phone: '' }]);
  
  // Add bus dialog
  const [addBusDialogOpen, setAddBusDialogOpen] = useState(false);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError('');

      // Use BusBud API for real-time bus data
      let endpoint = `${API_BASE_URL}/buses/search/busbud`;
      
      // Fallback to local database
      if (!filters.origin || !filters.destination || !filters.date) {
        endpoint = `${API_BASE_URL}/buses`;
      }

      const queryParams = new URLSearchParams();
      if (filters.origin) queryParams.append('origin', filters.origin);
      if (filters.destination) queryParams.append('destination', filters.destination);
      if (filters.date) queryParams.append('date', filters.date);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const data = await apiRequest(`${endpoint}?${queryParams.toString()}`);
      if (!data.success) throw new Error('Failed to fetch buses');

      // Handle both BusBud API response and local database response
      if (Array.isArray(data.data)) {
        setBuses(data.data);
      } else if (data.data && Array.isArray(data.data)) {
        setBuses(data.data);
      }
      
      setPagination(data.pagination || { page: filters.page, limit: filters.limit, total: data.total || 0 });
      
      if (data.source === 'busbud_api') {
        toast.success('Found ' + (data.total || 0) + ' buses on BusBud');
      }
    } catch (err) {
      console.error('Fetch buses error:', err);
      setError(err.message || 'Failed to fetch buses');
      toast.error(err.message || 'Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.origin && filters.destination && filters.date) {
      fetchBuses();
    }
  }, [filters.origin, filters.destination, filters.date, filters.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchBuses();
  };

  const handleOpenBooking = (bus) => {
    setBookingDialog({ open: true, bus });
    setSeatsCount(1);
    setPassengerDetails([{ name: '', email: '', phone: '' }]);
  };

  const handleCloseBooking = () => {
    setBookingDialog({ open: false, bus: null });
  };

  const handleAddPassenger = () => {
    setPassengerDetails([...passengerDetails, { name: '', email: '', phone: '' }]);
  };

  const handleRemovePassenger = (index) => {
    setPassengerDetails(passengerDetails.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const handleBookBus = async () => {
    if (seatsCount < 1) {
      toast.error('Please select at least 1 seat');
      return;
    }

    if (passengerDetails.length !== seatsCount) {
      toast.error('Please enter details for all passengers');
      return;
    }

    // Validate all passengers have required fields
    const allValid = passengerDetails.every(p => p.name && p.email && p.phone);
    if (!allValid) {
      toast.error('Please fill in all passenger details');
      return;
    }

    try {
      // Add to cart
      addToCart(
        {
          type: 'bus',
          busId: bookingDialog.bus.id,
          busName: bookingDialog.bus.bus_name,
          origin: bookingDialog.bus.origin,
          destination: bookingDialog.bus.destination,
          departureTime: bookingDialog.bus.departure_time,
          arrivalTime: bookingDialog.bus.arrival_time,
          seatsCount: seatsCount,
          pricePerSeat: bookingDialog.bus.price_per_seat,
          totalPrice: seatsCount * bookingDialog.bus.price_per_seat,
          passengerDetails: passengerDetails,
        },
        { ticket_type: 'bus' }
      );

      toast.success(`${seatsCount} seat(s) added to cart`);
      handleCloseBooking();
      navigate('/checkout');
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (departure, arrival) => {
    if (!arrival) return 'N/A';
    const start = new Date(departure);
    const end = new Date(arrival);
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Hero Section with Search Form */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 4, md: 8 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              sx={{ color: 'white', fontWeight: 700, letterSpacing: 2, mb: 1 }}
            >
              BUS TRAVEL
            </Typography>

            <Typography
              variant="h2"
              sx={{ color: 'white', fontWeight: 900, mb: 2, fontSize: { xs: '1.5rem', md: '2.5rem' }, lineHeight: 1.05 }}
            >
              Book buses across Kenya
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: alpha('#fff', 0.95), maxWidth: 900, mx: 'auto', mb: 3, fontWeight: 500 }}
            >
              Find the best bus routes, compare prices, and book your tickets instantly. Travel safely and comfortably.
            </Typography>
          </Box>

          {/* Search Card */}
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 8px 24px rgba(2,6,23,0.08)', width: { xs: '100%', md: '95%' }, mx: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleSearch}>
                <Grid container spacing={2} alignItems="flex-end">
                  {/* From (Origin) */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                        Departure
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="From city"
                        value={filters.origin}
                        onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: 'action.active', mr: 0.5 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          bgcolor: '#fafafa',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': { height: 56 },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* To (Destination) */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                        Arrival
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="To city"
                        value={filters.destination}
                        onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: 'action.active', mr: 0.5 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          bgcolor: '#fafafa',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': { height: 56 },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Date */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                        Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <DatePicker
                          value={filters.date ? DateTime.fromISO(filters.date) : null}
                          onChange={(date) => setFilters({ ...filters, date: date ? date.toISODate() : '' })}
                          minDate={DateTime.now().startOf('day')}
                          slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: '#fafafa', borderRadius: 2, '& .MuiOutlinedInput-root': { height: 56 }, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' } } } }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Grid>

                  {/* Search Button */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        sx={{
                          background: '#ff0080',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'none',
                          height: 56,
                          minWidth: 120,
                          borderRadius: 2,
                          px: 2,
                          width: '100%',
                          boxShadow: '0 8px 18px rgba(255, 0, 128, 0.2)',
                          '&:hover': { 
                            background: '#e6006f',
                            transform: 'translateY(-1px)' 
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Results Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Top Bar with Add Bus Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddBusDialogOpen(true)}
            sx={{
              color: '#ff0080',
              borderColor: '#ff0080',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha('#ff0080', 0.04),
                borderColor: '#e6006f',
                color: '#e6006f'
              }
            }}
          >
            Add Bus
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Results with Sidebar */}
        {!loading && buses.length > 0 && (
          <Grid container spacing={3}>
            {/* Filters Sidebar */}
            <Grid item xs={12} md={3}>
              <Card sx={{ boxShadow: 1, borderRadius: 2, position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Filters</Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* E-Ticket Filter */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                      Ticket Type
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input type="checkbox" id="eticket" />
                        <label htmlFor="eticket" style={{ cursor: 'pointer', margin: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>E-ticket only</Typography>
                        </label>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Direct Only Filter */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                      Route Type
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input type="checkbox" id="direct" />
                        <label htmlFor="direct" style={{ cursor: 'pointer', margin: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Direct only</Typography>
                        </label>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Departure Time Filter */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                      Departure Time
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { id: 'before6', label: 'Before 6am' },
                        { id: 'early', label: '6am - 11am' },
                        { id: 'midday', label: '11am - 5pm' },
                        { id: 'late', label: 'After 5pm' }
                      ].map(time => (
                        <Box key={time.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <input type="checkbox" id={time.id} />
                          <label htmlFor={time.id} style={{ cursor: 'pointer', margin: 0 }}>
                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{time.label}</Typography>
                          </label>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Bus Operators */}
                  {buses.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Bus Operators
                      </Typography>
                      <Stack spacing={1}>
                        {Array.from(new Set(buses.map(b => b.bus_name))).map((operator, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <input type="checkbox" id={`op-${idx}`} />
                            <label htmlFor={`op-${idx}`} style={{ cursor: 'pointer', margin: 0 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                {operator} ({buses.filter(b => b.bus_name === operator).length})
                              </Typography>
                            </label>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  {/* Departure Cities */}
                  {buses.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Departure City
                      </Typography>
                      <Stack spacing={1}>
                        {Array.from(new Set(buses.map(b => b.origin))).map((city, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <input type="checkbox" id={`city-${idx}`} />
                            <label htmlFor={`city-${idx}`} style={{ cursor: 'pointer', margin: 0 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                {city} ({buses.filter(b => b.origin === city).length})
                              </Typography>
                            </label>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Results Column */}
            <Grid item xs={12} md={9}>
              {/* Top Results Bar */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#000', 0.06),
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#002d68' }}>
                  Select your trip: {buses.length} results
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Quick Sort Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>
                      Sort By:
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#002d68',
                        borderColor: alpha('#002d68', 0.3),
                        '&:hover': { borderColor: '#ff0080', color: '#ff0080' }
                      }}
                    >
                      Earliest Departure
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#002d68',
                        borderColor: alpha('#002d68', 0.3),
                        '&:hover': { borderColor: '#ff0080', color: '#ff0080' }
                      }}
                    >
                      Lowest Price
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#002d68',
                        borderColor: alpha('#002d68', 0.3),
                        '&:hover': { borderColor: '#ff0080', color: '#ff0080' }
                      }}
                    >
                      Shortest Duration
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Bus Cards */}
              <Stack spacing={2}>
                {buses.map((bus) => (
                <Card
                  key={bus.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-2px)'
                    },
                    border: '1px solid',
                    borderColor: alpha('#000', 0.06),
                    overflow: 'hidden'
                  }}
                >
                  {/* Bus Info */}
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: { xs: 1.5, md: 2 }, px: { xs: 1.5, md: 2 } }}>
                    <Box>
                      {/* Header: Name + Favorite */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {bus.bus_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                            {bus.bus_type}
                          </Typography>
                        </Box>
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>

                      {/* Route Info */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {bus.origin}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {formatDate(bus.departure_time)}
                          </Typography>
                        </Box>
                        <AccessTime sx={{ fontSize: 18, color: '#666' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {bus.destination}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {bus.arrival_time ? formatDate(bus.arrival_time) : 'TBA'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Amenities & Details */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip
                          label={`${bus.available_seats} seats`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha('#002d68', 0.08), color: '#002d68' }}
                        />
                        {bus.amenities && (() => {
                          try {
                            const amenities = JSON.parse(bus.amenities);
                            return amenities.slice(0, 2).map((amenity, idx) => (
                              <Chip
                                key={idx}
                                label={amenity}
                                size="small"
                                sx={{ height: 20, fontSize: '0.7rem', bgcolor: alpha('#002d68', 0.08), color: '#002d68' }}
                              />
                            ));
                          } catch {
                            return null;
                          }
                        })()}
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Price Section - Right Side */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: { xs: 'flex-start', md: 'flex-end' },
                    p: { xs: 1.5, md: 2 },
                    minWidth: { xs: 'auto', md: '180px' },
                    bgcolor: { xs: 'transparent', md: alpha('#002d68', 0.02) }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem', mb: 0.5 }}>
                      From per seat
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#002d68', mb: 1 }}>
                      KES {Math.round(bus.price || 0).toLocaleString()}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #0055B8 0%, #003d82 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        py: 0.8,
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #004a9f 0%, #003270 100%)',
                          transform: 'translateY(-2px)' 
                        }
                      }}
                      onClick={() => handleOpenBooking(bus)}
                    >
                      Book Now
                    </Button>
                  </Box>
                </Card>
                ))}
              </Stack>

              {/* Pagination */}
              {pagination && pagination.total > pagination.limit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={Math.ceil(pagination.total / pagination.limit)}
                    page={pagination.page}
                    onChange={(_, page) => setFilters({ ...filters, page })}
                    color="primary"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Empty State */}
        {!loading && buses.length === 0 && !error && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DirectionsBus sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No buses found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your search criteria
            </Typography>
          </Paper>
        )}

        {/* Booking Dialog */}
        <Dialog
          open={bookingDialog.open}
          onClose={handleCloseBooking}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Book Bus Seats</DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {bookingDialog.bus && (
              <Box>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {bookingDialog.bus.bus_name}: {bookingDialog.bus.origin} → {bookingDialog.bus.destination}
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Number of Seats</InputLabel>
                  <Select
                    value={seatsCount}
                    onChange={(e) => {
                      setSeatsCount(e.target.value);
                      // Adjust passenger details
                      if (e.target.value > passengerDetails.length) {
                        const diff = e.target.value - passengerDetails.length;
                        for (let i = 0; i < diff; i++) {
                          setPassengerDetails([
                            ...passengerDetails,
                            { name: '', email: '', phone: '' },
                          ]);
                        }
                      } else {
                        setPassengerDetails(passengerDetails.slice(0, e.target.value));
                      }
                    }}
                    label="Number of Seats"
                  >
                    {[...Array(bookingDialog.bus.available_seats)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'seat' : 'seats'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Passenger Details
                </Typography>

                {passengerDetails.map((passenger, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Passenger {index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      label="Full Name"
                      value={passenger.name}
                      onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      value={passenger.phone}
                      onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                    />
                  </Box>
                ))}

                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Price:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    KES {(seatsCount * bookingDialog.bus.price_per_seat).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBooking}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleBookBus}
              startIcon={<ShoppingCart />}
            >
              Add to Cart
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Bus Dialog */}
        <AddBusDialog
          open={addBusDialogOpen}
          onClose={() => setAddBusDialogOpen(false)}
          onBusAdded={() => {
            setAddBusDialogOpen(false);
            // Refresh buses if search has been performed
            if (filters.origin && filters.destination && filters.date) {
              fetchBuses();
            }
          }}
        />
      </Container>
    </Box>
  );
};

export default BusSearchPage;
