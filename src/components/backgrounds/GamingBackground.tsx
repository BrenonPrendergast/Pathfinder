import React from 'react';
import { cn } from '../../lib/utils';

interface GamingBackgroundProps {
  variant?: 'grid' | 'particles' | 'combined';
  intensity?: 'subtle' | 'medium' | 'intense';
  className?: string;
}

export default function GamingBackground({ 
  variant = 'combined', 
  intensity = 'medium',
  className 
}: GamingBackgroundProps) {
  const getIntensityClasses = () => {
    switch (intensity) {
      case 'subtle':
        return 'opacity-20';
      case 'medium':
        return 'opacity-30';
      case 'intense':
        return 'opacity-40';
      default:
        return 'opacity-30';
    }
  };

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden", getIntensityClasses(), className)}>
      {/* Animated Grid Pattern */}
      {(variant === 'grid' || variant === 'combined') && (
        <div className="absolute inset-0 gaming-grid" />
      )}

      {/* Floating Particles */}
      {(variant === 'particles' || variant === 'combined') && (
        <>
          {/* Large particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={`large-${i}`}
                className="absolute w-2 h-2 bg-primary/20 rounded-full gaming-particle-large"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          {/* Medium particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={`medium-${i}`}
                className="absolute w-1.5 h-1.5 bg-accent/15 rounded-full gaming-particle-medium"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 15}s`,
                  animationDuration: `${12 + Math.random() * 8}s`,
                }}
              />
            ))}
          </div>

          {/* Small particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={`small-${i}`}
                className="absolute w-1 h-1 bg-secondary/10 rounded-full gaming-particle-small"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 12}s`,
                  animationDuration: `${8 + Math.random() * 6}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Geometric Floating Shapes */}
      <div className="absolute inset-0">
        {/* Triangles */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`triangle-${i}`}
            className="absolute gaming-triangle"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${20 + Math.random() * 15}s`,
            }}
          />
        ))}

        {/* Hexagons */}
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`hexagon-${i}`}
            className="absolute gaming-hexagon"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${25 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

    </div>
  );
}