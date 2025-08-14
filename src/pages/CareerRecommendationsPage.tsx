import React from 'react';
import {
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Container,
} from '@mui/material';
import {
  Home as HomeIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CareerRecommendations from '../components/CareerRecommendations';
import GradientText from '../components/GradientText';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';

const CareerRecommendationsPage: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <InteractiveSpotlight size="large" intensity="subtle" color="primary" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4 }}>
            <Link
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                color: '#6366f1',
                '&:hover': {
                  color: '#5b21b6',
                },
              }}
            >
              <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Home
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PsychologyIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Career Recommendations
            </Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <GradientText
              variant="h2"
              component="h1"
              animated={true}
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
              }}
            >
              Your Career Recommendations
            </GradientText>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4, 
                maxWidth: '800px', 
                mx: 'auto', 
                lineHeight: 1.6,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
              }}
            >
              AI-powered career suggestions based on your skills, experience, and market trends.
            </Typography>
          </Box>

          {/* Career Recommendations Component */}
          <CareerRecommendations 
            userSkills={userProfile?.skillProficiencies || {}}
            maxRecommendations={12}
          />

          {/* Information Section */}
          <Paper sx={{ 
            mt: 4, 
            p: 3, 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
          }}>
            <Typography variant="h6" gutterBottom>
              How Our Recommendations Work
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Our AI analyzes your skills, experience, and market trends to suggest the best career paths:
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  • Skill Analysis
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Matches your skills with O*NET career requirements
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  • Market Demand
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Factors in job market trends and growth projections
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  • Experience Level
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Considers your professional experience and progression
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  • Skill Gap Analysis
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Identifies development opportunities and timelines
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default CareerRecommendationsPage;