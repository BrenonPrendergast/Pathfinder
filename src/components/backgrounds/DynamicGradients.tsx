import React from 'react';
import { cn } from '../../lib/utils';

interface DynamicGradientsProps {
  variant?: 'aurora' | 'plasma' | 'waves' | 'orbs';
  speed?: 'slow' | 'medium' | 'fast';
  intensity?: 'subtle' | 'medium' | 'vibrant';
  className?: string;
}

export default function DynamicGradients({ 
  variant = 'aurora',
  speed = 'medium',
  intensity = 'subtle',
  className 
}: DynamicGradientsProps) {
  const getSpeedClass = () => {
    switch (speed) {
      case 'slow': return 'animation-duration-slow';
      case 'medium': return 'animation-duration-medium';
      case 'fast': return 'animation-duration-fast';
      default: return 'animation-duration-medium';
    }
  };

  const getIntensityClass = () => {
    switch (intensity) {
      case 'subtle': return 'opacity-10';
      case 'medium': return 'opacity-20';
      case 'vibrant': return 'opacity-30';
      default: return 'opacity-15';
    }
  };

  const renderAurora = () => (
    <>
      <div className={cn("absolute inset-0 gradient-aurora-1", getSpeedClass(), getIntensityClass())} />
      <div className={cn("absolute inset-0 gradient-aurora-2", getSpeedClass(), getIntensityClass())} 
           style={{ animationDelay: '2s' }} />
      <div className={cn("absolute inset-0 gradient-aurora-3", getSpeedClass(), getIntensityClass())} 
           style={{ animationDelay: '4s' }} />
    </>
  );

  const renderPlasma = () => (
    <>
      <div className={cn("absolute inset-0 gradient-plasma-1", getSpeedClass(), getIntensityClass())} />
      <div className={cn("absolute inset-0 gradient-plasma-2", getSpeedClass(), getIntensityClass())} 
           style={{ animationDelay: '1.5s' }} />
      <div className={cn("absolute inset-0 gradient-plasma-3", getSpeedClass(), getIntensityClass())} 
           style={{ animationDelay: '3s' }} />
    </>
  );

  const renderWaves = () => (
    <>
      <div className={cn("absolute inset-0 gradient-wave-1", getSpeedClass(), getIntensityClass())} />
      <div className={cn("absolute inset-0 gradient-wave-2", getSpeedClass(), getIntensityClass())} 
           style={{ animationDelay: '2.5s' }} />
    </>
  );

  const renderOrbs = () => (
    <>
      {/* Large orb */}
      <div className={cn("absolute w-96 h-96 gradient-orb-large", getSpeedClass(), getIntensityClass())}
           style={{ 
             top: '10%', 
             left: '15%',
             transform: 'translate(-50%, -50%)'
           }} />
      
      {/* Medium orb */}
      <div className={cn("absolute w-64 h-64 gradient-orb-medium", getSpeedClass(), getIntensityClass())}
           style={{ 
             top: '70%', 
             right: '20%',
             transform: 'translate(50%, -50%)',
             animationDelay: '3s'
           }} />
      
      {/* Small orb */}
      <div className={cn("absolute w-48 h-48 gradient-orb-small", getSpeedClass(), getIntensityClass())}
           style={{ 
             top: '40%', 
             right: '10%',
             transform: 'translate(50%, -50%)',
             animationDelay: '1.5s'
           }} />
    </>
  );

  const renderContent = () => {
    switch (variant) {
      case 'aurora': return renderAurora();
      case 'plasma': return renderPlasma();
      case 'waves': return renderWaves();
      case 'orbs': return renderOrbs();
      default: return renderAurora();
    }
  };

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden z-0", className)}>
      {renderContent()}
      
      {/* Subtle noise overlay for texture */}
      <div className="absolute inset-0 bg-noise opacity-5" />
    </div>
  );
}