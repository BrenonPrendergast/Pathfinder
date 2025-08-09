import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Work,
  AttachMoney,
  TrendingUp,
  School,
  Assignment,
  Star,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { careerService, questService, Career, Quest } from '../services';
import { useAuth } from '../contexts/AuthContext';

const CareerDetailPage: React.FC = () => {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  const [career, setCareer] = useState<Career | null>(null);
  const [relatedQuests, setRelatedQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (careerId) {
      loadCareerData();
    }
  }, [careerId]);

  const loadCareerData = async () => {
    if (!careerId) return;

    try {
      setLoading(true);
      const [careerData, questsData] = await Promise.all([
        careerService.getCareer(careerId),
        questService.getQuestsForCareer(careerId)
      ]);

      if (careerData) {
        setCareer(careerData);
        setRelatedQuests(questsData);
      } else {
        setError('Career not found');
      }
    } catch (error) {
      setError('Failed to load career details. Please try again later.');
      console.error('Error loading career:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !career) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/careers')}
          sx={{ mb: 2 }}
        >
          Back to Careers
        </Button>
        <Alert severity="error">
          {error || 'Career not found'}
        </Alert>
      </Box>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatSalary = (salary?: { min: number; max: number; median: number }) => {
    if (!salary) return 'Salary information not available';
    return `$${(salary.min / 1000).toFixed(0)}K - $${(salary.max / 1000).toFixed(0)}K (Median: $${(salary.median / 1000).toFixed(0)}K)`;
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'hard': return 'primary';
      case 'soft': return 'secondary';
      case 'transferable': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/careers')}
        sx={{ mb: 3 }}
      >
        Back to Careers
      </Button>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Work color="primary" sx={{ fontSize: 32 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              {career.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              O*NET Code: {career.onetCode}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={career.difficulty} 
            color={getDifficultyColor(career.difficulty) as any}
          />
          <Chip 
            label={`${career.estimatedTimeToMaster} months to master`} 
            icon={<TrendingUp />}
            variant="outlined"
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {career.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Skills Required */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Skills Required
              </Typography>
              <Grid container spacing={2}>
                {career.skills.map((skill, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">
                          {skill.skillName}
                        </Typography>
                        <Chip 
                          label={skill.skillType} 
                          size="small" 
                          color={getSkillTypeColor(skill.skillType) as any}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(skill.proficiencyLevel / 5) * 100} 
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Level {skill.proficiencyLevel}/5 {skill.isRequired && '(Required)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ~{skill.estimatedHours}h to learn
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Related Quests */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Learning Quests ({relatedQuests.length})
              </Typography>
              {relatedQuests.length > 0 ? (
                <List>
                  {relatedQuests.map((quest, index) => (
                    <React.Fragment key={quest.id}>
                      <ListItem>
                        <ListItemText
                          primary={quest.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {quest.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip label={quest.type} size="small" />
                                <Chip label={quest.difficulty} size="small" variant="outlined" />
                                <Chip label={`${quest.xpReward} XP`} size="small" color="primary" />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < relatedQuests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No learning quests available for this career yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Salary Info */}
          {career.averageSalary && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AttachMoney color="success" />
                  <Typography variant="h6">Salary Range</Typography>
                </Box>
                <Typography variant="body1" color="success.main">
                  {formatSalary(career.averageSalary)}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Job Outlook */}
          {career.jobOutlook && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp color="info" />
                  <Typography variant="h6">Job Outlook</Typography>
                </Box>
                <Typography variant="body2">
                  {career.jobOutlook}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Take Action
              </Typography>
              {currentUser ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="contained" startIcon={<Star />}>
                    Set as Career Goal
                  </Button>
                  <Button variant="outlined" startIcon={<Assignment />}>
                    View Related Quests
                  </Button>
                  <Button variant="outlined" startIcon={<School />}>
                    Find Learning Resources
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sign in to set career goals and track your progress.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CareerDetailPage;