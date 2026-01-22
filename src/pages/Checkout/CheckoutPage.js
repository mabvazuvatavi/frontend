import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  Switch,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  CheckCircle,
  Event,
  LocationOn,
  AccessTime,
  CreditCard,
  Lock,
  Delete,
  EventSeat,
  FlashOn,
  Phone,
  Email,
  Person,
  Security,
  LocalOffer,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useGuestCart } from '../../context/GuestCartContext';
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';
import TicketPreview from '../../components/TicketTemplateBuilder/TicketPreview';
import GuestRegistrationModal from '../../components/Guest/GuestRegistrationModal';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, cartTotal, cartCount, clearCart, removeFromCart } = useCart();
  const { apiRequest, API_BASE_URL, isAuthenticated, user } = useAuth();
  const { guestCartId, guestCart, getGuestCart, removeFromGuestCart, completeGuestCheckout } = useGuestCart();
  const navigate = useNavigate();

  const isGuest = !isAuthenticated() && guestCartId;
  const isAuthenticatedUser = isAuthenticated();
  
  // Normalize guest cart items to use standard field names
  const normalizeGuestItem = (item) => ({
    ...item,
    id: item.id,
    event_id: item.event_id,
    item_type: item.item_type || 'event',
    item_ref_id: item.item_ref_id,
    item_title: item.item_title || item.title,
    event_title: item.event_title,
    event_date: item.event_date,
    venueName: item.venueName || item.venue_name || '',
    ticketType: item.ticket_type || 'Standard',
    ticketFormat: item.ticket_format || 'digital',
    quantity: item.quantity || 1,
    basePrice: Number(item.unit_price || 0),
    totalPrice: Number(item.total_price || 0),
    seatNumbers: item.seat_numbers || [],
    metadata: item.metadata,
  });

  // Use guest cart items if guest, otherwise use authenticated cart items
  const displayItems = isGuest && guestCart?.items 
    ? guestCart.items.map(normalizeGuestItem) 
    : cartItems;
  const displayTotal = isGuest && guestCart?.total_amount ? guestCart.total_amount : cartTotal;

  console.log('CheckoutPage render:', { isGuest, guestCartId, guestCart, displayItems: displayItems?.length });

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateData, setTemplateData] = useState({});
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestConfirmationCode, setGuestConfirmationCode] = useState('');

  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [payDeposit, setPayDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [payRemainingAmount, setPayRemainingAmount] = useState('');
  const [depositEligibility, setDepositEligibility] = useState({
    allowed: false,
    minDeposit: 0,
    depositType: 'percentage',
    depositValue: 30,
    eventsWithoutDeposit: []
  });

  // Checkout form data
  const [checkoutData, setCheckoutData] = useState({
    paymentMethod: 'stripe',
    kenyaGateway: 'mpesa',
    phoneNumber: '',
    nfcCardId: null,
    purchaseNFCCard: false,
    nfcCardType: 'nfc',
    billingAddress: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Kenya',
    },
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    },
  });

  const steps = ['Review Order', 'Payment Details', 'Confirmation'];

  // Track if we've already fetched the guest cart to avoid infinite loops
  const [guestCartFetched, setGuestCartFetched] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    // Allow both authenticated users and guest checkout
    if (!isAuthenticatedUser && !isGuest) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    // For authenticated users, check cart items
    if (isAuthenticatedUser && cartItems.length === 0) {
      navigate('/events');
      return;
    }

    // For guest users, fetch cart data only once
    if (isGuest && guestCartId && !guestCartFetched) {
      setGuestCartFetched(true);
      console.log('Fetching guest cart on checkout page:', guestCartId);
      getGuestCart(guestCartId, apiRequest, API_BASE_URL).catch(err => {
        console.error('Failed to load guest cart:', err);
        setError('Failed to load cart');
      });
    }
  }, [isAuthenticatedUser, isGuest, cartItems.length, guestCartId, guestCartFetched, navigate]);

  // Auto-load billing info from user profile for authenticated users
  useEffect(() => {
    if (isAuthenticatedUser && user && !profileLoaded) {
      setProfileLoaded(true);
      setCheckoutData(prevData => ({
        ...prevData,
        billingAddress: {
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          country: user.country || 'Kenya',
        },
      }));
    }
  }, [isAuthenticatedUser, user, profileLoaded]);

  // Fetch deposit eligibility for events in cart (skip for non-event items)
  useEffect(() => {
    const fetchDepositEligibility = async () => {
      if (!displayItems || displayItems.length === 0) return;

      try {
        // Filter to only event items and get unique event IDs
        const eventItems = displayItems.filter(item => {
          const itemType = item.item_type || 'event';
          return itemType === 'event' && (item.event_id || item.eventId);
        });
        
        // Skip if no event items in cart
        if (eventItems.length === 0) {
          setDepositEligibility({ allowed: false, minDeposit: 0 });
          return;
        }
        
        const eventIds = [...new Set(eventItems.map(item => item.event_id || item.eventId))].filter(Boolean);
        
        // Fetch events with deposit policies
        const eventsResponse = await apiRequest(`${API_BASE_URL}/events/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventIds })
        });
        
        if (eventsResponse.ok) {
          const { data: events } = await eventsResponse.json();
          
          // Check if all events allow deposits
          const eventsWithoutDeposit = events.filter(event => !event.allow_deposit);
          const allAllowDeposit = eventsWithoutDeposit.length === 0;
          
          // Calculate minimum deposit across all events
          let minDeposit = 0;
          let depositType = 'percentage';
          let depositValue = 30;
          
          if (allAllowDeposit) {
            for (const event of events) {
              const eventSubtotal = displayItems
                .filter(item => (item.event_id || item.eventId) === event.id)
                .reduce((sum, item) => sum + (item.totalPrice || item.basePrice * item.quantity), 0);
              
              let eventMinDeposit = 0;
              if (event.deposit_type === 'percentage') {
                eventMinDeposit = eventSubtotal * (event.deposit_value / 100);
              } else {
                eventMinDeposit = event.deposit_value;
              }
              
              eventMinDeposit = Math.max(eventMinDeposit, event.min_deposit_amount || 0);
              minDeposit += eventMinDeposit;
            }
            
            // Use the first event's deposit settings as default
            if (events.length > 0) {
              depositType = events[0].deposit_type;
              depositValue = events[0].deposit_value;
            }
          }
          
          setDepositEligibility({
            allowed: allAllowDeposit,
            minDeposit,
            depositType,
            depositValue,
            eventsWithoutDeposit: eventsWithoutDeposit.map(e => e.title)
          });
        }
      } catch (err) {
        console.error('Failed to fetch deposit eligibility:', err);
        // Default to not allowing deposits on error
        setDepositEligibility({
          allowed: false,
          minDeposit: 0,
          depositType: 'percentage',
          depositValue: 30,
          eventsWithoutDeposit: []
        });
      }
    };

    fetchDepositEligibility();
  }, [displayItems, apiRequest, API_BASE_URL]);

  // Fetch ticket templates for event items in cart (skip for non-event items)
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!displayItems || displayItems.length === 0) return;

      // Filter to only event items with template_id
      const eventItemsWithTemplates = displayItems.filter(item => {
        const itemType = item.item_type || 'event';
        return itemType === 'event' && item.template_id;
      });

      // Skip if no event items with templates
      if (eventItemsWithTemplates.length === 0) {
        setTemplatesLoading(false);
        return;
      }

      setTemplatesLoading(true);
      try {
        const templates = {};
        
        for (const item of eventItemsWithTemplates) {
          try {
            const response = await apiRequest(`${API_BASE_URL}/ticket-templates/${item.template_id}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok && result.success && result.data) {
              templates[item.event_id || item.eventId] = result.data;
            }
          } catch (err) {
            console.error(`Failed to fetch template for event ${item.event_id || item.eventId}:`, err);
          }
        }
        
        setTemplateData(templates);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [displayItems?.length]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate cart
      const validationErrors = validateCart();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }
    }

    if (activeStep === 1) {
      // Validate payment details
      const paymentErrors = validatePaymentDetails();
      if (paymentErrors.length > 0) {
        setError(paymentErrors.join(', '));
        return;
      }

      setError('');
      handlePayment();
      return;
    }

    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateCart = () => {
    const errors = [];
    // Add validation logic here
    return errors;
  };

  const effectiveTotal = Number(discountInfo?.finalTotal ?? displayTotal ?? 0);

  const syncCartToServer = async () => {
    await apiRequest(`${API_BASE_URL}/cart`, { method: 'DELETE' });

    for (const item of displayItems) {
      const eventId = item.event_id || item.eventId;
      const ticketType = item.ticket_type || item.ticketType;
      const quantity = item.quantity;
      const seatIds = item.seatIds || [];
      const seatNumbers = item.seatNumbers || [];

      const addPayload = {
        event_id: eventId,
        ticket_type: ticketType,
        quantity,
        price: item.basePrice,
        seat_ids: seatIds,
        seat_numbers: seatNumbers,
      };

      const addData = await apiRequest(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addPayload)
      });

      if (!addData.success) {
        throw new Error(addData.message || 'Failed to add item to server cart');
      }
    }
  };

  const applyDiscountCode = async () => {
    const code = (discountCode || '').trim();
    if (!code) {
      setError('Enter a discount code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await syncCartToServer();

      const data = await apiRequest(`${API_BASE_URL}/cart/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_code: code })
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to apply discount');
      }

      setDiscountInfo(data?.data || null);
      setDiscountCode(code.toUpperCase());
      toast.success('Discount applied');
    } catch (e) {
      setDiscountInfo(null);
      setError(e.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  const removeDiscountCode = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`${API_BASE_URL}/cart/discount`, { method: 'DELETE' });
      if (!data.success) {
        throw new Error(data.message || 'Failed to remove discount');
      }

      setDiscountInfo(null);
      setDiscountCode('');
      toast.success('Discount removed');
    } catch (e) {
      setError(e.message || 'Failed to remove discount');
    } finally {
      setLoading(false);
    }
  };

  const payRemainingBalance = async () => {
    if (!orderResult?.orderId) {
      setError('Missing orderId');
      return;
    }

    const balanceDue = Number(orderResult.balanceDue ?? 0);
    const amountToPay = Math.max(0, Math.min(Number(payRemainingAmount) || 0, balanceDue));

    if (amountToPay <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`${API_BASE_URL}/checkout/orders/${orderResult.orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_paid: amountToPay,
          payment_method: checkoutData.paymentMethod,
          gateway_response: {
            transaction_id: `txn_${Date.now()}`,
            status: 'approved',
            amount: amountToPay
          }
        })
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to apply payment');
      }

      setOrderResult(prev => ({
        ...(prev || {}),
        amountPaid: data?.data?.amountPaid,
        balanceDue: data?.data?.balanceDue,
        status: data?.data?.status
      }));
      toast.success('Payment recorded');
    } catch (e) {
      setError(e.message || 'Failed to apply payment');
    } finally {
      setLoading(false);
    }
  };

  const validatePaymentDetails = () => {
    const errors = [];
    const { paymentMethod, billingAddress, cardDetails } = checkoutData;

    if (!billingAddress.firstName || !billingAddress.lastName) {
      errors.push('Billing name is required');
    }

    if (!billingAddress.email) {
      errors.push('Email is required');
    }

    if (!billingAddress.phone) {
      errors.push('Phone number is required');
    }

    if (checkoutData.paymentMethod === 'kenya_gateway') {
      if (!checkoutData.phoneNumber) errors.push('Phone number is required for Kenya payment');
      // Validate Kenya phone format: +254 or 07xx followed by 8 digits
      const kenyaPhoneRegex = /^(\+254|0)[7][0-9]{8}$/;
      if (checkoutData.phoneNumber && !kenyaPhoneRegex.test(checkoutData.phoneNumber)) {
        errors.push('Invalid phone format. Use +254xxxxxxxxx or 07xxxxxxxx');
      }
    }

    if (checkoutData.paymentMethod !== 'cash' && checkoutData.paymentMethod !== 'kenya_gateway') {
      if (!cardDetails.cardNumber) errors.push('Card number is required');
      if (!cardDetails.expiryDate) errors.push('Expiry date is required');
      if (!cardDetails.cvv) errors.push('CVV is required');
      if (!cardDetails.cardholderName) errors.push('Cardholder name is required');
    }

    return errors;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Handle guest checkout
      if (isGuest) {
        // Validate billing information
        const { email, phone } = checkoutData.billingAddress;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }

        // Validate Kenya phone number (254 or 0 prefix)
        const phoneRegex = /^(?:\+254|0)[7][\d\s\-()]{7,}$/;
        if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
          throw new Error('Please enter a valid Kenya phone number (starting with +254 or 07)');
        }

        const response = await completeGuestCheckout(
          guestCartId,
          checkoutData.billingAddress,
          apiRequest,
          API_BASE_URL
        );

        if (response && response.email && response.confirmation_code) {
          setGuestEmail(response.email);
          setGuestConfirmationCode(response.confirmation_code);
        }

        setActiveStep(2); // Go to confirmation
        toast.success('Guest checkout completed successfully!');
        return;
      }

      // Handle authenticated checkout
      // If NFC card purchase is selected, purchase NFC card first
      if (checkoutData.paymentMethod === 'nfc' && checkoutData.purchaseNFCCard) {
        const nfcResponse = await apiRequest(`${API_BASE_URL}/nfc/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card_type: checkoutData.nfcCardType === 'both' ? 'nfc' : checkoutData.nfcCardType,
            initial_balance: displayTotal + 15, // Add card cost
          }),
        });

        const nfcData = await nfcResponse.json();

        if (!nfcResponse.ok) {
          throw new Error(nfcData.error || 'Failed to purchase NFC card');
        }

        setCheckoutData(prev => ({ ...prev, nfcCardId: nfcData.card.id }));
        toast.success(`${nfcData.card.card_type.toUpperCase()} card purchased successfully!`);
      }

      await syncCartToServer();

      if (discountCode && !discountInfo) {
        const dData = await apiRequest(`${API_BASE_URL}/cart/discount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ discount_code: discountCode })
        });
        if (!dData.success) {
          throw new Error(dData.message || 'Failed to apply discount');
        }
        setDiscountInfo(dData?.data || null);
      }

      const initiateData = await apiRequest(`${API_BASE_URL}/checkout/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: checkoutData.paymentMethod,
          billing_info: checkoutData.billingAddress
        })
      });

      if (!initiateData.success) {
        throw new Error(initiateData.message || 'Failed to initiate checkout');
      }

      const checkoutId = initiateData?.data?.checkoutId;
      if (!checkoutId) {
        throw new Error('Checkout initiation failed (missing checkoutId)');
      }

      const depositValueRaw = payDeposit ? depositAmount : '';
      const depositValue = payDeposit
        ? Math.max(0, Math.min(Number(depositValueRaw) || 0, Number(effectiveTotal) || 0))
        : 0;

      if (payDeposit && depositValue <= 0) {
        throw new Error('Deposit amount must be greater than 0');
      }

      // Validate minimum deposit if deposit is enabled
      if (payDeposit && depositEligibility.allowed && depositValue < depositEligibility.minDeposit) {
        throw new Error(`Minimum deposit of $${depositEligibility.minDeposit.toFixed(2)} is required`);
      }

      const amountToPayNow = payDeposit ? depositValue : Number(effectiveTotal) || 0;

      const completeData = await apiRequest(`${API_BASE_URL}/checkout/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkout_id: checkoutId,
          payment_method: checkoutData.paymentMethod,
          amount_paid: amountToPayNow,
          gateway_response: {
            transaction_id: `txn_${Date.now()}`,
            status: 'approved',
            amount: amountToPayNow
          }
        })
      });

      if (!completeData.success) {
        throw new Error(completeData.message || 'Checkout completion failed');
      }

      setOrderResult(completeData?.data || null);
      if (completeData?.data?.status === 'partially_paid') {
        setPayRemainingAmount(String(completeData?.data?.balanceDue ?? ''));
      }

      // Clear cart and go to confirmation step
      clearCart();
      toast.success(completeData?.data?.status === 'partially_paid' ? 'Deposit received! Tickets reserved.' : 'Purchase completed successfully!');
      setActiveStep(2); // Go to confirmation page instead of redirecting

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticatedUser && !isGuest) {
    return null;
  }

  // For guest users without items yet, show empty state or redirect
  if (!isAuthenticatedUser && isGuest && (!displayItems || displayItems.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          Your guest checkout session is active. Add items to your cart to continue.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/events')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Modern Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 4,
        mb: 4,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FlashOn sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {activeStep === 2 ? 'Order Complete!' : 'Quick Checkout'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isAuthenticatedUser 
                  ? `${displayItems?.length || 0} item${(displayItems?.length || 0) > 1 ? 's' : ''} • Secure checkout` 
                  : 'Guest Checkout • No account needed'}
              </Typography>
            </Box>
          </Box>
          
          {/* Progress Steps */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            {steps.map((label, index) => (
              <Box 
                key={label}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  opacity: index <= activeStep ? 1 : 0.5,
                }}
              >
                <Box sx={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  bgcolor: index < activeStep ? 'rgba(255,255,255,0.3)' : index === activeStep ? 'white' : 'rgba(255,255,255,0.15)',
                  color: index === activeStep ? '#667eea' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                  {index < activeStep ? <CheckCircle sx={{ fontSize: 18 }} /> : index + 1}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: index === activeStep ? 700 : 400, display: { xs: 'none', sm: 'block' } }}>
                  {label}
                </Typography>
                {index < steps.length - 1 && (
                  <Box sx={{ width: 40, height: 2, bgcolor: 'rgba(255,255,255,0.3)', mx: 1, display: { xs: 'none', md: 'block' } }} />
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ pb: 6 }}>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Review Your Order
            </Typography>

            {displayItems.map((item) => {
              // Detect item type - prioritize item_type column (Option 2 unified cart)
              const itemType = item.item_type || item.type || (item.eventId || item.event_id ? 'event' : item.busId ? 'bus' : item.flightId || item.flight_id ? 'flight' : item.hotelId || item.hotel_id ? 'hotel' : 'event');
              
              // Parse metadata if it's a string
              const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : (item.metadata || {});
              
              // Generic display values that work for all item types
              const getItemTitle = () => {
                // Use item_title first (unified cart), then fall back to type-specific fields
                if (item.item_title || item.title) return item.item_title || item.title;
                if (item.event_title || item.eventTitle) return item.event_title || item.eventTitle;
                if (itemType === 'flight') return metadata.airline ? `${metadata.airline} Flight` : 'Flight';
                if (itemType === 'bus') return item.busName || item.bus_name || 'Bus';
                if (itemType === 'hotel') return item.hotelName || item.hotel_name || 'Hotel';
                return 'Item';
              };
              const getItemSubtitle = () => {
                if (itemType === 'bus') return metadata.destination ? `To ${metadata.destination}` : (item.origin && item.destination ? `${item.origin} → ${item.destination}` : '');
                if (itemType === 'flight') {
                  const dep = metadata.departure?.airport || metadata.departure?.city || '';
                  const arr = metadata.arrival?.airport || metadata.arrival?.city || '';
                  return dep && arr ? `${dep} → ${arr}` : '';
                }
                if (itemType === 'hotel') return metadata.location || item.hotelName || 'Hotel';
                return item.venueName || item.venue_name || '';
              };
              const getItemDate = () => {
                if (itemType === 'flight' && metadata.departure?.time) {
                  return metadata.departure.time;
                }
                if (itemType === 'bus' && metadata.departure_time) {
                  return metadata.departure_time;
                }
                if (itemType === 'hotel' && metadata.checkIn) {
                  return metadata.checkIn;
                }
                return item.event_date || item.eventDate || item.departureTime || item.departure_time || item.checkInDate || item.departureDate;
              };
              const getItemIcon = () => {
                if (itemType === 'bus') return '🚌';
                if (itemType === 'flight') return '✈️';
                if (itemType === 'hotel') return '🏨';
                return '🎫';
              };
              
              return (
              <Box key={item.id}>
                <Card 
                  sx={{ 
                    mb: 2, 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                          }}>
                            {getItemIcon()}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a2e' }}>
                              {getItemTitle()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: 16 }} /> {formatDate(getItemDate())}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn sx={{ fontSize: 16 }} /> {getItemSubtitle()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                              {item.ticketType && <Chip label={item.ticketType} size="small" sx={{ bgcolor: '#667eea15', color: '#667eea', fontWeight: 600 }} />}
                              {item.quantity && <Chip label={`× ${item.quantity}`} size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />}
                              {(item.seat_numbers || item.seatNumbers)?.length > 0 && (
                                <Chip icon={<EventSeat sx={{ fontSize: 16 }} />} label={(item.seat_numbers || item.seatNumbers).join(', ')} size="small" sx={{ bgcolor: '#f1f5f9' }} />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#667eea' }}>
                          KES {(Number(item.totalPrice) || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          KES {(Number(item.basePrice) || 0).toLocaleString()} × {item.quantity}
                        </Typography>
                        <Button
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={async () => {
                            try {
                              if (isGuest) {
                                await removeFromGuestCart(guestCartId, item.id, apiRequest, API_BASE_URL);
                                toast.success('Item removed from cart');
                              } else {
                                removeFromCart(item.id);
                                // CartContext already shows toast
                              }
                            } catch (err) {
                              console.error('Failed to remove item:', err);
                              toast.error('Failed to remove item');
                            }
                          }}
                          sx={{ mt: 1 }}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Ticket Template Preview (Events only) */}
                {itemType === 'event' && templateData[item.eventId] && (
                  <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.paper', border: '2px solid', borderColor: 'primary.light' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Ticket Preview - Your Ticket Will Look Like This:
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', py: 2 }}>
                        <TicketPreview
                          template={templateData[item.eventId]}
                          elements={templateData[item.eventId]?.elements || []}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                        Template: {templateData[item.eventId]?.name}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Passenger Details Preview (Buses) */}
                {itemType === 'bus' && item.passengerDetails && (
                  <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.paper', border: '2px solid', borderColor: 'primary.light' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Passenger Details:
                      </Typography>
                      {Array.isArray(item.passengerDetails) && item.passengerDetails.map((passenger, idx) => (
                        <Box key={idx} sx={{ mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Passenger {idx + 1}</Typography>
                          <Typography variant="caption" display="block">Name: {passenger.name}</Typography>
                          <Typography variant="caption" display="block">Email: {passenger.email}</Typography>
                          <Typography variant="caption" display="block">Phone: {passenger.phone}</Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </Box>
            );
            })}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total: ${(Number(effectiveTotal) || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {displayItems.length} item{displayItems.length > 1 ? 's' : ''}
              </Typography>
            </Box>

            {isAuthenticatedUser && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Discount Code
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    label="Code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={loading}
                  />
                  {!discountInfo ? (
                    <Button variant="outlined" onClick={applyDiscountCode} disabled={loading}>
                      Apply
                    </Button>
                  ) : (
                    <Button variant="outlined" color="error" onClick={removeDiscountCode} disabled={loading}>
                      Remove
                    </Button>
                  )}
                </Box>
                {discountInfo && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {`${discountInfo.discountPercentage}% off applied. You saved $${Number(discountInfo.discountAmount || 0).toFixed(2)}.`}
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          {/* Billing Information - Modern Design */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>👤</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Billing Details</Typography>
                  <Typography variant="body2" color="text.secondary">Your contact information</Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" variant="outlined" value={checkoutData.billingAddress.firstName}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, firstName: e.target.value }}))}
                    required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" variant="outlined" value={checkoutData.billingAddress.lastName}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, lastName: e.target.value }}))}
                    required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email Address" type="email" variant="outlined" value={checkoutData.billingAddress.email}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, email: e.target.value }}))}
                    required InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>📧</Box> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone Number" variant="outlined" value={checkoutData.billingAddress.phone}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, phone: e.target.value }}))}
                    required placeholder="+254 712 345 678" InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>📱</Box> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Grid>
                <Grid item xs={12}>
                  <GooglePlacesAutocomplete value={checkoutData.billingAddress.address}
                    onChange={(value) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, address: value }}))}
                    label="Street Address"
                    onAddressSelect={(addressData) => {
                      setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, address: addressData.address, city: addressData.city, country: addressData.country }}));
                    }} />
                </Grid>
                <Grid item xs={7}>
                  <TextField fullWidth label="City" variant="outlined" value={checkoutData.billingAddress.city}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, city: e.target.value }}))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Grid>
                <Grid item xs={5}>
                  <TextField fullWidth label="Country" variant="outlined" value={checkoutData.billingAddress.country}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, country: e.target.value }}))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Payment Method - Modern Card Selection */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>💳</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Method</Typography>
                  <Typography variant="body2" color="text.secondary">Choose how to pay</Typography>
                </Box>
              </Box>

              {/* Deposit Option */}
              {isAuthenticatedUser && depositEligibility.allowed && (
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
                  <FormControlLabel
                    control={<Switch checked={payDeposit} onChange={(e) => setPayDeposit(e.target.checked)} color="success" />}
                    label={<Typography sx={{ fontWeight: 600 }}>💰 Pay a deposit now</Typography>}
                  />
                  {payDeposit && (
                    <TextField fullWidth label="Deposit Amount" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                      helperText={`Min: KES ${depositEligibility.minDeposit.toLocaleString()} • Total: KES ${Number(effectiveTotal || 0).toLocaleString()}`}
                      sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                  )}
                </Box>
              )}

              {!depositEligibility.allowed && isAuthenticatedUser && depositEligibility.eventsWithoutDeposit.length > 0 && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <AlertTitle>Full Payment Required</AlertTitle>
                  Deposits not available for: {depositEligibility.eventsWithoutDeposit.join(', ')}
                </Alert>
              )}

              {/* Payment Method Cards */}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>SELECT PAYMENT METHOD</Typography>
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {[
                  { value: 'stripe', label: 'Card', icon: '💳', desc: 'Visa, Mastercard' },
                  { value: 'kenya_gateway', label: 'Mobile', icon: '📱', desc: 'M-Pesa, Airtel' },
                  { value: 'paypal', label: 'PayPal', icon: '🅿️', desc: 'Pay online' },
                  { value: 'nfc', label: 'NFC Card', icon: '🏷️', desc: 'Tap to pay' },
                  { value: 'cash', label: 'Cash', icon: '💵', desc: 'Pay at venue' },
                ].map((method) => (
                  <Grid item xs={6} sm={4} key={method.value}>
                    <Box onClick={() => setCheckoutData(prev => ({ ...prev, paymentMethod: method.value }))}
                      sx={{
                        p: 2, borderRadius: 2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                        border: '2px solid', borderColor: checkoutData.paymentMethod === method.value ? 'primary.main' : 'divider',
                        bgcolor: checkoutData.paymentMethod === method.value ? 'primary.50' : 'white',
                        '&:hover': { borderColor: 'primary.light', transform: 'translateY(-2px)', boxShadow: 2 }
                      }}>
                      <Typography sx={{ fontSize: '1.75rem', mb: 0.5 }}>{method.icon}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{method.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{method.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Kenya Mobile Money Options */}
              {checkoutData.paymentMethod === 'kenya_gateway' && (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#ecfdf5', border: '1px solid #a7f3d0', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#047857' }}>📱 SELECT MOBILE PROVIDER</Typography>
                  <Grid container spacing={1}>
                    {[
                      { value: 'mpesa', label: 'M-Pesa', fee: '1.5%', color: '#4ade80' },
                      { value: 'airtel_money', label: 'Airtel Money', fee: '2.5%', color: '#f87171' },
                      { value: 'equitel', label: 'Equitel', fee: '2%', color: '#facc15' },
                      { value: 'tkash', label: 'T-Kash', fee: '2%', color: '#60a5fa' },
                    ].map((gateway) => (
                      <Grid item xs={6} key={gateway.value}>
                        <Box onClick={() => setCheckoutData(prev => ({ ...prev, kenyaGateway: gateway.value }))}
                          sx={{
                            p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            border: '2px solid', borderColor: checkoutData.kenyaGateway === gateway.value ? gateway.color : 'transparent',
                            bgcolor: checkoutData.kenyaGateway === gateway.value ? 'white' : 'rgba(255,255,255,0.5)',
                            '&:hover': { bgcolor: 'white' }
                          }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{gateway.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{gateway.fee} fee</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <TextField fullWidth label="Phone Number" placeholder="+254 712 345 678" value={checkoutData.phoneNumber}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    helperText="You'll receive a payment prompt on this number"
                    sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Box>
              )}

              {/* Card Payment Form */}
              {(checkoutData.paymentMethod === 'stripe' || checkoutData.paymentMethod === 'nfc') && checkoutData.paymentMethod !== 'nfc' && (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard sx={{ fontSize: 20 }} /> CARD DETAILS
                  </Typography>
                  <TextField fullWidth label="Card Number" placeholder="4242 4242 4242 4242" value={checkoutData.cardDetails.cardNumber}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, cardNumber: e.target.value }}))}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField fullWidth label="Expiry" placeholder="MM/YY" value={checkoutData.cardDetails.expiryDate}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, expiryDate: e.target.value }}))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth label="CVV" placeholder="123" type="password" value={checkoutData.cardDetails.cvv}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, cvv: e.target.value }}))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                    </Grid>
                  </Grid>
                  <TextField fullWidth label="Cardholder Name" placeholder="JOHN DOE" value={checkoutData.cardDetails.cardholderName}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, cardholderName: e.target.value }}))}
                    sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                    <Lock sx={{ mr: 1, color: 'success.main', fontSize: 18 }} />
                    <Typography variant="caption" color="text.secondary">256-bit SSL encrypted • Your data is secure</Typography>
                  </Box>
                </Box>
              )}

              {/* PayPal */}
              {checkoutData.paymentMethod === 'paypal' && (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fcd34d', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>🅿️</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0070ba' }}>PayPal Checkout</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>You'll be redirected to PayPal to complete payment</Typography>
                  <TextField fullWidth label="PayPal Email (optional)" placeholder="your@email.com"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }}} />
                </Box>
              )}

              {/* Cash */}
              {checkoutData.paymentMethod === 'cash' && (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#fef3c7', border: '1px solid #fcd34d', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>💵</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Cash Payment</Typography>
                  <Typography variant="body2" color="text.secondary">Pay in cash when collecting your tickets at the venue</Typography>
                </Box>
              )}

              {/* NFC Card */}
              {checkoutData.paymentMethod === 'nfc' && (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#ede9fe', border: '1px solid #c4b5fd' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#6d28d9' }}>🏷️ NFC/RFID PAYMENT</Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      { value: 'nfc', label: 'NFC Card' },
                      { value: 'rfid', label: 'RFID Wristband' },
                      { value: 'both', label: 'Bundle' },
                    ].map((type) => (
                      <Grid item xs={4} key={type.value}>
                        <Box onClick={() => setCheckoutData(prev => ({ ...prev, nfcCardType: type.value }))}
                          sx={{
                            p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                            border: '2px solid', borderColor: checkoutData.nfcCardType === type.value ? '#8b5cf6' : 'transparent',
                            bgcolor: checkoutData.nfcCardType === type.value ? 'white' : 'rgba(255,255,255,0.5)'
                          }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{type.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Button fullWidth variant={checkoutData.purchaseNFCCard ? "contained" : "outlined"} color="secondary"
                    onClick={() => setCheckoutData(prev => ({ ...prev, purchaseNFCCard: !prev.purchaseNFCCard }))}
                    sx={{ borderRadius: 2, py: 1.5 }}>
                    {checkoutData.purchaseNFCCard ? '✓ NFC Card Added (KES 1,500)' : '+ Purchase NFC Card'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {orderResult?.status === 'partially_paid' ? 'Deposit Received!' : 'Order Confirmed!'}
            </Typography>
            <Typography variant="body1" paragraph>
              {orderResult?.status === 'partially_paid'
                ? 'Your tickets are reserved. Pay the remaining balance to confirm them.'
                : 'Your tickets have been reserved and payment has been processed.'}
            </Typography>

            {isAuthenticatedUser && orderResult?.status === 'partially_paid' && (
              <Box sx={{ maxWidth: 420, mx: 'auto', mt: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Remaining balance: ${Number(orderResult.balanceDue || 0).toFixed(2)}
                </Alert>
                <TextField
                  fullWidth
                  label="Pay Remaining Amount"
                  value={payRemainingAmount}
                  onChange={(e) => setPayRemainingAmount(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={payRemainingBalance}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Processing...' : 'Pay Remaining Balance'}
                </Button>
              </Box>
            )}
            {checkoutData.purchaseNFCCard && (
              <Typography variant="body2" color="success.main" paragraph sx={{ fontWeight: 'bold' }}>
                ✓ NFC/RFID Card has been added to your order!
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" paragraph>
              You will receive email confirmations with your digital tickets shortly.
            </Typography>
            {isGuest && (
              <Alert severity="info" sx={{ my: 2 }}>
                <strong>Tip:</strong> Create an account to track your tickets and access them anytime!
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isGuest && (
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large" 
                  onClick={() => setShowRegistrationModal(true)}
                >
                  Create Account
                </Button>
              )}
              <Button variant="contained" size="large" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              {checkoutData.purchaseNFCCard && (
                <Button variant="contained" color="success" size="large" onClick={() => navigate('/my-nfc-cards')}>
                  View My NFC Cards
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>

        <Box>
          {activeStep === 2 ? null : activeStep === 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              disabled={loading}
              startIcon={<Payment />}
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 1 && !checkoutData.billingAddress.email}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        open={showRegistrationModal}
        guestEmail={guestEmail}
        confirmationCode={guestConfirmationCode}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={(data) => {
          navigate('/');
          toast.success('Account created! You can now log in.');
        }}
        apiRequest={apiRequest}
        API_BASE_URL={API_BASE_URL}
      />
      </Container>
    </Box>
  );
};

export default CheckoutPage;
