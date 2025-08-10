import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import CareersPage from './pages/CareersPage';
import CareerDetailPage from './pages/CareerDetailPage';
import DashboardPage from './pages/DashboardPage';
import QuestsPage from './pages/QuestsPage';
import RecommendedQuestsPage from './pages/RecommendedQuestsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import SkillTreePage from './pages/SkillTreePage';
import CareerRecommendationsPage from './pages/CareerRecommendationsPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Declare custom theme augmentation
declare module '@mui/material/styles' {
  interface Palette {
    indigo: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    gray: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  }
  interface PaletteOptions {
    indigo?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    gray?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  }
}

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo-500
      light: '#8b5cf6', // Purple-500  
      dark: '#4f46e5', // Indigo-600
    },
    secondary: {
      main: '#7c3aed', // Purple-600
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    success: {
      main: '#059669', // Green-600
    },
    warning: {
      main: '#d97706', // Orange-600
    },
    error: {
      main: '#dc2626', // Red-600
    },
    background: {
      default: '#0f0f23', // Dark background to match template
      paper: '#1a1a2e',
    },
    text: {
      primary: '#e5e7eb', // Gray-200
      secondary: '#9ca3af', // Gray-400
    },
    // Extended color palette
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Nacelle", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    // Enhanced typography scale matching template
    h1: {
      fontFamily: '"Nacelle", sans-serif',
      fontSize: '3.5rem', // 56px
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '-0.0268em',
    },
    h2: {
      fontFamily: '"Nacelle", sans-serif',
      fontSize: '2.5rem', // 40px
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '-0.0268em',
    },
    h3: {
      fontFamily: '"Nacelle", sans-serif',
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.357,
      letterSpacing: '-0.0268em',
    },
    h4: {
      fontFamily: '"Nacelle", sans-serif',
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.415,
      letterSpacing: '-0.0268em',
    },
    h5: {
      fontFamily: '"Nacelle", sans-serif',
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.0125em',
    },
    h6: {
      fontFamily: '"Nacelle", sans-serif',
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.0125em',
    },
    body1: {
      fontSize: '0.9375rem', // 15px - custom base size from template
      lineHeight: 1.533,
      letterSpacing: '-0.0125em',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.571,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '11px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(31, 41, 55, 0.8)', // Gray-800 with opacity
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(75, 85, 99, 0.3)', // Gray-600 with opacity  
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width: 1200px)': {
            maxWidth: '1152px', // 6xl container from template
          },
        },
      },
    },
  },
});

function App() {
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/careers/:careerId" element={<CareerDetailPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/quests" element={
                <ProtectedRoute>
                  <QuestsPage />
                </ProtectedRoute>
              } />
              <Route path="/recommended-quests" element={
                <ProtectedRoute>
                  <RecommendedQuestsPage />
                </ProtectedRoute>
              } />
              <Route path="/achievements" element={
                <ProtectedRoute>
                  <AchievementsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/skill-tree" element={
                <ProtectedRoute>
                  <SkillTreePage />
                </ProtectedRoute>
              } />
              <Route path="/career-recommendations" element={
                <ProtectedRoute>
                  <CareerRecommendationsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<HomePage />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;