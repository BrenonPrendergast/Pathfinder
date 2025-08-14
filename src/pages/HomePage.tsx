import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Chip,
  Stack,
  Card,
  CardContent,
  Button,
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
import { statsService, type SiteStats } from '../services/stats/stats.service';
import GradientText from '../components/GradientText';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';
import PathfinderLogo from '../components/PathfinderLogo';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState<SiteStats>({
    activeUsers: 0,
    careerPaths: 0,
    totalQuests: 0,
    totalAchievements: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const siteStats = await statsService.getSiteStats();
        setStats(siteStats);
      } catch (error) {
        console.error('Error loading site stats:', error);
      }
    };

    loadStats();
  }, []);

  const features = [
    {
      icon: <Work />,
      title: 'Explore Careers',
      description: 'Discover career paths with detailed information from O*NET data, including skills, requirements, and growth projections.',
      action: () => navigate('/careers'),
      buttonText: 'Browse Careers',
      iconColor: '#6366f1',
    },
    {
      icon: <Assignment />,
      title: 'Complete Quests',
      description: 'Take on learning quests to build skills, earn XP, and progress toward your career goals.',
      action: () => currentUser ? navigate('/quests') : navigate('/auth'),
      buttonText: currentUser ? 'View Quests' : 'Sign In to Start',
      iconColor: '#8b5cf6',
    },
    {
      icon: <EmojiEvents />,
      title: 'Earn Achievements',
      description: 'Unlock badges and achievements as you master new skills and complete career milestones.',
      action: () => currentUser ? navigate('/achievements') : navigate('/auth'),
      buttonText: currentUser ? 'View Achievements' : 'Join Now',
      iconColor: '#059669',
    },
  ];

  const statsDisplay = [
    { icon: <People />, label: 'Active Learners', value: statsService.formatNumber(stats.activeUsers) },
    { icon: <Work />, label: 'Career Paths', value: stats.careerPaths.toString() },
    { icon: <School />, label: 'Learning Quests', value: statsService.formatNumber(stats.totalQuests) },
    { icon: <EmojiEvents />, label: 'Achievements', value: stats.totalAchievements.toString() },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <InteractiveSpotlight size="large" intensity="subtle" color="primary" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', py: { xs: 6, md: 8 } }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2 
            }}
            data-aos="fade-up"
          >
            <PathfinderLogo size={80} />
            <GradientText
              variant="h1"
              component="h1" 
              animated={true}
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 0,
              }}
            >
              Pathfinder
            </GradientText>
          </Box>
          
          <Typography
            variant="h5"
            color="text.secondary"
            data-aos="fade-up"
            data-aos-delay={200}
            sx={{ 
              mb: 6, 
              maxWidth: '600px', 
              mx: 'auto', 
              lineHeight: 1.6,
              fontSize: { xs: '1.125rem', md: '1.25rem' },
            }}
          >
            Transform your career development into an epic adventure. Level up your skills, 
            complete quests, and unlock your professional potential.
          </Typography>

          {currentUser && userProfile ? (
            <Box sx={{ mb: 6 }} data-aos="fade-up" data-aos-delay={400}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center" 
                sx={{ mb: 4 }}
              >
                <Chip 
                  label={`Level ${userProfile.level}`} 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    fontSize: '0.9rem',
                    padding: '8px 4px',
                  }}
                />
                <Chip 
                  label={`${userProfile.totalXP.toLocaleString()} XP`} 
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                    color: 'white',
                    fontSize: '0.9rem',
                    padding: '8px 4px',
                  }}
                />
                <Chip 
                  label={`${userProfile.completedQuests.length} Quests Completed`} 
                  sx={{
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: 'white',
                    fontSize: '0.9rem',
                    padding: '8px 4px',
                  }}
                />
              </Stack>
              
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  fontSize: '1.1rem', 
                  px: 5, 
                  py: 1.5,
                  backgroundColor: '#00B162',
                  '&:hover': {
                    backgroundColor: '#009654',
                  },
                }}
              >
                Continue Your Journey
              </Button>
            </Box>
          ) : (
            <Box 
              sx={{ 
                mb: 6,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }} 
              data-aos="fade-up" 
              data-aos-delay={400}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/auth')}
                sx={{ fontSize: '1.1rem', px: 5, py: 1.5 }}
              >
                Start Your Adventure
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/careers')}
                sx={{ fontSize: '1.1rem', px: 5, py: 1.5 }}
              >
                Explore Careers
              </Button>
            </Box>
          )}
        </Box>

        {/* Features Section */}
        <Box sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 4, md: 6 }, position: 'relative' }}>
          
          {/* Section header with decorative elements */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 3, 
                mb: 3,
                '&::before, &::after': {
                  content: '""',
                  height: '1px',
                  width: 32,
                  background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.5), transparent)',
                }
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  background: 'linear-gradient(to right, #6366f1, #c7d2fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                How it Works
              </Typography>
            </Box>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto',
                fontSize: '1.125rem',
                opacity: 0.8,
                mb: 4,
              }}
            >
              Pathfinder provides a structured framework for career development, making 
              professional growth transparent and measurable. 
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      pt: 4,
                      px: 3,
                      pb: 3,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                      sx={{
                        color: feature.iconColor,
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        '& svg': {
                          fontSize: '2.5rem',
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontFamily: '"Nacelle", sans-serif',
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        opacity: 0.8,
                        mb: 3,
                        flexGrow: 1,
                      }}
                    >
                      {feature.description}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={feature.action}
                        sx={{ 
                          minWidth: '140px',
                          backgroundColor: '#00B162',
                          '&:hover': {
                            backgroundColor: '#009654',
                          },
                        }}
                      >
                        {feature.buttonText}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Card 
          sx={{ 
            py: 6, 
            mb: 4,
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
          }}
        >
          <CardContent>
            <GradientText
              variant="h3" 
              component="h2" 
              sx={{ textAlign: 'center', mb: 4 }}
              animated={true}
            >
              Join the Community
            </GradientText>
            
            <Grid container spacing={4}>
              {statsDisplay.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box 
                    sx={{ textAlign: 'center' }}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <Box sx={{ color: '#6366f1', mb: 2, fontSize: '2rem' }}>
                      {stat.icon}
                    </Box>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{
                        fontFamily: '"Nacelle", sans-serif',
                        fontWeight: 'bold', 
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ opacity: 0.8 }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 8 },
            position: 'relative',
          }}
        >
          
          <GradientText
            variant="h3"
            component="h2"
            sx={{ mb: 3 }}
            data-aos="fade-up"
          >
            Ready to Level Up Your Career?
          </GradientText>
          
          <Typography
            variant="body1"
            color="text.secondary"
            data-aos="fade-up"
            data-aos-delay={200}
            sx={{ 
              mb: 4, 
              maxWidth: '500px', 
              mx: 'auto',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              opacity: 0.9,
            }}
          >
            Join thousands of professionals who are already using Pathfinder to 
            accelerate their career development through gamified learning.
          </Typography>
          
          {!currentUser && (
            <Box data-aos="fade-up" data-aos-delay={400}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth')}
                endIcon={<TrendingUp />}
                sx={{ 
                  fontSize: '1.1rem', 
                  px: 6, 
                  py: 2,
                  backgroundColor: '#00B162',
                  '&:hover': {
                    backgroundColor: '#009654',
                  },
                }}
              >
                Get Started Free
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default HomePage;