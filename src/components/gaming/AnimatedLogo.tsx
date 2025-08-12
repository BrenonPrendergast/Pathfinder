import React, { useState } from 'react';
import { cn } from '../../lib/utils';

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
      case 'small': return { icon: 'w-8 h-8', text: 'text-lg' };
      case 'medium': return { icon: 'w-10 h-10', text: 'text-xl' };
      case 'large': return { icon: 'w-16 h-16', text: 'text-3xl' };
      default: return { icon: 'w-10 h-10', text: 'text-xl' };
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
      {/* Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-lg",
        "bg-gradient-to-br from-primary/20 to-accent/20",
        "border border-primary/30",
        sizeClasses.icon,
        animated && "logo-pulse",
        interactive && "group-hover:scale-110 group-hover:rotate-12",
        interactive && "group-hover:shadow-lg group-hover:shadow-primary/25",
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
        
        {/* Gaming Controller Icon */}
        <div className="relative z-10 gaming-controller-icon">
          <svg 
            className={cn(
              sizeClasses.icon.replace('w-', 'w-').replace('h-', 'h-'),
              "text-primary group-hover:text-primary-glow transition-colors duration-300"
            )}
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4V8L17 11H20C21.1 11 22 11.9 22 13V18C22 19.1 21.1 20 20 20H17L14 17V20C14 21.1 13.1 22 12 22S10 21.1 10 20V17L7 20H4C2.9 20 2 19.1 2 18V13C2 11.9 2.9 11 4 11H7L10 8V4C10 2.9 10.9 2 12 2M8.5 14.5C8.5 15.3 7.8 16 7 16S5.5 15.3 5.5 14.5 6.2 13 7 13 8.5 13.7 8.5 14.5M18.5 14.5C18.5 15.3 17.8 16 17 16S15.5 15.3 15.5 14.5 16.2 13 17 13 18.5 13.7 18.5 14.5Z"/>
          </svg>
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
            🎮 Pathfinder
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
              🎮 Pathfinder
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