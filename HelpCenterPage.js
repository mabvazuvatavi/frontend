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
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
  alpha,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Search,
  Help,
  ContactSupport,
  Article,
  Event,
  Payment,
  AccountCircle,
  Security,
  Business,
  ExpandMore,
  Send,
  Phone,
  Email,
  Chat,
  VideoLibrary,
  Book,
  Lightbulb,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HelpCenterPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Lightbulb />,
      color: 'primary',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is easy! Click the "Sign Up" button in the top right corner, enter your email address and create a password. You\'ll receive a confirmation email to verify your account.'
        },
        {
          question: 'What is ShashaPass?',
          answer: 'ShashaPass is a comprehensive event management platform that helps organizers create, manage, and promote events while providing attendees with seamless ticket purchasing and event experiences.'
        },
        {
          question: 'How do I find events?',
          answer: 'Browse our events page to discover upcoming events. You can filter by location, category, date, and use the search bar to find specific events or venues.'
        },
      ],
    },
    {
      id: 'tickets',
      title: 'Tickets & Booking',
      icon: <Event />,
      color: 'secondary',
      faqs: [
        {
          question: 'How do I purchase tickets?',
          answer: 'Select an event, choose your ticket type, and add to cart. Proceed to checkout, enter your details, and complete payment. You\'ll receive e-tickets via email.'
        },
        {
          question: 'Can I transfer tickets to someone else?',
          answer: 'Yes! Most tickets are transferable. Go to "My Tickets" in your dashboard, select the ticket, and use the transfer option to send it to another person.'
        },
        {
          question: 'What is a Season Pass?',
          answer: 'Season Passes give you access to multiple events or venues at a discounted price. They\'re perfect for regular attendees who want to save money and skip individual ticket purchases.'
        },
        {
          question: 'How do refunds work?',
          answer: 'Refund policies vary by event organizer. Check the event page for specific refund terms. Generally, refunds are available up to 48 hours before the event starts.'
        },
      ],
    },
    {
      id: 'payment',
      title: 'Payment & Billing',
      icon: <Payment />,
      color: 'success',
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept all major credit cards, debit cards, PayPal, Apple Pay, Google Pay, and various digital wallets depending on your location.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Absolutely! We use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is tokenized and never stored on our servers.'
        },
        {
          question: 'Can I get a receipt?',
          answer: 'Yes! Receipts are automatically sent to your email after purchase. You can also access all your receipts in your account under "Order History".'
        },
        {
          question: 'Do you offer payment plans?',
          answer: 'Some events offer payment plans through our partnership with Affirm and other providers. Look for the "Pay Over Time" option at checkout.'
        },
      ],
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: <AccountCircle />,
      color: 'info',
      faqs: [
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a secure link to reset your password.'
        },
        {
          question: 'Can I change my email address?',
          answer: 'Yes! Go to Account Settings in your dashboard, click on your email address, and update it. You\'ll need to verify the new email address.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'We\'re sorry to see you go! Go to Account Settings, scroll to the bottom, and click "Delete Account". Please note this action is permanent.'
        },
        {
          question: 'Can I have multiple accounts?',
          answer: 'We recommend one account per person. However, you can use the same email for different roles (attendee, organizer, vendor) by switching profiles.'
        },
      ],
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: <Error />,
      color: 'warning',
      faqs: [
        {
          question: 'Why can\'t I log in?',
          answer: 'First, ensure you\'re using the correct email and password. Try resetting your password. If issues persist, clear your browser cache or try a different browser.'
        },
        {
          question: 'My payment failed. What should I do?',
          answer: 'Check that your card details are correct and that you have sufficient funds. Try a different payment method or contact your bank. If problems continue, reach out to our support team.'
        },
        {
          question: 'The app is running slowly. How can I fix it?',
          answer: 'Try clearing your browser cache, disabling browser extensions, or using our mobile app. Ensure you have a stable internet connection and update to the latest browser version.'
        },
        {
          question: 'I didn\'t receive my tickets. What now?',
          answer: 'Check your spam folder first. If not found, go to "My Tickets" in your account - all tickets are stored there. For urgent issues, contact support immediately.'
        },
      ],
    },
  ];

  const helpArticles = [
    {
      title: 'Complete Guide to Event Creation',
      description: 'Learn how to create successful events from start to finish',
      category: 'Organizer',
      readTime: '10 min',
      icon: <Book />,
    },
    {
      title: 'Understanding Season Passes',
      description: 'Everything you need to know about seasonal ticket options',
      category: 'Tickets',
      readTime: '5 min',
      icon: <Event />,
    },
    {
      title: 'NFC Ticketing Explained',
      description: 'How contactless technology is changing event entry',
      category: 'Technology',
      readTime: '7 min',
      icon: <Security />,
    },
    {
      title: 'Vendor Management Best Practices',
      description: 'Tips for working with vendors and suppliers',
      category: 'Organizer',
      readTime: '8 min',
      icon: <Business />,
    },
    {
      title: 'Payment Security Guide',
      description: 'How we protect your financial information',
      category: 'Security',
      readTime: '6 min',
      icon: <Payment />,
    },
    {
      title: 'Mobile App Features',
      description: 'Get the most out of our mobile applications',
      category: 'Mobile',
      readTime: '5 min',
      icon: <VideoLibrary />,
    },
  ];

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: <Chat />,
      action: 'Start Chat',
      available: '24/7',
      color: 'primary',
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Email />,
      action: 'support@shashapass.com',
      available: 'Response within 24h',
      color: 'secondary',
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: <Phone />,
      action: '+1 (555) 123-4567',
      available: 'Mon-Fri, 9AM-6PM EST',
      color: 'success',
    },
  ];

  const handleContactSubmit = () => {
    console.log('Support form submitted:', contactForm);
    // Handle form submission logic here
  };

  const handleInputChange = (field) => (event) => {
    setContactForm({
      ...contactForm,
      [field]: event.target.value,
    });
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

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
              Help Center
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Find answers to common questions, browse helpful articles, or contact our support team for personalized assistance.
            </Typography>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  input: { color: 'white' },
                }}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Quick Actions */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                elevation={3}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Article fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Browse Articles
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Search our comprehensive library of help articles and guides
                </Typography>
                <Button variant="contained" href="#articles">
                  Browse Articles
                </Button>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                elevation={3}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Help fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  FAQs
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Find quick answers to commonly asked questions
                </Typography>
                <Button variant="contained" color="secondary" href="#faqs">
                  View FAQs
                </Button>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                elevation={3}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <ContactSupport fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Contact Support
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Get personalized help from our support team
                </Typography>
                <Button variant="contained" color="success" href="#contact">
                  Contact Us
                </Button>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Help Articles */}
      <Box id="articles" sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Help Articles
          </Typography>
          <Grid container spacing={4}>
            {helpArticles.map((article, index) => (
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
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
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
                          {article.icon}
                        </Avatar>
                        <Box>
                          <Chip
                            label={article.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {article.readTime}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {article.description}
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ExpandMore />}
                        component={Link}
                        to={`/help/article/${index}`}
                      >
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQs */}
      <Box id="faqs" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4}>
            {filteredCategories.map((category, index) => (
              <Grid item xs={12} md={6} key={category.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper elevation={3} sx={{ mb: 2 }}>
                    <Accordion
                      expanded={expandedCategory === category.id}
                      onChange={() => setExpandedCategory(expandedCategory === category.id ? false : category.id)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          bgcolor: alpha(theme.palette[category.color].main, 0.05),
                          '&:hover': {
                            bgcolor: alpha(theme.palette[category.color].main, 0.1),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: `${category.color}.main`,
                              width: 40,
                              height: 40,
                              mr: 2,
                            }}
                          >
                            {category.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600}>
                            {category.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {category.faqs.map((faq, faqIndex) => (
                            <Box key={faqIndex}>
                              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 0 }}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                  {faq.question}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {faq.answer}
                                </Typography>
                              </ListItem>
                              {faqIndex < category.faqs.length - 1 && <Divider sx={{ my: 2 }} />}
                            </Box>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Support Channels */}
      <Box id="contact" sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Contact Support
          </Typography>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {supportChannels.map((channel, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${channel.color}.main`,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {channel.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {channel.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {channel.description}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color={`${channel.color}.main`} gutterBottom>
                      {channel.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {channel.available}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Contact Form */}
          <Paper elevation={6} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" fontWeight={600} gutterBottom textAlign="center">
              Send us a Message
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
              Can't find what you're looking for? Fill out the form below and our support team will get back to you.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={contactForm.name}
                  onChange={handleInputChange('name')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={contactForm.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={contactForm.subject}
                  onChange={handleInputChange('subject')}
                  margin="normal"
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
                  margin="normal"
                  placeholder="Describe your issue or question in detail..."
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleContactSubmit}
                  startIcon={<Send />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Send Message
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HelpCenterPage;
