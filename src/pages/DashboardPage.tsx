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
  Container,
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
  Today,
  Insights,
  LocalFireDepartment,
  Psychology,
  MenuBook,
  AccessTime,
  Dashboard,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { questRecommendationService, QuestRecommendation } from '../services';
import GradientText from '../components/GradientText';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';

const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [quickRecommendations, setQuickRecommendations] = useState<QuestRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

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


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <InteractiveSpotlight size="large" intensity="subtle" color="primary" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ textAlign: 'left', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Dashboard sx={{ fontSize: { xs: 32, md: 40 }, color: '#00B162' }} />
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(to right, #6366f1, #c7d2fe)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  display: 'inline',
                }}
              >
                Welcome back, 
              </Typography>
              <Typography
                variant="h2"
                component="span"
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#00B162',
                  ml: 1,
                  fontWeight: 600,
                }}
              >
                {userProfile.displayName || 'Pathfinder'}!
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* === OVERVIEW SECTION === */}
        {/* Welcome Stats Overview */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
          }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Level Progress */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalFireDepartment sx={{ mr: 1, color: '#00B162' }} />
                    <Typography variant="h5" sx={{ mr: 2 }}>
                      Level {userProfile.level}
                    </Typography>
                    <Chip 
                      label={`${userProfile.totalXP.toLocaleString()} XP`} 
                      sx={{ backgroundColor: '#00B162', color: 'white' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress to Level {userProfile.level + 1}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={xpProgress.percentage} 
                    sx={{ 
                      mb: 1, 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00B162',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.max(0, xpProgress.required - xpProgress.current).toLocaleString()} XP to next level
                  </Typography>
                </Grid>
                
                {/* Quick Stats Grid */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Assignment sx={{ fontSize: 32, color: '#6366f1', mb: 1 }} />
                        <Typography variant="h6" color="primary">
                          {userProfile.completedQuests.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Quests Done
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <EmojiEvents sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                        <Typography variant="h6" color="warning.main">
                          {userProfile.unlockedAchievements.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Achievements
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <TrendingUp sx={{ fontSize: 32, color: '#00B162', mb: 1 }} />
                        <Typography variant="h6" sx={{ color: '#00B162' }}>
                          {userProfile.careerPaths.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Career Paths
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Speed sx={{ fontSize: 32, color: '#8b5cf6', mb: 1 }} />
                        <Typography variant="h6" color="secondary">
                          {Object.keys(userProfile.skillHours).length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Skills Tracked
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Focus */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Today sx={{ mr: 1, color: '#6366f1' }} />
                <GradientText variant="h6" component="h3">
                  Today's Focus
                </GradientText>
              </Box>
              <List dense>
                {userProfile.activeQuests.length > 0 ? (
                  <>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PlayArrow color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Continue Active Quests"
                        secondary={`${userProfile.activeQuests.length} in progress`}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <AccessTime color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Recommended Study Time"
                        secondary="30-60 minutes"
                      />
                    </ListItem>
                  </>
                ) : (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Lightbulb color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Start Your First Quest"
                      secondary="Begin your learning journey"
                    />
                  </ListItem>
                )}
              </List>
              <Button 
                variant="contained"
                size="small"
                fullWidth
                startIcon={<Assignment />}
                onClick={() => navigate('/quests')}
                sx={{
                  mt: 2,
                  backgroundColor: '#00B162',
                  '&:hover': {
                    backgroundColor: '#009654',
                  },
                }}
              >
                Browse Quests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Insights sx={{ mr: 1, color: '#8b5cf6' }} />
                <GradientText variant="h6" component="h3">
                  Recent Activity
                </GradientText>
              </Box>
              <List dense>
                {userProfile.unlockedAchievements.length > 0 ? (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EmojiEvents color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Achievement Unlocked"
                      secondary="Latest accomplishment"
                    />
                  </ListItem>
                ) : null}
                {userProfile.completedQuests.length > 0 ? (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: '#00B162' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Quest Completed"
                      secondary="Keep up the momentum!"
                    />
                  </ListItem>
                ) : (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Star color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Welcome to Pathfinder!"
                      secondary="Your journey begins now"
                    />
                  </ListItem>
                )}
                {topSkills.length > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <TrendingUp sx={{ color: '#00B162' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${topSkills[0][0].split('_').join(' ')} Skill`}
                      secondary={`${topSkills[0][1]} hours practiced`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MenuBook sx={{ mr: 1, color: '#00B162' }} />
                <GradientText variant="h6" component="h3">
                  Quick Actions
                </GradientText>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<Work />}
                  onClick={() => navigate('/careers')}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: '#6366f1',
                    },
                  }}
                >
                  Explore Careers
                </Button>
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<Timeline />}
                  onClick={() => navigate('/skill-tree')}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: '#6366f1',
                    },
                  }}
                >
                  View Skills
                </Button>
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<EmojiEvents />}
                  onClick={() => navigate('/achievements')}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: '#6366f1',
                    },
                  }}
                >
                  Achievements
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* === PROGRESS SECTION === */}

        {/* Career Progress Overview */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
          }}>
            <CardContent>
              <GradientText
                variant="h5"
                component="h2"
                sx={{ mb: 2 }}
              >
                🎯 Career Progress Overview
              </GradientText>
              
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
                    sx={{
                      backgroundColor: '#00B162',
                      '&:hover': {
                        backgroundColor: '#009654',
                      },
                    }}
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
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <GradientText
                variant="h6"
                component="h3"
                sx={{ mb: 2 }}
              >
                📈 Skill Development
              </GradientText>
              
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
          <Card sx={{ 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <GradientText
                variant="h6"
                component="h3"
                sx={{ mb: 2 }}
              >
                Active Quests
              </GradientText>
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
                    sx={{
                      backgroundColor: '#00B162',
                      '&:hover': {
                        backgroundColor: '#009654',
                      },
                    }}
                  >
                    Browse Quests
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>




      </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default DashboardPage;