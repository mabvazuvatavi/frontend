import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Chip,
  Stack,
  Fade,
  StepConnector,
  stepConnectorClasses,
  styled,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowBack, Add, Edit, Delete, Info, Event, LocationOn, AttachMoney, Image, CheckCircle } from '@mui/icons-material';

// Custom styled stepper connector
const GradientConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom step icon
const StepIconRoot = styled('div')(({ ownerState }) => ({
  backgroundColor: '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
  }),
  ...(ownerState.completed && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;
  const icons = {
    1: <LocationOn />,
    2: <Event />,
    3: <AttachMoney />,
    4: <Image />,
    5: <CheckCircle />,
  };
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </StepIconRoot>
  );
}

// Validation schema
const schema = yup.object({
  title: yup.string().required('Event title is required').min(3),
  description: yup.string().required('Description is required').min(10),
  short_description: yup.string().max(500),
  category: yup.string().required('Category is required'),
  event_mode: yup.string().required('Event mode is required'),
  venue_id: yup.string().when('event_mode', {
    is: (value) => value === 'in_person' || value === 'hybrid',
    then: (schema) => schema.required('Venue is required for physical events'),
    otherwise: (schema) => schema.optional(),
  }),
  start_date: yup.date().required('Start date is required'),
  end_date: yup.date().required('End date is required'),
  base_price: yup.number().min(0),
  total_capacity: yup.number().when('event_mode', {
    is: 'virtual',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.optional(),
  }),
});

const EventCreationFormNew = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  const { eventId } = useParams(); // For edit mode

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueSeatingOptions, setVenueSeatingOptions] = useState([]);

  // Pricing tiers
  const [pricingTiers, setPricingTiers] = useState([]);
  const [tierDialog, setTierDialog] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({
    tier_name: '',
    description: '',
    base_price: '',
    total_tickets: '',
    venue_section_id: null,
    sale_start_date: '',
    sale_end_date: '',
  });

  const categories = [
    { value: 'music', label: 'Music & Concerts' },
    { value: 'sports_soccer', label: 'Sports - Soccer' },
    { value: 'sports_cricket', label: 'Sports - Cricket' },
    { value: 'sports_other', label: 'Sports - Other' },
    { value: 'arts', label: 'Arts & Theater' },
    { value: 'business', label: 'Business & Conference' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' },
  ];

  const steps = ['Mode & Venue', 'Basic Details', 'Pricing Tiers', 'Media', 'Review'];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      category: '',
      event_mode: 'in_person',
      venue_id: '',
      start_date: '',
      end_date: '',
      base_price: 0,
      total_capacity: 0,
    },
  });

  const eventMode = watch('event_mode');
  const selectedVenueId = watch('venue_id');
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [loadedEventStatus, setLoadedEventStatus] = useState(null);

  // Load event data if editing
  useEffect(() => {
    if (eventId) {
      setIsEditMode(true);
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setEventLoading(true);
      const data = await apiRequest(`${API_BASE_URL}/events/${eventId}`, { method: 'GET' });
      if (data?.data) {
        const event = data.data;
        setLoadedEventStatus(event.status || null);
        // Populate form fields
        setValue('title', event.title || '');
        setValue('description', event.description || '');
        setValue('short_description', event.short_description || '');
        setValue('category', event.category || '');
        setValue('event_mode', event.event_mode || 'in_person');
        setValue('venue_id', event.venue_id || '');
        setValue('start_date', event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '');
        setValue('end_date', event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '');
        setValue('base_price', event.base_price || 0);
        setValue('total_capacity', event.total_capacity || 0);
        setEventImageUrl(event.event_image_url || '');
        
        // Load pricing tiers
        if (event.pricing_tiers && event.pricing_tiers.length > 0) {
          setPricingTiers(event.pricing_tiers.map(t => ({
            tier_name: t.tier_name,
            description: t.description || '',
            base_price: t.base_price,
            total_tickets: t.total_tickets,
            venue_section_id: t.venue_section_id || null,
            sale_start_date: t.sale_start_date || '',
            sale_end_date: t.sale_end_date || '',
          })));
        }
      }
    } catch (err) {
      console.error('Error loading event:', err);
      toast.error('Failed to load event data');
    } finally {
      setEventLoading(false);
    }
  };

  // Load venues when physical is selected
  useEffect(() => {
    if (eventMode === 'in_person' || eventMode === 'hybrid') {
      loadVenues();
    }
  }, [eventMode]);

  // Load seating options when venue is selected
  useEffect(() => {
    if (selectedVenueId && (eventMode === 'in_person' || eventMode === 'hybrid')) {
      loadVenueSections(selectedVenueId);
    }
  }, [selectedVenueId]);

  const loadVenues = async () => {
    try {
      setVenuesLoading(true);
      console.log('Loading venues...');
      const data = await apiRequest(`${API_BASE_URL}/venues`, {
        method: 'GET',
      });
      console.log('Venues data:', data);
      if (data?.success) {
        const venuesList = Array.isArray(data.data) ? data.data : data.data?.venues || [];
        console.log('Setting venues:', venuesList.length);
        setVenues(venuesList);
      } else {
        console.error('Venues fetch returned success=false or error:', data);
      }
    } catch (err) {
      console.error('Error loading venues:', err);
    } finally {
      setVenuesLoading(false);
    }
  };

  const loadVenueSections = async (venueId) => {
    try {
      console.log('Loading venue sections for:', venueId);
      const data = await apiRequest(`${API_BASE_URL}/venues/${venueId}/seating-sections`, {
        method: 'GET',
      });
      console.log('Venue sections data:', data);
      if (data?.success) {
        const sectionsList = Array.isArray(data.data) ? data.data : data.data?.sections || [];
        console.log('Setting seating options:', sectionsList.length);
        setVenueSeatingOptions(sectionsList);
        setSelectedVenue(venues.find((v) => v.id === venueId));
      } else {
        console.error('Venue sections fetch returned success=false:', data);
        setVenueSeatingOptions([]);
      }
    } catch (err) {
      console.error('Error loading venue sections:', err);
      setVenueSeatingOptions([]);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await apiRequest(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!data.success) throw new Error(data.message || 'Upload failed');
      setEventImageUrl(data.fileUrl || data.data?.fileUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  // Pricing tier management
  const handleAddTier = () => {
    setTierForm({
      tier_name: '',
      description: '',
      base_price: '',
      total_tickets: '',
      venue_section_id: null,
      sale_start_date: '',
      sale_end_date: '',
    });
    setEditingTier(null);
    setTierDialog(true);
  };

  const handleEditTier = (index) => {
    setEditingTier(index);
    setTierForm(pricingTiers[index]);
    setTierDialog(true);
  };

  const handleSaveTier = () => {
    if (!tierForm.tier_name || !tierForm.base_price || !tierForm.total_tickets) {
      toast.error('Please fill all required tier fields');
      return;
    }

    if (editingTier !== null) {
      const newTiers = [...pricingTiers];
      newTiers[editingTier] = tierForm;
      setPricingTiers(newTiers);
      toast.success('Tier updated!');
    } else {
      setPricingTiers([...pricingTiers, tierForm]);
      toast.success('Tier added!');
    }
    setTierDialog(false);
  };

  const handleDeleteTier = (index) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
    toast.success('Tier removed!');
  };

  const saveEvent = async (data, { submitForApproval }) => {
    try {
      setLoading(true);
      setError('');

      // Validate pricing tiers
      if (pricingTiers.length === 0) {
        setError('Please add at least one pricing tier');
        return;
      }

      // For physical events with seating, validate tier-section mapping
      if ((eventMode === 'in_person' || eventMode === 'hybrid') && venueSeatingOptions.length > 0) {
        const tiersWithoutSection = pricingTiers.filter((t) => !t.venue_section_id);
        if (tiersWithoutSection.length > 0) {
          toast.warning('Some tiers are not linked to seating sections');
        }
      }

      const payload = {
        ...data,
        organizer_id: user?.id,
        event_image_url: eventImageUrl,
        pricing_tiers: pricingTiers,
        status: 'draft',
        event_mode: eventMode,
      };

      const url = eventId
        ? `${API_BASE_URL}/events/${eventId}`
        : `${API_BASE_URL}/events`;
      const method = eventId ? 'PATCH' : 'POST';

      const result = await apiRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!result?.success) throw new Error(result?.message || 'Failed to save event');

      const savedEventId = result?.data?.id || result?.id;
      if (!savedEventId) throw new Error('Event saved but no event ID returned');

      if (submitForApproval) {
        const approvalResult = await apiRequest(`${API_BASE_URL}/events/${savedEventId}/submit-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!approvalResult?.success) {
          throw new Error(approvalResult?.message || approvalResult?.error || 'Failed to submit event for approval');
        }
        toast.success('Event submitted for approval.');
        setLoadedEventStatus('pending_approval');
      } else {
        toast.success(eventId ? 'Event updated!' : 'Event saved as draft.');
        setLoadedEventStatus('draft');
      }

      navigate(`/events/${savedEventId}`);
    } catch (err) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = handleSubmit(async (data) => {
    await saveEvent(data, { submitForApproval: false });
  });

  const onSubmitForApproval = handleSubmit(async (data) => {
    await saveEvent(data, { submitForApproval: true });
  });

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const formValues = getValues();
  const totalTickets = pricingTiers.reduce((sum, t) => sum + parseInt(t.total_tickets || 0), 0);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={600}>
            <Box>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/events')}
                sx={{
                  color: 'white',
                  mb: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Back to Events
              </Button>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  mb: 1,
                }}
              >
                {eventId ? 'Edit Event' : 'Create New Event'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Set up your event step by step. Your event will be submitted for admin approval.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {eventLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : (
        <>
        {/* Modern Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<GradientConnector />}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography sx={{ fontWeight: 600, mt: 1 }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <form>
            <Grid container spacing={3}>

              {/* STEP 0: Mode & Venue */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Event Type
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2 }}>
                        How will you host your event?
                      </FormLabel>
                      <RadioGroup
                        value={eventMode}
                        onChange={(e) => setValue('event_mode', e.target.value)}
                      >
                        <FormControlLabel
                          value="in_person"
                          control={<Radio />}
                          label="In-Person Event (At a Venue)"
                        />
                        <FormControlLabel
                          value="virtual"
                          control={<Radio />}
                          label="Virtual Event (Online Only)"
                        />
                        <FormControlLabel
                          value="hybrid"
                          control={<Radio />}
                          label="Hybrid Event (Both In-Person & Online)"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {(eventMode === 'in_person' || eventMode === 'hybrid') && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Select Venue
                      </Typography>
                      {venuesLoading ? (
                        <CircularProgress />
                      ) : (
                        <Controller
                          name="venue_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              fullWidth
                              select
                              label="Venue"
                              value={value ?? ''}
                              onChange={(e) => onChange(e.target.value)}
                              error={!!errors.venue_id}
                              helperText={errors.venue_id?.message}
                              required
                            >
                              <MenuItem value="">-- Select Venue --</MenuItem>
                              {venues.map((venue) => (
                                <MenuItem key={venue.id} value={venue.id}>
                                  {venue.name} ({venue.capacity} capacity) - {venue.city}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      )}
                      
                      {selectedVenue && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <strong>{selectedVenue.name}</strong> | Capacity: {selectedVenue.capacity} | 
                          {venueSeatingOptions.length > 0
                            ? ` ${venueSeatingOptions.length} seating sections`
                            : ' No seating sections'}
                        </Alert>
                      )}
                    </Grid>
                  )}
                </>
              )}

              {/* STEP 1: Basic Details */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      {...register('title')}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      {...register('category')}
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      required
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Short Description"
                      multiline
                      rows={2}
                      {...register('short_description')}
                      placeholder="Brief summary for listings"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Description"
                      multiline
                      rows={4}
                      {...register('description')}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Detailed event description"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date & Time"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      {...register('start_date')}
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date & Time"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      {...register('end_date')}
                      error={!!errors.end_date}
                      helperText={errors.end_date?.message}
                      required
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Pricing Tiers */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Pricing Tiers
                      </Typography>
                      <Button
                        startIcon={<Add />}
                        variant="contained"
                        size="small"
                        onClick={handleAddTier}
                      >
                        Add Tier
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Define different price levels. {eventMode === 'in_person' || eventMode === 'hybrid'
                        ? 'You can link tiers to specific seating sections.'
                        : 'Link tiers to pricing levels.'}
                    </Typography>
                  </Grid>

                  {pricingTiers.length > 0 && (
                    <Grid item xs={12}>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell><strong>Tier Name</strong></TableCell>
                              <TableCell align="right"><strong>Price (KES)</strong></TableCell>
                              <TableCell align="right"><strong>Tickets</strong></TableCell>
                              <TableCell><strong>Section/Desc</strong></TableCell>
                              <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pricingTiers.map((tier, index) => {
                              const section = venueSeatingOptions.find(
                                (s) => s.id === tier.venue_section_id
                              );
                              return (
                                <TableRow key={index}>
                                  <TableCell>{tier.tier_name}</TableCell>
                                  <TableCell align="right">KES {tier.base_price}</TableCell>
                                  <TableCell align="right">{tier.total_tickets}</TableCell>
                                  <TableCell>{section?.section_name || tier.description || '-'}</TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditTier(index)}
                                    >
                                      <Edit />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteTier(index)}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Alert severity="info" sx={{ mt: 2 }}>
                        Total Tickets: <strong>{totalTickets}</strong>
                      </Alert>
                    </Grid>
                  )}

                  {pricingTiers.length === 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        Click "Add Tier" to create pricing options
                      </Alert>
                    </Grid>
                  )}
                </>
              )}

              {/* STEP 3: Media */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Event Image
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'primary.main',
                        cursor: 'pointer',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                        {imageUploading ? (
                          <CircularProgress />
                        ) : (
                          <Box>
                            <Typography variant="h6">Click to upload event image</Typography>
                            <Typography variant="body2" color="text.secondary">
                              or drag and drop
                            </Typography>
                          </Box>
                        )}
                      </label>
                    </Paper>

                    {eventImageUrl && (
                      <Box sx={{ mt: 3 }}>
                        <Box
                          component="img"
                          src={eventImageUrl}
                          alt="Event preview"
                          sx={{ maxHeight: 300, maxWidth: '100%', borderRadius: 1 }}
                        />
                      </Box>
                    )}
                  </Grid>
                </>
              )}

              {/* STEP 4: Review */}
              {activeStep === 4 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Review & Submit
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {eventImageUrl && (
                    <Grid item xs={12}>
                      <Box
                        component="img"
                        src={eventImageUrl}
                        alt="Event preview"
                        sx={{ maxHeight: 250, width: '100%', objectFit: 'cover', borderRadius: 1, mb: 2 }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Event Title
                      </Typography>
                      <Typography variant="body2">{formValues.title}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Category
                      </Typography>
                      <Typography variant="body2">
                        {categories.find(c => c.value === formValues.category)?.label || formValues.category}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Event Mode
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {eventMode}
                      </Typography>
                    </Paper>
                  </Grid>

                  {selectedVenue && (
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Venue
                        </Typography>
                        <Typography variant="body2">{selectedVenue.name}</Typography>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Pricing Tiers ({pricingTiers.length})
                      </Typography>
                      {pricingTiers.map((tier, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                          • {tier.tier_name}: KES {tier.base_price} × {tier.total_tickets} tickets
                        </Typography>
                      ))}
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Info />}>
                      <strong>Your event will be submitted for admin approval.</strong> Once approved by an admin,
                      it will be published and visible to customers.
                    </Alert>
                  </Grid>
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/events')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <>
                        <Button
                          type="button"
                          variant="outlined"
                          size="large"
                          disabled={loading}
                          onClick={onSaveDraft}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save Draft'}
                        </Button>
                        <Button
                          type="button"
                          variant="contained"
                          size="large"
                          disabled={loading || (eventId && loadedEventStatus && loadedEventStatus !== 'draft')}
                          onClick={onSubmitForApproval}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Submit for Approval'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="contained"
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
        </>
        )}

      {/* Tier Dialog */}
      <Dialog open={tierDialog} onClose={() => setTierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTier !== null ? 'Edit Pricing Tier' : 'Add Pricing Tier'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tier Name"
                value={tierForm.tier_name}
                onChange={(e) => setTierForm({ ...tierForm, tier_name: e.target.value })}
                placeholder="e.g., Early Bird, Regular"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (KES)"
                type="number"
                inputProps={{ step: '100' }}
                value={tierForm.base_price}
                onChange={(e) => setTierForm({ ...tierForm, base_price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Tickets"
                type="number"
                value={tierForm.total_tickets}
                onChange={(e) => setTierForm({ ...tierForm, total_tickets: e.target.value })}
              />
            </Grid>
            {(eventMode === 'in_person' || eventMode === 'hybrid') && venueSeatingOptions.length > 0 && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Link to Seating Section"
                  value={tierForm.venue_section_id || ''}
                  onChange={(e) => setTierForm({ ...tierForm, venue_section_id: e.target.value || null })}
                >
                  <MenuItem value="">-- Optional --</MenuItem>
                  {venueSeatingOptions.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.section_name} (Base: KES {section.base_price})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={tierForm.description}
                onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                placeholder="e.g., Limited time offer"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTierDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTier} variant="contained">
            Save Tier
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default EventCreationFormNew;
