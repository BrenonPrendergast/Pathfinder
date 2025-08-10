import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Star,
  Work,
  Schedule,
  Assessment,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Timeline,
  Insights,
  MonetizationOn,
  Speed,
  Psychology,
  School,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { careerRecommendationService } from '../services/recommendation/career-recommendation.service';
import { CareerRecommendation } from '../services/types/skill.types';
import { Career, careerService } from '../services';

interface CareerRecommendationsProps {
  userSkills?: Record<string, number>;
  maxRecommendations?: number;
}

interface UserSkillProfile {
  userId: string;
  skills: Record<string, number>;
  certifications: string[];
  experienceYears: number;
  currentRole?: string;
  preferredIndustries?: string[];
  salaryExpectations?: { min: number; max: number };
}

const CareerRecommendations: React.FC<CareerRecommendationsProps> = ({
  userSkills = {},
  maxRecommendations = 10
}) => {
  const theme = useTheme();
  const { currentUser, userProfile } = useAuth();

  // State management
  const [tabValue, setTabValue] = useState(0);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [trendingCareers, setTrendingCareers] = useState<{
    career: Career;
    trendScore: number;
    reason: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // Load recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!currentUser || !userProfile) return;
      
      setLoading(true);
      try {
        // Build user skill profile
        const skillProfile: UserSkillProfile = {
          userId: currentUser.uid,
          skills: userProfile.skillProficiencies || userSkills,
          certifications: [], // TODO: Get from user certifications
          experienceYears: calculateExperienceYears(userProfile.createdAt),
          currentRole: userProfile.currentCareerPath,
          preferredIndustries: userProfile.learningPreferences?.focusAreas || [],
          salaryExpectations: undefined // TODO: Add to user profile
        };
        
        // Get personalized recommendations
        const personalizedRecs = await careerRecommendationService.getCareerRecommendations(
          skillProfile,
          {
            limit: maxRecommendations,
            includeCurrentRole: false,
            minConfidence: 50
          }
        );
        setRecommendations(personalizedRecs);
        
        // Get trending careers
        const trending = await careerRecommendationService.getTrendingCareers(8);
        setTrendingCareers(trending);
      } catch (error) {
        console.error('Error loading career recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [currentUser, userProfile, userSkills, maxRecommendations]);

  // Calculate experience years from user creation date
  const calculateExperienceYears = (createdAt: Date): number => {
    const now = new Date();
    const diffYears = now.getFullYear() - createdAt.getFullYear();
    return Math.max(0, diffYears);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle accordion expansion
  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Get match level color and text
  const getMatchLevel = (percentage: number): { color: string; text: string; level: 'low' | 'medium' | 'high' | 'excellent' } => {
    if (percentage >= 85) return { color: theme.palette.success.main, text: 'Excellent Match', level: 'excellent' };
    if (percentage >= 70) return { color: theme.palette.info.main, text: 'High Match', level: 'high' };
    if (percentage >= 55) return { color: theme.palette.warning.main, text: 'Good Match', level: 'medium' };
    return { color: theme.palette.error.main, text: 'Growth Opportunity', level: 'low' };
  };

  // Get readiness timeline color and text
  const getReadinessTimeline = (months: number): { color: string; text: string } => {
    if (months === 0) return { color: theme.palette.success.main, text: 'Ready Now' };
    if (months <= 3) return { color: theme.palette.info.main, text: `${months} month${months > 1 ? 's' : ''}` };
    if (months <= 12) return { color: theme.palette.warning.main, text: `${months} months` };
    const years = Math.round(months / 12 * 10) / 10;
    return { color: theme.palette.error.main, text: `~${years} year${years > 1 ? 's' : ''}` };
  };

  // Render recommendation card
  const renderRecommendationCard = (recommendation: CareerRecommendation, index: number) => {
    const matchLevel = getMatchLevel(recommendation.matchPercentage);
    const timeline = getReadinessTimeline(recommendation.estimatedTimeToReady);
    
    return (
      <Card
        key={recommendation.careerId}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: index === 0 ? `2px solid ${theme.palette.primary.main}` : undefined,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          }
        }}
      >
        {/* Top Recommendation Badge */}
        {index === 0 && (
          <Box sx={{ position: 'absolute', top: -8, left: 16, zIndex: 1 }}>
            <Chip
              label="Top Match"
              color="primary"
              size="small"
              icon={<Star />}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: index === 0 ? 1 : 0 }}>
            <Avatar
              sx={{
                backgroundColor: matchLevel.color,
                width: 48,
                height: 48
              }}
            >
              <Work />
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: matchLevel.color, fontWeight: 700 }}>
                {recommendation.matchPercentage}%
              </Typography>
              <Typography variant="caption" sx={{ color: matchLevel.color }}>
                {matchLevel.text}
              </Typography>
            </Box>
          </Box>

          {/* Career Title */}
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
            {recommendation.careerTitle}
          </Typography>

          {/* Key Metrics */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={timeline.text}
              size="small"
              icon={<Schedule />}
              sx={{ backgroundColor: `${timeline.color}20`, color: timeline.color }}
            />
            <Chip
              label={`${recommendation.confidenceScore}% confidence`}
              size="small"
              icon={<Assessment />}
              variant="outlined"
            />
          </Box>

          {/* Matching Skills */}
          {recommendation.matchingSkills.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                Matching Skills ({recommendation.matchingSkills.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {recommendation.matchingSkills.slice(0, 4).map((skillId) => (
                  <Chip
                    key={skillId}
                    label={skillId.replace('_', ' ')}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
                {recommendation.matchingSkills.length > 4 && (
                  <Chip
                    label={`+${recommendation.matchingSkills.length - 4} more`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', opacity: 0.7 }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Reasoning */}
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {recommendation.reasoning}
          </Typography>

          {/* Skill Gaps Accordion */}
          {recommendation.missingSkills.length > 0 && (
            <Accordion 
              expanded={expandedAccordion === recommendation.careerId} 
              onChange={handleAccordionChange(recommendation.careerId)}
              sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Skills to Develop ({recommendation.missingSkills.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <List dense>
                  {recommendation.missingSkills.map((missingSkill, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <RadioButtonUnchecked sx={{ fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={missingSkill.skillId.replace('_', ' ')}
                        secondary={`${missingSkill.gap} level${missingSkill.gap > 1 ? 's' : ''} needed`}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>

        {/* Actions */}
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Insights />}
            onClick={() => window.open(`/careers/${recommendation.careerId}`, '_blank')}
          >
            Explore Career
          </Button>
        </Box>
      </Card>
    );
  };

  // Render trending career card
  const renderTrendingCareerCard = (trendingCareer: { career: Career; trendScore: number; reason: string }) => {
    return (
      <Card
        key={trendingCareer.career.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                backgroundColor: theme.palette.warning.main,
                width: 48,
                height: 48
              }}
            >
              <TrendingUp />
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                {trendingCareer.trendScore}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.warning.main }}>
                Trend Score
              </Typography>
            </Box>
          </Box>

          {/* Career Title */}
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
            {trendingCareer.career.title}
          </Typography>

          {/* Fields */}
          {trendingCareer.career.fields && trendingCareer.career.fields.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {trendingCareer.career.fields.slice(0, 3).map((field) => (
                <Chip
                  key={field}
                  label={field}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}

          {/* Trend Reason */}
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {trendingCareer.reason}
          </Typography>

          {/* Salary Range */}
          {trendingCareer.career.averageSalary && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MonetizationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                ${trendingCareer.career.averageSalary.min.toLocaleString()} - ${trendingCareer.career.averageSalary.max.toLocaleString()}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Actions */}
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Timeline />}
            onClick={() => window.open(`/careers/${trendingCareer.career.id}`, '_blank')}
          >
            Learn More
          </Button>
        </Box>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Analyzing Your Career Potential...</Typography>
          <LinearProgress sx={{ width: 200, mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Finding the best matches based on your skills
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Career Recommendations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered career suggestions based on your skills, experience, and market trends
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              fontFamily: '"Nacelle", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab 
            icon={<Psychology />} 
            label={
              <Badge badgeContent={recommendations.length} color="primary">
                Personalized for You
              </Badge>
            }
            iconPosition="start"
          />
          <Tab 
            icon={<TrendingUp />} 
            label={
              <Badge badgeContent={trendingCareers.length} color="warning">
                Trending Careers
              </Badge>
            }
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
        {/* Personalized Recommendations Tab */}
        {tabValue === 0 && (
          <Box>
            {recommendations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Complete Your Skill Assessment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add more skills to your profile to get personalized career recommendations.
                </Typography>
                <Button variant="contained" startIcon={<School />}>
                  Update Skills
                </Button>
              </Box>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Recommendations based on:</strong> Your skill proficiency levels, experience, and current career interests. 
                    Higher percentages indicate better skill alignment and career readiness.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  {recommendations.map((recommendation, index) => (
                    <Grid item xs={12} md={6} lg={4} key={recommendation.careerId}>
                      {renderRecommendationCard(recommendation, index)}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        )}

        {/* Trending Careers Tab */}
        {tabValue === 1 && (
          <Box>
            {trendingCareers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Trending Data Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Career trend analysis will be available soon.
                </Typography>
              </Box>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Market Trends:</strong> These careers are experiencing high growth, increased demand, 
                    or emerging opportunities in the current job market.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  {trendingCareers.map((trendingCareer) => (
                    <Grid item xs={12} md={6} lg={4} key={trendingCareer.career.id}>
                      {renderTrendingCareerCard(trendingCareer)}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        )}
      </Paper>

      {/* Help Text */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Recommendations update as you develop new skills and complete quests
        </Typography>
      </Box>
    </Box>
  );
};

export default CareerRecommendations;