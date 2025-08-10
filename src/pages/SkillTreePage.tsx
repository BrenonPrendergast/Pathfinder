import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Code,
  Analytics,
  Palette,
  Psychology,
} from '@mui/icons-material';
import SkillTree from '../components/SkillTree';
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

const skillPaths = [
  {
    id: 'general',
    name: 'General Skills',
    icon: <Psychology />,
    description: 'Foundational skills for any career path',
    color: 'primary'
  },
  {
    id: 'software-developer',
    name: 'Software Developer',
    icon: <Code />,
    description: 'Full-stack development skills and programming mastery',
    color: 'secondary'
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    icon: <Analytics />,
    description: 'Data analysis, machine learning, and statistical modeling',
    color: 'success'
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    icon: <Palette />,
    description: 'User experience design and research skills',
    color: 'warning'
  }
];

const SkillTreePage: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Set default tab based on user's active career path
  const getDefaultTab = () => {
    if (!userProfile?.currentCareerPath) return 0;
    const activeCareer = userProfile.careerPaths.find(path => path.isActive);
    if (!activeCareer) return 0;
    
    const pathIndex = skillPaths.findIndex(path => path.id === activeCareer.careerId);
    return pathIndex >= 0 ? pathIndex : 0;
  };
  
  const [tabValue, setTabValue] = useState(() => getDefaultTab());

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Career Path Tabs */}
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
          {skillPaths.map((path, index) => {
            const isActiveCareer = userProfile?.careerPaths.some(
              cp => cp.careerId === path.id && cp.isActive
            );
            return (
              <Tab
                key={path.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {path.name}
                    {isActiveCareer && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
                icon={path.icon}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Skill Trees */}
      <TabPanel value={tabValue} index={0}>
        <SkillTree careerPath="general" />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SkillTree careerPath="software-developer" />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SkillTree careerPath="data-scientist" />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Palette sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            UX Designer Skill Tree
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Coming soon! This skill tree will include user research, design thinking, prototyping, and usability testing skills.
          </Typography>
          <Chip label="Under Development" color="warning" />
        </Box>
      </TabPanel>
    </Box>
  );
};

export default SkillTreePage;