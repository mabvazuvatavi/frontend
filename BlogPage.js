import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Divider,
  Fab,
} from '@mui/material';
import {
  Search,
  CalendarToday,
  Person,
  Category,
  TrendingUp,
  ArrowForward,
  ArrowBack,
  Bookmark,
  Share,
  FilterList,
  Article,
  Event,
  Business,
  Lightbulb,
  School,
  Computer,
  NavigateNext,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BlogPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const postsPerPage = 6;

  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Event Management: AI and Automation',
      excerpt: 'Explore how artificial intelligence is revolutionizing event planning, from personalized recommendations to automated scheduling and real-time analytics.',
      content: `The event management industry is undergoing a massive transformation, driven by artificial intelligence and automation technologies. In this comprehensive guide, we explore how AI is reshaping every aspect of event planning and execution.

From intelligent venue matching algorithms that consider thousands of variables to predictive analytics that forecast attendance with unprecedented accuracy, AI is no longer a buzzword but a practical tool that event organizers can't afford to ignore.

Machine learning models can now analyze historical data to suggest optimal pricing strategies, recommend the best marketing channels, and even predict potential issues before they occur. This level of automation doesn't replace human creativity – it enhances it, allowing organizers to focus on creating memorable experiences while technology handles the logistics.`,
      author: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        role: 'CEO & Founder',
      },
      category: 'Technology',
      tags: ['AI', 'Automation', 'Innovation'],
      image: '/api/placeholder/800/400',
      date: '2024-01-15',
      readTime: '8 min read',
      featured: true,
      views: 15420,
    },
    {
      id: 2,
      title: 'Hybrid Events: Best Practices for 2024',
      excerpt: 'Learn how to successfully combine in-person and virtual experiences to maximize reach and engagement in the evolving event landscape.',
      content: `Hybrid events have become the new standard, offering the best of both worlds – the personal connection of in-person gatherings with the accessibility of virtual participation. But creating a seamless hybrid experience requires careful planning and the right technology stack.

From synchronized content delivery to real-time engagement tools that bridge physical and digital audiences, successful hybrid events demand a holistic approach. We'll share proven strategies for managing dual audiences, creating inclusive experiences, and measuring success across both environments.`,
      author: {
        name: 'Michael Chen',
        avatar: 'MC',
        role: 'CTO',
      },
      category: 'Strategy',
      tags: ['Hybrid Events', 'Virtual', 'Best Practices'],
      image: '/api/placeholder/800/400',
      date: '2024-01-12',
      readTime: '6 min read',
      featured: true,
      views: 12350,
    },
    {
      id: 3,
      title: 'NFC Technology: The Future of Event Check-in',
      excerpt: 'Discover how Near Field Communication is eliminating queues and enhancing security at events worldwide.',
      content: `Long check-in lines are a thing of the past with NFC technology. This contactless solution not only speeds up entry but provides valuable data insights and enhanced security features.

We explore the technical implementation of NFC systems, from ticket design to reader placement, and share real-world case studies from venues that have reduced check-in times by 90%. Learn about the security benefits, data analytics capabilities, and cost considerations for implementing NFC at your next event.`,
      author: {
        name: 'Emily Rodriguez',
        avatar: 'ER',
        role: 'Head of Operations',
      },
      category: 'Technology',
      tags: ['NFC', 'Security', 'Innovation'],
      image: '/api/placeholder/800/400',
      date: '2024-01-10',
      readTime: '5 min read',
      featured: false,
      views: 8920,
    },
    {
      id: 4,
      title: 'Building Community Through Events: A Marketing Guide',
      excerpt: 'Transform your events from one-time gatherings into powerful community-building tools that drive long-term engagement.',
      content: `Events are more than just transactions – they're opportunities to build lasting communities. This guide explores strategies for turning event attendees into loyal community members who return year after year.

From pre-event engagement campaigns to post-event follow-up strategies, we cover the entire community-building lifecycle. Learn how to create meaningful connections, facilitate networking, and maintain momentum between events.`,
      author: {
        name: 'David Kim',
        avatar: 'DK',
        role: 'Head of Marketing',
      },
      category: 'Marketing',
      tags: ['Community', 'Engagement', 'Strategy'],
      image: '/api/placeholder/800/400',
      date: '2024-01-08',
      readTime: '7 min read',
      featured: false,
      views: 7650,
    },
    {
      id: 5,
      title: 'Data Analytics: Measuring Event Success',
      excerpt: 'Go beyond attendance numbers and learn how to use data analytics to measure true event ROI and improve future experiences.',
      content: `Modern event platforms generate vast amounts of data. But turning that data into actionable insights requires the right approach to analytics and measurement.

We explore key metrics that matter, from engagement scores to lifetime value calculations, and show how to set up dashboards that provide real insights. Learn about A/B testing for event features, sentiment analysis of feedback, and predictive modeling for future events.`,
      author: {
        name: 'Lisa Wang',
        avatar: 'LW',
        role: 'Data Analyst',
      },
      category: 'Analytics',
      tags: ['Data', 'Analytics', 'ROI'],
      image: '/api/placeholder/800/400',
      date: '2024-01-05',
      readTime: '9 min read',
      featured: false,
      views: 6890,
    },
    {
      id: 6,
      title: 'Sustainable Events: Green Practices That Matter',
      excerpt: 'Implement environmentally friendly practices that reduce your carbon footprint without compromising the attendee experience.',
      content: `Sustainability is no longer optional in event planning. Discover practical strategies for reducing waste, choosing eco-friendly venues, and measuring your environmental impact.

From digital ticketing to sustainable catering options, we share proven approaches that make events greener while often reducing costs. Learn how to communicate your sustainability efforts to attendees and partners.`,
      author: {
        name: 'Rachel Green',
        avatar: 'RG',
        role: 'Sustainability Director',
      },
      category: 'Sustainability',
      tags: ['Green Events', 'Environment', 'Best Practices'],
      image: '/api/placeholder/800/400',
      date: '2024-01-03',
      readTime: '6 min read',
      featured: false,
      views: 5430,
    },
    {
      id: 7,
      title: 'Vendor Management: Streamlining Event Partnerships',
      excerpt: 'Build stronger relationships with vendors and streamline coordination using modern management platforms.',
      content: `Effective vendor management can make or break an event. Learn how to evaluate, onboard, and manage vendors using technology that saves time and improves communication.

We cover contract management, performance tracking, and payment processing best practices. Discover how to create a vendor ecosystem that enhances your events while reducing administrative burden.`,
      author: {
        name: 'Tom Martinez',
        avatar: 'TM',
        role: 'Vendor Relations Manager',
      },
      category: 'Operations',
      tags: ['Vendors', 'Management', 'Partnerships'],
      image: '/api/placeholder/800/400',
      date: '2024-01-01',
      readTime: '7 min read',
      featured: false,
      views: 4890,
    },
    {
      id: 8,
      title: 'Mobile Apps: Essential Tools for Modern Events',
      excerpt: 'Why every event needs a dedicated mobile app and how to choose the right features for your audience.',
      content: `Mobile apps have become essential for modern events, providing everything from digital tickets to real-time updates and networking opportunities.

We explore the must-have features for event apps, from push notifications to interactive maps and social networking capabilities. Learn about development options, integration with existing systems, and strategies for driving app adoption.`,
      author: {
        name: 'Alex Johnson',
        avatar: 'AJ',
        role: 'Mobile Developer',
      },
      category: 'Technology',
      tags: ['Mobile', 'Apps', 'User Experience'],
      image: '/api/placeholder/800/400',
      date: '2023-12-28',
      readTime: '8 min read',
      featured: false,
      views: 4210,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Posts', icon: <Article />, color: 'default' },
    { id: 'technology', name: 'Technology', icon: <Computer />, color: 'primary' },
    { id: 'strategy', name: 'Strategy', icon: <Lightbulb />, color: 'secondary' },
    { id: 'marketing', name: 'Marketing', icon: <TrendingUp />, color: 'success' },
    { id: 'analytics', name: 'Analytics', icon: <TrendingUp />, color: 'info' },
    { id: 'operations', name: 'Operations', icon: <Business />, color: 'warning' },
    { id: 'sustainability', name: 'Sustainability', icon: <Event />, color: 'success' },
  ];

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category.toLowerCase());
    return cat ? cat.color : 'default';
  };

  const featuredPosts = blogPosts.filter(post => post.featured);

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
              Blog & Insights
            </Typography>
            <Typography
              variant="h5"
              fontWeight={300}
              sx={{ mb: 4, lineHeight: 1.6, maxWidth: '800px' }}
            >
              Discover the latest trends, best practices, and innovations in event management. 
              Expert insights to help you create unforgettable experiences.
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
                href="#featured"
              >
                Featured Articles
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
                href="#all-posts"
              >
                Browse All Posts
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Featured Posts */}
      <Box id="featured" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 6 }}
          >
            Featured Articles
          </Typography>
          <Grid container spacing={4}>
            {featuredPosts.map((post, index) => (
              <Grid item xs={12} md={6} key={post.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    elevation={6}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                          label={post.category}
                          size="small"
                          color={getCategoryColor(post.category)}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.views.toLocaleString()} views
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {post.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {post.author.avatar}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {post.author.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(post.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {post.readTime}
                        </Typography>
                        <Button
                          size="small"
                          endIcon={<NavigateNext />}
                          component={Link}
                          to={`/blog/${post.id}`}
                        >
                          Read More
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

      {/* Search and Filter Section */}
      <Box id="all-posts" sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={category.icon}
                    onClick={() => setSelectedCategory(category.id)}
                    sx={{ mb: 1 }}
                  >
                    {category.name}
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* All Posts Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 6 }}
        >
          All Articles
        </Typography>
        <Grid container spacing={4}>
          {paginatedPosts.map((post, index) => (
            <Grid item xs={12} md={6} lg={4} key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={post.image}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        color={getCategoryColor(post.category)}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {post.views.toLocaleString()} views
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ lineHeight: 1.3 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                          {post.author.avatar}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {post.author.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {post.readTime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.date).toLocaleDateString()}
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<NavigateNext />}
                        component={Link}
                        to={`/blog/${post.id}`}
                      >
                        Read
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>

      {/* Newsletter Signup */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="md">
          <Paper
            elevation={6}
            sx={{
              p: 6,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Stay Updated
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Get the latest insights and trends in event management delivered straight to your inbox.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, maxWidth: 500, mx: 'auto', mt: 3 }}>
              <TextField
                fullWidth
                placeholder="Enter your email"
                variant="outlined"
              />
              <Button variant="contained" size="large">
                Subscribe
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default BlogPage;
