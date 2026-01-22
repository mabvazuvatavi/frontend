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
} from '@mui/material';
import {
  Security,
  Visibility,
  Delete,
  Update,
  Email,
  Phone,
  LocationOn,
  CheckCircle,
  Warning,
  Info,
  ExpandMore,
  Gavel,
  Cookie,
  DataUsage,
  Person,
  Business,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState('introduction');

  const privacySections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <Security />,
      content: [
        {
          title: 'Our Commitment',
          text: 'At ShashaPass, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our event management platform.'
        },
        {
          title: 'Scope',
          text: 'This policy applies to all users of our platform, including event organizers, attendees, vendors, and venue managers. By using ShashaPass, you agree to the collection and use of information as described in this policy.'
        },
        {
          title: 'Policy Updates',
          text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. We will notify users of significant changes through our platform or email.'
        },
      ],
    },
    {
      id: 'information',
      title: 'Information We Collect',
      icon: <DataUsage />,
      content: [
        {
          title: 'Personal Information',
          text: 'We collect information you provide directly, such as name, email address, phone number, payment details, and profile information. This includes information provided during registration, event creation, ticket purchasing, and account management.'
        },
        {
          title: 'Event Information',
          text: 'When you create or attend events, we collect event details, ticket information, attendance data, and venue information. This helps us provide better services and improve user experience.'
        },
        {
          title: 'Usage Data',
          text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, time spent, and device information. This helps us understand user behavior and improve our services.'
        },
        {
          title: 'Location Data',
          text: 'With your consent, we may collect location information to provide location-based services, such as finding nearby events or venue recommendations. You can control location sharing through your device settings.'
        },
        {
          title: 'Cookies and Tracking',
          text: 'We use cookies and similar technologies to enhance your experience, remember preferences, and analyze usage. You can control cookie settings through your browser preferences.'
        },
      ],
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: <Visibility />,
      content: [
        {
          title: 'Service Provision',
          text: 'We use your information to provide, maintain, and improve our event management services. This includes processing transactions, sending notifications, and personalizing your experience.'
        },
        {
          title: 'Communication',
          text: 'We use your contact information to send important updates, event notifications, transaction confirmations, and customer support communications. You can control your communication preferences in your account settings.'
        },
        {
          title: 'Analytics and Research',
          text: 'We analyze usage patterns and conduct research to improve our services, develop new features, and understand user needs. All analysis is done on aggregated, anonymized data.'
        },
        {
          title: 'Marketing',
          text: 'With your consent, we may use your information to send promotional communications about relevant events, features, or services. You can opt out of marketing communications at any time.'
        },
        {
          title: 'Legal Compliance',
          text: 'We use your information to comply with legal obligations, prevent fraud, and ensure platform security. This includes identity verification and transaction monitoring.'
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      icon: <Person />,
      content: [
        {
          title: 'Event Organizers',
          text: 'We share your registration and ticketing information with event organizers to facilitate event attendance and management. This includes necessary details for event entry and communication.'
        },
        {
          title: 'Venue Partners',
          text: 'We may share venue information and event details with venue partners to improve service offerings and provide comprehensive event solutions.'
        },
        {
          title: 'Service Providers',
          text: 'We work with third-party service providers for payment processing, email delivery, and analytics. We only share necessary information to enable these services.'
        },
        {
          title: 'Legal Requirements',
          text: 'We may share your information when required by law, court order, or government regulation. We will notify you of such disclosures unless prohibited by law.'
        },
        {
          title: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of our business, your information may be transferred as part of the business assets. We will notify you of any such changes.'
        },
      ],
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: <Security />,
      content: [
        {
          title: 'Technical Measures',
          text: 'We implement industry-standard security measures including SSL encryption, secure data centers, regular security audits, and vulnerability assessments to protect your information from unauthorized access.'
        },
        {
          title: 'Access Controls',
          text: 'We maintain strict access controls, employee training, and need-to-know basis for information access. Only authorized personnel can access your personal information for legitimate business purposes.'
        },
        {
          title: 'Data Encryption',
          text: 'All sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols. Payment information is tokenized to reduce risk.'
        },
        {
          title: 'Monitoring and Response',
          text: 'We maintain 24/7 security monitoring and have incident response procedures to detect and respond to security breaches promptly.'
        },
      ],
    },
    {
      id: 'rights',
      title: 'Your Privacy Rights',
      icon: <Gavel />,
      content: [
        {
          title: 'Access and Correction',
          text: 'You have the right to access, review, and update your personal information. You can correct inaccurate information through your account settings or by contacting our support team.'
        },
        {
          title: 'Data Portability',
          text: 'You can request a copy of your personal information in a structured, machine-readable format. We provide this free of charge where technically feasible.'
        },
        {
          title: 'Deletion Rights',
          text: 'You have the right to request deletion of your personal information, subject to legal obligations and legitimate business interests. We process deletion requests within 30 days.'
        },
        {
          title: 'Consent Management',
          text: 'You can withdraw consent for data processing at any time. We will respect your choices and update your preferences accordingly.'
        },
        {
          title: 'Complaint Rights',
          text: 'You have the right to lodge complaints with data protection authorities if you believe your privacy rights have been violated.'
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking Technologies',
      icon: <Cookie />,
      content: [
        {
          title: 'Essential Cookies',
          text: 'We use essential cookies that are necessary for our platform to function properly. These include session management, security, and load balancing.'
        },
        {
          title: 'Performance Cookies',
          text: 'We use performance cookies to understand how our platform is used, identify issues, and improve user experience. These cookies help us analyze traffic patterns and optimize performance.'
        },
        {
          title: 'Functional Cookies',
          text: 'We use functional cookies to remember your preferences, settings, and choices to provide personalized experience across sessions.'
        },
        {
          title: 'Marketing Cookies',
          text: 'With your consent, we use marketing cookies to deliver relevant advertisements and content based on your interests and behavior.'
        },
        {
          title: 'Cookie Control',
          text: 'You can control cookie preferences through your browser settings or our cookie consent banner. Disabling certain cookies may affect platform functionality.'
        },
      ],
    },
    {
      id: 'children',
      title: 'Children\'s Privacy',
      icon: <Person />,
      content: [
        {
          title: 'Age Restrictions',
          text: 'Our services are not intended for children under 18 years old. We do not knowingly collect personal information from children under this age.'
        },
        {
          title: 'Parental Consent',
          text: 'If we become aware that we have collected information from a child under 18, we will take steps to delete such information immediately.'
        },
        {
          title: 'Educational Resources',
          text: 'We provide resources to help parents and guardians understand online privacy and protect their children\'s personal information.'
        },
      ],
    },
    {
      id: 'international',
      title: 'International Data Transfers',
      icon: <LocationOn />,
      content: [
        {
          title: 'Global Operations',
          text: 'ShashaPass operates globally and may transfer your personal information to countries other than your own. We ensure appropriate safeguards are in place for international data transfers.'
        },
        {
          title: 'Adequacy Assessment',
          text: 'We assess the privacy protection level of destination countries and ensure adequate protection is maintained in accordance with applicable data protection laws.'
        },
        {
          title: 'Legal Frameworks',
          text: 'International data transfers are conducted under appropriate legal frameworks including GDPR Standard Contractual Clauses where applicable.'
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact and Complaints',
      icon: <Email />,
      content: [
        {
          title: 'Privacy Questions',
          text: 'If you have questions about this Privacy Policy or our privacy practices, please contact our privacy team at privacy@shashapass.com'
        },
        {
          title: 'Data Protection Officer',
          text: 'We have appointed a Data Protection Officer who oversees our privacy compliance and handles data protection inquiries.'
        },
        {
          title: 'Complaint Process',
          text: 'If you believe your privacy rights have been violated, you can file a complaint with our team or relevant data protection authorities. We investigate all complaints promptly.'
        },
        {
          title: 'Regulatory Authorities',
          text: 'We cooperate with data protection authorities and regulatory bodies in the investigation and resolution of privacy complaints.'
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
              Privacy Policy
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Your privacy is important to us. This policy explains how we collect, use, protect, and share your information when you use ShashaPass.
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
                href="#introduction"
              >
                Read Policy
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
                href="/contact"
              >
                Contact Privacy Team
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Privacy Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
        </Box>

        {privacySections.map((section, index) => (
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
                    {section.id === 'rights' && (
                      <Chip
                        label="GDPR/CCPA Compliant"
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
            Your Privacy Rights
          </Typography>
          <Typography variant="body2" paragraph>
            You have the right to access, correct, update, or delete your personal information at any time. 
            You can also control your marketing preferences and cookie settings through your account dashboard.
          </Typography>
          <Typography variant="body2" paragraph>
            For questions about this Privacy Policy or to exercise your privacy rights, please contact our privacy team:
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" paragraph>
              <strong>Privacy Team</strong><br />
              ShashaPass Inc.<br />
              123 Market Street, Suite 1000<br />
              San Francisco, CA 94105<br />
              United States
            </Typography>
            <Typography variant="body2" paragraph>
              Email:{' '}
              <Link href="mailto:privacy@shashapass.com" color="primary.main">
                privacy@shashapass.com
              </Link>
            </Typography>
            <Typography variant="body2" paragraph>
              Phone: +1 (555) 123-4567
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" paragraph>
              This Privacy Policy is effective as of {lastUpdated} and governs your use of ShashaPass services.
            </Typography>
            <Typography variant="body2" paragraph>
              By continuing to use our platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;
