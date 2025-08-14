import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

interface ConstellationEdgeData {
  isActive?: boolean;
  isAvailable?: boolean;
  strength?: number;
  isDeleteMode?: boolean;
}

const ConstellationEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const edgeData = data as unknown as ConstellationEdgeData;
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeStyle = () => {
    const isActive = edgeData?.isActive || false;
    const isAvailable = edgeData?.isAvailable || false;
    const isDeleteMode = edgeData?.isDeleteMode || false;
    const strength = edgeData?.strength || 1;

    let strokeColor = '#374151'; // Default gray
    let strokeWidth = 2;
    let opacity = 0.4;
    let filter = '';
    let animation = '';

    if (isDeleteMode) {
      strokeColor = '#ef4444';
      strokeWidth = 3;
      opacity = 0.8;
      filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))';
      animation = 'constellation-delete-pulse 1s ease-in-out infinite';
    } else if (isActive) {
      strokeColor = '#00B162';
      strokeWidth = 3 * strength;
      opacity = 1;
      filter = 'drop-shadow(0 0 8px rgba(0, 177, 98, 0.8))';
      animation = 'constellation-flow-active 3s ease-in-out infinite';
    } else if (isAvailable) {
      strokeColor = '#6366f1';
      strokeWidth = 2 * strength;
      opacity = 0.8;
      filter = 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.6))';
      animation = 'constellation-pulse 2s ease-in-out infinite';
    }

    return {
      stroke: strokeColor,
      strokeWidth,
      opacity,
      filter,
      animation,
      strokeDasharray: isActive ? '0' : isAvailable ? '5 5' : isDeleteMode ? '3 3' : '10 10',
      strokeLinecap: 'round' as const,
      transition: 'all 0.3s ease',
      cursor: isDeleteMode ? 'pointer' : 'default',
    };
  };

  return (
    <>
      {/* Add CSS animations */}
      <defs>
        <style>
          {`
            @keyframes constellation-flow-active {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -20; }
            }
            
            @keyframes constellation-pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            
            @keyframes constellation-sparkle {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
            
            @keyframes constellation-delete-pulse {
              0%, 100% { opacity: 0.6; stroke-width: 3; }
              50% { opacity: 1; stroke-width: 4; }
            }
          `}
        </style>
        
        {/* Gradient definitions for different edge states */}
        <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 177, 98, 0.2)" />
          <stop offset="50%" stopColor="rgba(0, 177, 98, 1)" />
          <stop offset="100%" stopColor="rgba(0, 177, 98, 0.2)" />
        </linearGradient>
        
        <linearGradient id="available-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
          <stop offset="50%" stopColor="rgba(99, 102, 241, 0.8)" />
          <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
        </linearGradient>

        <linearGradient id="inactive-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(55, 65, 81, 0.1)" />
          <stop offset="50%" stopColor="rgba(55, 65, 81, 0.4)" />
          <stop offset="100%" stopColor="rgba(55, 65, 81, 0.1)" />
        </linearGradient>

        <linearGradient id="delete-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(239, 68, 68, 0.2)" />
          <stop offset="50%" stopColor="rgba(239, 68, 68, 0.8)" />
          <stop offset="100%" stopColor="rgba(239, 68, 68, 0.2)" />
        </linearGradient>

        {/* Arrow marker for active connections */}
        <marker
          id="constellation-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={edgeData?.isActive ? '#00B162' : edgeData?.isAvailable ? '#6366f1' : '#374151'}
            opacity={edgeData?.isActive ? 1 : edgeData?.isAvailable ? 0.8 : 0.4}
          />
        </marker>
      </defs>

      {/* Background glow effect for active connections */}
      {edgeData?.isActive && (
        <path
          id={`${id}-glow`}
          style={{
            ...getEdgeStyle(),
            strokeWidth: (getEdgeStyle().strokeWidth as number) + 6,
            opacity: 0.3,
            filter: 'blur(3px)',
          }}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={undefined}
        />
      )}

      {/* Main edge path */}
      <path
        id={id}
        style={{
          ...style,
          ...getEdgeStyle(),
          stroke: edgeData?.isDeleteMode ? 'url(#delete-gradient)' :
                 edgeData?.isActive ? 'url(#active-gradient)' : 
                 edgeData?.isAvailable ? 'url(#available-gradient)' : 
                 'url(#inactive-gradient)',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={edgeData?.isActive || edgeData?.isAvailable ? 'url(#constellation-arrow)' : undefined}
      />

      {/* Animated particles for active connections */}
      {edgeData?.isActive && (
        <>
          {[...Array(3)].map((_, i) => (
            <circle
              key={i}
              r="2"
              fill="#00B162"
              opacity="0.8"
              style={{
                animation: `constellation-sparkle 2s ease-in-out infinite ${i * 0.7}s`,
              }}
            >
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                begin={`${i * 1.3}s`}
              >
                <mpath href={`#${id}`} />
              </animateMotion>
            </circle>
          ))}
        </>
      )}

      {/* Energy flow effect for available connections */}
      {edgeData?.isAvailable && !edgeData?.isActive && (
        <circle
          r="1.5"
          fill="#6366f1"
          opacity="0.6"
          style={{
            animation: 'constellation-pulse 3s ease-in-out infinite',
          }}
        >
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
          >
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      )}
    </>
  );
};

export default memo(ConstellationEdge);