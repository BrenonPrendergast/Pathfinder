import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Trophy, 
  Star, 
  Clock, 
  BookOpen, 
  ArrowRight,
  PlayCircle,
  Award,
  Gamepad2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { questRecommendationService, QuestRecommendation } from '../services';

interface LootyDashboardProps {
  className?: string;
}

export default function LootyDashboard({ className }: LootyDashboardProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [quickRecommendations, setQuickRecommendations] = useState<QuestRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Mouse tracking for spotlight effect
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({ 
        x: (e.clientX / innerWidth) * 100, 
        y: (e.clientY / innerHeight) * 100 
      });
    };

    window.addEventListener("pointermove", handleMouseMove);
    return () => window.removeEventListener("pointermove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (userProfile) {
      loadQuickRecommendations();
    }
  }, [userProfile]);

  const loadQuickRecommendations = async () => {
    if (!userProfile) return;
    
    try {
      setLoadingRecommendations(true);
      const recommendations = await questRecommendationService.getRecommendationsForUser(userProfile);
      setQuickRecommendations(recommendations.slice(0, 3));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // XP Progress calculation
  const getXPProgress = () => {
    const currentLevel = userProfile.level;
    const nextLevelXP = Math.pow(2, currentLevel) * 50;
    const currentLevelXP = Math.pow(2, currentLevel - 1) * 50;
    const progressXP = userProfile.totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const percentage = Math.min((progressXP / requiredXP) * 100, 100);
    
    return {
      current: progressXP,
      required: requiredXP,
      percentage
    };
  };

  const xpProgress = getXPProgress();

  // Get top skills by hours
  const topSkills = Object.entries(userProfile.skillHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get active career path (simplified for build)
  const activeCareerPath = null; // TODO: Implement careerPaths integration
  
  // Calculate overall progress
  const overallProgress = 0; // TODO: Implement progress calculation

  // Create spotlight style
  const spotlightStyle = {
    background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, hsl(var(--primary) / 0.08), transparent 70%)`,
  } as React.CSSProperties;

  return (
    <TooltipProvider>
      <div className={cn("min-h-screen bg-background relative overflow-hidden", className)}>
        {/* Spotlight Effect */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={spotlightStyle}
          aria-hidden 
        />

        <div className="relative z-10 container py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome back, <span className="text-primary">{userProfile.displayName || 'Pathfinder'}</span>!
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Ready to level up your career? Let's see what you've accomplished.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Level Progress Card */}
            <Card className="md:col-span-2 xl:col-span-2 glow-effect border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Level {userProfile.level}</h3>
                    <p className="text-muted-foreground">Experience Progress</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {xpProgress.current} / {xpProgress.required} XP
                    </span>
                    <span className="text-primary font-medium">
                      {xpProgress.percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <Progress value={xpProgress.percentage} className="h-3" />
                  
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        <strong>{userProfile.totalXP}</strong> Total XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-sm">
                        <strong>{userProfile.unlockedAchievements?.length || 0}</strong> Achievements
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glow-effect border-accent/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">Quick Stats</h3>
                </div>
                
                <div className="space-y-4">
                  {userProfile.currentCareerPath && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Path</span>
                      <span className="text-sm font-medium">{userProfile.currentCareerPath}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Progress</span>
                    <span className="text-sm font-medium text-primary">{overallProgress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Skill Areas</span>
                    <span className="text-sm font-medium">{topSkills.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card className="glow-effect border-secondary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold">Top Skills</h3>
                </div>
                
                <div className="space-y-3">
                  {topSkills.length > 0 ? (
                    topSkills.map(([skillId, hours]) => (
                      <div key={skillId} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{skillId.replace(/-/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">{hours}h</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Start learning to see your progress here!</p>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4" 
                  onClick={() => navigate('/skill-tree')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Skill Tree
                </Button>
              </CardContent>
            </Card>

            {/* Quick Recommendations */}
            <Card className="md:col-span-2 glow-effect border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Recommended for You</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/recommended-quests')}
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {loadingRecommendations ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quickRecommendations.length > 0 ? (
                      quickRecommendations.map((recommendation) => (
                        <div 
                          key={recommendation.quest.id}
                          className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors"
                        >
                          <PlayCircle className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{recommendation.quest.title}</h4>
                            <p className="text-xs text-muted-foreground">{recommendation.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-accent" />
                            <span className="text-xs font-medium">{recommendation.quest.xpReward} XP</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Complete your profile to get personalized recommendations!
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button onClick={() => navigate('/quests')} className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Browse Quests
            </Button>
            <Button variant="outline" onClick={() => navigate('/careers')} className="gap-2">
              <Target className="w-4 h-4" />
              Explore Careers
            </Button>
            <Button variant="outline" onClick={() => navigate('/achievements')} className="gap-2">
              <Trophy className="w-4 h-4" />
              View Achievements
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}