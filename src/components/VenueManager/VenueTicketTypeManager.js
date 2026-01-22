import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VenueTicketTypeManager = ({ venueId, venueData, onSave }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  
  const [ticketTypes, setTicketTypes] = useState([]);
  const [editingType, setEditingType] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing ticket types
  useEffect(() => {
    if (venueId) {
      loadTicketTypes();
    }
  }, [venueId]);

  const loadTicketTypes = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/venue-seat-types/venues/${venueId}/seat-types`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTicketTypes(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load ticket types:', error);
    }
  };

  const saveTicketTypes = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${API_BASE_URL}/venue-seat-types/venues/${venueId}/seat-types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_types: ticketTypes }),
      });
      
      if (response.ok) {
        toast.success('Ticket types saved successfully!');
        if (onSave) onSave(ticketTypes);
      } else {
        throw new Error('Failed to save ticket types');
      }
    } catch (error) {
      console.error('Failed to save ticket types:', error);
      toast.error('Failed to save ticket types');
    } finally {
      setLoading(false);
    }
  };

  const addTicketType = () => {
    setEditingType({
      name: '',
      type: 'standard',
      price: 50,
      color: '#2196F3',
      description: '',
      sections: []
    });
    setIsDialogOpen(true);
  };

  const editTicketType = (type) => {
    setEditingType({ ...type });
    setIsDialogOpen(true);
  };

  const deleteTicketType = (typeId) => {
    setTicketTypes(prev => prev.filter(t => t.id !== typeId));
  };

  const saveTicketType = () => {
    if (!editingType.name.trim()) {
      toast.error('Ticket type name is required');
      return;
    }

    if (editingType.id) {
      // Update existing
      setTicketTypes(prev => prev.map(t => 
        t.id === editingType.id ? editingType : t
      ));
    } else {
      // Add new
      const newType = {
        ...editingType,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setTicketTypes(prev => [...prev, newType]);
    }

    setIsDialogOpen(false);
    setEditingType(null);
  };

  const addSection = () => {
    setEditingType(prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: Date.now().toString(),
        name: `Section ${prev.sections.length + 1}`,
        rows: 10,
        seats_per_row: 20,
        price_override: null
      }]
    }));
  };

  const updateSection = (sectionId, field, value) => {
    setEditingType(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }));
  };

  const deleteSection = (sectionId) => {
    setEditingType(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const calculateCapacity = (type) => {
    return type.sections.reduce((total, section) => {
      return total + (section.rows * section.seats_per_row);
    }, 0);
  };

  const predefinedColors = [
    '#2196F3', '#FF1493', '#FFD700', '#4CAF50', '#FF9800', '#9C27B0', '#795548', '#607D8B'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Venue Ticket Types Configuration
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={addTicketType}
            startIcon={<Add />}
          >
            Add Ticket Type
          </Button>
          <Button
            variant="contained"
            onClick={saveTicketTypes}
            disabled={loading}
            startIcon={<Save />}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Box>

      {venueData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Venue:</strong> {venueData.name} • 
            <strong>Capacity:</strong> {venueData.capacity} • 
            <strong>Type:</strong> {venueData.venue_type?.replace('_', ' ')}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {ticketTypes.map((ticketType) => (
          <Grid item xs={12} md={6} key={ticketType.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {ticketType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {ticketType.type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => editTicketType(ticketType)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteTicketType(ticketType.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: ticketType.color,
                      borderRadius: 1,
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {ticketType.description || 'No description'}
                  </Typography>
                  <Typography variant="h6">
                    ${ticketType.price.toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Sections ({ticketType.sections.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {ticketType.sections.map((section) => (
                    <Paper key={section.id} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {section.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {section.rows} rows × {section.seats_per_row} seats = {section.rows * section.seats_per_row} seats
                      </Typography>
                      {section.price_override && (
                        <Typography variant="caption" color="primary">
                          Override Price: ${section.price_override.toFixed(2)}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Total Capacity: {calculateCapacity(ticketType)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Ticket Type Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingType?.id ? 'Edit' : 'Add'} Ticket Type
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ticket Type Name"
                value={editingType?.name || ''}
                onChange={(e) => setEditingType(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editingType?.type || 'standard'}
                  onChange={(e) => setEditingType(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="box">Box</MenuItem>
                  <MenuItem value="balcony">Balcony</MenuItem>
                  <MenuItem value="gallery">Gallery</MenuItem>
                  <MenuItem value="floor">Floor</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Price ($)"
                type="number"
                value={editingType?.price || ''}
                onChange={(e) => setEditingType(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                inputProps={{ step: '0.01', min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={editingType?.description || ''}
                onChange={(e) => setEditingType(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {predefinedColors.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: editingType?.color === color ? 2 : 1,
                      borderColor: editingType?.color === color ? 'primary.main' : 'grey.300'
                    }}
                    onClick={() => setEditingType(prev => ({ ...prev, color }))}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  Sections
                </Typography>
                <Button
                  size="small"
                  onClick={addSection}
                  startIcon={<Add />}
                >
                  Add Section
                </Button>
              </Box>
              
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {editingType?.sections?.map((section, index) => (
                  <Paper key={section.id} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Section Name"
                          value={section.name}
                          onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Rows"
                          value={section.rows}
                          onChange={(e) => updateSection(section.id, 'rows', parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Seats per Row"
                          value={section.seats_per_row}
                          onChange={(e) => updateSection(section.id, 'seats_per_row', parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Price Override ($)"
                          value={section.price_override || ''}
                          onChange={(e) => updateSection(section.id, 'price_override', e.target.value ? parseFloat(e.target.value) : null)}
                          helperText="Optional: Override default price for this section"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <IconButton
                          size="small"
                          onClick={() => deleteSection(section.id)}
                          color="error"
                          sx={{ float: 'right' }}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveTicketType} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VenueTicketTypeManager;
