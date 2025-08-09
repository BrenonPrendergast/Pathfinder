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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'hard' | 'soft';
  level: number;
  progress: number; // 0-100
  unlockAt: number; // prerequisite progress threshold
  prereqs: string[];
  hours: number; // hours practiced
  maxLevel: number;
}

interface SkillTreeProps {
  careerPath?: string;
}

const SkillTree: React.FC<SkillTreeProps> = ({ careerPath = 'general' }) => {
  const theme = useTheme();
  const { userProfile, updateUserProfile } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [lines, setLines] = useState<Array<{ from: { x: number; y: number }; to: { x: number; y: number }; id: string }>>([]);

  // Generate skill tree based on career path or general skills
  const getSkillTreeData = (): Skill[][] => {
    const userSkillHours = userProfile?.skillHours || {};

    if (careerPath === 'software-developer') {
      return [
        // Column 0: Foundations
        [{
          id: 'fundamentals',
          name: 'Fundamentals',
          description: 'Programming basics and computer science concepts',
          type: 'hard',
          level: Math.floor((userSkillHours.fundamentals || 0) / 50),
          progress: ((userSkillHours.fundamentals || 0) % 50) * 2,
          unlockAt: 0,
          prereqs: [],
          hours: userSkillHours.fundamentals || 0,
          maxLevel: 5
        }],

        // Column 1: Core Skills
        [{
          id: 'javascript',
          name: 'JavaScript',
          description: 'Modern JavaScript and ES6+ features',
          type: 'hard',
          level: Math.floor((userSkillHours.javascript || 0) / 40),
          progress: ((userSkillHours.javascript || 0) % 40) * 2.5,
          unlockAt: 20,
          prereqs: ['fundamentals'],
          hours: userSkillHours.javascript || 0,
          maxLevel: 8
        }, {
          id: 'problem-solving',
          name: 'Problem Solving',
          description: 'Analytical thinking and debugging skills',
          type: 'soft',
          level: Math.floor((userProfile?.completedQuests.length || 0) / 3),
          progress: ((userProfile?.completedQuests.length || 0) % 3) * 33,
          unlockAt: 30,
          prereqs: ['fundamentals'],
          hours: userSkillHours['problem-solving'] || 0,
          maxLevel: 6
        }],

        // Column 2: Advanced Skills
        [{
          id: 'react',
          name: 'React',
          description: 'Component-based UI development',
          type: 'hard',
          level: Math.floor((userSkillHours.react || 0) / 35),
          progress: ((userSkillHours.react || 0) % 35) * 2.9,
          unlockAt: 50,
          prereqs: ['javascript'],
          hours: userSkillHours.react || 0,
          maxLevel: 7
        }, {
          id: 'git',
          name: 'Version Control',
          description: 'Git and collaborative development',
          type: 'hard',
          level: Math.floor((userSkillHours.git || 0) / 25),
          progress: ((userSkillHours.git || 0) % 25) * 4,
          unlockAt: 40,
          prereqs: ['javascript', 'problem-solving'],
          hours: userSkillHours.git || 0,
          maxLevel: 5
        }],

        // Column 3: Specialization
        [{
          id: 'nodejs',
          name: 'Node.js',
          description: 'Server-side JavaScript development',
          type: 'hard',
          level: Math.floor((userSkillHours.nodejs || 0) / 45),
          progress: ((userSkillHours.nodejs || 0) % 45) * 2.2,
          unlockAt: 60,
          prereqs: ['react', 'git'],
          hours: userSkillHours.nodejs || 0,
          maxLevel: 6
        }, {
          id: 'leadership',
          name: 'Team Leadership',
          description: 'Leading development teams and projects',
          type: 'soft',
          level: Math.floor((userProfile?.level || 1) / 5),
          progress: ((userProfile?.level || 1) % 5) * 20,
          unlockAt: 70,
          prereqs: ['problem-solving'],
          hours: userSkillHours.leadership || 0,
          maxLevel: 4
        }]
      ];
    }

    // Data Scientist path
    if (careerPath === 'data-scientist') {
      return [
        // Column 0: Foundations
        [{
          id: 'math-stats',
          name: 'Math & Stats',
          description: 'Statistical foundations and mathematical concepts',
          type: 'hard',
          level: Math.floor((userSkillHours.statistics || 0) / 60),
          progress: ((userSkillHours.statistics || 0) % 60) * 1.67,
          unlockAt: 0,
          prereqs: [],
          hours: userSkillHours.statistics || 0,
          maxLevel: 8
        }],

        // Column 1: Core Skills
        [{
          id: 'python',
          name: 'Python',
          description: 'Data manipulation with pandas and numpy',
          type: 'hard',
          level: Math.floor((userSkillHours.python || 0) / 50),
          progress: ((userSkillHours.python || 0) % 50) * 2,
          unlockAt: 30,
          prereqs: ['math-stats'],
          hours: userSkillHours.python || 0,
          maxLevel: 7
        }, {
          id: 'data-analysis',
          name: 'Data Analysis',
          description: 'Exploratory data analysis and insights',
          type: 'hard',
          level: Math.floor((userSkillHours['data-analysis'] || 0) / 40),
          progress: ((userSkillHours['data-analysis'] || 0) % 40) * 2.5,
          unlockAt: 25,
          prereqs: ['math-stats'],
          hours: userSkillHours['data-analysis'] || 0,
          maxLevel: 6
        }],

        // Column 2: Advanced Skills
        [{
          id: 'machine-learning',
          name: 'Machine Learning',
          description: 'Predictive models and algorithms',
          type: 'hard',
          level: Math.floor((userSkillHours['machine-learning'] || 0) / 80),
          progress: ((userSkillHours['machine-learning'] || 0) % 80) * 1.25,
          unlockAt: 60,
          prereqs: ['python', 'data-analysis'],
          hours: userSkillHours['machine-learning'] || 0,
          maxLevel: 9
        }, {
          id: 'data-visualization',
          name: 'Data Viz',
          description: 'Creating compelling data stories',
          type: 'hard',
          level: Math.floor((userSkillHours['data-viz'] || 0) / 30),
          progress: ((userSkillHours['data-viz'] || 0) % 30) * 3.33,
          unlockAt: 50,
          prereqs: ['data-analysis'],
          hours: userSkillHours['data-viz'] || 0,
          maxLevel: 5
        }],

        // Column 3: Specialization
        [{
          id: 'deep-learning',
          name: 'Deep Learning',
          description: 'Neural networks and advanced AI',
          type: 'hard',
          level: Math.floor((userSkillHours['deep-learning'] || 0) / 100),
          progress: ((userSkillHours['deep-learning'] || 0) % 100) * 1,
          unlockAt: 80,
          prereqs: ['machine-learning'],
          hours: userSkillHours['deep-learning'] || 0,
          maxLevel: 10
        }, {
          id: 'communication',
          name: 'Data Communication',
          description: 'Presenting findings to stakeholders',
          type: 'soft',
          level: Math.floor((userSkillHours.communication || 0) / 35),
          progress: ((userSkillHours.communication || 0) % 35) * 2.86,
          unlockAt: 40,
          prereqs: ['data-visualization'],
          hours: userSkillHours.communication || 0,
          maxLevel: 6
        }]
      ];
    }

    // General/Default skill tree
    return [
      // Column 0: Foundations
      [{
        id: 'learning',
        name: 'Learning',
        description: 'Continuous learning and growth mindset',
        type: 'soft',
        level: Math.floor((userProfile?.totalXP || 0) / 500),
        progress: ((userProfile?.totalXP || 0) % 500) / 5,
        unlockAt: 0,
        prereqs: [],
        hours: Math.floor((userProfile?.totalXP || 0) / 10),
        maxLevel: 10
      }],

      // Column 1: Core Skills
      [{
        id: 'technical',
        name: 'Technical Skills',
        description: 'Programming and technology proficiency',
        type: 'hard',
        level: Math.floor((Object.values(userSkillHours).reduce((sum, hours) => sum + hours, 0)) / 100),
        progress: ((Object.values(userSkillHours).reduce((sum, hours) => sum + hours, 0)) % 100),
        unlockAt: 20,
        prereqs: ['learning'],
        hours: Object.values(userSkillHours).reduce((sum, hours) => sum + hours, 0),
        maxLevel: 8
      }, {
        id: 'creativity',
        name: 'Creativity',
        description: 'Innovation and creative problem solving',
        type: 'soft',
        level: Math.floor((userProfile?.level || 1) / 3),
        progress: ((userProfile?.level || 1) % 3) * 33,
        unlockAt: 15,
        prereqs: ['learning'],
        hours: userSkillHours.creativity || 0,
        maxLevel: 7
      }],

      // Column 2: Advanced Skills
      [{
        id: 'collaboration',
        name: 'Collaboration',
        description: 'Teamwork and communication skills',
        type: 'soft',
        level: Math.floor((userProfile?.completedQuests.length || 0) / 4),
        progress: ((userProfile?.completedQuests.length || 0) % 4) * 25,
        unlockAt: 40,
        prereqs: ['creativity'],
        hours: userSkillHours.collaboration || 0,
        maxLevel: 6
      }, {
        id: 'advanced-tech',
        name: 'Advanced Tech',
        description: 'Specialized technical expertise',
        type: 'hard',
        level: Math.floor((userSkillHours.javascript || 0 + userSkillHours.python || 0) / 80),
        progress: (((userSkillHours.javascript || 0) + (userSkillHours.python || 0)) % 80) * 1.25,
        unlockAt: 50,
        prereqs: ['technical'],
        hours: (userSkillHours.javascript || 0) + (userSkillHours.python || 0),
        maxLevel: 9
      }]
    ];
  };

  const [skillTree, setSkillTree] = useState<Skill[][]>(() => getSkillTreeData());
  const [flatMap, setFlatMap] = useState<{ [key: string]: Skill }>({});

  // Update skill tree when user profile changes
  useEffect(() => {
    const newTree = getSkillTreeData();
    setSkillTree(newTree);
  }, [userProfile, careerPath]);

  // Build flat map for quick lookup
  useEffect(() => {
    const map: { [key: string]: Skill } = {};
    skillTree.flat().forEach((skill) => (map[skill.id] = skill));
    setFlatMap(map);
  }, [skillTree]);

  // Draw connectors
  useEffect(() => {
    drawConnectors();
    const onResize = () => drawConnectors();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [flatMap]);

  const isSkillUnlocked = (skill: Skill): boolean => {
    if (!skill.prereqs || skill.prereqs.length === 0) return true;
    return skill.prereqs.every((prereqId) => {
      const prereq = flatMap[prereqId];
      if (!prereq) return false;
      return prereq.progress >= prereq.unlockAt;
    });
  };

  const addProgress = async (skillId: string, hours: number = 5) => {
    if (!userProfile) return;

    const newSkillHours = {
      ...userProfile.skillHours,
      [skillId]: (userProfile.skillHours[skillId] || 0) + hours
    };

    try {
      await updateUserProfile({ skillHours: newSkillHours });
    } catch (error) {
      console.error('Error updating skill hours:', error);
    }
  };

  const drawConnectors = () => {
    const segments: Array<{ from: { x: number; y: number }; to: { x: number; y: number }; id: string }> = [];
    
    try {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return setLines([]);

      const getCenter = (id: string) => {
        const node = nodeRefs.current[id]?.getBoundingClientRect();
        if (!node) return null;
        return {
          x: node.left - containerRect.left + node.width / 2,
          y: node.top - containerRect.top + node.height / 2
        };
      };

      skillTree.flat().forEach((skill) => {
        if (!skill.prereqs) return;
        skill.prereqs.forEach((prereqId) => {
          const from = getCenter(prereqId);
          const to = getCenter(skill.id);
          if (from && to) {
            segments.push({ from, to, id: `${prereqId}->${skill.id}` });
          }
        });
      });

      setLines(segments);
    } catch (error) {
      setLines([]);
    }
  };

  const describeCurve = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = Math.abs(x2 - x1);
    const cpx1 = x1 + dx * 0.45;
    const cpy1 = y1;
    const cpx2 = x2 - dx * 0.45;
    const cpy2 = y2;
    return `M ${x1} ${y1} C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${x2} ${y2}`;
  };

  const getSkillIcon = (skill: Skill) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      fundamentals: <School />,
      javascript: <Code />,
      python: <Code />,
      'problem-solving': <Psychology />,
      react: <Code />,
      git: <Code />,
      nodejs: <Code />,
      leadership: <Group />,
      'math-stats': <School />,
      'data-analysis': <TrendingUp />,
      'machine-learning': <Psychology />,
      'data-visualization': <Lightbulb />,
      'deep-learning': <Psychology />,
      communication: <Group />,
      learning: <School />,
      technical: <Code />,
      creativity: <Lightbulb />,
      collaboration: <Group />,
      'advanced-tech': <Code />
    };

    return iconMap[skill.id] || (skill.type === 'hard' ? <Code /> : <Psychology />);
  };

  const renderSkillNode = (skill: Skill) => {
    const unlocked = isSkillUnlocked(skill);
    const isMaxLevel = skill.level >= skill.maxLevel;

    return (
      <Card
        key={skill.id}
        ref={(el) => (nodeRefs.current[skill.id] = el)}
        sx={{
          width: 240,
          minHeight: 140,
          position: 'relative',
          background: unlocked 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(135deg, rgba(75, 85, 99, 0.3), rgba(55, 65, 81, 0.3))',
          border: `2px solid ${unlocked ? theme.palette.primary.main : theme.palette.grey[600]}`,
          borderRadius: 2,
          opacity: unlocked ? 1 : 0.6,
          transition: 'all 0.3s ease',
          '&:hover': unlocked ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          } : {}
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
                  backgroundColor: skill.type === 'hard' ? theme.palette.warning.main : theme.palette.secondary.main
                }}
              >
                {getSkillIcon(skill)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {skill.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Level {skill.level} / {skill.maxLevel}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={skill.type}
                size="small"
                color={skill.type === 'hard' ? 'warning' : 'secondary'}
                variant="outlined"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {unlocked ? (
                  <Typography variant="caption" color="success.main">
                    Unlocked
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Lock sx={{ fontSize: 12 }} />
                    <Typography variant="caption">Locked</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">
                Progress {isMaxLevel ? '(MAX)' : ''}
              </Typography>
              <Typography variant="caption">
                {Math.round(skill.progress)}% ({skill.hours}h)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={isMaxLevel ? 100 : skill.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: unlocked 
                    ? (isMaxLevel ? theme.palette.success.main : theme.palette.primary.main)
                    : theme.palette.grey[500],
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* Description */}
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.8rem' }}>
            {skill.description}
          </Typography>
        </CardContent>

        {/* Action Button */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            size="small"
            disabled={!unlocked || isMaxLevel}
            onClick={() => addProgress(skill.id, 5)}
            sx={{
              backgroundColor: unlocked && !isMaxLevel ? theme.palette.primary.main : theme.palette.grey[600],
              color: 'white',
              width: 28,
              height: 28,
              '&:hover': {
                backgroundColor: unlocked && !isMaxLevel ? theme.palette.primary.dark : theme.palette.grey[600],
              }
            }}
          >
            <Add sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: '80vh', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          🌳 Skill Tree
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {careerPath === 'general' ? 'General Skills Development' : 
           careerPath === 'software-developer' ? 'Software Developer Path' :
           careerPath === 'data-scientist' ? 'Data Scientist Path' : 
           'Career Skills Development'}
        </Typography>
        
        <Button
          startIcon={<Refresh />}
          onClick={() => setSkillTree(getSkillTreeData())}
          variant="outlined"
          size="small"
        >
          Refresh Tree
        </Button>
      </Box>

      {/* Skill Tree */}
      <Paper 
        ref={containerRef}
        sx={{ 
          position: 'relative', 
          p: 4, 
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          overflow: 'auto'
        }}
      >
        {/* SVG Connectors */}
        <svg 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {lines.map((line) => (
            <path
              key={line.id}
              d={describeCurve(line.from.x, line.from.y, line.to.x, line.to.y)}
              stroke={theme.palette.grey[400]}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              opacity={0.6}
            />
          ))}
        </svg>

        {/* Skill Nodes */}
        <Box sx={{ display: 'flex', gap: 6, alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          {skillTree.map((column, colIndex) => (
            <Box key={colIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {column.map((skill) => renderSkillNode(skill))}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Instructions */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          💡 Tip: Click the + button on unlocked skills to add practice hours. Skills unlock when prerequisites reach their thresholds.
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillTree;