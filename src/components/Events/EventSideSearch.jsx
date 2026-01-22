import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Search, ExpandMore } from '@mui/icons-material';
import { Filter, MapPin, Calendar, DollarSign } from 'lucide-react';

const EventSideSearch = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onReset,
}) => {
  const eventTypes = ['Concert', 'Conference', 'Sports', 'Theater', 'Comedy', 'Festival'];
  const categories = ['Music', 'Tech', 'Sports', 'Arts', 'Community', 'Business'];

  const handlePriceChange = (event, newValue) => {
    onFilterChange({
      ...filters,
      priceRange: newValue,
    });
  };

  const handleEventTypeChange = (type) => {
    const selected = filters.eventTypes || [];
    const updated = selected.includes(type)
      ? selected.filter(t => t !== type)
      : [...selected, type];
    onFilterChange({
      ...filters,
      eventTypes: updated,
    });
  };

  const handleCategoryChange = (category) => {
    const selected = filters.categories || [];
    const updated = selected.includes(category)
      ? selected.filter(c => c !== category)
      : [...selected, category];
    onFilterChange({
      ...filters,
      categories: updated,
    });
  };

  const handleDateChange = (e) => {
    onFilterChange({
      ...filters,
      date: e.target.value,
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        position: { xs: 'static', md: 'sticky' },
        top: 80,
        height: 'fit-content',
      }}
    >
      {/* Single Search & Filter Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search Section */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Search size={20} color="#002d68" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#002d68' }}>
                Search Events
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Search by name, location..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                },
              }}
            />
          </Box>

          {/* Filters Section */}
          <Box sx={{ p: 2.5 }}>
            {/* Date Filter */}
            <Accordion defaultExpanded sx={{ boxShadow: 'none', border: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, py: 1, minHeight: 'auto' }}>
                <Calendar size={18} color="#002d68" style={{ marginRight: 8 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#002d68' }}>
                  Date
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, py: 1 }}>
                <TextField
                  fullWidth
                  type="date"
                  value={filters.date || ''}
                  onChange={handleDateChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa',
                    },
                  }}
                />
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 1.5 }} />

            {/* Event Type Filter */}
            <Accordion defaultExpanded sx={{ boxShadow: 'none', border: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, py: 1, minHeight: 'auto' }}>
                <Filter size={18} color="#002d68" style={{ marginRight: 8 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#002d68' }}>
                  Event Type
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, py: 1 }}>
                <FormGroup>
                  {eventTypes.map((type) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          size="small"
                          checked={(filters.eventTypes || []).includes(type)}
                          onChange={() => handleEventTypeChange(type)}
                          sx={{
                            color: '#ff0080',
                            '&.Mui-checked': {
                              color: '#ff0080',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {type}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 1.5 }} />

            {/* Category Filter */}
            <Accordion defaultExpanded sx={{ boxShadow: 'none', border: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, py: 1, minHeight: 'auto' }}>
                <MapPin size={18} color="#002d68" style={{ marginRight: 8 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#002d68' }}>
                  Category
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, py: 1 }}>
                <FormGroup>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          size="small"
                          checked={(filters.categories || []).includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          sx={{
                            color: '#ff0080',
                            '&.Mui-checked': {
                              color: '#ff0080',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 1.5 }} />

            {/* Price Range Filter */}
            <Accordion defaultExpanded sx={{ boxShadow: 'none', border: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, py: 1, minHeight: 'auto' }}>
                <DollarSign size={18} color="#002d68" style={{ marginRight: 8 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#002d68' }}>
                  Price Range
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, py: 1 }}>
                <Box sx={{ px: 1, mb: 2 }}>
                  <Slider
                    value={filters.priceRange || [0, 10000]}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                    sx={{
                      color: '#ff0080',
                      '& .MuiSlider-track': {
                        backgroundColor: '#ff0080',
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  KES {filters.priceRange?.[0] || 0} - KES {filters.priceRange?.[1] || 10000}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Active Filters Display */}
          {((filters.eventTypes?.length > 0) || (filters.categories?.length > 0) || filters.date) && (
            <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {(filters.eventTypes || []).map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onDelete={() => handleEventTypeChange(type)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 0, 128, 0.1)',
                      color: '#ff0080',
                      fontWeight: 600,
                    }}
                  />
                ))}
                {(filters.categories || []).map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onDelete={() => handleCategoryChange(category)}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 45, 104, 0.1)',
                      color: '#002d68',
                      fontWeight: 600,
                    }}
                  />
                ))}
                {filters.date && (
                  <Chip
                    label={`Date: ${filters.date}`}
                    onDelete={() => handleDateChange({ target: { value: '' } })}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 45, 104, 0.1)',
                      color: '#002d68',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Reset Button */}
          {((filters.eventTypes?.length > 0) ||
            (filters.categories?.length > 0) ||
            filters.date ||
            searchTerm) && (
            <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={onReset}
                sx={{
                  borderColor: '#ff0080',
                  color: '#ff0080',
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 128, 0.08)',
                    borderColor: '#ff0080',
                  },
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventSideSearch;
