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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment,
  PlayArrow,
  Schedule,
  Star,
  OpenInNew,
  School,
  EmojiEvents,
} from '@mui/icons-material';
import { questService, Quest } from '../services';
import { useAuth } from '../contexts/AuthContext';

const QuestsPage: React.FC = () => {
  const { currentUser, userProfile, completeQuest } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadQuests();
  }, [difficultyFilter, typeFilter]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (difficultyFilter) filters.difficulty = difficultyFilter;
      if (typeFilter) filters.type = typeFilter;
      
      const questsData = await questService.getQuests(filters);
      setQuests(questsData);
    } catch (error) {
      setError('Failed to load quests. Please try again later.');
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuest = (questId: string) => {
    // TODO: Add quest to active quests
    console.log('Starting quest:', questId);
  };

  const handleCompleteQuest = async (quest: Quest) => {
    try {
      // Convert quest skill rewards to the format expected by completeQuest
      const skillRewards = quest.skillRewards?.map(reward => ({
        skillId: reward.skillId,
        hoursAwarded: reward.hoursAwarded
      })) || [];

      await completeQuest(quest.id, quest.xpReward, skillRewards);
      // Refresh quests
      loadQuests();
    } catch (error) {
      console.error('Error completing quest:', error);
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

  const isQuestCompleted = (questId: string) => {
    return userProfile?.completedQuests.includes(questId) || false;
  };

  const isQuestActive = (questId: string) => {
    return userProfile?.activeQuests.includes(questId) || false;
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Learning Quests 🎯
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete quests to earn XP, build skills, and advance your career journey. 
        Choose from courses, projects, assessments, and certifications.
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              label="Difficulty"
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="course">Courses</MenuItem>
              <MenuItem value="practice">Practice</MenuItem>
              <MenuItem value="project">Projects</MenuItem>
              <MenuItem value="assessment">Assessments</MenuItem>
              <MenuItem value="certification">Certifications</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

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

      {/* No Quests */}
      {!loading && quests.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No quests available with the current filters. Try adjusting your search criteria.
        </Alert>
      )}

      {/* Quests Grid */}
      <Grid container spacing={3}>
        {quests.map((quest) => {
          const completed = isQuestCompleted(quest.id);
          const active = isQuestActive(quest.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={quest.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: completed ? 0.7 : 1,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: completed ? 'none' : 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                    {getTypeIcon(quest.type || 'general')}
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                      {quest.title}
                      {completed && ' ✅'}
                      {active && ' 🎯'}
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

                  {quest.skillRewards && quest.skillRewards.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Skills Developed:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {quest.skillRewards.slice(0, 3).map((skillReward) => (
                          <Chip 
                            key={skillReward.skillId} 
                            label={`${skillReward.skillName} (+${skillReward.hoursAwarded}h)`}
                            size="small" 
                            color="secondary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {quest.skillRewards.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{quest.skillRewards.length - 3} more skills
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {quest.prerequisites && quest.prerequisites.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Prerequisites: {quest.prerequisites?.join(', ')}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {quest.tags?.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {(quest.tags?.length || 0) > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{(quest.tags?.length || 0) - 3} more
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  {completed ? (
                    <Button size="small" disabled>
                      Completed
                    </Button>
                  ) : active ? (
                    <>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleCompleteQuest(quest)}
                      >
                        Mark Complete
                      </Button>
                      {quest.externalUrl && (
                        <Button 
                          size="small" 
                          endIcon={<OpenInNew />}
                          onClick={() => window.open(quest.externalUrl, '_blank')}
                        >
                          Continue
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button 
                        size="small" 
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => handleStartQuest(quest.id)}
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
        })}
      </Grid>
    </Box>
  );
};

export default QuestsPage;