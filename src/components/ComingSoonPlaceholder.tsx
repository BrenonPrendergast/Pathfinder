import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import {
  Construction,
  Star,
  Sparkles,
} from 'lucide-react';

interface ComingSoonPlaceholderProps {
  careerPath: string;
  careerName?: string;
}

const ComingSoonPlaceholder: React.FC<ComingSoonPlaceholderProps> = ({ 
  careerPath, 
  careerName 
}) => {
  const displayName = careerName || careerPath;
  const isGeneralSkills = careerPath === 'general';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }
        }}
      >
        {/* Animated Background Elements */}
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          right: 30, 
          opacity: 0.3,
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          }
        }}>
          <Star size={24} color="#6366f1" />
        </Box>
        
        <Box sx={{ 
          position: 'absolute', 
          bottom: 30, 
          left: 40, 
          opacity: 0.2,
          animation: 'float 4s ease-in-out infinite 1s',
        }}>
          <Sparkles size={20} color="#6366f1" />
        </Box>

        {/* Main Icon */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.8, transform: 'scale(1.05)' },
          }
        }}>
          <Construction 
            size={64} 
            color="#6366f1"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))'
            }}
          />
        </Box>

        {/* Main Content */}
        <Typography 
          variant="h4" 
          component="h2"
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700,
            mb: 2,
          }}
        >
          {isGeneralSkills 
            ? 'General Skills Constellation'
            : `${displayName} Skills Constellation`
          }
        </Typography>

        <Typography 
          variant="h6" 
          color="primary"
          gutterBottom
          sx={{ 
            fontWeight: 600,
            mb: 3,
            color: '#6366f1'
          }}
        >
          Coming Soon
        </Typography>

        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            lineHeight: 1.7,
            mb: 2,
            fontSize: '1.1rem'
          }}
        >
          {isGeneralSkills 
            ? 'Our team is crafting an interactive constellation of foundational skills that will be essential for any career path. This standardized skill tree will help you build core competencies.'
            : `We're designing a comprehensive skill constellation specifically for ${displayName} professionals. This interactive learning path will guide your career development with relevant, industry-specific skills.`
          }
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontStyle: 'italic',
            opacity: 0.8
          }}
        >
          Check back soon for an immersive learning experience!
        </Typography>

        {/* Progress Indicator */}
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1 
        }}>
          {[1, 2, 3].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                animation: `blink 1.4s ease-in-out ${dot * 0.2}s infinite alternate`,
                '@keyframes blink': {
                  '0%': { opacity: 0.2 },
                  '100%': { opacity: 1 },
                }
              }}
            />
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default ComingSoonPlaceholder;