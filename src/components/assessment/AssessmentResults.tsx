import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Psychology,
  Star,
  TrendingUp,
  EmojiEvents,
  Refresh,
  GetApp,
} from '@mui/icons-material';
import { CareerAssessmentData, CareerMatchResult } from '../../services/types/assessment.types';
import { assessmentRecommendationService } from '../../services/assessment/assessment-recommendation.service';

interface AssessmentResultsProps {
  assessmentData: CareerAssessmentData;
  onClose: () => void;
  onRetake: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessmentData,
  onClose,
  onRetake
}) => {
  const getPersonalityProfile = () => {
    const traits = assessmentData.personalityTraits;
    const profile = [];
    
    if (traits.openness >= 5) profile.push('Innovative');
    if (traits.conscientiousness >= 5) profile.push('Organized');
    if (traits.extraversion >= 5) profile.push('Social');
    if (traits.agreeableness >= 5) profile.push('Collaborative');
    if (traits.neuroticism <= 3) profile.push('Resilient');
    
    return profile.length > 0 ? profile : ['Balanced'];
  };

  const getWorkStyleSummary = () => {
    const style = assessmentData.workStylePreferences;
    const summary = [];
    
    if (style.teamOriented >= 5) summary.push('Team-oriented');
    else summary.push('Independent');
    
    if (style.structuredFlexible >= 5) summary.push('Flexible');
    else summary.push('Structured');
    
    if (style.analyticalCreative >= 5) summary.push('Creative');
    else summary.push('Analytical');
    
    return summary.join(', ');
  };

  const getTopValues = () => {
    const values = assessmentData.careerValues;
    const valueEntries = Object.entries(values);
    
    return valueEntries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        score: value
      }));
  };

  // State for real career recommendations
  const [careerRecommendations, setCareerRecommendations] = React.useState<CareerMatchResult[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = React.useState(true);

  // Load real recommendations when component mounts
  React.useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recommendations = await assessmentRecommendationService.getAssessmentBasedRecommendations(
          assessmentData.userId,
          { limit: 3, minConfidence: 70 }
        );
        setCareerRecommendations(recommendations);
      } catch (error) {
        console.error('Error loading recommendations for results:', error);
        // Fall back to mock data if needed
        setCareerRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [assessmentData.userId]);

  return (
    <Box sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Your Career Assessment Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover careers that match your unique personality and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Personality Profile */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Psychology color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Personality Profile
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                {getPersonalityProfile().map((trait) => (
                  <Chip
                    key={trait}
                    label={trait}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Work Style:</strong> {getWorkStyleSummary()}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Environment:</strong> {' '}
                {assessmentData.workEnvironmentPreferences.remotePreference === 'remote' ? 'Remote-friendly' :
                 assessmentData.workEnvironmentPreferences.remotePreference === 'hybrid' ? 'Hybrid work' : 'Office-based'}
                {' • '}
                {assessmentData.workEnvironmentPreferences.companySizePreference} companies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Values */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Top Career Values
                </Typography>
              </Box>
              
              {getTopValues().map((value, index) => (
                <Box key={value.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {index + 1}. {value.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.score}/7
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(value.score / 7) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Career Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Career Recommendations
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {loadingRecommendations ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <LinearProgress sx={{ width: 200, mx: 'auto', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Generating your personalized career recommendations...
                      </Typography>
                    </Box>
                  </Grid>
                ) : careerRecommendations.length > 0 ? (
                  careerRecommendations.map((career, index) => (
                    <Grid item xs={12} md={4} key={career.careerId}>
                      <Paper sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ backgroundColor: 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                            {career.overallMatch}%
                          </Typography>
                        </Box>
                        
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {career.careerTitle}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {career.reasoning.length > 100 ? 
                            career.reasoning.substring(0, 100) + '...' : 
                            career.reasoning}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Match Breakdown:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={`Personality: ${career.personalityFit}%`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={`Skills: ${career.skillsAlignment}%`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={`Values: ${career.valuesAlignment}%`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>
                        
                        <Box>
                          {career.strengthAreas.slice(0, 2).map((strength, i) => (
                            <Chip
                              key={i}
                              label={strength.length > 20 ? strength.substring(0, 20) + '...' : strength}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No career recommendations found. Please try retaking the assessment.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Interests & Skills */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Your Interests & Preferred Activities
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Technical Interests:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {assessmentData.skillsAndInterests.technicalInterests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preferred Activities:
                  </Typography>
                  <Box>
                    {assessmentData.skillsAndInterests.preferredActivities.map((activity) => (
                      <Chip
                        key={activity}
                        label={activity}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRetake}
        >
          Retake Assessment
        </Button>
        <Button
          variant="outlined"
          startIcon={<GetApp />}
        >
          Download Results
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          size="large"
        >
          View Career Matches
        </Button>
      </Box>
    </Box>
  );
};

export default AssessmentResults;