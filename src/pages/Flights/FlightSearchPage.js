import React, { useState, useMemo } from 'react';
import { DateTime } from 'luxon';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  InputAdornment,
  Checkbox
} from '@mui/material';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  FilterList as FilterIcon,
  SwapVert as SortIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestCart } from '../../context/GuestCartContext';
import toast from 'react-hot-toast';
import { FlightIcon } from '../../components/Layout/CustomIcons';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const FlightSearchPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { createGuestCart, addToGuestCart, guestCartId } = useGuestCart();

  const [searchParams, setSearchParams] = useState({
    origin: 'NBO',
    destination: '',
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'ECONOMY',
    isRoundTrip: false
  });

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [passengerDialogOpen, setPassengerDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('price'); // 'price', 'duration', 'stops'
  const [openDateDialog, setOpenDateDialog] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [maxStops, setMaxStops] = useState(2);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [durationRange, setDurationRange] = useState([2.5, 46.5]);

  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'Nairobi',
    countryCode: 'KE'
  });

  const commonAirports = [
    { code: 'NBO', city: 'Nairobi' },
    { code: 'MBA', city: 'Mombasa' },
    { code: 'KIS', city: 'Kisumu' },
    { code: 'ELD', city: 'Eldoret' },
    { code: 'JRO', city: 'Kilimanjaro' },
    { code: 'DAR', city: 'Dar es Salaam' },
    { code: 'EBB', city: 'Entebbe' },
    { code: 'ADD', city: 'Addis Ababa' },
    { code: 'LOS', city: 'Lagos' },
    { code: 'LHR', city: 'London' },
    { code: 'CDG', city: 'Paris' },
    { code: 'JFK', city: 'New York' },
    { code: 'LAX', city: 'Los Angeles' },
    { code: 'DXB', city: 'Dubai' },
    { code: 'SIN', city: 'Singapore' },
    { code: 'HND', city: 'Tokyo' }
  ];

  // Generate mock flight data based on search parameters
  const generateMockFlights = (origin, destination, departureDate, adults, children, travelClass) => {
    const airlines = [
      { code: 'KQ', name: 'Kenya Airways', logo: '🇰🇪' },
      { code: 'ET', name: 'Ethiopian Airlines', logo: '🇪🇹' },
      { code: 'WY', name: 'Oman Air', logo: '🇴🇲' },
      { code: 'EK', name: 'Emirates', logo: '🇦🇪' },
      { code: 'QR', name: 'Qatar Airways', logo: '🇶🇦' },
      { code: '5Z', name: 'Jambojet', logo: '✈️' },
      { code: 'P0', name: 'Fly540', logo: '✈️' }
    ];

    const originCity = commonAirports.find(a => a.code === origin)?.city || origin;
    const destCity = commonAirports.find(a => a.code === destination)?.city || destination;

    // Base prices based on route type
    const isInternational = !['NBO', 'MBA', 'KIS', 'ELD'].includes(destination);
    const basePrice = isInternational ? 45000 : 8500;
    const classMultiplier = travelClass === 'BUSINESS' ? 2.5 : travelClass === 'FIRST' ? 4 : 1;

    const depDate = new Date(departureDate);
    const totalPassengers = (adults || 1) + (children || 0);

    // Generate 5-8 mock flights
    const numFlights = 5 + Math.floor(Math.random() * 4);
    const flights = [];

    for (let i = 0; i < numFlights; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNum = Math.floor(100 + Math.random() * 900);
      
      // Random departure hour between 5am and 10pm
      const depHour = 5 + Math.floor(Math.random() * 17);
      const depMinute = Math.floor(Math.random() * 4) * 15;
      
      // Duration based on route (1-14 hours)
      const baseDuration = isInternational ? 4 + Math.random() * 10 : 0.5 + Math.random() * 2;
      const durationHours = Math.floor(baseDuration);
      const durationMinutes = Math.floor((baseDuration % 1) * 60);
      
      const departureTime = new Date(depDate);
      departureTime.setHours(depHour, depMinute, 0, 0);
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + durationHours);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);

      // Price variation
      const priceVariation = 0.8 + Math.random() * 0.4;
      const unitPrice = Math.round(basePrice * classMultiplier * priceVariation);
      const totalPrice = unitPrice * totalPassengers;

      // Stops (more likely for international)
      const stops = isInternational ? Math.floor(Math.random() * 2) : 0;

      flights.push({
        offerId: `MOCK-${airline.code}${flightNum}-${Date.now()}-${i}`,
        id: `${airline.code}${flightNum}`,
        airline: airline.name,
        airlineCode: airline.code,
        flightNumber: `${airline.code}${flightNum}`,
        departure: {
          airport: origin,
          city: originCity,
          time: departureTime.toISOString(),
          terminal: Math.floor(Math.random() * 3) + 1
        },
        arrival: {
          airport: destination,
          city: destCity,
          time: arrivalTime.toISOString(),
          terminal: Math.floor(Math.random() * 3) + 1
        },
        duration: `PT${durationHours}H${durationMinutes}M`,
        durationFormatted: `${durationHours}h ${durationMinutes}m`,
        stops: stops,
        cabin: travelClass,
        price: {
          total: totalPrice,
          perPerson: unitPrice,
          currency: 'KES'
        },
        seatsAvailable: 5 + Math.floor(Math.random() * 20),
        baggage: {
          cabin: '7kg',
          checked: travelClass === 'ECONOMY' ? '23kg' : '32kg'
        },
        refundable: Math.random() > 0.5,
        isMock: true
      });
    }

    // Sort by price
    return flights.sort((a, b) => a.price.total - b.price.total);
  };

  const handleSearchParamChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      if (!searchParams.departureDate) {
        setError('Please select a departure date');
        setLoading(false);
        return;
      }

      const depDate = searchParams.departureDate instanceof DateTime ? searchParams.departureDate : DateTime.fromJSDate(new Date(searchParams.departureDate));
      const today = DateTime.now().startOf('day');

      if (depDate < today) {
        setError('Departure date must be in the future');
        setLoading(false);
        return;
      }

      if (searchParams.returnDate && searchParams.isRoundTrip) {
        const retDate = searchParams.returnDate instanceof DateTime ? searchParams.returnDate : DateTime.fromJSDate(new Date(searchParams.returnDate));
        if (retDate <= depDate) {
          setError('Return date must be after departure date');
          setLoading(false);
          return;
        }
      }

      let flights = [];
      let usedMock = false;

      try {
        const response = await apiRequest(`${API_BASE_URL}/flights/search`, {
          method: 'POST',
          body: JSON.stringify({
            origin: searchParams.origin,
            destination: searchParams.destination,
            departureDate: searchParams.departureDate instanceof DateTime ? searchParams.departureDate.toISODate() : searchParams.departureDate,
            returnDate: searchParams.isRoundTrip && searchParams.returnDate ? (searchParams.returnDate instanceof DateTime ? searchParams.returnDate.toISODate() : searchParams.returnDate) : null,
            adults: parseInt(searchParams.adults),
            children: parseInt(searchParams.children),
            infants: parseInt(searchParams.infants),
            travelClass: searchParams.travelClass
          })
        });

        if (response.success && response.data.flights && response.data.flights.length > 0) {
          flights = response.data.flights;
        } else {
          // API returned no results - use mock data
          usedMock = true;
        }
      } catch (apiErr) {
        console.warn('Flight API unavailable, using mock data:', apiErr);
        usedMock = true;
      }

      // Fallback to mock data if API failed or returned no results
      if (usedMock || flights.length === 0) {
        const depDateStr = searchParams.departureDate instanceof DateTime 
          ? searchParams.departureDate.toISODate() 
          : searchParams.departureDate;
        
        flights = generateMockFlights(
          searchParams.origin,
          searchParams.destination,
          depDateStr,
          parseInt(searchParams.adults),
          parseInt(searchParams.children),
          searchParams.travelClass
        );
        
        console.log('Using mock flight data:', flights.length, 'flights');
      }

      setSearchResults(flights);
      if (flights.length === 0) {
        setError('No flights found for the selected criteria');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    // Initialize passengers array based on total travelers
    const totalTravelers = parseInt(searchParams.adults) + parseInt(searchParams.children) + parseInt(searchParams.infants);
    setPassengers(Array(totalTravelers).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      nationality: 'KE',
      passportNumber: '',
      passportExpiry: '',
      passportIssuingCountry: 'KE'
    })));
    setPassengerDialogOpen(true);
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleContactInfoChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddToCart = async () => {
    if (!selectedFlight) return;

    // Validate all passengers filled including passport
    if (passengers.some(p => !p.firstName || !p.lastName || !p.dateOfBirth || !p.passportNumber || !p.passportExpiry)) {
      setError('Please fill in all passenger information including passport details');
      return;
    }

    // Validate contact info
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone) {
      setError('Please fill in all contact information');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build flight title for cart display
      const flightTitle = `${selectedFlight.airline} - ${selectedFlight.departure?.airport || searchParams.origin} → ${selectedFlight.arrival?.airport || searchParams.destination}`;
      
      // Build cart item data
      const cartItemData = {
        item_type: 'flight',
        item_ref_id: selectedFlight.offerId || selectedFlight.id,
        item_title: flightTitle,
        quantity: passengers.length,
        price: selectedFlight.price?.total || 0,
        metadata: {
          flightOffer: selectedFlight,
          passengers,
          contactInfo,
          departure: selectedFlight.departure,
          arrival: selectedFlight.arrival,
          airline: selectedFlight.airline,
          duration: selectedFlight.duration,
          stops: selectedFlight.stops
        }
      };

      if (user) {
        // Add to logged-in user cart via API (only if user object exists)
        const response = await apiRequest(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          body: JSON.stringify(cartItemData)
        });

        if (response.success) {
          toast.success('Flight added to cart!');
          setPassengerDialogOpen(false);
          setSelectedFlight(null);
          navigate('/checkout');
        } else {
          setError(response.message || 'Failed to add flight to cart');
        }
      } else {
        // Guest cart flow
        let cartId = guestCartId;
        
        // Create guest cart if needed
        if (!cartId) {
          const newCartId = await createGuestCart(apiRequest, API_BASE_URL);
          if (newCartId) {
            cartId = newCartId;
          } else {
            throw new Error('Failed to create guest cart');
          }
        }

        // Add to guest cart (pass apiRequest and API_BASE_URL as required by context)
        const result = await addToGuestCart(cartId, cartItemData, null, null, null, apiRequest, API_BASE_URL);
        
        if (result) {
          toast.success('Flight added to cart!');
          setPassengerDialogOpen(false);
          setSelectedFlight(null);
          navigate('/checkout');
        } else {
          setError('Failed to add flight to cart');
        }
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setError('Failed to add flight to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openDates = () => setOpenDateDialog(true);
  const closeDates = () => setOpenDateDialog(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return timeString;
    }
  };

  const formatDuration = (duration) => {
    // Convert ISO 8601 duration to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    const hours = match[1] ? match[1].replace('H', '') : '0';
    const minutes = match[2] ? match[2].replace('M', '') : '0';
    return `${hours}h ${minutes}m`;
  };

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = searchResults.filter(flight => {
      const priceOk = flight.price.total >= priceRange[0] && flight.price.total <= priceRange[1];
      const stopsOk = flight.stops <= maxStops;
      const airlineOk = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airlineCode);
      return priceOk && stopsOk && airlineOk;
    });

    // Sort results
    switch (sortBy) {
      case 'price':
        return filtered.sort((a, b) => a.price.total - b.price.total);
      case 'duration':
        return filtered.sort((a, b) => {
          const durationA = a.duration.match(/(\d+)H/) ? parseInt(a.duration.match(/(\d+)H/)[1]) : 0;
          const durationB = b.duration.match(/(\d+)H/) ? parseInt(b.duration.match(/(\d+)H/)[1]) : 0;
          return durationA - durationB;
        });
      case 'stops':
        return filtered.sort((a, b) => a.stops - b.stops);
      case 'departure':
        return filtered.sort((a, b) => {
          const timeA = a.departure.time;
          const timeB = b.departure.time;
          return timeA.localeCompare(timeB);
        });
      default:
        return filtered;
    }
  }, [searchResults, priceRange, maxStops, selectedAirlines, sortBy]);

  const toggleFavorite = (flightId) => {
    if (favorites.includes(flightId)) {
      setFavorites(favorites.filter(id => id !== flightId));
    } else {
      setFavorites([...favorites, flightId]);
    }
  };

  const uniqueAirlines = useMemo(() => {
    return [...new Set(searchResults.map(f => f.airlineCode))];
  }, [searchResults]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: 'background.default' }}>
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
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: 'white', fontWeight: 700, letterSpacing: 2, mb: 1 }}
            >
              FLIGHTS & TRAVEL
            </Typography>

            <Typography
              variant="h2"
              sx={{ color: 'white', fontWeight: 900, mb: 2, fontSize: { xs: '1.5rem', md: '2.5rem' }, lineHeight: 1.05 }}
            >
              Book flights to anywhere
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: alpha('#fff', 0.95), maxWidth: 900, mx: 'auto', mb: 3, fontWeight: 500 }}
            >
              Search and compare flight deals from airlines worldwide. Find the best prices and book your next adventure today.
            </Typography>
          </Box>

          {/* Search Card */}
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 8px 24px rgba(2,6,23,0.08)', width: { xs: '100%', md: '95%' }, mx: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <form onSubmit={handleSearch}>
                <Grid container spacing={2} alignItems="flex-end">
                  {/* Trip Type Toggle */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant={!searchParams.isRoundTrip ? 'contained' : 'outlined'}
                        onClick={() => handleSearchParamChange('isRoundTrip', false)}
                        size="small"
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 600,
                          ...((!searchParams.isRoundTrip) && {
                            background: '#ff0080',
                            color: 'white',
                            '&:hover': { background: '#e6006f' }
                          })
                        }}
                      >
                        One way
                      </Button>
                      <Button
                        variant={searchParams.isRoundTrip ? 'contained' : 'outlined'}
                        onClick={() => handleSearchParamChange('isRoundTrip', true)}
                        size="small"
                        sx={{ 
                          textTransform: 'none', 
                          fontWeight: 600,
                          ...(searchParams.isRoundTrip && {
                            background: '#ff0080',
                            color: 'white',
                            '&:hover': { background: '#e6006f' }
                          })
                        }}
                      >
                        Return
                      </Button>
                    </Box>
                  </Grid>

                  {/* Origin */}
                  <Grid item xs={12} sm={6} md={2.3}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                        From
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={searchParams.origin}
                          onChange={(e) => handleSearchParamChange('origin', e.target.value)}
                          sx={{
                            bgcolor: '#fafafa',
                            borderRadius: 2,
                            height: 56,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' }
                          }}
                        >
                          {commonAirports.map(airport => (
                            <MenuItem key={airport.code} value={airport.code}>
                              {airport.code} - {airport.city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Destination */}
                  <Grid item xs={12} sm={6} md={2.3}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                        To
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={searchParams.destination}
                          onChange={(e) => handleSearchParamChange('destination', e.target.value)}
                          sx={{
                            bgcolor: '#fafafa',
                            borderRadius: 2,
                            height: 56,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' }
                          }}
                        >
                          {commonAirports.map(airport => (
                            <MenuItem key={airport.code} value={airport.code}>
                              {airport.code} - {airport.city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Dates */}
                  <Grid item xs={12} sm={6} md={3}>
                    {searchParams.isRoundTrip ? (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                          Dates
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={searchParams.departureDate && searchParams.returnDate ? `${formatDate(searchParams.departureDate)} — ${formatDate(searchParams.returnDate)}` : ''}
                          onClick={openDates}
                          size="small"
                          InputProps={{ readOnly: true, endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={openDates}><CalendarIcon color="action" /></IconButton>
                            </InputAdornment>
                          )}}
                          sx={{ bgcolor: '#fafafa', borderRadius: 2, cursor: 'pointer', '& .MuiOutlinedInput-root': { height: 56 }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' } }}
                        />

                        <Dialog open={openDateDialog} onClose={closeDates} fullWidth maxWidth="sm">
                          <DialogTitle sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6">Select dates</Typography>
                              <Box>
                                {searchParams.departureDate ? (
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {formatDate(searchParams.departureDate)}
                                    {searchParams.returnDate ? ` — ${formatDate(searchParams.returnDate)}` : ''}
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>
                          </DialogTitle>
                          <DialogContent>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                              <Grid container spacing={2} sx={{ mt: 0 }}>
                                <LocalizationProvider dateAdapter={AdapterLuxon}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Departure</Typography>
                                    <DatePicker
                                      value={searchParams.departureDate}
                                      onChange={(date) => setSearchParams(prev => ({ ...prev, departureDate: date }))}
                                      minDate={DateTime.now().startOf('day')}
                                      renderInput={(params) => <TextField {...params} size="small" fullWidth sx={{ bgcolor: '#fafafa', borderRadius: 2, '& .MuiOutlinedInput-root': { height: 56 } }} />}
                                    />
                                  </Grid>

                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Return</Typography>
                                    <DatePicker
                                      value={searchParams.returnDate}
                                      onChange={(date) => setSearchParams(prev => ({ ...prev, returnDate: date }))}
                                      minDate={searchParams.departureDate || DateTime.now().startOf('day')}
                                      renderInput={(params) => <TextField {...params} size="small" fullWidth sx={{ bgcolor: '#fafafa', borderRadius: 2, '& .MuiOutlinedInput-root': { height: 56 } }} />}
                                    />
                                  </Grid>
                                </LocalizationProvider>
                              </Grid>
                            </Paper>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={closeDates}>Cancel</Button>
                            <Button onClick={closeDates} variant="contained" sx={{ boxShadow: '0 8px 20px rgba(2,6,23,0.12)' }}>Apply</Button>
                          </DialogActions>
                        </Dialog>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                          Depart
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                          <DatePicker
                            value={searchParams.departureDate}
                            onChange={(date) => setSearchParams(prev => ({ ...prev, departureDate: date }))}
                            minDate={DateTime.now().startOf('day')}
                            renderInput={(params) => <TextField {...params} size="small" fullWidth sx={{ bgcolor: '#fafafa', borderRadius: 2, '& .MuiOutlinedInput-root': { height: 56 } }} />}
                          />
                        </LocalizationProvider>
                      </Box>
                    )}
                  </Grid>

                  {/* Passengers */}
                  <Grid item xs={12} sm={6} md={2.2}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                        Passengers
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={parseInt(searchParams.adults) + parseInt(searchParams.children)}
                        size="small"
                        sx={{
                          bgcolor: '#fafafa',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': { height: 56 },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Search Button */}
                  <Grid item xs={12} md={2.2}>
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        disabled={!searchParams.destination || !searchParams.departureDate || loading}
                        sx={{
                          background: '#ff0080',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'none',
                          height: 56,
                          borderRadius: 2,
                          boxShadow: '0 8px 18px rgba(255, 0, 128, 0.2)',
                          '&:hover': { background: '#e6006f', transform: 'translateY(-1px)' }
                        }}
                      >
                        {loading ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
                        Search
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
      {/* End of Hero Section */}

      {/* Search Results */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {searchResults.length > 0 && (
          <Box>
            <Grid container spacing={3}>
              {/* Filters Sidebar */}
              <Grid item xs={12} md={3}>
                <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Filters</Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Price Filter */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Price
                      </Typography>
                      <Slider
                        value={priceRange}
                        onChange={(e, newValue) => setPriceRange(newValue)}
                        min={0}
                        max={Math.max(...searchResults.map(f => f.price.total), 500000)}
                        step={5000}
                        sx={{
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#ff0080',
                            '&:hover': { boxShadow: '0 0 0 8px rgba(255, 0, 128, 0.16)' }
                          },
                          '& .MuiSlider-track': { backgroundColor: '#ff0080' }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {priceRange[0].toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {priceRange[1].toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Stops Filter */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Stops
                      </Typography>
                      <Stack spacing={1}>
                        {[
                          { label: 'Direct', value: 0 },
                          { label: '1 stop', value: 1 },
                          { label: '2+ stops', value: 2 }
                        ].map(stop => {
                          const stopsFlights = searchResults.filter(f => f.stops === stop.value);
                          const minPrice = stopsFlights.length > 0 
                            ? Math.min(...stopsFlights.map(f => f.price.total))
                            : null;
                          return (
                            <Box key={stop.value}>
                              <FormControlLabel
                                control={<Checkbox size="small" />}
                                label={<Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{stop.label}</Typography>}
                              />
                              {minPrice && (
                                <Typography variant="caption" sx={{ fontSize: '0.8rem', color: '#666', ml: 3 }}>
                                  from KES {minPrice.toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Baggage Filter */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Baggage
                      </Typography>
                      <Stack spacing={1}>
                        {[
                          { label: 'Cabin bag', value: 'cabin' },
                          { label: 'Checked bag', value: 'checked' }
                        ].map(bag => (
                          <FormControlLabel
                            key={bag.value}
                            control={<Checkbox size="small" />}
                            label={<Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{bag.label}</Typography>}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Outbound Time */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Outbound
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', mb: 1 }}>
                        00:00 - 23:59
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Duration Filter */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                        Duration
                      </Typography>
                      <Slider
                        value={durationRange || [2.5, 46.5]}
                        onChange={(e, newValue) => setDurationRange(newValue)}
                        min={2.5}
                        max={46.5}
                        step={0.5}
                        marks={[
                          { value: 2.5, label: '2.5h' },
                          { value: 46.5, label: '46.5h' }
                        ]}
                        sx={{
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#ff0080',
                            '&:hover': { boxShadow: '0 0 0 8px rgba(255, 0, 128, 0.16)' }
                          },
                          '& .MuiSlider-track': { backgroundColor: '#ff0080' }
                        }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Airlines Filter */}
                    {uniqueAirlines.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem' }}>
                          Airlines
                        </Typography>
                        <Stack spacing={1}>
                          {uniqueAirlines.map(airline => {
                            const airlineFlights = searchResults.filter(f => f.airlineCode === airline);
                            const minPrice = airlineFlights.length > 0
                              ? Math.min(...airlineFlights.map(f => f.price.total))
                              : null;
                            return (
                              <Box key={airline}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={selectedAirlines.includes(airline)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedAirlines([...selectedAirlines, airline]);
                                        } else {
                                          setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                                        }
                                      }}
                                      size="small"
                                    />
                                  }
                                  label={<Typography variant="body2" sx={{ fontSize: '0.9rem' }}>{airline}</Typography>}
                                />
                                {minPrice && (
                                  <Typography variant="caption" sx={{ fontSize: '0.8rem', color: '#666', ml: 3 }}>
                                    from KES {minPrice.toLocaleString()}
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {/* CO2 Emissions Filter */}
                    <Box>
                      <FormControlLabel
                        control={<Checkbox size="small" />}
                        label={<Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Only show flights with lower CO2e emissions</Typography>}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Results */}
              <Grid item xs={12} md={9}>
                {/* Top Bar - Sort & Count */}
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
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#002d68' }}>
                      {filteredAndSortedResults.length} Flight{filteredAndSortedResults.length !== 1 ? 's' : ''} sorted by {sortBy === 'price' ? 'Price' : sortBy === 'duration' ? 'Duration' : sortBy === 'stops' ? 'Stops' : 'Departure'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 'auto' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel sx={{ fontSize: '0.9rem' }}>Sort</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{ fontSize: '0.9rem' }}
                      >
                        <MenuItem value="price">Price (Low to High)</MenuItem>
                        <MenuItem value="duration">Shortest Duration</MenuItem>
                        <MenuItem value="stops">Fewest Stops</MenuItem>
                        <MenuItem value="departure">Earliest Departure</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Price Comparison Cards */}
                {filteredAndSortedResults.length > 0 && (
                  <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    {[
                      { 
                        label: 'Best', 
                        sortKey: 'price',
                        getValue: (flights) => flights.sort((a, b) => a.price.total - b.price.total)[0]
                      },
                      { 
                        label: 'Cheapest', 
                        sortKey: 'price',
                        getValue: (flights) => flights.sort((a, b) => a.price.total - b.price.total)[0]
                      },
                      { 
                        label: 'Fastest', 
                        sortKey: 'duration',
                        getValue: (flights) => {
                          return flights.sort((a, b) => {
                            const dA = parseInt(a.duration.match(/(\d+)H/)?.[1] || 999);
                            const dB = parseInt(b.duration.match(/(\d+)H/)?.[1] || 999);
                            return dA - dB;
                          })[0];
                        }
                      }
                    ].map((option, idx) => {
                      const flight = option.getValue(filteredAndSortedResults);
                      return (
                        <Grid item xs={12} sm={4} key={idx}>
                          <Card sx={{ 
                            p: 1.5, 
                            bgcolor: sortBy === option.sortKey ? '#ff0080' : 'white',
                            color: sortBy === option.sortKey ? 'white' : 'inherit',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: sortBy === option.sortKey ? '#ff0080' : alpha('#000', 0.06),
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }
                          }} onClick={() => setSortBy(option.sortKey)}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {option.label}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              KES {flight?.price.total.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {flight?.duration} average
                            </Typography>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {/* Flight List */}
                <Grid container spacing={2}>
                  {filteredAndSortedResults.map((flight, index) => (
                    <Grid item xs={12} key={index}>
                      <Box
                        onClick={() => handleSelectFlight(flight)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#000', 0.06),
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                            borderColor: '#ff0080'
                          }
                        }}
                      >
                        {/* Airline Logo */}
                        <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                          {flight.airlineLogoUrl ? (
                            <img 
                              src={flight.airlineLogoUrl} 
                              alt={flight.airline}
                              style={{ height: 40, marginBottom: 4 }}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <FlightIcon sx={{ fontSize: 40, color: '#ff0080', mb: 0.5 }} />
                          )}
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            {flight.airline}
                          </Typography>
                        </Box>

                        {/* Flight Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {/* Departure */}
                            <Box sx={{ minWidth: 80 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#002d68' }}>
                                {formatTime(flight.departure.time)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {flight.departure.airport}
                              </Typography>
                            </Box>

                            {/* Duration & Stops */}
                            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {formatDuration(flight.duration)}
                              </Typography>
                              <Box sx={{ position: 'relative', height: 2, bgcolor: '#eee', mb: 0.5 }}>
                                <Box sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff0080' }} />
                                {flight.stops > 0 && (
                                  <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff0080' }} />
                                )}
                                <Box sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff0080' }} />
                              </Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                              </Typography>
                            </Box>

                            {/* Arrival */}
                            <Box sx={{ minWidth: 80 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#002d68' }}>
                                {formatTime(flight.arrival.time)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {flight.arrival.airport}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Price & Action */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                              from per person
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{
                                color: '#ff0080',
                                fontWeight: 900
                              }}
                            >
                              {flight.price.currency} {Math.round(flight.price.total).toLocaleString()}
                            </Typography>
                          </Box>
                          <Tooltip title={favorites.includes(flight.id) ? "Remove from favorites" : "Add to favorites"}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(flight.id);
                              }}
                              sx={{
                                color: favorites.includes(flight.id) ? '#ff0080' : 'text.secondary',
                                '&:hover': { color: '#ff0080' }
                              }}
                            >
                              {favorites.includes(flight.id) ? 
                                <FavoriteIcon /> : 
                                <FavoriteBorderIcon />
                              }
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {filteredAndSortedResults.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      No flights match your filter criteria. Try adjusting your filters.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
      </Container>

      {/* Modern Passenger Details Dialog */}
      <Dialog 
        open={passengerDialogOpen} 
        onClose={() => setPassengerDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        {/* Flight Summary Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
          color: 'white',
          p: 3
        }}>
          <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
            COMPLETE YOUR BOOKING
          </Typography>
          {selectedFlight && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    ✈️
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {selectedFlight.departure?.airport || searchParams.origin} → {selectedFlight.arrival?.airport || searchParams.destination}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {selectedFlight.airline} • {formatDuration(selectedFlight.duration)} • {selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop(s)`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Price</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    KES {selectedFlight.price?.total?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Contact Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: '#e3f2fd', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#1976d2',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  1
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                  Contact Details
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                  We'll send your confirmation here
                </Typography>
              </Box>
              
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={contactInfo.firstName}
                      onChange={(e) => handleContactInfoChange('firstName', e.target.value)}
                      required
                      InputProps={{
                        sx: { bgcolor: 'white', borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={contactInfo.lastName}
                      onChange={(e) => handleContactInfoChange('lastName', e.target.value)}
                      required
                      InputProps={{
                        sx: { bgcolor: 'white', borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactInfoChange('email', e.target.value)}
                      required
                      placeholder="email@example.com"
                      InputProps={{
                        sx: { bgcolor: 'white', borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      required
                      placeholder="+254 7XX XXX XXX"
                      InputProps={{
                        sx: { bgcolor: 'white', borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {/* Traveler Information Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: '#e3f2fd', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#1976d2',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  2
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                  Traveler Information
                </Typography>
                <Chip 
                  label={`${passengers.length} Traveler${passengers.length > 1 ? 's' : ''}`} 
                  size="small" 
                  sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                />
              </Box>

              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Please enter names exactly as they appear on your passport or government ID.
              </Alert>

              {passengers.map((passenger, index) => (
                <Paper 
                  key={index} 
                  elevation={0} 
                  sx={{ 
                    mb: 2, 
                    p: 2.5, 
                    bgcolor: '#f8fafc', 
                    borderRadius: 2, 
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Traveler Badge */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bgcolor: index === 0 ? '#1976d2' : '#64b5f6',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: '0 0 8px 0',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {index === 0 ? '👤 Primary Traveler' : `👤 Traveler ${index + 1}`}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      {/* Title/Gender */}
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Title</InputLabel>
                          <Select
                            value={passenger.gender === 'FEMALE' ? 'Ms' : 'Mr'}
                            label="Title"
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value === 'Ms' ? 'FEMALE' : 'MALE')}
                            sx={{ bgcolor: 'white', borderRadius: 1.5 }}
                          >
                            <MenuItem value="Mr">Mr</MenuItem>
                            <MenuItem value="Ms">Ms</MenuItem>
                            <MenuItem value="Mrs">Mrs</MenuItem>
                            <MenuItem value="Dr">Dr</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* First Name */}
                      <Grid item xs={12} sm={4.5}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                          required
                          placeholder="As on passport"
                          InputProps={{
                            sx: { bgcolor: 'white', borderRadius: 1.5 }
                          }}
                        />
                      </Grid>
                      
                      {/* Last Name */}
                      <Grid item xs={12} sm={4.5}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                          required
                          placeholder="As on passport"
                          InputProps={{
                            sx: { bgcolor: 'white', borderRadius: 1.5 }
                          }}
                        />
                      </Grid>

                      {/* Date of Birth */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Date of Birth"
                          value={passenger.dateOfBirth}
                          onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                          required
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            sx: { bgcolor: 'white', borderRadius: 1.5 }
                          }}
                        />
                      </Grid>

                      {/* Nationality */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Nationality</InputLabel>
                          <Select
                            value={passenger.nationality || 'KE'}
                            label="Nationality"
                            onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                            sx={{ bgcolor: 'white', borderRadius: 1.5 }}
                          >
                            <MenuItem value="KE">🇰🇪 Kenya</MenuItem>
                            <MenuItem value="TZ">🇹🇿 Tanzania</MenuItem>
                            <MenuItem value="UG">🇺🇬 Uganda</MenuItem>
                            <MenuItem value="ET">🇪🇹 Ethiopia</MenuItem>
                            <MenuItem value="RW">🇷🇼 Rwanda</MenuItem>
                            <MenuItem value="NG">🇳🇬 Nigeria</MenuItem>
                            <MenuItem value="ZA">🇿🇦 South Africa</MenuItem>
                            <MenuItem value="GB">🇬🇧 United Kingdom</MenuItem>
                            <MenuItem value="US">🇺🇸 United States</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Passport Section Divider */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>
                          <Chip label="🛂 Passport Details" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                        </Divider>
                      </Grid>

                      {/* Passport Number */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Passport Number"
                          value={passenger.passportNumber}
                          onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value.toUpperCase())}
                          required
                          placeholder="e.g., A12345678"
                          InputProps={{
                            sx: { bgcolor: 'white', borderRadius: 1.5 }
                          }}
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                      </Grid>

                      {/* Passport Expiry */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Passport Expiry Date"
                          value={passenger.passportExpiry}
                          onChange={(e) => handlePassengerChange(index, 'passportExpiry', e.target.value)}
                          required
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            sx: { bgcolor: 'white', borderRadius: 1.5 }
                          }}
                          helperText="Must be valid 6+ months"
                        />
                      </Grid>

                      {/* Passport Issuing Country */}
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Issuing Country</InputLabel>
                          <Select
                            value={passenger.passportIssuingCountry || 'KE'}
                            label="Issuing Country"
                            onChange={(e) => handlePassengerChange(index, 'passportIssuingCountry', e.target.value)}
                            sx={{ bgcolor: 'white', borderRadius: 1.5 }}
                          >
                            <MenuItem value="KE">🇰🇪 Kenya</MenuItem>
                            <MenuItem value="TZ">🇹🇿 Tanzania</MenuItem>
                            <MenuItem value="UG">🇺🇬 Uganda</MenuItem>
                            <MenuItem value="ET">🇪🇹 Ethiopia</MenuItem>
                            <MenuItem value="RW">🇷🇼 Rwanda</MenuItem>
                            <MenuItem value="NG">🇳🇬 Nigeria</MenuItem>
                            <MenuItem value="ZA">🇿🇦 South Africa</MenuItem>
                            <MenuItem value="GB">🇬🇧 United Kingdom</MenuItem>
                            <MenuItem value="US">🇺🇸 United States</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Price Summary */}
            {selectedFlight && (
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fcd34d', mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', mb: 1.5 }}>
                  💰 Price Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Base fare × {passengers.length} traveler{passengers.length > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    KES {((selectedFlight.price?.perPerson || selectedFlight.price?.total / passengers.length) * passengers.length).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Taxes & Fees
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Included
                  </Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
                    KES {selectedFlight.price?.total?.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        {/* Actions Footer */}
        <Box sx={{ 
          p: 2.5, 
          borderTop: '1px solid #e2e8f0', 
          bgcolor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Button 
            onClick={() => setPassengerDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            ← Back to flights
          </Button>
          <Button 
            onClick={handleAddToCart} 
            variant="contained"
            disabled={loading}
            size="large"
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '🛒 Continue to Checkout'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FlightSearchPage;
