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
  MenuItem,
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
  Work,
  LocationOn,
  Schedule,
  TrendingUp,
  Groups,
  School,
  Send,
  Close,
  CheckCircle,
  Business,
  EmojiEvents,
  HealthAndSafety,
  Computer,
  Public,
  AttachFile,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CareersPage = () => {
  const theme = useTheme();
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationDialog, setApplicationDialog] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    coverLetter: '',
    resume: null,
  });

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '5+ years',
      salary: '$120k - $160k',
      description: 'We are looking for a Senior Frontend Developer to join our engineering team and help build the future of event management technology.',
      requirements: [
        '5+ years of experience with React.js and modern JavaScript',
        'Strong experience with Material-UI and component libraries',
        'Experience with state management (Redux, Context API)',
        'Knowledge of responsive design and cross-browser compatibility',
        'Experience with RESTful APIs and modern frontend build tools',
      ],
      responsibilities: [
        'Develop and maintain responsive web applications',
        'Collaborate with design and backend teams',
        'Write clean, maintainable, and well-documented code',
        'Participate in code reviews and technical discussions',
        'Mentor junior developers and contribute to technical decisions',
      ],
      benefits: ['Health insurance', '401(k)', 'Remote work', 'Flexible hours'],
    },
    {
      id: 2,
      title: 'Backend Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      experience: '3+ years',
      salary: '$100k - $140k',
      description: 'Join our backend team to build scalable APIs and services that power millions of event transactions.',
      requirements: [
        '3+ years of experience with Node.js and Express.js',
        'Strong knowledge of databases (PostgreSQL, MongoDB)',
        'Experience with RESTful API design and microservices',
        'Knowledge of cloud platforms (AWS, GCP, Azure)',
        'Experience with Docker and containerization',
      ],
      responsibilities: [
        'Design and implement scalable backend services',
        'Write efficient database queries and optimize performance',
        'Develop RESTful APIs and GraphQL endpoints',
        'Implement security best practices and data protection',
        'Collaborate with frontend team on API integration',
      ],
      benefits: ['Health insurance', '401(k)', 'Stock options', 'Gym membership'],
    },
    {
      id: 3,
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      experience: '4+ years',
      salary: '$110k - $150k',
      description: 'Lead product strategy and development for our event management platform, working closely with engineering and design teams.',
      requirements: [
        '4+ years of product management experience',
        'Experience with SaaS products and B2B markets',
        'Strong analytical and data-driven decision making',
        'Excellent communication and leadership skills',
        'Experience with agile development methodologies',
      ],
      responsibilities: [
        'Define product roadmap and feature priorities',
        'Conduct market research and competitive analysis',
        'Work with engineering teams to deliver features',
        'Gather and analyze user feedback',
        'Collaborate with marketing on product launches',
      ],
      benefits: ['Health insurance', '401(k)', 'Flexible work', 'Professional development'],
    },
    {
      id: 4,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      salary: '$90k - $120k',
      description: 'Create beautiful and intuitive user experiences for our event management platform.',
      requirements: [
        '3+ years of UX/UI design experience',
        'Proficiency in Figma, Sketch, or Adobe Creative Suite',
        'Strong portfolio demonstrating design process',
        'Understanding of responsive design and accessibility',
        'Experience with design systems and component libraries',
      ],
      responsibilities: [
        'Design user interfaces and user experiences',
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Collaborate with developers to implement designs',
        'Maintain and evolve our design system',
      ],
      benefits: ['Health insurance', '401(k)', 'Remote work', 'Design budget'],
    },
    {
      id: 5,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      experience: '4+ years',
      salary: '$85k - $115k',
      description: 'Lead our marketing efforts to grow brand awareness and acquire new customers for our event management platform.',
      requirements: [
        '4+ years of marketing experience',
        'Experience with digital marketing and SEO',
        'Strong analytical and data analysis skills',
        'Experience with marketing automation tools',
        'Excellent written and verbal communication',
      ],
      responsibilities: [
        'Develop and execute marketing campaigns',
        'Manage social media and content marketing',
        'Analyze marketing metrics and ROI',
        'Collaborate with sales on lead generation',
        'Manage marketing budget and vendors',
      ],
      benefits: ['Health insurance', '401(k)', 'Flexible schedule', 'Marketing budget'],
    },
  ];

  const benefits = [
    { icon: <HealthAndSafety />, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance for you and your family' },
    { icon: <TrendingUp />, title: 'Career Growth', description: 'Professional development opportunities, training budgets, and clear career paths' },
    { icon: <Computer />, title: 'Remote Work', description: 'Flexible remote work options and home office stipend' },
    { icon: <EmojiEvents />, title: 'Recognition', description: 'Performance bonuses, stock options, and employee recognition programs' },
    { icon: <Schedule />, title: 'Work-Life Balance', description: 'Flexible hours, unlimited PTO, and generous parental leave' },
    { icon: <Groups />, title: 'Team Culture', description: 'Regular team events, happy hours, and a collaborative environment' },
  ];

  const cultureValues = [
    { title: 'Innovation First', description: 'We constantly push boundaries and embrace new technologies to solve complex problems.' },
    { title: 'Customer Obsessed', description: 'Our customers are at the heart of everything we do. We listen, learn, and deliver.' },
    { title: 'Collaborative Spirit', description: 'We believe great things happen when diverse minds work together towards common goals.' },
    { title: 'Own It', description: 'We take ownership of our work, celebrate successes, and learn from failures.' },
  ];

  const handleJobApply = (job) => {
    setSelectedJob(job);
    setApplicationDialog(true);
  };

  const handleApplicationSubmit = () => {
    // Handle application submission logic here
    console.log('Application submitted:', { job: selectedJob, ...applicationForm });
    setApplicationDialog(false);
    setApplicationForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experience: '',
      coverLetter: '',
      resume: null,
    });
  };

  const handleInputChange = (field) => (event) => {
    setApplicationForm({
      ...applicationForm,
      [field]: event.target.value,
    });
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
              Join Our Team
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Help us revolutionize the event management industry. We're looking for passionate individuals who want to make an impact.
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
                href="#openings"
              >
                View Openings
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
                href="#culture"
              >
                Our Culture
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                50+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Team Members
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                15+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Open Positions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                4.8★
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Employee Satisfaction
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                100%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Remote Friendly
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Culture Section */}
      <Box id="culture" sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Our Culture & Values
          </Typography>
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {cultureValues.map((value, index) => (
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
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                      {value.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {value.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Benefits & Perks
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
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
                        bgcolor: 'primary.main',
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Job Openings Section */}
      <Box id="openings" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Current Openings
          </Typography>
          <Grid container spacing={4}>
            {jobOpenings.map((job, index) => (
              <Grid item xs={12} md={6} lg={8} key={job.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      height: '100%',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip
                            icon={<Business />}
                            label={job.department}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<LocationOn />}
                            label={job.location}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<Schedule />}
                            label={job.type}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<School />}
                            label={job.experience}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {job.salary}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {job.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Posted 2 days ago
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => handleJobApply(job)}
                        sx={{ minWidth: 120 }}
                      >
                        Apply Now
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Application Dialog */}
      <Dialog
        open={applicationDialog}
        onClose={() => setApplicationDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Apply for {selectedJob?.title}
          </Box>
          <IconButton onClick={() => setApplicationDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={applicationForm.firstName}
                onChange={handleInputChange('firstName')}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={applicationForm.lastName}
                onChange={handleInputChange('lastName')}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={applicationForm.email}
                onChange={handleInputChange('email')}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={applicationForm.phone}
                onChange={handleInputChange('phone')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Years of Experience"
                select
                value={applicationForm.experience}
                onChange={handleInputChange('experience')}
                margin="normal"
                required
              >
                <MenuItem value="0-2">0-2 years</MenuItem>
                <MenuItem value="3-5">3-5 years</MenuItem>
                <MenuItem value="6-10">6-10 years</MenuItem>
                <MenuItem value="10+">10+ years</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cover Letter"
                multiline
                rows={4}
                value={applicationForm.coverLetter}
                onChange={handleInputChange('coverLetter')}
                margin="normal"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFile />}
                sx={{ mb: 2 }}
              >
                Upload Resume
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplicationForm({ ...applicationForm, resume: e.target.files[0] })}
                />
              </Button>
              {applicationForm.resume && (
                <Typography variant="body2" color="success.main" sx={{ ml: 2 }}>
                  <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
                  {applicationForm.resume.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setApplicationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApplicationSubmit}
            startIcon={<Send />}
            disabled={!applicationForm.firstName || !applicationForm.lastName || !applicationForm.email}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CareersPage;
