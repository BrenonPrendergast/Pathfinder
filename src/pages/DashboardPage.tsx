import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Assignment,
  EmojiEvents,
  TrendingUp,
  PlayArrow,
  Work,
  Star,
  Speed,
  Timeline,
  CheckCircle,
  School,
  Lightbulb,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { questRecommendationService, QuestRecommendation } from '../services';
import LootyDashboard from '../components/LootyDashboard';

const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [quickRecommendations, setQuickRecommendations] = useState<QuestRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [lootyMode, setLootyMode] = useState(true); // Default to new design

  useEffect(() => {
    if (userProfile) {
      loadQuickRecommendations();
    }
  }, [userProfile]);

  const loadQuickRecommendations = async () => {
    if (!userProfile) return;
    
    try {
      setLoadingRecommendations(true);
      const recs = await questRecommendationService.getQuickRecommendations(userProfile, 3);
      setQuickRecommendations(recs);
    } catch (error) {
      console.error('Error loading quick recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (!userProfile) {
    return (
      <Box>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  const getXPProgress = () => {
    const currentLevel = userProfile.level;
    const nextLevelXP = Math.pow(2, currentLevel) * 50;
    const currentLevelXP = Math.pow(2, currentLevel - 1) * 50;
    const progressXP = userProfile.totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const percentage = Math.min((progressXP / requiredXP) * 100, 100);
    
    return {
      current: progressXP,
      required: requiredXP,
      percentage
    };
  };

  const xpProgress = getXPProgress();

  // Get top skills by hours
  const topSkills = Object.entries(userProfile.skillHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get active career path
  const activeCareerPath = userProfile.careerPaths.find(path => path.isActive);
  
  // Calculate overall progress across all career paths
  const overallProgress = userProfile.careerPaths.length > 0 
    ? userProfile.careerPaths.reduce((sum, path) => sum + path.progressPercentage, 0) / userProfile.careerPaths.length
    : 0;

  // Looty mode toggle
  if (lootyMode) {
    return (
      <>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={lootyMode}
                onChange={(e) => setLootyMode(e.target.checked)}
                color="primary"
              />
            }
            label="Looty Design"
          />
        </Box>
        <LootyDashboard />
      </>
    );
  }

  return (
    <Box>
      {/* Design Toggle */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" component="h1">
          Welcome back, {userProfile.displayName || 'Pathfinder'}! 🎮
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={lootyMode}
              onChange={(e) => setLootyMode(e.target.checked)}
              color="primary"
            />
          }
          label="Looty Design"
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Level Progress */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ mr: 2 }}>
                  Level {userProfile.level}
                </Typography>
                <Chip 
                  label={`${userProfile.totalXP.toLocaleString()} XP`} 
                  color="primary" 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress to Level {userProfile.level + 1}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={xpProgress.percentage} 
                sx={{ mb: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.max(0, xpProgress.required - xpProgress.current).toLocaleString()} XP to next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${userProfile.completedQuests.length} Quests Completed`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmojiEvents color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${userProfile.unlockedAchievements.length} Achievements`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={userProfile.currentCareerPath ? 'Career Path Set' : 'No Career Path'}
                    secondary={userProfile.currentCareerPath || 'Choose a career path to get started'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Career Progress Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Career Progress Overview
              </Typography>
              
              {userProfile.careerPaths.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    No career paths selected yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose career paths to start tracking your progress and get personalized recommendations
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Work />}
                    onClick={() => navigate('/profile')}
                  >
                    Select Career Paths
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Overall Progress */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {Math.round(overallProgress)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={overallProgress} 
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>
                  
                  {/* Career Paths */}
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                      {userProfile.careerPaths.map((careerPath) => (
                        <Grid item xs={12} sm={6} key={careerPath.careerId}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              background: careerPath.isActive 
                                ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(156, 39, 176, 0.1))'
                                : 'background.paper',
                              border: careerPath.isActive ? '2px solid' : '1px solid',
                              borderColor: careerPath.isActive ? 'primary.main' : 'divider'
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                  {careerPath.careerTitle}
                                </Typography>
                                {careerPath.isActive && (
                                  <Chip 
                                    label="Active" 
                                    size="small" 
                                    color="success"
                                    sx={{ fontSize: '0.6rem', height: 20 }}
                                  />
                                )}
                              </Box>
                              
                              <Typography variant="h6" color="primary" gutterBottom>
                                {careerPath.progressPercentage}%
                              </Typography>
                              
                              <LinearProgress 
                                variant="determinate" 
                                value={careerPath.progressPercentage} 
                                sx={{ mb: 1, height: 6, borderRadius: 3 }}
                              />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {careerPath.skillsCompleted}/{careerPath.skillsTotal} skills
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ~{careerPath.estimatedCompletionMonths}mo left
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Development */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Skill Development
              </Typography>
              
              {topSkills.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    No skills tracked yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Complete quests to start building your skill portfolio
                  </Typography>
                </Box>
              ) : (
                <List>
                  {topSkills.map(([skillId, hours], index) => {
                    const proficiency = userProfile.skillProficiencies[skillId] || 1;
                    const skillName = skillId.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    const getProficiencyLabel = (level: number) => {
                      switch(level) {
                        case 1: return { label: 'Novice', color: 'default' as const };
                        case 2: return { label: 'Beginner', color: 'info' as const };
                        case 3: return { label: 'Intermediate', color: 'warning' as const };
                        case 4: return { label: 'Advanced', color: 'secondary' as const };
                        case 5: return { label: 'Expert', color: 'success' as const };
                        default: return { label: 'Unknown', color: 'default' as const };
                      }
                    };
                    
                    const proficiencyInfo = getProficiencyLabel(proficiency);
                    
                    return (
                      <ListItem key={skillId} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Speed color={index === 0 ? 'primary' : 'action'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {skillName}
                              </Typography>
                              <Chip
                                label={proficiencyInfo.label}
                                size="small"
                                color={proficiencyInfo.color}
                                sx={{ fontSize: '0.6rem', height: 18 }}
                              />
                            </Box>
                          }
                          secondary={`${hours} hours practiced`}
                        />
                        {index === 0 && (
                          <Star color="warning" sx={{ ml: 1 }} />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Timeline />}
                  onClick={() => navigate('/skill-tree')}
                >
                  View Skill Tree
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Quests */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Quests
              </Typography>
              {userProfile.activeQuests.length > 0 ? (
                <List>
                  {userProfile.activeQuests.slice(0, 3).map((questId, index) => (
                    <ListItem key={questId}>
                      <ListItemIcon>
                        <PlayArrow />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Quest ${index + 1}`}
                        secondary="Click to continue..."
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No active quests yet
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/quests')}
                  >
                    Browse Quests
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>
              {userProfile.unlockedAchievements.length > 0 ? (
                <List>
                  {userProfile.unlockedAchievements.slice(-3).map((achievementId, index) => (
                    <ListItem key={achievementId}>
                      <ListItemIcon>
                        <EmojiEvents color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Achievement ${index + 1}`}
                        secondary="Recently unlocked"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No achievements yet
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/achievements')}
                  >
                    View All Achievements
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Personalized Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Recommendations for You
              </Typography>
              
              <Grid container spacing={2}>
                {activeCareerPath && (
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CheckCircle color="success" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">
                            Next Milestone
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Based on your {activeCareerPath.careerTitle} progress
                        </Typography>
                        <Typography variant="body2">
                          Focus on completing {activeCareerPath.skillsTotal - activeCareerPath.skillsCompleted} more skills to reach {Math.min(activeCareerPath.progressPercentage + 20, 100)}% completion.
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={() => navigate('/skill-tree')}
                        >
                          View Skills
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Assignment color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2">
                          Quest Suggestion
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {userProfile.completedQuests.length === 0 
                          ? 'Get started with your first quest'
                          : 'Continue your learning journey'
                        }
                      </Typography>
                      <Typography variant="body2">
                        {userProfile.completedQuests.length === 0
                          ? 'Try a beginner-level quest to start earning XP and building skills.'
                          : `You've completed ${userProfile.completedQuests.length} quests. Keep up the momentum!`
                        }
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/quests')}
                      >
                        Browse Quests
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Lightbulb color="warning" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2">
                          Career Tip
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Personalized insight
                      </Typography>
                      <Typography variant="body2">
                        {userProfile.careerPaths.length === 0
                          ? 'Start by selecting 1-2 career paths that interest you to get targeted skill recommendations.'
                          : topSkills.length > 0
                            ? `Your strongest skill is ${topSkills[0][0].split('_').join(' ')}. Consider taking advanced quests in this area.`
                            : 'Build a diverse skill set by completing quests from different categories.'
                        }
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        onClick={() => navigate(userProfile.careerPaths.length === 0 ? '/profile' : '/careers')}
                      >
                        {userProfile.careerPaths.length === 0 ? 'Set Goals' : 'Explore Careers'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Smart Quest Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  🤖 Smart Quest Recommendations
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/recommended-quests')}
                >
                  View All
                </Button>
              </Box>
              
              {loadingRecommendations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : quickRecommendations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Lightbulb sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    No recommendations available yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Complete a few quests and set career goals to get personalized recommendations
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {quickRecommendations.map((recommendation) => {
                    const quest = recommendation.quest;
                    const isCompleted = userProfile.completedQuests.includes(quest.id);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={quest.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            height: '100%',
                            opacity: isCompleted ? 0.6 : 1,
                            background: recommendation.score >= 80 
                              ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))'
                              : recommendation.score >= 60
                                ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))'
                                : 'background.paper',
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ flexGrow: 1, pr: 1 }}>
                                {quest.title}
                                {isCompleted && ' ✅'}
                              </Typography>
                              <Chip
                                label={`${Math.round(recommendation.score)}%`}
                                size="small"
                                color={
                                  recommendation.score >= 80 ? 'success' :
                                  recommendation.score >= 60 ? 'warning' : 'primary'
                                }
                                sx={{ fontSize: '0.6rem' }}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {quest.description.length > 100 
                                ? quest.description.substring(0, 100) + '...'
                                : quest.description
                              }
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                              <Chip 
                                label={quest.difficulty} 
                                size="small" 
                                color={
                                  quest.difficulty === 'beginner' ? 'success' :
                                  quest.difficulty === 'intermediate' ? 'warning' : 'error'
                                }
                              />
                              <Chip 
                                label={`${quest.xpReward} XP`} 
                                size="small" 
                                color="primary"
                              />
                            </Box>
                            
                            {recommendation.reasons.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                💡 {recommendation.reasons[0].message}
                              </Typography>
                            )}
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                ~{quest.estimatedHours}h
                              </Typography>
                            </Box>
                          </CardContent>
                          
                          <Box sx={{ p: 1, pt: 0 }}>
                            {isCompleted ? (
                              <Button size="small" disabled fullWidth>
                                Completed
                              </Button>
                            ) : (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                fullWidth
                                startIcon={<PlayArrow />}
                                onClick={() => navigate('/recommended-quests')}
                              >
                                View Details
                              </Button>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<Assignment />}
                  onClick={() => navigate('/quests')}
                >
                  Browse Quests
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/careers')}
                >
                  Explore Careers
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<EmojiEvents />}
                  onClick={() => navigate('/achievements')}
                >
                  View Achievements
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;