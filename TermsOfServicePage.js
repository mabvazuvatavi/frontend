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
  Button,
  Avatar,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  Link,
} from '@mui/material';
import {
  Gavel,
  Security,
  AccountCircle,
  Payment,
  Event,
  Business,
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TermsOfServicePage = () => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState('general');

  const termsSections = [
    {
      id: 'general',
      title: 'General Terms',
      icon: <Gavel />,
      content: [
        {
          title: 'Acceptance of Terms',
          text: 'By accessing and using ShashaPass, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.'
        },
        {
          title: 'Changes to Terms',
          text: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of any modified terms.'
        },
        {
          title: 'Eligibility',
          text: 'You must be at least 18 years old to use our services. By using our platform, you represent and warrant that you meet this eligibility requirement.'
        },
      ],
    },
    {
      id: 'accounts',
      title: 'Account Terms',
      icon: <AccountCircle />,
      content: [
        {
          title: 'Account Registration',
          text: 'You must provide accurate, complete, and current information when registering for an account. You are responsible for maintaining the confidentiality of your account credentials.'
        },
        {
          title: 'Account Security',
          text: 'You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.'
        },
        {
          title: 'Account Termination',
          text: 'We may terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the service ceases immediately.'
        },
      ],
    },
    {
      id: 'services',
      title: 'Service Terms',
      icon: <Event />,
      content: [
        {
          title: 'Event Creation',
          text: 'Organizers are responsible for providing accurate event information. We reserve the right to remove any event that violates our policies or applicable laws.'
        },
        {
          title: 'Ticket Sales',
          text: 'All ticket sales are final unless otherwise specified by the event organizer. Refund policies are determined by individual event organizers.'
        },
        {
          title: 'Service Availability',
          text: 'We do not guarantee uninterrupted or error-free service. We may modify, suspend, or discontinue any aspect of the service at any time.'
        },
      ],
    },
    {
      id: 'payments',
      title: 'Payment Terms',
      icon: <Payment />,
      content: [
        {
          title: 'Payment Processing',
          text: 'We use third-party payment processors to handle transactions. By providing payment information, you agree to their terms and conditions.'
        },
        {
          title: 'Refund Policy',
          text: 'Refund policies vary by event and are determined by individual organizers. Please review the specific refund terms for each event before purchasing.'
        },
        {
          title: 'Fee Structure',
          text: 'We charge service fees for ticket processing and platform usage. All fees are clearly displayed before you complete any transaction.'
        },
      ],
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      icon: <Security />,
      content: [
        {
          title: 'Platform Content',
          text: 'The ShashaPass platform, including all software, designs, and content, is owned by ShashaPass Inc. and protected by intellectual property laws.'
        },
        {
          title: 'User Content',
          text: 'You retain ownership of content you post, but grant us a license to use, modify, and distribute your content for the purpose of providing our services.'
        },
        {
          title: 'Trademark Usage',
          text: 'You may not use our trademarks, logos, or brand elements without our prior written consent.'
        },
      ],
    },
    {
      id: 'prohibited',
      title: 'Prohibited Activities',
      icon: <Warning />,
      content: [
        {
          title: 'Illegal Activities',
          text: 'You may not use our services for any illegal purposes or in violation of any applicable laws, regulations, or treaties.'
        },
        {
          title: 'Fraudulent Behavior',
          text: 'Any attempt to defraud, scam, or deceive other users or our platform is strictly prohibited and may result in immediate account termination.'
        },
        {
          title: 'System Interference',
          text: 'You may not attempt to gain unauthorized access to our systems, interfere with service operation, or introduce malicious code.'
        },
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <Info />,
      content: [
        {
          title: 'Service Disclaimers',
          text: 'Our services are provided "as is" without any warranties, express or implied. We do not guarantee the accuracy or reliability of user-generated content.'
        },
        {
          title: 'Damages Limitation',
          text: 'To the maximum extent permitted by law, our total liability for any claims arising from your use of our services shall not exceed the amount you paid us in the preceding 12 months.'
        },
        {
          title: 'Indemnification',
          text: 'You agree to indemnify and hold harmless ShashaPass from any claims, damages, or expenses arising from your violation of these terms.'
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: <Security />,
      content: [
        {
          title: 'Data Protection',
          text: 'Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms.'
        },
        {
          title: 'Data Security',
          text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or disclosure.'
        },
        {
          title: 'Cookie Usage',
          text: 'We use cookies and similar technologies to enhance your experience. You can control cookie settings through your browser preferences.'
        },
      ],
    },
  ];

  const handleSectionChange = (sectionId) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? sectionId : false);
  };

  const lastUpdated = 'January 8, 2024';

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
              Terms of Service
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Please read these terms carefully. By using ShashaPass, you agree to be bound by these terms and conditions.
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
                href="#general"
              >
                Read Terms
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
                href="/privacy"
              >
                Privacy Policy
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Terms Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
        </Box>

        {termsSections.map((section, index) => (
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

        {/* Additional Information */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Important Information
          </Typography>
          <Typography variant="body2" paragraph>
            These Terms of Service constitute a legally binding agreement between you and ShashaPass Inc. 
            If you have any questions about these terms, please contact our legal team at{' '}
            <Link href="mailto:legal@shashapass.com" color="primary.main">
              legal@shashapass.com
            </Link>
          </Typography>
          <Typography variant="body2" paragraph>
            For disputes or legal matters, please contact:
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" paragraph>
              <strong>ShashaPass Inc.</strong><br />
              123 Market Street, Suite 1000<br />
              San Francisco, CA 94105<br />
              United States
            </Typography>
            <Typography variant="body2" paragraph>
              Email:{' '}
              <Link href="mailto:legal@shashapass.com" color="primary.main">
                legal@shashapass.com
              </Link>
            </Typography>
            <Typography variant="body2" paragraph>
              Phone: +1 (555) 123-4567
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfServicePage;
