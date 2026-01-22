import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  IconButton,
  Avatar,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ChevronDown,
  ChevronRight,
  X as CloseIcon,
} from 'lucide-react';
import {
  Calendar,
  Bus,
  Hotel,
  Plane,
  LayoutGrid,
  Ticket,
  Building2,
  Plus,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/shashapass.png';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  /* Menu Structure */
  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { label: 'Home', icon: Home, path: '/', key: 'home' },
        { label: 'Events', icon: Calendar, path: '/events', key: 'events' },
        { label: 'Buses', icon: Bus, path: '/buses', key: 'buses' },
        { label: 'Hotels', icon: Hotel, path: '/hotels', key: 'hotels' },
        { label: 'Flights', icon: Plane, path: '/flights', key: 'flights' },
      ]
    },
  ];

  // Admin/Organizer specific menu
  if (isAuthenticated() && user?.role) {
    const adminMenus = {
      title: 'ADMIN',
      items: []
    };

    if (['admin', 'organizer', 'venue_manager'].includes(user.role)) {
      adminMenus.items.push(
        { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard', key: 'dashboard' },
        { label: 'Analytics', icon: BarChart3, path: '/analytics', key: 'analytics' }
      );
    }

    if (user.role === 'organizer') {
      adminMenus.items.push(
        { label: 'My Events', icon: Calendar, path: '/organizer/events', key: 'my-events' },
        { label: 'Create Event', icon: Plus, path: '/organizer/create-event', key: 'create-event' }
      );
    }

    if (user.role === 'admin') {
      adminMenus.items.push(
        { label: 'Users', icon: Users, path: '/admin/users', key: 'users' },
        { label: 'Venues', icon: Building2, path: '/admin/venues', key: 'venues' },
        { label: 'Events', icon: Calendar, path: '/admin/events', key: 'admin-events' }
      );
    }

    if (['admin', 'organizer', 'venue_manager'].includes(user.role)) {
      menuGroups.push(adminMenus);
    }
  }

  // Customer menu
  if (isAuthenticated()) {
    menuGroups.push({
      title: 'ACCOUNT',
      items: [
        { label: 'My Tickets', icon: Ticket, path: '/my-tickets', key: 'my-tickets' },
        { label: 'My Cart', icon: ShoppingCart, path: '/cart', key: 'cart' },
        { label: 'Settings', icon: Settings, path: '/settings', key: 'settings' },
      ]
    });
  }

  const MenuItemComponent = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <ListItemButton
        component={Link}
        to={item.path}
        onClick={() => isMobile && onClose?.()}
        sx={{
          borderRadius: collapsed ? 2 : 1.5,
          mx: collapsed ? 0.5 : 1.5,
          mb: 0.5,
          px: collapsed ? 0.5 : 2,
          py: collapsed ? 1 : 0.8,
          backgroundColor: active ? 'rgba(255, 0, 128, 0.1)' : 'transparent',
          color: active ? '#ff0080' : 'text.primary',
          fontWeight: active ? 600 : 500,
          transition: 'all 0.3s ease',
          justifyContent: collapsed ? 'center' : 'flex-start',
          '&:hover': {
            backgroundColor: active ? 'rgba(255, 0, 128, 0.15)' : 'rgba(0, 0, 0, 0.04)',
            color: active ? '#ff0080' : '#002d68',
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 'auto' : 40,
            justifyContent: 'center',
            color: 'inherit',
          }}
        >
          <Icon size={22} strokeWidth={1.5} />
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 'inherit',
              whiteSpace: 'nowrap',
            }}
          />
        )}
      </ListItemButton>
    );
  };

  const SidebarContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8f9fa',
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: collapsed ? 1 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          {!collapsed && (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <img src={logo} alt="Shashapass" style={{ width: 32, height: 32 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #002d68 0%, #ff0080 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Shashapass
                </Typography>
              </Box>
            </Link>
          )}
          {isMobile && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* User Profile Section */}
        {isAuthenticated() && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 2,
              p: collapsed ? 0 : 1.5,
              backgroundColor: 'white',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#ff0080',
                fontWeight: 700,
                color: 'white',
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            {!collapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#002d68',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email?.split('@')[0]}
                </Typography>
                <Chip
                  label={user?.role?.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: '#ff0080',
                    color: 'white',
                    mt: 0.5,
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: '#999',
            },
          },
        }}
      >
        {menuGroups.map((group, idx) => (
          <Box key={idx}>
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  fontWeight: 700,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '1px',
                  display: 'block',
                }}
              >
                {group.title}
              </Typography>
            )}
            {group.items.map((item) => (
              <MenuItemComponent key={item.key} item={item} />
            ))}
            {idx < menuGroups.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </List>

      <Divider />

      {/* Footer Section */}
      {isAuthenticated() && (
        <Box sx={{ p: collapsed ? 1 : 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: collapsed ? 2 : 1.5,
              mx: collapsed ? 0.5 : 0,
              px: collapsed ? 0.5 : 2,
              py: collapsed ? 1 : 0.8,
              color: '#d32f2f',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                color: '#b71c1c',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 'auto' : 40,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <LogOut size={22} strokeWidth={1.5} />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              />
            )}
          </ListItemButton>
        </Box>
      )}

      {/* Collapse Toggle - Desktop Only */}
      {!isMobile && (
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              width: '100%',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobile ? open : false}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxShadow: 3,
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          left: 0,
          top: 64, // AppBar height
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          height: 'calc(100vh - 64px)',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.3s ease',
          zIndex: 1100,
          backgroundColor: '#f8f9fa',
        }}
      >
        {SidebarContent}
      </Box>
    </>
  );
};

export default Sidebar;
