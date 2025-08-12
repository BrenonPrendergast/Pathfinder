import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import PathfinderLogo from '../PathfinderLogo';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  animated?: boolean;
  interactive?: boolean;
  className?: string;
}

export default function AnimatedLogo({ 
  size = 'medium', 
  showText = true,
  animated = true,
  interactive = true,
  className 
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return { logoSize: 32, text: 'text-lg' };
      case 'medium': return { logoSize: 40, text: 'text-xl' };
      case 'large': return { logoSize: 64, text: 'text-3xl' };
      default: return { logoSize: 40, text: 'text-xl' };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div 
      className={cn(
        "flex items-center gap-3 cursor-pointer group",
        interactive && "transition-all duration-300 ease-out",
        className
      )}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Pathfinder Logo */}
      <div className={cn(
        "relative flex items-center justify-center",
        animated && "logo-pulse",
        interactive && "group-hover:scale-110 group-hover:drop-shadow-lg",
        interactive && "group-hover:brightness-110",
        "transition-all duration-300 ease-out"
      )}>
        {/* Background Glow */}
        <div className={cn(
          "absolute inset-0 rounded-lg",
          "bg-gradient-to-br from-primary/40 to-accent/40",
          "blur-md opacity-0",
          interactive && "group-hover:opacity-100",
          "transition-opacity duration-300"
        )} />
        
        {/* Pathfinder Logo */}
        <div className="relative z-10">
          <PathfinderLogo 
            size={sizeClasses.logoSize}
            className={cn(
              interactive && "group-hover:brightness-110",
              "transition-all duration-300"
            )}
          />
        </div>

        {/* Animated Particles */}
        {animated && isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full logo-particle"
                style={{
                  top: '50%',
                  left: '50%',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="relative">
          <h1 className={cn(
            "font-bold tracking-tight",
            "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
            sizeClasses.text,
            animated && "logo-text-glow",
            interactive && "group-hover:scale-105",
            "transition-all duration-300 ease-out"
          )}>
            Pathfinder
          </h1>
          
          {/* Text Glow Effect */}
          {interactive && (
            <div className={cn(
              "absolute inset-0",
              "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
              "opacity-0 group-hover:opacity-50",
              "blur-sm",
              sizeClasses.text,
              "font-bold tracking-tight",
              "transition-opacity duration-300",
              "-z-10"
            )}>
              Pathfinder
            </div>
          )}
        </div>
      )}

      {/* Additional Gaming Effects */}
      {interactive && isHovered && (
        <>
          {/* Scan Line Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-line" />
          </div>
          
          {/* Digital Glitch */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="digital-glitch" />
          </div>
        </>
      )}
    </div>
  );
}