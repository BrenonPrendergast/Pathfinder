import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface InteractiveSpotlightProps {
  size?: 'small' | 'medium' | 'large';
  intensity?: 'subtle' | 'medium' | 'bright';
  color?: 'primary' | 'accent' | 'multi';
  blur?: boolean;
  className?: string;
}

export default function InteractiveSpotlight({ 
  size = 'large',
  intensity = 'medium',
  color = 'primary',
  blur = true,
  className 
}: InteractiveSpotlightProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({ 
        x: (e.clientX / innerWidth) * 100, 
        y: (e.clientY / innerHeight) * 100 
      });
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getSpotlightSize = () => {
    switch (size) {
      case 'small': return 200;
      case 'medium': return 300;
      case 'large': return 400;
      default: return 300;
    }
  };

  const getIntensityOpacity = () => {
    switch (intensity) {
      case 'subtle': return 0.025;
      case 'medium': return 0.04;
      case 'bright': return 0.06;
      default: return 0.025;
    }
  };

  const getSpotlightColor = () => {
    switch (color) {
      case 'primary': return 'hsl(var(--primary))';
      case 'accent': return 'hsl(var(--accent))';
      case 'multi': 
        // Multi-color creates a rainbow effect
        return `radial-gradient(circle, 
          hsl(var(--primary)) 0%, 
          hsl(var(--accent)) 50%, 
          hsl(var(--secondary)) 100%)`;
      default: return 'hsl(var(--primary))';
    }
  };

  const spotlightSize = getSpotlightSize();
  const opacity = getIntensityOpacity();
  
  const spotlightStyle = {
    background: color === 'multi' 
      ? `radial-gradient(${spotlightSize}px circle at ${mousePos.x}% ${mousePos.y}%, 
         hsla(var(--primary), ${opacity}), 
         hsla(var(--accent), ${opacity * 0.7}) 30%, 
         transparent 50%)`
      : `radial-gradient(${spotlightSize}px circle at ${mousePos.x}% ${mousePos.y}%, 
         ${getSpotlightColor().replace('hsl', 'hsla').replace(')', `, ${opacity})`)} 0%, 
         transparent 50%)`,
    transition: isActive ? 'none' : 'opacity 0.3s ease-out',
    opacity: isActive ? 1 : 0.7,
    filter: blur ? 'blur(0.5px)' : 'none',
  } as React.CSSProperties;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-10", className)}>
      <div 
        className="absolute inset-0 transition-all duration-300 ease-out" 
        style={spotlightStyle}
        aria-hidden="true"
      />
      
      {/* Additional pulse effect at cursor position */}
      {isActive && (
        <div 
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
          }}
        >
          <div className="w-full h-full rounded-full bg-primary/30 animate-ping" />
          <div className="absolute inset-0 w-2 h-2 m-auto rounded-full bg-primary/60" />
        </div>
      )}
    </div>
  );
}