import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import {
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import { achievementService, Achievement } from '../services';
import { useAuth } from '../contexts/AuthContext';
import GradientText from '../components/GradientText';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AchievementsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const achievementsData = await achievementService.getAchievements();
      setAchievements(achievementsData);
    } catch (error) {
      setError('Failed to load achievements. Please try again later.');
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return userProfile?.unlockedAchievements.includes(achievementId) || false;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'default';
      case 'rare': return 'primary';
      case 'epic': return 'secondary';
      case 'legendary': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return '🎯';
      case 'quest': return '⚔️';
      case 'milestone': return '🏆';
      case 'streak': return '🔥';
      case 'community': return '👥';
      default: return '🏅';
    }
  };

  const getProgressText = (achievement: Achievement) => {
    if (!userProfile) return '';
    
    const { type, value, target } = achievement.criteria;
    
    switch (type) {
      case 'xp_milestone':
        return `${userProfile.totalXP}/${value} XP`;
      case 'quest_completion':
        return `${userProfile.completedQuests.length}/${value} quests`;
      case 'skill_mastery':
        if (target && userProfile.skillHours[target]) {
          return `${userProfile.skillHours[target]}/${value} hours`;
        }
        return `0/${value} hours`;
      case 'career_path':
        return `Career exploration: ${value} paths`;
      default:
        return '';
    }
  };

  const getProgress = (achievement: Achievement) => {
    if (!userProfile) return 0;
    
    const { type, value, target } = achievement.criteria;
    
    switch (type) {
      case 'xp_milestone':
        return Math.min((userProfile.totalXP / value) * 100, 100);
      case 'quest_completion':
        return Math.min((userProfile.completedQuests.length / value) * 100, 100);
      case 'skill_mastery':
        if (target && userProfile.skillHours[target]) {
          return Math.min((userProfile.skillHours[target] / value) * 100, 100);
        }
        return 0;
      case 'career_path':
        return 50; // Placeholder
      default:
        return 0;
    }
  };

  const unlockedAchievements = achievements.filter(a => isAchievementUnlocked(a.id));
  const lockedAchievements = achievements.filter(a => !isAchievementUnlocked(a.id));

  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <GamingBackground variant="combined" intensity="medium" />
        <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
        <InteractiveSpotlight size="large" intensity="subtle" color="primary" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <InteractiveSpotlight size="large" intensity="subtle" color="primary" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          {/* Header */}
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
              Achievements
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
              Unlock badges and earn points by completing various challenges and milestones.
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Chip 
              label={`${unlockedAchievements.length}/${achievements.length} Unlocked`} 
              size="medium"
              sx={{ backgroundColor: '#6366f1', color: 'white' }}
            />
            <Chip 
              label={`${totalPoints} Total Points`} 
              size="medium"
              sx={{ backgroundColor: '#00B162', color: 'white' }}
            />
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* No Achievements */}
          {!loading && achievements.length === 0 && !error && (
            <Alert severity="info" sx={{ mb: 4 }}>
              No achievements available yet. Check back soon for new challenges!
            </Alert>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': {
                  fontFamily: '"Nacelle", sans-serif',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: '#6366f1',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6366f1',
                },
              }}
            >
              <Tab label={`Unlocked (${unlockedAchievements.length})`} />
              <Tab label={`Locked (${lockedAchievements.length})`} />
              <Tab label={`All (${achievements.length})`} />
            </Tabs>
          </Box>

      {/* Unlocked Achievements */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {unlockedAchievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card sx={{ 
                height: '100%', 
                position: 'relative',
                background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
              }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <CheckCircle color="success" />
                </Box>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>
                      {getCategoryIcon(achievement.category)}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip 
                      label={achievement.category} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={achievement.rarity} 
                      color={getRarityColor(achievement.rarity) as any}
                      size="small" 
                    />
                    <Chip 
                      label={`${achievement.xpReward} pts`} 
                      color="success"
                      size="small" 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
            {unlockedAchievements.length === 0 && (
              <Typography color="text.secondary" textAlign="center">
                No achievements unlocked yet. Complete quests and level up to earn your first badges!
              </Typography>
            )}
          </TabPanel>

      {/* Locked Achievements */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {lockedAchievements.map((achievement) => {
            const progress = getProgress(achievement);
            const progressText = getProgressText(achievement);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative', 
                  opacity: 0.7,
                  background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
                }}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Lock color="action" />
                  </Box>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="h2" sx={{ mb: 1, filter: 'grayscale(1)' }}>
                        {getCategoryIcon(achievement.category)}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {achievement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                    
                    {userProfile && progressText && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Progress: {progressText}
                        </Typography>
                        <Box sx={{ 
                          width: '100%', 
                          height: 4, 
                          backgroundColor: 'grey.200', 
                          borderRadius: 2,
                          mb: 1 
                        }}>
                          <Box sx={{ 
                            width: `${progress}%`, 
                            height: '100%', 
                            backgroundColor: 'primary.main', 
                            borderRadius: 2 
                          }} />
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Chip 
                        label={achievement.category} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={achievement.rarity} 
                        color={getRarityColor(achievement.rarity) as any}
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${achievement.xpReward} pts`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
            {lockedAchievements.length === 0 && (
              <Typography color="text.secondary" textAlign="center">
                Amazing! You've unlocked all available achievements! 🎉
              </Typography>
            )}
          </TabPanel>

      {/* All Achievements */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {achievements.map((achievement) => {
            const unlocked = isAchievementUnlocked(achievement.id);
            const progress = getProgress(achievement);
            const progressText = getProgressText(achievement);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative', 
                  opacity: unlocked ? 1 : 0.7,
                  background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
                }}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    {unlocked ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Lock color="action" />
                    )}
                  </Box>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          mb: 1, 
                          filter: unlocked ? 'none' : 'grayscale(1)' 
                        }}
                      >
                        {getCategoryIcon(achievement.category)}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {achievement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                    
                    {!unlocked && userProfile && progressText && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Progress: {progressText}
                        </Typography>
                        <Box sx={{ 
                          width: '100%', 
                          height: 4, 
                          backgroundColor: 'grey.200', 
                          borderRadius: 2,
                          mb: 1 
                        }}>
                          <Box sx={{ 
                            width: `${progress}%`, 
                            height: '100%', 
                            backgroundColor: 'primary.main', 
                            borderRadius: 2 
                          }} />
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Chip 
                        label={achievement.category} 
                        size="small" 
                        variant={unlocked ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        label={achievement.rarity} 
                        color={getRarityColor(achievement.rarity) as any}
                        size="small" 
                        variant={unlocked ? 'filled' : 'outlined'}
                      />
                      <Chip 
                        label={`${achievement.xpReward} pts`} 
                        color={unlocked ? 'success' : 'default'}
                        size="small" 
                        variant={unlocked ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          </Grid>
          </TabPanel>
        </Box>
      </Container>
    </div>
  );
};

export default AchievementsPage;