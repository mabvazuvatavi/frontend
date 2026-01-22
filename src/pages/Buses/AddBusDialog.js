import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAuth } from '../../context/AuthContext';
import { DateTime } from 'luxon';
import toast from 'react-hot-toast';

const AddBusDialog = ({ open, onClose, onBusAdded }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    bus_name: '',
    origin: '',
    destination: '',
    departure_date: null,
    departure_time: null,
    arrival_date: null,
    arrival_time: null,
    total_seats: 50,
    available_seats: 50,
    price_per_seat: 1000,
    bus_type: 'standard',
    amenities: [],
    operator_contact: '',
    operator_phone: '',
  });

  const amenitiesOptions = ['WiFi', 'AC', 'Charging', 'Water', 'Washroom', 'Meal'];
  const busTypes = ['standard', 'deluxe', 'vip', 'sleeper'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenitiesToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.bus_name || !formData.origin || !formData.destination) {
      setError('Bus name, origin, and destination are required');
      return;
    }

    if (!formData.departure_date || !formData.departure_time) {
      setError('Departure date and time are required');
    }

    if (formData.total_seats <= 0 || formData.price_per_seat <= 0) {
      setError('Seats and price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Combine date and time for departure
      const departureTime = formData.departure_date
        .set({
          hour: formData.departure_time.hour,
          minute: formData.departure_time.minute,
        })
        .toISO();

      // Combine date and time for arrival if provided
      const arrivalTime = formData.arrival_date && formData.arrival_time
        ? formData.arrival_date
          .set({
            hour: formData.arrival_time.hour,
            minute: formData.arrival_time.minute,
          })
          .toISO()
        : null;

      const busData = {
        bus_name: formData.bus_name,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        total_seats: parseInt(formData.total_seats),
        available_seats: parseInt(formData.available_seats || formData.total_seats),
        price_per_seat: parseFloat(formData.price_per_seat),
        bus_type: formData.bus_type,
        amenities: formData.amenities,
        operator_contact: formData.operator_contact,
        operator_phone: formData.operator_phone,
      };

      const data = await apiRequest(`${API_BASE_URL}/buses/manual/add`, {
        method: 'POST',
        body: JSON.stringify(busData),
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to add bus');
      }

      toast.success('Bus added successfully!');
      
      // Reset form
      setFormData({
        bus_name: '',
        origin: '',
        destination: '',
        departure_date: null,
        departure_time: null,
        arrival_date: null,
        arrival_time: null,
        total_seats: 50,
        available_seats: 50,
        price_per_seat: 1000,
        bus_type: 'standard',
        amenities: [],
        operator_contact: '',
        operator_phone: '',
      });

      if (onBusAdded) {
        onBusAdded(data.data);
      }

      onClose();
    } catch (err) {
      console.error('Add bus error:', err);
      setError(err.message || 'Failed to add bus');
      toast.error(err.message || 'Failed to add bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Bus</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <Stack spacing={2}>
            {/* Bus Name */}
            <TextField
              label="Bus Name"
              name="bus_name"
              value={formData.bus_name}
              onChange={handleInputChange}
              fullWidth
              placeholder="e.g., Easy Coach Express"
              size="small"
            />

            {/* Origin and Destination */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Origin City"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="e.g., Nairobi"
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Destination City"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="e.g., Mombasa"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Departure Date and Time */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Departure Date"
                value={formData.departure_date}
                onChange={(value) => handleDateChange('departure_date', value)}
                minDate={DateTime.now()}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <TimePicker
                label="Departure Time"
                value={formData.departure_time}
                onChange={(value) => handleTimeChange('departure_time', value)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>

            {/* Arrival Date and Time (Optional) */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Arrival Date (Optional)"
                value={formData.arrival_date}
                onChange={(value) => handleDateChange('arrival_date', value)}
                minDate={formData.departure_date || DateTime.now()}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <TimePicker
                label="Arrival Time (Optional)"
                value={formData.arrival_time}
                onChange={(value) => handleTimeChange('arrival_time', value)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>

            {/* Seats and Price */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Total Seats"
                  name="total_seats"
                  type="number"
                  value={formData.total_seats}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 1, max: 100 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Price per Seat (KES)"
                  name="price_per_seat"
                  type="number"
                  value={formData.price_per_seat}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 1, step: 100 }}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Bus Type */}
            <FormControl fullWidth size="small">
              <InputLabel>Bus Type</InputLabel>
              <Select
                name="bus_type"
                value={formData.bus_type}
                onChange={handleInputChange}
                label="Bus Type"
              >
                {busTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Amenities */}
            <Box>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.875rem', color: '#666' }}>
                Amenities
              </label>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {amenitiesOptions.map(amenity => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenitiesToggle(amenity)}
                    variant={formData.amenities.includes(amenity) ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: formData.amenities.includes(amenity) ? '#ff0080' : 'transparent',
                      color: formData.amenities.includes(amenity) ? 'white' : 'inherit',
                      borderColor: formData.amenities.includes(amenity) ? '#ff0080' : '#ccc',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Operator Contact */}
            <TextField
              label="Operator Contact Email"
              name="operator_contact"
              type="email"
              value={formData.operator_contact}
              onChange={handleInputChange}
              fullWidth
              placeholder="contact@operator.com"
              size="small"
            />

            {/* Operator Phone */}
            <TextField
              label="Operator Phone"
              name="operator_phone"
              value={formData.operator_phone}
              onChange={handleInputChange}
              fullWidth
              placeholder="+254712345678"
              size="small"
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: '#ff0080', '&:hover': { backgroundColor: '#e6006f' } }}
        >
          {loading ? <CircularProgress size={20} /> : 'Add Bus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBusDialog;
