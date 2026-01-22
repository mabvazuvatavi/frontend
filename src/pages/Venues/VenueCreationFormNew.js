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
  InputAdornment,
  Fade,
  StepConnector,
  stepConnectorClasses,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ArrowBack, Add, Edit, Delete, LocationOn, Info, EventSeat, Image, CheckCircle } from '@mui/icons-material';
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';

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

// Validation schema - using when() for conditional validation based on form step
const schema = yup.object({
  name: yup.string().required('Venue name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  venue_type: yup.string().required('Venue type is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State/Region is required'),
  country: yup.string().required('Country is required'),
  address: yup.string().required('Address is required'),
  contact_phone: yup.string().test('phone-validation', 'Valid phone number required', function(value) {
    // Allow empty or valid phone
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

const VenueCreationForm = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [venueImageUrl, setVenueImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
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

  const steps = ['Basic Info', 'Location', 'Seating Sections', 'Amenities', 'Preview'];

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
      name: '',
      venue_type: '',
      description: '',
      capacity: '',  // Will be cast to number when needed
      address: '',
      city: '',
      state: '',
      country: 'Kenya',  // Default to Kenya
      contact_phone: '',
      contact_email: '',
      website: '',
      has_parking: false,
      has_wifi: false,
      has_catering: false,
      has_accessibility: false,
      has_seating: true,
    },
  });

  const hasSeating = watch('has_seating');

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
      setVenueImageUrl(data.fileUrl || data.data?.fileUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

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

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      // Validate sections if seating is enabled
      if (data.has_seating && sections.length === 0) {
        setError('Please add at least one seating section');
        return;
      }

      // Clean and prepare payload - include backend-expected field names
      const payload = {
        name: data.name?.trim(),
        description: data.description?.trim(),
        address: data.address?.trim(),
        city: data.city?.trim(),
        state: data.state?.trim() || null,
        country: data.country?.trim() || 'Kenya',
        venue_type: data.venue_type,
        capacity: parseInt(data.capacity, 10),
        // frontend names
        contact_phone: data.contact_phone?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        // backend-expected aliases
        phone: data.contact_phone?.trim() || null,
        email: data.contact_email?.trim() || null,
        website: data.website?.trim() || null,
        has_seating: data.has_seating,
        has_parking: data.has_parking || false,
        has_wifi: data.has_wifi || false,
        has_catering: data.has_catering || false,
        has_accessibility: data.has_accessibility || false,
        manager_id: user?.id,
        image_url: venueImageUrl || null,
        venue_image_url: venueImageUrl || null,
        // include seating sections for backend route
        seating_sections: data.has_seating ? sections : undefined,
      };

      const result = await apiRequest(`${API_BASE_URL}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to create venue');
      }

      toast.success('Venue created successfully!');
      navigate('/venues');
    } catch (err) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to create venue');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Places autocomplete selection
  const handleAddressSelect = (addressData) => {
    setValue('address', addressData.address);
    if (addressData.city) setValue('city', addressData.city);
    if (addressData.state) setValue('state', addressData.state);
    if (addressData.country) setValue('country', addressData.country);
  };

  const handleNext = () => {
    if (activeStep === 2 && hasSeating && sections.length === 0) {
      toast.error('Please add at least one seating section');
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const formValues = getValues();
  const totalSeats = sections.reduce((sum, s) => sum + parseInt(s.total_seats || 0), 0);

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
                onClick={() => navigate('/venues')}
                sx={{
                  color: 'white',
                  mb: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Back to Venues
              </Button>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 900,
                  mb: 1,
                }}
              >
                Create New Venue
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Define venue details, seating sections, and base pricing
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
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Venue Name"
                      value={watch('name') || ''}
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Venue Type"
                      value={watch('venue_type') || ''}
                      {...register('venue_type')}
                      error={!!errors.venue_type}
                      helperText={errors.venue_type?.message}
                      required
                    >
                      {venueTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={watch('description') || ''}
                      {...register('description')}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Describe your venue, facilities, history, etc."
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Total Capacity"
                      type="number"
                      value={watch('capacity') || ''}
                      {...register('capacity')}
                      error={!!errors.capacity}
                      helperText={errors.capacity?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_seating')} defaultChecked />}
                      label="Has Seating Sections?"
                    />
                  </Grid>
                </>
              )}

              {/* STEP 1: Location */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Location Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <GooglePlacesAutocomplete
                      label="Address"
                      value={watch('address') || ''}
                      onChange={(value) => setValue('address', value)}
                      onAddressSelect={handleAddressSelect}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={watch('city') || ''}
                      {...register('city')}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State/Region"
                      value={watch('state') || ''}
                      {...register('state')}
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Country"
                      value={watch('country') || ''}
                      {...register('country')}
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      required
                    >
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={watch('contact_phone') || ''}
                      {...register('contact_phone')}
                      error={!!errors.contact_phone}
                      helperText={errors.contact_phone?.message}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      type="email"
                      value={watch('contact_email') || ''}
                      {...register('contact_email')}
                      error={!!errors.contact_email}
                      helperText={errors.contact_email?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={watch('website') || ''}
                      {...register('website')}
                      error={!!errors.website}
                      helperText={errors.website?.message}
                      placeholder="https://example.com"
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Seating Sections */}
              {activeStep === 2 && hasSeating && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Seating Sections
                      </Typography>
                      <Button
                        startIcon={<Add />}
                        variant="contained"
                        size="small"
                        onClick={handleAddSection}
                      >
                        Add Section
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
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
                                        borderRadius: '50%',
                                        backgroundColor: section.color_code,
                                      }}
                                    />
                                    {section.section_name}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">{section.total_seats}</TableCell>
                                <TableCell align="right">{section.base_price}</TableCell>
                                <TableCell>{section.description || '-'}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditSection(index)}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteSection(index)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Alert severity="info" sx={{ mt: 2 }}>
                        Total Seats: <strong>{totalSeats}</strong> | Total Capacity: <strong>{formValues.capacity}</strong>
                        {totalSeats > formValues.capacity && (
                          <Box sx={{ color: 'error.main', mt: 1 }}>
                            ⚠️ Section seats exceed venue capacity!
                          </Box>
                        )}
                      </Alert>
                    </Grid>
                  )}

                  {sections.length === 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        Click "Add Section" to define seating sections and base pricing
                      </Alert>
                    </Grid>
                  )}
                </>
              )}

              {/* STEP 3: Amenities */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Amenities & Features
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Venue Image
                    </Typography>
                    <Paper sx={{ p: 3, textAlign: 'center', border: '2px dashed #ccc' }}>
                      {venueImageUrl ? (
                        <Box>
                          <img src={venueImageUrl} alt="Venue" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', mb: 2 }} />
                          <Box sx={{ mt: 2 }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e.target.files?.[0])}
                              style={{ display: 'none' }}
                              id="venue-image-input"
                            />
                            <Button
                              variant="outlined"
                              component="label"
                              htmlFor="venue-image-input"
                              disabled={imageUploading}
                            >
                              {imageUploading ? <CircularProgress size={20} /> : 'Change Image'}
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                            Upload a venue image for display
                          </Typography>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files?.[0])}
                            style={{ display: 'none' }}
                            id="venue-image-input-main"
                          />
                          <Button
                            variant="contained"
                            component="label"
                            htmlFor="venue-image-input-main"
                            disabled={imageUploading}
                          >
                            {imageUploading ? <CircularProgress size={20} /> : 'Upload Image'}
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Features
                    </Typography>
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

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Checkbox {...register('has_accessibility')} />}
                      label="Accessible"
                    />
                  </Grid>
                </>
              )}

              {/* STEP 4: Preview */}
              {activeStep === 4 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Review & Confirm
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {venueImageUrl && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, textAlign: 'center', mb: 2 }}>
                        <img src={venueImageUrl} alt="Venue Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Venue Name
                      </Typography>
                      <Typography variant="body2">{formValues.name}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Type
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {formValues.venue_type}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Total Capacity
                      </Typography>
                      <Typography variant="body2">{formValues.capacity}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Location
                      </Typography>
                      <Typography variant="body2">
                        {formValues.city}, {formValues.state}, {formValues.country}
                      </Typography>
                    </Paper>
                  </Grid>

                  {hasSeating && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Seating Sections ({sections.length})
                        </Typography>
                        {sections.map((s, i) => (
                          <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                            • {s.section_name}: {s.total_seats} seats @ KES {s.base_price}
                          </Typography>
                        ))}
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert severity="success">
                      ✓ All venue details are correct. Click Create to save.
                    </Alert>
                  </Grid>
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    type="button"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/venues')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Create Venue'}
                      </Button>
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

export default VenueCreationForm;
