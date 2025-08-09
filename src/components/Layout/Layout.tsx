import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Work,
  Assignment,
  EmojiEvents,
  Person,
  Dashboard,
  Logout,
  Login,
  TrendingUp,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleProfileMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
    { name: 'Achievements', path: '/achievements', icon: EmojiEvents, public: false },
    { name: 'Profile', path: '/profile', icon: Person, public: false },
    { name: 'Admin', path: '/admin', icon: AdminPanelSettings, public: false, adminOnly: true },
  ];

  const xpProgress = getXPProgress();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          🎮 Pathfinder
        </Typography>
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
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
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
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigation.find(nav => nav.path === location.pathname)?.name || 'Pathfinder'}
          </Typography>

          {/* User Menu */}
          {currentUser ? (
            <Box>
              <IconButton
                size="large"
                aria-label="account menu"
                aria-controls="account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  src={currentUser.photoURL || undefined}
                  sx={{ width: 32, height: 32 }}
                >
                  {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/dashboard')}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                {isAdmin() && (
                  <MenuItem onClick={() => handleNavigation('/admin')}>
                    <ListItemIcon>
                      <AdminPanelSettings fontSize="small" />
                    </ListItemIcon>
                    Admin
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => handleNavigation('/auth')}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

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