import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Grid,
  Chip,
  Avatar,
  Paper,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  Assignment,
  TrendingUp,
  School,
  Code,
  Psychology,
  Lightbulb,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CharacterAttribute {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const CharacterSheet: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading character sheet...</Typography>
      </Box>
    );
  }

  // Calculate XP progress to next level
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
      percentage,
      nextLevelXP
    };
  };

  // Calculate motivation based on recent activity
  const getMotivation = (): number => {
    const daysSinceLastActive = Math.floor(
      (new Date().getTime() - userProfile.lastActive.getTime()) / (1000 * 3600 * 24)
    );
    return Math.max(20, 100 - (daysSinceLastActive * 10));
  };

  // Calculate energy based on quest completion rate
  const getEnergy = (): number => {
    const activeQuests = userProfile.activeQuests.length;
    const completedQuests = userProfile.completedQuests.length;
    if (activeQuests === 0 && completedQuests === 0) return 80;
    const completionRate = completedQuests / (completedQuests + activeQuests);
    return Math.min(100, 50 + (completionRate * 50));
  };

  // Calculate character attributes based on user data
  const getCharacterAttributes = (): CharacterAttribute[] => {
    const skillHours = userProfile.skillHours;
    const totalHours = Object.values(skillHours).reduce((sum, hours) => sum + hours, 0);
    const completedQuests = userProfile.completedQuests.length;
    
    return [
      {
        name: 'Learning Aptitude',
        value: Math.min(20, Math.floor(totalHours / 10) + 8),
        icon: <School sx={{ fontSize: 16 }} />,
        color: theme.palette.primary.main
      },
      {
        name: 'Problem Solving',
        value: Math.min(20, Math.floor(completedQuests / 2) + 6),
        icon: <Psychology sx={{ fontSize: 16 }} />,
        color: theme.palette.secondary.main
      },
      {
        name: 'Technical Skills',
        value: Math.min(20, Math.floor((skillHours.javascript || 0) / 20) + 
               Math.floor((skillHours.python || 0) / 20) + 5),
        icon: <Code sx={{ fontSize: 16 }} />,
        color: theme.palette.success.main
      },
      {
        name: 'Creativity',
        value: Math.min(20, Math.floor((skillHours['user-research'] || 0) / 15) + 
               Math.floor(userProfile.level / 2) + 4),
        icon: <Lightbulb sx={{ fontSize: 16 }} />,
        color: theme.palette.warning.main
      }
    ];
  };

  // Get active career paths (campaigns)
  const getActiveCampaigns = () => {
    const campaigns = [];
    if (userProfile.currentCareerPath) {
      campaigns.push({
        name: `${userProfile.currentCareerPath} Journey`,
        status: 'Active',
        progress: 65
      });
    }
    
    // Add some example campaigns based on skills
    if (userProfile.skillHours.javascript && userProfile.skillHours.javascript > 20) {
      campaigns.push({
        name: 'Frontend Developer Quest',
        status: 'In Progress',
        progress: Math.min(100, (userProfile.skillHours.javascript / 100) * 100)
      });
    }
    
    if (userProfile.skillHours.python && userProfile.skillHours.python > 15) {
      campaigns.push({
        name: 'Data Science Adventure',
        status: 'Available',
        progress: 0
      });
    }

    return campaigns.slice(0, 3); // Limit to 3 campaigns
  };

  // Get top achievements as "inventory items"
  const getInventoryBadges = () => {
    const badges = [];
    
    // Add achievement-based badges
    if (userProfile.completedQuests.length > 0) {
      badges.push({ type: 'Quest Master', icon: '🎯', earned: true });
    }
    
    if (userProfile.level >= 5) {
      badges.push({ type: 'Level Up!', icon: '⭐', earned: true });
    }
    
    if (userProfile.skillHours.javascript && userProfile.skillHours.javascript > 50) {
      badges.push({ type: 'JS Ninja', icon: '🥷', earned: true });
    }

    // Add empty slots
    while (badges.length < 6) {
      badges.push({ type: '', icon: '', earned: false });
    }
    
    return badges;
  };

  const xpProgress = getXPProgress();
  const motivation = getMotivation();
  const energy = getEnergy();
  const attributes = getCharacterAttributes();
  const campaigns = getActiveCampaigns();
  const badges = getInventoryBadges();

  return (
    <Box 
      sx={{ 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
        p: 3,
        borderRadius: 2
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 1200, 
          mx: 'auto',
          background: 'linear-gradient(135deg, #1e2328 0%, #2a2f3a 100%)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            
            {/* Left Column: Character Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="caption" sx={{ color: 'primary.main', textTransform: 'uppercase', fontWeight: 600 }}>
                  Level
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'white' }}>
                  {userProfile.level}
                </Typography>
                <Typography variant="h6" sx={{ color: 'grey.300', mt: 1 }}>
                  {userProfile.displayName || 'Anonymous Pathfinder'}
                </Typography>
              </Box>

              {/* Progress Bars */}
              <Box sx={{ mt: 4, space: 3 }}>
                {/* Experience */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
                    Experience
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={xpProgress.percentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    {userProfile.totalXP.toLocaleString()} / {xpProgress.nextLevelXP.toLocaleString()} XP
                  </Typography>
                </Box>

                {/* Motivation */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
                    Motivation
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={motivation} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    {motivation} / 100
                  </Typography>
                </Box>

                {/* Energy */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
                    Energy
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={energy} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    {energy} / 100
                  </Typography>
                </Box>
              </Box>

              {/* Character Attributes */}
              <Box sx={{ pt: 3, mt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h6" sx={{ color: 'grey.200', mb: 2, fontWeight: 600 }}>
                  Character Attributes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {attributes.map((attr, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: attr.color }}>
                          {attr.icon}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'grey.400' }}>
                          {attr.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={attr.value} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Center Column: Avatar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Paper 
                  sx={{ 
                    height: 280, 
                    width: 220, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Avatar
                    src={userProfile.photoURL}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      fontSize: '3rem',
                      backgroundColor: theme.palette.primary.main
                    }}
                  >
                    {userProfile.displayName?.[0] || '🎮'}
                  </Avatar>
                  
                  {/* Level badge overlay */}
                  <Chip
                    label={`LVL ${userProfile.level}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Paper>

                <Typography variant="body2" sx={{ color: 'grey.400', textAlign: 'center' }}>
                  Your Pathfinder Avatar
                </Typography>
              </Box>
            </Grid>

            {/* Right Column: Campaigns & Badges */}
            <Grid item xs={12} md={4}>
              {/* Campaigns */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: 'grey.200', mb: 2, fontWeight: 600 }}>
                  Active Campaigns
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {campaigns.length > 0 ? campaigns.map((campaign, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: campaign.status === 'Active' 
                          ? 'rgba(139, 92, 246, 0.1)' 
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                          {campaign.name}
                        </Typography>
                        <Chip 
                          label={campaign.status}
                          size="small"
                          color={campaign.status === 'Active' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                      {campaign.progress > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={campaign.progress}
                          sx={{ 
                            mt: 1, 
                            height: 4, 
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.1)'
                          }}
                        />
                      )}
                    </Paper>
                  )) : (
                    <Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'grey.400' }}>
                        No active campaigns yet. Start your career journey!
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>

              {/* Inventory & Badges */}
              <Box>
                <Typography variant="h6" sx={{ color: 'grey.200', mb: 2, fontWeight: 600 }}>
                  Inventory & Badges
                </Typography>
                <Grid container spacing={1}>
                  {badges.map((badge, index) => (
                    <Grid item xs={4} key={index}>
                      <Paper
                        sx={{
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: badge.earned 
                            ? 'rgba(139, 92, 246, 0.2)' 
                            : 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          cursor: badge.earned ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          '&:hover': badge.earned ? {
                            backgroundColor: 'rgba(139, 92, 246, 0.3)',
                            transform: 'scale(1.05)'
                          } : {}
                        }}
                      >
                        {badge.earned ? (
                          <Typography variant="h4">
                            {badge.icon}
                          </Typography>
                        ) : null}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Controls */}
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/skill-tree')}
              sx={{
                background: 'linear-gradient(45deg, #8b5cf6, #a855f7)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7c3aed, #9333ea)',
                }
              }}
            >
              View Skill Tree
            </Button>
            <Button
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => navigate('/quests')}
              sx={{
                background: 'linear-gradient(45deg, #06b6d4, #0891b2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0284c7, #0369a1)',
                }
              }}
            >
              View Quests
            </Button>
            <Button
              variant="contained"
              startIcon={<EmojiEvents />}
              onClick={() => navigate('/achievements')}
              sx={{
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d97706, #b45309)',
                }
              }}
            >
              View Achievements
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CharacterSheet;