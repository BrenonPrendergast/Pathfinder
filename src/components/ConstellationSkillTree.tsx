import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography, Chip, Button, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, IconButton } from '@mui/material';
import { RotateCcw, Trash2, Maximize, Minimize, X } from 'lucide-react';
import SkillStarNode from './constellation/SkillStarNode';
import ConstellationEdge from './constellation/ConstellationEdge';
import ComingSoonPlaceholder from './ComingSoonPlaceholder';
import { useAuth } from '../contexts/AuthContext';
import { skillService } from '../services/skill/skill.service';

// Custom node types for constellation
const nodeTypes = {
  skillStar: SkillStarNode,
};

// Custom edge types for constellation
const edgeTypes = {
  constellation: ConstellationEdge,
};

interface ConstellationSkillTreeProps {
  careerPath?: string;
  careerName?: string;
  onSkillSelect?: (skillId: string) => void;
  onSkillUnlock?: (skillId: string) => void;
}

interface SkillNodeData {
  id: string;
  name: string;
  description: string;
  level: number; // Template difficulty level
  userLevel: number; // User's current investment
  maxLevel: number; // Maximum investment level
  pointCost: number; // Points required per level
  isUnlocked: boolean;
  isAvailable: boolean;
  category: string;
  xpReward: number;
  prerequisites: string[];
  starType: 'main-sequence' | 'giant' | 'supergiant' | 'dwarf';
  constellation: string;
  position?: { x: number; y: number };
  userProgress?: any; // Full user progress data
  nodeScale?: number; // Admin-configurable node scaling
  textScale?: number; // Admin-configurable text scaling
}

const ConstellationSkillTree: React.FC<ConstellationSkillTreeProps> = ({ 
  careerPath = 'general',
  careerName,
  onSkillSelect,
  onSkillUnlock 
}) => {
  const { userProfile } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillNodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTemplate, setHasTemplate] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [userSkillProgress, setUserSkillProgress] = useState<Map<string, any>>(new Map());
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load skills data and user progress
  useEffect(() => {
    loadSkillsData();
    if (userProfile?.uid) {
      loadUserProgress();
    }
  }, [careerPath, userProfile?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate constellation when user progress changes
  useEffect(() => {
    if (skills.length > 0 && userSkillProgress.size > 0) {
      const updatedSkills = processSkillsForConstellation(skills.map(skill => ({
        ...skill,
        // Convert back to raw format for reprocessing
        maxLevel: skill.maxLevel,
        pointCost: skill.pointCost,
      })));
      generateConstellationLayout(updatedSkills);
    }
  }, [userSkillProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update edges when delete mode changes
  useEffect(() => {
    setEdges(currentEdges => 
      currentEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          isDeleteMode
        }
      }))
    );
  }, [isDeleteMode, setEdges]);

  const loadSkillsData = async () => {
    try {
      setLoading(true);
      console.log(`🔄 ConstellationSkillTree: Loading skills for career path: ${careerPath}`);
      const skillsData = await skillService.getSkillsByCareerPath(careerPath);
      console.log(`📊 ConstellationSkillTree: Received ${skillsData.length} skills:`, skillsData);
      
      if (skillsData.length > 0) {
        // Admin template exists - process and display
        const processedSkills = processSkillsForConstellation(skillsData);
        console.log(`✅ ConstellationSkillTree: Processed ${processedSkills.length} skills for constellation:`, processedSkills);
        setSkills(processedSkills);
        setHasTemplate(true);
        generateConstellationLayout(processedSkills);
      } else {
        // No admin template - show Coming Soon
        console.log(`⚠️ ConstellationSkillTree: No skills found for ${careerPath} - showing Coming Soon`);
        setHasTemplate(false);
        setSkills([]);
      }
    } catch (error) {
      console.error('❌ ConstellationSkillTree: Error loading skills data:', error);
      setHasTemplate(false);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!userProfile?.uid) return;
    
    try {
      console.log(`🔄 Loading user skill progress for user: ${userProfile.uid}`);
      const userProgress = await skillService.getUserSkillProgress(userProfile.uid);
      const availablePointsCount = await skillService.getUserAvailablePoints(userProfile.uid);
      
      // Create a map for quick lookup
      const progressMap = new Map();
      userProgress.forEach(progress => {
        progressMap.set(progress.skillId, progress);
      });
      
      setUserSkillProgress(progressMap);
      setAvailablePoints(availablePointsCount);
      console.log(`✅ Loaded progress for ${userProgress.length} skills, ${availablePointsCount} points available`);
    } catch (error) {
      console.error('❌ Error loading user skill progress:', error);
    }
  };

  const processSkillsForConstellation = (rawSkills: any[]): SkillNodeData[] => {
    return rawSkills.map((skill, index) => {
      const userProgress = userSkillProgress.get(skill.id);
      const userLevel = userProgress?.currentLevel || 0;
      const maxLevel = skill.maxLevel || 5; // Default max level
      
      return {
        id: skill.id,
        name: skill.name,
        description: skill.description || '',
        level: skill.level || 1, // Template difficulty level
        userLevel: userLevel, // User's current investment
        maxLevel: maxLevel,
        pointCost: skill.pointCost || 1, // Points per level (admin configurable)
        isUnlocked: userLevel > 0,
        isAvailable: userLevel > 0 || checkSkillAvailability(skill, userSkillProgress),
        category: skill.category || 'general',
        xpReward: skill.xpReward || 10,
        prerequisites: skill.prerequisites || [],
        starType: skill.starType || determineStarTypeFromUserLevel(userLevel, maxLevel),
        constellation: skill.constellation || skill.category || 'general',
        position: skill.position, // Preserve admin-saved position data
        userProgress: userProgress, // Include full user progress data
        nodeScale: skill.nodeScale, // Admin-configurable node scaling
        textScale: skill.textScale, // Admin-configurable text scaling
      };
    });
  };

  const determineStarType = (skill: any): SkillNodeData['starType'] => {
    const level = skill.level || 1;
    if (level >= 5) return 'supergiant';
    if (level >= 3) return 'giant';
    if (level >= 2) return 'main-sequence';
    return 'dwarf';
  };

  const determineStarTypeFromUserLevel = (userLevel: number, maxLevel: number): SkillNodeData['starType'] => {
    const percentage = maxLevel > 0 ? userLevel / maxLevel : 0;
    if (percentage >= 0.8) return 'supergiant'; // 80%+ mastery
    if (percentage >= 0.6) return 'giant';      // 60%+ mastery
    if (percentage >= 0.3) return 'main-sequence'; // 30%+ mastery
    return 'dwarf'; // 0-30% mastery
  };

  const checkSkillAvailability = (skill: any, progressMap: Map<string, any>): boolean => {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
    
    // Check if all prerequisite skills have been invested in (user level > 0)
    return skill.prerequisites.every((prereqId: string) => {
      const prereqProgress = progressMap.get(prereqId);
      return prereqProgress && prereqProgress.currentLevel > 0;
    });
  };

  const generateConstellationLayout = (skillsData: SkillNodeData[]) => {
    const constellations = groupSkillsByConstellation(skillsData);
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Generate nodes for each constellation
    Object.entries(constellations).forEach(([constellation, constellationSkills], constellationIndex) => {
      const centerX = (constellationIndex % 3) * 800 + 400;
      const centerY = Math.floor(constellationIndex / 3) * 600 + 300;
      
      constellationSkills.forEach((skill, skillIndex) => {
        // Use saved position from admin template if available, otherwise fall back to spiral positioning
        let x, y;
        if (skill.position && typeof skill.position.x === 'number' && typeof skill.position.y === 'number') {
          // Use admin-saved position
          x = skill.position.x;
          y = skill.position.y;
          console.log(`Using saved position for ${skill.name}:`, { x, y });
        } else {
          // Fall back to spiral positioning within constellation
          const angle = (skillIndex * 2.4) + (constellationIndex * 0.8);
          const radius = 80 + (skillIndex * 30);
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
          console.log(`Using calculated position for ${skill.name}:`, { x, y });
        }

        newNodes.push({
          id: skill.id,
          type: 'skillStar',
          position: { x, y },
          data: {
            ...skill,
            onSelect: () => handleSkillSelect(skill.id),
            onUnlock: () => onSkillUnlock?.(skill.id),
            onAddPoint: () => handleAddSkillPoint(skill.id),
            onRemovePoint: () => handleRemoveSkillPoint(skill.id),
            availablePoints: availablePoints,
            nodeScale: skill.nodeScale || 1.0,
            textScale: skill.textScale || 1.0,
            isAdminMode: false,
          },
          draggable: false,
          connectable: false,
        });

        // Create edges for prerequisites - ensure they exist in our skill set
        if (skill.prerequisites && Array.isArray(skill.prerequisites)) {
          skill.prerequisites.forEach(prereqId => {
            const prereqSkill = skillsData.find(s => s.id === prereqId);
            if (prereqSkill) {
              console.log(`Creating edge: ${prereqId} -> ${skill.id}`);
              newEdges.push({
                id: `${prereqId}-${skill.id}`,
                source: prereqId,
                target: skill.id,
                type: 'constellation',
                data: {
                  isActive: skill.isUnlocked,
                  isAvailable: skill.isAvailable,
                  isDeleteMode: false,
                },
                style: {
                  stroke: '#6366f1', // Always use purple for constellation connections
                  strokeWidth: 2,
                  opacity: 0.8, // Make connections clearly visible in constellation view
                },
              });
            } else {
              console.warn(`Prerequisite skill ${prereqId} not found for skill ${skill.id}`);
            }
          });
        }
      });

      // Remove constellation center nodes - they're causing artifacts
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const groupSkillsByConstellation = (skillsData: SkillNodeData[]) => {
    return skillsData.reduce((groups, skill) => {
      const constellation = skill.constellation || 'general';
      if (!groups[constellation]) {
        groups[constellation] = [];
      }
      groups[constellation].push(skill);
      return groups;
    }, {} as Record<string, SkillNodeData[]>);
  };

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkill(skillId);
    onSkillSelect?.(skillId);
  };

  const handleAddSkillPoint = async (skillId: string) => {
    if (!userProfile?.uid || availablePoints <= 0) return;
    
    try {
      await skillService.allocateSkillPoints(userProfile.uid, skillId, 1);
      await loadUserProgress(); // Refresh progress data
      console.log(`✅ Added 1 point to skill: ${skillId}`);
    } catch (error) {
      console.error('❌ Error adding skill point:', error);
    }
  };

  const handleRemoveSkillPoint = async (skillId: string) => {
    if (!userProfile?.uid) return;
    
    const userProgress = userSkillProgress.get(skillId);
    if (!userProgress || userProgress.currentLevel <= 0) return;
    
    try {
      await skillService.allocateSkillPoints(userProfile.uid, skillId, -1);
      await loadUserProgress(); // Refresh progress data
      console.log(`✅ Removed 1 point from skill: ${skillId}`);
    } catch (error) {
      console.error('❌ Error removing skill point:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (isDeleteMode) {
      event.stopPropagation();
      setSelectedEdge(edge);
      setDeleteDialogOpen(true);
    }
  }, [isDeleteMode]);

  const handleDeleteConnection = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      
      // Update the skill prerequisites to reflect the deletion
      setSkills((currentSkills) => {
        return currentSkills.map((skill) => {
          if (skill.id === selectedEdge.target) {
            return {
              ...skill,
              prerequisites: skill.prerequisites.filter(prereq => prereq !== selectedEdge.source)
            };
          }
          return skill;
        });
      });
    }
    setDeleteDialogOpen(false);
    setSelectedEdge(null);
  }, [selectedEdge, setEdges]);

  const toggleDeleteMode = useCallback(() => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedEdge(null);
  }, [isDeleteMode]);

  const resetView = () => {
    // Reset to initial view
    loadSkillsData();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getSelectedSkill = () => {
    return skills.find(skill => skill.id === selectedSkill);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Loading constellation...</Typography>
      </Box>
    );
  }

  // Show Coming Soon if no admin template exists
  if (!hasTemplate) {
    return <ComingSoonPlaceholder careerPath={careerPath} careerName={careerName} />;
  }

  return (
    <Box sx={{ height: '80vh', width: '100%', position: 'relative' }}>
      {/* Career Title Header - Compact */}
      <Box sx={{ 
        position: 'absolute', 
        top: 8, 
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center',
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 1,
        px: 2,
        py: 0.75,
      }}>
        <Typography variant="h6" sx={{
          background: 'linear-gradient(45deg, #00B162 30%, #6366f1 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: 1.2,
        }}>
          {careerPath === 'general' ? 'General Skills' : (careerName || careerPath)}
        </Typography>
      </Box>
      {/* Left Side Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: '50%',
        left: 16, 
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'center'
      }}>
        {/* Action Buttons */}
        <Tooltip title="Reset constellation view" placement="right">
          <IconButton
            onClick={resetView}
            size="small"
            sx={{
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              color: 'white',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <RotateCcw size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title={isDeleteMode ? "Exit delete mode" : "Delete skill connections"} placement="right">
          <IconButton
            onClick={toggleDeleteMode}
            size="small"
            sx={{
              backgroundColor: isDeleteMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(31, 41, 55, 0.9)',
              color: 'white',
              border: isDeleteMode ? '1px solid rgba(239, 68, 68, 0.8)' : '1px solid rgba(99, 102, 241, 0.5)',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: isDeleteMode ? 'rgba(239, 68, 68, 1)' : 'rgba(239, 68, 68, 0.3)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Trash2 size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} placement="right">
          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              color: 'white',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </IconButton>
        </Tooltip>

        {/* Divider */}
        <Box sx={{ 
          width: '2px', 
          height: '20px', 
          backgroundColor: 'rgba(99, 102, 241, 0.3)', 
          my: 1 
        }} />

        {/* Stats Chips - Vertical */}
        <Chip 
          label={`${skills.filter(s => s.userLevel > 0).length}/${skills.length}`}
          size="small"
          sx={{ 
            backgroundColor: '#00B162', 
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
            '& .MuiChip-label': { px: 1 }
          }}
        />
        
        <Chip 
          label={`${availablePoints} pts`}
          size="small"
          sx={{ 
            backgroundColor: '#6366f1', 
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
            '& .MuiChip-label': { px: 1 }
          }}
        />

        {isDeleteMode && (
          <Chip 
            label="Delete Mode"
            size="small"
            sx={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.9)', 
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              animation: 'pulse 2s infinite',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        )}
      </Box>

      {/* Selected Skill Details - Fixed Top Right */}
      {selectedSkill && (
        <Box sx={{
          position: 'absolute',
          top: 60,
          right: 16,
          zIndex: 10,
          p: 2,
          maxWidth: 320,
          minWidth: 280,
          background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.95), transparent)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 2,
        }}>
          {(() => {
            const skill = getSelectedSkill();
            if (!skill) return null;
            return (
              <Box>
                {/* Header with close button */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ color: '#00B162', flexGrow: 1 }}>
                    {skill.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedSkill(null)}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      ml: 1,
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                  {skill.description}
                </Typography>
                
                {/* Progress Info */}
                <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#6366f1' }}>
                    Progress: {skill.userLevel}/{skill.maxLevel}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="caption" sx={{ 
                      backgroundColor: '#00B162', 
                      color: 'white',
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontWeight: 600
                    }}>
                      {skill.userLevel} Points Invested
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      backgroundColor: 'rgba(99, 102, 241, 0.8)', 
                      color: 'white',
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontWeight: 600
                    }}>
                      {skill.pointCost} Points per Level
                    </Typography>
                  </Box>
                  {/* Point Controls */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleRemoveSkillPoint(skill.id)}
                      disabled={(skill.userLevel || 0) <= 0}
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        '&:hover': {
                          borderColor: '#dc2626',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        },
                        '&:disabled': {
                          borderColor: 'rgba(107, 114, 128, 0.3)',
                          color: 'rgba(107, 114, 128, 0.5)',
                        },
                      }}
                    >
                      -
                    </Button>
                    <Typography variant="body2" sx={{ 
                      minWidth: 60,
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#6366f1'
                    }}>
                      {skill.userLevel}/{skill.maxLevel}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAddSkillPoint(skill.id)}
                      disabled={availablePoints <= 0 || (skill.userLevel || 0) >= (skill.maxLevel || 5)}
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderColor: '#00B162',
                        color: '#00B162',
                        '&:hover': {
                          borderColor: '#009654',
                          backgroundColor: 'rgba(0, 177, 98, 0.1)',
                        },
                        '&:disabled': {
                          borderColor: 'rgba(107, 114, 128, 0.3)',
                          color: 'rgba(107, 114, 128, 0.5)',
                        },
                      }}
                    >
                      +
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={skill.starType} size="small" color="primary" />
                  <Chip label={`${skill.xpReward} XP`} size="small" sx={{ backgroundColor: '#6366f1', color: 'white' }} />
                  {!skill.isAvailable && skill.prerequisites.length > 0 && (
                    <Chip 
                      label="Prerequisites Required" 
                      size="small" 
                      sx={{ backgroundColor: '#ef4444', color: 'white' }}
                    />
                  )}
                </Box>
              </Box>
            );
          })()}
        </Box>
      )}

      {/* React Flow Constellation */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, includeHiddenNodes: false }}
        minZoom={1}
        maxZoom={1}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        selectNodesOnDrag={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f15 100%)',
          cursor: isDeleteMode ? 'crosshair' : 'default',
        }}
      >
        <Controls 
          showZoom={false}
          showInteractive={false}
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '8px',
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={50} 
          size={1}
          style={{ opacity: 0.3 }}
          color="#6366f1"
        />
      </ReactFlow>

      {/* Delete Connection Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.95), transparent)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#ef4444' }}>
          Delete Connection
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Are you sure you want to delete this skill connection? This will remove the prerequisite relationship between these skills.
            {selectedEdge && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#ef4444' }}>
                  Connection: {skills.find(s => s.id === selectedEdge.source)?.name} → {skills.find(s => s.id === selectedEdge.target)?.name}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConnection}
            sx={{ 
              color: '#ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConstellationSkillTree;