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
  Tooltip,
} from '@mui/material';
import CertificationGallery from './CertificationGallery';
import InteractiveSkillTree from './InteractiveSkillTree';
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
import { hardSkillsService } from '../services';
import { 
  SkillTreeNode, 
  SkillProficiencyLevel, 
  SkillType,
  SkillCategory,
  SkillAssessment,
  BaseSkill
} from '../services/types/skill.types';

// Enhanced skill tree data structure
interface EnhancedSkillTreeData {
  name: string;
  color: string;
  totalPoints: number;
  maxPoints: number;
  sections: SkillSection[];
}

interface SkillSection {
  id: string;
  name: string;
  color: string;
  skills: EnhancedSkill[];
}

interface EnhancedSkill {
  id: string;
  name: string;
  description: string;
  currentPoints: number;
  maxPoints: number;
  isUnlocked: boolean;
  prerequisites: string[];
  position: { x: number; y: number };
  category?: string;
  marketDemand?: number;
  estimatedHours?: number;
}

interface SkillTreeProps {
  careerPath?: string;
  interactive?: boolean; // Toggle between old and new UI
}

const SkillTree: React.FC<SkillTreeProps> = ({ careerPath = 'general', interactive = false }) => {
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
  
  // Interactive skill tree state
  const [activeTree, setActiveTree] = useState('soft');
  const [skillTreeData, setSkillTreeData] = useState<{[key: string]: EnhancedSkillTreeData}>({});
  const [availablePoints, setAvailablePoints] = useState(70);
  const [hoveredSkill, setHoveredSkill] = useState<EnhancedSkill | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform existing data to enhanced format
  const transformToEnhancedFormat = (skillNodes: SkillTreeNode[], treeName: string, treeColor: string) => {
    const sections: { [key: string]: SkillSection } = {};
    
    skillNodes.forEach((node, index) => {
      const sectionId = node.skill.category?.toLowerCase() || 'general';
      const sectionName = node.skill.category?.replace('_', ' ') || 'General';
      
      if (!sections[sectionId]) {
        sections[sectionId] = {
          id: sectionId,
          name: sectionName,
          color: treeColor,
          skills: []
        };
      }
      
      const enhancedSkill: EnhancedSkill = {
        id: node.skill.id,
        name: node.skill.name,
        description: node.skill.description,
        currentPoints: node.userProgress?.currentLevel || 0,
        maxPoints: 5, // Convert to 0-5 scale
        isUnlocked: node.isUnlocked,
        prerequisites: node.skill.prerequisites,
        position: node.position,
        category: node.skill.category,
        marketDemand: 70, // Default market demand
        estimatedHours: node.skill.estimatedHoursToMaster || 40
      };
      
      sections[sectionId].skills.push(enhancedSkill);
    });
    
    const totalPoints = Object.values(sections).reduce((sum, section) => 
      sum + section.skills.reduce((skillSum, skill) => skillSum + skill.currentPoints, 0), 0
    );
    const maxPoints = Object.values(sections).reduce((sum, section) => 
      sum + section.skills.reduce((skillSum, skill) => skillSum + skill.maxPoints, 0), 0
    );
    
    return {
      name: treeName,
      color: treeColor,
      totalPoints,
      maxPoints,
      sections: Object.values(sections)
    };
  };

  // Load skill data on component mount
  useEffect(() => {
    const loadSkillData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load soft skills tree
        const softSkills = await skillService.getSoftSkillsTree(currentUser.uid);
        setSoftSkillsData(softSkills);
        
        // Load hard skills for legacy component (simplified for interactive mode)
        if (careerPath && careerPath !== 'general' && !interactive) {
          try {
            const hardSkills = await skillService.getHardSkillsForCareer(currentUser.uid, careerPath);
            setHardSkillsData(hardSkills);
          } catch (error) {
            console.error('Error loading hard skills:', error);
            setHardSkillsData([]);
          }
        }
        
        // Transform data for interactive mode (handled by InteractiveSkillTree component)
        if (interactive) {
          const enhancedSoftSkills = transformToEnhancedFormat(softSkills, 'Soft Skills', '#10B981');
          const enhancedHardSkills = transformToEnhancedFormat([], 'Technical Skills', '#3B82F6'); // Empty for now, handled by InteractiveSkillTree
          
          setSkillTreeData({
            soft: enhancedSoftSkills,
            technical: enhancedHardSkills
          });
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
  }, [currentUser, careerPath, interactive]);

  // Interactive skill tree helper functions
  const canUnlockSkill = (skill: EnhancedSkill) => {
    if (!skillTreeData[activeTree]) return false;
    return skill.prerequisites.every(prereqId => {
      const prereqSkill = findSkillById(prereqId);
      return prereqSkill && prereqSkill.currentPoints > 0;
    });
  };

  const findSkillById = (skillId: string) => {
    for (const tree of Object.values(skillTreeData)) {
      for (const section of tree.sections) {
        const skill = section.skills.find(s => s.id === skillId);
        if (skill) return skill;
      }
    }
    return null;
  };

  const addPoint = (skillId: string) => {
    if (availablePoints <= 0) return;

    setSkillTreeData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const currentTreeData = newData[activeTree];
      
      for (const section of currentTreeData.sections) {
        const skill = section.skills.find((s: EnhancedSkill) => s.id === skillId);
        if (skill && skill.currentPoints < skill.maxPoints) {
          skill.currentPoints += 1;
          currentTreeData.totalPoints += 1;
          break;
        }
      }
      
      return newData;
    });
    
    setAvailablePoints(prev => prev - 1);
  };

  const removePoint = (skillId: string) => {
    setSkillTreeData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const currentTreeData = newData[activeTree];
      
      for (const section of currentTreeData.sections) {
        const skill = section.skills.find((s: EnhancedSkill) => s.id === skillId);
        if (skill && skill.currentPoints > 0) {
          skill.currentPoints -= 1;
          currentTreeData.totalPoints -= 1;
          break;
        }
      }
      
      return newData;
    });
    
    setAvailablePoints(prev => prev + 1);
  };

  const resetPoints = () => {
    setSkillTreeData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as {[key: string]: EnhancedSkillTreeData};
      let totalPointsToReturn = 0;
      
      for (const tree of Object.values(newData)) {
        for (const section of tree.sections) {
          for (const skill of section.skills) {
            totalPointsToReturn += skill.currentPoints;
            skill.currentPoints = 0;
          }
        }
        tree.totalPoints = 0;
      }
      
      return newData;
    });
    
    setAvailablePoints(70);
  };

  const handleMouseMove = (event: React.MouseEvent, skill: EnhancedSkill) => {
    if (hoveredSkill?.id === skill.id) {
      setTooltipPosition({
        x: event.clientX + 10,
        y: event.clientY - 10
      });
    }
  };

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

  // Render skill connections for interactive mode
  const renderConnections = () => {
    if (!skillTreeData[activeTree]) return [];
    
    const currentTreeData = skillTreeData[activeTree];
    const connections: JSX.Element[] = [];

    currentTreeData.sections.forEach(section => {
      section.skills.forEach(skill => {
        skill.prerequisites.forEach(prereqId => {
          const prereqSkill = findSkillById(prereqId);
          if (prereqSkill) {
            const isActive = skill.currentPoints > 0 && prereqSkill.currentPoints > 0;
            connections.push(
              <line
                key={`${prereqId}-${skill.id}`}
                x1={prereqSkill.position.x}
                y1={prereqSkill.position.y}
                x2={skill.position.x}
                y2={skill.position.y}
                stroke={isActive ? section.color : '#6B7280'}
                strokeWidth={isActive ? 3 : 2}
                strokeDasharray={isActive ? '0' : '5,5'}
                opacity={isActive ? 1 : 0.4}
              />
            );
          }
        });
      });
    });

    return connections;
  };

  const getSectionFillPercentage = (section: SkillSection) => {
    const totalPoints = section.skills.reduce((sum, skill) => sum + skill.currentPoints, 0);
    const maxPoints = section.skills.reduce((sum, skill) => sum + skill.maxPoints, 0);
    return maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
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
          background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
          border: `2px solid ${isUnlocked ? getSkillLevelColor(currentLevel) : 'rgba(99, 102, 241, 0.3)'}`,
          borderRadius: 2,
          opacity: isUnlocked ? 1 : 0.6,
          transition: 'all 0.3s ease',
          '&:hover': isUnlocked ? {
            transform: 'translateY(-2px)',
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

  // Interactive Skill Tree Render - Use new dedicated component
  if (interactive) {
    return (
      <InteractiveSkillTree
        careerPath={careerPath}
        onPointAllocation={(skillId, points) => {
          console.log(`Allocated ${points} points to skill ${skillId}`);
        }}
        onSkillUnlock={(skillId) => {
          console.log(`Skill ${skillId} unlocked!`);
        }}
      />
    );
  }

  // Legacy Interactive Skill Tree Render (keeping as fallback)
  if (false && skillTreeData[activeTree]) {
    const currentTreeData = skillTreeData[activeTree];
    
    const containerStyle = {
      width: '100%',
      height: '800px',
      position: 'relative',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
      color: theme.palette.text.primary,
      borderRadius: 2
    };

    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
      padding: 2,
      backgroundColor: theme.palette.background.paper,
      borderRadius: 1
    };

    return (
      <Box sx={containerStyle}>
        {/* Interactive Header */}
        <Box sx={headerStyle}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {Object.entries(skillTreeData).map(([key, data]) => (
              <Button
                key={key}
                variant={activeTree === key ? 'contained' : 'outlined'}
                onClick={() => setActiveTree(key)}
                sx={{
                  backgroundColor: activeTree === key ? data.color : 'transparent',
                  borderColor: data.color,
                  color: activeTree === key ? 'white' : data.color,
                  '&:hover': {
                    backgroundColor: `${data.color}20`
                  }
                }}
              >
                {data.name} ({data.totalPoints}/{data.maxPoints})
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Available Points: ${availablePoints}`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={resetPoints}
            >
              Reset All
            </Button>
          </Box>
        </Box>

        {/* Interactive Canvas */}
        <Paper
          sx={{
            width: '100%',
            height: '700px',
            position: 'relative',
            backgroundColor: theme.palette.background.default,
            border: `2px solid ${currentTreeData.color}40`,
            overflow: 'hidden'
          }}
        >
          {/* Section Backgrounds */}
          {currentTreeData.sections.map((section, index) => {
            const fillPercentage = getSectionFillPercentage(section);
            return (
              <Box
                key={section.id}
                sx={{
                  position: 'absolute',
                  width: '45%',
                  height: '90%',
                  left: index === 0 ? '2%' : '52%',
                  top: '5%',
                  borderRadius: 1,
                  border: `2px solid ${section.color}60`,
                  background: `linear-gradient(135deg, 
                    ${section.color}20 0%, 
                    ${section.color}${Math.floor(Math.min(80, fillPercentage / 100 * 60)).toString(16).padStart(2, '0')} 100%
                  )`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 1
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: section.color,
                    fontWeight: 'bold'
                  }}
                >
                  {section.name}
                </Typography>
              </Box>
            );
          })}

          {/* SVG Connections */}
          <svg
            ref={svgRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {renderConnections()}
          </svg>

          {/* Interactive Skill Nodes */}
          {currentTreeData.sections.map(section => 
            section.skills.map(skill => {
              const isUnlocked = skill.isUnlocked || canUnlockSkill(skill);
              const canAddPoint = isUnlocked && skill.currentPoints < skill.maxPoints && availablePoints > 0;
              const canRemovePoint = skill.currentPoints > 0;

              return (
                <Box
                  key={skill.id}
                  sx={{
                    position: 'absolute',
                    left: skill.position.x - 50,
                    top: skill.position.y - 50,
                    width: 100,
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredSkill(skill);
                    setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 });
                  }}
                  onMouseLeave={() => setHoveredSkill(null)}
                  onMouseMove={(e) => handleMouseMove(e, skill)}
                >
                  {/* Skill Circle */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      background: isUnlocked 
                        ? `linear-gradient(135deg, ${section.color}, ${section.color}cc)`
                        : `linear-gradient(135deg, ${theme.palette.grey[600]}, ${theme.palette.grey[500]})`,
                      border: `3px solid ${isUnlocked ? section.color : theme.palette.grey[600]}`,
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 'bold',
                      transform: hoveredSkill?.id === skill.id && isUnlocked ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                      boxShadow: hoveredSkill?.id === skill.id && isUnlocked ? `0 0 20px ${section.color}80` : 'none'
                    }}
                  >
                    {isUnlocked ? (
                      skill.currentPoints > 0 ? '★' : '○'
                    ) : (
                      '🔒'
                    )}

                    {/* Point indicator */}
                    {skill.currentPoints > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.success.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      >
                        {skill.currentPoints}
                      </Box>
                    )}
                  </Box>

                  {/* Skill Name */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      textAlign: 'center',
                      fontSize: 10,
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                      color: isUnlocked ? theme.palette.text.primary : theme.palette.text.disabled
                    }}
                  >
                    {skill.name}
                  </Typography>

                  {/* Point Controls */}
                  {isUnlocked && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => removePoint(skill.id)}
                        disabled={!canRemovePoint}
                        sx={{
                          minWidth: 20,
                          width: 20,
                          height: 20,
                          p: 0,
                          fontSize: 12
                        }}
                      >
                        −
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => addPoint(skill.id)}
                        disabled={!canAddPoint}
                        sx={{
                          minWidth: 20,
                          width: 20,
                          height: 20,
                          p: 0,
                          fontSize: 12,
                          backgroundColor: '#00B162',
                          '&:hover': {
                            backgroundColor: '#009654',
                          },
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })
          )}

          {/* Interactive Tooltip */}
          {hoveredSkill && (
            <Tooltip
              title={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {hoveredSkill?.name || 'Unknown Skill'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {hoveredSkill?.description || 'No description available'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span>Points: {hoveredSkill?.currentPoints || 0}/{hoveredSkill?.maxPoints || 5}</span>
                    {(hoveredSkill?.prerequisites?.length || 0) > 0 && (
                      <span>Requires: {hoveredSkill?.prerequisites?.join(', ') || ''}</span>
                    )}
                  </Box>
                </Box>
              }
              open={true}
              placement="top"
              arrow
            >
              <Box
                sx={{
                  position: 'fixed',
                  left: tooltipPosition.x,
                  top: tooltipPosition.y,
                  pointerEvents: 'none',
                  zIndex: 1000
                }}
              />
            </Tooltip>
          )}
        </Paper>

        {/* Mode Toggle */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()} // Simple way to toggle back
            sx={{ mr: 2 }}
          >
            Switch to Classic View
          </Button>
          <Typography variant="caption" color="text.secondary">
            💡 Use + and − buttons to allocate skill points • Hover over skills for details
          </Typography>
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
                sx={{
                  backgroundColor: '#00B162',
                  '&:hover': {
                    backgroundColor: '#009654',
                  },
                }}
              >
                Save Assessment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Instructions */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => window.location.href = window.location.href + '?interactive=true'} // Simple toggle
          sx={{ mr: 2 }}
        >
          Try Interactive Mode
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          💡 Click the assessment button on skills to update your proficiency level
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillTree;