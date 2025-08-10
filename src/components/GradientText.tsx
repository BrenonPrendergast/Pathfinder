import React from 'react';
import { Typography, TypographyProps, styled } from '@mui/material';

interface GradientTextProps extends TypographyProps {
  gradient?: 'primary' | 'secondary' | 'custom';
  animated?: boolean;
  customGradient?: string;
}

const StyledTypography = styled(Typography)<{
  gradientType: 'primary' | 'secondary' | 'custom';
  animated: boolean;
  customGradient?: string;
}>(({ gradientType, animated, customGradient }) => {
  const getGradient = () => {
    switch (gradientType) {
      case 'primary':
        return 'linear-gradient(to right, #e5e7eb, #c7d2fe, #f9fafb, #a5b4fc, #e5e7eb)';
      case 'secondary':
        return 'linear-gradient(45deg, #6366f1, #8b5cf6)';
      case 'custom':
        return customGradient || 'linear-gradient(to right, #e5e7eb, #c7d2fe, #f9fafb, #a5b4fc, #e5e7eb)';
      default:
        return 'linear-gradient(to right, #e5e7eb, #c7d2fe, #f9fafb, #a5b4fc, #e5e7eb)';
    }
  };

  return {
    background: getGradient(),
    backgroundSize: animated ? '200% auto' : '100% auto',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    fontFamily: '"Nacelle", sans-serif',
    fontWeight: 600,
    ...(animated && {
      animation: 'gradient 6s linear infinite',
    }),
    
    // Ensure the gradient animation keyframe exists
    '@keyframes gradient': {
      to: {
        backgroundPosition: '200% center',
      },
    },
  };
});

const GradientText: React.FC<GradientTextProps> = ({
  gradient = 'primary',
  animated = true,
  customGradient,
  children,
  ...props
}) => {
  return (
    <StyledTypography
      gradientType={gradient}
      animated={animated}
      customGradient={customGradient}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};

export default GradientText;