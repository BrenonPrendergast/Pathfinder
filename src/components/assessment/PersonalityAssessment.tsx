import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Slider,
  FormControl,
  FormLabel,
  Grid,
  Chip,
  Paper,
  Alert,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  Psychology,
  NavigateNext,
  NavigateBefore,
  Lightbulb,
} from '@mui/icons-material';
import { PersonalityTraits } from '../../services/types/assessment.types';

interface PersonalityAssessmentProps {
  onComplete: (data: PersonalityTraits) => void;
  onBack?: () => void;
  initialData?: PersonalityTraits;
}

interface PersonalityQuestion {
  id: keyof PersonalityTraits;
  trait: string;
  question: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  examples: {
    low: string[];
    high: string[];
  };
}

const personalityQuestions: PersonalityQuestion[] = [
  {
    id: 'openness',
    trait: 'Openness to Experience',
    question: 'How much do you enjoy exploring new ideas and experiences?',
    description: 'Your willingness to try new things, think creatively, and embrace change.',
    lowLabel: 'Prefer Routine',
    highLabel: 'Love Novelty',
    examples: {
      low: ['Prefer proven methods', 'Value tradition', 'Like predictable routines'],
      high: ['Enjoy brainstorming', 'Love learning new things', 'Embrace change readily']
    }
  },
  {
    id: 'conscientiousness',
    trait: 'Conscientiousness',
    question: 'How organized and disciplined are you in your approach to work?',
    description: 'Your level of organization, self-discipline, and attention to detail.',
    lowLabel: 'Flexible & Spontaneous',
    highLabel: 'Organized & Planned',
    examples: {
      low: ['Adapt easily to changes', 'Work well under pressure', 'Prefer flexibility'],
      high: ['Plan ahead thoroughly', 'Meet all deadlines', 'Maintain organized systems']
    }
  },
  {
    id: 'extraversion',
    trait: 'Extraversion',
    question: 'How much energy do you gain from social interactions?',
    description: 'Your comfort level with social situations and where you get your energy.',
    lowLabel: 'Energized by Solitude',
    highLabel: 'Energized by People',
    examples: {
      low: ['Think before speaking', 'Prefer deep conversations', 'Need quiet time to recharge'],
      high: ['Think out loud', 'Enjoy group activities', 'Feel energized by social events']
    }
  },
  {
    id: 'agreeableness',
    trait: 'Agreeableness',
    question: 'How important is harmony and cooperation in your interactions?',
    description: 'Your tendency to be cooperative, trusting, and considerate of others.',
    lowLabel: 'Direct & Competitive',
    highLabel: 'Cooperative & Trusting',
    examples: {
      low: ['Comfortable with conflict', 'Focus on results', 'Challenge ideas directly'],
      high: ['Seek win-win solutions', 'Consider others\' feelings', 'Build consensus']
    }
  },
  {
    id: 'neuroticism',
    trait: 'Emotional Stability',
    question: 'How well do you handle stress and maintain emotional balance?',
    description: 'Your emotional resilience and ability to stay calm under pressure.',
    lowLabel: 'Highly Resilient',
    highLabel: 'Emotionally Sensitive',
    examples: {
      low: ['Stay calm in crises', 'Bounce back quickly', 'Rarely feel overwhelmed'],
      high: ['Feel emotions deeply', 'Highly empathetic', 'Sensitive to stress']
    }
  }
];

const PersonalityAssessment: React.FC<PersonalityAssessmentProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  const [responses, setResponses] = useState<PersonalityTraits>(
    initialData || {
      openness: 4,
      conscientiousness: 4,
      extraversion: 4,
      agreeableness: 4,
      neuroticism: 4
    }
  );
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showInsight, setShowInsight] = useState(false);

  const currentQuestion = personalityQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === personalityQuestions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / personalityQuestions.length) * 100;

  const handleSliderChange = (trait: keyof PersonalityTraits, value: number | number[]) => {
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

  const getPersonalityInsight = (trait: keyof PersonalityTraits, value: number) => {
    const insights = {
      openness: {
        low: 'You prefer established methods and value consistency. Great for roles requiring reliability and proven processes.',
        mid: 'You balance innovation with practicality, adapting well to different situations.',
        high: 'You thrive on creativity and new challenges. Perfect for innovative and dynamic roles.'
      },
      conscientiousness: {
        low: 'You excel at adapting to changing priorities and work well in flexible environments.',
        mid: 'You balance planning with adaptability, working well in structured yet dynamic roles.',
        high: 'You excel at detailed planning and execution. Great for roles requiring precision and reliability.'
      },
      extraversion: {
        low: 'You work best in quiet environments and excel at deep, focused work.',
        mid: 'You adapt well to both independent work and team collaboration.',
        high: 'You thrive in social environments and excel at team leadership and collaboration.'
      },
      agreeableness: {
        low: 'You excel at making tough decisions and driving results through direct communication.',
        mid: 'You balance assertiveness with cooperation, leading effectively through influence.',
        high: 'You excel at building consensus and creating collaborative team environments.'
      },
      neuroticism: {
        low: 'You maintain composure under pressure and recover quickly from setbacks.',
        mid: 'You balance emotional awareness with resilience, connecting well with others.',
        high: 'You bring emotional intelligence and deep empathy to your work relationships.'
      }
    };

    if (value <= 2.5) return insights[trait].low;
    if (value >= 5.5) return insights[trait].high;
    return insights[trait].mid;
  };

  const getCareerRelevance = (trait: keyof PersonalityTraits, value: number) => {
    const relevance = {
      openness: {
        low: ['Accounting', 'Operations', 'Quality Assurance'],
        high: ['Marketing', 'Product Design', 'Research & Development']
      },
      conscientiousness: {
        low: ['Creative Roles', 'Crisis Management', 'Emergency Services'],
        high: ['Project Management', 'Finance', 'Engineering']
      },
      extraversion: {
        low: ['Software Development', 'Research', 'Writing'],
        high: ['Sales', 'Management', 'Public Relations']
      },
      agreeableness: {
        low: ['Legal', 'Executive Leadership', 'Competitive Sales'],
        high: ['Healthcare', 'Education', 'Human Resources']
      },
      neuroticism: {
        low: ['Leadership', 'Emergency Response', 'High-stakes Decision Making'],
        high: ['Counseling', 'Creative Arts', 'Customer Service']
      }
    };

    return value >= 5 ? relevance[trait].high : relevance[trait].low;
  };

  return (
    <Box>
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentQuestionIndex + 1} of {personalityQuestions.length}
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
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 600 }}>
                {currentQuestion.trait}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                {currentQuestion.question}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentQuestion.description}
              </Typography>
            </Box>

            {/* Slider */}
            <Box sx={{ px: 4 }}>
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {currentQuestion.lowLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
              </FormControl>
            </Box>

            {/* Examples */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {currentQuestion.lowLabel} characteristics:
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
                    {currentQuestion.highLabel} characteristics:
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

            {/* Real-time insight */}
            {showInsight && (
              <Fade in={showInsight}>
                <Alert severity="info" sx={{ mt: 3 }} icon={<Lightbulb />}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Your Profile:</strong> {getPersonalityInsight(currentQuestion.id, responses[currentQuestion.id])}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Career Fit:</strong> {getCareerRelevance(currentQuestion.id, responses[currentQuestion.id]).join(', ')}
                  </Typography>
                </Alert>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 && !onBack}
        >
          {currentQuestionIndex === 0 ? 'Back' : 'Previous'}
        </Button>

        <Button
          variant="text"
          startIcon={<Lightbulb />}
          onClick={() => setShowInsight(!showInsight)}
          size="small"
        >
          {showInsight ? 'Hide' : 'Show'} Insight
        </Button>

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

export default PersonalityAssessment;