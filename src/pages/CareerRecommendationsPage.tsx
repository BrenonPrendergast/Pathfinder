import React from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CareerRecommendations from '../components/CareerRecommendations';
import Layout from '../components/Layout/Layout';

const CareerRecommendationsPage: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Career Recommendations
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 2,
              background: 'linear-gradient(45deg, #6366F1, #8B5CF6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Your Career Recommendations
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Discover your perfect career match with AI-powered recommendations based on your skills, experience, and market trends.
          </Typography>
          
          {userProfile && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Your Profile:</strong> Level {userProfile.level || 1} • {Object.keys(userProfile.skillProficiencies || {}).length} skills tracked • {userProfile.learningPreferences?.focusAreas?.length || 0} focus areas
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Career Recommendations Component */}
        <CareerRecommendations 
          userSkills={userProfile?.skillProficiencies || {}}
          maxRecommendations={12}
        />

        {/* Additional Information */}
        <Paper sx={{ p: 3, mt: 4, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="h6" gutterBottom>
            How Our Recommendations Work
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Our AI-powered career recommendation engine analyzes multiple factors to suggest the best career paths for you:
          </Typography>
          
          <Box component="ul" sx={{ pl: 3, mt: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Skill Analysis:</strong> Matches your current skills with career requirements from O*NET database
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Experience Level:</strong> Considers your professional experience and career progression
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Market Demand:</strong> Factors in current job market trends and growth projections
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Industry Preferences:</strong> Aligns recommendations with your preferred career fields
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>Skill Gap Analysis:</strong> Identifies development opportunities and estimated timelines
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default CareerRecommendationsPage;