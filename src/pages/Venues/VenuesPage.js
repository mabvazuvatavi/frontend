import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
  Alert,
  IconButton,
  Fade,
  Grow,
  useTheme,
} from '@mui/material';
import {
  LocationOn,
  Business,
  Event,
  Search,
  Group,
  Add,
  ArrowForward,
  Star,
  Verified,
  CalendarMonth,
  GridView,
  ViewList,
  Place,
  MeetingRoom,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VenuesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, hasRole } = useAuth();

  const [venues, setVenues] = useState([]);
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    city: '',
    venue_type: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

  const venueTypes = [
    { id: 'stadium', label: 'Stadium', icon: '🏟️' },
    { id: 'theater', label: 'Theater', icon: '🎭' },
    { id: 'arena', label: 'Arena', icon: '🏛️' },
    { id: 'concert_hall', label: 'Concert Hall', icon: '🎵' },
    { id: 'sports_complex', label: 'Sports Complex', icon: '⚽' },
    { id: 'conference_center', label: 'Conference Center', icon: '💼' },
    { id: 'other', label: 'Other', icon: '✨' },
  ];

  useEffect(() => {
    fetchVenues();
  }, [filters]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const url = `${API_BASE_URL}/venues?${queryParams}`;
      console.log('Fetching venues from:', url);
      
      const data = await apiRequest(url);
      console.debug('Venues API response:', data);
      console.debug('Response type:', typeof data);
      console.debug('Response keys:', Object.keys(data || {}));
      
      if (!data.success) {
        console.error('API returned success=false:', data);
        throw new Error('Failed to fetch venues');
      }

      // Defensive: support multiple API response shapes
      let fetchedVenues = [];
      let fetchedPagination = null;

      if (Array.isArray(data?.data)) {
        // shape: { success: true, data: [venue, ...], pagination: {...} }
        fetchedVenues = data.data;
        fetchedPagination = data.pagination || null;
        console.debug('Venues shape: data.data (array) detected, count:', fetchedVenues.length);
      } else if (Array.isArray(data?.data?.venues)) {
        // legacy shape: { success: true, data: { venues: [...], pagination: {...} } }
        fetchedVenues = data.data.venues;
        fetchedPagination = data.data.pagination || null;
        console.debug('Venues shape: data.data.venues detected, count:', fetchedVenues.length);
      } else {
        // fallback empty
        console.debug('Venues shape: unknown, falling back to empty array');
        console.debug('data.data is:', data.data);
      }

      console.log('Setting venues state with', fetchedVenues.length, 'venues');
      setVenues(fetchedVenues);
      setPagination(fetchedPagination);
    } catch (err) {
      console.error('Fetch venues error:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVenues();
  };

  // Modern Venue Card Component
  const VenueCard = ({ venue, index = 0 }) => {
    return (
      <Grow in={true} timeout={300 + index * 100}>
        <Card
          onClick={() => navigate(`/venues/${venue.id}`)}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: 'pointer',
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'grey.100',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-12px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              '& .venue-image': {
                transform: 'scale(1.1)',
              },
            },
          }}
        >
          {/* Image Section */}
          <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            <Box
              className="venue-image"
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: venue.image_url 
                  ? `url(${venue.image_url})` 
                  : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.6s ease',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
              }}
            />
            
            {/* Venue Type Badge */}
            <Chip
              label={venue.venue_type?.replace('_', ' ')}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(255,255,255,0.95)',
                color: '#1a1a2e',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
              }}
            />

            {/* Capacity Badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'rgba(255,0,128,0.95)',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Group sx={{ fontSize: 16 }} />
              {venue.capacity?.toLocaleString() || 'N/A'}
            </Box>
          </Box>

          {/* Content Section */}
          <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 1,
                fontSize: '1.1rem',
                lineHeight: 1.3,
              }}
            >
              {venue.name}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: '0.85rem',
              }}
            >
              {venue.description || 'A premier venue for events and gatherings.'}
            </Typography>

            {/* Venue Info */}
            <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: '#ff0080' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {venue.city}, {venue.country}
                </Typography>
              </Box>
              
              {venue.upcoming_events?.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth sx={{ fontSize: 16, color: '#667eea' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {venue.upcoming_events.length} upcoming events
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Button */}
            <Button
              fullWidth
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                mt: 2,
                py: 1.2,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff0080 0%, #7928ca 100%)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              View Venue
            </Button>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
            <Skeleton variant="rectangular" height={200} animation="wave" />
            <CardContent>
              <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={44} sx={{ borderRadius: '12px' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 400, md: 500 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.25)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
            zIndex: 1,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ maxWidth: 700 }}>
              <Chip
                icon={<Verified />}
                label="Premium Venues"
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#ff0080' },
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  mb: 3,
                }}
              >
                Discover Amazing
                <Box component="span" sx={{ color: '#ff0080', display: 'block' }}>
                  Event Venues
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  mb: 4,
                  fontWeight: 400,
                }}
              >
                Find the perfect venue for your next event, from intimate theaters to massive stadiums.
              </Typography>

              {/* Search Bar */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  maxWidth: 600,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search venues, cities..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'grey.400' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      borderRadius: '16px',
                      '& fieldset': { border: 'none' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => fetchVenues()}
                  sx={{
                    bgcolor: '#ff0080',
                    borderRadius: '16px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#e00070' },
                  }}
                >
                  Search
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Category Filter Pills */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'grey.600' }}>
              Venue Types:
            </Typography>
            <Chip
              label="All Venues"
              onClick={() => handleFilterChange('venue_type', '')}
              sx={{
                bgcolor: !filters.venue_type ? '#1a1a2e' : 'grey.100',
                color: !filters.venue_type ? 'white' : 'grey.700',
                fontWeight: 600,
                '&:hover': { bgcolor: !filters.venue_type ? '#16213e' : 'grey.200' },
              }}
            />
            {venueTypes.map((type) => (
              <Chip
                key={type.id}
                label={`${type.icon} ${type.label}`}
                onClick={() => handleFilterChange('venue_type', type.id)}
                sx={{
                  bgcolor: filters.venue_type === type.id ? '#1a1a2e' : 'grey.100',
                  color: filters.venue_type === type.id ? 'white' : 'grey.700',
                  fontWeight: 600,
                  '&:hover': { bgcolor: filters.venue_type === type.id ? '#16213e' : 'grey.200' },
                }}
              />
            ))}
          </Box>
        </Card>
      </Container>

      {/* All Venues Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>
              All Venues
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {pagination?.total || venues.length} venues available
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setViewMode('grid')}
                sx={{
                  bgcolor: viewMode === 'grid' ? '#1a1a2e' : 'grey.100',
                  color: viewMode === 'grid' ? 'white' : 'grey.600',
                  '&:hover': { bgcolor: viewMode === 'grid' ? '#16213e' : 'grey.200' },
                }}
              >
                <GridView />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                sx={{
                  bgcolor: viewMode === 'list' ? '#1a1a2e' : 'grey.100',
                  color: viewMode === 'list' ? 'white' : 'grey.600',
                  '&:hover': { bgcolor: viewMode === 'list' ? '#16213e' : 'grey.200' },
                }}
              >
                <ViewList />
              </IconButton>
            </Box>
            
            {hasRole && hasRole(['organizer', 'admin', 'venue_manager']) && (
              <Button
                component={RouterLink}
                to="/venues/create"
                variant="contained"
                startIcon={<Add />}
                sx={{
                  background: 'linear-gradient(135deg, #ff0080 0%, #7928ca 100%)',
                  borderRadius: '12px',
                  px: 3,
                  fontWeight: 700,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e00070 0%, #6a1fb8 100%)',
                  },
                }}
              >
                Add Venue
              </Button>
            )}
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4, borderRadius: '16px' }}
            action={
              <Button color="inherit" size="small" onClick={() => fetchVenues()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Venues Grid */}
        {loading ? (
          <LoadingSkeleton />
        ) : venues.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Business sx={{ fontSize: 60, color: 'grey.400' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              No venues found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              We couldn't find any venues matching your criteria. Try adjusting your filters.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setFilters({
                page: 1,
                limit: 12,
                search: '',
                city: '',
                venue_type: '',
                sort_by: 'name',
                sort_order: 'asc',
              })}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.2,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {venues.map((venue, index) => (
                <Grid item xs={12} sm={6} md={4} key={venue.id}>
                  <VenueCard venue={venue} index={index} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(e, page) => handleFilterChange('page', page)}
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '12px',
                      fontWeight: 600,
                    },
                    '& .Mui-selected': {
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important',
                      color: 'white',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default VenuesPage;
