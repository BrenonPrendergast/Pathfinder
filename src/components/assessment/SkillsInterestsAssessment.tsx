import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import { NavigateNext, NavigateBefore, School } from '@mui/icons-material';
import { SkillsAndInterests } from '../../services/types/assessment.types';

interface SkillsInterestsAssessmentProps {
  onComplete: (data: SkillsAndInterests) => void;
  onBack?: () => void;
  initialData?: SkillsAndInterests;
}

const technicalAreas = [
  'Software Development', 'Data Analysis', 'Web Design', 'Digital Marketing',
  'Project Management', 'Cybersecurity', 'AI/Machine Learning', 'Cloud Computing',
  'Mobile Development', 'Database Management', 'UX/UI Design', 'DevOps'
];

const workActivities = [
  'Problem Solving', 'Creative Design', 'Data Analysis', 'Team Collaboration',
  'Public Speaking', 'Writing & Communication', 'Research', 'Planning & Strategy',
  'Teaching & Training', 'Customer Service', 'Sales & Negotiation', 'Leadership'
];

const SkillsInterestsAssessment: React.FC<SkillsInterestsAssessmentProps> = ({
  onComplete,
  onBack,
  initialData
}) => {
  const [data, setData] = useState<SkillsAndInterests>(
    initialData || {
      currentSoftSkills: {},
      technicalInterests: [],
      preferredActivities: [],
      learningStyle: ['visual'],
      problemSolvingStyle: 'systematic'
    }
  );

  const toggleTechnicalInterest = (interest: string) => {
    setData(prev => ({
      ...prev,
      technicalInterests: prev.technicalInterests.includes(interest)
        ? prev.technicalInterests.filter(i => i !== interest)
        : [...prev.technicalInterests, interest]
    }));
  };

  const togglePreferredActivity = (activity: string) => {
    setData(prev => ({
      ...prev,
      preferredActivities: prev.preferredActivities.includes(activity)
        ? prev.preferredActivities.filter(a => a !== activity)
        : [...prev.preferredActivities, activity]
    }));
  };

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <Box>
      <LinearProgress variant="determinate" value={100} sx={{ height: 4, borderRadius: 2, mb: 3 }} />
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <School sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Skills & Interests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tell us about your interests and preferred activities
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Technical Areas of Interest
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select all areas that interest you (up to 6)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {technicalAreas.map((area) => (
                    <Chip
                      key={area}
                      label={area}
                      clickable
                      color={data.technicalInterests.includes(area) ? 'primary' : 'default'}
                      variant={data.technicalInterests.includes(area) ? 'filled' : 'outlined'}
                      onClick={() => toggleTechnicalInterest(area)}
                      disabled={!data.technicalInterests.includes(area) && data.technicalInterests.length >= 6}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Preferred Work Activities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  What types of activities energize you? (select up to 6)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {workActivities.map((activity) => (
                    <Chip
                      key={activity}
                      label={activity}
                      clickable
                      color={data.preferredActivities.includes(activity) ? 'secondary' : 'default'}
                      variant={data.preferredActivities.includes(activity) ? 'filled' : 'outlined'}
                      onClick={() => togglePreferredActivity(activity)}
                      disabled={!data.preferredActivities.includes(activity) && data.preferredActivities.length >= 6}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Problem-Solving Style</FormLabel>
                <RadioGroup
                  value={data.problemSolvingStyle}
                  onChange={(e) => setData(prev => ({ ...prev, problemSolvingStyle: e.target.value as any }))}
                >
                  <FormControlLabel value="systematic" control={<Radio />} label="Systematic & methodical" />
                  <FormControlLabel value="intuitive" control={<Radio />} label="Intuitive & flexible" />
                  <FormControlLabel value="collaborative" control={<Radio />} label="Collaborative discussion" />
                  <FormControlLabel value="independent" control={<Radio />} label="Independent analysis" />
                </RadioGroup>
              </FormControl>
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

export default SkillsInterestsAssessment;