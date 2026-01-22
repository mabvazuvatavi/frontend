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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Article,
  Download,
  Email,
  Phone,
  Business,
  TrendingUp,
  CalendarToday,
  ExpandMore,
  Send,
  Close,
  NewReleases,
  Campaign,
  PhotoLibrary,
  VideoLibrary,
  Description,
  Link as LinkIcon,
  Share,
  Public,
  People,
  AttachFile,
  Computer,
  Event,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PressPage = () => {
  const theme = useTheme();
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [contactDialog, setContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });

  const pressReleases = [
    {
      id: 1,
      title: 'ShashaPass Raises $10M Series A to Revolutionize Event Management',
      date: '2024-01-15',
      category: 'Funding',
      excerpt: 'Leading event management platform secures major funding to expand globally and enhance AI-powered features.',
      content: `SAN FRANCISCO, CA - ShashaPass, the innovative event management platform, today announced the completion of a $10 million Series A funding round led by TechVentures Capital, with participation from existing investors and strategic partners.

The funding will be used to accelerate product development, expand the engineering team, and scale operations to new markets. ShashaPass has seen tremendous growth over the past year, with platform usage increasing by 300% and serving over 50,000 event organizers worldwide.

"We're thrilled to have the support of investors who understand our vision for democratizing event management," said Sarah Johnson, CEO of ShashaPass. "This funding will enable us to build the next generation of event technology that makes professional-grade tools accessible to everyone."

The platform's unique approach combines powerful features like NFC ticketing, virtual events, and advanced analytics with an intuitive interface that serves events of all sizes, from local gatherings to international conferences.`,
      featured: true,
      image: '/api/placeholder/800/400',
    },
    {
      id: 2,
      title: 'ShashaPass Launches AI-Powered Event Recommendations',
      date: '2024-01-10',
      category: 'Product',
      excerpt: 'New machine learning algorithms provide personalized event suggestions and optimize attendee experiences.',
      content: `New AI features analyze user preferences, past attendance, and social connections to recommend relevant events with 95% accuracy rate.`,
      featured: false,
      image: '/api/placeholder/800/400',
    },
    {
      id: 3,
      title: 'Partnership with Major Venues Transforms Ticketing Experience',
      date: '2024-01-05',
      category: 'Partnership',
      excerpt: 'Strategic collaboration with 500+ venues nationwide brings seamless NFC entry and enhanced security.',
      content: 'Revolutionary NFC technology eliminates traditional ticket scanning and provides real-time attendance analytics.',
      featured: false,
      image: '/api/placeholder/800/400',
    },
    {
      id: 4,
      title: 'ShashaPass Achieves SOC 2 Type II Compliance',
      date: '2023-12-20',
      category: 'Security',
      excerpt: 'Industry-leading security certification demonstrates commitment to data protection and privacy.',
      content: 'Comprehensive security audit confirms enterprise-grade protection for customer data and transactions.',
      featured: false,
      image: '/api/placeholder/800/400',
    },
    {
      id: 5,
      title: 'Virtual Events Platform Surpasses 1 Million Attendees',
      date: '2023-12-15',
      category: 'Milestone',
      excerpt: 'Rapid adoption of virtual event features highlights platform\'s versatility and scalability.',
      content: 'Virtual event attendance grows 500% as organizers embrace hybrid event models.',
      featured: false,
      image: '/api/placeholder/800/400',
    },
  ];

  const mediaKit = [
    {
      title: 'Company Overview',
      description: 'Comprehensive information about ShashaPass, our mission, and business model',
      icon: <Description />,
      download: '/media-kit/company-overview.pdf',
      size: '2.4 MB',
    },
    {
      title: 'Logo Package',
      description: 'High-resolution logos in various formats and color schemes',
      icon: <PhotoLibrary />,
      download: '/media-kit/logos.zip',
      size: '15.7 MB',
    },
    {
      title: 'Executive Photos',
      description: 'Professional headshots and team photos for media use',
      icon: <PhotoLibrary />,
      download: '/media-kit/executive-photos.zip',
      size: '8.3 MB',
    },
    {
      title: 'Product Screenshots',
      description: 'High-quality screenshots of the platform and mobile apps',
      icon: <Computer />,
      download: '/media-kit/screenshots.zip',
      size: '12.1 MB',
    },
    {
      title: 'B-roll Videos',
      description: 'Video footage of the platform in action and team interviews',
      icon: <VideoLibrary />,
      download: '/media-kit/b-roll.zip',
      size: '245.8 MB',
    },
    {
      title: 'Fact Sheet',
      description: 'Key statistics, milestones, and company metrics',
      icon: <Description />,
      download: '/media-kit/fact-sheet.pdf',
      size: '1.2 MB',
    },
  ];

  const companyStats = [
    { label: 'Events Managed', value: '500,000+', icon: <Event /> },
    { label: 'Active Users', value: '2M+', icon: <People /> },
    { label: 'Countries', value: '50+', icon: <Public /> },
    { label: 'Revenue Growth', value: '300%', icon: <TrendingUp /> },
  ];

  const pressContacts = [
    {
      name: 'Emily Chen',
      role: 'Head of Communications',
      email: 'press@shashapass.com',
      phone: '+1 (555) 123-4567',
      avatar: 'EC',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Media Relations Manager',
      email: 'media@shashapass.com',
      phone: '+1 (555) 123-4568',
      avatar: 'MR',
    },
  ];

  const handlePressReleaseClick = (release) => {
    setSelectedRelease(release);
  };

  const handleContactSubmit = () => {
    console.log('Press contact form submitted:', contactForm);
    setContactDialog(false);
    setContactForm({ name: '', email: '', organization: '', message: '' });
  };

  const handleInputChange = (field) => (event) => {
    setContactForm({
      ...contactForm,
      [field]: event.target.value,
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Funding': return 'success';
      case 'Product': return 'primary';
      case 'Partnership': return 'secondary';
      case 'Security': return 'warning';
      case 'Milestone': return 'info';
      default: return 'default';
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
              Press & Media
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Welcome to the ShashaPass press room. Find the latest news, press releases, media resources, and contact information for media inquiries.
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
                href="#releases"
              >
                Latest Releases
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
                href="#media-kit"
              >
                Media Kit
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Company Stats */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {companyStats.map((stat, index) => (
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
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  }}
                >
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

      {/* Press Releases Section */}
      <Box id="releases" sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Press Releases
          </Typography>
          <Grid container spacing={4}>
            {pressReleases.map((release, index) => (
              <Grid item xs={12} md={6} key={release.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      },
                      border: release.featured ? `2px solid ${theme.palette.primary.main}` : 'none',
                    }}
                    onClick={() => handlePressReleaseClick(release)}
                  >
                    {release.featured && (
                      <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NewReleases fontSize="small" />
                        <Typography variant="caption" fontWeight={600}>FEATURED</Typography>
                      </Box>
                    )}
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                          label={release.category}
                          size="small"
                          color={getCategoryColor(release.category)}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(release.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {release.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {release.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          size="small"
                          endIcon={<ExpandMore />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePressReleaseClick(release);
                          }}
                        >
                          Read More
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small">
                            <Share fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Media Kit Section */}
      <Box id="media-kit" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Media Kit
          </Typography>
          <Grid container spacing={4}>
            {mediaKit.map((item, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                          mb: 2,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {item.size}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          href={item.download}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
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

      {/* Press Contacts Section */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Press Contacts
          </Typography>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {pressContacts.map((contact, index) => (
              <Grid item xs={12} md={6} key={index}>
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
                    }}
                  >
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
                      {contact.avatar}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {contact.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      fontWeight={500}
                      gutterBottom
                    >
                      {contact.role}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{contact.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{contact.phone}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={() => setContactDialog(true)}
              sx={{ px: 4, py: 1.5 }}
            >
              Contact Press Team
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Press Release Detail Dialog */}
      <Dialog
        open={!!selectedRelease}
        onClose={() => setSelectedRelease(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        {selectedRelease && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {selectedRelease.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={selectedRelease.category}
                    size="small"
                    color={getCategoryColor(selectedRelease.category)}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(selectedRelease.date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedRelease(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {selectedRelease.content}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedRelease(null)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                href={`/press-releases/${selectedRelease.id}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Contact Dialog */}
      <Dialog
        open={contactDialog}
        onClose={() => setContactDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            Contact Press Team
          </Typography>
          <IconButton onClick={() => setContactDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={contactForm.name}
            onChange={handleInputChange('name')}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={contactForm.email}
            onChange={handleInputChange('email')}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Organization"
            value={contactForm.organization}
            onChange={handleInputChange('organization')}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={contactForm.message}
            onChange={handleInputChange('message')}
            margin="normal"
            placeholder="Please describe your media inquiry..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setContactDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleContactSubmit}
            startIcon={<Send />}
            disabled={!contactForm.name || !contactForm.email || !contactForm.message}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PressPage;
