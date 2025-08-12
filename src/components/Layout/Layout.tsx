import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  LinearProgress,
  Typography,
  useTheme,
  useMediaQuery,
  Toolbar,
} from '@mui/material';
import {
  Home,
  Work,
  Assignment,
  EmojiEvents,
  Person,
  Dashboard,
  TrendingUp,
  AdminPanelSettings,
  Psychology,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GamingAppBar from '../gaming/GamingAppBar';
import PathfinderLogo from '../PathfinderLogo';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, isAdmin } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Calculate XP progress to next level
  const getXPProgress = () => {
    if (!userProfile) return { current: 0, required: 100, percentage: 0 };
    
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

  const navigation = [
    { name: 'Home', path: '/', icon: Home, public: true },
    { name: 'Careers', path: '/careers', icon: Work, public: true },
    { name: 'Dashboard', path: '/dashboard', icon: Dashboard, public: false },
    { name: 'Quests', path: '/quests', icon: Assignment, public: false },
    { name: 'Skill Tree', path: '/skill-tree', icon: TrendingUp, public: false },
    { name: 'Career Match', path: '/career-recommendations', icon: Psychology, public: false },
    { name: 'Achievements', path: '/achievements', icon: EmojiEvents, public: false },
    { name: 'Profile', path: '/profile', icon: Person, public: false },
    { name: 'Admin', path: '/admin', icon: AdminPanelSettings, public: false, adminOnly: true },
  ];

  const xpProgress = getXPProgress();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <PathfinderLogo size="sm" />
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(to right, #e5e7eb, #c7d2fe, #f9fafb, #a5b4fc, #e5e7eb)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontFamily: '"Nacelle", sans-serif',
            }}
          >
            Pathfinder
          </Typography>
        </Box>
        {userProfile && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip 
                label={`Level ${userProfile.level}`} 
                color="primary" 
                size="small" 
                sx={{ fontWeight: 'bold' }}
              />
              <Typography variant="body2" color="text.secondary">
                {userProfile.totalXP.toLocaleString()} XP
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Progress to Level {userProfile.level + 1}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={xpProgress.percentage} 
                sx={{ 
                  mt: 0.5, 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.success.main,
                  }
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {Math.max(0, xpProgress.required - xpProgress.current).toLocaleString()} XP to next level
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            const isAccessible = item.public || currentUser;
            const isAdminRoute = (item as any).adminOnly;

            if (!isAccessible) return null;
            if (isAdminRoute && !isAdmin()) return null;

            return (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    fontFamily: '"Nacelle", sans-serif',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      transform: 'translateX(4px)',
                      '& .MuiListItemIcon-root': {
                        color: '#6366f1',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#6366f1',
                        fontWeight: 600,
                      },
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        transform: 'translateX(0px)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 600,
                      },
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#9ca3af', // Lighter gray for better visibility
                      minWidth: 44,
                      transition: 'color 0.3s ease',
                    },
                    '& .MuiListItemText-primary': {
                      fontFamily: '"Nacelle", sans-serif',
                      fontWeight: 500,
                      color: 'text.primary',
                      transition: 'all 0.3s ease',
                    },
                  }}
                >
                  <ListItemIcon>
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Stats */}
      {userProfile && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            Quick Stats
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={`${userProfile.completedQuests.length} Quests`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${userProfile.unlockedAchievements.length} Badges`} 
              size="small" 
              variant="outlined" 
            />
            {userProfile.currentCareerPath && (
              <Chip 
                label="Career Path Set" 
                size="small" 
                color="success"
                variant="outlined" 
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Gaming App Bar */}
      <GamingAppBar 
        onDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;