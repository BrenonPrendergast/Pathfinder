import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Avatar } from '@mui/material';
import { 
  Star, 
  Lock, 
  CheckCircle, 
  Sparkles,
  Zap,
  Award,
  Clock,
} from 'lucide-react';

interface SkillStarNodeData {
  id: string;
  name: string;
  description: string;
  level: number; // Template difficulty level
  userLevel?: number; // User's current investment
  maxLevel?: number; // Maximum investment level
  pointCost?: number; // Points required per level
  isUnlocked: boolean;
  isAvailable: boolean;
  category: string;
  xpReward: number;
  prerequisites: string[];
  starType: 'main-sequence' | 'giant' | 'supergiant' | 'dwarf';
  constellation: string;
  onSelect?: () => void;
  onUnlock?: () => void;
  onAddPoint?: () => void;
  onRemovePoint?: () => void;
  availablePoints?: number;
  connectionMode?: 'none' | 'creating' | 'tutorial' | 'deleting';
  isFirstSelected?: boolean;
  nodeScale?: number;
  textScale?: number;
  isAdminMode?: boolean;
  starColors?: {
    'main-sequence': string;
    'giant': string;
    'supergiant': string;
    'dwarf': string;
  };
}

const SkillStarNode: React.FC<NodeProps> = ({ data, selected }) => {
  const skillData = data as unknown as SkillStarNodeData;
  const [isHovered, setIsHovered] = useState(false);
  
  const getStarSize = () => {
    if (skillData.isAdminMode) {
      // Admin mode: Allow scaling based on star type and nodeScale
      const baseSize = (() => {
        switch (skillData.starType) {
          case 'supergiant': return 48;
          case 'giant': return 40;
          case 'main-sequence': return 32;
          case 'dwarf': return 24;
          default: return 32;
        }
      })();
      return Math.round(baseSize * (skillData.nodeScale || 1));
    } else {
      // User mode: Standardized size for consistency
      return 36;
    }
  };

  const getStarColor = () => {
    if (skillData.isUnlocked) return '#00B162'; // Unlocked - bright green
    if (!skillData.isAvailable) return '#6b7280'; // Locked - gray
    
    // Use custom star colors based on type for available skills
    if (skillData.starColors && skillData.starType) {
      return skillData.starColors[skillData.starType] || '#6366f1';
    }
    
    return '#6366f1'; // Default available color
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 99, g: 102, b: 241 }; // Default purple
  };

  const getGlowIntensity = () => {
    if (skillData.isUnlocked) return '0 0 20px rgba(0, 177, 98, 0.8), 0 0 40px rgba(0, 177, 98, 0.4)';
    if (!skillData.isAvailable) return '0 0 5px rgba(107, 114, 128, 0.4)';
    
    // Use custom glow based on star color
    const starColor = getStarColor();
    const rgb = hexToRgb(starColor);
    return `0 0 15px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6), 0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
  };

  const getStarIcon = () => {
    switch (skillData.starType) {
      case 'supergiant':
        return <Award size={getStarSize() * 0.6} color="white" />;
      case 'giant':
        return <Sparkles size={getStarSize() * 0.6} color="white" />;
      case 'main-sequence':
        return <Star size={getStarSize() * 0.6} color="white" fill="white" />;
      case 'dwarf':
        return <Zap size={getStarSize() * 0.6} color="white" />;
      default:
        return <Star size={getStarSize() * 0.6} color="white" fill="white" />;
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    // Always call onSelect for connection mode or normal selection
    skillData.onSelect?.();
    
    // Only trigger unlock if not in connection mode
    if (skillData.isAvailable && !skillData.isUnlocked && (!skillData.connectionMode || skillData.connectionMode !== 'creating')) {
      skillData.onUnlock?.();
    }
  };

  const StarComponent = () => (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: getStarSize(),
        height: getStarSize(),
        borderRadius: '50%',
        backgroundColor: getStarColor(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: skillData.isAvailable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: getGlowIntensity(),
        border: skillData.isFirstSelected 
          ? '3px solid #fbbf24' 
          : selected 
          ? '3px solid #ff8500' 
          : '2px solid rgba(255, 255, 255, 0.3)',
        transform: isHovered || selected ? 'scale(1.1)' : 'scale(1)',
        position: 'relative',
        '&::before': skillData.isUnlocked ? {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #00B162, #10b981, #00B162)',
          zIndex: -1,
          animation: 'rotate 4s linear infinite',
        } : {},
        '&::after': skillData.isAvailable && !skillData.isUnlocked ? {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.4), transparent)',
          zIndex: -1,
          animation: 'pulse 2s ease-in-out infinite',
        } : {},
        '@keyframes rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
      }}
    >
      {/* Star Icon */}
      {getStarIcon()}
      
      {/* Point Controls - Show on hover/select in non-admin mode */}
      {!skillData.isAdminMode && (isHovered || selected) && (
        <Box sx={{
          position: 'absolute',
          top: -30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 0.5,
          zIndex: 3,
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          borderRadius: 1,
          p: 0.5,
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}>
          {/* Remove Point Button */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              skillData.onRemovePoint?.();
            }}
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: (skillData.userLevel || 0) > 0 ? '#ef4444' : 'rgba(107, 114, 128, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (skillData.userLevel || 0) > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              '&:hover': (skillData.userLevel || 0) > 0 ? {
                backgroundColor: '#dc2626',
                transform: 'scale(1.1)',
              } : {},
            }}
          >
            <Typography variant="caption" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '12px',
              lineHeight: 1,
            }}>
              -
            </Typography>
          </Box>

          {/* Current Level Display */}
          <Box sx={{
            minWidth: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderRadius: 0.5,
            px: 0.5,
          }}>
            <Typography variant="caption" sx={{ 
              color: 'white', 
              fontWeight: 600,
              fontSize: '10px',
            }}>
              {skillData.userLevel || 0}/{skillData.maxLevel || 5}
            </Typography>
          </Box>

          {/* Add Point Button */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              skillData.onAddPoint?.();
            }}
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: (skillData.availablePoints || 0) > 0 && (skillData.userLevel || 0) < (skillData.maxLevel || 5) 
                ? '#00B162' : 'rgba(107, 114, 128, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (skillData.availablePoints || 0) > 0 && (skillData.userLevel || 0) < (skillData.maxLevel || 5)
                ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              '&:hover': (skillData.availablePoints || 0) > 0 && (skillData.userLevel || 0) < (skillData.maxLevel || 5) ? {
                backgroundColor: '#009654',
                transform: 'scale(1.1)',
              } : {},
            }}
          >
            <Typography variant="caption" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '12px',
              lineHeight: 1,
            }}>
              +
            </Typography>
          </Box>
        </Box>
      )}
      
      {/* User Progress Indicator */}
      {!skillData.isAdminMode && (skillData.userLevel || 0) > 0 && (
        <Box sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#00B162',
          borderRadius: '50%',
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid white',
          zIndex: 2,
        }}>
          <Typography variant="caption" sx={{ 
            color: 'white', 
            fontWeight: 600,
            fontSize: '9px',
          }}>
            {skillData.userLevel}
          </Typography>
        </Box>
      )}
      
      {/* Skill Status Indicator */}
      <Box sx={{
        position: 'absolute',
        bottom: -4,
        right: -4,
        zIndex: 2,
      }}>
        {skillData.isUnlocked ? (
          <CheckCircle size={12} style={{ color: '#00B162', backgroundColor: 'white', borderRadius: '50%' }} />
        ) : !skillData.isAvailable ? (
          <Lock size={12} style={{ color: '#6b7280' }} />
        ) : null}
      </Box>

      {/* Particle Effect for Unlocked Skills */}
      {skillData.isUnlocked && (
        <>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 3,
                height: 3,
                backgroundColor: '#00B162',
                borderRadius: '50%',
                animation: `sparkle 3s ease-in-out infinite ${i * 0.5}s`,
                '@keyframes sparkle': {
                  '0%, 100%': {
                    transform: `translate(0, 0) scale(0)`,
                    opacity: 0,
                  },
                  '50%': {
                    transform: `translate(${Math.cos(i * 60) * 30}px, ${Math.sin(i * 60) * 30}px) scale(1)`,
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </>
      )}
    </Box>
  );


  return (
    <Box 
      onMouseEnter={() => skillData.onSelect?.()}
      onMouseLeave={() => {}} 
      sx={{ position: 'relative' }}
    >
      {/* Connection Handles - More visible and multiple positions */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#6366f1',
          border: '2px solid white',
          width: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          height: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          opacity: isHovered || selected ? 1 : 0.3,
          transition: 'opacity 0.2s ease',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#00B162',
          border: '2px solid white',
          width: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          height: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          opacity: isHovered || selected ? 1 : 0.3,
          transition: 'opacity 0.2s ease',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#6366f1',
          border: '2px solid white',
          width: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          height: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          opacity: isHovered || selected ? 1 : 0.3,
          transition: 'opacity 0.2s ease',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#00B162',
          border: '2px solid white',
          width: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          height: skillData.isAdminMode ? Math.round(10 * (skillData.nodeScale || 1)) : 10,
          opacity: isHovered || selected ? 1 : 0.3,
          transition: 'opacity 0.2s ease',
        }}
      />
      
      {/* Star Node */}
      <StarComponent />
      
      {/* Skill Name Label */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: getStarSize() + 8,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textAlign: 'center',
          fontWeight: 600,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
          minWidth: 'max-content',
          maxWidth: skillData.isAdminMode ? (skillData.textScale ? 80 * skillData.textScale : 80) : 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: skillData.isAdminMode ? (skillData.textScale ? `${0.7 * skillData.textScale}rem` : '0.7rem') : '0.7rem',
          opacity: isHovered || selected ? 1 : 0.8,
          transition: 'opacity 0.2s ease, font-size 0.2s ease',
        }}
      >
        {skillData.name}
      </Typography>
    </Box>
  );
};

export default memo(SkillStarNode);