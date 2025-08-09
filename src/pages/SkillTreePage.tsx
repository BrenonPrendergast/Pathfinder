import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  Code,
  Analytics,
  Palette,
  Psychology,
} from '@mui/icons-material';
import SkillTree from '../components/SkillTree';

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

const SkillTreePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Skill Trees 🌳
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore different career skill trees and track your progression through interactive learning paths.
      </Typography>

      {/* Skill Path Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {skillPaths.map((path, index) => (
          <Grid item xs={12} sm={6} md={3} key={path.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: tabValue === index ? '2px solid' : '1px solid transparent',
                borderColor: tabValue === index ? `${path.color}.main` : 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[4]
                }
              }}
              onClick={() => setTabValue(index)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: `${path.color}.main`, mb: 2 }}>
                  {React.cloneElement(path.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {path.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {path.description}
                </Typography>
                {tabValue === index && (
                  <Chip 
                    label="Currently Viewing" 
                    color={path.color as any}
                    size="small" 
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {skillPaths.map((path) => (
            <Tab
              key={path.id}
              label={path.name}
              icon={path.icon}
              iconPosition="start"
            />
          ))}
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