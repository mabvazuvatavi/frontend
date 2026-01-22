import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Avatar,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Person,
  ShoppingCart,
  Share,
  Favorite,
  FavoriteBorder,
  CalendarMonth,
  ConfirmationNumber,
  Groups,
  ArrowBack,
  PlayCircle,
  Schedule,
  Verified,
  Info,
  Add,
  Remove,
  FlashOn,
  CheckCircle,
  Close,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestCart } from '../../context/GuestCartContext';
import toast from 'react-hot-toast';
import SeatMapComponent from '../../components/VenueManager/SeatMapComponent';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, isAuthenticated, user } = useAuth();
  const { addToCart, cartCount } = useCart();
  const { createGuestCart, addToGuestCart, getGuestCart, guestCartId } = useGuestCart();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSeatInfo, setSelectedSeatInfo] = useState({});
  const [hasSeatMap, setHasSeatMap] = useState(false);
  const [loadingSeatMap, setLoadingSeatMap] = useState(false);
  const [seasonalTickets, setSeasonalTickets] = useState([]);
  const [loadingSeasonalTickets, setLoadingSeasonalTickets] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    ticket_type: 'standard',
    ticket_format: 'digital',
    quantity: 1,
    selected_seats: [],
  });

  
  const fetchEventDetails = async () => {
    try {
      // Validate event ID before making API call
      if (!id || id === '00000000-0000-0000-0000-000000000000' || id === '00000000-0000-0000-0000-000000000002') {
        setLoading(false);
        setError('Invalid event ID. Please navigate from the events list.');
        return;
      }

      setLoading(true);
      setError('');

      const data = await Promise.race([
        apiRequest(`${API_BASE_URL}/events/${id}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
      ]);
      
      if (!data || !data.success) {
        throw new Error('Event not found');
      }

      setEvent(data.data);

      if (data.data?.has_seating) {
        setLoadingSeatMap(true);
        try {
          const seatsData = await Promise.race([
            apiRequest(`${API_BASE_URL}/seats/event/${id}`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]);
          const seats = seatsData?.data?.seats;
          setHasSeatMap(Array.isArray(seats) && seats.length > 0);
        } catch (e) {
          setHasSeatMap(false);
        } finally {
          setLoadingSeatMap(false);
        }
      } else {
        setHasSeatMap(false);
      }

      if (Array.isArray(data.data?.pricing_tiers) && data.data.pricing_tiers.length > 0) {
        const colorByName = {
          standard: '#2196F3',
          premium: '#FFD700',
          vip: '#FF1493',
          economy: '#9E9E9E',
        };
        setPricingTiers(
          data.data.pricing_tiers.map((t) => {
            const tierName = String(t.tier_name || '').trim();
            const key = tierName.toLowerCase();
            return {
              id: t.id || tierName,
              name: tierName,
              color: colorByName[key] || '#764ba2',
              price: Number(t.base_price || 0),
              seats: Number(t.total_tickets || 0),
              section: t.description || '',
              total_tickets: Number(t.total_tickets || 0),
              available_tickets: Number(t.available_tickets ?? t.total_tickets ?? 0),
              venue_section_id: t.venue_section_id || null,
            };
          })
        );
      }

    } catch (err) {
      console.error('Fetch event details error:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonalTickets = async () => {
    try {
      // Validate event ID before making API call
      if (!id || id === '00000000-0000-0000-0000-000000000000' || id === '00000000-0000-0000-0000-000000000002') {
        console.log('Invalid event ID, skipping seasonal tickets fetch');
        setSeasonalTickets([]);
        return;
      }

      setLoadingSeasonalTickets(true);
      // Add a timeout so it doesn't hang forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const data = await apiRequest(`${API_BASE_URL}/seasonal-tickets?eventId=${id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (data && data.success) {
        const tickets = Array.isArray(data.data) ? data.data : [];
        setSeasonalTickets(tickets);
      }
    } catch (err) {
      // Silently fail - seasonal tickets are optional
      console.log('Fetch seasonal tickets skipped or timed out');
      setSeasonalTickets([]);
    } finally {
      setLoadingSeasonalTickets(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchSeasonalTickets();
    }
  }, [id]);

  // Refetch event details when page regains focus (after checkout)
  useEffect(() => {
    const handleFocus = () => {
      fetchEventDetails();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const getAvailableTicketTypeCount = (ticketType) => {
    if (!event?.ticket_quantities) return 'Available';
    
    const totalAvailable = event.ticket_quantities[ticketType] || 0;
    // Note: In a real app, you'd calculate sold count from the backend
    // For now, just show the total available from the event config
    
    if (totalAvailable === 0) return 'Sold Out';
    if (totalAvailable > 0) return `${totalAvailable} left`;
    return 'Available';
  };

  const handlePurchase = () => {
    setPurchaseDialog(true);
  };

  const handleAddToCart = () => {
    if (!event) return;

    const useSeatMap = Boolean(event?.has_seating && hasSeatMap);
    
    // Get the correct tier price for the selected ticket type
    const currentPricing = getPricingInfo();
    const tierPrice = currentPricing[purchaseData.ticket_type] || 0;

    // Ensure quantity matches selected seats if seating is required
    if (useSeatMap && selectedSeats.length > 0) {
      // Add one cart item per selected seat
      selectedSeats.forEach((seatId) => {
        const seatNumber = selectedSeatInfo?.[seatId] || null;
        addToCart(event, {
          ...purchaseData,
          tier_price: tierPrice,
          quantity: 1,
          seat_ids: [seatId],
          seat_numbers: seatNumber ? [seatNumber] : [],
          selected_seats: [seatId],
        });
      });
    } else {
      // No seating or no seats selected, use quantity
      addToCart(event, {
        ...purchaseData,
        tier_price: tierPrice,
        selected_seats: selectedSeats,
      });
    }
    setPurchaseDialog(false);
    navigate('/checkout');
  };

  const handleBuyAsGuest = async () => {
    if (!event) return;

    // Check if user is authenticated - if so, show login reminder
    if (isAuthenticated()) {
      setShowLoginReminder(true);
      return;
    }

    try {
      let cartId = guestCartId;

      // Create a new guest cart if one doesn't exist
      if (!cartId) {
        console.log('Creating guest cart...');
        try {
          cartId = await Promise.race([
            createGuestCart(apiRequest, API_BASE_URL),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Cart creation timeout')), 10000))
          ]);
          console.log('Guest cart created:', cartId);
        } catch (err) {
          throw new Error('Failed to create cart: ' + err.message);
        }
      }

      // Find the price for the selected ticket type
      let ticketPrice = 0;
      
      if (pricingTiers && pricingTiers.length > 0) {
        const selectedTier = pricingTiers.find(
          tier => tier.name?.toLowerCase() === purchaseData.ticket_type?.toLowerCase()
        );
        ticketPrice = selectedTier?.base_price || selectedTier?.price || 0;
        
        if (ticketPrice === 0) {
          const minPriced = pricingTiers.reduce((min, tier) => {
            const tierPrice = tier.base_price || tier.price || 0;
            const minTierPrice = min.base_price || min.price || 0;
            return (tierPrice && (!minTierPrice || tierPrice < minTierPrice)) ? tier : min;
          });
          ticketPrice = minPriced?.base_price || minPriced?.price || 0;
        }
      }
      
      console.log('DEBUG - final ticketPrice:', ticketPrice);

      // Add items to guest cart
      if (event?.has_seating && selectedSeats.length > 0) {
        for (const seatId of selectedSeats) {
          console.log('Adding item to cart for seat:', seatId);
          try {
            await Promise.race([
              addToGuestCart(
                cartId,
                event.id,
                1,
                purchaseData.ticket_type,
                ticketPrice,
                apiRequest,
                API_BASE_URL
              ),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Add to cart timeout')), 10000))
            ]);
          } catch (err) {
            console.error('Failed to add item:', err);
            throw new Error('Failed to add item to cart');
          }
        }
      } else {
        console.log('Adding item to cart with quantity:', purchaseData.quantity);
        try {
          await Promise.race([
            addToGuestCart(
              cartId,
              event.id,
              purchaseData.quantity,
              purchaseData.ticket_type,
              ticketPrice,
              apiRequest,
              API_BASE_URL
            ),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Add to cart timeout')), 10000))
          ]);
        } catch (err) {
          console.error('Failed to add item:', err);
          throw new Error('Failed to add item to cart');
        }
      }

      // Fetch the updated cart to ensure items are loaded
      try {
        console.log('Fetching updated guest cart');
        await getGuestCart(cartId, apiRequest, API_BASE_URL);
      } catch (err) {
        console.warn('Failed to fetch cart details, proceeding anyway:', err);
      }

      // Navigate to checkout
      console.log('Navigating to checkout');
      setPurchaseDialog(false);
      navigate('/checkout');
      toast.success('Added to guest cart!');
    } catch (err) {
      console.error('Guest checkout error:', err);
      toast.error('Failed to add to cart: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      concert: 'secondary',
      sports: 'primary',
      theater: 'warning',
      conference: 'info',
      festival: 'success',
      exhibition: 'error',
      bus_trip: 'default',
      flight: 'default',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getPricingInfo = () => {
    if (!Array.isArray(pricingTiers) || pricingTiers.length === 0) return {};

    const info = {};
    pricingTiers.forEach((t) => {
      const rawName = String(t?.name ?? t?.tier_name ?? '').trim();
      if (!rawName) return;
      const key = rawName.toLowerCase().replace(/\s+/g, '_');
      // Use base_price first (database column name), fallback to price
      info[key] = Number(t?.base_price ?? t?.price ?? 0);
    });
    return info;
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Box sx={{ height: 400, bgcolor: 'grey.200' }}>
          <Skeleton variant="rectangular" height={400} animation="wave" />
        </Box>
        <Container maxWidth="lg" sx={{ py: 4, mt: -8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: '24px', p: 3 }}>
                <Skeleton variant="rounded" width={100} height={32} sx={{ mb: 2, borderRadius: '16px' }} />
                <Skeleton variant="text" height={50} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={24} />
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: '24px', p: 3 }}>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={56} sx={{ borderRadius: '12px' }} />
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ p: 4, borderRadius: '24px', textAlign: 'center', maxWidth: 400 }}>
          <Event sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Event Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error || 'The event you are looking for does not exist or has been removed.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/events')}
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Back to Events
          </Button>
        </Card>
      </Box>
    );
  }

  const pricing = getPricingInfo();
  const eventDate = new Date(event.start_date);
  const tierTotalTickets = Array.isArray(pricingTiers)
    ? pricingTiers.reduce((sum, t) => sum + Number(t?.total_tickets ?? t?.seats ?? 0), 0)
    : 0;
  const tierAvailableTickets = Array.isArray(pricingTiers)
    ? pricingTiers.reduce((sum, t) => sum + Number(t?.available_tickets ?? t?.total_tickets ?? t?.seats ?? 0), 0)
    : 0;
    
  const ticketProgress = tierTotalTickets > 0 
    ? ((tierTotalTickets - tierAvailableTickets) / tierTotalTickets) * 100 
    : 0;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 350, md: 450 },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: event.event_image_url 
              ? `url(${event.event_image_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          }}
        />
        
        {/* Back Button */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: 3 }}>
          <IconButton
            onClick={() => navigate('/events')}
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Container>

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'flex-end', pb: 4 }}>
          <Fade in={true} timeout={800}>
            <Box sx={{ maxWidth: 700 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={event.event_type?.replace('_', ' ')}
                  sx={{
                    bgcolor: '#ff0080',
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                  }}
                />
                <Chip
                  label={event.category?.replace('_', ' ')}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </Box>
              
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  fontSize: { xs: '2rem', md: '3rem' },
                  lineHeight: 1.1,
                  mb: 2,
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {event.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: '#667eea',
                    border: '2px solid white',
                  }}
                >
                  {event.organizer_first_name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 600 }}>
                    {event.organizer_first_name} {event.organizer_last_name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    Event Organizer
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, mt: -6 }}>
        <Grid container spacing={4}>
          {/* Left Column - Event Details */}
          <Grid item xs={12} md={8}>

          {/* Event Details */}
          <Fade in timeout={600}>
            <Card sx={{ mb: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Info sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Event Details
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                      }}
                    >
                      <Box sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        bgcolor: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}>
                        <CalendarMonth sx={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Start Date & Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                          {formatDate(event.start_date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600 }}>
                          {formatTime(event.start_date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: 'rgba(118, 75, 162, 0.05)',
                        border: '1px solid rgba(118, 75, 162, 0.1)',
                      }}
                    >
                      <Box sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        bgcolor: '#764ba2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}>
                        <Schedule sx={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          End Date & Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                          {formatDate(event.end_date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#764ba2', fontWeight: 600 }}>
                          {formatTime(event.end_date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {event.venue_name && (
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          p: 2,
                          borderRadius: '16px',
                          bgcolor: 'rgba(255, 0, 128, 0.05)',
                          border: '1px solid rgba(255, 0, 128, 0.1)',
                        }}
                      >
                        <Box sx={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: '12px', 
                          bgcolor: '#ff0080',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}>
                          <LocationOn sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Venue
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                            {event.venue_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.venue_address}, {event.venue_city}, {event.venue_state}, {event.venue_country}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Fade>

          {/* Description */}
          {event.description && (
            <Fade in timeout={700}>
              <Card sx={{ mb: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #ff0080 0%, #ff8c00 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Event sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      About This Event
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.8 }}>
                    {event.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Terms and Conditions */}
          {event.terms_and_conditions && (
            <Fade in timeout={800}>
              <Card sx={{ mb: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', bgcolor: '#fafafa' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '12px', 
                      bgcolor: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Verified sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Terms & Conditions
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', lineHeight: 1.7 }}>
                    {event.terms_and_conditions}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          )}

          {/* Part of Season Passes */}
          {seasonalTickets.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Part of Season Passes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This event is included in the following season passes:
                </Typography>
                <Grid container spacing={2}>
                  {seasonalTickets.map((ticket) => (
                    <Grid item xs={12} key={ticket.id}>
                      <Card variant="outlined" sx={{ p: 2, '&:hover': { boxShadow: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {ticket.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {ticket.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Price
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  KES {parseFloat(ticket.season_price).toFixed(2)}
                                </Typography>
                              </Box>
                              {ticket.discount_percentage && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Discount
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {ticket.discount_percentage}% OFF
                                  </Typography>
                                </Box>
                              )}
                              {ticket.available_quantity !== undefined && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Remaining
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {ticket.available_quantity}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/seasonal-tickets/${ticket.id}/checkout`)}
                          disabled={ticket.available_quantity === 0}
                        >
                          {ticket.available_quantity === 0 ? 'Sold Out' : 'Get Season Pass'}
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
          </Grid>

        {/* Sidebar - Ticket Purchase Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              position: 'sticky', 
              top: 20,
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Ticket Card Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 3,
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ConfirmationNumber />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Get Tickets
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Secure your spot now
              </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Availability Progress */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tickets Available
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: ticketProgress > 80 ? '#f44336' : '#667eea' }}>
                    {tierAvailableTickets} left
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={ticketProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: ticketProgress > 80 
                        ? 'linear-gradient(90deg, #f44336, #ff5722)' 
                        : 'linear-gradient(90deg, #667eea, #764ba2)',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {Math.round(ticketProgress)}% sold • {tierTotalTickets} total capacity
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Available Ticket Types */}
              {Array.isArray(pricingTiers) && pricingTiers.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Available Ticket Types
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {pricingTiers.map((tier) => {
                      const availableCount = Number(tier?.available_tickets || tier?.total_tickets || 0);
                      const isSoldOut = availableCount === 0;
                      
                      return (
                        <Chip
                          key={tier.id}
                          label={`${tier.name} (${availableCount})`}
                          variant={isSoldOut ? 'outlined' : 'filled'}
                          color={isSoldOut ? 'default' : 'primary'}
                          size="small"
                          sx={{
                            opacity: isSoldOut ? 0.5 : 1,
                            textDecoration: isSoldOut ? 'line-through' : 'none'
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Pricing Tiers - Small Outlined Cards Inline */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Ticket Pricing
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'stretch' }}>
                  {Array.isArray(pricingTiers) && pricingTiers.length > 0 ? pricingTiers.map((tier, idx) => (
                    <Card 
                      key={tier.id}
                      sx={{ 
                        flex: '0 1 auto',
                        minWidth: '95px',
                        maxWidth: '110px',
                        display: 'flex',
                        flexDirection: 'column',
                        border: `1.5px solid ${tier.color}`,
                        borderRadius: 0.75,
                        transition: 'all 0.2s ease',
                        bgcolor: `${tier.color}05`,
                        '&:hover': {
                          boxShadow: `0 2px 8px ${tier.color}20`,
                          transform: 'translateY(-1px)',
                          bgcolor: `${tier.color}08`,
                        }
                      }}
                    >
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0.75, '&:last-child': { pb: 0.75 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: tier.color, textTransform: 'uppercase', fontSize: '0.6rem', mb: 0.2 }}>
                          {tier.name}
                        </Typography>
                        
                        {tier.section && (
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.65rem' }}>
                            {tier.section}
                          </Typography>
                        )}
                        
                        <Box sx={{ flex: 1 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.2, mt: 0.3 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: tier.color, lineHeight: 1 }}>
                            KES {Number(tier.base_price || tier.price || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                            /ticket
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )) : null}
                </Box>
              </Box>

              {/* Purchase Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handlePurchase}
                disabled={tierAvailableTickets === 0}
                sx={{ 
                  py: 2,
                  borderRadius: '16px',
                  background: tierAvailableTickets === 0 
                    ? 'grey.400' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {tierAvailableTickets === 0 ? 'Sold Out' : 'Get Tickets Now'}
              </Button>

              {/* Action Buttons Row */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <IconButton
                  onClick={() => setFavorite(!favorite)}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: favorite ? '#ff0080' : 'grey.300',
                    color: favorite ? '#ff0080' : 'grey.500',
                    '&:hover': { bgcolor: favorite ? 'rgba(255,0,128,0.1)' : 'grey.50' },
                  }}
                >
                  {favorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  sx={{ 
                    flex: 3,
                    borderRadius: '12px',
                    borderColor: 'grey.300',
                    color: 'grey.700',
                    '&:hover': { borderColor: '#667eea', color: '#667eea' },
                  }}
                  onClick={() => {
                    navigator.share?.({
                      title: event.title,
                      text: event.short_description,
                      url: window.location.href,
                    }) || navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  }}
                >
                  Share
                </Button>
              </Box>

              {/* Organizer Actions */}
              {user && (user.role === 'organizer' || user.role === 'admin') && event?.organizer_id === user?.id && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/events/${id}/edit`)}
                  >
                    Edit Event
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/events/${id}/check-in`)}
                  >
                    Check-In
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Login Reminder Modal */}
      <Dialog open={showLoginReminder} onClose={() => setShowLoginReminder(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
          Login Required
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are not currently logged in. To purchase tickets, please log in to your account first.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              If you don't have an account, you can create one on the login page.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Logging in allows you to:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">Save your billing information
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">Track your ticket orders
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">Manage your profile and preferences
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginReminder(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowLoginReminder(false);
              navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
            }}
            variant="contained"
            color="primary"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Quick Purchase Dialog */}
      <Dialog 
        open={purchaseDialog} 
        onClose={() => setPurchaseDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        {/* Header with gradient */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
        }}>
          <IconButton 
            onClick={() => setPurchaseDialog(false)}
            sx={{ position: 'absolute', right: 12, top: 12, color: 'white' }}
          >
            <Close />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FlashOn sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Quick Checkout
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {event?.title}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {/* Ticket Type Selection Cards */}
          {(!event?.has_seating || !hasSeatMap) && (
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                Select Ticket Type
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(Array.isArray(pricingTiers) ? pricingTiers : []).map((tier) => {
                  const rawName = String(tier?.name ?? '').trim();
                  const key = rawName.toLowerCase().replace(/\s+/g, '_');
                  const isSelected = purchaseData.ticket_type === key;
                  const tierPrice = Number(tier?.base_price ?? tier?.price ?? 0);
                  const available = Number(tier?.available_tickets ?? tier?.total_tickets ?? 0);
                  
                  return (
                    <Card
                      key={tier.id || key}
                      onClick={() => setPurchaseData(prev => ({ ...prev, ticket_type: key }))}
                      sx={{
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${tier.color || '#667eea'}` : '2px solid transparent',
                        bgcolor: isSelected ? `${tier.color || '#667eea'}08` : 'white',
                        borderRadius: '16px',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 4px 20px ${tier.color || '#667eea'}30` : '0 2px 8px rgba(0,0,0,0.06)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 24px ${tier.color || '#667eea'}25`,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              width: 44, 
                              height: 44, 
                              borderRadius: '12px',
                              bgcolor: tier.color || '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {isSelected ? (
                                <CheckCircle sx={{ color: 'white', fontSize: 24 }} />
                              ) : (
                                <ConfirmationNumber sx={{ color: 'white', fontSize: 22 }} />
                              )}
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                                {rawName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666' }}>
                                {available > 0 ? `${available.toLocaleString()} available` : 'Sold out'}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: tier.color || '#667eea' }}>
                            KES {tierPrice.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Quantity Selector - Modern Style */}
          {(!event?.has_seating || !hasSeatMap) && (
            <Box sx={{ px: 3, pb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                Quantity
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 3,
                p: 2,
                bgcolor: '#f1f5f9',
                borderRadius: '16px',
              }}>
                <IconButton 
                  onClick={() => setPurchaseData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                  disabled={purchaseData.quantity <= 1}
                  sx={{ 
                    bgcolor: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f8f8f8' },
                  }}
                >
                  <Remove />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 800, minWidth: 60, textAlign: 'center', color: '#1a1a2e' }}>
                  {purchaseData.quantity}
                </Typography>
                <IconButton 
                  onClick={() => setPurchaseData(prev => ({ ...prev, quantity: Math.min(10, prev.quantity + 1) }))}
                  disabled={purchaseData.quantity >= 10}
                  sx={{ 
                    bgcolor: 'white', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#f8f8f8' },
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Seat Selector for seated events */}
          {event?.has_seating && hasSeatMap && (
            <Box sx={{ p: 3 }}>
              <SeatMapComponent
                zones={Array.isArray(pricingTiers) ? pricingTiers : []}
                eventId={event?.id}
                apiRequest={apiRequest}
                API_BASE_URL={API_BASE_URL}
                onSeatsSelected={(seatData) => {
                  const ids = seatData.seat_ids || seatData.seats || [];
                  const nums = seatData.seat_numbers || [];
                  setSelectedSeats(ids);
                  const nextMap = {};
                  ids.forEach((id, idx) => {
                    nextMap[id] = nums[idx] || null;
                  });
                  setSelectedSeatInfo(nextMap);
                  if (seatData.ticketType) {
                    setPurchaseData(prev => ({ ...prev, ticket_type: seatData.ticketType }));
                  }
                }}
              />
            </Box>
          )}

          {/* Sticky Total & Checkout Section */}
          <Box sx={{ 
            p: 3, 
            pt: 2,
            background: 'linear-gradient(180deg, transparent 0%, #f8fafc 20%)',
            borderTop: '1px solid #e2e8f0',
          }}>
            {/* Order Summary */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              p: 2,
              bgcolor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                  KES {(((pricing?.[purchaseData.ticket_type] ?? 0) * (event?.has_seating && hasSeatMap ? selectedSeats.length : purchaseData.quantity))).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {event?.has_seating && hasSeatMap ? selectedSeats.length : purchaseData.quantity} ticket{(event?.has_seating && hasSeatMap ? selectedSeats.length : purchaseData.quantity) > 1 ? 's' : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {purchaseData.ticket_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isAuthenticated() ? (
                <>
                  <Button 
                    fullWidth
                    variant="outlined"
                    onClick={handleAddToCart}
                    disabled={event?.has_seating && hasSeatMap ? selectedSeats.length === 0 : purchaseData.quantity === 0}
                    startIcon={<ShoppingCart />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: '12px',
                      borderWidth: 2,
                      fontWeight: 700,
                      '&:hover': { borderWidth: 2 },
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    fullWidth
                    variant="contained"
                    onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                    disabled={event?.has_seating && hasSeatMap ? selectedSeats.length === 0 : purchaseData.quantity === 0}
                    startIcon={<FlashOn />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                      },
                    }}
                  >
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button 
                  fullWidth
                  variant="contained"
                  onClick={handleBuyAsGuest}
                  disabled={event?.has_seating && hasSeatMap ? selectedSeats.length === 0 : purchaseData.quantity === 0}
                  startIcon={<FlashOn />}
                  sx={{ 
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    },
                  }}
                >
                  Continue as Guest
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      </Container>
    </Box>
  );
};

export default EventDetailsPage;
