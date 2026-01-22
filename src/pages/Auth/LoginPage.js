import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo credentials
  const demoCredentials = [
    { label: 'Customer', email: 'james.mwangi@example.com', password: 'password123' },
    { label: 'Organizer', email: 'events@kenyaconventions.co.ke', password: 'password123' },
    { label: 'Venue Manager', email: 'john.kariuki@kicc.co.ke', password: 'password123' },
    { label: 'Admin', email: 'admin@shashapass.co.ke', password: 'password123' },
  ];

  const fromLocation = location.state?.from || null;
  const fromPathname = fromLocation?.pathname || null;
  const fromSearch = fromLocation?.search || '';

  const getDefaultRedirect = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'organizer':
        return '/organizer';
      case 'venue_manager':
        return '/venue-manager';
      case 'vendor':
        return '/vendor/dashboard';
      case 'customer':
      default:
        return '/dashboard';
    }
  };

  // Check if user has access to a specific path based on their role
  const canAccessPath = (path, userRole) => {
    if (!path) return false;
    
    // Role-specific paths that require specific roles
    const roleRestrictedPaths = {
      '/admin': ['admin'],
      '/organizer': ['organizer', 'admin'],
      '/venue-manager': ['venue_manager', 'admin'],
      '/vendor/dashboard': ['vendor'],
    };

    // Check if path starts with any restricted prefix
    for (const [restrictedPath, allowedRoles] of Object.entries(roleRestrictedPaths)) {
      if (path.startsWith(restrictedPath)) {
        return allowedRoles.includes(userRole);
      }
    }

    // For non-restricted paths, allow access
    return true;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle demo credential selection
  const handleDemoCredential = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        const userRole = result.user?.role || 'customer';
        
        // Only use saved 'from' path if user has access to it
        // Otherwise, redirect to their role-appropriate dashboard
        let redirectPath;
        if (fromPathname && canAccessPath(fromPathname, userRole)) {
          redirectPath = `${fromPathname}${fromSearch}`;
        } else {
          redirectPath = getDefaultRedirect(userRole);
        }
        
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Sign In
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Welcome back! Please sign in to your account.
          </Typography>

          {/* Demo Credentials Section */}
          <Box sx={{ width: '100%', mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #b3e5fc' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#0277bd', display: 'block', mb: 1 }}>
              🔒 DEMO CREDENTIALS
            </Typography>
            <Grid container spacing={1}>
              {demoCredentials.map((cred, index) => (
                <Grid item xs={6} sm={6} md={3} key={index}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleDemoCredential(cred.email, cred.password)}
                    sx={{
                      fontSize: '0.7rem',
                      py: 0.5,
                      borderColor: '#0277bd',
                      color: '#0277bd',
                      '&:hover': {
                        bgcolor: '#e1f5fe',
                        borderColor: '#0277bd',
                      },
                    }}
                  >
                    {cred.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
            <Typography variant="caption" sx={{ color: '#555', display: 'block', mt: 1 }}>
              Password for all: <strong>password123</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" variant="body2" color="primary">
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
