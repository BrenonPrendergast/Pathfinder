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
import { Box, Typography, Chip, Button, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { RotateCcw, Trash2 } from 'lucide-react';
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
  level: number;
  isUnlocked: boolean;
  isAvailable: boolean;
  category: string;
  xpReward: number;
  prerequisites: string[];
  starType: 'main-sequence' | 'giant' | 'supergiant' | 'dwarf';
  constellation: string;
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

  // Load skills data and convert to constellation nodes
  useEffect(() => {
    loadSkillsData();
  }, [careerPath]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const skillsData = await skillService.getSkillsByCareerPath(careerPath);
      
      if (skillsData.length > 0) {
        // Admin template exists - process and display
        const processedSkills = processSkillsForConstellation(skillsData);
        setSkills(processedSkills);
        setHasTemplate(true);
        generateConstellationLayout(processedSkills);
      } else {
        // No admin template - show Coming Soon
        setHasTemplate(false);
        setSkills([]);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      setHasTemplate(false);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const processSkillsForConstellation = (rawSkills: any[]): SkillNodeData[] => {
    return rawSkills.map((skill, index) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description || '',
      level: skill.level || 1,
      isUnlocked: userProfile?.completedQuests?.some(questId => questId.includes(skill.id)) || false,
      isAvailable: checkSkillAvailability(skill, userProfile),
      category: skill.category || 'general',
      xpReward: skill.xpReward || 10,
      prerequisites: skill.prerequisites || [],
      starType: determineStarType(skill),
      constellation: skill.category || 'general',
    }));
  };

  const determineStarType = (skill: any): SkillNodeData['starType'] => {
    const level = skill.level || 1;
    if (level >= 5) return 'supergiant';
    if (level >= 3) return 'giant';
    if (level >= 2) return 'main-sequence';
    return 'dwarf';
  };

  const checkSkillAvailability = (skill: any, profile: any): boolean => {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every((prereq: string) => 
      profile?.completedQuests?.some((questId: string) => questId.includes(prereq))
    );
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
        // Spiral positioning within constellation
        const angle = (skillIndex * 2.4) + (constellationIndex * 0.8);
        const radius = 80 + (skillIndex * 30);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        newNodes.push({
          id: skill.id,
          type: 'skillStar',
          position: { x, y },
          data: {
            ...skill,
            onSelect: () => handleSkillSelect(skill.id),
            onUnlock: () => onSkillUnlock?.(skill.id),
            textScale: 1.0,
            isAdminMode: false,
          },
          draggable: false,
          connectable: false,
        });

        // Create edges for prerequisites
        skill.prerequisites.forEach(prereqId => {
          if (skillsData.find(s => s.id === prereqId)) {
            newEdges.push({
              id: `${prereqId}-${skill.id}`,
              source: prereqId,
              target: skill.id,
              type: 'constellation',
              data: {
                isActive: skill.isUnlocked,
                isAvailable: skill.isAvailable,
                isDeleteMode: false, // Will be updated dynamically
              },
              style: {
                stroke: skill.isUnlocked ? '#00B162' : skill.isAvailable ? '#6366f1' : '#374151',
                strokeWidth: skill.isUnlocked ? 3 : 2,
                opacity: skill.isUnlocked ? 1 : 0.6,
              },
            });
          }
        });
      });

      // Add constellation center node
      newNodes.push({
        id: `constellation-${constellation}`,
        type: 'default',
        position: { x: centerX, y: centerY },
        data: {
          label: constellation.charAt(0).toUpperCase() + constellation.slice(1),
        },
        style: {
          background: 'rgba(99, 102, 241, 0.1)',
          border: '2px solid #6366f1',
          borderRadius: '50%',
          width: 120,
          height: 120,
          fontSize: '12px',
          color: '#6366f1',
          fontWeight: 600,
        },
        draggable: false,
        connectable: false,
      });
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
      {/* Constellation Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        zIndex: 10,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap'
      }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RotateCcw size={16} />}
          onClick={resetView}
          sx={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            color: 'white',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
            },
          }}
        >
          Reset View
        </Button>

        <Button
          variant={isDeleteMode ? "contained" : "outlined"}
          size="small"
          startIcon={<Trash2 size={16} />}
          onClick={toggleDeleteMode}
          sx={{
            backgroundColor: isDeleteMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(31, 41, 55, 0.8)',
            color: 'white',
            border: isDeleteMode ? '1px solid rgba(239, 68, 68, 0.8)' : '1px solid rgba(99, 102, 241, 0.5)',
            '&:hover': {
              backgroundColor: isDeleteMode ? 'rgba(239, 68, 68, 1)' : 'rgba(239, 68, 68, 0.2)',
            },
          }}
        >
          {isDeleteMode ? 'Exit Delete' : 'Delete Connections'}
        </Button>

        {/* Stats */}
        <Chip 
          label={`${skills.filter(s => s.isUnlocked).length}/${skills.length} Unlocked`}
          size="small"
          sx={{ 
            backgroundColor: '#00B162', 
            color: 'white',
            fontWeight: 600,
          }}
        />

        {isDeleteMode && (
          <Chip 
            label="Click connections to delete"
            size="small"
            sx={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.8)', 
              color: 'white',
              fontWeight: 600,
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </Box>

      {/* Selected Skill Details */}
      {selectedSkill && (
        <Paper sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          p: 2,
          maxWidth: 300,
          background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.9), transparent)',
          backdropFilter: 'blur(10px)',
        }}>
          {(() => {
            const skill = getSelectedSkill();
            if (!skill) return null;
            return (
              <Box>
                <Typography variant="h6" sx={{ color: '#00B162', mb: 1 }}>
                  {skill.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                  {skill.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={skill.starType} size="small" color="primary" />
                  <Chip label={`${skill.xpReward} XP`} size="small" sx={{ backgroundColor: '#00B162', color: 'white' }} />
                </Box>
              </Box>
            );
          })()}
        </Paper>
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f15 100%)',
          cursor: isDeleteMode ? 'crosshair' : 'default',
        }}
      >
        <Controls 
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '8px',
          }}
        />
        <MiniMap 
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
          }}
          nodeColor={(node) => {
            const skill = skills.find(s => s.id === node.id);
            if (!skill) return '#374151';
            return skill.isUnlocked ? '#00B162' : skill.isAvailable ? '#6366f1' : '#374151';
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