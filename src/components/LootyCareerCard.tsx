import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Career {
  id: string;
  title: string;
  description?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  growthOutlook?: string;
  category?: string;
}

interface LootyCareerCardProps {
  career: Career;
  onClick: () => void;
  className?: string;
}

export default function LootyCareerCard({ career, onClick, className }: LootyCareerCardProps) {
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const getGrowthIcon = (outlook: string) => {
    switch (outlook?.toLowerCase()) {
      case 'faster than average':
      case 'much faster than average':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'slower than average':
      case 'decline':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4 text-primary" />;
    }
  };

  const getGrowthColor = (outlook: string) => {
    switch (outlook?.toLowerCase()) {
      case 'faster than average':
      case 'much faster than average':
        return 'text-green-500';
      case 'slower than average':
      case 'decline':
        return 'text-red-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 ease-in-out",
        "hover:scale-[1.02] hover:glow-effect border-primary/20 bg-card/80 backdrop-blur-sm",
        "hover:border-primary/50 hover:shadow-xl",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                {career.title}
              </h3>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>

            {career.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {career.description}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              {career.salaryRange && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">
                        {formatSalary(career.salaryRange.min)} - {formatSalary(career.salaryRange.max)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Salary Range</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {career.growthOutlook && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      {getGrowthIcon(career.growthOutlook)}
                      <span className={cn("text-sm font-medium", getGrowthColor(career.growthOutlook))}>
                        {career.growthOutlook}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Job Growth Outlook</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {career.category && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-secondary capitalize">
                    {career.category.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}