import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Divider,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Groups,
  Event,
  LocationOn,
  Payment,
  Security,
  Support,
  TrendingUp,
  Star,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AboutUsPage = () => {
  const theme = useTheme();

  const stats = [
    { label: 'Events Hosted', value: '10,000+', icon: <Event /> },
    { label: 'Active Users', value: '50,000+', icon: <Groups /> },
    { label: 'Partner Venues', value: '500+', icon: <LocationOn /> },
    { label: 'Transactions', value: '1M+', icon: <Payment /> },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly push the boundaries of event technology to deliver cutting-edge solutions.',
      icon: <TrendingUp />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Security',
      description: 'Your data and transactions are protected with enterprise-grade security measures.',
      icon: <Security />,
      color: theme.palette.success.main,
    },
    {
      title: 'Support',
      description: 'Our dedicated team is here to help you 24/7 with any questions or concerns.',
      icon: <Support />,
      color: theme.palette.info.main,
    },
  ];

  const features = [
    'Seamless ticket purchasing experience',
    'Advanced NFC technology for event entry',
    'Multi-gateway payment processing',
    'Real-time event analytics',
    'Mobile-first design',
    'Comprehensive vendor management',
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'SJ',
      description: 'Visionary leader with 15+ years in event technology.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      avatar: 'MC',
      description: 'Tech expert specializing in scalable event platforms.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Operations',
      avatar: 'ER',
      description: 'Operations guru ensuring smooth event execution.',
    },
    {
      name: 'David Kim',
      role: 'Head of Customer Success',
      avatar: 'DK',
      description: 'Customer advocate dedicated to user satisfaction.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h2"
                  fontWeight={800}
                  gutterBottom
                  sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
                >
                  Revolutionizing Event Management
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={300}
                  sx={{ mb: 4, lineHeight: 1.6 }}
                >
                  ShashaPass is your complete event management platform, connecting organizers, venues, and attendees through innovative technology.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/events"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.9),
                    },
                  }}
                >
                  Explore Events
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="/api/placeholder/600/400"
                  alt="Event Management Platform"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Founded in 2020, ShashaPass emerged from a simple idea: make event management seamless for everyone involved. We noticed the friction between event organizers, venues, and attendees, and set out to create a unified platform that addresses all their needs.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Today, we're proud to serve thousands of events worldwide, from intimate local gatherings to large-scale international conferences. Our platform continues to evolve, incorporating cutting-edge technology like NFC ticketing, virtual events, and advanced analytics.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Our mission is to democratize event management, making professional-grade tools accessible to organizers of all sizes while ensuring exceptional experiences for attendees.
              </Typography>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="h4" fontWeight={600} gutterBottom color="primary.main">
                  Why Choose ShashaPass?
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {features.map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 2, fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Values Section */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Our Core Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: value.color,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {value.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {value.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          textAlign="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Meet Our Leadership Team
        </Typography>
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    textAlign: 'center',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        fontSize: '1.5rem',
                        fontWeight: 600,
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      fontWeight={500}
                      gutterBottom
                    >
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Ready to Transform Your Events?
          </Typography>
          <Typography variant="h6" fontWeight={300} sx={{ mb: 4, lineHeight: 1.6 }}>
            Join thousands of event organizers who trust ShashaPass to deliver exceptional experiences.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9),
                },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/contact"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: alpha('#ffffff', 0.1),
                },
              }}
            >
              Contact Sales
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUsPage;
