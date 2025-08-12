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
  const [absoluteMousePos, setAbsoluteMousePos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({ 
        x: (e.clientX / innerWidth) * 100, 
        y: (e.clientY / innerHeight) * 100 
      });
      setAbsoluteMousePos({ x: e.clientX, y: e.clientY });
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

  // Particle generation and animation
  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    let particleId = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Generate new particles occasionally when mouse is active
      if (isActive && Math.random() < 0.25) { // 25% chance per frame
        const newParticle = {
          id: particleId++,
          x: absoluteMousePos.x + (Math.random() - 0.5) * 40, // Spawn near cursor
          y: absoluteMousePos.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 2, // Random velocity
          vy: (Math.random() - 0.5) * 2,
          life: 60, // frames
          maxLife: 60,
          size: Math.random() * 3 + 1,
        };
        
        setParticles(prev => [...prev.slice(-15), newParticle]); // Keep max 16 particles
      }

      // Update existing particles
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1,
          vx: particle.vx * 0.98, // Slow down over time
          vy: particle.vy * 0.98,
        })).filter(particle => particle.life > 0)
      );

      animationFrame = requestAnimationFrame(animate);
    };

    if (isActive) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, absoluteMousePos]);

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

  // Very subtle background glow - much smaller and less obvious
  const subtleGlowStyle = {
    background: `radial-gradient(120px circle at ${mousePos.x}% ${mousePos.y}%, 
       hsla(var(--primary), 0.025) 0%, 
       transparent 60%)`,
    transition: isActive ? 'none' : 'opacity 0.3s ease-out',
    opacity: isActive ? 1 : 0,
  } as React.CSSProperties;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-10", className)}>
      {/* Very subtle background glow */}
      <div 
        className="absolute inset-0 transition-all duration-300 ease-out" 
        style={subtleGlowStyle}
        aria-hidden="true"
      />
      
      {/* Interactive particles */}
      {particles.map(particle => {
        const lifeRatio = particle.life / particle.maxLife;
        const opacity = lifeRatio * 0.9; // Fade out as life decreases
        const scale = 0.5 + lifeRatio * 0.5; // Shrink as life decreases
        
        return (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              transform: `scale(${scale})`,
              opacity,
            }}
          >
            <div 
              className="w-full h-full rounded-full bg-primary/70"
              style={{
                boxShadow: `0 0 ${particle.size * 3}px hsla(var(--primary), ${opacity * 0.6})`,
              }}
            />
          </div>
        );
      })}
      
      {/* Tiny cursor indicator - only visible when active */}
      {isActive && (
        <div 
          className="absolute w-1 h-1 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
          }}
        >
          <div className="w-full h-full rounded-full bg-primary/40" />
        </div>
      )}
    </div>
  );
}