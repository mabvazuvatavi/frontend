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
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Event,
  Add,
  Edit,
  People,
  Payment,
  TrendingUp,
  Settings,
  Security,
  Help,
  CheckCircle,
  ExpandMore,
  PlayArrow,
  Visibility,
  Assessment,
  Speed,
  Timeline,
  MonetizationOn,
  Group,
  Analytics,
  Notifications,
  CloudUpload,
  QrCodeScanner,
  Business,
  Map,
  Schedule,
  LocalOffer,
  Star,
  Warning,
  VideoLibrary,
  Support,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const OrganizerGuidePage = () => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState('getting-started');

  const guideSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Event />,
      content: [
        {
          title: 'Create Your Account',
          text: 'Start by registering as an organizer on ShashaPass. Complete your profile with accurate business information, payment details, and contact information. This ensures smooth event creation and payment processing.'
        },
        {
          title: 'Verify Your Identity',
          text: 'Complete the verification process to unlock all features. This includes business registration verification and identity confirmation to ensure platform security and trust.'
        },
        {
          title: 'Set Up Payment Methods',
          text: 'Configure your preferred payment methods for receiving ticket sales revenue. We support bank transfers, PayPal, and other popular payment platforms.'
        },
        {
          title: 'Explore Dashboard',
          text: 'Familiarize yourself with the organizer dashboard where you\'ll manage events, track sales, view analytics, and communicate with attendees.'
        },
      ],
    },
    {
      id: 'creating-events',
      title: 'Creating Your First Event',
      icon: <Add />,
      content: [
        {
          title: 'Event Basics',
          text: 'Start with essential information: event title, description, category, and type. Be descriptive to attract the right audience and improve discoverability.'
        },
        {
          title: 'Choose Your Venue',
          text: 'Select from existing venues or add a new one. Provide accurate capacity, location, and facilities information to help attendees plan their visit.'
        },
        {
          title: 'Set Date and Time',
          text: 'Choose optimal dates and times considering your target audience, competing events, and venue availability. Include timezone information for clarity.'
        },
        {
          title: 'Configure Ticket Types',
          text: 'Create multiple ticket tiers (Standard, VIP, Premium) with different prices and benefits. This maximizes revenue and attendee satisfaction.'
        },
        {
          title: 'Pricing Strategy',
          text: 'Research market rates and set competitive prices. Consider early bird discounts, group rates, and dynamic pricing to maximize attendance.'
        },
      ],
    },
    {
      id: 'ticket-management',
      title: 'Ticket Management',
      icon: <LocalOffer />,
      content: [
        {
          title: 'Ticket Templates',
          text: 'Create reusable ticket templates for recurring events. Save time by standardizing ticket types, pricing, and terms across similar events.'
        },
        {
          title: 'Digital Formats',
          text: 'Choose from QR codes, NFC, RFID, or barcodes. QR codes are most popular and cost-effective for most events.'
        },
        {
          title: 'Transfer Policies',
          text: 'Define ticket transfer rules - allow transfers with or without fees, or disable transfers entirely. Clear policies reduce customer service issues.'
        },
        {
          title: 'Refund Settings',
          text: 'Set refund policies including time limits and conditions. Be transparent to build trust and reduce disputes.'
        },
        {
          title: 'Security Features',
          text: 'Implement anti-fraud measures including unique ticket IDs, secure delivery, and attendance verification to protect revenue.'
        },
      ],
    },
    {
      id: 'venue-management',
      title: 'Venue Management',
      icon: <Business />,
      content: [
        {
          title: 'Venue Registration',
          text: 'Add detailed venue information including capacity, layout, amenities, and accessibility features. Accurate details improve attendee experience.'
        },
        {
          title: 'Seating Configuration',
          text: 'Use our seating designer to create detailed venue layouts. Define sections, rows, and seat numbers for reserved seating events.'
        },
        {
          title: 'Capacity Management',
          text: 'Set realistic capacity limits based on venue size, safety regulations, and comfort. Consider standing vs. seated capacity.'
        },
        {
          title: 'Facilities Information',
          text: 'List available facilities like parking, restrooms, food services, and accessibility features. This helps attendees plan their visit.'
        },
        {
          title: 'Location Services',
          text: 'Provide accurate GPS coordinates and transportation information. Include nearby public transport and parking availability.'
        },
      ],
    },
    {
      id: 'marketing-promotion',
      title: 'Marketing & Promotion',
      icon: <TrendingUp />,
      content: [
        {
          title: 'Event Listing Optimization',
          text: 'Create compelling event descriptions with high-quality images, detailed schedules, and clear value propositions. Use keywords for better search visibility.'
        },
        {
          title: 'Social Media Integration',
          text: 'Share events across social platforms directly from your dashboard. Use platform-specific formatting for maximum engagement.'
        },
        {
          title: 'Email Marketing',
          text: 'Build email lists and send targeted campaigns. Use our templates for professional announcements and follow-ups.'
        },
        {
          title: 'Promotional Tools',
          text: 'Create discount codes, early bird offers, and group rates. Use urgency tactics like limited-time offers to drive early sales.'
        },
        {
          title: 'Analytics Tracking',
          text: 'Monitor marketing performance with detailed analytics. Track conversion rates, traffic sources, and attendee demographics.'
        },
      ],
    },
    {
      id: 'attendee-management',
      title: 'Attendee Management',
      icon: <People />,
      content: [
        {
          title: 'Registration Management',
          text: 'Monitor registration progress in real-time. Set up automatic confirmations and reminders to reduce no-shows.'
        },
        {
          title: 'Check-in Process',
          text: 'Implement efficient check-in using mobile apps or scanning devices. Train staff on proper procedures and troubleshooting.'
        },
        {
          title: 'Attendee Communication',
          text: 'Send important updates, reminders, and event information. Use our messaging system for professional communication.'
        },
        {
          title: 'Feedback Collection',
          text: 'Gather post-event feedback through surveys and ratings. Use insights to improve future events.'
        },
        {
          title: 'Data Management',
          text: 'Maintain accurate attendee records while respecting privacy. Use data for personalization and future event planning.'
        },
      ],
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting',
      icon: <Analytics />,
      content: [
        {
          title: 'Sales Dashboard',
          text: 'Monitor real-time sales data, revenue tracking, and attendance metrics. Use visual charts to identify trends and patterns.'
        },
        {
          title: 'Performance Metrics',
          text: 'Track key performance indicators including conversion rates, average order value, and customer acquisition costs.'
        },
        {
          title: 'Revenue Analysis',
          text: 'Analyze revenue by ticket type, sales channel, and time period. Identify your most profitable offerings.'
        },
        {
          title: 'Attendee Insights',
          text: 'Understand your audience demographics, preferences, and behavior. Use data for targeted marketing and event improvement.'
        },
        {
          title: 'Custom Reports',
          text: 'Generate custom reports for stakeholders, tax purposes, and business planning. Export data in various formats.'
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: <Star />,
      content: [
        {
          title: 'Event Planning Timeline',
          text: 'Start planning 3-6 months ahead for major events. Create detailed timelines with milestones and contingency plans.'
        },
        {
          title: 'Pricing Strategy',
          text: 'Research competitor pricing, consider value perception, and implement dynamic pricing based on demand and timing.'
        },
        {
          title: 'Customer Service',
          text: 'Respond promptly to inquiries, provide clear information, and handle issues professionally. Good service builds reputation.'
        },
        {
          title: 'Risk Management',
          text: 'Identify potential risks including weather, technical issues, and low attendance. Have backup plans ready.'
        },
        {
          title: 'Legal Compliance',
          text: 'Ensure all events comply with local regulations, licensing requirements, and safety standards.'
        },
      ],
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      icon: <Settings />,
      content: [
        {
          title: 'Virtual Events',
          text: 'Host hybrid or fully virtual events with streaming integration. Reach global audiences and reduce venue costs.'
        },
        {
          title: 'Season Passes',
          text: 'Create season tickets for recurring events or venues. Generate predictable revenue and build loyal customer base.'
        },
        {
          title: 'API Integration',
          text: 'Connect with external systems using our API. Automate workflows and integrate with existing business tools.'
        },
        {
          title: 'Multi-currency Support',
          text: 'Accept payments in multiple currencies to serve international attendees. Automatic currency conversion included.'
        },
        {
          title: 'White-label Options',
          text: 'Use custom branding for ticket pages and communications. Maintain consistent brand experience.'
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting & Support',
      icon: <Help />,
      content: [
        {
          title: 'Common Issues',
          text: 'Find solutions to common problems like payment failures, ticket delivery issues, and check-in problems.'
        },
        {
          title: 'Technical Support',
          text: 'Access 24/7 technical support for platform issues. Live chat, email, and phone support available.'
        },
        {
          title: 'Training Resources',
          text: 'Access video tutorials, documentation, and webinars. Learn advanced features and optimization techniques.'
        },
        {
          title: 'Community Forum',
          text: 'Connect with other organizers to share experiences and solutions. Learn from community best practices.'
        },
      ],
    },
  ];

  const handleSectionChange = (sectionId) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? sectionId : false);
  };

  const quickStartSteps = [
    {
      label: 'Create Account',
      description: 'Register and verify your organizer account',
    },
    {
      label: 'Add Venue',
      description: 'Register your event venue with details',
    },
    {
      label: 'Create Event',
      description: 'Set up your first event with tickets',
    },
    {
      label: 'Promote & Sell',
      description: 'Market your event and manage sales',
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
              Organizer Guide
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Master event management with our comprehensive guide. From creating your first event to scaling your business, we've got you covered.
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
                href="#getting-started"
              >
                Start Learning
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
                href="/events/create"
              >
                Create Event
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Quick Start Guide */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          textAlign="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Quick Start Guide
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 6,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          }}
        >
          <Stepper activeStep={-1} orientation="vertical">
            {quickStartSteps.map((step, index) => (
              <Step key={index} expanded>
                <StepLabel
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32,
                        mr: 2,
                        fontSize: '0.9rem',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {step.label}
                    </Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>

      {/* Detailed Guide Sections */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {guideSections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Paper
              elevation={3}
              sx={{
                mb: 3,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Accordion
                expanded={expandedSection === section.id}
                onChange={handleSectionChange(section.id)}
                sx={{
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                    py: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      {section.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {section.title}
                    </Typography>
                    {section.id === 'best-practices' && (
                      <Chip
                        label="Recommended"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 3 }}>
                    <List>
                      {section.content.map((item, itemIndex) => (
                        <ListItem
                          key={itemIndex}
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            py: 2,
                            px: 0,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <CheckCircle
                              sx={{
                                color: 'success.main',
                                fontSize: 20,
                                mr: 2,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 4.5, lineHeight: 1.6 }}
                          >
                            {item.text}
                          </Typography>
                          {itemIndex < section.content.length - 1 && (
                            <Divider sx={{ mt: 2, ml: 4.5 }} />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </motion.div>
        ))}

        {/* Additional Resources */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Additional Resources
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Video Tutorials
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Watch step-by-step video guides for all major features and workflows.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href="/help"
                    endIcon={<PlayArrow />}
                  >
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assessment sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Best Practices
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Learn industry best practices and proven strategies for successful events.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href="/blog"
                    endIcon={<TrendingUp />}
                  >
                    Read Articles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Support sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Support Center
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Get help from our support team and connect with other organizers.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href="/help"
                    endIcon={<Help />}
                  >
                    Get Support
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Group sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Community Forum
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Join discussions with experienced organizers and share insights.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href="/blog"
                    endIcon={<People />}
                  >
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default OrganizerGuidePage;
