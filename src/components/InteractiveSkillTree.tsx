import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  Tooltip,
  IconButton,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
  Fade,
  styled,
  keyframes,
} from '@mui/material';
import {
  Add,
  Remove,
  Star,
  Lock,
  CheckCircle,
  Psychology,
  Code,
  TrendingUp,
  School,
  EmojiEvents,
  Work,
  Assessment,
  FlashOn,
  AutoAwesome,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { skillService } from '../services/skill/skill.service';
import { GameSkillTree, GameSkillTreeNode, GameSkillTreeSection, SkillProficiencyLevel } from '../services/types/skill.types';

// Animated components for gaming effects
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  100% { box-shadow: 0 0 5px currentColor; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const leveLUpAnimation = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const SkillIcon = styled(Paper, {
  shouldForwardProp: (prop) => !['isGlowing', 'isPulsing', 'leveledUp', 'isUnlocked'].includes(prop as string),
})<{ isGlowing?: boolean; isPulsing?: boolean; leveledUp?: boolean; isUnlocked?: boolean }>(
  ({ theme, isGlowing, isPulsing, leveledUp, isUnlocked }) => ({
    position: 'relative',
    width: 80,
    height: 50,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: `2px solid ${isUnlocked ? theme.palette.primary.main : theme.palette.grey[400]}`,
    backgroundColor: isUnlocked ? theme.palette.background.paper : theme.palette.grey[200],
    opacity: isUnlocked ? 1 : 0.6,
    ...(isGlowing && {
      animation: `${glowAnimation} 2s infinite`,
    }),
    ...(isPulsing && {
      animation: `${pulseAnimation} 1.5s infinite`,
    }),
    ...(leveledUp && {
      animation: `${leveLUpAnimation} 0.6s ease-out`,
    }),
    '&:hover': {
      transform: 'scale(1.05)',
      zIndex: 10,
      boxShadow: theme.shadows[4],
    },
  })
);

const FlowchartConnection = styled('svg')<{ isActive: boolean; connectionColor: string }>(
  ({ isActive, connectionColor }) => ({
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 1,
    '& path': {
      stroke: isActive ? connectionColor : '#ccc',
      strokeWidth: 2,
      fill: 'none',
      strokeDasharray: isActive ? 'none' : '5,5',
      transition: 'all 0.3s ease',
    },
    '& .arrow': {
      fill: isActive ? connectionColor : '#ccc',
      transition: 'all 0.3s ease',
    },
  })
);

const SectionBackground = styled(Box)<{ completionPercentage: number; sectionColor: string }>(
  ({ completionPercentage, sectionColor }) => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    background: `linear-gradient(135deg, 
      ${sectionColor}10 0%, 
      ${sectionColor}${Math.floor(completionPercentage * 0.4).toString(16).padStart(2, '0')} 100%
    )`,
    border: `2px solid ${sectionColor}40`,
    transition: 'all 0.5s ease',
  })
);

interface InteractiveSkillTreeProps {
  careerPath: string;
  onPointAllocation?: (skillId: string, points: number) => void;
  onSkillUnlock?: (skillId: string) => void;
}

const InteractiveSkillTree: React.FC<InteractiveSkillTreeProps> = ({
  careerPath,
  onPointAllocation,
  onSkillUnlock,
}) => {
  const theme = useTheme();
  const { currentUser, userProfile } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [skillTrees, setSkillTrees] = useState<{[key: string]: GameSkillTree}>({});
  const [activeTree, setActiveTree] = useState('soft');
  const [hoveredSkill, setHoveredSkill] = useState<GameSkillTreeNode | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<GameSkillTreeNode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [levelUpAnimations, setLevelUpAnimations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Get skill icon based on skill data
  const getSkillIcon = (skillNode: GameSkillTreeNode) => {
    if (!skillNode.skill.iconName) {
      // Default icons based on category
      switch (skillNode.skill.category) {
        case 'technical': return <Code />;
        case 'analytical': return <TrendingUp />;
        case 'leadership': return <EmojiEvents />;
        case 'interpersonal': return <Psychology />;
        case 'foundational': return <School />;
        default: return <Work />;
      }
    }
    // Could map iconName to actual icons here
    return <Assessment />;
  };

  // Calculate skill node color based on allocated points
  const getSkillNodeColor = (skillNode: GameSkillTreeNode | any) => {
    if (!skillNode.isUnlocked) return theme.palette.grey[600];
    
    const allocatedPoints = skillNode.allocatedPoints || skillNode.userProgress?.currentLevel || 0;
    const maxPoints = skillNode.skill?.maxPoints || 5;
    const progressRatio = allocatedPoints / maxPoints;
    
    if (progressRatio === 0) return theme.palette.info.main;
    if (progressRatio < 0.4) return theme.palette.primary.main;
    if (progressRatio < 0.8) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  // Check if skill can be unlocked (prerequisites met)
  const canUnlockSkill = useCallback((skillNode: any) => {
    if (skillNode.isUnlocked) return true;
    
    const currentTree = skillTrees[activeTree];
    if (!currentTree) return false;

    return skillNode.skill.prerequisites.every((prereqId: string) => {
      for (const section of currentTree.sections) {
        const prereqSkill = section.skills.find(s => s.skill.id === prereqId);
        if (prereqSkill && prereqSkill.allocatedPoints > 0) return true;
      }
      return false;
    });
  }, [skillTrees, activeTree]);

  // Render flowchart-style connections between skills
  const renderFlowchartConnections = () => {
    const currentTree = skillTrees[activeTree];
    if (!currentTree) return null;

    const connections: JSX.Element[] = [];

    currentTree.sections.forEach((section, sectionIndex) => {
      section.skills.forEach((skill, skillIndex) => {
        skill.skill.prerequisites.forEach(prereqId => {
          // Find prerequisite skill
          for (const prereqSection of currentTree.sections) {
            const prereqIndex = prereqSection.skills.findIndex(s => s.skill.id === prereqId);
            if (prereqIndex !== -1) {
              const prereqSkill = prereqSection.skills[prereqIndex];
              
              // Calculate skill box positions and dimensions
              const skillBoxX = (skillIndex % 3) * 120 + 60;
              const skillBoxY = Math.floor(skillIndex / 3) * 80 + 50;
              const skillBoxWidth = 80;
              const skillBoxHeight = 50;
              
              const prereqBoxX = (prereqIndex % 3) * 120 + 60;
              const prereqBoxY = Math.floor(prereqIndex / 3) * 80 + 50;
              const prereqBoxWidth = 80;
              const prereqBoxHeight = 50;

              const isActive = prereqSkill.allocatedPoints > 0;
              const connectionColor = section.color;

              // Calculate connection points at box edges
              const { startPoint, endPoint } = calculateEdgeConnectionPoints(
                prereqBoxX, prereqBoxY, prereqBoxWidth, prereqBoxHeight,
                skillBoxX, skillBoxY, skillBoxWidth, skillBoxHeight
              );

              // Create flowchart path from edge to edge
              const pathData = createFlowchartPath(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

              connections.push(
                <FlowchartConnection
                  key={`${prereqId}-${skill.skill.id}`}
                  isActive={isActive}
                  connectionColor={connectionColor}
                  width="100%"
                  height="100%"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <defs>
                    <marker
                      id={`arrow-${prereqId}-${skill.skill.id}`}
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="3"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto"
                    >
                      <path
                        className="arrow"
                        d="M0,0 L0,6 L9,3 z"
                      />
                    </marker>
                  </defs>
                  <path
                    d={pathData}
                    markerEnd={`url(#arrow-${prereqId}-${skill.skill.id})`}
                  />
                </FlowchartConnection>
              );
              break;
            }
          }
        });
      });
    });

    return connections;
  };

  // Calculate connection points at the edges of rectangular boxes
  const calculateEdgeConnectionPoints = (
    box1X: number, box1Y: number, box1W: number, box1H: number,
    box2X: number, box2Y: number, box2W: number, box2H: number
  ) => {
    const box1CenterX = box1X + box1W / 2;
    const box1CenterY = box1Y + box1H / 2;
    const box2CenterX = box2X + box2W / 2;
    const box2CenterY = box2Y + box2H / 2;

    let startPoint: { x: number; y: number };
    let endPoint: { x: number; y: number };

    // Determine which edges to connect based on relative positions
    if (box2CenterX > box1CenterX + box1W / 2) {
      // Box2 is to the right of Box1
      startPoint = { x: box1X + box1W, y: box1CenterY };
      endPoint = { x: box2X, y: box2CenterY };
    } else if (box2CenterX < box1CenterX - box1W / 2) {
      // Box2 is to the left of Box1
      startPoint = { x: box1X, y: box1CenterY };
      endPoint = { x: box2X + box2W, y: box2CenterY };
    } else if (box2CenterY > box1CenterY) {
      // Box2 is below Box1 (and roughly horizontally aligned)
      startPoint = { x: box1CenterX, y: box1Y + box1H };
      endPoint = { x: box2CenterX, y: box2Y };
    } else {
      // Box2 is above Box1 (and roughly horizontally aligned)
      startPoint = { x: box1CenterX, y: box1Y };
      endPoint = { x: box2CenterX, y: box2Y + box2H };
    }

    return { startPoint, endPoint };
  };

  // Helper function to create flowchart-style path from edge to edge
  const createFlowchartPath = (x1: number, y1: number, x2: number, y2: number): string => {
    // Determine if we need an L-shaped path or can use a direct line
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Use L-shaped path for better flowchart appearance when there's significant horizontal and vertical distance
    if (Math.abs(dx) > 20 && Math.abs(dy) > 20) {
      // Create L-shaped path
      const midX = x1 + dx * 0.7;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    } else {
      // Direct path for close or aligned skills
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
  };

  // Calculate how many points user can allocate to a skill
  const getMaxAllocatablePoints = (skillNode: GameSkillTreeNode) => {
    const currentTree = skillTrees[activeTree];
    if (!currentTree || !skillNode.isUnlocked) return 0;
    
    const remainingSkillPoints = (skillNode.skill.maxPoints || 5) - skillNode.allocatedPoints;
    const availablePoints = currentTree.availablePoints;
    
    return Math.min(remainingSkillPoints, availablePoints);
  };

  // Allocate points to a skill
  const allocatePoint = async (skillNode: GameSkillTreeNode, points: number = 1) => {
    if (!currentUser || points === 0) return;
    
    const maxAllocatable = getMaxAllocatablePoints(skillNode);
    const actualPoints = Math.min(Math.abs(points), maxAllocatable);
    
    if (actualPoints === 0) return;

    // Trigger level up animation
    setLevelUpAnimations(prev => {
      const next = new Set(prev);
      next.add(skillNode.skill.id);
      return next;
    });
    setTimeout(() => {
      setLevelUpAnimations(prev => {
        const next = new Set(prev);
        next.delete(skillNode.skill.id);
        return next;
      });
    }, 600);

    // Update local state
    setSkillTrees(prev => {
      const newTrees = { ...prev };
      const currentTree = { ...newTrees[activeTree] };
      
      const newSections = currentTree.sections.map(section => ({
        ...section,
        skills: section.skills.map(skill => {
          if (skill.skill.id === skillNode.skill.id) {
            const newAllocatedPoints = skill.allocatedPoints + actualPoints;
            return {
              ...skill,
              allocatedPoints: newAllocatedPoints,
              nodeStyle: {
                ...skill.nodeStyle,
                glowEffect: newAllocatedPoints > skill.allocatedPoints,
              }
            };
          }
          return skill;
        })
      }));

      currentTree.sections = newSections;
      currentTree.availablePoints -= actualPoints;
      currentTree.totalPoints += actualPoints;

      newTrees[activeTree] = currentTree;
      return newTrees;
    });

    // Persist to Firebase
    try {
      await skillService.addSkillHours(currentUser.uid, skillNode.skill.id, actualPoints);
      onPointAllocation?.(skillNode.skill.id, actualPoints);
    } catch (error) {
      console.error('Error saving skill points:', error);
    }
  };

  // Remove points from a skill
  const removePoint = async (skillNode: GameSkillTreeNode) => {
    if (!currentUser || skillNode.allocatedPoints === 0) return;

    // Update local state
    setSkillTrees(prev => {
      const newTrees = { ...prev };
      const currentTree = { ...newTrees[activeTree] };
      
      const newSections = currentTree.sections.map(section => ({
        ...section,
        skills: section.skills.map(skill => {
          if (skill.skill.id === skillNode.skill.id) {
            return {
              ...skill,
              allocatedPoints: Math.max(0, skill.allocatedPoints - 1),
            };
          }
          return skill;
        })
      }));

      currentTree.sections = newSections;
      currentTree.availablePoints += 1;
      currentTree.totalPoints -= 1;

      newTrees[activeTree] = currentTree;
      return newTrees;
    });

    // Persist to Firebase
    try {
      await skillService.addSkillHours(currentUser.uid, skillNode.skill.id, -1);
      onPointAllocation?.(skillNode.skill.id, -1);
    } catch (error) {
      console.error('Error removing skill points:', error);
    }
  };

  // Reset all points in current tree
  const resetAllPoints = async () => {
    if (!currentUser) return;

    setSkillTrees(prev => {
      const newTrees = { ...prev };
      const currentTree = { ...newTrees[activeTree] };
      
      let totalPointsToReturn = 0;
      const newSections = currentTree.sections.map(section => ({
        ...section,
        skills: section.skills.map(skill => {
          totalPointsToReturn += skill.allocatedPoints;
          return {
            ...skill,
            allocatedPoints: 0,
          };
        })
      }));

      currentTree.sections = newSections;
      currentTree.availablePoints += totalPointsToReturn;
      currentTree.totalPoints = 0;

      newTrees[activeTree] = currentTree;
      return newTrees;
    });
  };

  // Load skill tree data
  useEffect(() => {
    const loadSkillTreeData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load soft skills
        const softSkills = await skillService.getSoftSkillsTree(currentUser.uid);
        
        // Transform to gaming format
        const gamingSoftTree: GameSkillTree = {
          id: 'soft',
          name: 'Soft Skills',
          type: 'soft',
          description: 'Essential interpersonal and foundational skills',
          color: '#10B981',
          totalPoints: 0,
          maxPoints: 100,
          availablePoints: 70,
          unlockedNodes: 0,
          totalNodes: softSkills.length,
          progressLevel: 1,
          sections: [
            {
              id: 'foundational',
              name: 'Foundational Skills',
              description: 'Core skills everyone needs',
              color: '#10B981',
              tier: 1,
              skills: softSkills
                .filter(skill => skill.skill.category === 'foundational')
                .map((skillNode, index) => {
                  const currentPoints = skillNode.userProgress?.currentLevel || 0;
                  const gameNode = {
                    ...skillNode,
                    allocatedPoints: currentPoints,
                    isAvailable: skillNode.isUnlocked || skillNode.skill.prerequisites.length === 0,
                    connections: skillNode.skill.prerequisites,
                    nodeStyle: {
                      color: getSkillNodeColor(skillNode),
                      glowEffect: skillNode.isRecommended || false,
                      pulseAnimation: skillNode.isRecommended && !skillNode.isUnlocked,
                    },
                    effects: {
                      description: `Improve your ${skillNode.skill.name} capabilities`,
                      currentBonuses: currentPoints > 0 ? [
                        `+${currentPoints} ${skillNode.skill.name} proficiency`,
                        `${currentPoints * 20}% effectiveness boost`
                      ] : [],
                      nextLevelPreview: currentPoints < 5 ? `Next: +${(currentPoints + 1) * 20}% ${skillNode.skill.name} effectiveness` : 'Maximum level reached!',
                    },
                  } as GameSkillTreeNode;
                  
                  // Enhance skill with gaming properties
                  gameNode.skill.maxPoints = 5;
                  gameNode.skill.pointsPerLevel = 1;
                  gameNode.skill.treePosition = {
                    x: (index % 3) * 120 + 100,
                    y: Math.floor(index / 3) * 80 + 75,
                    tier: Math.min(5, Math.max(1, skillNode.skill.prerequisites.length + 1))
                  };
                  
                  return gameNode;
                }),
              completionPercentage: 0,
              isUnlocked: true,
            },
            {
              id: 'interpersonal',
              name: 'Interpersonal Skills',
              description: 'People and communication skills',
              color: '#3B82F6',
              tier: 2,
              skills: softSkills
                .filter(skill => skill.skill.category === 'interpersonal')
                .map((skillNode, index) => ({
                  ...skillNode,
                  allocatedPoints: skillNode.userProgress?.currentLevel || 0,
                  isAvailable: canUnlockSkill(skillNode),
                  connections: skillNode.skill.prerequisites,
                  nodeStyle: {
                    color: getSkillNodeColor(skillNode),
                    glowEffect: false,
                    pulseAnimation: false,
                  },
                  effects: {
                    description: `Enhance your ${skillNode.skill.name} abilities`,
                    currentBonuses: [`+${skillNode.userProgress?.currentLevel || 0} ${skillNode.skill.name}`],
                    nextLevelPreview: `Next: Advanced ${skillNode.skill.name} techniques`,
                  },
                } as GameSkillTreeNode)),
              completionPercentage: 0,
              isUnlocked: true,
            },
          ],
        };

        setSkillTrees({
          soft: gamingSoftTree,
          // Add more trees as needed
        });
        
      } catch (error) {
        console.error('Error loading skill tree data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkillTreeData();
  }, [currentUser, careerPath]);

  // Render rectangular skill icon
  const renderSkillIcon = (skillNode: GameSkillTreeNode, index: number) => {
    const isLevelingUp = levelUpAnimations.has(skillNode.skill.id);
    const maxAllocatable = getMaxAllocatablePoints(skillNode);
    
    return (
      <Box
        key={skillNode.skill.id}
        sx={{
          position: 'absolute',
          left: (index % 3) * 120 + 60,
          top: Math.floor(index / 3) * 80 + 50,
        }}
      >
        <Tooltip
          title={
            <Box sx={{ maxWidth: 300 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {skillNode.skill.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {skillNode.skill.description}
              </Typography>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                Level: {skillNode.allocatedPoints}/{skillNode.skill.maxPoints || 5}
              </Typography>
              {skillNode.effects.currentBonuses.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                    Current Effects:
                  </Typography>
                  {skillNode.effects.currentBonuses.map((bonus, i) => (
                    <Typography key={i} variant="caption" display="block" sx={{ ml: 1 }}>
                      • {bonus}
                    </Typography>
                  ))}
                </Box>
              )}
              {skillNode.effects.nextLevelPreview && skillNode.allocatedPoints < (skillNode.skill.maxPoints || 5) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    Next Level:
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ ml: 1 }}>
                    {skillNode.effects.nextLevelPreview}
                  </Typography>
                </Box>
              )}
            </Box>
          }
          placement="top"
          arrow
          enterDelay={500}
        >
          <SkillIcon
            isGlowing={skillNode.nodeStyle.glowEffect}
            isPulsing={skillNode.isAvailable && !skillNode.isUnlocked}
            leveledUp={isLevelingUp}
            isUnlocked={skillNode.isUnlocked}
            onClick={() => {
              setSelectedSkill(skillNode);
              setDialogOpen(true);
            }}
            sx={{
              borderColor: skillNode.isUnlocked ? getSkillNodeColor(skillNode) : theme.palette.grey[400],
              backgroundColor: skillNode.isUnlocked 
                ? theme.palette.background.paper 
                : theme.palette.grey[100],
            }}
          >
            {/* Skill Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {skillNode.isUnlocked ? (
                getSkillIcon(skillNode)
              ) : (
                <Lock fontSize="small" sx={{ color: theme.palette.grey[500] }} />
              )}
              
              {/* Skill Name (truncated for small icons) */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: skillNode.isUnlocked ? theme.palette.text.primary : theme.palette.grey[500],
                  maxWidth: 45,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {skillNode.skill.name}
              </Typography>
            </Box>

            {/* Point Level Indicator */}
            {skillNode.allocatedPoints > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: getSkillNodeColor(skillNode),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              >
                {skillNode.allocatedPoints}
              </Box>
            )}

            {/* Mastery Star for maxed skills */}
            {skillNode.allocatedPoints === (skillNode.skill.maxPoints || 5) && (
              <Star
                sx={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  color: '#FFD700',
                  fontSize: 16,
                  filter: 'drop-shadow(0 0 2px #FFD700)',
                }}
              />
            )}
          </SkillIcon>
        </Tooltip>

        {/* Compact Point Allocation Controls */}
        {skillNode.isUnlocked && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -25,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removePoint(skillNode);
              }}
              disabled={skillNode.allocatedPoints === 0}
              sx={{
                width: 20,
                height: 20,
                fontSize: 12,
                backgroundColor: theme.palette.error.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.grey[300],
                },
              }}
            >
              <Remove sx={{ fontSize: 12 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                allocatePoint(skillNode);
              }}
              disabled={maxAllocatable === 0}
              sx={{
                width: 20,
                height: 20,
                fontSize: 12,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&:disabled': {
                  backgroundColor: theme.palette.grey[300],
                },
              }}
            >
              <Add sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography>Loading Interactive Skill Tree...</Typography>
      </Box>
    );
  }

  const currentTree = skillTrees[activeTree];
  if (!currentTree) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>No skill tree data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 800 }}>
      {/* Header Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Object.entries(skillTrees).map(([key, tree]) => (
            <Button
              key={key}
              variant={activeTree === key ? 'contained' : 'outlined'}
              onClick={() => setActiveTree(key)}
              sx={{
                borderColor: tree.color,
                color: activeTree === key ? 'white' : tree.color,
                backgroundColor: activeTree === key ? tree.color : 'transparent',
              }}
            >
              {tree.name} ({tree.totalPoints}/{tree.maxPoints})
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<FlashOn />}
            label={`${currentTree.availablePoints} Points Available`}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={resetAllPoints}
            disabled={currentTree.totalPoints === 0}
          >
            Reset All
          </Button>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" gutterBottom>
          Tree Progress: {Math.round((currentTree.totalPoints / currentTree.maxPoints) * 100)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentTree.totalPoints / currentTree.maxPoints) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: `${currentTree.color}20`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: currentTree.color,
            },
          }}
        />
      </Box>

      {/* Skill Tree Canvas */}
      <Paper
        ref={canvasRef}
        sx={{
          width: '100%',
          height: 600,
          position: 'relative',
          backgroundColor: theme.palette.background.default,
          border: `2px solid ${currentTree.color}40`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Section Backgrounds */}
        {currentTree.sections.map((section, sectionIndex) => (
          <Box
            key={section.id}
            sx={{
              position: 'absolute',
              width: '45%',
              height: '90%',
              left: sectionIndex === 0 ? '2%' : '52%',
              top: '5%',
            }}
          >
            <SectionBackground
              completionPercentage={section.completionPercentage}
              sectionColor={section.color}
            />
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                color: section.color,
                fontWeight: 'bold',
                zIndex: 1,
              }}
            >
              {section.name}
            </Typography>
          </Box>
        ))}

        {/* Flowchart Connections */}
        {renderFlowchartConnections()}

        {/* Skill Icons */}
        {currentTree.sections.map((section) =>
          section.skills.map((skillNode, index) => renderSkillIcon(skillNode, index))
        )}
      </Paper>

      {/* Skill Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
      >
        {selectedSkill && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: getSkillNodeColor(selectedSkill) }}>
                  {getSkillIcon(selectedSkill)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedSkill.skill.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedSkill.allocatedPoints}/{selectedSkill.skill.maxPoints} Points Allocated
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {selectedSkill.skill.description}
              </Typography>
              
              {selectedSkill.effects.currentBonuses.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Current Effects:
                  </Typography>
                  {selectedSkill.effects.currentBonuses.map((bonus, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      • {bonus}
                    </Typography>
                  ))}
                </Box>
              )}

              {selectedSkill.effects.nextLevelPreview && selectedSkill.allocatedPoints < (selectedSkill.skill.maxPoints || 5) && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Next Level Preview:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {selectedSkill.effects.nextLevelPreview}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removePoint(selectedSkill)}
                  disabled={selectedSkill.allocatedPoints === 0}
                  startIcon={<Remove />}
                >
                  Remove Point
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => allocatePoint(selectedSkill)}
                  disabled={getMaxAllocatablePoints(selectedSkill) === 0}
                  startIcon={<Add />}
                >
                  Add Point
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default InteractiveSkillTree;