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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import {
  MonetizationOn,
  TrendingUp,
  Share,
  Link as LinkIcon,
  CheckCircle,
  ExpandMore,
  Star,
  AttachMoney,
  People,
  Assessment,
  Speed,
  Timeline,
  Public,
  Language,
  Security,
  Email,
  Phone,
  LocationOn,
  School,
  Campaign,
  Analytics,
  Help,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AffiliatePage = () => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState('overview');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '',
    company: '',
    promotionalMethods: [],
    experience: '',
  });

  const affiliateSections = [
    {
      id: 'overview',
      title: 'Program Overview',
      icon: <MonetizationOn />,
      content: [
        {
          title: 'What is ShashaPass Affiliate Program?',
          text: 'Join our affiliate program and earn commissions by promoting ShashaPass event management platform. Help organizers discover our powerful tools while generating passive income.'
        },
        {
          title: 'Why Partner with Us?',
          text: 'ShashaPass is the leading event management platform with thousands of organizers and millions of tickets sold. Our trusted brand and high conversion rates mean better earnings for our affiliates.'
        },
        {
          title: 'Who Can Join?',
          text: 'Whether you\'re a marketer, blogger, event professional, or business owner, our program is designed to help you succeed. No minimum traffic requirements to get started.'
        },
      ],
    },
    {
      id: 'benefits',
      title: 'Affiliate Benefits',
      icon: <Star />,
      content: [
        {
          title: 'Competitive Commission Rates',
          text: 'Earn up to 30% commission on new organizer sign-ups and ticket sales. Our tiered structure rewards performance with higher rates for top performers.'
        },
        {
          title: 'Long Cookie Duration',
          text: '90-day cookie tracking ensures you get credit for sales made months after your initial referral. Extended tracking window maximizes your earning potential.'
        },
        {
          title: 'Marketing Materials',
          text: 'Access to professional banners, text links, email templates, and promotional content. All materials are regularly updated and optimized for conversion.'
        },
        {
          title: 'Real-time Analytics',
          text: 'Comprehensive dashboard with click tracking, conversion rates, revenue analytics, and performance insights. Data updated in real-time for optimization.'
        },
        {
          title: 'Dedicated Support',
          text: 'Personal affiliate manager, priority support, and exclusive training resources. We\'re invested in your success and provide guidance when needed.'
        },
        {
          title: 'Multi-tier Rewards',
          text: 'Performance-based tiers with increasing benefits. Bronze, Silver, Gold, and Platinum levels with exclusive perks and higher commission rates.'
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      icon: <Timeline />,
      content: [
        {
          title: 'Sign Up',
          text: 'Complete our simple affiliate application. Get approved within 48 hours and receive instant access to your affiliate dashboard and marketing materials.'
        },
        {
          title: 'Get Your Links',
          text: 'Generate unique affiliate links for different pages and campaigns. Use our link builder to create custom tracking URLs for specific promotions.'
        },
        {
          title: 'Promote ShashaPass',
          text: 'Share your links through websites, blogs, social media, email campaigns, or paid advertising. Follow our guidelines for best results.'
        },
        {
          title: 'Track Performance',
          text: 'Monitor clicks, conversions, and earnings in real-time. Use our analytics to optimize your campaigns and maximize ROI.'
        },
        {
          title: 'Get Paid',
          text: 'Receive monthly payments via PayPal, bank transfer, or check. Minimum payout threshold of just $50 with reliable payment schedule.'
        },
      ],
    },
    {
      id: 'commission',
      title: 'Commission Structure',
      icon: <AttachMoney />,
      content: [
        {
          title: 'New Organizer Commissions',
          text: 'Earn 20-30% commission on new organizer sign-ups based on subscription tier. Higher commissions for premium and enterprise plans.'
        },
        {
          title: 'Ticket Sale Commissions',
          text: 'Receive 5-10% commission on ticket sales generated through your links. Commission rates vary by event type and volume.'
        },
        {
          title: 'Performance Bonuses',
          text: 'Monthly performance bonuses for top performers. Earn extra $100-$1000 based on conversion rates and revenue generated.'
        },
        {
          title: 'Tier Advancement',
          text: 'Progress through Bronze → Silver → Gold → Platinum tiers. Each level unlocks higher commission rates and exclusive benefits.'
        },
        {
          title: 'Second-tier Commissions',
          text: 'Earn 5% commission on affiliates you refer to our program. Build your network and create passive income streams.'
        },
      ],
    },
    {
      id: 'marketing-tools',
      title: 'Marketing Tools & Resources',
      icon: <Campaign />,
      content: [
        {
          title: 'Link Generator',
          text: 'Create custom affiliate links for any page on ShashaPass. Add tracking parameters for campaign management and A/B testing.'
        },
        {
          title: 'Banner Library',
          text: 'Professional banners in all standard sizes and formats. Regularly updated with seasonal designs and high-converting creatives.'
        },
        {
          title: 'Email Templates',
          text: 'Pre-written email templates for newsletters and promotions. Customizable templates with your affiliate tracking automatically included.'
        },
        {
          title: 'Social Media Kit',
          text: 'Ready-to-use social media posts, images, and videos. Optimized for different platforms including Instagram, Facebook, Twitter, and LinkedIn.'
        },
        {
          title: 'Content Guidelines',
          text: 'Best practices and compliance guidelines for promoting ShashaPass. Ensure your marketing aligns with our brand values and legal requirements.'
        },
      ],
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <Help />,
      content: [
        {
          title: 'How do I get paid?',
          text: 'We process payments monthly via PayPal, bank transfer, or check. Minimum payout is $50. Payments are processed by the 15th of each month.'
        },
        {
          title: 'What is the cookie duration?',
          text: 'Our cookies last for 90 days, giving you plenty of time to earn commissions from repeat visitors.'
        },
        {
          title: 'Can I use paid advertising?',
          text: 'Yes! You can use paid advertising as long as you comply with our trademark guidelines and don\'t misrepresent our offerings.'
        },
        {
          title: 'How are commissions tracked?',
          text: 'We use advanced tracking with unique affiliate IDs and cookies. Real-time reporting shows all clicks, conversions, and earnings.'
        },
        {
          title: 'Is there a minimum traffic requirement?',
          text: 'No minimum traffic to join. However, consistent performance is required to maintain active status and access premium tiers.'
        },
      ],
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
    console.log('Affiliate application submitted:', formData);
    // Handle form submission logic here
  };

  const handleSectionChange = (sectionId) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? sectionId : false);
  };

  const commissionTiers = [
    {
      name: 'Bronze',
      commission: '20%',
      requirements: '0-10 conversions/month',
      benefits: ['Basic dashboard access', 'Standard marketing materials'],
    },
    {
      name: 'Silver',
      commission: '25%',
      requirements: '11-50 conversions/month',
      benefits: ['Advanced analytics', 'Custom banners', 'Monthly bonus eligibility'],
    },
    {
      name: 'Gold',
      commission: '30%',
      requirements: '51+ conversions/month',
      benefits: ['Dedicated manager', 'Priority support', 'Performance bonuses', 'Exclusive offers'],
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
              Affiliate Program
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Earn commissions promoting ShashaPass event management platform. 
              Join thousands of affiliates earning passive income while helping organizers discover powerful event tools.
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
                href="#commission"
              >
                View Commissions
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
                Join Now
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Commission Tiers */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Commission Tiers
          </Typography>
          <Grid container spacing={4}>
            {commissionTiers.map((tier, index) => (
              <Grid item xs={12} md={4} key={tier.name}>
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
                      background: tier.name === 'Gold' 
                        ? `linear-gradient(135deg, ${alpha('#FFD700', 0.1)} 0%, ${alpha('#FFD700', 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                      border: tier.name === 'Gold' ? `2px solid ${alpha('#FFD700', 0.3)}` : 'none',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: tier.name === 'Gold' ? '#FFD700' : 'primary.main',
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
                          fontSize: '1.5rem',
                        }}
                      >
                        {tier.name[0]}
                      </Avatar>
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {tier.name} Tier
                      </Typography>
                      <Chip
                        label={tier.commission}
                        size="large"
                        color={tier.name === 'Gold' ? 'warning' : 'primary'}
                        sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}
                      />
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {tier.requirements}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Benefits:
                      </Typography>
                      <List dense>
                        {tier.benefits.map((benefit, benefitIndex) => (
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
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Detailed Guide Sections */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {affiliateSections.map((section, index) => (
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
                    {section.id === 'benefits' && (
                      <Chip
                        label="Most Popular"
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

        {/* Application Form */}
        <Box id="apply-now" sx={{ mt: 6 }}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
            }}
          >
            <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
              Apply to Become an Affiliate
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
              Join our affiliate program and start earning commissions today. No minimum traffic requirements.
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
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
                    label="Website or Blog"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    placeholder="https://"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company (Optional)"
                    value={formData.company}
                    onChange={handleInputChange('company')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Promotional Methods"
                    value={formData.promotionalMethods.join(', ')}
                    onChange={handleInputChange('promotionalMethods')}
                    placeholder="e.g., Blog, Social Media, Email Marketing, Paid Ads"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Marketing Experience"
                    multiline
                    rows={3}
                    value={formData.experience}
                    onChange={handleInputChange('experience')}
                    placeholder="Describe your experience with affiliate marketing..."
                  />
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ px: 6, py: 1.5 }}
                    startIcon={<TrendingUp />}
                  >
                    Submit Application
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AffiliatePage;
