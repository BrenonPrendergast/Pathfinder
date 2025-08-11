import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Grid,
  LinearProgress,
  Slider,
  Paper,
} from '@mui/material';
import { NavigateNext, NavigateBefore, TrendingUp } from '@mui/icons-material';
import { ExperienceAndGoals } from '../../services/types/assessment.types';

interface ExperienceGoalsAssessmentProps {
  onComplete: (data: ExperienceAndGoals) => void;
  onBack?: () => void;
  initialData?: ExperienceAndGoals;
}

const ExperienceGoalsAssessment: React.FC<ExperienceGoalsAssessmentProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  const [data, setData] = useState<ExperienceAndGoals>(
    initialData || {
      experienceLevel: 'entry_level',
      industryExperience: [],
      timelineGoal: '1_2_years',
      salaryExpectations: {
        min: 50000,
        max: 80000,
        priority: 4
      },
      locationFlexibility: 'regional'
    }
  );

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <Box>
      <LinearProgress variant="determinate" value={100} sx={{ height: 4, borderRadius: 2, mb: 3 }} />
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Experience & Career Goals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Help us understand your background and aspirations
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Experience Level</FormLabel>
                <RadioGroup
                  value={data.experienceLevel}
                  onChange={(e) => setData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                >
                  <FormControlLabel value="entry_level" control={<Radio />} label="Entry level (0-2 years)" />
                  <FormControlLabel value="some_experience" control={<Radio />} label="Some experience (2-5 years)" />
                  <FormControlLabel value="mid_career" control={<Radio />} label="Mid-career (5-10 years)" />
                  <FormControlLabel value="senior" control={<Radio />} label="Senior (10+ years)" />
                  <FormControlLabel value="executive" control={<Radio />} label="Executive level" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Career Timeline</FormLabel>
                <RadioGroup
                  value={data.timelineGoal}
                  onChange={(e) => setData(prev => ({ ...prev, timelineGoal: e.target.value as any }))}
                >
                  <FormControlLabel value="immediate" control={<Radio />} label="Looking now" />
                  <FormControlLabel value="1_2_years" control={<Radio />} label="Within 1-2 years" />
                  <FormControlLabel value="3_5_years" control={<Radio />} label="3-5 year plan" />
                  <FormControlLabel value="long_term" control={<Radio />} label="Long-term planning" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Role (optional)"
                value={data.currentRole || ''}
                onChange={(e) => setData(prev => ({ ...prev, currentRole: e.target.value }))}
                placeholder="e.g., Software Engineer, Marketing Coordinator"
                helperText="This helps us understand your background"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Salary Expectations (Optional)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Minimum Salary"
                      type="number"
                      value={data.salaryExpectations?.min || 50000}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        salaryExpectations: {
                          ...prev.salaryExpectations!,
                          min: parseInt(e.target.value) || 0
                        }
                      }))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Target Salary"
                      type="number"
                      value={data.salaryExpectations?.max || 80000}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        salaryExpectations: {
                          ...prev.salaryExpectations!,
                          max: parseInt(e.target.value) || 0
                        }
                      }))}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      How important is salary to you?
                    </Typography>
                    <Slider
                      value={data.salaryExpectations?.priority || 4}
                      onChange={(_, value) => setData(prev => ({
                        ...prev,
                        salaryExpectations: {
                          ...prev.salaryExpectations!,
                          priority: Array.isArray(value) ? value[0] : value
                        }
                      }))}
                      min={1}
                      max={7}
                      marks={[
                        { value: 1, label: 'Not Important' },
                        { value: 4, label: 'Moderately' },
                        { value: 7, label: 'Very Important' }
                      ]}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button startIcon={<NavigateBefore />} onClick={onBack}>
          Previous
        </Button>
        <Button variant="contained" endIcon={<NavigateNext />} onClick={handleComplete}>
          Complete Assessment
        </Button>
      </Box>
    </Box>
  );
};

export default ExperienceGoalsAssessment;