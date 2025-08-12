import React from 'react';
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
import GradientText from '../components/GradientText';
import BackgroundShape from '../components/BackgroundShape';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import DynamicGradients from '../components/backgrounds/DynamicGradients';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

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

  const stats = [
    { icon: <People />, label: 'Active Learners', value: '1,000+' },
    { icon: <Work />, label: 'Career Paths', value: '500+' },
    { icon: <School />, label: 'Learning Quests', value: '2,000+' },
    { icon: <EmojiEvents />, label: 'Achievements', value: '100+' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <DynamicGradients variant="aurora" speed="medium" intensity="subtle" />
      <InteractiveSpotlight size="large" intensity="medium" color="multi" />

      {/* Legacy Background Shape for compatibility */}
      <BackgroundShape 
        variant="blur-gray"
        position={{ 
          top: 0,
          left: '50%',
          transform: 'translateX(-50%) translateY(-20%)',
        }}
        opacity={0.3}
        zIndex={-3}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
          <GradientText
            variant="h1"
            component="h1" 
            animated={true}
            data-aos="fade-up"
            sx={{ 
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            🎮 Pathfinder
          </GradientText>
          
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
                sx={{ fontSize: '1.1rem', px: 5, py: 1.5 }}
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
        <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
          {/* Background decoration */}
          <BackgroundShape 
            variant="blur"
            position={{ 
              bottom: 0,
              left: '50%',
              transform: 'translateX(-120%) translateY(50%)',
            }}
            opacity={0.5}
            zIndex={-1}
          />
          
          {/* Section header with decorative elements */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
                variant="body2"
                sx={{
                  background: 'linear-gradient(to right, #6366f1, #c7d2fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Game-Changing Features
              </Typography>
            </Box>
            
            <GradientText
              variant="h2"
              component="h2"
              animated={true}
              sx={{ mb: 3 }}
            >
              How It Works
            </GradientText>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto',
                fontSize: '1.125rem',
                opacity: 0.8,
              }}
            >
              Pathfinder gamifies career development with RPG-style progression, 
              making professional growth engaging and rewarding.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      pt: 4,
                      px: 3,
                      pb: 2,
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
                      }}
                    >
                      {feature.description}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={feature.action}
                      sx={{ minWidth: '140px' }}
                    >
                      {feature.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Card 
          sx={{ 
            py: 8, 
            mb: 8,
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
          }}
        >
          <CardContent>
            <GradientText
              variant="h3" 
              component="h2" 
              sx={{ textAlign: 'center', mb: 6 }}
              animated={true}
            >
              Join the Community
            </GradientText>
            
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
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
            py: { xs: 8, md: 12 },
            position: 'relative',
          }}
        >
          {/* Background decoration for CTA */}
          <BackgroundShape 
            variant="blur"
            position={{ 
              bottom: 0,
              left: '50%',
              transform: 'translateX(20%) translateY(60%)',
            }}
            opacity={0.4}
            zIndex={-1}
          />
          
          <GradientText
            variant="h3"
            component="h2"
            sx={{ mb: 4 }}
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
              mb: 6, 
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
                  background: 'linear-gradient(135deg, #059669, #6366f1)',
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