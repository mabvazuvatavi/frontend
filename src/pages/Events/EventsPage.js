import React, { useState, useEffect, useMemo } from 'react';
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
  Fab,
  IconButton,
  Tabs,
  Tab,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Person,
  Add,
  Search,
  ArrowForward,
  CalendarMonth,
  FavoriteBorder,
  Favorite,
  Share,
  PlayArrow,
  TrendingUp,
  Star,
  FilterList,
  GridView,
  ViewList,
  Close,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { apiRequest, API_BASE_URL, hasRole } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    event_type: '',
    sort_by: 'start_date',
    sort_order: 'desc',
  });

  const categories = [
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'sports_soccer', label: 'Soccer', icon: '⚽' },
    { id: 'sports_cricket', label: 'Cricket', icon: '🏏' },
    { id: 'sports_other', label: 'Sports', icon: '🏆' },
    { id: 'arts', label: 'Arts', icon: '🎨' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { id: 'other', label: 'Other', icon: '✨' },
  ];

  const eventTypes = [
    { id: 'concert', label: 'Concert' },
    { id: 'sports', label: 'Sports' },
    { id: 'theater', label: 'Theater' },
    { id: 'conference', label: 'Conference' },
    { id: 'festival', label: 'Festival' },
    { id: 'exhibition', label: 'Exhibition' },
    { id: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  // Fetch featured events separately
  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const url = `${API_BASE_URL}/events?${queryParams}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events`);
      }

      const data = await response.json();
      
      const now = new Date();
      const rawEvents = Array.isArray(data.data)
        ? data.data
        : (Array.isArray(data.data?.events) ? data.data.events : []);

      const filteredEvents = Array.isArray(rawEvents)
        ? rawEvents.filter(e => {
            const eventEnd = e.end_date ? new Date(e.end_date) : new Date(e.start_date);
            return eventEnd >= now;
          })
        : [];
      
      setEvents(filteredEvents);
      const meta = data.pagination || data.data?.pagination;
      setPagination(meta || {
        page: 1,
        limit: 12,
        total: filteredEvents.length,
        pages: 1,
      });
    } catch (err) {
      console.error('Fetch events error:', err);
      setError(`Error loading events: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedEvents = async () => {
    try {
      const url = `${API_BASE_URL}/events?limit=6&sort_by=start_date&sort_order=asc`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const rawEvents = Array.isArray(data.data)
          ? data.data
          : (data.data?.events || []);

        const featured = (rawEvents || [])
          .filter(e => new Date(e.start_date) >= now)
          .slice(0, 4);
        setFeaturedEvents(featured);
      }
    } catch (err) {
      console.error('Failed to fetch featured events');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const toggleFavorite = (eventId) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  };

  const getCountdown = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diff = eventDate - now;
    
    if (diff < 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Starting soon';
  };

  // Modern Event Card Component
  const EventCard = ({ event, index = 0 }) => {
    const dateInfo = formatDate(event.start_date);
    const countdown = getCountdown(event.start_date);
    const isFavorite = favorites.includes(event.id);

    return (
      <Grow in={true} timeout={300 + index * 100}>
        <Card
          onClick={() => navigate(`/events/${event.id}`)}
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
              '& .event-image': {
                transform: 'scale(1.1)',
              },
              '& .event-overlay': {
                opacity: 0.7,
              },
            },
          }}
        >
          {/* Image Section */}
          <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            <Box
              className="event-image"
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: event.event_image_url 
                  ? `url(${event.event_image_url})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.6s ease',
              }}
            />
            <Box
              className="event-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                transition: 'opacity 0.3s ease',
              }}
            />
            
            {/* Date Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'white',
                borderRadius: '12px',
                p: 1,
                minWidth: 56,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', color: '#ff0080', fontWeight: 700, textTransform: 'uppercase' }}>
                {dateInfo.month}
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
                {dateInfo.day}
              </Typography>
            </Box>

            {/* Favorite Button */}
            <IconButton
              onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
              }}
            >
              {isFavorite ? <Favorite sx={{ color: '#ff0080' }} /> : <FavoriteBorder />}
            </IconButton>

            {/* Countdown Badge */}
            {countdown && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  bgcolor: 'rgba(255,0,128,0.95)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <AccessTime sx={{ fontSize: 14 }} />
                {countdown}
              </Box>
            )}

            {/* Price Badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'white',
                color: '#1a1a2e',
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              KES {event.base_price?.toLocaleString() || 'Free'}
            </Box>
          </Box>

          {/* Content Section */}
          <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
            {/* Category Chip */}
            <Chip
              label={event.event_type?.replace('_', ' ')}
              size="small"
              sx={{
                alignSelf: 'flex-start',
                mb: 1.5,
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: '8px',
              }}
            />

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 1,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {event.title}
            </Typography>

            {/* Event Info */}
            <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 16, color: '#667eea' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {dateInfo.full} • {dateInfo.time}
                </Typography>
              </Box>
              
              {event.venue_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: '#ff0080' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {event.venue_name}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {event.available_tickets || 0} tickets available
                </Typography>
              </Box>
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              Get Tickets
            </Button>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  // Featured Event Card (Larger)
  const FeaturedEventCard = ({ event }) => {
    const dateInfo = formatDate(event.start_date);
    
    return (
      <Card
        onClick={() => navigate(`/events/${event.id}`)}
        sx={{
          height: '100%',
          minHeight: 400,
          borderRadius: '24px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            '& .featured-image': { transform: 'scale(1.05)' },
            '& .featured-content': { transform: 'translateY(-8px)' },
          },
        }}
      >
        <Box
          className="featured-image"
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: event.event_image_url 
              ? `url(${event.event_image_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.6s ease',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }}
        />
        
        {/* Featured Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            bgcolor: '#ff0080',
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
          <Star sx={{ fontSize: 16 }} />
          Featured
        </Box>

        <Box
          className="featured-content"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            transition: 'transform 0.3s ease',
          }}
        >
          <Chip
            label={event.event_type?.replace('_', ' ')}
            size="small"
            sx={{
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          />
          
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {event.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth sx={{ color: '#ff0080' }} />
              <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                {dateInfo.full}
              </Typography>
            </Box>
            {event.venue_name && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#ff0080' }} />
                <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                  {event.venue_name}
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              mt: 2,
              bgcolor: '#ff0080',
              borderRadius: '12px',
              px: 3,
              py: 1,
              fontWeight: 700,
              '&:hover': { bgcolor: '#e00070' },
            }}
          >
            Get Tickets - KES {event.base_price?.toLocaleString() || 'Free'}
          </Button>
        </Box>
      </Card>
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
              <Skeleton variant="rounded" width={80} height={24} sx={{ mb: 2, borderRadius: '8px' }} />
              <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 0.5 }} />
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
          minHeight: { xs: 500, md: 600 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3)',
          },
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 50%, rgba(255, 0, 128, 0.3) 100%)',
            zIndex: 1,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Chip
                    icon={<TrendingUp />}
                    label="Discover Amazing Events"
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
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      lineHeight: 1.1,
                      mb: 3,
                      textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    Find Your Next
                    <Box component="span" sx={{ color: '#ff0080', display: 'block' }}>
                      Unforgettable Experience
                    </Box>
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.85)',
                      mb: 4,
                      maxWidth: 500,
                      fontWeight: 400,
                    }}
                  >
                    Explore concerts, sports, conferences, and more. Book tickets for the best events in Kenya.
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
                      placeholder="Search events, artists, venues..."
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
                      onClick={() => fetchEvents()}
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
                      Search Events
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
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
              Categories:
            </Typography>
            <Chip
              label="All Events"
              onClick={() => handleFilterChange('category', '')}
              sx={{
                bgcolor: !filters.category ? '#667eea' : 'grey.100',
                color: !filters.category ? 'white' : 'grey.700',
                fontWeight: 600,
                '&:hover': { bgcolor: !filters.category ? '#5a6fd6' : 'grey.200' },
              }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={`${cat.icon} ${cat.label}`}
                onClick={() => handleFilterChange('category', cat.id)}
                sx={{
                  bgcolor: filters.category === cat.id ? '#667eea' : 'grey.100',
                  color: filters.category === cat.id ? 'white' : 'grey.700',
                  fontWeight: 600,
                  '&:hover': { bgcolor: filters.category === cat.id ? '#5a6fd6' : 'grey.200' },
                }}
              />
            ))}
          </Box>
        </Card>
      </Container>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>
                Featured Events
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Don't miss out on these amazing upcoming events
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowForward />}
              sx={{ color: '#667eea', fontWeight: 600 }}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {featuredEvents.slice(0, 2).map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <FeaturedEventCard event={event} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* All Events Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>
              All Events
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {pagination?.total || 0} events available
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setViewMode('grid')}
              sx={{
                bgcolor: viewMode === 'grid' ? '#667eea' : 'grey.100',
                color: viewMode === 'grid' ? 'white' : 'grey.600',
                '&:hover': { bgcolor: viewMode === 'grid' ? '#5a6fd6' : 'grey.200' },
              }}
            >
              <GridView />
            </IconButton>
            <IconButton
              onClick={() => setViewMode('list')}
              sx={{
                bgcolor: viewMode === 'list' ? '#667eea' : 'grey.100',
                color: viewMode === 'list' ? 'white' : 'grey.600',
                '&:hover': { bgcolor: viewMode === 'list' ? '#5a6fd6' : 'grey.200' },
              }}
            >
              <ViewList />
            </IconButton>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4, borderRadius: '16px' }}
            action={
              <Button color="inherit" size="small" onClick={() => fetchEvents()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Events Grid */}
        {loading ? (
          <LoadingSkeleton />
        ) : events.length === 0 ? (
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
              <Event sx={{ fontSize: 60, color: 'grey.400' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              No events found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              We couldn't find any events matching your criteria. Try adjusting your filters or check back later.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setFilters({
                page: 1,
                limit: 12,
                search: '',
                category: '',
                event_type: '',
                sort_by: 'start_date',
                sort_order: 'desc',
              })}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {events.map((event, index) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} index={index} />
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                      color: 'white',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Create Event FAB for Organizers */}
      {hasRole(['organizer', 'admin']) && (
        <Fab
          component={RouterLink}
          to="/events/create"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #ff0080 0%, #7928ca 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(255, 0, 128, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e00070 0%, #6a1fb8 100%)',
              transform: 'scale(1.1)',
            },
          }}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>
      )}
    </Box>
  );
};

export default EventsPage;
