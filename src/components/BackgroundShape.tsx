import React from 'react';
import { Box } from '@mui/material';

interface BackgroundShapeProps {
  variant?: 'blur' | 'blur-gray' | 'page-illustration';
  position?: {
    top?: string | number;
    bottom?: string | number;
    left?: string | number;
    right?: string | number;
    transform?: string;
  };
  opacity?: number;
  zIndex?: number;
}

const BackgroundShape: React.FC<BackgroundShapeProps> = ({
  variant = 'blur',
  position = {},
  opacity = 1,
  zIndex = -1,
}) => {
  const getImageSrc = () => {
    switch (variant) {
      case 'blur':
        return '/images/blurred-shape.svg';
      case 'blur-gray':
        return '/images/blurred-shape-gray.svg';
      case 'page-illustration':
        return '/images/page-illustration.svg';
      default:
        return '/images/blurred-shape.svg';
    }
  };

  const getDefaultPosition = () => {
    switch (variant) {
      case 'blur':
        return {
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'blur-gray':
        return {
          bottom: 0,
          left: '50%',
          transform: 'translateX(-120%)',
        };
      case 'page-illustration':
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      default:
        return {};
    }
  };

  const finalPosition = { ...getDefaultPosition(), ...position };

  return (
    <Box
      sx={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex,
        opacity,
        ...finalPosition,
      }}
      aria-hidden="true"
    >
      <Box
        component="img"
        src={getImageSrc()}
        alt=""
        sx={{
          maxWidth: 'none',
          width: 'auto',
          height: 'auto',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default BackgroundShape;