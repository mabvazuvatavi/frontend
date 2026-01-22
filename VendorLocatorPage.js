import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  Rating,
  useTheme,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Phone,
  Email,
  Business,
  Star,
  FilterList,
  Map,
  People,
  AttachMoney,
  Event,
  Schedule,
  LocalOffer,
  Public,
  Language,
  CheckCircle,
  ExpandMore,
  NavigateNext,
  Favorite,
  Share,
  Camera,
  Celebration,
  Hardware,
  MusicNote,
  Security,
  DirectionsCar,
  MoreHoriz,
  Campaign,
  MyLocation,
  Sort,
  Map as MapIcon,
  ViewList,
  Directions,
  NearMe,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const VendorLocatorPage = () => {
  const theme = useTheme();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(25); // miles
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, price
  const [isLocating, setIsLocating] = useState(false);

  const categories = [
    { id: 'catering', name: 'Catering', icon: <LocalOffer /> },
    { id: 'photography', name: 'Photography', icon: <Camera /> },
    { id: 'decoration', name: 'Decoration', icon: <Celebration /> },
    { id: 'equipment', name: 'Equipment Rental', icon: <Hardware /> },
    { id: 'entertainment', name: 'Entertainment', icon: <MusicNote /> },
    { id: 'security', name: 'Security', icon: <Security /> },
    { id: 'transportation', name: 'Transportation', icon: <DirectionsCar /> },
    { id: 'venue', name: 'Venue Services', icon: <Business /> },
    { id: 'marketing', name: 'Marketing', icon: <Campaign /> },
    { id: 'other', name: 'Other Services', icon: <MoreHoriz /> },
  ];

  const locations = [
    { id: 'san-francisco', name: 'San Francisco', state: 'CA' },
    { id: 'new-york', name: 'New York', state: 'NY' },
    { id: 'los-angeles', name: 'Los Angeles', state: 'CA' },
    { id: 'chicago', name: 'Chicago', state: 'IL' },
    { id: 'miami', name: 'Miami', state: 'FL' },
    { id: 'boston', name: 'Boston', state: 'MA' },
    { id: 'dallas', name: 'Dallas', state: 'TX' },
    { id: 'seattle', name: 'Seattle', state: 'WA' },
  ];

  const priceRanges = [
    { id: 'budget', name: 'Budget ($0-$500)', min: 0, max: 500 },
    { id: 'mid-range', name: 'Mid-Range ($500-$2000)', min: 500, max: 2000 },
    { id: 'premium', name: 'Premium ($2000+)', min: 2000, max: 10000 },
  ];

  const mockVendors = [
    {
      id: 1,
      name: 'Gourmet Catering Co.',
      category: 'catering',
      location: 'san-francisco',
      rating: 4.8,
      reviews: 127,
      priceRange: 'mid-range',
      description: 'Premium catering services for corporate events, weddings, and special occasions.',
      services: ['Corporate Catering', 'Wedding Catering', 'Event Staffing'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 123-4567',
      email: 'info@gourmetcatering.com',
      website: 'https://gourmetcatering.com',
      verified: true,
      featured: true,
    },
    {
      id: 2,
      name: 'Capture Moments Photography',
      category: 'photography',
      location: 'new-york',
      rating: 4.9,
      reviews: 89,
      priceRange: 'premium',
      description: 'Professional event photography and videography services. Specializing in corporate events and weddings.',
      services: ['Event Photography', 'Videography', 'Photo Editing', 'Live Streaming'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 234-5678',
      email: 'hello@capturemoments.com',
      website: 'https://capturemoments.com',
      verified: true,
      featured: true,
    },
    {
      id: 3,
      name: 'Party Paradise Decorations',
      category: 'decoration',
      location: 'los-angeles',
      rating: 4.6,
      reviews: 203,
      priceRange: 'budget',
      description: 'Complete event decoration services. From balloon arches to full venue transformations.',
      services: ['Balloon Decor', 'Floral Arrangements', 'Lighting Design', 'Theme Decor'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 345-6789',
      email: 'info@partyparadise.com',
      website: 'https://partyparadise.com',
      verified: false,
      featured: false,
    },
    {
      id: 4,
      name: 'Pro Audio Equipment Rental',
      category: 'equipment',
      location: 'chicago',
      rating: 4.7,
      reviews: 156,
      priceRange: 'mid-range',
      description: 'Professional audio-visual equipment rental for events of all sizes.',
      services: ['Sound Systems', 'Lighting Equipment', 'LED Screens', 'DJ Equipment'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 456-7890',
      email: 'rentals@proaudio.com',
      website: 'https://proaudio.com',
      verified: true,
      featured: false,
    },
    {
      id: 5,
      name: 'Elite Entertainment Group',
      category: 'entertainment',
      location: 'miami',
      rating: 4.5,
      reviews: 78,
      priceRange: 'premium',
      description: 'Live entertainment services including bands, DJs, and special performers.',
      services: ['Live Bands', 'DJ Services', 'Special Performers', 'Event Hosting'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 567-8901',
      email: 'book@eliteentertainment.com',
      website: 'https://eliteentertainment.com',
      verified: true,
      featured: false,
    },
    {
      id: 6,
      name: 'SecureGuard Security Services',
      category: 'security',
      location: 'boston',
      rating: 4.9,
      reviews: 92,
      priceRange: 'mid-range',
      description: 'Professional security services for events, venues, and corporate functions.',
      services: ['Event Security', 'Crowd Control', 'VIP Protection', 'Emergency Response'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 678-9012',
      email: 'security@secureguard.com',
      website: 'https://secureguard.com',
      verified: true,
      featured: false,
    },
    {
      id: 7,
      name: 'Swift Transportation',
      category: 'transportation',
      location: 'dallas',
      rating: 4.4,
      reviews: 145,
      priceRange: 'budget',
      description: 'Reliable transportation services for guests and event logistics.',
      services: ['Shuttle Services', 'VIP Transport', 'Airport Transfers', 'Group Transportation'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 789-0123',
      email: 'info@swifttransport.com',
      website: 'https://swifttransport.com',
      verified: false,
      featured: false,
    },
    {
      id: 8,
      name: 'Venue Solutions Plus',
      category: 'venue',
      location: 'seattle',
      rating: 4.6,
      reviews: 167,
      priceRange: 'premium',
      description: 'Full-service venue management and event planning services.',
      services: ['Venue Management', 'Event Planning', 'Staffing Solutions', 'Consulting'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 890-1234',
      email: 'info@venuesolutions.com',
      website: 'https://venuesolutions.com',
      verified: true,
      featured: false,
    },
    {
      id: 9,
      name: 'Event Marketing Pro',
      category: 'marketing',
      location: 'san-francisco',
      rating: 4.3,
      reviews: 64,
      priceRange: 'premium',
      description: 'Digital marketing and promotion services for events of all sizes.',
      services: ['Social Media Marketing', 'Email Campaigns', 'SEO Services', 'Content Creation'],
      image: '/api/placeholder/400/300',
      phone: '+1 (555) 901-2345',
      email: 'hello@eventmarketingpro.com',
      website: 'https://eventmarketingpro.com',
      verified: true,
      featured: false,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVendors(mockVendors);
      setFilteredVendors(mockVendors);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    getUserLocation();
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setIsLocating(false);
        setLocationError(null);
        
        // Filter vendors by distance after getting location
        filterVendorsByDistance(location);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(error.message);
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Add coordinates to vendor data (for demo purposes)
  const vendorsWithCoordinates = vendors.map(vendor => {
    const locationData = {
      'san-francisco': { lat: 37.7749, lng: -122.4194 },
      'new-york': { lat: 40.7128, lng: -74.0060 },
      'los-angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'miami': { lat: 25.7617, lng: -80.1918 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'dallas': { lat: 32.7767, lng: -96.7970 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
    };
    
    const coords = locationData[vendor.location] || { lat: 0, lng: 0 };
    return {
      ...vendor,
      coordinates: coords,
    };
  });

  // Filter vendors by distance from user location
  const filterVendorsByDistance = (userCoords) => {
    const vendorsWithDistance = vendorsWithCoordinates.map(vendor => {
      const distance = calculateDistance(
        userCoords.lat,
        userCoords.lng,
        vendor.coordinates.lat,
        vendor.coordinates.lng
      );
      return {
        ...vendor,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      };
    });

    // Filter by search radius
    const nearbyVendors = vendorsWithDistance.filter(vendor => 
      vendor.distance <= searchRadius
    );

    // Sort by distance
    nearbyVendors.sort((a, b) => a.distance - b.distance);

    setFilteredVendors(nearbyVendors);
  };

  useEffect(() => {
    let filtered = vendorsWithCoordinates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(vendor => vendor.location === selectedLocation);
    }

    // Filter by rating
    if (selectedRating !== 'all') {
      filtered = filtered.filter(vendor => vendor.rating >= parseFloat(selectedRating));
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const range = priceRanges.find(r => r.id === priceRange);
      if (range) {
        filtered = filtered.filter(vendor => {
          // This is a simplified price filtering logic
          return vendor.priceRange === priceRange;
        });
      }
    }

    // If user location is available, filter by distance and sort
    if (userLocation) {
      filtered = filtered.map(vendor => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          vendor.coordinates.lat,
          vendor.coordinates.lng
        );
        return {
          ...vendor,
          distance: Math.round(distance * 10) / 10,
        };
      });

      // Filter by search radius
      filtered = filtered.filter(vendor => vendor.distance <= searchRadius);

      // Sort by selected criteria
      switch (sortBy) {
        case 'distance':
          filtered.sort((a, b) => a.distance - b.distance);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'price':
          // Simple price sorting based on price range
          const priceOrder = { 'budget': 1, 'mid-range': 2, 'premium': 3 };
          filtered.sort((a, b) => priceOrder[a.priceRange] - priceOrder[b.priceRange]);
          break;
        default:
          filtered.sort((a, b) => a.distance - b.distance);
      }
    }

    setFilteredVendors(filtered);
  }, [searchTerm, selectedCategory, selectedLocation, selectedRating, priceRange, userLocation, searchRadius, sortBy, vendorsWithCoordinates]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // ... rest of the code remains the same ...
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handleRatingChange = (event) => {
    setSelectedRating(event.target.value);
  };

  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const vendorsPerPage = 9;
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);
  const startIndex = (currentPage - 1) * vendorsPerPage;
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + vendorsPerPage);

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : <Business />;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              fontWeight={800}
              gutterBottom
              sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
            >
              Vendor Locator
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Find the perfect vendors and service providers for your events. 
              Search our comprehensive database of trusted professionals.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9),
                  },
                }}
                href="#search-filters"
              >
                Browse Vendors
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#ffffff', 0.1),
                  },
                }}
                href="/vendor/register"
              >
                List Your Business
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Search and Filters */}
      <Box id="search-filters" sx={{ py: 6, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search vendors, services, or locations..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {/* Location Search */}
                <Button
                  variant="outlined"
                  startIcon={isLocating ? <CircularProgress size={16} /> : <MyLocation />}
                  onClick={getUserLocation}
                  disabled={isLocating}
                  sx={{ mr: 1 }}
                >
                  {isLocating ? 'Getting Location...' : 'Use My Location'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                  sx={{ mr: 1 }}
                >
                  {viewMode === 'grid' ? 'Map View' : 'Grid View'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Business />}
                  href="/vendor/register"
                >
                  Become a Vendor
                </Button>
              </Box>
            </Grid>

            {/* Location-based Search Options */}
            {userLocation && (
              <Grid item xs={12}>
                <Grid container spacing={2} sx={{ mt: 0, mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: theme => alpha(theme.palette.info.main, 0.1), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                      Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Showing vendors within {searchRadius} miles
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Search Radius</InputLabel>
                    <Select
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      label="Search Radius"
                    >
                      <MenuItem value={5}>5 miles</MenuItem>
                      <MenuItem value={10}>10 miles</MenuItem>
                      <MenuItem value={25}>25 miles</MenuItem>
                      <MenuItem value={50}>50 miles</MenuItem>
                      <MenuItem value={100}>100 miles</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="distance">Distance</MenuItem>
                      <MenuItem value="rating">Rating</MenuItem>
                      <MenuItem value="price">Price Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            )}

            {/* Location Error */}
            {locationError && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mt: 0 }}>
                  <Typography variant="body2">
                    <strong>Location Error:</strong> {locationError}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Please enable location access in your browser settings to find nearby vendors.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Filter Options */}
            <Grid item xs={12}>
              <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {category.icon}
                          <Typography sx={{ ml: 1 }}>{category.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    label="Location"
                  >
                    <MenuItem value="all">All Locations</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}, {location.state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Min Rating</InputLabel>
                  <Select
                    value={selectedRating}
                    onChange={handleRatingChange}
                    label="Minimum Rating"
                  >
                    <MenuItem value="all">All Ratings</MenuItem>
                    <MenuItem value="4.5">4.5+ Stars</MenuItem>
                    <MenuItem value="4.0">4.0+ Stars</MenuItem>
                    <MenuItem value="3.5">3.5+ Stars</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Price Range</InputLabel>
                  <Select
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    label="Price Range"
                  >
                    <MenuItem value="all">All Prices</MenuItem>
                    {priceRanges.map((range) => (
                      <MenuItem key={range.id} value={range.id}>
                        {range.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Results Count */}
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedVendors.length} of {filteredVendors.length} vendors
          {userLocation && (
            <span> within {searchRadius} miles of your location</span>
          )}
        </Typography>
      </Container>

      {/* Vendor Results */}
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {paginatedVendors.map((vendor, index) => (
            <Grid item xs={12} sm={6} md={4} key={vendor.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    {/* Vendor Image */}
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {vendor.featured && (
                        <Chip
                          label="Featured"
                          size="small"
                          color="warning"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {vendor.verified && (
                        <Chip
                          label="Verified"
                          size="small"
                          color="success"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>

                    {/* Vendor Info */}
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mr: 1 }}>
                          {vendor.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getCategoryIcon(vendor.category)}
                          <Chip
                            label={vendor.priceRange}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                          {vendor.distance !== undefined && (
                            <Chip
                              label={`${vendor.distance} miles`}
                              size="small"
                              color="info"
                              variant="filled"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={vendor.rating}
                          precision={0.1}
                          size="small"
                          readOnly
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({vendor.reviews} reviews)
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {vendor.description}
                      </Typography>

                      {/* Services */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Services:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {vendor.services.map((service, serviceIndex) => (
                            <Chip
                              key={serviceIndex}
                              label={service}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Contact Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            href={`tel:${vendor.phone}`}
                          >
                            <Phone />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            href={`mailto:${vendor.email}`}
                          >
                            <Email />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            href={vendor.website}
                            target="_blank"
                          >
                            <Public />
                          </IconButton>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<NavigateNext />}
                          href={`/vendors/${vendor.id}`}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default VendorLocatorPage;
