import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useTheme,
  Box,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Dashboard,
  Logout,
  Login,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import AnimatedLogo from './AnimatedLogo';
import UserStatsDisplay from './UserStatsDisplay';

interface GamingAppBarProps {
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export default function GamingAppBar({ onDrawerToggle, drawerWidth }: GamingAppBarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    handleProfileMenuClose();
  };

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Careers', path: '/careers' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Quests', path: '/quests' },
    { name: 'Skill Tree', path: '/skill-tree' },
    { name: 'Career Match', path: '/career-recommendations' },
    { name: 'Achievements', path: '/achievements' },
    { name: 'Profile', path: '/profile' },
    { name: 'Admin', path: '/admin' },
  ];

  const currentPageName = navigation.find(nav => nav.path === location.pathname)?.name || 'Pathfinder';

  return (
    <AppBar
      position="fixed"
      className={cn("gaming-app-bar")}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        zIndex: theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--background)) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid hsl(var(--border))',
        boxShadow: '0 8px 32px -12px hsl(var(--primary) / 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.3), transparent)',
        }
      }}
    >
      <Toolbar sx={{ minHeight: '72px !important', padding: '0 24px' }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ 
            mr: 2, 
            display: { md: 'none' },
            '&:hover': {
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease',
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Animated Logo and Page Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnimatedLogo size="small" showText={false} />
          
          {/* Page Title with Gaming Effect */}
          <Box className="gaming-page-title">
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {currentPageName}
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Stats Display (if logged in) */}
        {currentUser && userProfile && (
          <UserStatsDisplay 
            userProfile={userProfile} 
            variant="compact"
            className="hidden md:flex"
          />
        )}

        {/* User Menu or Sign In */}
        {currentUser ? (
          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              aria-label="account menu"
              aria-controls="account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s ease',
                  '& .MuiAvatar-root': {
                    boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
                  }
                }
              }}
            >
              <Avatar
                src={currentUser.photoURL || undefined}
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: '2px solid hsl(var(--primary) / 0.3)',
                  transition: 'all 0.3s ease',
                }}
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
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  minWidth: 200,
                  mt: 1.5,
                  boxShadow: '0 20px 40px -12px hsl(var(--background) / 0.8)',
                  '& .MuiMenuItem-root': {
                    borderRadius: '8px',
                    margin: '4px 8px',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      '& .MuiListItemIcon-root': {
                        color: 'hsl(var(--primary))',
                      },
                    },
                  },
                },
              }}
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
              <Divider sx={{ my: 1, borderColor: 'hsl(var(--border))' }} />
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
            variant="outlined"
            startIcon={<Login />}
            onClick={() => handleNavigation('/auth')}
            sx={{
              borderColor: 'hsl(var(--primary) / 0.3)',
              color: 'hsl(var(--primary))',
              '&:hover': {
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}