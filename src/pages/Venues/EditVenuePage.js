import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControlLabel,
  Checkbox,
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
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';
import { ArrowBack, Add, LocationOn, Info, EventSeat, Image, CheckCircle } from '@mui/icons-material';

// Custom styled stepper connector
const GradientConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
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
    1: <Info />,
    2: <LocationOn />,
    3: <EventSeat />,
    4: <Image />,
    5: <CheckCircle />,
  };
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </StepIconRoot>
  );
}

const schema = yup.object({
  name: yup.string().required('Venue name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  venue_type: yup.string().required('Venue type is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State/Region is required'),
  country: yup.string().required('Country is required'),
  address: yup.string().required('Address is required'),
  contact_phone: yup.string().test('phone-validation', 'Valid phone number required', function(value) {
    if (!value) return true;
    return /^[0-9\-+()]{10,}$/.test(value);
  }),
  contact_email: yup.string().email('Valid email is required').required('Email is required'),
  website: yup.string().test('url-validation', 'Valid URL required', function(value) {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }),
  capacity: yup.number().typeError('Capacity must be a number').required('Total capacity is required').min(1, 'Capacity must be at least 1'),
  has_seating: yup.boolean(),
  has_parking: yup.boolean(),
  has_wifi: yup.boolean(),
  has_catering: yup.boolean(),
  has_accessibility: yup.boolean(),
});

const EditVenuePage = () => {
  const { venueId } = useParams();
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [venueImageUrl, setVenueImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Seating sections
  const [sections, setSections] = useState([]);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    section_name: '',
    total_seats: '',
    base_price: '',
    description: '',
    color_code: '#3F51B5',
  });

  const venueTypes = [
    { value: 'stadium', label: 'Stadium' },
    { value: 'theater', label: 'Theater' },
    { value: 'arena', label: 'Arena' },
    { value: 'concert_hall', label: 'Concert Hall' },
    { value: 'sports_complex', label: 'Sports Complex' },
    { value: 'conference_center', label: 'Conference Center' },
  ];

  const countries = [
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
  ];

  const steps = ['Basic Info', 'Location', 'Amenities', 'Preview'];

  const { control, handleSubmit, reset, watch, setValue, register, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      venue_type: '',
      city: '',
      state: '',
      country: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      website: '',
      capacity: 0,
      has_seating: false,
      has_parking: false,
      has_wifi: false,
      has_catering: false,
      has_accessibility: false,
    }
  });

  // Seating section management
  const handleAddSection = () => {
    setSectionForm({
      section_name: '',
      total_seats: '',
      base_price: '',
      description: '',
      color_code: '#3F51B5',
    });
    setEditingSection(null);
    setSectionDialog(true);
  };

  const handleEditSection = (index) => {
    setEditingSection(index);
    setSectionForm(sections[index]);
    setSectionDialog(true);
  };

  const handleSaveSection = () => {
    if (!sectionForm.section_name || !sectionForm.total_seats || !sectionForm.base_price) {
      toast.error('Please fill all required section fields');
      return;
    }

    if (editingSection !== null) {
      const newSections = [...sections];
      newSections[editingSection] = sectionForm;
      setSections(newSections);
      toast.success('Section updated!');
    } else {
      setSections([...sections, sectionForm]);
      toast.success('Section added!');
    }
    setSectionDialog(false);
  };

  const handleDeleteSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
    toast.success('Section removed!');
  };

  // Load venue data on mount
  useEffect(() => {
    const loadVenueData = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`${API_BASE_URL}/venues/${venueId}`, {
          method: 'GET',
        });
        
        if (data?.success && data.data) {
          const venueData = data.data;
          setVenue(venueData);
          setVenueImageUrl(venueData.image_url || venueData.venue_image_url || '');
          
          // Reset form with venue data
          reset({
            name: venueData.name || '',
            description: venueData.description || '',
            venue_type: venueData.venue_type || '',
            city: venueData.city || '',
            state: venueData.state || '',
            country: venueData.country || '',
            address: venueData.address || '',
            contact_phone: venueData.contact_phone || venueData.phone || '',
            contact_email: venueData.contact_email || venueData.email || '',
            website: venueData.website || '',
            capacity: venueData.capacity || 0,
            has_seating: venueData.has_seating || false,
            has_parking: venueData.has_parking || false,
            has_wifi: venueData.has_wifi || false,
            has_catering: venueData.has_catering || false,
            has_accessibility: venueData.has_accessibility || false,
          });
        } else {
          throw new Error('Venue not found');
        }
      } catch (err) {
        console.error('Error loading venue:', err);
        toast.error('Failed to load venue');
        navigate('/venues');
      } finally {
        setLoading(false);
      }
    };

    loadVenueData();
  }, [venueId, apiRequest, API_BASE_URL, navigate, reset]);

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

      if (data.success) {
        setVenueImageUrl(data.fileUrl || data.data?.fileUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddressSelect = (address) => {
    reset((prev) => ({
      ...prev,
      city: address.city || prev.city,
      state: address.state || prev.state,
      country: address.country || prev.country,
      latitude: address.latitude || prev.latitude,
      longitude: address.longitude || prev.longitude,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError('');

      // Build payload with only fields that exist in the database
      const payload = {
        name: formData.name,
        description: formData.description,
        venue_type: formData.venue_type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        capacity: formData.capacity,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        website: formData.website,
        has_seating: formData.has_seating,
        has_parking: formData.has_parking,
        has_wifi: formData.has_wifi,
        has_catering: formData.has_catering,
        has_accessibility: formData.has_accessibility,
      };

      // Add image URL if it was uploaded
      if (venueImageUrl) {
        payload.image_url = venueImageUrl;
      }

      // Add seating sections if has_seating is true
      if (formData.has_seating && sections.length > 0) {
        payload.seating_sections = sections;
      }

      const data = await apiRequest(`${API_BASE_URL}/venues/${venueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (data?.success) {
        toast.success('Venue updated successfully!');
        navigate(`/venues/${venueId}`);
      } else {
        setError(data?.error || 'Failed to update venue');
        toast.error('Failed to update venue');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Error updating venue');
      toast.error('Error updating venue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#667eea' }} size={48} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Loading venue...
          </Typography>
        </Box>
      </Box>
    );
  }

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
                onClick={() => navigate(`/venues/${venueId}`)}
                sx={{
                  color: 'white',
                  mb: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Back to Venue
              </Button>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  mb: 1,
                }}
              >
                Edit Venue
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Update venue details step by step
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>

              {/* STEP 0: Basic Info */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
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
                          fullWidth
                          label="Venue Name"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          required
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
                          fullWidth
                          label="Description"
                          multiline
                          rows={4}
                          helperText="Describe the venue features and attractions"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="capacity"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Total Capacity"
                          type="number"
                          error={!!errors.capacity}
                          helperText={errors.capacity?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="contact_phone"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Phone Number"
                          type="tel"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="contact_email"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!errors.contact_email}
                          helperText={errors.contact_email?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="website"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Website"
                          type="url"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        style={{ display: 'none' }}
                        id="venue-image-input"
                      />
                      <label htmlFor="venue-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                        {imageUploading ? (
                          <>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>Uploading image...</Typography>
                          </>
                        ) : venueImageUrl ? (
                          <>
                            <Box
                              component="img"
                              src={venueImageUrl}
                              alt="Venue preview"
                              sx={{ maxHeight: 300, mb: 2, borderRadius: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Click to change image
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              📸 Upload Venue Image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click to select an image
                            </Typography>
                          </>
                        )}
                      </label>
                    </Paper>
                  </Grid>
                </>
              )}

              {/* STEP 1: Location & Details */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Location & Contact Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <GooglePlacesAutocomplete
                      value={watch('address')}
                      onChange={(value) => setValue('address', value)}
                      label="Address"
                      placeholder="Search for venue location"
                      required
                      onAddressSelect={handleAddressSelect}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="City"
                          error={!!errors.city}
                          helperText={errors.city?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="State/Province"
                          error={!!errors.state}
                          helperText={errors.state?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Country"
                          error={!!errors.country}
                          helperText={errors.country?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="postal_code"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Postal Code"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="latitude"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Latitude"
                          type="number"
                          inputProps={{ step: '0.00001' }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="longitude"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Longitude"
                          type="number"
                          inputProps={{ step: '0.00001' }}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Amenities & Hours */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Amenities
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_parking')} />}
                      label="Has Parking"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_wifi')} />}
                      label="Has WiFi"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_catering')} />}
                      label="Has Catering"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_accessibility')} />}
                      label="Accessible"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_seating')} />}
                      label="Has Seating (for tiered pricing)"
                    />
                  </Grid>

                  {watch('has_seating') && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Seating Sections
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Add />}
                            onClick={handleAddSection}
                          >
                            Add Section
                          </Button>
                        </Box>
                      </Grid>

                      {sections.length > 0 && (
                        <Grid item xs={12}>
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                  <TableCell><strong>Section Name</strong></TableCell>
                                  <TableCell align="right"><strong>Seats</strong></TableCell>
                                  <TableCell align="right"><strong>Base Price (KES)</strong></TableCell>
                                  <TableCell><strong>Description</strong></TableCell>
                                  <TableCell align="center"><strong>Actions</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sections.map((section, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                          sx={{
                                            width: 16,
                                            height: 16,
                                            backgroundColor: section.color_code || '#3F51B5',
                                            borderRadius: '4px'
                                          }}
                                        />
                                        {section.section_name}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right">{section.total_seats}</TableCell>
                                    <TableCell align="right">KES {parseInt(section.base_price || 0).toLocaleString()}</TableCell>
                                    <TableCell>{section.description}</TableCell>
                                    <TableCell align="center">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleEditSection(index)}
                                        sx={{ mr: 1 }}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteSection(index)}
                                      >
                                        Delete
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      )}

                      {sections.length === 0 && (
                        <Grid item xs={12}>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Click "Add Section" to define seating sections and base pricing
                          </Alert>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                </>
              )}

              {/* STEP 3: Review */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Venue Changes
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {venueImageUrl && (
                    <Grid item xs={12}>
                      <Box
                        component="img"
                        src={venueImageUrl}
                        alt="Venue preview"
                        sx={{ maxHeight: 300, width: '100%', objectFit: 'cover', borderRadius: 1, mb: 3 }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert severity="info">
                      Please review all changes before submitting. You can go back to edit any section.
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
                      onClick={() => navigate(`/venues/${venueId}`)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{ px: 4 }}
                      >
                        {submitting ? 'Updating...' : 'Update Venue'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ px: 4 }}
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

      {/* Section Dialog */}
      <Dialog open={sectionDialog} onClose={() => setSectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSection !== null ? 'Edit Seating Section' : 'Add Seating Section'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Name"
                value={sectionForm.section_name}
                onChange={(e) => setSectionForm({ ...sectionForm, section_name: e.target.value })}
                placeholder="e.g., VIP, Standard, Economy"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Seats"
                type="number"
                value={sectionForm.total_seats}
                onChange={(e) => setSectionForm({ ...sectionForm, total_seats: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price (KES)"
                type="number"
                inputProps={{ step: '100' }}
                value={sectionForm.base_price}
                onChange={(e) => setSectionForm({ ...sectionForm, base_price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color Code"
                type="color"
                value={sectionForm.color_code}
                onChange={(e) => setSectionForm({ ...sectionForm, color_code: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSection} variant="contained">
            Save Section
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default EditVenuePage;
