import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Paper,
  Tabs,
  Tab,
  Grid,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import CertificationGallery from './CertificationGallery';
import {
  Code,
  Psychology,
  Group,
  School,
  Lightbulb,
  TrendingUp,
  Lock,
  Add,
  Refresh,
  EmojiEvents,
  Work,
  Assessment,
  Star,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { skillService } from '../services/skill/skill.service';
import { hardSkillsService, onetIntegrationService } from '../services';
import { 
  SkillTreeNode, 
  SkillProficiencyLevel, 
  SkillType,
  SkillCategory,
  SkillAssessment,
  BaseSkill
} from '../services/types/skill.types';

interface SkillTreeProps {
  careerPath?: string;
}

const SkillTree: React.FC<SkillTreeProps> = ({ careerPath = 'general' }) => {
  const theme = useTheme();
  const { currentUser, userProfile } = useAuth();

  // Helper function to map O*NET categories to our skill categories
  const mapONetCategoryToSkillCategory = (onetCategory: string): SkillCategory => {
    switch (onetCategory.toLowerCase()) {
      case 'programming languages':
      case 'web frameworks':
      case 'mobile development':
        return SkillCategory.TECHNICAL;
      case 'data science':
      case 'data visualization':
      case 'data & analytics':
        return SkillCategory.ANALYTICAL;
      case 'cloud computing':
      case 'devops':
      case 'infrastructure as code':
        return SkillCategory.TECHNICAL;
      case 'design tools':
      case 'cybersecurity':
        return SkillCategory.TOOLS_SOFTWARE;
      case 'machine learning':
      case 'ai/ml':
        return SkillCategory.ANALYTICAL;
      default:
        return SkillCategory.TECHNICAL;
    }
  };
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [softSkillsData, setSoftSkillsData] = useState<SkillTreeNode[]>([]);
  const [hardSkillsData, setHardSkillsData] = useState<SkillTreeNode[]>([]);
  const [certificationsData, setCertificationsData] = useState<any[]>([]);
  const [assessmentDialog, setAssessmentDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillTreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  // Load skill data on component mount
  useEffect(() => {
    const loadSkillData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load soft skills tree
        const softSkills = await skillService.getSoftSkillsTree(currentUser.uid);
        setSoftSkillsData(softSkills);
        
        // Load O*NET-based hard skills for current career path
        if (careerPath && careerPath !== 'general') {
          try {
            // Get O*NET skills for this career
            const onetSkills = await hardSkillsService.getHardSkillsForCareer(careerPath);
            console.log('O*NET skills loaded:', onetSkills.length);
            
            // Convert to SkillTreeNode format and integrate with user progress
            const hardSkillNodes: SkillTreeNode[] = onetSkills.map((skill: any, index) => {
              const userSkillLevel = userProfile?.skillProficiencies[skill.id] || 0;
              const userHours = userProfile?.skillHours[skill.id] || 0;
              
              return {
                skill: {
                  id: skill.id,
                  name: skill.name,
                  description: skill.description,
                  type: SkillType.HARD,
                  category: mapONetCategoryToSkillCategory(skill.category),
                  prerequisites: skill.prerequisites,
                  relatedCareers: [careerPath],
                  onetCode: skill.onetCodes?.[0] || undefined,
                  estimatedHoursToMaster: skill.learningResources?.[0]?.estimatedHours || 40,
                  createdAt: new Date(),
                  updatedAt: new Date()
                },
                userProgress: userSkillLevel > 0 ? {
                  userId: currentUser.uid,
                  skillId: skill.id,
                  currentLevel: userSkillLevel as SkillProficiencyLevel,
                  hoursLogged: userHours,
                  lastUpdated: new Date(),
                  experiencePoints: userHours * 10, // 10 XP per hour
                  completedQuests: [], // To be populated from user profile
                  certifications: [],
                  selfAssessmentDate: new Date(),
                  verificationSource: 'self' as const
                } : null,
                isUnlocked: userSkillLevel > 0 || skill.skillLevel === 'beginner' || skill.skillLevel === 'entry',
                isRecommended: skill.marketDemand > 80,
                position: { x: (index % 4) * 300, y: Math.floor(index / 4) * 200 }, // Simple grid layout
                connections: skill.prerequisites, // Prerequisites as connections
                urgency: skill.marketDemand > 90 ? 'high' : skill.marketDemand > 75 ? 'medium' : 'low'
              };
            });
            
            setHardSkillsData(hardSkillNodes);
          } catch (error) {
            console.error('Error loading O*NET hard skills:', error);
            // Fallback to existing service
            const hardSkills = await skillService.getHardSkillsForCareer(currentUser.uid, careerPath);
            setHardSkillsData(hardSkills);
          }
        }
        
        // TODO: Load certifications data
        setCertificationsData([]);
      } catch (error) {
        console.error('Error loading skill data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSkillData();
  }, [currentUser, careerPath]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle skill assessment
  const handleSkillAssessment = (skillNode: SkillTreeNode) => {
    setSelectedSkill(skillNode);
    setAssessmentDialog(true);
  };
  
  // Handle skill level update
  const handleSkillLevelUpdate = async (skillId: string, newLevel: SkillProficiencyLevel, notes?: string) => {
    if (!currentUser) return;
    
    try {
      await skillService.updateSkillLevel(currentUser.uid, skillId, newLevel, 'self', notes);
      
      // Reload skill data to reflect changes
      const softSkills = await skillService.getSoftSkillsTree(currentUser.uid);
      setSoftSkillsData(softSkills);
      
      setAssessmentDialog(false);
      setSelectedSkill(null);
    } catch (error) {
      console.error('Error updating skill level:', error);
    }
  };

  // Get skill level color
  const getSkillLevelColor = (level: SkillProficiencyLevel) => {
    switch (level) {
      case SkillProficiencyLevel.LOCKED: return theme.palette.grey[600];
      case SkillProficiencyLevel.NOVICE: return theme.palette.info.main;
      case SkillProficiencyLevel.BEGINNER: return theme.palette.primary.main;
      case SkillProficiencyLevel.INTERMEDIATE: return theme.palette.warning.main;
      case SkillProficiencyLevel.ADVANCED: return theme.palette.success.main;
      case SkillProficiencyLevel.EXPERT: return theme.palette.secondary.main;
      default: return theme.palette.grey[400];
    }
  };
  
  // Get skill level text
  const getSkillLevelText = (level: SkillProficiencyLevel) => {
    switch (level) {
      case SkillProficiencyLevel.LOCKED: return 'Locked';
      case SkillProficiencyLevel.NOVICE: return 'Novice';
      case SkillProficiencyLevel.BEGINNER: return 'Beginner';
      case SkillProficiencyLevel.INTERMEDIATE: return 'Intermediate';
      case SkillProficiencyLevel.ADVANCED: return 'Advanced';
      case SkillProficiencyLevel.EXPERT: return 'Expert';
      default: return 'Unknown';
    }
  };

  // Get skill icon based on category and type
  const getSkillIcon = (skill: BaseSkill) => {
    if (skill.type === SkillType.HARD) {
      switch (skill.category) {
        case SkillCategory.TECHNICAL: return <Code />;
        case SkillCategory.ANALYTICAL: return <TrendingUp />;
        case SkillCategory.TOOLS_SOFTWARE: return <Assessment />;
        case SkillCategory.METHODOLOGIES: return <School />;
        default: return <Work />;
      }
    } else {
      switch (skill.category) {
        case SkillCategory.FOUNDATIONAL: return <School />;
        case SkillCategory.PROBLEM_SOLVING: return <Psychology />;
        case SkillCategory.INTERPERSONAL: return <Group />;
        case SkillCategory.LEADERSHIP: return <EmojiEvents />;
        default: return <Lightbulb />;
      }
    }
  };

  // Render skill node card
  const renderSkillNode = (skillNode: SkillTreeNode) => {
    const { skill, userProgress, isUnlocked, isRecommended } = skillNode;
    const currentLevel = userProgress?.currentLevel || SkillProficiencyLevel.LOCKED;
    const isMaxLevel = currentLevel === SkillProficiencyLevel.EXPERT;
    const hoursLogged = userProgress?.hoursLogged || 0;

    return (
      <Card
        key={skill.id}
        sx={{
          width: 280,
          minHeight: 160,
          position: 'relative',
          background: isUnlocked 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(135deg, rgba(75, 85, 99, 0.3), rgba(55, 65, 81, 0.3))',
          border: `2px solid ${isUnlocked ? getSkillLevelColor(currentLevel) : theme.palette.grey[600]}`,
          borderRadius: 2,
          opacity: isUnlocked ? 1 : 0.6,
          transition: 'all 0.3s ease',
          '&:hover': isUnlocked ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          } : {},
          ...(isRecommended && {
            border: `2px dashed ${theme.palette.warning.main}`,
            boxShadow: `0 0 10px ${theme.palette.warning.main}40`
          })
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: getSkillLevelColor(currentLevel)
                }}
              >
                {getSkillIcon(skill)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {skill.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {getSkillLevelText(currentLevel)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={skill.category.replace('_', ' ')}
                size="small"
                color={skill.type === SkillType.HARD ? 'warning' : 'secondary'}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {isUnlocked ? (
                  isRecommended ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 12, color: theme.palette.warning.main }} />
                      <Typography variant="caption" color="warning.main">
                        Recommended
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle sx={{ fontSize: 12, color: theme.palette.success.main }} />
                      <Typography variant="caption" color="success.main">
                        Unlocked
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Lock sx={{ fontSize: 12 }} />
                    <Typography variant="caption">Locked</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Progress Rating */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">
                Current Proficiency
              </Typography>
              <Typography variant="caption">
                {hoursLogged}h logged
              </Typography>
            </Box>
            <Rating
              value={currentLevel}
              max={5}
              readOnly
              icon={<Star fontSize="small" />}
              emptyIcon={<RadioButtonUnchecked fontSize="small" />}
              sx={{
                '& .MuiRating-iconFilled': {
                  color: getSkillLevelColor(currentLevel)
                }
              }}
            />
          </Box>

          {/* Description */}
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.8rem' }}>
            {skill.description}
          </Typography>

          {/* Prerequisites */}
          {skill.prerequisites.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Prerequisites:
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {' '}{skill.prerequisites.join(', ')}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Action Button */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            size="small"
            disabled={!isUnlocked}
            onClick={() => handleSkillAssessment(skillNode)}
            sx={{
              backgroundColor: isUnlocked ? theme.palette.primary.main : theme.palette.grey[600],
              color: 'white',
              width: 28,
              height: 28,
              '&:hover': {
                backgroundColor: isUnlocked ? theme.palette.primary.dark : theme.palette.grey[600],
              }
            }}
          >
            <Assessment sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Card>
    );
  };
  
  // Render skills grid for a category
  const renderSkillsGrid = (skills: SkillTreeNode[]) => {
    if (skills.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No skills available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Skills will appear here as you progress in your career journey.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {skills.map((skillNode) => (
          <Grid item xs={12} sm={6} md={4} key={skillNode.skill.id}>
            {renderSkillNode(skillNode)}
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Loading Skills...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '70vh' }}>
      {/* Skill Type Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              fontFamily: '"Nacelle", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab 
            icon={<Psychology />} 
            label="Soft Skills" 
            iconPosition="start"
          />
          <Tab 
            icon={<Code />} 
            label="Hard Skills" 
            iconPosition="start" 
          />
          <Tab 
            icon={<EmojiEvents />} 
            label="Certifications" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box>
        {/* Soft Skills Tab */}
        {tabValue === 0 && (
          <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
            {renderSkillsGrid(softSkillsData)}
          </Paper>
        )}

        {/* Hard Skills Tab */}
        {tabValue === 1 && (
          <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
            {hardSkillsData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Technical Skills Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Career-specific technical skills will be populated based on your selected path.
                </Typography>
              </Box>
            ) : (
              renderSkillsGrid(hardSkillsData)
            )}
          </Paper>
        )}

        {/* Certifications Tab */}
        {tabValue === 2 && (
          <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
            <CertificationGallery 
              careerPath={careerPath} 
              userSkills={userProfile?.skillProficiencies || {}}
            />
          </Paper>
        )}
      </Box>

      {/* Skill Assessment Dialog */}
      <Dialog 
        open={assessmentDialog} 
        onClose={() => setAssessmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSkill && (
          <>
            <DialogTitle>
              Assess Your {selectedSkill.skill.name} Skills
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedSkill.skill.description}
                </Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Current Proficiency Level</InputLabel>
                <Select
                  value={selectedSkill.userProgress?.currentLevel || SkillProficiencyLevel.NOVICE}
                  onChange={(e) => {
                    if (selectedSkill) {
                      handleSkillLevelUpdate(
                        selectedSkill.skill.id, 
                        e.target.value as SkillProficiencyLevel
                      );
                    }
                  }}
                >
                  <MenuItem value={SkillProficiencyLevel.NOVICE}>Novice - Just starting</MenuItem>
                  <MenuItem value={SkillProficiencyLevel.BEGINNER}>Beginner - Basic understanding</MenuItem>
                  <MenuItem value={SkillProficiencyLevel.INTERMEDIATE}>Intermediate - Comfortable applying</MenuItem>
                  <MenuItem value={SkillProficiencyLevel.ADVANCED}>Advanced - Highly skilled</MenuItem>
                  <MenuItem value={SkillProficiencyLevel.EXPERT}>Expert - Teaching others</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Notes (Optional)"
                multiline
                rows={3}
                fullWidth
                placeholder="Describe your experience with this skill..."
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAssessmentDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={() => setAssessmentDialog(false)}
              >
                Save Assessment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Instructions */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Click the assessment button on skills to update your proficiency level
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillTree;