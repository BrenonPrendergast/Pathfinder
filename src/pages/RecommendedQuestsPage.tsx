import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Assignment,
  PlayArrow,
  Schedule,
  Star,
  OpenInNew,
  School,
  EmojiEvents,
  TrendingUp,
  AutoAwesome,
  CheckCircle,
  Psychology,
  Code,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { questRecommendationService, QuestRecommendation } from '../services';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const RecommendedQuestsPage: React.FC = () => {
  const { currentUser, userProfile, completeQuest } = useAuth();
  const [recommendations, setRecommendations] = useState<QuestRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (userProfile) {
      loadRecommendations();
    }
  }, [userProfile]);

  const loadRecommendations = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      const recs = await questRecommendationService.getRecommendationsForUser(userProfile);
      setRecommendations(recs);
    } catch (error) {
      setError('Failed to load quest recommendations. Please try again later.');
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (recommendation: QuestRecommendation) => {
    try {
      const skillRewards = recommendation.quest.skillRewards?.map(reward => ({
        skillId: reward.skillId,
        hoursAwarded: reward.hoursAwarded
      })) || [];

      await completeQuest(recommendation.quest.id, recommendation.quest.xpReward, skillRewards);
      await loadRecommendations(); // Refresh recommendations
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const getRecommendationsByCategory = (category: QuestRecommendation['category']) => {
    return recommendations.filter(rec => rec.category === category);
  };

  const getCategoryIcon = (category: QuestRecommendation['category']) => {
    switch (category) {
      case 'skill_gap': return <Psychology color="warning" />;
      case 'career_aligned': return <TrendingUp color="success" />;
      case 'next_level': return <AutoAwesome color="primary" />;
      case 'interest_based': return <Star color="secondary" />;
      default: return <Assignment />;
    }
  };

  const getCategoryTitle = (category: QuestRecommendation['category']) => {
    switch (category) {
      case 'skill_gap': return 'Skill Development';
      case 'career_aligned': return 'Career Focused';
      case 'next_level': return 'Level Up';
      case 'interest_based': return 'Trending';
      default: return 'Recommended';
    }
  };

  const getCategoryDescription = (category: QuestRecommendation['category']) => {
    switch (category) {
      case 'skill_gap': return 'Quests to develop skills you need most';
      case 'career_aligned': return 'Quests that advance your career goals';
      case 'next_level': return 'Challenging quests to push your limits';
      case 'interest_based': return 'Popular quests from the community';
      default: return 'Personalized quest recommendations';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <School />;
      case 'practice': return <PlayArrow />;
      case 'project': return <Assignment />;
      case 'assessment': return <Star />;
      case 'certification': return <EmojiEvents />;
      default: return <Assignment />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const isQuestCompleted = (questId: string) => {
    return userProfile?.completedQuests.includes(questId) || false;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'primary';
  };

  if (!userProfile) {
    return (
      <Box>
        <Typography>Loading recommendations...</Typography>
      </Box>
    );
  }

  const categories: QuestRecommendation['category'][] = ['skill_gap', 'career_aligned', 'next_level', 'interest_based'];

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Recommended Quests 🎯
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Personalized quest recommendations based on your skills, career goals, and learning preferences.
      </Typography>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab 
            label="All Recommendations" 
            icon={<AutoAwesome />} 
            iconPosition="start"
          />
          {categories.map((category, index) => (
            <Tab 
              key={category}
              label={getCategoryTitle(category)}
              icon={getCategoryIcon(category)}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No Recommendations */}
      {!loading && recommendations.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No personalized recommendations available. Complete your profile and try some quests to get better recommendations!
        </Alert>
      )}

      {/* All Recommendations Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {recommendations.slice(0, 9).map((recommendation) => (
            <RecommendationCard 
              key={recommendation.quest.id}
              recommendation={recommendation}
              onComplete={() => handleCompleteQuest(recommendation)}
              isCompleted={isQuestCompleted(recommendation.quest.id)}
              currentUser={currentUser}
            />
          ))}
        </Grid>
      </TabPanel>

      {/* Category-specific Tabs */}
      {categories.map((category, index) => (
        <TabPanel key={category} value={tabValue} index={index + 1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {getCategoryIcon(category)} {getCategoryTitle(category)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getCategoryDescription(category)}
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {getRecommendationsByCategory(category).map((recommendation) => (
              <RecommendationCard 
                key={recommendation.quest.id}
                recommendation={recommendation}
                onComplete={() => handleCompleteQuest(recommendation)}
                isCompleted={isQuestCompleted(recommendation.quest.id)}
                currentUser={currentUser}
              />
            ))}
          </Grid>
        </TabPanel>
      ))}
    </Box>
  );
};

// Individual recommendation card component
interface RecommendationCardProps {
  recommendation: QuestRecommendation;
  onComplete: () => void;
  isCompleted: boolean;
  currentUser: any;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onComplete,
  isCompleted,
  currentUser
}) => {
  const { quest, score, reasons } = recommendation;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <School />;
      case 'practice': return <PlayArrow />;
      case 'project': return <Assignment />;
      case 'assessment': return <Star />;
      case 'certification': return <EmojiEvents />;
      default: return <Assignment />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'primary';
  };

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          opacity: isCompleted ? 0.7 : 1,
          position: 'relative',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: isCompleted ? 'none' : 'translateY(-4px)',
          },
        }}
      >
        {/* Match Score Badge */}
        <Chip
          label={`${Math.round(score)}% Match`}
          color={getScoreColor(score) as any}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            fontWeight: 'bold'
          }}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, mt: 2 }}>
            {getTypeIcon(quest.type)}
            <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
              {quest.title}
              {isCompleted && ' ✅'}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {quest.description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={quest.type} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={quest.difficulty} 
              color={getDifficultyColor(quest.difficulty) as any}
              size="small" 
            />
            <Chip 
              label={`${quest.xpReward} XP`} 
              color="primary"
              size="small" 
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              ~{quest.estimatedHours} hours
            </Typography>
          </Box>

          {/* Why Recommended */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Why recommended:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {reasons.slice(0, 2).map((reason, index) => (
                <ListItem key={index} sx={{ py: 0, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 20 }}>
                    <CheckCircle sx={{ fontSize: 12 }} color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={reason.message}
                    primaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Skill Rewards */}
          {quest.skillRewards && quest.skillRewards.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Skills you'll develop:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {quest.skillRewards.slice(0, 2).map((skillReward) => (
                  <Chip 
                    key={skillReward.skillId} 
                    label={`${skillReward.skillName} (+${skillReward.hoursAwarded}h)`}
                    size="small" 
                    color="secondary"
                    variant="outlined"
                    sx={{ fontSize: '0.6rem' }}
                  />
                ))}
                {quest.skillRewards.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{quest.skillRewards.length - 2} more
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>

        <CardActions>
          {isCompleted ? (
            <Button size="small" disabled>
              Completed
            </Button>
          ) : (
            <>
              <Button 
                size="small" 
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={onComplete}
                disabled={!currentUser}
              >
                {currentUser ? 'Start Quest' : 'Sign In to Start'}
              </Button>
              {quest.externalUrl && (
                <Button 
                  size="small" 
                  endIcon={<OpenInNew />}
                  onClick={() => window.open(quest.externalUrl, '_blank')}
                >
                  Preview
                </Button>
              )}
            </>
          )}
        </CardActions>
      </Card>
    </Grid>
  );
};

export default RecommendedQuestsPage;