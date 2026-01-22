import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { ArrowBack, CloudUpload, CheckCircle } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const seasonPassSchema = yup.object({
  name: yup.string().required('Season pass name is required'),
  description: yup.string().max(500, 'Description must be under 500 characters'),
  season_year: yup.number().required('Season year is required').positive().integer(),
  season_type: yup.string().required('Season type is required'),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string().required('End date is required'),
  base_price: yup.number().required('Base price is required').positive(),
  season_price: yup.number().required('Season price is required').positive(),
  available_quantity: yup.number().required('Quantity is required').positive().integer(),
  status: yup.string().required('Status is required'),
});

const EditSeasonalTicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [seasonalTicket, setSeasonalTicket] = useState(null);
  const [seasonalTicketImageUrl, setSeasonalTicketImageUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(seasonPassSchema),
  });

  const formValues = watch();
  const discountPercent = formValues.base_price && formValues.season_price
    ? (((formValues.base_price - formValues.season_price) / formValues.base_price) * 100).toFixed(0)
    : 0;

  useEffect(() => {
    fetchSeasonalTicket();
    fetchAvailableEvents();
  }, []);

  const fetchSeasonalTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch season pass (${response.status})`);
      }

      const data = await response.json();
      const ticket = data.data;
      
      if (!ticket) {
        throw new Error('Season pass not found');
      }

      setSeasonalTicket(ticket);
      setSeasonalTicketImageUrl(ticket.image_url || '');

      // Extract event IDs from the included events
      const eventIds = ticket.events?.map((e) => e.id) || [];
      setSelectedEvents(eventIds);

      // Reset form with ticket data
      reset({
        name: ticket.name || '',
        description: ticket.description || '',
        season_year: ticket.season_year || new Date().getFullYear(),
        season_type: ticket.season_type || 'full-year',
        start_date: ticket.start_date?.split('T')[0] || '',
        end_date: ticket.end_date?.split('T')[0] || '',
        base_price: ticket.base_price || 0,
        season_price: ticket.season_price || 0,
        available_quantity: ticket.available_quantity || 0,
        status: ticket.status || 'draft',
      });
    } catch (err) {
      console.error('Fetch seasonal ticket error:', err);
      setError(err.message || 'Failed to load season pass');
      toast.error(err.message || 'Failed to load season pass');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/events?status=published&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setAvailableEvents(data.data.events || []);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiRequest(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!data.success) throw new Error(data.message || 'Image upload failed');

      setSeasonalTicketImageUrl(data.fileUrl || data.data?.fileUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...data,
        image_url: seasonalTicketImageUrl,
        discount_percentage: parseFloat(discountPercent),
        selectedEvents, // Include selected events in the payload
      };

      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update season pass');
      }

      toast.success('Season pass updated successfully!');
      navigate(`/manage-seasonal-tickets`);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update season pass');
      toast.error(err.message || 'Failed to update season pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formValues.name || !formValues.season_year) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const steps = ['Basic Info', 'Pricing', 'Events', 'Review'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/manage-seasonal-tickets')}
          variant="text"
        >
          Back to Season Passes
        </Button>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
          Edit Season Pass
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Step 0: Basic Info */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Season Pass Name"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Description"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="season_year"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Season Year"
                          type="number"
                          fullWidth
                          error={!!errors.season_year}
                          helperText={errors.season_year?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="season_type"
                      control={control}
                      defaultValue="full-year"
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.season_type}>
                          <InputLabel>Season Type</InputLabel>
                          <Select
                            {...field}
                            label="Season Type"
                            value={field.value || 'full-year'}
                          >
                            <MenuItem value="spring">Spring</MenuItem>
                            <MenuItem value="summer">Summer</MenuItem>
                            <MenuItem value="fall">Fall</MenuItem>
                            <MenuItem value="winter">Winter</MenuItem>
                            <MenuItem value="full-year">Full Year</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Start Date"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.start_date}
                          helperText={errors.start_date?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="End Date"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.end_date}
                          helperText={errors.end_date?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Image Upload */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Season Pass Image
                    </Typography>
                    {seasonalTicketImageUrl && (
                      <Box sx={{ mb: 2 }}>
                        <img
                          src={seasonalTicketImageUrl}
                          alt="Season Pass"
                          style={{ maxWidth: '200px', borderRadius: 8, marginBottom: 8 }}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: '#f9f9f9',
                        '&:hover': { bgcolor: '#f0f0f0' },
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2">
                        Click to upload new image
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}

              {/* Step 1: Pricing */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Pricing Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="base_price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Regular Price"
                          type="number"
                          inputProps={{ step: '0.01' }}
                          fullWidth
                          error={!!errors.base_price}
                          helperText={errors.base_price?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="season_price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Season Pass Price"
                          type="number"
                          inputProps={{ step: '0.01' }}
                          fullWidth
                          error={!!errors.season_price}
                          helperText={errors.season_price?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Discount Preview */}
                  {formValues.base_price && formValues.season_price && (
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Discount Summary
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Regular Price
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                ${formValues.base_price}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Season Price
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                ${formValues.season_price}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Savings
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {discountPercent}% off
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Controller
                      name="available_quantity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Number of Passes to Sell"
                          type="number"
                          fullWidth
                          error={!!errors.available_quantity}
                          helperText={errors.available_quantity?.message}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Step 2: Manage Events */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Link Events to Season Pass
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select which of your events this season pass includes. Customers with this pass can access all linked events.
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {eventsLoading ? (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Grid>
                  ) : availableEvents.length === 0 ? (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        You don't have any events yet. Create events first, then link them to this season pass.
                      </Alert>
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Selected: {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          {availableEvents.map((event) => {
                            const isSelected = selectedEvents.includes(event.id);
                            const eventDate = new Date(event.start_date);
                            const formattedDate = eventDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });

                            return (
                              <Grid item xs={12} key={event.id}>
                                <Card
                                  sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: isSelected ? '2px solid' : '1px solid',
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                                    '&:hover': {
                                      boxShadow: 3,
                                      borderColor: 'primary.main',
                                    },
                                  }}
                                  onClick={() =>
                                    setSelectedEvents((prev) =>
                                      prev.includes(event.id)
                                        ? prev.filter((eid) => eid !== event.id)
                                        : [...prev, event.id]
                                    )
                                  }
                                >
                                  <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                      {/* Checkbox */}
                                      <Box
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          border: '2px solid',
                                          borderColor: isSelected ? 'primary.main' : 'divider',
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          bgcolor: isSelected ? 'primary.main' : 'transparent',
                                          mt: 0.5,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {isSelected && (
                                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>✓</Typography>
                                        )}
                                      </Box>

                                      {/* Event Details */}
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          {event.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                          📅 {formattedDate}
                                        </Typography>
                                        {event.description && (
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                            {event.description?.substring(0, 60)}...
                                          </Typography>
                                        )}
                                      </Box>

                                      {/* Price Badge */}
                                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                          {event.currency || 'KES'} {parseFloat(event.base_price).toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {event.available_tickets || 0} tickets
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Grid>

                      {selectedEvents.length === 0 && (
                        <Grid item xs={12}>
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            No events selected. Season pass holders will not have access to any events until you link at least one.
                          </Alert>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Step 3: Review */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Changes
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formValues.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Season
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formValues.season_type} {formValues.season_year}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Regular Price
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              ${formValues.base_price}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Season Price
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              ${formValues.season_price} ({discountPercent}% off)
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    Back
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <FormControl sx={{ minWidth: 200 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            {...field}
                            label="Status"
                          >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  ) : null}

                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={24} />
                    ) : activeStep === steps.length - 1 ? (
                      'Save Changes'
                    ) : (
                      'Next'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditSeasonalTicketPage;
