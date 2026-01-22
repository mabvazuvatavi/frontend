import { Box, Container, Typography, Grid, Skeleton, Button, Paper, Chip, Divider, alpha, InputBase, Card } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { EventCard } from "../components/EventCard"
import { BusCard } from "../components/BusCard"
import { FlightCard } from "../components/FlightCard"
import { StayCard } from "../components/StayCard"
import { ArrowForward, Search, CalendarMonth, ConfirmationNumber, Security, Support, TrendingUp } from "@mui/icons-material"

const HomePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [buses, setBuses] = useState([])
  const [flights, setFlights] = useState([])
  const [stays, setStays] = useState([])

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001/api"

  // Ensure data is always an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.data)) return data.data
    if (data && Array.isArray(data.events)) return data.events
    return []
  }

  // Normalize event data to match expected format
  const normalizeEvent = (event) => {
    // Build location from venue_name and venue_city
    const locationParts = [event.venue_name, event.venue_city].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : (event.address || 'Location TBA');
    
    // Format price as KES currency
    const priceValue = Number(event.base_price) || 0;
    const price = priceValue > 0 ? `KES ${priceValue.toLocaleString()}` : 'Free';
    
    return {
      id: event.id,
      title: event.title,
      start_date: event.start_date ? new Date(event.start_date) : new Date(),
      location,
      venue_name: event.venue_name || '',
      image: event.event_image_url || 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      base_price: priceValue,
      price,
      available_tickets: event.available_tickets || 0,
      category: event.category || 'Other'
    }
  }

  // Mock data for testing
  const mockEvents = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Safari Sound Festival 2026',
      start_date: new Date(Date.now() + 30*24*60*60*1000),
      location: 'Mombasa Beach Arena',
      image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      base_price: 2500,
      price: 'KES 2,500',
      available_tickets: 500,
      category: 'Concerts'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Nairobi Tech Summit 2026',
      start_date: new Date(Date.now() + 20*24*60*60*1000),
      location: 'KICC - Nairobi',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      base_price: 8500,
      price: 'KES 8,500',
      available_tickets: 200,
      category: 'Technology'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Kenya Fashion Week 2026',
      start_date: new Date(Date.now() + 45*24*60*60*1000),
      location: 'Sarit Centre - Nairobi',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      base_price: 3500,
      price: 'KES 3,500',
      available_tickets: 150,
      category: 'Fashion'
    }
  ]

  // Mock buses data
  const mockBuses = [
    {
      id: '00000000-0000-0000-0000-000000000101',
      operator: 'Express Lines',
      rating: 4.5,
      from: 'Nairobi',
      to: 'Mombasa',
      departure: '6:00 AM',
      duration: '8 hours',
      amenities: ['WiFi', 'Air Conditioning', 'Charging Ports', 'Refreshments'],
      price: 800,
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      operator: 'Comfort Plus',
      rating: 4.8,
      from: 'Nairobi',
      to: 'Kisumu',
      departure: '7:30 AM',
      duration: '7 hours',
      amenities: ['WiFi', 'Reclining Seats', 'Air Conditioning', 'Power Outlets', 'USB Ports'],
      price: 650,
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      operator: 'Safari Safaris',
      rating: 4.6,
      from: 'Nairobi',
      to: 'Nakuru',
      departure: '4:00 PM',
      duration: '3 hours',
      amenities: ['Air Conditioning', 'Spacious Legroom', 'Snacks Included'],
      price: 500,
      image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ]

  // Mock flights data
  const mockFlights = [
    {
      id: '00000000-0000-0000-0000-000000000201',
      airline: 'Kenya Airways',
      from: 'Nairobi (NBO)',
      to: 'Mombasa (MBA)',
      departure: '14:30',
      arrival: '16:15',
      duration: '2h 15m',
      class: 'Economy',
      aircraft: 'Boeing 787',
      rating: 4.8,
      gate: 'A15',
      seat: 'Select seat',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1531242413477-ab7ffe4419e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      airline: 'Precision Air',
      from: 'Nairobi (NBO)',
      to: 'Dar es Salaam (DAR)',
      departure: '11:00',
      arrival: '14:20',
      duration: '2h 45m',
      class: 'Business',
      aircraft: 'Airbus A320',
      rating: 4.6,
      gate: 'B22',
      seat: 'Select seat',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1531242413477-ab7ffe4419e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '00000000-0000-0000-0000-000000000203',
      airline: 'Jambojet',
      from: 'Nairobi (NBO)',
      to: 'Kisumu (KIS)',
      departure: '09:30',
      arrival: '10:45',
      duration: '1h 30m',
      class: 'Economy',
      aircraft: 'Bombardier Q400',
      rating: 4.4,
      gate: 'C08',
      seat: 'Select seat',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1531242413477-ab7ffe4419e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ]

  // Mock stays data
  const mockStays = [
    {
      id: '00000000-0000-0000-0000-000000000301',
      name: 'Coral Beach Resort',
      location: 'Mombasa Beach',
      rating: 4.5,
      price_per_night: 3500,
      amenities: ['Pool', 'Spa', 'Beach Access', 'Restaurant', 'Bar', 'WiFi', 'Air Conditioning', 'Room Service', 'Gym'],
      image: 'https://images.unsplash.com/photo-1571896619968-39cb9cc50f38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      name: 'Safari Lodge Nakuru',
      location: 'Lake Nakuru',
      rating: 4.8,
      price_per_night: 5000,
      amenities: ['Wildlife Viewing', 'Guided Tours', 'Restaurant', 'Bar', 'Fireplace', 'WiFi', 'Air Conditioning', 'Nature Trails'],
      image: 'https://images.unsplash.com/photo-1561964930-8b9bbb1b8f8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      name: 'Nairobi City Hotel',
      location: 'Nairobi Central',
      rating: 4.3,
      price_per_night: 2500,
      amenities: ['Restaurant', 'Bar', 'Gym', 'WiFi', 'Air Conditioning', 'Room Service', 'Concierge', 'Parking'],
      image: 'https://images.unsplash.com/photo-1631049307038-da0ec89d4d0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ]

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/events?limit=3`)
      const data = await response.json()
      const eventsArray = ensureArray(data)
      if (eventsArray.length > 0) {
        const normalizedEvents = eventsArray.map(normalizeEvent)
        setEvents(normalizedEvents)
      } else {
        setEvents(mockEvents)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents(mockEvents)
    }
  }

  // Fetch buses
  const fetchBuses = async () => {
    try {
      const response = await fetch(`${API_BASE}/buses?limit=3`)
      const data = await response.json()
      const busesArray = ensureArray(data)
      setBuses(busesArray.length > 0 ? busesArray : mockBuses)
    } catch (error) {
      console.error("Error fetching buses:", error)
      setBuses(mockBuses)
    }
  }

  // Fetch flights
  const fetchFlights = async () => {
    try {
      const response = await fetch(`${API_BASE}/flights?limit=3`)
      const data = await response.json()
      const flightsArray = ensureArray(data)
      setFlights(flightsArray.length > 0 ? flightsArray : mockFlights)
    } catch (error) {
      console.error("Error fetching flights:", error)
      setFlights(mockFlights)
    }
  }

  // Fetch hotels/stays
  const fetchStays = async () => {
    try {
      const response = await fetch(`${API_BASE}/hotels?limit=3`)
      const data = await response.json()
      const staysArray = ensureArray(data)
      setStays(staysArray.length > 0 ? staysArray : mockStays)
    } catch (error) {
      console.error("Error fetching hotels:", error)
      setStays(mockStays)
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      await Promise.all([fetchEvents(), fetchBuses(), fetchFlights(), fetchStays()])
      setLoading(false)
    }
    fetchAllData()
  }, [])

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '720px', md: '800px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          py: { xs: 6, md: 8 },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            filter: 'brightness(0.55) saturate(1.05) contrast(1.02)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(2,6,23,0.6) 0%, rgba(0,45,104,0.42) 55%, rgba(0,0,0,0.28) 100%)',
            zIndex: 1,
            pointerEvents: 'none'
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: { xs: 2, md: 3 } }}>
          {/* Main Hero Content */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                mb: 3,
                fontWeight: 900,
                textShadow: '0 6px 20px rgba(0,0,0,0.45)',
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Discover Kenya's Best{' '}
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #ff0080 0%, #ff4da6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}>
                Experiences
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: alpha('#fff', 0.95),
                maxWidth: 800,
                mx: 'auto',
                fontWeight: 500,
                lineHeight: 1.6,
                mb: 4,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              From unforgettable events to seamless travel - everything you need for your perfect Kenyan adventure, all in one place
            </Typography>

            {/* Hero CTAs */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate("/events")}
                sx={{ 
                  px: 5, 
                  py: 1.75, 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(255, 0, 128, 0.4)',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(255, 0, 128, 0.5)',
                  }
                }}
              >
                Explore Events
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/buses")}
                sx={{ 
                  px: 5, 
                  py: 1.75, 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
                  bgcolor: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: alpha('#ffffff', 0.15),
                    borderWidth: 2,
                  }
                }}
              >
                Book Travel
              </Button>
            </Box>
          </Box>

          {/* Services Cards in Hero */}
          <Paper
            elevation={0}
            sx={{
              maxWidth: 1000,
              mx: 'auto',
              p: 4,
              borderRadius: 4,
              bgcolor: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(2, 6, 23, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            }}
          >
            <Grid container spacing={3}>
              {[
                { emoji: '🎭', label: 'Events', count: '500+' },
                { emoji: '🚌', label: 'Bus Routes', count: '50+' },
                { emoji: '✈️', label: 'Flights', count: '30+' },
                { emoji: '🏨', label: 'Hotels', count: '200+' },
              ].map((service, index) => (
                <Grid item xs={6} sm={3} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2.5,
                      textDecoration: 'none',
                      bgcolor: alpha('#ffffff', 0.12),
                      borderRadius: 3,
                      boxShadow: '0 4px 15px rgba(2, 6, 23, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        bgcolor: alpha('#ffffff', 0.22),
                        boxShadow: '0 20px 40px rgba(255, 0, 128, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                        borderColor: alpha('#ff0080', 0.4),
                        backdropFilter: 'blur(15px)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '2.5rem', sm: '3rem' },
                        mb: 1,
                      }}
                    >
                      {service.emoji}
                    </Typography>
                    <Typography 
                      variant="h6"
                      fontWeight="700" 
                      color="white" 
                      sx={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        mb: 0.5,
                      }}
                    >
                      {service.count}
                    </Typography>
                    <Typography 
                      variant="body2"
                      color="white"
                      sx={{
                        opacity: 0.85,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {service.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>
      {/* Featured Events Section */}
      <Box sx={{ py: 6, bgcolor: "#ffffff" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              color="secondary"
              fontWeight="bold"
              letterSpacing={2}
            >
              DON'T MISS OUT
            </Typography>
            <Typography
              variant="h2"
              fontWeight="900"
              color="primary.main"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Featured Events
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 700, mx: "auto", mb: 3 }}
            >
              Discover the hottest events happening right now across Kenya
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {loading
              ? [1, 2, 3].map(i => (
                  <Grid item xs={12} md={4} key={i}>
                    <Skeleton variant="rectangular" height={480} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))
              : Array.isArray(events) && events.length > 0
                ? events.map(event => (
                    <Grid item xs={12} md={4} key={event.id}>
                      <EventCard
                        event={event}
                        onClick={() => navigate(`/events/${event.id}`)}
                      />
                    </Grid>
                  ))
                : mockEvents.map(event => (
                    <Grid item xs={12} md={4} key={event.id}>
                      <EventCard
                        event={event}
                        onClick={() => navigate(`/events/${event.id}`)}
                      />
                    </Grid>
                  ))}
          </Grid>

          {/* View All CTA */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/events")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                gap: 1
              }}
            >
              View All Events
              <ArrowForward />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Popular Buses Section */}
      <Box sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              TRAVEL IN COMFORT
            </Typography>
            <Typography
              variant="h3"
              fontWeight="900"
              color="primary.main"
              gutterBottom
            >
              Popular Bus Routes
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
            >
              Safe, comfortable, and affordable bus travel across Kenya
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {loading
              ? [1, 2, 3].map(i => (
                  <Grid item xs={12} md={4} key={i}>
                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))
              : Array.isArray(buses) && buses.length > 0
                ? buses.map(bus => (
                    <Grid item xs={12} md={4} key={bus.id}>
                      <BusCard bus={bus} />
                    </Grid>
                  ))
                : mockBuses.map(bus => (
                    <Grid item xs={12} md={4} key={bus.id}>
                      <BusCard bus={bus} />
                    </Grid>
                  ))}
          </Grid>

          {/* View All CTA */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/buses")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                gap: 1
              }}
            >
              View All Bus Routes
              <ArrowForward />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Popular Flights Section */}
      <Box sx={{ py: 6, bgcolor: "#ffffff" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              FLY IN STYLE
            </Typography>
            <Typography
              variant="h3"
              fontWeight="900"
              color="primary.main"
              gutterBottom
            >
              Popular Flight Routes
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
            >
              Fast, reliable, and convenient domestic flights
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {loading
              ? [1, 2, 3].map(i => (
                  <Grid item xs={12} md={4} key={i}>
                    <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))
              : Array.isArray(flights) && flights.length > 0
                ? flights.map(flight => (
                    <Grid item xs={12} md={4} key={flight.id}>
                      <FlightCard flight={flight} />
                    </Grid>
                  ))
                : mockFlights.map(flight => (
                    <Grid item xs={12} md={4} key={flight.id}>
                      <FlightCard flight={flight} />
                    </Grid>
                  ))}
          </Grid>

          {/* View All CTA */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/flights")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                gap: 1
              }}
            >
              View All Flights
              <ArrowForward />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Popular Stays Section */}
      <Box sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              RELAX & UNWIND
            </Typography>
            <Typography
              variant="h3"
              fontWeight="900"
              color="primary.main"
              gutterBottom
            >
              Popular Hotels & Resorts
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
            >
              Experience luxury and comfort at Kenya's finest accommodations
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {loading
              ? [1, 2, 3].map(i => (
                  <Grid item xs={12} md={4} key={i}>
                    <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))
              : Array.isArray(stays) && stays.length > 0
                ? stays.map(stay => (
                    <Grid item xs={12} md={4} key={stay.id}>
                      <StayCard stay={stay} onClick={() => navigate(`/hotels/${stay.code || stay.id}`)} />
                    </Grid>
                  ))
                : mockStays.map(stay => (
                    <Grid item xs={12} md={4} key={stay.id}>
                      <StayCard stay={stay} onClick={() => navigate(`/hotels/${stay.code || stay.id}`)} />
                    </Grid>
                  ))}
          </Grid>

          {/* View All CTA */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/hotels")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                gap: 1
              }}
            >
              View All Hotels
              <ArrowForward />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Promo Banner - Enhanced Glassmorphism */}
      <Box 
        sx={{ 
          py: 12, 
          position: 'relative', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #002d68 0%, #1e40af 50%, #002d68 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255, 0, 128, 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="FOR ORGANIZERS" 
                size="medium"
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  bgcolor: alpha("#ff0080", 0.95),
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '0.8rem',
                  px: 2,
                  py: 2.5,
                }} 
              />
              <Typography variant="h2" color="white" fontWeight="900" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 3 }}>
                Host Your Event With Us
              </Typography>
              <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), mb: 5, lineHeight: 1.8, fontSize: '1.15rem' }}>
                Join the fastest growing ticketing platform. Get access to real-time analytics, secure payments, and 24/7 support.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate("/organizer/register")}
                  sx={{ 
                    px: 5, 
                    py: 2, 
                    fontSize: '1.1rem', 
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(255, 0, 128, 0.4)',
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(255, 0, 128, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Start Selling
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/organizer/learn-more")}
                  sx={{
                    color: 'white',
                    borderColor: alpha('#ffffff', 0.4),
                    borderWidth: 2,
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    bgcolor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                      borderColor: alpha('#ffffff', 0.6), 
                      bgcolor: alpha('#ffffff', 0.15),
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  p: 5,
                  bgcolor: alpha('#ffffff', 0.1),
                  borderRadius: 4,
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 0, 128, 0.2) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: alpha('#ff0080', 0.2),
                          color: '#ff0080',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          border: '3px solid rgba(255, 0, 128, 0.3)',
                        }}
                      >
                        <CalendarMonth sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h2" fontWeight="900" color="white" gutterBottom>500+</Typography>
                      <Typography variant="body1" fontWeight="600" sx={{ color: alpha('#fff', 0.85) }}>Events Hosted</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: alpha('#ff0080', 0.2),
                          color: '#ff0080',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          border: '3px solid rgba(255, 0, 128, 0.3)',
                        }}
                      >
                        <ConfirmationNumber sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h2" fontWeight="900" color="white" gutterBottom>50k+</Typography>
                      <Typography variant="body1" fontWeight="600" sx={{ color: alpha('#fff', 0.85) }}>Tickets Sold</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: alpha('#ffffff', 0.15), my: 3 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="900" color="white" gutterBottom>Zero Setup Fees</Typography>
                      <Typography variant="h6" sx={{ color: alpha('#fff', 0.85) }}>Get started in minutes</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            bgcolor: alpha('#ffffff', 0.7),
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography variant="overline" color="secondary" fontWeight="bold" letterSpacing={2}>
            STAY UPDATED
          </Typography>
          <Typography variant="h3" fontWeight="900" gutterBottom color="primary.main" sx={{ mb: 2 }}>
            Never Miss an Event
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Subscribe to our newsletter for exclusive offers, early bird tickets, and the latest event news delivered straight to your inbox.
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 500,
              mx: 'auto',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <InputBase
              placeholder="Enter your email address"
              sx={{
                flex: 1,
                bgcolor: alpha('#ffffff', 0.6),
                backdropFilter: 'blur(10px)',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#000000', 0.1),
                fontSize: '1rem',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 3px rgba(0, 45, 104, 0.1)',
                  bgcolor: alpha('#ffffff', 0.9),
                  backdropFilter: 'blur(15px)',
                },
                transition: 'all 0.2s',
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 2, px: 4, fontWeight: 700, boxShadow: '0 4px 15px rgba(0, 45, 104, 0.2)' }}
            >
              Subscribe
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Features Section - Blue Glassmorphism */}
      <Box 
        sx={{ 
          py: 10,
          position: 'relative',
          background: 'linear-gradient(180deg, #001b3a 0%, #002d68 100%)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#ff0080', fontWeight: 700, letterSpacing: 2 }}>
              WHY CHOOSE US
            </Typography>
            <Typography variant="h3" fontWeight="900" color="white" gutterBottom>
              Built For Your Convenience
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { 
                icon: <Security />, 
                title: 'Secure Payments', 
                desc: 'Bank-level encryption and secure payment gateways',
                color: '#10b981'
              },
              { 
                icon: <CalendarMonth />, 
                title: 'Real-time Updates', 
                desc: 'Get instant notifications about your events',
                color: '#3b82f6'
              },
              { 
                icon: <Support />, 
                title: '24/7 Support', 
                desc: 'Our team is here to help you anytime',
                color: '#f59e0b'
              },
              { 
                icon: <TrendingUp />, 
                title: 'Best Prices', 
                desc: 'Competitive pricing with no hidden fees',
                color: '#ff0080'
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      bgcolor: alpha('#ffffff', 0.12),
                      borderColor: alpha(item.color, 0.3),
                      boxShadow: `0 12px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)`,
                      '& .feature-icon': {
                        bgcolor: item.color,
                        color: 'white',
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  <Box
                    className="feature-icon"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: alpha(item.color, 0.15),
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'all 0.3s ease',
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="700" color="white" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
