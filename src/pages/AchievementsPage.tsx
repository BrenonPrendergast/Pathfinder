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
} from '@mui/material';
import {
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import { achievementService, Achievement } from '../services';
import { useAuth } from '../contexts/AuthContext';

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
    
    const { type, targetValue, skillId } = achievement.criteria;
    
    switch (type) {
      case 'level_reached':
        return `Level ${userProfile.level}/${targetValue}`;
      case 'quest_count':
        return `${userProfile.completedQuests.length}/${targetValue} quests`;
      case 'skill_hours':
        if (skillId && userProfile.skillHours[skillId]) {
          return `${userProfile.skillHours[skillId]}/${targetValue} hours`;
        }
        return `0/${targetValue} hours`;
      default:
        return '';
    }
  };

  const getProgress = (achievement: Achievement) => {
    if (!userProfile) return 0;
    
    const { type, targetValue, skillId } = achievement.criteria;
    
    switch (type) {
      case 'level_reached':
        return Math.min((userProfile.level / targetValue) * 100, 100);
      case 'quest_count':
        return Math.min((userProfile.completedQuests.length / targetValue) * 100, 100);
      case 'skill_hours':
        if (skillId && userProfile.skillHours[skillId]) {
          return Math.min((userProfile.skillHours[skillId] / targetValue) * 100, 100);
        }
        return 0;
      default:
        return 0;
    }
  };

  const unlockedAchievements = achievements.filter(a => isAchievementUnlocked(a.id));
  const lockedAchievements = achievements.filter(a => !isAchievementUnlocked(a.id));

  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.pointsReward, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Achievements 🏆
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Unlock badges and earn points by completing various challenges and milestones.
      </Typography>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Chip 
          label={`${unlockedAchievements.length}/${achievements.length} Unlocked`} 
          color="primary" 
          size="medium"
        />
        <Chip 
          label={`${totalPoints} Total Points`} 
          color="secondary" 
          size="medium"
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
        <Tabs value={tabValue} onChange={handleTabChange}>
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
              <Card sx={{ height: '100%', position: 'relative' }}>
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
                      label={`${achievement.pointsReward} pts`} 
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
                <Card sx={{ height: '100%', position: 'relative', opacity: 0.7 }}>
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
                        label={`${achievement.pointsReward} pts`} 
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
                  opacity: unlocked ? 1 : 0.7 
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
                        label={`${achievement.pointsReward} pts`} 
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
  );
};

export default AchievementsPage;