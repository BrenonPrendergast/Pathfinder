import React, { useEffect, useState } from 'react';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../contexts/AuthContext';

interface UserStatsDisplayProps {
  userProfile: UserProfile;
  variant?: 'full' | 'compact' | 'minimal';
  showAnimations?: boolean;
  className?: string;
}

export default function UserStatsDisplay({ 
  userProfile, 
  variant = 'compact',
  showAnimations = true,
  className 
}: UserStatsDisplayProps) {
  const [displayXP, setDisplayXP] = useState(userProfile.totalXP);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // Animate XP changes
  useEffect(() => {
    if (showAnimations && displayXP !== userProfile.totalXP) {
      const diff = userProfile.totalXP - displayXP;
      const steps = Math.min(Math.abs(diff), 20);
      const stepSize = diff / steps;
      
      let currentXP = displayXP;
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        currentXP += stepSize;
        setDisplayXP(Math.round(currentXP));
        
        if (step >= steps) {
          clearInterval(interval);
          setDisplayXP(userProfile.totalXP);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [userProfile.totalXP, displayXP, showAnimations]);

  // Calculate XP progress to next level
  const getXPProgress = () => {
    const currentLevel = userProfile.level;
    const nextLevelXP = Math.pow(2, currentLevel) * 50;
    const currentLevelXP = Math.pow(2, currentLevel - 1) * 50;
    const progressXP = displayXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const percentage = Math.min((progressXP / requiredXP) * 100, 100);
    
    return {
      current: Math.max(0, progressXP),
      required: requiredXP,
      percentage: Math.max(0, percentage),
      nextLevelXP: nextLevelXP
    };
  };

  const xpProgress = getXPProgress();

  // Check for level up animation
  useEffect(() => {
    const prevLevel = Math.floor(Math.log2(Math.max(1, displayXP) / 50)) + 1;
    if (prevLevel < userProfile.level && showAnimations) {
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 2000);
    }
  }, [displayXP, userProfile.level, showAnimations]);

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "px-2 py-1 rounded-md text-xs font-medium",
          "bg-primary/10 text-primary border border-primary/20",
          isLevelingUp && "level-up-glow"
        )}>
          Lv. {userProfile.level}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-3", className)}>
        {/* Level Badge */}
        <Tooltip>
          <TooltipTrigger>
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-semibold",
              "bg-gradient-to-r from-primary/20 to-accent/20",
              "border border-primary/30 text-primary",
              "hover:scale-105 transition-transform duration-200",
              isLevelingUp && "level-up-animation"
            )}>
              Lv. {userProfile.level}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Current Level</p>
          </TooltipContent>
        </Tooltip>

        {/* XP Progress */}
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2 min-w-[120px]">
              <Progress 
                value={xpProgress.percentage} 
                className="h-2 bg-muted/30"
                style={{
                  '--progress-background': 'hsl(var(--primary))',
                } as React.CSSProperties}
              />
              <div className="text-xs text-muted-foreground font-medium">
                {xpProgress.percentage.toFixed(0)}%
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{displayXP.toLocaleString()} XP</p>
              <p className="text-xs text-muted-foreground">
                {(xpProgress.nextLevelXP - displayXP).toLocaleString()} XP to level {userProfile.level + 1}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // Full variant
  return (
    <TooltipProvider>
      <div className={cn("space-y-3 p-4 bg-card/50 rounded-lg border border-border/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-3 py-1 rounded-md text-sm font-bold",
            "bg-gradient-to-r from-primary/30 to-accent/30",
            "text-primary border border-primary/50",
            isLevelingUp && "level-up-animation"
          )}>
            Level {userProfile.level}
          </div>
          {isLevelingUp && (
            <div className="text-xs text-primary font-medium animate-bounce">
              LEVEL UP! 🎉
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {displayXP.toLocaleString()} XP
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress to Level {userProfile.level + 1}</span>
          <span>{xpProgress.percentage.toFixed(1)}%</span>
        </div>
        <Progress 
          value={xpProgress.percentage} 
          className="h-3 bg-muted/30"
          style={{
            '--progress-background': 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
          } as React.CSSProperties}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{xpProgress.current.toLocaleString()} XP</span>
          <span>{xpProgress.required.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
        <Tooltip>
          <TooltipTrigger>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {userProfile.completedQuests.length}
              </div>
              <div className="text-xs text-muted-foreground">Quests</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Completed Quests</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">
                {userProfile.unlockedAchievements?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unlocked Achievements</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {Object.keys(userProfile.skillHours).length}
              </div>
              <div className="text-xs text-muted-foreground">Skills</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Skills Developed</p>
          </TooltipContent>
        </Tooltip>
      </div>
      </div>
    </TooltipProvider>
  );
}