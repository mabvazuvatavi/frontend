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
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EventPricingTierCustomizer = ({ eventId, venuePricingTiers, onSave }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [customTiers, setCustomTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTierId, setEditingTierId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Initialize with venue tiers as base
    if (venuePricingTiers && venuePricingTiers.length > 0) {
      setCustomTiers(venuePricingTiers.map(tier => ({
        ...tier,
        originalPrice: tier.price,
        isModified: false,
      })));
    }
  }, [venuePricingTiers]);

  const handleEditPrice = (tier) => {
    setEditingTierId(tier.id);
    setEditPrice(tier.price);
    setOpenDialog(true);
  };

  const handleSavePrice = () => {
    if (!editPrice || isNaN(editPrice)) {
      toast.error('Please enter a valid price');
      return;
    }

    const updatedTiers = customTiers.map(tier =>
      tier.id === editingTierId
        ? {
            ...tier,
            price: parseFloat(editPrice),
            isModified: parseFloat(editPrice) !== parseFloat(tier.originalPrice),
          }
        : tier
    );

    setCustomTiers(updatedTiers);
    setOpenDialog(false);
    setEditingTierId(null);
    toast.success('Price updated');
  };

  const handleResetTier = (tierId) => {
    if (!window.confirm('Reset this tier to venue default price?')) return;

    const updatedTiers = customTiers.map(tier =>
      tier.id === tierId
        ? { ...tier, price: tier.originalPrice, isModified: false }
        : tier
    );

    setCustomTiers(updatedTiers);
    toast.success('Tier reset to default');
  };

  const handleSaveCustomization = async () => {
    if (!eventId) {
      toast.error('Event ID is required');
      return;
    }

    // Only send modified tiers
    const modifiedTiers = customTiers.filter(tier => tier.isModified);

    if (modifiedTiers.length === 0) {
      toast.info('No price modifications to save');
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(
        `${API_BASE_URL}/seats/event/${eventId}/pricing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tiers: customTiers.map(tier => ({
              id: tier.id,
              name: tier.name,
              price: parseFloat(tier.price),
              color: tier.color,
              description: tier.description,
            })),
          }),
        }
      );

      if (response.ok) {
        toast.success('Event pricing tiers customized successfully');
        if (onSave) onSave(customTiers);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save pricing customization');
      }
    } catch (error) {
      console.error('Save customization error:', error);
      toast.error('Failed to save pricing customization');
    } finally {
      setLoading(false);
    }
  };

  if (!customTiers || customTiers.length === 0) {
    return (
      <Alert severity="info">
        No pricing tiers available. Ensure your venue has pricing tiers defined by the venue manager.
      </Alert>
    );
  }

  const hasModifications = customTiers.some(tier => tier.isModified);

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Customize Event Pricing (Optional)"
        subheader="Modify tier prices for this specific event. Leave unchanged to use venue defaults."
      />
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          💡 You can customize pricing for your specific event. For example, charge more for premium artists or less for off-peak times.
          All changes are only for this event. Venue defaults remain unchanged.
        </Alert>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Tier</strong></TableCell>
                <TableCell align="right"><strong>Venue Default</strong></TableCell>
                <TableCell align="right"><strong>Your Event Price</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customTiers.map((tier) => (
                <TableRow key={tier.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: tier.color,
                          borderRadius: '50%',
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {tier.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      KES {parseFloat(tier.originalPrice).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: tier.isModified ? 'bold' : 'normal',
                        color: tier.isModified ? '#F39C12' : 'inherit',
                      }}
                    >
                      KES {parseFloat(tier.price).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {tier.isModified ? (
                      <Chip
                        label="Modified"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label="Default"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditPrice(tier)}
                      disabled={loading}
                      title="Edit Price"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    {tier.isModified && (
                      <IconButton
                        size="small"
                        onClick={() => handleResetTier(tier.id)}
                        disabled={loading}
                        color="warning"
                        title="Reset to Default"
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleSaveCustomization}
            disabled={loading || !hasModifications}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Saving...' : 'Save Customization'}
          </Button>
          {hasModifications && (
            <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
              You have unsaved changes
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Price Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Price - {customTiers.find(t => t.id === editingTierId)?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Price (KES)"
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Venue default: KES {parseFloat(
              customTiers.find(t => t.id === editingTierId)?.originalPrice || 0
            ).toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePrice} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EventPricingTierCustomizer;
