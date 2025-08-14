import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Fade,
  AlertColor,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';

const HeaderNotification: React.FC = () => {
  const { currentNotification, removeNotification } = useNotification();

  const getIcon = (type: AlertColor) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ fontSize: 18 }} />;
      case 'error': return <Error sx={{ fontSize: 18 }} />;
      case 'warning': return <Warning sx={{ fontSize: 18 }} />;
      case 'info': return <Info sx={{ fontSize: 18 }} />;
      default: return <Info sx={{ fontSize: 18 }} />;
    }
  };

  const getBackgroundColor = (type: AlertColor) => {
    switch (type) {
      case 'success': 
        return 'linear-gradient(135deg, rgba(0, 177, 98, 0.9), rgba(16, 185, 129, 0.9))';
      case 'error':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))';
      case 'warning':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9))';
      case 'info':
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.9))';
      default:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.9))';
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: 400,
          mx: 2,
          px: 2,
          py: 1,
          borderRadius: 2,
          background: getBackgroundColor(currentNotification.type),
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          color: 'white',
          fontSize: '0.875rem',
        }}
      >
        {/* Icon */}
        <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
          {getIcon(currentNotification.type)}
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {currentNotification.title && (
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                mb: 0.25,
                fontSize: '0.8rem',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentNotification.title}
            </Typography>
          )}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentNotification.message}
          </Typography>
        </Box>

        {/* Close Button */}
        <IconButton
          size="small"
          onClick={() => removeNotification(currentNotification.id)}
          sx={{
            ml: 1,
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            padding: 0.5,
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Fade>
  );
};

export default HeaderNotification;