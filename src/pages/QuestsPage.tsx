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
  Container,
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
import GradientText from '../components/GradientText';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';

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

  const getDifficultyChipProps = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': 
        return { sx: { backgroundColor: '#00B162', color: 'white' } };
      case 'intermediate': 
        return { color: 'warning' as const };
      case 'advanced': 
        return { color: 'error' as const };
      default: 
        return { color: 'default' as const };
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <InteractiveSpotlight size="large" intensity="subtle" color="primary" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ py: { xs: 4, md: 6 } }}>
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
              Learning Quests
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
              Complete quests to earn XP, build skills, and advance your career journey. 
              Choose from courses, projects, assessments, and certifications.
            </Typography>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}>
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
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}>
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
                      background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
                      opacity: completed ? 0.7 : 1,
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
                      size="small"
                      {...getDifficultyChipProps(quest.difficulty)}
                    />
                    <Chip 
                      label={`${quest.xpReward} XP`} 
                      size="small"
                      sx={{ backgroundColor: '#6366f1', color: 'white' }}
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
                        sx={{
                          backgroundColor: '#00B162',
                          '&:hover': {
                            backgroundColor: '#009654',
                          },
                        }}
                      >
                        Mark Complete
                      </Button>
                      {quest.externalUrl && (
                        <Button 
                          size="small" 
                          endIcon={<OpenInNew />}
                          onClick={() => window.open(quest.externalUrl, '_blank')}
                          sx={{
                            borderColor: '#6366f1',
                            color: '#6366f1',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.08)',
                              borderColor: '#6366f1',
                            },
                          }}
                          variant="outlined"
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
                        sx={{
                          backgroundColor: '#00B162',
                          '&:hover': {
                            backgroundColor: '#009654',
                          },
                        }}
                      >
                        {currentUser ? 'Start Quest' : 'Sign In to Start'}
                      </Button>
                      {quest.externalUrl && (
                        <Button 
                          size="small" 
                          endIcon={<OpenInNew />}
                          onClick={() => window.open(quest.externalUrl, '_blank')}
                          sx={{
                            borderColor: '#6366f1',
                            color: '#6366f1',
                            '&:hover': {
                              backgroundColor: 'rgba(99, 102, 241, 0.08)',
                              borderColor: '#6366f1',
                            },
                          }}
                          variant="outlined"
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
      </Container>
    </div>
  );
};

export default QuestsPage;