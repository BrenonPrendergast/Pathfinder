import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Slider,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Groups,
  Person,
  AccountTree,
  FlightTakeoff,
} from '@mui/icons-material';
import { WorkStylePreferences } from '../../services/types/assessment.types';

interface WorkStyleAssessmentProps {
  onComplete: (data: WorkStylePreferences) => void;
  onBack?: () => void;
  initialData?: WorkStylePreferences;
}

interface WorkStyleQuestion {
  id: keyof WorkStylePreferences;
  title: string;
  question: string;
  lowLabel: string;
  highLabel: string;
  icon: React.ReactNode;
  examples: {
    low: string[];
    high: string[];
  };
}

const workStyleQuestions: WorkStyleQuestion[] = [
  {
    id: 'teamOriented',
    title: 'Collaboration Style',
    question: 'How do you prefer to work on projects and make decisions?',
    lowLabel: 'Independent Work',
    highLabel: 'Team Collaboration',
    icon: <Groups />,
    examples: {
      low: ['Work alone on complex tasks', 'Make decisions independently', 'Prefer individual accountability'],
      high: ['Brainstorm with colleagues', 'Seek group consensus', 'Thrive in team environments']
    }
  },
  {
    id: 'structuredFlexible',
    title: 'Work Structure',
    question: 'What type of work environment helps you perform your best?',
    lowLabel: 'Clear Structure & Processes',
    highLabel: 'Flexibility & Autonomy',
    icon: <AccountTree />,
    examples: {
      low: ['Follow established procedures', 'Clear guidelines and expectations', 'Structured schedules'],
      high: ['Adapt methods as needed', 'Create own processes', 'Flexible schedules and approaches']
    }
  },
  {
    id: 'analyticalCreative',
    title: 'Problem-Solving Approach',
    question: 'How do you naturally approach problem-solving and decision-making?',
    lowLabel: 'Data-Driven & Analytical',
    highLabel: 'Intuitive & Creative',
    icon: <FlightTakeoff />,
    examples: {
      low: ['Research thoroughly before deciding', 'Rely on data and metrics', 'Use systematic approaches'],
      high: ['Trust gut feelings', 'Generate innovative solutions', 'Think outside the box']
    }
  },
  {
    id: 'detailOriented',
    title: 'Attention to Detail',
    question: 'How much do you focus on details versus the big picture?',
    lowLabel: 'Big Picture Focus',
    highLabel: 'Detail-Oriented',
    icon: <Person />,
    examples: {
      low: ['Focus on overall strategy', 'Delegate detail work', 'See patterns and trends'],
      high: ['Notice small errors', 'Ensure accuracy', 'Perfect execution']
    }
  },
  {
    id: 'riskTolerance',
    title: 'Risk Comfort',
    question: 'How comfortable are you with uncertainty and taking risks?',
    lowLabel: 'Prefer Security',
    highLabel: 'Embrace Risk',
    icon: <FlightTakeoff />,
    examples: {
      low: ['Prefer proven methods', 'Thorough risk assessment', 'Stable, predictable outcomes'],
      high: ['Try new approaches', 'Quick to test ideas', 'Comfortable with uncertainty']
    }
  },
  {
    id: 'independenceSupervision',
    title: 'Supervision Style',
    question: 'How much guidance and oversight do you prefer in your work?',
    lowLabel: 'Regular Check-ins',
    highLabel: 'Complete Autonomy',
    icon: <Person />,
    examples: {
      low: ['Appreciate regular feedback', 'Clear direction from supervisors', 'Team coordination'],
      high: ['Work independently', 'Self-directed projects', 'Minimal oversight needed']
    }
  }
];

const WorkStyleAssessment: React.FC<WorkStyleAssessmentProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  const [responses, setResponses] = useState<WorkStylePreferences>(
    initialData || {
      teamOriented: 4,
      structuredFlexible: 4,
      analyticalCreative: 4,
      detailOriented: 4,
      riskTolerance: 4,
      independenceSupervision: 4
    }
  );
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = workStyleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === workStyleQuestions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / workStyleQuestions.length) * 100;

  const handleSliderChange = (trait: keyof WorkStylePreferences, value: number | number[]) => {
    setResponses(prev => ({
      ...prev,
      [trait]: Array.isArray(value) ? value[0] : value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(responses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <Box>
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentQuestionIndex + 1} of {workStyleQuestions.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progressPercentage)}% Complete
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 4, borderRadius: 2 }} />
      </Box>

      {/* Question Card */}
      <Fade in={true} timeout={300}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}>
                {currentQuestion.icon}
              </Box>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 600 }}>
                {currentQuestion.title}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                {currentQuestion.question}
              </Typography>
            </Box>

            {/* Slider */}
            <Box sx={{ px: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {currentQuestion.lowLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {currentQuestion.highLabel}
                </Typography>
              </Box>
              
              <Slider
                value={responses[currentQuestion.id]}
                onChange={(_, value) => handleSliderChange(currentQuestion.id, value)}
                min={1}
                max={7}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 4, label: '4' },
                  { value: 7, label: '7' }
                ]}
                sx={{ 
                  '& .MuiSlider-thumb': {
                    width: 24,
                    height: 24
                  },
                  '& .MuiSlider-track': {
                    height: 6
                  },
                  '& .MuiSlider-rail': {
                    height: 6
                  }
                }}
              />

              {/* Value description */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  Current: {responses[currentQuestion.id]} / 7
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {responses[currentQuestion.id] <= 3 
                    ? `Tends toward ${currentQuestion.lowLabel.toLowerCase()}`
                    : responses[currentQuestion.id] >= 5
                    ? `Tends toward ${currentQuestion.highLabel.toLowerCase()}`
                    : 'Balanced approach'
                  }
                </Typography>
              </Box>
            </Box>

            {/* Examples */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {currentQuestion.lowLabel}:
                  </Typography>
                  {currentQuestion.examples.low.map((example, index) => (
                    <Chip
                      key={index}
                      label={example}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1, fontSize: '0.75rem' }}
                    />
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {currentQuestion.highLabel}:
                  </Typography>
                  {currentQuestion.examples.high.map((example, index) => (
                    <Chip
                      key={index}
                      label={example}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1, fontSize: '0.75rem' }}
                    />
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
        >
          Previous
        </Button>

        <Typography variant="body2" color="text.secondary">
          Work Style Assessment
        </Typography>

        <Button
          variant="contained"
          endIcon={<NavigateNext />}
          onClick={handleNext}
        >
          {isLastQuestion ? 'Continue' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default WorkStyleAssessment;