import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Button,
} from '@mui/material';
import {
  Psychology,
} from '@mui/icons-material';
// For now, we'll primarily use Lucide icons to avoid React Icons compatibility issues
import { 
  Code, 
  BarChart3, 
  Palette, 
  User, 
  Briefcase,
  GraduationCap,
  Settings,
  Heart,
  Building,
  FlaskConical,
  Stethoscope,
  Gavel,
  PenTool,
  Camera,
  Wrench
} from 'lucide-react';
import SkillTree from '../components/SkillTree';
import LootySkillTree from '../components/LootySkillTree';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Career metadata mapping using Lucide icons for consistency
const careerMetadata: Record<string, {
  iconName: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
}> = {
  // Software Development
  'software-developer': { iconName: 'Code', color: 'secondary', description: 'Full-stack development and programming' },
  'software-engineer': { iconName: 'Code', color: 'secondary', description: 'Software engineering and architecture' },
  'web-developer': { iconName: 'Code', color: 'info', description: 'Web development and frontend/backend' },
  'mobile-developer': { iconName: 'Code', color: 'secondary', description: 'Mobile app development' },
  'devops-engineer': { iconName: 'Settings', color: 'warning', description: 'DevOps and infrastructure' },
  
  // Data & Analytics
  'data-scientist': { iconName: 'BarChart3', color: 'success', description: 'Data analysis and machine learning' },
  'data-analyst': { iconName: 'BarChart3', color: 'success', description: 'Data analysis and visualization' },
  'business-analyst': { iconName: 'BarChart3', color: 'info', description: 'Business analysis and strategy' },
  'research-scientist': { iconName: 'FlaskConical', color: 'success', description: 'Scientific research and analysis' },
  
  // Design & Creative
  'ux-designer': { iconName: 'Palette', color: 'warning', description: 'User experience design' },
  'ui-designer': { iconName: 'PenTool', color: 'warning', description: 'User interface design' },
  'graphic-designer': { iconName: 'Palette', color: 'warning', description: 'Graphic and visual design' },
  'photographer': { iconName: 'Camera', color: 'warning', description: 'Photography and visual media' },
  
  // Business & Management
  'project-manager': { iconName: 'Briefcase', color: 'primary', description: 'Project management and coordination' },
  'product-manager': { iconName: 'Briefcase', color: 'primary', description: 'Product strategy and development' },
  'business-manager': { iconName: 'User', color: 'primary', description: 'Business management and operations' },
  'marketing-manager': { iconName: 'User', color: 'info', description: 'Marketing and brand management' },
  
  // Healthcare
  'doctor': { iconName: 'Stethoscope', color: 'error', description: 'Medical practice and patient care' },
  'nurse': { iconName: 'Heart', color: 'error', description: 'Nursing and patient care' },
  'therapist': { iconName: 'Heart', color: 'error', description: 'Therapy and mental health' },
  
  // Education & Training
  'teacher': { iconName: 'GraduationCap', color: 'info', description: 'Education and teaching' },
  'trainer': { iconName: 'GraduationCap', color: 'info', description: 'Training and development' },
  
  // Legal & Finance
  'lawyer': { iconName: 'Gavel', color: 'primary', description: 'Legal practice and consultation' },
  'accountant': { iconName: 'Building', color: 'success', description: 'Accounting and financial management' },
  
  // Engineering & Technical
  'engineer': { iconName: 'Settings', color: 'secondary', description: 'Engineering and technical design' },
  'mechanic': { iconName: 'Wrench', color: 'warning', description: 'Mechanical repair and maintenance' },
  
  // Default fallback
  'default': { iconName: 'Briefcase', color: 'primary', description: 'Professional career path' }
};

const SkillTreePage: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Function to render Lucide icon based on metadata
  const renderIcon = (metadata: typeof careerMetadata[string]) => {
    const iconSize = 20;
    
    switch (metadata.iconName) {
      case 'Code': return <Code size={iconSize} />;
      case 'BarChart3': return <BarChart3 size={iconSize} />;
      case 'Palette': return <Palette size={iconSize} />;
      case 'PenTool': return <PenTool size={iconSize} />;
      case 'Camera': return <Camera size={iconSize} />;
      case 'Briefcase': return <Briefcase size={iconSize} />;
      case 'User': return <User size={iconSize} />;
      case 'Stethoscope': return <Stethoscope size={iconSize} />;
      case 'Heart': return <Heart size={iconSize} />;
      case 'GraduationCap': return <GraduationCap size={iconSize} />;
      case 'Gavel': return <Gavel size={iconSize} />;
      case 'Building': return <Building size={iconSize} />;
      case 'Settings': return <Settings size={iconSize} />;
      case 'FlaskConical': return <FlaskConical size={iconSize} />;
      case 'Wrench': return <Wrench size={iconSize} />;
      default: return <Briefcase size={iconSize} />;
    }
  };
  
  // Generate available skill paths based on user's chosen careers
  const availableSkillPaths = useMemo(() => {
    const paths: Array<{
      id: string;
      name: string;
      icon: React.ReactNode;
      description: string;
      color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
      isActive?: boolean;
    }> = [];
    
    // Always include General Skills first
    paths.push({
      id: 'general',
      name: 'General Skills',
      icon: <Psychology />,
      description: 'Foundational skills for any career path',
      color: 'primary' as const,
    });
    
    // Add user's chosen career paths
    if (userProfile?.careerPaths && userProfile.careerPaths.length > 0) {
      userProfile.careerPaths.forEach(careerPath => {
        const metadata = careerMetadata[careerPath.careerId] || careerMetadata['default'];
        paths.push({
          id: careerPath.careerId,
          name: careerPath.careerTitle,
          icon: renderIcon(metadata),
          description: metadata.description || `${careerPath.careerTitle} skills and expertise`,
          color: metadata.color,
          isActive: careerPath.isActive,
        });
      });
    }
    
    return paths;
  }, [userProfile?.careerPaths]);
  
  // Set default tab based on user's active career path
  const getDefaultTab = () => {
    if (!userProfile?.careerPaths || availableSkillPaths.length <= 1) return 0;
    
    const activeCareer = userProfile.careerPaths.find(path => path.isActive);
    if (!activeCareer) return 0;
    
    const pathIndex = availableSkillPaths.findIndex(path => path.id === activeCareer.careerId);
    return pathIndex >= 0 ? pathIndex : 0;
  };
  
  const [tabValue, setTabValue] = useState(() => getDefaultTab());
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [lootyMode, setLootyMode] = useState(false);
  
  // Check URL parameters for modes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setInteractiveMode(urlParams.get('interactive') === 'true');
    setLootyMode(urlParams.get('looty') === 'true');
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Mode Toggles */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Skill Development
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={lootyMode}
                onChange={(e) => setLootyMode(e.target.checked)}
                color="primary"
              />
            }
            label="Looty Design"
          />
          <FormControlLabel
            control={
              <Switch
                checked={interactiveMode}
                onChange={(e) => setInteractiveMode(e.target.checked)}
                color="primary"
              />
            }
            label="Interactive Mode"
          />
        </Box>
      </Box>
      
      {/* Career Path Tabs */}
      {availableSkillPaths.length > 1 ? (
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontFamily: '"Nacelle", sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9rem'
              }
            }}
          >
            {availableSkillPaths.map((path, index) => (
              <Tab
                key={path.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {path.name}
                    {path.isActive && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
                icon={<>{path.icon}</>}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      ) : (
        // No careers chosen - show helpful message
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center', backgroundColor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            Choose Your Career Path
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Select career paths to unlock specialized skill trees and personalized learning recommendations.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.href = '/careers'}
            startIcon={<Briefcase size={16} />}
          >
            Explore Careers
          </Button>
        </Paper>
      )}

      {/* Skill Trees */}
      {lootyMode ? (
        // Use new Looty-style skill tree (bypasses tabs for now)
        <LootySkillTree 
          careerPath={availableSkillPaths[tabValue]?.id || 'general'}
          onPointAllocation={(skillId, points) => {
            console.log(`Allocated ${points} points to skill ${skillId}`);
          }}
          onSkillUnlock={(skillId) => {
            console.log(`Skill ${skillId} unlocked!`);
          }}
        />
      ) : (
        // Use original Material-UI based skill trees
        availableSkillPaths.map((path, index) => (
          <TabPanel key={path.id} value={tabValue} index={index}>
            <SkillTree careerPath={path.id} interactive={interactiveMode} />
          </TabPanel>
        ))
      )}
    </Box>
  );
};

export default SkillTreePage;