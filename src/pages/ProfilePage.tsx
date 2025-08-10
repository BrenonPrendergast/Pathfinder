import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Email,
  CalendarToday,
  TrendingUp,
  Assignment,
  EmojiEvents,
  Edit,
  Save,
  Cancel,
  GamepadOutlined,
  AccountCircle,
  Work,
  Add,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CharacterSheet from '../components/CharacterSheet';
import { careerService } from '../services';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, updateUserProfile, addCareerPath, setActiveCareerPath } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userProfile?.displayName || '',
    currentCareerPath: userProfile?.currentCareerPath || '',
  });
  const [saving, setSaving] = useState(false);
  const [careers, setCareers] = useState<any[]>([]);
  const [loadingCareers, setLoadingCareers] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Load careers when Career Paths tab is selected
    if (newValue === 2 && careers.length === 0) {
      loadCareers();
    }
  };

  // Load available careers
  const loadCareers = async () => {
    setLoadingCareers(true);
    try {
      const { careers: careerList } = await careerService.getCareers(20);
      setCareers(careerList);
    } catch (error) {
      console.error('Error loading careers:', error);
    } finally {
      setLoadingCareers(false);
    }
  };

  // Add a career path to user's profile
  const handleAddCareerPath = async (careerId: string, careerTitle: string) => {
    try {
      await addCareerPath(careerId, careerTitle);
    } catch (error) {
      console.error('Error adding career path:', error);
    }
  };

  // Set active career path
  const handleSetActiveCareer = async (careerId: string) => {
    try {
      await setActiveCareerPath(careerId);
    } catch (error) {
      console.error('Error setting active career:', error);
    }
  };

  if (!currentUser || !userProfile) {
    return (
      <Box>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  const getXPProgress = () => {
    const currentLevel = userProfile.level;
    const nextLevelXP = Math.pow(2, currentLevel) * 50;
    const currentLevelXP = Math.pow(2, currentLevel - 1) * 50;
    const progressXP = userProfile.totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const percentage = Math.min((progressXP / requiredXP) * 100, 100);
    
    return {
      current: progressXP,
      required: requiredXP,
      percentage
    };
  };

  const handleEditProfile = () => {
    setEditData({
      displayName: userProfile.displayName || '',
      currentCareerPath: userProfile.currentCareerPath || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateUserProfile({
        displayName: editData.displayName,
        currentCareerPath: editData.currentCareerPath,
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const xpProgress = getXPProgress();

  const topSkills = Object.entries(userProfile.skillHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Profile 👤
      </Typography>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label="Character Sheet" 
            icon={<GamepadOutlined />} 
            iconPosition="start"
            id="profile-tab-0" 
          />
          <Tab 
            label="Profile Details" 
            icon={<AccountCircle />} 
            iconPosition="start"
            id="profile-tab-1" 
          />
          <Tab 
            label="Career Paths" 
            icon={<Work />} 
            iconPosition="start"
            id="profile-tab-2" 
          />
        </Tabs>
      </Box>

      {/* Character Sheet Tab */}
      <TabPanel value={tabValue} index={0}>
        <CharacterSheet />
      </TabPanel>

      {/* Profile Details Tab */}
      <TabPanel value={tabValue} index={1}>

      <Grid container spacing={4}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={currentUser.photoURL || undefined}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  fontSize: '3rem' 
                }}
              >
                {userProfile.displayName?.[0] || currentUser.email?.[0]?.toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {userProfile.displayName || 'Anonymous Pathfinder'}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Chip 
                  label={`Level ${userProfile.level}`} 
                  color="primary" 
                  size="medium"
                />
                <Chip 
                  label={`${userProfile.totalXP.toLocaleString()} XP`} 
                  color="secondary" 
                  size="medium"
                />
              </Box>

              <Button 
                variant="outlined" 
                startIcon={<Edit />}
                onClick={handleEditProfile}
                fullWidth
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Info
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email"
                    secondary={currentUser.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Member Since"
                    secondary={userProfile.createdAt.toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Current Career Path"
                    secondary={userProfile.currentCareerPath || 'Not set'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats and Progress */}
        <Grid item xs={12} md={8}>
          {/* Level Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Level Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Level {userProfile.level}
                  </Typography>
                  <Typography variant="body2">
                    Level {userProfile.level + 1}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={xpProgress.percentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {Math.max(0, xpProgress.required - xpProgress.current).toLocaleString()} XP to next level
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {userProfile.completedQuests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quests Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEvents color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="secondary">
                    {userProfile.unlockedAchievements.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Achievements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" color="success">
                    {userProfile.activeQuests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Quests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Skills */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Skills
              </Typography>
              {topSkills.length > 0 ? (
                <List>
                  {topSkills.map(([skillName, hours], index) => (
                    <React.Fragment key={skillName}>
                      <ListItem>
                        <ListItemText
                          primary={skillName}
                          secondary={`${hours} hours practiced`}
                        />
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          color="primary"
                        />
                      </ListItem>
                      {index < topSkills.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No skills tracked yet. Complete quests to start building your skill profile!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Display Name"
            value={editData.displayName}
            onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Current Career Path"
            value={editData.currentCareerPath}
            onChange={(e) => setEditData({ ...editData, currentCareerPath: e.target.value })}
            margin="normal"
            placeholder="e.g., Software Developer, Data Scientist"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      </TabPanel> {/* Close Profile Details Tab */}

      {/* Career Paths Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Active Career Paths */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Career Paths
                </Typography>
                {userProfile.careerPaths.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No career paths selected yet. Browse available careers to get started!
                  </Typography>
                ) : (
                  <List>
                    {userProfile.careerPaths.map((careerPath) => (
                      <ListItem key={careerPath.careerId} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {careerPath.isActive ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Work color="disabled" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={careerPath.careerTitle}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Progress: {careerPath.progressPercentage}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={careerPath.progressPercentage}
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                        {!careerPath.isActive && (
                          <Button
                            size="small"
                            onClick={() => handleSetActiveCareer(careerPath.careerId)}
                          >
                            Set Active
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Available Careers */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Explore Careers
                </Typography>
                {loadingCareers ? (
                  <Typography>Loading careers...</Typography>
                ) : (
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {careers.map((career) => {
                      const isAlreadyAdded = userProfile.careerPaths.some(
                        path => path.careerId === career.id
                      );
                      return (
                        <ListItem key={career.id} sx={{ px: 0 }}>
                          <ListItemText
                            primary={career.title}
                            secondary={
                              <Typography variant="caption" display="block">
                                {career.description?.substring(0, 100)}...
                              </Typography>
                            }
                          />
                          <Button
                            size="small"
                            startIcon={<Add />}
                            disabled={isAlreadyAdded}
                            onClick={() => handleAddCareerPath(career.id, career.title)}
                          >
                            {isAlreadyAdded ? 'Added' : 'Add Path'}
                          </Button>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel> {/* Close Career Paths Tab */}
      
    </Box>
  );
};

export default ProfilePage;