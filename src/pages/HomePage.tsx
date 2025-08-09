import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
  Chip,
  Stack,
} from '@mui/material';
import {
  Work,
  Assignment,
  EmojiEvents,
  TrendingUp,
  People,
  School,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const features = [
    {
      icon: <Work sx={{ fontSize: 40 }} />,
      title: 'Explore Careers',
      description: 'Discover career paths with detailed information from O*NET data, including skills, requirements, and growth projections.',
      action: () => navigate('/careers'),
      buttonText: 'Browse Careers',
      color: 'primary.main',
    },
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      title: 'Complete Quests',
      description: 'Take on learning quests to build skills, earn XP, and progress toward your career goals.',
      action: () => currentUser ? navigate('/quests') : navigate('/auth'),
      buttonText: currentUser ? 'View Quests' : 'Sign In to Start',
      color: 'secondary.main',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      title: 'Earn Achievements',
      description: 'Unlock badges and achievements as you master new skills and complete career milestones.',
      action: () => currentUser ? navigate('/achievements') : navigate('/auth'),
      buttonText: currentUser ? 'View Achievements' : 'Join Now',
      color: 'success.main',
    },
  ];

  const stats = [
    { icon: <People />, label: 'Active Learners', value: '1,000+' },
    { icon: <Work />, label: 'Career Paths', value: '500+' },
    { icon: <School />, label: 'Learning Quests', value: '2,000+' },
    { icon: <EmojiEvents />, label: 'Achievements', value: '100+' },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          🎮 Pathfinder
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
        >
          Transform your career development into an epic adventure. Level up your skills, 
          complete quests, and unlock your professional potential.
        </Typography>

        {currentUser && userProfile ? (
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <Chip 
                label={`Level ${userProfile.level}`} 
                color="primary" 
                size="medium"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip 
                label={`${userProfile.totalXP.toLocaleString()} XP`} 
                color="secondary" 
                size="medium"
              />
              <Chip 
                label={`${userProfile.completedQuests.length} Quests Completed`} 
                color="success" 
                size="medium"
              />
            </Stack>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/dashboard')}
              sx={{ fontSize: '1.1rem', px: 4, py: 1.5 }}
            >
              Continue Your Journey
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/auth')}
              sx={{ 
                fontSize: '1.1rem', 
                px: 4, 
                py: 1.5, 
                mr: 2,
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              }}
            >
              Start Your Adventure
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/careers')}
              sx={{ fontSize: '1.1rem', px: 4, py: 1.5 }}
            >
              Explore Careers
            </Button>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          How It Works
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
        >
          Pathfinder gamifies career development with RPG-style progression, 
          making professional growth engaging and rewarding.
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={feature.action}
                    endIcon={<ArrowForward />}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: 'background.paper', borderRadius: 2, mb: 6 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Join the Community
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Level Up Your Career?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}
        >
          Join thousands of professionals who are already using Pathfinder to 
          accelerate their career development through gamified learning.
        </Typography>
        {!currentUser && (
          <Button
            variant="contained"
            size="large"
            endIcon={<TrendingUp />}
            onClick={() => navigate('/auth')}
            sx={{ 
              fontSize: '1.1rem', 
              px: 4, 
              py: 1.5,
              background: 'linear-gradient(45deg, #059669, #2563eb)',
            }}
          >
            Get Started Free
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;