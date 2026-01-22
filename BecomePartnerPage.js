import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  Link,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Business,
  Handshake,
  TrendingUp,
  Groups,
  AttachMoney,
  Public,
  Language,
  IntegrationInstructions,
  ExpandMore,
  CheckCircle,
  Star,
  Email,
  Phone,
  LocationOn,
  Globe,
  Security,
  Speed,
  Support,
  MonetizationOn,
  People,
  Event,
  Api,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const BecomePartnerPage = () => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState('overview');
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    partnershipType: 'venue',
    businessType: '',
    message: '',
  });

  const partnershipTypes = [
    {
      id: 'venue',
      title: 'Venue Partners',
      icon: <Business />,
      description: 'Join our network of premier event venues and reach millions of event organizers.',
      benefits: [
        'Increased venue visibility and bookings',
        'Access to organizer network',
        'Marketing and promotional support',
        'Advanced booking management tools',
      ],
    },
    {
      id: 'vendor',
      title: 'Vendor Partners',
      icon: <Groups />,
      description: 'Connect with event organizers and showcase your products and services to our community.',
      benefits: [
        'Direct access to event organizers',
        'Featured vendor listings',
        'Lead generation opportunities',
        'Integrated payment processing',
      ],
    },
    {
      id: 'technology',
      title: 'Technology Partners',
      icon: <IntegrationInstructions />,
      description: 'Integrate your technology solutions with our platform and expand your reach.',
      benefits: [
        'API access and documentation',
        'Co-marketing opportunities',
        'Technical support and resources',
        'Joint development initiatives',
      ],
    },
    {
      id: 'affiliate',
      title: 'Affiliate Partners',
      icon: <TrendingUp />,
      description: 'Earn commissions by promoting ShashaPass to your audience and network.',
      benefits: [
        'Competitive commission rates',
        'Marketing materials and tools',
        'Real-time tracking and reporting',
        'Dedicated affiliate support',
      ],
    },
    {
      id: 'enterprise',
      title: 'Enterprise Solutions',
      icon: <Business />,
      description: 'Custom solutions for large organizations and enterprise clients.',
      benefits: [
        'White-label platform options',
        'Custom feature development',
        'Dedicated account management',
        'Enterprise-grade security',
      ],
    },
  ];

  const successStories = [
    {
      company: 'Grand Arena Complex',
      type: 'Venue Partner',
      story: 'Increased venue utilization by 45% and reduced administrative overhead by 60% through ShashaPass integration.',
      metrics: '45% increase in bookings',
    },
    {
      company: 'TechEvents Inc.',
      type: 'Technology Partner',
      story: 'Successfully integrated their event management software, reaching 10,000+ new users.',
      metrics: '10,000+ new users',
    },
    {
      company: 'Premium Catering Co.',
      type: 'Vendor Partner',
      story: 'Secured 200+ event catering contracts through our vendor marketplace.',
      metrics: '200+ event contracts',
    },
  ];

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Partnership form submitted:', formData);
    // Handle form submission logic here
  };

  const handleSectionChange = (sectionId) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? sectionId : false);
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
              Become a Partner
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Join our growing ecosystem of partners and unlock new opportunities for your business. 
              From venues to vendors, technology providers to affiliates, we have partnership programs for everyone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
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
                href="#partnership-types"
              >
                Explore Partnerships
              </Button>
              <Button
                variant="outlined"
                size="large"
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
                href="#apply-now"
              >
                Apply Now
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Partnership Types */}
      <Box id="partnership-types" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Partnership Opportunities
          </Typography>
          <Grid container spacing={4}>
            {partnershipTypes.map((type, index) => (
              <Grid item xs={12} md={6} lg={4} key={type.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 48,
                            height: 48,
                            mr: 2,
                          }}
                        >
                          {type.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          {type.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {type.description}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Key Benefits:
                      </Typography>
                      <List dense>
                        {type.benefits.map((benefit, benefitIndex) => (
                          <ListItem key={benefitIndex} sx={{ py: 0.5 }}>
                            <CheckCircle
                              sx={{
                                color: 'success.main',
                                fontSize: 16,
                                mr: 1,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {benefit}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setFormData({ ...formData, partnershipType: type.id })}
                        >
                          Learn More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Success Stories */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Success Stories
          </Typography>
          <Grid container spacing={4}>
            {successStories.map((story, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      height: '100%',
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {story.company}
                    </Typography>
                    <Chip
                      label={story.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {story.story}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      {story.metrics}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Application Form */}
      <Box id="apply-now" sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Paper
            elevation={6}
            sx={{
              p: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
            }}
          >
            <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
              Apply to Become a Partner
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
              Fill out the form below and our partnership team will contact you within 48 hours.
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.companyName}
                    onChange={handleInputChange('companyName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={formData.contactName}
                    onChange={handleInputChange('contactName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    placeholder="https://"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Partnership Type</InputLabel>
                    <Select
                      value={formData.partnershipType}
                      onChange={handleInputChange('partnershipType')}
                      label="Partnership Type"
                    >
                      {partnershipTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Business Type"
                    value={formData.businessType}
                    onChange={handleInputChange('businessType')}
                    placeholder="e.g., Event Venue, Catering, Technology"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tell us about your partnership interest"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange('message')}
                    required
                    placeholder="Describe your business and what kind of partnership you're looking for..."
                  />
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ px: 6, py: 1.5 }}
                    startIcon={<Handshake />}
                  >
                    Submit Application
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>

      {/* Contact Information */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Partnership Team
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Have questions about partnership opportunities? Our team is here to help.
            </Typography>
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Email />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Link href="mailto:partnerships@shashapass.com" color="primary.main">
                      partnerships@shashapass.com
                    </Link>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Phone />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: 'success.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <LocationOn />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Office
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    123 Market Street, Suite 1000<br />
                    San Francisco, CA 94105
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default BecomePartnerPage;
