import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography, Tooltip, Avatar } from '@mui/material';
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
  level: number;
  isUnlocked: boolean;
  isAvailable: boolean;
  category: string;
  xpReward: number;
  prerequisites: string[];
  starType: 'main-sequence' | 'giant' | 'supergiant' | 'dwarf';
  constellation: string;
  onSelect?: () => void;
  onUnlock?: () => void;
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
          ? '3px solid #6366f1' 
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

  // Determine if tooltip should be disabled for better connection management
  const shouldDisableTooltip = skillData.isAdminMode && (
    skillData.connectionMode === 'creating' || 
    skillData.connectionMode === 'deleting'
  );

  // Get tooltip delay based on mode
  const getTooltipDelay = () => {
    if (skillData.isAdminMode) {
      if (skillData.connectionMode === 'creating' || skillData.connectionMode === 'deleting') {
        return 2000; // Very long delay during active connection management
      }
      return 800; // Longer delay in admin mode
    }
    return 500; // Normal delay for regular users
  };

  return (
    <Tooltip
      title={shouldDisableTooltip ? "" : (
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {skillData.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
            {skillData.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ 
              backgroundColor: 'rgba(0, 177, 98, 0.2)', 
              px: 1, 
              py: 0.25, 
              borderRadius: 1,
              color: '#00B162'
            }}>
              {skillData.xpReward} XP
            </Typography>
            <Typography variant="caption" sx={{ 
              backgroundColor: 'rgba(99, 102, 241, 0.2)', 
              px: 1, 
              py: 0.25, 
              borderRadius: 1,
              color: '#6366f1'
            }}>
              {skillData.starType}
            </Typography>
            {!skillData.isAvailable && skillData.prerequisites.length > 0 && (
              <Typography variant="caption" sx={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                px: 1, 
                py: 0.25, 
                borderRadius: 1,
                color: '#ef4444'
              }}>
                <Lock size={10} style={{ marginRight: 4, display: 'inline' }} />
                Prerequisites required
              </Typography>
            )}
          </Box>
        </Box>
      )}
      arrow
      placement="top"
      disableHoverListener={shouldDisableTooltip}
      enterDelay={getTooltipDelay()}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            maxWidth: 300,
            zIndex: skillData.isAdminMode ? 1000 : 1500, // Lower z-index in admin mode
            pointerEvents: skillData.isAdminMode ? 'none' : 'auto', // Disable pointer events in admin mode
          },
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Connection Handles - More visible and multiple positions */}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: '#6366f1',
            border: '2px solid white',
            width: Math.round(10 * (skillData.nodeScale || 1)),
            height: Math.round(10 * (skillData.nodeScale || 1)),
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
            width: Math.round(10 * (skillData.nodeScale || 1)),
            height: Math.round(10 * (skillData.nodeScale || 1)),
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
            width: Math.round(10 * (skillData.nodeScale || 1)),
            height: Math.round(10 * (skillData.nodeScale || 1)),
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
            width: Math.round(10 * (skillData.nodeScale || 1)),
            height: Math.round(10 * (skillData.nodeScale || 1)),
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
            maxWidth: skillData.textScale ? 80 * skillData.textScale : 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: skillData.textScale ? `${0.7 * skillData.textScale}rem` : '0.7rem',
            opacity: isHovered || selected ? 1 : 0.8,
            transition: 'opacity 0.2s ease, font-size 0.2s ease',
          }}
        >
          {skillData.name}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default memo(SkillStarNode);