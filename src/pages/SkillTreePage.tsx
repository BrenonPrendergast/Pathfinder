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
  TextField,
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
import { careerService } from '../services/career/career.service';
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
  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [loadingCareers, setLoadingCareers] = useState(false);
  const [careerSearchTerm, setCareerSearchTerm] = useState('');
  
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

  // Load all careers for admin dropdown
  useEffect(() => {
    if (isAdmin()) {
      loadAllCareers();
    }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllCareers = async () => {
    try {
      setLoadingCareers(true);
      const careers = await careerService.getAllCareers();
      setAllCareers(careers);
    } catch (error) {
      console.error('Error loading careers for admin dropdown:', error);
    } finally {
      setLoadingCareers(false);
    }
  };

  // Dynamic admin career options that include all careers from database with search filtering
  const adminCareerOptions = useMemo(() => {
    const options = [
      { id: 'general', name: 'General Skills', icon: <Psychology />, description: 'Foundational skills for any career path' }
    ];

    // Filter careers based on search term
    const filteredCareers = careerSearchTerm 
      ? allCareers.filter(career => 
          career.title.toLowerCase().includes(careerSearchTerm.toLowerCase()) ||
          (career.description && career.description.toLowerCase().includes(careerSearchTerm.toLowerCase()))
        )
      : allCareers;

    // Add filtered careers from database
    filteredCareers.forEach((career) => {
      const metadata = careerMetadata[career.id] || careerMetadata['default'];
      options.push({
        id: career.id,
        name: career.title,
        icon: renderIcon(metadata),
        description: career.description || `Skills for ${career.title} career path`
      });
    });

    return options;
  }, [allCareers, careerSearchTerm]);

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
        <Box sx={{ py: { xs: 2, md: 3 } }}>

          {/* Admin Controls - Compact Top Right */}
          {isAdmin() && (
            <Box sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1000,
              display: 'flex',
              flexDirection: adminEditMode ? 'column' : 'row',
              gap: 1,
              p: adminEditMode ? 1.5 : 1,
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 1,
              minWidth: adminEditMode ? 240 : 'auto',
              alignItems: adminEditMode ? 'stretch' : 'center',
            }}>
              {/* Admin Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={adminEditMode}
                    onChange={(e) => handleAdminEditModeChange(e.target.checked)}
                    size="small"
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
                label={adminEditMode ? "Admin Mode" : "Admin"}
                sx={{ 
                  color: adminEditMode ? '#ef4444' : 'white',
                  fontWeight: adminEditMode ? 600 : 'normal',
                  fontSize: '0.8rem',
                  margin: 0,
                  minWidth: 'auto',
                }}
              />

              {/* Admin Search & Dropdown - Only show when in edit mode */}
              {adminEditMode && (
                <>
                  <TextField
                    size="small"
                    placeholder={`Search careers...`}
                    value={careerSearchTerm}
                    onChange={(e) => setCareerSearchTerm(e.target.value)}
                    sx={{
                      minWidth: 160,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        height: 32,
                        '& fieldset': {
                          borderColor: 'rgba(99, 102, 241, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                        '& input': {
                          color: 'white',
                          fontSize: '0.75rem',
                          py: 0.5,
                        },
                      },
                    }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
                      {loadingCareers ? 'Loading...' : 'Career'}
                    </InputLabel>
                    <Select
                      value={adminSelectedCareer}
                      label={loadingCareers ? 'Loading...' : 'Career'}
                      onChange={(e) => setAdminSelectedCareer(e.target.value)}
                      disabled={loadingCareers}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '0.75rem',
                        height: 32,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(99, 102, 241, 0.5)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                        '& .MuiSelect-icon': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            backgroundColor: 'rgba(31, 41, 55, 0.95)',
                            backdropFilter: 'blur(10px)',
                          },
                        },
                      }}
                    >
                      {adminCareerOptions.map((career) => (
                        <MenuItem key={career.id} value={career.id} sx={{ color: 'white', fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {career.icon}
                            <Typography sx={{ fontWeight: career.id === 'general' ? 600 : 400, fontSize: '0.85rem' }}>
                              {career.name}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          )}
      
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
              adminEditMode={adminEditMode}
              onManualSave={(nodes, edges) => {
                console.log('Admin manually saved changes:', nodes, edges);
                setAdminEditMode(false);
              }}
              onCancel={() => setAdminEditMode(false)}
            />
          ) : (
            // Use constellation-style skill tree (now the standard view)
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
          )}
        </Box>
      </Container>
    </div>
  );
};

export default SkillTreePage;