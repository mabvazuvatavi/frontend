import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Box, TextField, InputAdornment, useTheme } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * ModernDatePicker Component
 * Provides a modern, feature-rich date picker
 * Features:
 * - Calendar popup interface
 * - Keyboard input support
 * - Date validation
 * - Responsive design
 * - Customizable min/max dates
 * - Material-UI styling
 */
export const ModernDatePickerField = ({
  label,
  value,
  onChange,
  minDate = null,
  maxDate = null,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  required = false,
  name = '',
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Custom styles for the date picker - fixed z-index and overflow issues
  const customStyles = `
    .react-datepicker-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    .react-datepicker__input-container {
      position: relative;
      width: 100%;
    }

    .react-datepicker-popper {
      z-index: 1401 !important;
      position: absolute !important;
    }

    .react-datepicker {
      border: 1px solid ${theme.palette.divider};
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      font-family: ${theme.typography.fontFamily};
      background-color: ${theme.palette.background.paper};
      position: relative;
      z-index: 1401;
    }

    .react-datepicker__header {
      background-color: ${theme.palette.primary.main};
      border-bottom: 2px solid ${theme.palette.primary.dark};
      border-radius: 7px 7px 0 0;
      padding: 1rem 0.75rem;
    }

    .react-datepicker__day-name {
      color: ${theme.palette.primary.contrastText};
      font-weight: 600;
      width: 2.5rem;
      line-height: 2.5rem;
    }

    .react-datepicker__current-month {
      color: ${theme.palette.primary.contrastText};
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .react-datepicker__month {
      margin: 0.5rem;
    }

    .react-datepicker__week {
      display: flex;
      justify-content: center;
    }

    .react-datepicker__day {
      color: ${theme.palette.text.primary};
      transition: all 0.15s ease;
      width: 2.5rem;
      line-height: 2.5rem;
      border-radius: 4px;
      margin: 2px;
    }

    .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
      background-color: ${theme.palette.primary.light};
      color: ${theme.palette.primary.contrastText};
      transform: scale(1.05);
    }

    .react-datepicker__day--selected {
      background-color: ${theme.palette.primary.main} !important;
      color: ${theme.palette.primary.contrastText};
      border-radius: 4px;
      font-weight: 600;
    }

    .react-datepicker__day--keyboard-selected {
      background-color: ${theme.palette.action.hover};
    }

    .react-datepicker__day--today {
      font-weight: 600;
      color: ${theme.palette.primary.main};
      border: 1px solid ${theme.palette.primary.main};
    }

    .react-datepicker__day--disabled {
      color: ${theme.palette.action.disabled};
      cursor: not-allowed;
      background-color: transparent;
    }

    .react-datepicker__navigation {
      background: none;
      border: none;
      padding: 0.5rem;
      top: 0.75rem;
      line-height: 1.7;
    }

    .react-datepicker__navigation-icon::before {
      border-color: ${theme.palette.primary.contrastText};
      border-width: 2px 2px 0 0;
    }

    .react-datepicker__navigation--previous {
      left: 0.75rem;
    }

    .react-datepicker__navigation--next {
      right: 0.75rem;
    }

    .react-datepicker__navigation:hover {
      opacity: 0.7;
    }

    .react-datepicker__month-dropdown-container,
    .react-datepicker__year-dropdown-container {
      margin: 0 0.5rem;
    }

    .react-datepicker__month-option,
    .react-datepicker__year-option {
      padding: 0.5rem;
      border-radius: 4px;
    }

    .react-datepicker__month-option:hover,
    .react-datepicker__year-option:hover {
      background-color: ${theme.palette.primary.light};
    }

    .react-datepicker__month-option--selected,
    .react-datepicker__year-option--selected {
      background-color: ${theme.palette.primary.main};
      color: ${theme.palette.primary.contrastText};
    }
  `;

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative', zIndex: 1 }}>
      <style>{customStyles}</style>
      <DatePicker
        selected={value}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
        customInput={
          <TextField
            label={label}
            fullWidth={fullWidth}
            error={error}
            helperText={helperText}
            required={required}
            name={name}
            value={formatDateForDisplay(value)}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarIcon
                    sx={{
                      cursor: 'pointer',
                      color: error ? 'error.main' : 'text.secondary',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                  />
                </InputAdornment>
              ),
            }}
          />
        }
        popperPlacement="bottom-start"
        dateFormat="yyyy-MM-dd"
        isClearable={false}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        portalId="root"
      />
    </Box>
  );
};

export default ModernDatePickerField;
