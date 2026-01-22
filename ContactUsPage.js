import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  TextField,
  useTheme,
  alpha,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Business,
  Send,
  AccessTime,
  Chat,
  HeadsetMic,
  Public,
  Language,
  SupportAgent,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ContactUsPage = () => {
  const theme = useTheme();
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    contactMethod: 'email',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Send us a detailed message and we\'ll respond within 24 hours',
      icon: <Email />,
      contact: 'support@shashapass.com',
      action: 'Email Us',
      color: 'primary',
      available: '24/7',
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team during business hours',
      icon: <Phone />,
      contact: '+1 (555) 123-4567',
      action: 'Call Now',
      color: 'secondary',
      available: 'Mon-Fri, 9AM-6PM EST',
    },
    {
      title: 'Live Chat',
      description: 'Get instant help through our live chat service',
      icon: <Chat />,
      contact: 'Start Chat',
      action: 'Chat Now',
      color: 'success',
      available: '24/7',
    },
    {
      title: 'Sales Team',
      description: 'For enterprise solutions and partnership inquiries',
      icon: <Business />,
      contact: 'sales@shashapass.com',
      action: 'Contact Sales',
      color: 'info',
      available: 'Mon-Fri, 9AM-6PM EST',
    },
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      country: 'United States',
      address: '123 Market Street, Suite 1000',
      phone: '+1 (555) 123-4567',
      email: 'sf@shashapass.com',
      type: 'Headquarters',
    },
    {
      city: 'New York',
      country: 'United States',
      address: '456 Broadway, Floor 12',
      phone: '+1 (555) 123-4568',
      email: 'ny@shashapass.com',
      type: 'Sales Office',
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '789 Oxford Street',
      phone: '+44 20 7123 4567',
      email: 'uk@shashapass.com',
      type: 'European Office',
    },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: <Facebook />,
      url: 'https://facebook.com/shashapass',
      color: '#1877F2',
    },
    {
      name: 'Twitter',
      icon: <Twitter />,
      url: 'https://twitter.com/shashapass',
      color: '#1DA1F2',
    },
    {
      name: 'Instagram',
      icon: <Instagram />,
      url: 'https://instagram.com/shashapass',
      color: '#E4405F',
    },
    {
      name: 'LinkedIn',
      icon: <LinkedIn />,
      url: 'https://linkedin.com/company/shashapass',
      color: '#0077B5',
    },
    {
      name: 'YouTube',
      icon: <YouTube />,
      url: 'https://youtube.com/shashapass',
      color: '#FF0000',
    },
  ];

  const handleInputChange = (field) => (event) => {
    setContactForm({
      ...contactForm,
      [field]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setFormSubmitted(true);
    // Handle form submission logic here
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        contactMethod: 'email',
      });
    }, 3000);
  };

  const handleContactOptionClick = (option) => {
    if (option.action === 'Email Us' || option.action === 'Contact Sales') {
      window.location.href = `mailto:${option.contact}`;
    } else if (option.action === 'Call Now') {
      window.location.href = `tel:${option.contact}`;
    } else if (option.action === 'Chat Now') {
      // Implement chat functionality
      console.log('Opening chat...');
    }
  };

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
              Contact Us
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              We're here to help! Reach out to our team through any of the channels below or send us a message using the contact form.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Contact Options */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          textAlign="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          How Can We Help You?
        </Typography>
        <Grid container spacing={4}>
          {contactOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${option.color}.main`,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {option.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {option.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={500} color={`${option.color}.main`}>
                      {option.contact}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.available}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color={option.color}
                    onClick={() => handleContactOptionClick(option)}
                    fullWidth
                  >
                    {option.action}
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Form and Office Locations */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Contact Form */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper elevation={6} sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Send Us a Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={contactForm.firstName}
                          onChange={handleInputChange('firstName')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={contactForm.lastName}
                          onChange={handleInputChange('lastName')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={contactForm.email}
                          onChange={handleInputChange('email')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={contactForm.phone}
                          onChange={handleInputChange('phone')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Company (Optional)"
                          value={contactForm.company}
                          onChange={handleInputChange('company')}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Subject"
                          value={contactForm.subject}
                          onChange={handleInputChange('subject')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message"
                          multiline
                          rows={4}
                          value={contactForm.message}
                          onChange={handleInputChange('message')}
                          required
                          placeholder="Please describe your inquiry in detail..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={<Send />}
                          sx={{ px: 4, py: 1.5 }}
                          disabled={formSubmitted}
                          fullWidth
                        >
                          {formSubmitted ? 'Message Sent!' : 'Send Message'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </motion.div>
            </Grid>

            {/* Office Locations */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Our Offices
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Visit us at one of our global offices or reach out to the location nearest to you.
                </Typography>
                <List>
                  {officeLocations.map((office, index) => (
                    <Box key={index}>
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1" fontWeight={600}>
                            {office.city}, {office.country}
                          </Typography>
                          <Chip
                            label={office.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                          {office.address}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, ml: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="caption">{office.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="caption">{office.email}</Typography>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < officeLocations.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Social Media */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Connect With Us
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Follow us on social media for updates, tips, and community discussions.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
              {socialLinks.map((social, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <IconButton
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: social.color,
                      color: 'white',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        bgcolor: social.color,
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactUsPage;
