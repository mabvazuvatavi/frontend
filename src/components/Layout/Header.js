import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Calendar,
  Bus,
  Hotel,
  Plane,
  Ticket,
  Building2,
  Plus,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Store,
  Zap,
  Menu as MenuIcon,
  ShoppingCart,
  MoreVertical,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestCart } from '../../context/GuestCartContext';
import logo from '../../assets/shashapass.png';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { guestCart } = useGuestCart();

  const guestCartItemCount = guestCart?.items?.length || 0;
  const totalCartCount = (isAuthenticated() ? cartCount : guestCartItemCount) || 0;

  // State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [eventMenuAnchorEl, setEventMenuAnchorEl] = useState(null);

  // Public menu for unauthenticated users
  const publicMenu = [
    { label: 'Events', icon: Calendar, path: '/events' },
    { label: 'Hotels', icon: Hotel, path: '/hotels' },
    { label: 'Flights', icon: Plane, path: '/flights' },
    { label: 'Buses', icon: Bus, path: '/buses' },
  ];

  // Get role-based menu items
  const getRoleMenuItems = () => {
    if (!isAuthenticated()) return [];

    switch (user?.role) {
      case 'organizer':
        return [
          { label: 'My Events', icon: Calendar, path: '/organizer' },
          { label: 'Analytics', icon: BarChart3, path: '/organizer#analytics' },
          { label: 'Check-in', icon: Zap, path: '/checkin' },
          { label: 'Tickets', icon: Ticket, path: '/ticket-templates' },
        ];
      case 'venue_manager':
        return [
          { label: 'My Venues', icon: Building2, path: '/venue-manager' },
          { label: 'Analytics', icon: BarChart3, path: '/venue-manager#analytics' },
          { label: 'Bookings', icon: Calendar, path: '/venue-manager#bookings' },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', icon: BarChart3, path: '/admin' },
          { label: 'Event Approvals', icon: Zap, path: '/admin/event-approvals' },
          { label: 'Users', icon: Users, path: '/admin/users' },
          { label: 'Vendors', icon: Store, path: '/admin/vendors/approvals' },
          { label: 'Settings', icon: Settings, path: '/admin/settings' },
        ];
      case 'vendor':
        return [
          { label: 'My Business', icon: Store, path: '/vendor/dashboard' },
          { label: 'Products', icon: BarChart3, path: '/vendor/dashboard#products' },
          { label: 'Orders', icon: ShoppingCart, path: '/vendor/dashboard#orders' },
        ];
      case 'customer':
      default:
        return [
          { label: 'My Tickets', icon: Ticket, path: '/tickets' },
          { label: 'Season Passes', icon: Calendar, path: '/seasonal-tickets' },
        ];
    }
  };

  const displayMenu = isAuthenticated() ? getRoleMenuItems() : publicMenu;

  // Handlers
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfileOpen = (e) => setProfileAnchorEl(e.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleProfileClose();
    navigate('/');
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMenuClose();
    setMobileDrawerOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar sx={{ gap: 2, justifyContent: 'space-between' }}>
        {/* Logo */}
        <Typography
          component={Link}
          to={
            isAuthenticated()
              ? user?.role === 'admin'
                ? '/admin'
                : user?.role === 'organizer'
                ? '/organizer'
                : user?.role === 'venue_manager'
                ? '/venue-manager'
                : '/dashboard'
              : '/'
          }
          variant="h6"
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 'fit-content',
          }}
        >
          <img
            src={logo}
            alt="ShashaPass Logo"
            style={{
              height: 100,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Typography>

        {/* Desktop Navigation - Centered */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, flex: 1, justifyContent: 'center' }}>
          {displayMenu.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                color="inherit"
                startIcon={<Icon size={18} />}
                component={Link}
                to={item.path}
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

        {/* Create Event Button - Admin & Organizer Only */}
        {isAuthenticated() && (user?.role === 'admin' || user?.role === 'organizer') && (
          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            component={Link}
            to="/events/create"
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            Create Event
          </Button>
        )}

        {/* Add Venue Button - Admin & Venue Manager Only */}
        {isAuthenticated() && (user?.role === 'admin' || user?.role === 'venue_manager') && (
          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            component={Link}
            to="/venues/create"
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            Add Venue
          </Button>
        )}

        {/* Cart Icon */}
        <IconButton
          onClick={() => navigate('/checkout')}
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <Badge badgeContent={totalCartCount} color="secondary">
            <ShoppingCart size={22} />
          </Badge>
        </IconButton>

        {/* Profile Section */}
        {isAuthenticated() ? (
          <>
            <IconButton
              onClick={handleProfileOpen}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                }}
              >
                {user?.first_name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              PaperProps={{
                sx: {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  border: 1,
                  borderColor: 'divider',
                  minWidth: 200,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <MenuItem disabled sx={{ py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleProfileClose}
              >
                Profile
              </MenuItem>
              <MenuItem
                component={Link}
                to="/settings"
                onClick={handleProfileClose}
              >
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogOut size={18} style={{ marginRight: 8 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/login"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            Login
          </Button>
        )}

        {/* Mobile Menu Button */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon size={24} />
        </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            width: '100%',
            maxWidth: 300,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {/* Navigation Items */}
        {displayMenu.map((item) => {
          const Icon = item.icon;
          return (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleMenuClose}
              sx={{
                display: 'flex',
                gap: 1,
                py: 1.2,
              }}
            >
              <Icon size={18} />
              <Typography>{item.label}</Typography>
            </MenuItem>
          );
        })}

        {displayMenu.length > 0 && <Divider />}

        {/* Create Event - Mobile */}
        {isAuthenticated() && (user?.role === 'admin' || user?.role === 'organizer') && (
          <MenuItem
            component={Link}
            to="/events/create"
            onClick={handleMenuClose}
            sx={{ display: 'flex', gap: 1, py: 1.2 }}
          >
            <Plus size={18} />
            <Typography>Create Event</Typography>
          </MenuItem>
        )}

        {/* Add Venue - Mobile */}
        {isAuthenticated() && (user?.role === 'admin' || user?.role === 'venue_manager') && (
          <MenuItem
            component={Link}
            to="/venues/create"
            onClick={handleMenuClose}
            sx={{ display: 'flex', gap: 1, py: 1.2 }}
          >
            <Plus size={18} />
            <Typography>Add Venue</Typography>
          </MenuItem>
        )}

        {/* Cart - Mobile */}
        <MenuItem
          component={Link}
          to="/checkout"
          onClick={handleMenuClose}
          sx={{ display: 'flex', gap: 1, py: 1.2 }}
        >
          <Badge badgeContent={totalCartCount} color="secondary" sx={{ mr: 1 }}>
            <ShoppingCart size={20} />
          </Badge>
          <Typography>Cart</Typography>
        </MenuItem>

        {/* Login - Mobile */}
        {!isAuthenticated() && (
          <>
            <Divider />
            <MenuItem
              component={Link}
              to="/login"
              onClick={handleMenuClose}
              sx={{ display: 'flex', gap: 1, py: 1.2 }}
            >
              <Typography>Login</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Header;