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
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import ConstellationSkillTree from '../components/ConstellationSkillTree';
import AdminConstellationEditor from '../components/constellation/AdminConstellationEditor';
import { useAuth } from '../contexts/AuthContext';
import GamingBackground from '../components/backgrounds/GamingBackground';
import FloatingNodes from '../components/backgrounds/FloatingNodes';
import InteractiveSpotlight from '../components/backgrounds/InteractiveSpotlight';

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
  const { userProfile, isAdmin } = useAuth();
  
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
  const [constellationMode, setConstellationMode] = useState(false);
  const [adminEditMode, setAdminEditMode] = useState(false);
  const [adminSelectedCareer, setAdminSelectedCareer] = useState<string>('general');

  // Comprehensive admin career options
  const adminCareerOptions = useMemo(() => [
    { id: 'general', name: 'General Skills', icon: <Psychology />, description: 'Foundational skills for any career path' },
    
    // Software Development
    { id: 'software-developer', name: 'Software Developer', icon: renderIcon(careerMetadata['software-developer']), description: 'Full-stack development and programming' },
    { id: 'software-engineer', name: 'Software Engineer', icon: renderIcon(careerMetadata['software-engineer']), description: 'Software engineering and architecture' },
    { id: 'web-developer', name: 'Web Developer', icon: renderIcon(careerMetadata['web-developer']), description: 'Web development and frontend/backend' },
    { id: 'mobile-developer', name: 'Mobile Developer', icon: renderIcon(careerMetadata['mobile-developer']), description: 'Mobile app development' },
    { id: 'devops-engineer', name: 'DevOps Engineer', icon: renderIcon(careerMetadata['devops-engineer']), description: 'DevOps and infrastructure' },
    
    // Data & Analytics
    { id: 'data-scientist', name: 'Data Scientist', icon: renderIcon(careerMetadata['data-scientist']), description: 'Data analysis and machine learning' },
    { id: 'data-analyst', name: 'Data Analyst', icon: renderIcon(careerMetadata['data-analyst']), description: 'Data analysis and visualization' },
    { id: 'business-analyst', name: 'Business Analyst', icon: renderIcon(careerMetadata['business-analyst']), description: 'Business analysis and strategy' },
    { id: 'research-scientist', name: 'Research Scientist', icon: renderIcon(careerMetadata['research-scientist']), description: 'Scientific research and analysis' },
    
    // Design & Creative
    { id: 'ux-designer', name: 'UX Designer', icon: renderIcon(careerMetadata['ux-designer']), description: 'User experience design' },
    { id: 'ui-designer', name: 'UI Designer', icon: renderIcon(careerMetadata['ui-designer']), description: 'User interface design' },
    { id: 'graphic-designer', name: 'Graphic Designer', icon: renderIcon(careerMetadata['graphic-designer']), description: 'Graphic and visual design' },
    { id: 'photographer', name: 'Photographer', icon: renderIcon(careerMetadata['photographer']), description: 'Photography and visual media' },
    
    // Business & Management
    { id: 'project-manager', name: 'Project Manager', icon: renderIcon(careerMetadata['project-manager']), description: 'Project management and coordination' },
    { id: 'product-manager', name: 'Product Manager', icon: renderIcon(careerMetadata['product-manager']), description: 'Product strategy and development' },
    { id: 'business-manager', name: 'Business Manager', icon: renderIcon(careerMetadata['business-manager']), description: 'Business management and operations' },
    { id: 'marketing-manager', name: 'Marketing Manager', icon: renderIcon(careerMetadata['marketing-manager']), description: 'Marketing and brand management' },
    
    // Healthcare
    { id: 'doctor', name: 'Doctor', icon: renderIcon(careerMetadata['doctor']), description: 'Medical practice and patient care' },
    { id: 'nurse', name: 'Nurse', icon: renderIcon(careerMetadata['nurse']), description: 'Nursing and patient care' },
    { id: 'therapist', name: 'Therapist', icon: renderIcon(careerMetadata['therapist']), description: 'Therapy and mental health' },
    
    // Education & Training
    { id: 'teacher', name: 'Teacher', icon: renderIcon(careerMetadata['teacher']), description: 'Education and teaching' },
    { id: 'trainer', name: 'Trainer', icon: renderIcon(careerMetadata['trainer']), description: 'Training and development' },
    
    // Legal & Finance
    { id: 'lawyer', name: 'Lawyer', icon: renderIcon(careerMetadata['lawyer']), description: 'Legal practice and consultation' },
    { id: 'accountant', name: 'Accountant', icon: renderIcon(careerMetadata['accountant']), description: 'Accounting and financial management' },
    
    // Engineering & Technical
    { id: 'engineer', name: 'Engineer', icon: renderIcon(careerMetadata['engineer']), description: 'Engineering and technical design' },
    { id: 'mechanic', name: 'Mechanic', icon: renderIcon(careerMetadata['mechanic']), description: 'Mechanical repair and maintenance' },
  ], []);

  const getAdminCareerName = () => {
    const career = adminCareerOptions.find(c => c.id === adminSelectedCareer);
    return career?.name || adminSelectedCareer;
  };
  
  // Check URL parameters for modes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setConstellationMode(urlParams.get('constellation') === 'true' || true); // Default to constellation mode
    setAdminEditMode(urlParams.get('admin') === 'true' && isAdmin());
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdminEditModeChange = (checked: boolean) => {
    setAdminEditMode(checked);
    // When entering admin mode, default to current tab's career or general
    if (checked) {
      const currentCareer = availableSkillPaths[tabValue]?.id || 'general';
      setAdminSelectedCareer(currentCareer);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gaming Background Layers */}
      <GamingBackground variant="combined" intensity="medium" />
      <FloatingNodes nodeCount={20} connectionOpacity={0.12} />
      <InteractiveSpotlight size="large" intensity="subtle" color="primary" />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ py: { xs: 4, md: 6 } }}>

          {/* Mode Toggles */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Admin Edit Mode Toggle */}
              {isAdmin() && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminEditMode}
                      onChange={(e) => handleAdminEditModeChange(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ef4444',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ef4444',
                        },
                      }}
                    />
                  }
                  label="Admin Edit Mode 🔧"
                  sx={{ 
                    color: adminEditMode ? '#ef4444' : 'inherit',
                    fontWeight: adminEditMode ? 600 : 'normal',
                  }}
                />
              )}

              {/* Admin Career Path Selector */}
              {isAdmin() && adminEditMode && (
                <FormControl 
                  size="small" 
                  sx={{ 
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#6366f1',
                      '&.Mui-focused': {
                        color: '#6366f1',
                      },
                    },
                  }}
                >
                  <InputLabel>Edit Career Path</InputLabel>
                  <Select
                    value={adminSelectedCareer}
                    label="Edit Career Path"
                    onChange={(e) => setAdminSelectedCareer(e.target.value)}
                  >
                    {adminCareerOptions.map((career) => (
                      <MenuItem key={career.id} value={career.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {career.icon}
                          <Typography>{career.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={constellationMode}
                    onChange={(e) => setConstellationMode(e.target.checked)}
                    disabled={adminEditMode}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#fbbf24',
                        '&:hover': {
                          backgroundColor: 'rgba(251, 191, 36, 0.08)',
                        },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#fbbf24',
                      },
                    }}
                  />
                }
                label="Constellation View ✨"
                sx={{ 
                  color: constellationMode ? '#fbbf24' : 'inherit',
                  fontWeight: constellationMode ? 600 : 'normal',
                  opacity: adminEditMode ? 0.5 : 1,
                }}
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
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: '#6366f1',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#6366f1',
                  },
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
                            sx={{ 
                              fontSize: '0.6rem', 
                              height: 20,
                              backgroundColor: '#00B162',
                              color: 'white',
                            }}
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
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              textAlign: 'center', 
              background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.5), transparent)',
            }}>
              <Typography variant="h6" gutterBottom>
                Choose Your Career Path
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Select career paths to unlock specialized skill trees and personalized learning recommendations.
              </Typography>
              <Button 
                variant="contained"
                onClick={() => window.location.href = '/careers'}
                startIcon={<Briefcase size={16} />}
                sx={{
                  backgroundColor: '#00B162',
                  '&:hover': {
                    backgroundColor: '#009654',
                  },
                }}
              >
                Explore Careers
              </Button>
            </Paper>
          )}

          {/* Skill Trees */}
          {adminEditMode ? (
            // Admin constellation editor
            <AdminConstellationEditor
              careerPath={adminSelectedCareer}
              careerName={getAdminCareerName()}
              onSave={(nodes, edges) => {
                console.log('Admin saved changes:', nodes, edges);
                setAdminEditMode(false);
              }}
              onCancel={() => setAdminEditMode(false)}
            />
          ) : constellationMode ? (
            // Use constellation-style skill tree
            <ConstellationSkillTree 
              careerPath={availableSkillPaths[tabValue]?.id || 'general'}
              careerName={availableSkillPaths[tabValue]?.name}
              onSkillSelect={(skillId) => {
                console.log(`Selected skill: ${skillId}`);
              }}
              onSkillUnlock={(skillId) => {
                console.log(`Skill ${skillId} unlocked!`);
              }}
            />
          ) : (
            // Use original Material-UI based skill trees
            availableSkillPaths.map((path, index) => (
              <TabPanel key={path.id} value={tabValue} index={index}>
                <SkillTree careerPath={path.id} />
              </TabPanel>
            ))
          )}
        </Box>
      </Container>
    </div>
  );
};

export default SkillTreePage;