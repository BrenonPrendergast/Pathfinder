import React from 'react';
import {
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
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Career Recommendations
        </Typography>
      </Breadcrumbs>

      {/* Simplified Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Your Career Recommendations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered career suggestions based on your skills, experience, and market trends.
        </Typography>
      </Box>

      {/* Career Recommendations Component */}
      <CareerRecommendations 
        userSkills={userProfile?.skillProficiencies || {}}
        maxRecommendations={12}
      />

      {/* Simplified Information Section */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
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
      </Box>
    </Box>
  );
};

export default CareerRecommendationsPage;