import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Slider,
  Grid,
  LinearProgress,
  Paper,
} from '@mui/material';
import { NavigateNext, NavigateBefore, Star } from '@mui/icons-material';
import { CareerValues } from '../../services/types/assessment.types';

interface CareerValuesAssessmentProps {
  onComplete: (data: CareerValues) => void;
  onBack?: () => void;
  initialData?: CareerValues;
}

const valueItems = [
  { key: 'compensation' as keyof CareerValues, label: 'High Compensation', description: 'Earning a competitive salary' },
  { key: 'workLifeBalance' as keyof CareerValues, label: 'Work-Life Balance', description: 'Time for personal life and interests' },
  { key: 'jobSecurity' as keyof CareerValues, label: 'Job Security', description: 'Stable employment and benefits' },
  { key: 'careerGrowth' as keyof CareerValues, label: 'Career Growth', description: 'Advancement opportunities' },
  { key: 'creativity' as keyof CareerValues, label: 'Creativity', description: 'Freedom to innovate and create' },
  { key: 'autonomy' as keyof CareerValues, label: 'Autonomy', description: 'Independence in how you work' },
  { key: 'socialImpact' as keyof CareerValues, label: 'Social Impact', description: 'Making a positive difference' },
  { key: 'intellectualChallenge' as keyof CareerValues, label: 'Intellectual Challenge', description: 'Complex problem solving' },
];

const CareerValuesAssessment: React.FC<CareerValuesAssessmentProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  const [values, setValues] = useState<CareerValues>(
    initialData || {
      compensation: 4,
      workLifeBalance: 4,
      jobSecurity: 4,
      careerGrowth: 4,
      creativity: 4,
      autonomy: 4,
      socialImpact: 4,
      intellectualChallenge: 4,
      recognition: 4,
      leadership: 4,
      variety: 4,
      stability: 4
    }
  );

  const handleSliderChange = (key: keyof CareerValues, value: number | number[]) => {
    setValues(prev => ({
      ...prev,
      [key]: Array.isArray(value) ? value[0] : value
    }));
  };

  const handleComplete = () => {
    onComplete(values);
  };

  return (
    <Box>
      <LinearProgress variant="determinate" value={100} sx={{ height: 4, borderRadius: 2, mb: 3 }} />
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Star sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              What Matters Most to You?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rate the importance of each factor in your ideal career
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {valueItems.map((item) => (
              <Grid item xs={12} md={6} key={item.key}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.875rem' }}>
                    <Typography variant="caption">Not Important</Typography>
                    <Typography variant="caption">Extremely Important</Typography>
                  </Box>
                  
                  <Slider
                    value={values[item.key]}
                    onChange={(_, value) => handleSliderChange(item.key, value)}
                    min={1}
                    max={7}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 4, label: '4' },
                      { value: 7, label: '7' }
                    ]}
                    sx={{ '& .MuiSlider-thumb': { width: 20, height: 20 } }}
                  />
                  
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                      {values[item.key]} / 7
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button startIcon={<NavigateBefore />} onClick={onBack}>
          Previous
        </Button>
        <Button variant="contained" endIcon={<NavigateNext />} onClick={handleComplete}>
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default CareerValuesAssessment;