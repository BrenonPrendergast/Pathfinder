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
  Slider,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import { NavigateNext, NavigateBefore } from '@mui/icons-material';
import { WorkEnvironmentPreferences } from '../../services/types/assessment.types';

interface WorkEnvironmentAssessmentProps {
  onComplete: (data: WorkEnvironmentPreferences) => void;
  onBack?: () => void;
  initialData?: WorkEnvironmentPreferences;
}

const WorkEnvironmentAssessment: React.FC<WorkEnvironmentAssessmentProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  const [preferences, setPreferences] = useState<WorkEnvironmentPreferences>(
    initialData || {
      remotePreference: 'hybrid',
      companySizePreference: 'medium',
      industryPacePreference: 'moderate',
      travelWillingness: 'minimal',
      workLifeBalance: 5
    }
  );

  const handleComplete = () => {
    onComplete(preferences);
  };

  return (
    <Box>
      <LinearProgress variant="determinate" value={100} sx={{ height: 4, borderRadius: 2, mb: 3 }} />
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Work Environment Preferences</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Work Location Preference</FormLabel>
                <RadioGroup
                  value={preferences.remotePreference}
                  onChange={(e) => setPreferences(prev => ({ ...prev, remotePreference: e.target.value as any }))}
                >
                  <FormControlLabel value="office" control={<Radio />} label="In-office" />
                  <FormControlLabel value="hybrid" control={<Radio />} label="Hybrid (2-3 days office)" />
                  <FormControlLabel value="remote" control={<Radio />} label="Fully remote" />
                  <FormControlLabel value="no_preference" control={<Radio />} label="No preference" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Company Size Preference</FormLabel>
                <RadioGroup
                  value={preferences.companySizePreference}
                  onChange={(e) => setPreferences(prev => ({ ...prev, companySizePreference: e.target.value as any }))}
                >
                  <FormControlLabel value="startup" control={<Radio />} label="Startup (1-50)" />
                  <FormControlLabel value="small" control={<Radio />} label="Small (50-200)" />
                  <FormControlLabel value="medium" control={<Radio />} label="Medium (200-1000)" />
                  <FormControlLabel value="large" control={<Radio />} label="Large (1000+)" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormLabel component="legend">Work-Life Balance Priority</FormLabel>
              <Box sx={{ px: 2, py: 2 }}>
                <Slider
                  value={preferences.workLifeBalance}
                  onChange={(_, value) => setPreferences(prev => ({ ...prev, workLifeBalance: Array.isArray(value) ? value[0] : value }))}
                  min={1}
                  max={7}
                  step={1}
                  marks={[
                    { value: 1, label: 'Career First' },
                    { value: 4, label: 'Balanced' },
                    { value: 7, label: 'Life First' }
                  ]}
                />
              </Box>
            </Grid>
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

export default WorkEnvironmentAssessment;