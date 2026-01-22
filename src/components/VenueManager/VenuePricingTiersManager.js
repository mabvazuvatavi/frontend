import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VenuePricingTiersManager = ({ venue }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    color: '#3498DB',
    description: '',
  });

  // Predefined tier templates by venue type
  const tierTemplates = {
    stadium: [
      { name: 'General', price: 50, color: '#3498DB', description: 'General Admission' },
      { name: 'Bay', price: 100, color: '#F39C12', description: 'Bay Seating' },
      { name: 'Suite', price: 250, color: '#E74C3C', description: 'Premium Suite' },
      { name: 'VVIP', price: 500, color: '#9B59B6', description: 'VIP Premium' },
    ],
    sports_complex: [
      { name: 'General', price: 50, color: '#3498DB', description: 'General Admission' },
      { name: 'Bay', price: 100, color: '#F39C12', description: 'Bay Seating' },
      { name: 'Suite', price: 250, color: '#E74C3C', description: 'Premium Suite' },
      { name: 'VVIP', price: 500, color: '#9B59B6', description: 'VIP Premium' },
    ],
    theater: [
      { name: 'Stalls', price: 75, color: '#2196F3', description: 'Ground Floor' },
      { name: 'Circle', price: 50, color: '#FFD700', description: 'First Balcony' },
      { name: 'Balcony', price: 30, color: '#FF9800', description: 'Upper Level' },
      { name: 'Box', price: 120, color: '#FF1493', description: 'Private Box' },
    ],
    concert_hall: [
      { name: 'Stalls', price: 75, color: '#2196F3', description: 'Ground Floor' },
      { name: 'Circle', price: 50, color: '#FFD700', description: 'First Balcony' },
      { name: 'Balcony', price: 30, color: '#FF9800', description: 'Upper Level' },
      { name: 'Box', price: 120, color: '#FF1493', description: 'Private Box' },
    ],
    arena: [
      { name: 'Floor', price: 150, color: '#E91E63', description: 'Floor Seating' },
      { name: 'Lower Bowl', price: 100, color: '#2196F3', description: 'Lower Level' },
      { name: 'Upper Bowl', price: 50, color: '#00BCD4', description: 'Upper Level' },
      { name: 'Club Level', price: 250, color: '#FFD700', description: 'Club Premium' },
    ],
    default: [
      { name: 'Standard', price: 100, color: '#3498DB', description: 'Standard Seating' },
      { name: 'Premium', price: 200, color: '#E74C3C', description: 'Premium Seating' },
      { name: 'VIP', price: 300, color: '#9B59B6', description: 'VIP Seating' },
    ],
  };

  useEffect(() => {
    if (venue?.id) {
      fetchPricingTiers();
    }
  }, [venue?.id]);

  const fetchPricingTiers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/seats/venue/${venue.id}/pricing-tiers`);
      
      if (response.ok) {
        const data = await response.json();
        setTiers(data.data.pricingTiers || []);
      } else {
        console.error('Failed to fetch tiers:', response.status);
      }
    } catch (error) {
      console.error('Fetch pricing tiers error:', error);
      toast.error('Failed to load pricing tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tier = null) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        name: tier.name,
        price: tier.price,
        color: tier.color || '#3498DB',
        description: tier.description || '',
      });
    } else {
      setEditingTier(null);
      setFormData({
        name: '',
        price: '',
        color: '#3498DB',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTier(null);
    setFormData({
      name: '',
      price: '',
      color: '#3498DB',
      description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || '' : value,
    }));
  };

  const handleSaveTiers = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create updated tiers list
      let updatedTiers;
      if (editingTier) {
        updatedTiers = tiers.map(tier =>
          tier.id === editingTier.id
            ? { ...tier, ...formData }
            : tier
        );
      } else {
        updatedTiers = [...tiers, { ...formData, id: Date.now().toString() }];
      }

      // Save to backend
      const response = await apiRequest(
        `${API_BASE_URL}/seats/venue/${venue.id}/pricing-tiers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tiers: updatedTiers }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTiers(data.data.pricingTiers || updatedTiers);
        handleCloseDialog();
        toast.success(editingTier ? 'Tier updated successfully' : 'Tier added successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save tier');
      }
    } catch (error) {
      console.error('Save tier error:', error);
      toast.error('Failed to save tier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTier = async (tier) => {
    if (!window.confirm(`Delete tier "${tier.name}"?`)) return;

    try {
      setLoading(true);
      const updatedTiers = tiers.filter(t => t.id !== tier.id);

      const response = await apiRequest(
        `${API_BASE_URL}/seats/venue/${venue.id}/pricing-tiers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tiers: updatedTiers }),
        }
      );

      if (response.ok) {
        setTiers(updatedTiers);
        toast.success('Tier deleted successfully');
      } else {
        toast.error('Failed to delete tier');
      }
    } catch (error) {
      console.error('Delete tier error:', error);
      toast.error('Failed to delete tier');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (templateName) => {
    const template = tierTemplates[templateName] || tierTemplates.default;
    
    // Confirm before overwriting
    if (tiers.length > 0 && !window.confirm('This will replace all existing tiers. Continue?')) {
      return;
    }

    handleSaveTemplateToBackend(template);
  };

  const handleSaveTemplateToBackend = async (template) => {
    try {
      setLoading(true);

      const response = await apiRequest(
        `${API_BASE_URL}/seats/venue/${venue.id}/pricing-tiers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tiers: template }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTiers(data.data.pricingTiers || template);
        toast.success('Template applied successfully');
      } else {
        toast.error('Failed to apply template');
      }
    } catch (error) {
      console.error('Apply template error:', error);
      toast.error('Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateForVenueType = () => {
    return tierTemplates[venue?.venue_type] || tierTemplates.default;
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>💡 Pricing Tiers are inherited by all events at your venue.</strong>
        </Typography>
        <Typography variant="body2">
          Define your venue's tier structure once, and all organizers who create events here will use these tiers. Organizers can customize prices for their specific events if needed.
        </Typography>
      </Alert>

      {/* Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Quick Templates */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Quick Templates" />
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(tierTemplates).map(([templateName, template]) => (
                  <Button
                    key={templateName}
                    variant="outlined"
                    size="small"
                    onClick={() => handleApplyTemplate(templateName)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {templateName === 'default' ? 'Standard' : templateName.replace('_', ' ')}
                  </Button>
                ))}
              </Stack>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                ℹ️ Current venue type: <strong>{venue?.venue_type || 'Default'}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tiers Table */}
      <Card>
        <CardHeader
          title="Venue Pricing Tiers"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Add Tier
            </Button>
          }
        />
        <CardContent>
          {tiers.length === 0 ? (
            <Alert severity="warning">
              No pricing tiers defined yet. Click "Add Tier" or use a template to get started.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Tier Name</strong></TableCell>
                    <TableCell align="right"><strong>Price (KES)</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="center"><strong>Color</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tiers.map((tier) => (
                    <TableRow key={tier.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {tier.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          KES {parseFloat(tier.price).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {tier.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: tier.color,
                            borderRadius: 1,
                            border: '1px solid #ccc',
                            mx: 'auto',
                          }}
                          title={tier.color}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(tier)}
                          disabled={loading}
                          title="Edit"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTier(tier)}
                          disabled={loading}
                          color="error"
                          title="Delete"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTier ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Tier Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Stalls, Premium, VIP"
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Price (KES)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            sx={{ mb: 2 }}
            required
            inputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Ground Floor Seating"
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                '#3498DB', '#E74C3C', '#F39C12', '#9B59B6',
                '#1ABC9C', '#2ECC71', '#E91E63', '#FF5722',
                '#2196F3', '#00BCD4', '#FFD700', '#FF1493',
              ].map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid black' : '1px solid #ccc',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveTiers}
            variant="contained"
            disabled={loading || !formData.name || !formData.price}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VenuePricingTiersManager;
