import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Pagination,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Popover,
  IconButton,
  Stack,
  InputAdornment,
  Autocomplete,
  useTheme,
  alpha
} from '@mui/material';
import { DateTime } from 'luxon';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  Star as StarIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const HotelSearchPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, apiRequest, API_BASE_URL } = useAuth();
  // Shared input styling for modern look + focus states
  const inputSx = {
    bgcolor: '#fafafa',
    borderRadius: 2,
    '& .MuiOutlinedInput-root': { height: 56 },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0055B8' }
  };
  
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: null,
    checkOut: null,
    // rooms: number of rooms; roomsDetails: per-room assignment
    rooms: 1,
    roomsDetails: [ { adults: 2, children: 0, childrenAges: [] } ],
    page: 1,
    itemsPerPage: 12
  });

  // Google Places autocomplete state
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placePredictions, setPlacePredictions] = useState([]);
  const placesServiceRef = useRef(null);

  const [openDateDialog, setOpenDateDialog] = useState(false);
  const openDates = () => setOpenDateDialog(true);
  const closeDates = () => setOpenDateDialog(false);

    // Guest popover state
    const [guestAnchorEl, setGuestAnchorEl] = useState(null);

    const openGuestPopover = (e) => setGuestAnchorEl(e.currentTarget);
    const closeGuestPopover = () => setGuestAnchorEl(null);

    // Helpers to manage roomsDetails array
    const syncRoomsDetails = (rooms) => {
      setSearchParams(prev => {
        const details = [...(prev.roomsDetails || [])];
        while (details.length < rooms) details.push({ adults: 2, children: 0, childrenAges: [] });
        while (details.length > rooms) details.pop();
        return { ...prev, rooms, roomsDetails: details };
      });
    };

    const updateRoom = (index, changes) => {
      setSearchParams(prev => {
        const details = prev.roomsDetails.map((r, i) => i === index ? { ...r, ...changes } : r);
        return { ...prev, roomsDetails: details };
      });
    };

    // (removed duplicate date dialog state)


  const [destinations, setDestinations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [favorites, setFavorites] = useState([]);

  // Fetch popular destinations
  useEffect(() => {
    fetchDestinations();
  }, []);

  // Load Google Places script if API key exists
  useEffect(() => {
    const key = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    if (!key) return;

    if (window.google && window.google.maps && window.google.maps.places) {
      placesServiceRef.current = new window.google.maps.places.AutocompleteService();
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => {
      placesServiceRef.current = new window.google.maps.places.AutocompleteService();
      setGoogleLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // When placeQuery changes, request predictions
  useEffect(() => {
    if (!googleLoaded || !placeQuery || !placesServiceRef.current) return;
    const service = placesServiceRef.current;
    service.getPlacePredictions({ input: placeQuery }, (preds, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
        setPlacePredictions(preds.map(p => ({ description: p.description, place_id: p.place_id })));
      } else {
        setPlacePredictions([]);
      }
    });
  }, [placeQuery, googleLoaded]);

  // Fetch user favorites
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchDestinations = async () => {
    try {
      console.log('Fetching destinations from:', `${API_BASE_URL}/hotels/destinations`);
      const response = await apiRequest(`${API_BASE_URL}/hotels/destinations`);
      console.log('Destinations response:', response);
      if (response.success) {
        console.log('Setting destinations:', response.data);
        setDestinations(response.data);
      } else {
        console.error('Destinations API returned success:false');
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/hotels/favorites`);
      if (response.success) {
        setFavorites(response.data.map(fav => fav.hotel_code));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchParams.destination || !searchParams.checkIn || !searchParams.checkOut) {
      setError('Please fill in all required fields');
      return;
    }

    // Helpers to coerce dates to millis for comparison (handles Luxon DateTime or JS Date)
    const toMillis = (v) => {
      if (!v) return null;
      if (v && typeof v.toMillis === 'function') return v.toMillis();
      return new Date(v).setHours(0, 0, 0, 0);
    };

    // Validate check-in is in the future
    const today = DateTime.now().startOf('day');
    if (toMillis(searchParams.checkIn) < today.toMillis()) {
      setError('Check-in date must be in the future');
      return;
    }

    // Validate check-out is after check-in
    if (toMillis(searchParams.checkOut) <= toMillis(searchParams.checkIn)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    // Validate per-room children ages
    for (let i = 0; i < (searchParams.roomsDetails || []).length; i++) {
      const room = searchParams.roomsDetails[i];
      if ((room.childrenAges || []).length !== room.children) {
        setError(`Please provide ages for all children in room ${i + 1}`);
        return;
      }
    }

    console.log('=== Search Request ===');
    console.log('Search params:', searchParams);
    
    setLoading(true);
    setError('');

    try {
      const roomsDetails = searchParams.roomsDetails || [];
      const totalAdults = roomsDetails.reduce((s, r) => s + (r.adults || 0), 0);
      const totalChildren = roomsDetails.reduce((s, r) => s + (r.children || 0), 0);

      const formatForPayload = (d) => {
        if (!d) return null;
        if (d && typeof d.toISODate === 'function') return d.toISODate();
        return new Date(d).toISOString().split('T')[0];
      };

      const searchPayload = {
        destination: searchParams.destination,
        checkIn: formatForPayload(searchParams.checkIn),
        checkOut: formatForPayload(searchParams.checkOut),
        rooms: searchParams.rooms,
        roomsDetails,
        adults: totalAdults,
        children: totalChildren,
        page: searchParams.page,
        itemsPerPage: searchParams.itemsPerPage
      };

      console.log('Search payload:', searchPayload);

      const response = await apiRequest(`${API_BASE_URL}/hotels/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchPayload)
      });

      console.log('Search response:', response);

      if (response.success) {
        console.log('Setting search results:', response.data);
        setSearchResults(response.data.hotels);
        setTotalPages(Math.ceil(response.data.total / searchParams.itemsPerPage));
        setTotalResults(response.data.total);
      } else {
        setError(response.message || 'Failed to search hotels');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setSearchParams(prev => ({ ...prev, page: value }));
    handleSearch();
  };

  const toggleFavorite = async (hotelCode) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (favorites.includes(hotelCode)) {
        // Remove from favorites
        await apiRequest(`${API_BASE_URL}/hotels/favorites/${hotelCode}`, {
          method: 'DELETE'
        });
        setFavorites(prev => prev.filter(code => code !== hotelCode));
      } else {
        // Add to favorites
        await apiRequest(`${API_BASE_URL}/hotels/favorites`, {
          method: 'POST',
          body: JSON.stringify({ hotelCode })
        });
        setFavorites(prev => [...prev, hotelCode]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date.toFormat === 'function') return date.toFormat('MMM d, yyyy');
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatPrice = (price, currency = 'KES') => {
    if (!price) return `${currency} 0`;
    return `${currency} ${Math.round(price).toLocaleString()}`;
  };

  const handleDestinationSelect = (destination) => {
    setSearchParams(prev => ({
      ...prev,
      destination: destination.id,
      page: 1
    }));
    handleSearch();
  };

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
              STAYS & ACCOMMODATION
            </Typography>

            <Typography
              variant="h2"
              sx={{ color: 'white', fontWeight: 900, mb: 2, fontSize: { xs: '1.5rem', md: '2.5rem' }, lineHeight: 1.05 }}
            >
              Discover unforgettable stays across Kenya
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: alpha('#fff', 0.95), maxWidth: 900, mx: 'auto', mb: 3, fontWeight: 500 }}
            >
              Discover hotels, apartments and unique homes — curated deals, flexible booking and trusted reviews to help you plan the perfect trip.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/hotels')}
                sx={{ px: 5, py: 1.25, fontWeight: 700 }}
              >
                Explore Hotels
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/hotels?deals=true')}
                  sx={{
                    px: 4,
                    py: 1.25,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.85)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.95)' }
                  }}
              >
                View Deals
              </Button>
            </Box>
          </Box>

          {/* Search Form Card */}
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 8px 24px rgba(2,6,23,0.08)', width: { xs: '100%', md: '95%' }, mx: 'auto' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="flex-end">
                {/* Destination (autocomplete) */}
                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                      Where to?
                    </Typography>
                    <Autocomplete
                      freeSolo
                      options={googleLoaded ? placePredictions : destinations}
                      getOptionLabel={(option) => (option.description || option.name || '')}
                      value={
                        googleLoaded
                          ? placePredictions.find(p => p.description === searchParams.destination) || null
                          : destinations.find(d => d.id === searchParams.destination) || null
                      }
                      inputValue={placeQuery}
                      onInputChange={(e, value) => {
                        setPlaceQuery(value);
                        if (!googleLoaded) return;
                      }}
                      onChange={(e, value) => {
                        if (!value) {
                          setSearchParams(prev => ({ ...prev, destination: '' }));
                          return;
                        }
                        if (value.place_id) setSearchParams(prev => ({ ...prev, destination: value.description }));
                        else setSearchParams(prev => ({ ...prev, destination: value.id }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="City, landmark, or property"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationIcon color="action" />
                              </InputAdornment>
                            )
                          }}
                          sx={inputSx}
                        />
                      )}
                    />
                  </Box>
                </Grid>

                {/* Dates (opens dialog) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                      Dates
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={searchParams.checkIn && searchParams.checkOut ? `${formatDate(searchParams.checkIn)} — ${formatDate(searchParams.checkOut)}` : ''}
                      onClick={openDates}
                      size="small"
                      InputProps={{ readOnly: true, endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={openDates}><CalendarIcon color="action" /></IconButton>
                        </InputAdornment>
                      )}}
                      sx={{ ...inputSx, cursor: 'pointer' }}
                    />

                    <Dialog open={openDateDialog} onClose={closeDates} fullWidth maxWidth="sm">
                      <DialogTitle sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">Select dates</Typography>
                          <Box>
                            {searchParams.checkIn && searchParams.checkOut ? (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {formatDate(searchParams.checkIn)} — {formatDate(searchParams.checkOut)} • {(() => {
                                  const ci = searchParams.checkIn;
                                  const co = searchParams.checkOut;
                                  const ciDT = (ci && typeof ci.toMillis === 'function') ? ci : DateTime.fromJSDate(new Date(ci));
                                  const coDT = (co && typeof co.toMillis === 'function') ? co : DateTime.fromJSDate(new Date(co));
                                  return Math.max(1, Math.round(coDT.diff(ciDT, 'days').days) || 0);
                                })()} nights
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
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Check-in</Typography>
                                <DatePicker
                                  value={searchParams.checkIn}
                                  onChange={(date) => setSearchParams(prev => ({ ...prev, checkIn: date }))}
                                  minDate={DateTime.now().startOf('day')}
                                  renderInput={(params) => <TextField {...params} size="small" fullWidth sx={inputSx} />}
                                />
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Check-out</Typography>
                                <DatePicker
                                  value={searchParams.checkOut}
                                  onChange={(date) => setSearchParams(prev => ({ ...prev, checkOut: date }))}
                                  minDate={searchParams.checkIn || DateTime.now().startOf('day')}
                                  renderInput={(params) => <TextField {...params} size="small" fullWidth sx={inputSx} />}
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
                </Grid>

                {/* Rooms */}
                <Grid item xs={12} sm={6} md={1}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                      Rooms
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      value={searchParams.rooms}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(9, parseInt(e.target.value) || 1));
                        syncRoomsDetails(val);
                      }}
                      inputProps={{ min: 1, max: 9 }}
                      size="small"
                      sx={inputSx}
                    />
                  </Box>
                </Grid>

                {/* Guests (popover) - per-room assignment */}
                <Grid item xs={12} sm={6} md={2}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.5 }}>
                      Guests
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={`${searchParams.rooms} room(s), ${searchParams.roomsDetails.reduce((s,r)=>s+r.adults,0)} adults, ${searchParams.roomsDetails.reduce((s,r)=>s+r.children,0)} children`}
                      onClick={openGuestPopover}
                      size="small"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={openGuestPopover}>
                              <PeopleIcon color="action" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ ...inputSx, cursor: 'pointer', minWidth: 160 }}
                    />

                    <Popover
                      open={Boolean(guestAnchorEl)}
                      anchorEl={guestAnchorEl}
                      onClose={closeGuestPopover}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                      <Box sx={{ p: 2, width: 380 }}>
                        <Stack spacing={2}>
                          {searchParams.roomsDetails.map((room, idx) => (
                            <Box key={idx} sx={{ borderBottom: idx < searchParams.roomsDetails.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', pb: 1 }}>
                              <Typography variant="subtitle2">Room {idx + 1}</Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Typography sx={{ width: 64 }}>Adults</Typography>
                                  <Button size="small" onClick={() => updateRoom(idx, { adults: Math.max(1, room.adults - 1) })}>-</Button>
                                  <Typography sx={{ mx: 1 }}>{room.adults}</Typography>
                                  <Button size="small" onClick={() => updateRoom(idx, { adults: room.adults + 1 })}>+</Button>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Typography sx={{ width: 64 }}>Children</Typography>
                                  <Button size="small" onClick={() => updateRoom(idx, (() => {
                                    const children = Math.max(0, room.children - 1);
                                    const childrenAges = (room.childrenAges || []).slice(0, children);
                                    return { children, childrenAges };
                                  })())}>-</Button>
                                  <Typography sx={{ mx: 1 }}>{room.children}</Typography>
                                  <Button size="small" onClick={() => updateRoom(idx, { children: room.children + 1, childrenAges: [...(room.childrenAges||[]), 0] })}>+</Button>
                                </Box>

                                {Array.from({ length: room.children }).map((_, cIdx) => (
                                  <TextField
                                    key={`${idx}-${cIdx}`}
                                    size="small"
                                    label={`Child ${cIdx + 1} age`}
                                    type="number"
                                    value={room.childrenAges?.[cIdx] ?? 0}
                                    onChange={(e) => {
                                      const age = parseInt(e.target.value) || 0;
                                      const newAges = [...(room.childrenAges || [])];
                                      newAges[cIdx] = age;
                                      updateRoom(idx, { childrenAges: newAges });
                                    }}
                                    sx={{ mt: 1 }}
                                    inputProps={{ min: 0, max: 17 }}
                                    fullWidth
                                  />
                                ))}
                              </Box>
                            </Box>
                          ))}

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button size="small" disabled={searchParams.rooms <= 1} onClick={() => syncRoomsDetails(searchParams.rooms - 1)}>Remove Room</Button>
                            <Button size="small" disabled={searchParams.rooms >= 9} onClick={() => syncRoomsDetails(searchParams.rooms + 1)}>Add Room</Button>
                            <Box sx={{ flex: 1 }} />
                            <Button onClick={closeGuestPopover}>Done</Button>
                          </Box>
                        </Stack>
                      </Box>
                    </Popover>
                  </Box>
                </Grid>

                {/* Search Button */}
                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(90deg,#0055B8 0%,#003580 100%)',
                        color: 'white',
                        fontWeight: 700,
                        textTransform: 'none',
                        height: 58,
                        minWidth: 120,
                        borderRadius: 2,
                        px: 2,
                        boxShadow: '0 8px 18px rgba(0,53,128,0.12)',
                        '&:hover': { transform: 'translateY(-1px)' }
                      }}
                    >
                      {loading ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
                      Search
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

        {/* Popular Destinations */}
        {searchResults.length === 0 && (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
              Popular Kenyan Destinations
            </Typography>
            <Grid container spacing={3}>
              {destinations.map((destination) => (
                <Grid item xs={12} sm={6} md={3} key={destination.id}>
                  <Box
                    onClick={() => handleDestinationSelect(destination)}
                    sx={{
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid',
                      borderColor: alpha('#000', 0.06),
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
                        borderColor: '#ff0080',
                        '& .destination-image': {
                          transform: 'scale(1.08)'
                        }
                      }
                    }}
                  >
                    {/* Image Header */}
                    <Box sx={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                      {/* Background Image */}
                      <Box
                        className="destination-image"
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${destination.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.6s ease'
                        }}
                      />

                      {/* Overlay Gradient */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0, 45, 104, 0.7) 0%, rgba(255, 0, 128, 0.3) 100%)'
                        }}
                      />

                      {/* Content on Image */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          p: 2.5
                        }}
                      >
                        {/* Header Badge */}
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <Chip
                            label="Destination"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              color: '#002d68',
                              fontWeight: 800,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>

                        {/* Name & Region */}
                        <Box sx={{ color: 'white' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 900,
                              mb: 0.5,
                              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            {destination.name}
                          </Typography>
                          {destination.region && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationIcon sx={{ fontSize: 16, textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
                                }}
                              >
                                {destination.region}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom Section */}
                    <Box sx={{ p: 2.5 }}>
                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.primary',
                          lineHeight: 1.6,
                          mb: 2
                        }}
                      >
                        {destination.shortDescription || destination.description}
                      </Typography>

                      {/* Hotels Count & Best For */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {destination.hotelsCount && (
                          <Chip
                            label={`${destination.hotelsCount} hotels`}
                            size="small"
                            sx={{
                              bgcolor: alpha('#002d68', 0.08),
                              color: 'text.primary',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                        {destination.bestFor && (
                          <Chip
                            label={destination.bestFor}
                            size="small"
                            sx={{
                              bgcolor: alpha('#ff0080', 0.08),
                              color: '#ff0080',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>

                      {/* CTA Button */}
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #002d68 0%, #004a9f 100%)',
                          color: 'white',
                          p: 1.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 45, 104, 0.3)'
                          }
                        }}
                      >
                        Explore Destination
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        )}

        {/* Loading State */}
        {loading && (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Searching for hotels...
              </Typography>
            </Box>
          </Container>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="bold">
                {totalResults} Hotels Found
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(true)}
              >
                Filters
              </Button>
            </Box>

            <Grid container spacing={3}>
              {searchResults.map((hotel) => (
                <Grid item xs={12} md={6} lg={4} key={hotel.code}>
                  <Box
                    onClick={() => navigate(`/hotels/${hotel.code}`)}
                    sx={{
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden',
                      bgcolor: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid',
                      borderColor: alpha('#000', 0.06),
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
                        borderColor: '#ff0080',
                        '& .hotel-image': {
                          transform: 'scale(1.08)'
                        }
                      }
                    }}
                  >
                    {/* Image Header */}
                    <Box sx={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                      {/* Background Image */}
                      <Box
                        className="hotel-image"
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${hotel.images?.[0]?.path || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.6s ease'
                        }}
                      />

                      {/* Overlay Gradient */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0, 45, 104, 0.7) 0%, rgba(255, 0, 128, 0.3) 100%)'
                        }}
                      />

                      {/* Content on Image */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          p: 2.5
                        }}
                      >
                        {/* Type & Rating Badge */}
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Chip
                            label={hotel.categoryName || 'Hotel'}
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              color: '#002d68',
                              fontWeight: 800,
                              fontSize: '0.75rem'
                            }}
                          />
                          <Fab
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(hotel.code);
                            }}
                          >
                            {favorites.includes(hotel.code) ? (
                              <FavoriteIcon color="error" />
                            ) : (
                              <FavoriteBorderIcon />
                            )}
                          </Fab>
                        </Box>

                        {/* Name & Location */}
                        <Box sx={{ color: 'white' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 900,
                              mb: 0.5,
                              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            {hotel.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 16, textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)' }} />
                            <Typography
                              variant="body2"
                              sx={{
                                textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
                              }}
                            >
                              {hotel.city}, {hotel.country}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bottom Section */}
                    <Box sx={{ p: 2.5 }}>
                      {/* Amenities Grid */}
                      {hotel.facilities && hotel.facilities.length > 0 && (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 700,
                              display: 'block',
                              mb: 1.5,
                              textTransform: 'uppercase'
                            }}
                          >
                            Amenities
                          </Typography>

                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: 1.5,
                              mb: 2.5
                            }}
                          >
                            {hotel.facilities.slice(0, 9).map((facility, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 0.8,
                                  p: 1.5,
                                  bgcolor: alpha('#002d68', 0.05),
                                  borderRadius: 2,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    bgcolor: alpha('#ff0080', 0.1),
                                    transform: 'translateY(-4px)'
                                  }
                                }}
                              >
                                <Box sx={{ color: '#ff0080' }}>
                                  <HotelIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    color: 'text.primary'
                                  }}
                                >
                                  {facility}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </>
                      )}

                      {/* Additional Amenities as Chips */}
                      {hotel.facilities && hotel.facilities.length > 9 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {hotel.facilities.slice(9).map((facility, idx) => (
                            <Chip
                              key={idx}
                              label={facility}
                              size="small"
                              sx={{
                                bgcolor: alpha('#002d68', 0.08),
                                color: 'text.primary',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Reviews & Price Section */}
                      {hotel.reviews?.averageRating && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                            p: 1.5,
                            bgcolor: alpha('#002d68', 0.05),
                            borderRadius: 2
                          }}
                        >
                          <StarIcon sx={{ color: '#ffa726', fontSize: 18 }} />
                          <Typography variant="body2" fontWeight="800" color="text.primary">
                            {hotel.reviews.averageRating.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({hotel.reviews.totalReviews} {hotel.reviews.totalReviews === 1 ? 'review' : 'reviews'})
                          </Typography>
                        </Box>
                      )}

                      {/* Price & CTA */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: alpha('#000', 0.06)
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Per night from
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#ff0080',
                              fontWeight: 900
                            }}
                          >
                            {hotel.currency} {Math.round(hotel.minRate || 0).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            background: 'linear-gradient(135deg, #002d68 0%, #004a9f 100%)',
                            color: 'white',
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0, 45, 104, 0.3)'
                            }
                          }}
                        >
                          Book Now
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={searchParams.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Container>
        )}

        {/* Filters Dialog */}
        <Dialog open={showFilters} onClose={() => setShowFilters(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Hotels</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={50000}
                step={1000}
                marks={[
                  { value: 0, label: 'KES 0' },
                  { value: 10000, label: 'KES 10K' },
                  { value: 25000, label: 'KES 25K' },
                  { value: 50000, label: 'KES 50K' }
                ]}
                sx={{ mb: 3 }}
              />

              <Typography gutterBottom>Minimum Rating</Typography>
              <Rating
                value={selectedRating}
                onChange={(e, newValue) => setSelectedRating(newValue)}
                size="large"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFilters(false)}>Cancel</Button>
            <Button onClick={() => {
              handleSearch();
              setShowFilters(false);
            }} variant="contained">
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* No Results */}
        {!loading && searchResults.length === 0 && (searchParams.destination || searchParams.checkIn) && (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <HotelIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No hotels found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search dates or destination
              </Typography>
            </Box>
          </Container>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Box>
    );
  };

export default HotelSearchPage;
