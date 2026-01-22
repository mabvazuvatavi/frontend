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
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  DirectionsBus,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BUS_TYPES = ['standard', 'deluxe', 'vip', 'sleeper'];
const AMENITIES_OPTIONS = ['WiFi', 'AC', 'Charging Ports', 'TV', 'Toilet', 'Food Service'];

const ManageBusesPage = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    bus_name: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    total_seats: '',
    price_per_seat: '',
    bus_type: 'standard',
    amenities: [],
    operator_contact: '',
    operator_phone: '',
  });

  // Authorization check
  useEffect(() => {
    if (user && !['admin', 'organizer'].includes(user.role)) {
      toast.error('Unauthorized access');
      window.location.href = '/';
    }
  }, [user]);

  const fetchBuses = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest(
        `${API_BASE_URL}/buses?page=${pageNum}&limit=10`
      );
      if (!response.ok) throw new Error('Failed to fetch buses');

      const data = await response.json();
      // Filter only buses created by current user (unless admin)
      const userBuses = user?.role === 'admin'
        ? data.data
        : data.data.filter(bus => bus.created_by === user?.id);

      setBuses(userBuses);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch buses');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses(page);
  }, [page]);

  const handleOpenDialog = (bus = null) => {
    if (bus) {
      setEditingId(bus.id);
      setFormData({
        bus_name: bus.bus_name,
        origin: bus.origin,
        destination: bus.destination,
        departure_time: bus.departure_time?.split('T')[0] + 'T' + bus.departure_time?.split('T')[1]?.substring(0, 5) || '',
        arrival_time: bus.arrival_time?.split('T')[0] + 'T' + bus.arrival_time?.split('T')[1]?.substring(0, 5) || '',
        total_seats: bus.total_seats,
        price_per_seat: bus.price_per_seat,
        bus_type: bus.bus_type,
        amenities: bus.amenities ? JSON.parse(bus.amenities) : [],
        operator_contact: bus.operator_contact || '',
        operator_phone: bus.operator_phone || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        bus_name: '',
        origin: '',
        destination: '',
        departure_time: '',
        arrival_time: '',
        total_seats: '',
        price_per_seat: '',
        bus_type: 'standard',
        amenities: [],
        operator_contact: '',
        operator_phone: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAmenityChange = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  const handleSaveBus = async () => {
    // Validation
    if (!formData.bus_name || !formData.origin || !formData.destination ||
        !formData.departure_time || !formData.total_seats || !formData.price_per_seat) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        total_seats: parseInt(formData.total_seats),
        available_seats: editingId ? undefined : parseInt(formData.total_seats),
        price_per_seat: parseFloat(formData.price_per_seat),
        amenities: formData.amenities,
      };

      const url = editingId
        ? `${API_BASE_URL}/buses/${editingId}`
        : `${API_BASE_URL}/buses`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingId ? 'update' : 'create'} bus`);
      }

      toast.success(`Bus ${editingId ? 'updated' : 'created'} successfully`);
      handleCloseDialog();
      fetchBuses(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      const response = await apiRequest(`${API_BASE_URL}/buses/${busId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete bus');

      toast.success('Bus deleted successfully');
      fetchBuses(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Manage Buses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add, edit, and manage bus inventory for your routes
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add New Bus
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Buses Table */}
        {!loading && buses.length > 0 && (
          <>
            <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bus Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Route</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departure</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Seats</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buses.map((bus) => (
                    <TableRow key={bus.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{bus.bus_name}</TableCell>
                      <TableCell>
                        {bus.origin} → {bus.destination}
                      </TableCell>
                      <TableCell>{formatDate(bus.departure_time)}</TableCell>
                      <TableCell>
                        <Chip label={bus.bus_type} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {bus.available_seats}/{bus.total_seats}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        KES {bus.price_per_seat.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(bus)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteBus(bus.id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination && pagination.total > pagination.limit && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(pagination.total / pagination.limit)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && buses.length === 0 && !error && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DirectionsBus sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No buses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first bus to start offering routes
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add New Bus
            </Button>
          </Paper>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {editingId ? 'Edit Bus' : 'Add New Bus'}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              {/* Bus Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bus Name"
                  name="bus_name"
                  value={formData.bus_name}
                  onChange={handleFormChange}
                  placeholder="e.g., Express Coach 101"
                />
              </Grid>

              {/* Origin */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleFormChange}
                  placeholder="e.g., Nairobi"
                />
              </Grid>

              {/* Destination */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleFormChange}
                  placeholder="e.g., Mombasa"
                />
              </Grid>

              {/* Departure Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  name="departure_time"
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Arrival Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Arrival Time"
                  name="arrival_time"
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Total Seats */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Seats"
                  name="total_seats"
                  type="number"
                  value={formData.total_seats}
                  onChange={handleFormChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Price per Seat */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price per Seat (KES)"
                  name="price_per_seat"
                  type="number"
                  value={formData.price_per_seat}
                  onChange={handleFormChange}
                  inputProps={{ step: 100, min: 0 }}
                />
              </Grid>

              {/* Bus Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Bus Type</InputLabel>
                  <Select
                    name="bus_type"
                    value={formData.bus_type}
                    onChange={handleFormChange}
                    label="Bus Type"
                  >
                    {BUS_TYPES.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Operator Contact */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Operator Contact Name"
                  name="operator_contact"
                  value={formData.operator_contact}
                  onChange={handleFormChange}
                />
              </Grid>

              {/* Operator Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Operator Phone"
                  name="operator_phone"
                  value={formData.operator_phone}
                  onChange={handleFormChange}
                  placeholder="+254..."
                />
              </Grid>

              {/* Amenities */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Amenities
                </Typography>
                <FormGroup>
                  <Grid container>
                    {AMENITIES_OPTIONS.map(amenity => (
                      <Grid item xs={12} sm={6} key={amenity}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.amenities.includes(amenity)}
                              onChange={() => handleAmenityChange(amenity)}
                            />
                          }
                          label={amenity}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveBus}>
              {editingId ? 'Update' : 'Create'} Bus
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageBusesPage;
