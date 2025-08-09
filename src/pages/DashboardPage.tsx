import React from 'react';
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
} from '@mui/material';
import {
  Assignment,
  EmojiEvents,
  TrendingUp,
  PlayArrow,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

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

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome back, {userProfile.displayName || 'Pathfinder'}! 🎮
      </Typography>
      
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