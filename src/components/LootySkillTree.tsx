import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Minus, Plus, RotateCcw, Star, Lock, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from '../contexts/AuthContext';
import { skillService } from '../services/skill/skill.service';
import { SkillTreeNode, SkillProficiencyLevel } from '../services/types/skill.types';

// Enhanced skill tree types for Looty-style presentation
type ColorToken = "primary" | "secondary" | "destructive" | "accent";

type SkillDef = {
  id: string;
  name: string;
  max: number;
  tier: number;
  row: number;
  col: number;
  description?: string;
  currentPoints: number;
  isUnlocked: boolean;
  prerequisites: string[];
  category?: string;
};

type TreeDef = {
  id: string;
  name: string;
  color: ColorToken;
  skills: SkillDef[];
  totalPoints: number;
  maxPoints: number;
};

// Utility to create a 4x5 grid placeholder per tree
const SLOTS = Array.from({ length: 5 }, (_, r) =>
  Array.from({ length: 4 }, (_, c) => ({ row: r + 1, col: c + 1 }))
);

interface LootySkillTreeProps {
  careerPath?: string;
  onPointAllocation?: (skillId: string, points: number) => void;
  onSkillUnlock?: (skillId: string) => void;
}

export default function LootySkillTree({ 
  careerPath = 'general',
  onPointAllocation,
  onSkillUnlock 
}: LootySkillTreeProps) {
  const { currentUser, userProfile } = useAuth();
  
  // State management
  const [totalPoints] = useState(70);
  const [trees, setTrees] = useState<Record<string, TreeDef>>({});
  const [activeTreeId, setActiveTreeId] = useState('soft');
  const [loading, setLoading] = useState(true);
  
  // Spotlight mouse tracking state
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  
  // Level-up animation state
  const [levelUpAnimations, setLevelUpAnimations] = useState<Set<string>>(new Set());
  const [skillGlowEffects, setSkillGlowEffects] = useState<Set<string>>(new Set());
  const [masteryCelebrations, setMasteryCelebrations] = useState<Set<string>>(new Set());
  const [particleEffects, setParticleEffects] = useState<Record<string, { x: number; y: number; particles: Array<{ id: string; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }> }>>({});
  
  // Calculate spent points by tree
  const spentByTree = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [treeId, tree] of Object.entries(trees)) {
      map[treeId] = tree.skills.reduce((sum, skill) => sum + skill.currentPoints, 0);
    }
    return map;
  }, [trees]);

  const totalSpent = useMemo(
    () => Object.values(spentByTree).reduce((a, b) => a + b, 0),
    [spentByTree]
  );

  const remaining = totalPoints - totalSpent;

  // Transform Pathfinder skill nodes to Looty format
  const transformSkillNodesToLootyFormat = (
    skillNodes: SkillTreeNode[], 
    treeId: string,
    treeName: string,
    treeColor: ColorToken
  ): TreeDef => {
    const skills: SkillDef[] = skillNodes.map((node, index) => ({
      id: node.skill.id,
      name: node.skill.name,
      max: 5,
      tier: Math.min(5, Math.max(1, node.skill.prerequisites.length + 1)),
      row: Math.floor(index / 4) + 1,
      col: (index % 4) + 1,
      description: node.skill.description,
      currentPoints: node.userProgress?.currentLevel || 0,
      isUnlocked: node.isUnlocked,
      prerequisites: node.skill.prerequisites,
      category: node.skill.category,
    }));

    return {
      id: treeId,
      name: treeName,
      color: treeColor,
      skills,
      totalPoints: skills.reduce((sum, skill) => sum + skill.currentPoints, 0),
      maxPoints: skills.length * 5,
    };
  };

  // Mouse tracking for spotlight effect
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

  // Load skill data
  useEffect(() => {
    const loadSkillData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load soft skills tree
        const softSkills = await skillService.getSoftSkillsTree(currentUser.uid);
        const softTree = transformSkillNodesToLootyFormat(
          softSkills, 
          'soft', 
          'Soft Skills', 
          'secondary'
        );

        // Load hard skills for the career path if specified
        let hardTree: TreeDef | null = null;
        if (careerPath && careerPath !== 'general') {
          try {
            const hardSkills = await skillService.getHardSkillsForCareer(currentUser.uid, careerPath);
            hardTree = transformSkillNodesToLootyFormat(
              hardSkills,
              'hard',
              'Technical Skills',
              'primary'
            );
          } catch (error) {
            console.error('Error loading hard skills:', error);
          }
        }

        const newTrees: Record<string, TreeDef> = { soft: softTree };
        if (hardTree) {
          newTrees.hard = hardTree;
        }

        setTrees(newTrees);
      } catch (error) {
        console.error('Error loading skill tree data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkillData();
  }, [currentUser, careerPath]);

  // Check if skill can be upgraded
  const canInc = (tree: TreeDef, skill: SkillDef) => {
    const unlocked = spentByTree[tree.id] >= (skill.tier - 1) * 5;
    return remaining > 0 && skill.currentPoints < skill.max && (skill.isUnlocked || unlocked);
  };

  const canDec = (tree: TreeDef, skill: SkillDef) => {
    return skill.currentPoints > 0;
  };

  // Create particle effect for mastery celebration
  const createParticleEffect = (skillId: string) => {
    const particleColors = [
      'hsl(var(--primary))',
      'hsl(var(--accent))', 
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FF69B4', // Hot Pink
      '#00FFFF'  // Cyan
    ];

    const particles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      return {
        id: `${skillId}-particle-${i}`,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 2000,
        maxLife: 2000,
        size: 4 + Math.random() * 4,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      };
    });

    setParticleEffects(prev => ({
      ...prev,
      [skillId]: { x: 50, y: 50, particles }
    }));

    // Remove particle effects after animation
    setTimeout(() => {
      setParticleEffects(prev => {
        const next = { ...prev };
        delete next[skillId];
        return next;
      });
    }, 2000);
  };

  // Allocate skill point
  const inc = async (tree: TreeDef, skill: SkillDef) => {
    if (!canInc(tree, skill) || !currentUser) return;
    
    try {
      // Check if skill will reach mastery
      const willReachMastery = skill.currentPoints + 1 === skill.max;
      
      // Trigger level-up animation
      setLevelUpAnimations(prev => {
        const next = new Set(prev);
        next.add(skill.id);
        return next;
      });
      
      // Trigger skill glow effect
      setSkillGlowEffects(prev => {
        const next = new Set(prev);
        next.add(skill.id);
        return next;
      });
      
      // Trigger mastery celebration if reaching max level
      if (willReachMastery) {
        setMasteryCelebrations(prev => {
          const next = new Set(prev);
          next.add(skill.id);
          return next;
        });
        
        // Create particle effect
        createParticleEffect(skill.id);
        
        // Remove mastery celebration after animation
        setTimeout(() => {
          setMasteryCelebrations(prev => {
            const next = new Set(prev);
            next.delete(skill.id);
            return next;
          });
        }, 2000);
      }
      
      // Remove animations after duration
      setTimeout(() => {
        setLevelUpAnimations(prev => {
          const next = new Set(prev);
          next.delete(skill.id);
          return next;
        });
      }, 600);
      
      setTimeout(() => {
        setSkillGlowEffects(prev => {
          const next = new Set(prev);
          next.delete(skill.id);
          return next;
        });
      }, 1500);

      // Update local state immediately for responsiveness
      setTrees(prev => ({
        ...prev,
        [tree.id]: {
          ...prev[tree.id],
          skills: prev[tree.id].skills.map(s => 
            s.id === skill.id 
              ? { ...s, currentPoints: s.currentPoints + 1 }
              : s
          )
        }
      }));

      // Persist to Firebase
      await skillService.addSkillHours(currentUser.uid, skill.id, 1);
      onPointAllocation?.(skill.id, 1);
    } catch (error) {
      console.error('Error adding skill point:', error);
      // Revert on error - could be more sophisticated
      window.location.reload();
    }
  };

  // Remove skill point
  const dec = async (tree: TreeDef, skill: SkillDef) => {
    if (!canDec(tree, skill) || !currentUser) return;
    
    try {
      setTrees(prev => ({
        ...prev,
        [tree.id]: {
          ...prev[tree.id],
          skills: prev[tree.id].skills.map(s => 
            s.id === skill.id 
              ? { ...s, currentPoints: Math.max(0, s.currentPoints - 1) }
              : s
          )
        }
      }));

      // Persist to Firebase
      await skillService.addSkillHours(currentUser.uid, skill.id, -1);
      onPointAllocation?.(skill.id, -1);
    } catch (error) {
      console.error('Error removing skill point:', error);
      window.location.reload();
    }
  };

  // Reset all points in tree
  const resetTree = async (treeId: string) => {
    if (!currentUser) return;
    
    const tree = trees[treeId];
    if (!tree) return;

    try {
      // Reset local state
      setTrees(prev => ({
        ...prev,
        [treeId]: {
          ...prev[treeId],
          skills: prev[treeId].skills.map(s => ({ ...s, currentPoints: 0 }))
        }
      }));

      // Reset in Firebase - you may want to implement a batch reset in your service
      for (const skill of tree.skills) {
        if (skill.currentPoints > 0) {
          await skillService.addSkillHours(currentUser.uid, skill.id, -skill.currentPoints);
        }
      }
    } catch (error) {
      console.error('Error resetting tree:', error);
      window.location.reload();
    }
  };

  const resetAll = () => {
    Object.keys(trees).forEach(treeId => resetTree(treeId));
  };

  // Render skill connection lines
  const renderConnectionLines = () => {
    const connections: JSX.Element[] = [];
    
    activeTree.skills.forEach((skill) => {
      skill.prerequisites.forEach((prereqId) => {
        const prereqSkill = activeTree.skills.find(s => s.id === prereqId);
        if (!prereqSkill) return;

        // Calculate grid positions (each cell is roughly 25% width and 20% height of the container)
        const skillX = ((skill.col - 1) * 25) + 12.5; // Center of cell as percentage
        const skillY = ((skill.row - 1) * 20) + 10;   // Center of cell as percentage
        const prereqX = ((prereqSkill.col - 1) * 25) + 12.5;
        const prereqY = ((prereqSkill.row - 1) * 20) + 10;

        const isActive = prereqSkill.currentPoints > 0 && skill.currentPoints > 0;
        const isPrereqMet = prereqSkill.currentPoints > 0;

        connections.push(
          <line
            key={`${prereqId}-${skill.id}`}
            x1={`${prereqX}%`}
            y1={`${prereqY}%`}
            x2={`${skillX}%`}
            y2={`${skillY}%`}
            stroke={isActive ? "hsl(var(--primary))" : isPrereqMet ? "hsl(var(--accent))" : "hsl(var(--muted))"}
            strokeWidth={isActive ? "3" : "2"}
            strokeDasharray={isPrereqMet ? "0" : "5,5"}
            opacity={isActive ? "1" : isPrereqMet ? "0.8" : "0.4"}
            className="transition-all duration-300"
          />
        );
      });
    });

    return connections;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading skill trees...</p>
        </div>
      </div>
    );
  }

  const activeTree = trees[activeTreeId];
  if (!activeTree) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No skill tree data available</p>
      </div>
    );
  }

  // Create spotlight style
  const spotlightStyle = {
    background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, hsl(var(--primary) / 0.15), transparent 60%)`,
  } as React.CSSProperties;

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Spotlight Effect */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={spotlightStyle}
          aria-hidden 
        />
        <div className="container py-10 relative z-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Interactive Skill Trees</h1>
            <p className="text-muted-foreground mt-2">
              Allocate points, unlock tiers, and master your skills.
            </p>
          </header>

          <section className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center rounded-md border px-3 py-1 bg-card">
                Total Points: <strong className="ml-1">{totalPoints}</strong>
              </span>
              <span className="inline-flex items-center rounded-md border px-3 py-1 bg-card">
                Spent: <strong className="ml-1">{totalSpent}</strong>
              </span>
              <span className="inline-flex items-center rounded-md border px-3 py-1 bg-card text-primary">
                Available: <strong className="ml-1">{remaining}</strong>
              </span>
            </div>
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset All
            </Button>
          </section>

          {/* Tree Selection Tabs */}
          <div className="flex gap-2 mb-6">
            {Object.values(trees).map((tree) => (
              <Button
                key={tree.id}
                variant={activeTreeId === tree.id ? "default" : "outline"}
                onClick={() => setActiveTreeId(tree.id)}
                className={cn(
                  "transition-all duration-200",
                  activeTreeId === tree.id && "glow-effect"
                )}
              >
                <Zap className="w-4 h-4 mr-2" />
                {tree.name} ({spentByTree[tree.id]})
              </Button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Tree Progress</span>
              <span>{Math.round((spentByTree[activeTreeId] / (activeTree.maxPoints || 1)) * 100)}%</span>
            </div>
            <Progress 
              value={(spentByTree[activeTreeId] / (activeTree.maxPoints || 1)) * 100} 
              className="h-2"
            />
          </div>

          {/* Skill Tree Grid */}
          <section className="grid gap-6 lg:grid-cols-1">
            <article key={activeTree.id} className="flex flex-col">
              <div className={cn(
                "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 w-max transition-all duration-200",
                "border-primary text-primary glow-effect"
              )}>
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">{spentByTree[activeTree.id]} {activeTree.name}</span>
              </div>

              <Card
                className={cn(
                  "p-6 border-2 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:glow-effect-strong relative",
                  "border-primary"
                )}
              >
                {/* Connection Lines SVG Overlay */}
                <svg 
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{ top: '24px', left: '24px', right: '24px', bottom: '24px' }}
                >
                  {renderConnectionLines()}
                </svg>
                
                <div className="grid grid-cols-4 gap-4 relative z-10" style={{ gridTemplateRows: "repeat(5, minmax(0, 1fr))" }}>
                  {SLOTS.flat().map(({ row, col }) => {
                    const skill = activeTree.skills.find((s) => s.row === row && s.col === col);
                    if (!skill) {
                      return (
                        <div
                          key={`${row}-${col}`}
                          className="aspect-square rounded-md border-2 border-dashed border-muted/30 bg-muted/10"
                          aria-hidden
                        />
                      );
                    }

                    const curr = skill.currentPoints;
                    const unlocked = skill.isUnlocked || spentByTree[activeTree.id] >= (skill.tier - 1) * 5;
                    const canUpgrade = canInc(activeTree, skill);
                    const canDowngrade = canDec(activeTree, skill);

                    return (
                      <Tooltip key={skill.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "skill-node group relative",
                              unlocked ? "unlocked border-primary/50" : "locked border-muted",
                              curr > 0 && "border-primary glow-effect",
                              curr === skill.max && "border-accent",
                              levelUpAnimations.has(skill.id) && "level-up-animation",
                              skillGlowEffects.has(skill.id) && "skill-glow-animation",
                              masteryCelebrations.has(skill.id) && "mastery-celebration"
                            )}
                          >
                            {/* Tier Indicator */}
                            <div className="absolute left-1 top-1 text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                              T{skill.tier}
                            </div>

                            {/* Skill Icon/Name */}
                            <div className="text-center text-xs font-medium px-2 leading-tight flex flex-col items-center">
                              {unlocked ? (
                                curr === skill.max ? (
                                  <Star className="w-6 h-6 text-accent mb-1" />
                                ) : curr > 0 ? (
                                  <Zap className="w-6 h-6 text-primary mb-1" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-primary mb-1" />
                                )
                              ) : (
                                <Lock className="w-6 h-6 text-muted-foreground mb-1" />
                              )}
                              <span className={cn(
                                "text-[10px] leading-tight",
                                unlocked ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {skill.name.split(' ').slice(0, 2).join(' ')}
                              </span>
                            </div>

                            {/* Point Controls */}
                            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                                onClick={() => dec(activeTree, skill)} 
                                disabled={!canDowngrade}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span 
                                className={cn(
                                  "text-[11px] select-none font-bold",
                                  levelUpAnimations.has(skill.id) && "point-pop-animation"
                                )}
                              >
                                {curr} / {skill.max}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                                onClick={() => inc(activeTree, skill)} 
                                disabled={!canUpgrade}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Particle Effects */}
                            {particleEffects[skill.id] && (
                              <div className="absolute inset-0">
                                {particleEffects[skill.id].particles.map((particle) => (
                                  <div
                                    key={particle.id}
                                    className="particle"
                                    style={{
                                      left: `${particleEffects[skill.id].x}%`,
                                      top: `${particleEffects[skill.id].y}%`,
                                      width: `${particle.size}px`,
                                      height: `${particle.size}px`,
                                      backgroundColor: particle.color,
                                      transform: `translate(${particle.vx * 20}px, ${particle.vy * 20}px)`,
                                      animationDelay: `${Math.random() * 0.5}s`,
                                      boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Mastery Indicator */}
                            {curr === skill.max && (
                              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                <Star className="w-3 h-3 text-accent-foreground" />
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="font-medium text-sm">{skill.name}</div>
                          <div className="text-muted-foreground text-xs mt-1">
                            {skill.description || "Invest points to unlock this ability."}
                          </div>
                          <div className="mt-2 space-y-1 text-xs">
                            <div>Level: {curr}/{skill.max}</div>
                            <div>Tier: {skill.tier} (Unlocks with {(skill.tier - 1) * 5} points in tree)</div>
                            {skill.prerequisites.length > 0 && (
                              <div>Prerequisites: {skill.prerequisites.join(', ')}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </Card>

              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => resetTree(activeTree.id)}>
                  <RotateCcw className="h-4 w-4" /> Reset {activeTree.name}
                </Button>
              </div>
            </article>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}