import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  LinearProgress,
  Fade,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Psychology,
  Work,
  Business,
  EmojiEvents,
  School,
  TrendingUp,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import PersonalityAssessment from './PersonalityAssessment';
import WorkStyleAssessment from './WorkStyleAssessment';
import WorkEnvironmentAssessment from './WorkEnvironmentAssessment';
import CareerValuesAssessment from './CareerValuesAssessment';
import SkillsInterestsAssessment from './SkillsInterestsAssessment';
import ExperienceGoalsAssessment from './ExperienceGoalsAssessment';
import AssessmentResults from './AssessmentResults';
import { assessmentStorageService } from '../../services/assessment/assessment-storage.service';
import { 
  CareerAssessmentData, 
  PersonalityTraits,
  WorkStylePreferences,
  WorkEnvironmentPreferences,
  CareerValues,
  SkillsAndInterests,
  ExperienceAndGoals
} from '../../services/types/assessment.types';

interface CareerAssessmentFormProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (results: CareerAssessmentData) => void;
}

const CareerAssessmentForm: React.FC<CareerAssessmentFormProps> = ({
  open,
  onClose,
  onComplete
}) => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<Partial<CareerAssessmentData>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [saveProgress, setSaveProgress] = useState(false);

  const steps = [
    {
      label: 'Personality Profile',
      icon: <Psychology />,
      description: 'Understand your personality traits and working style',
      estimatedMinutes: 5
    },
    {
      label: 'Work Style',
      icon: <Work />,
      description: 'How you prefer to work and make decisions',
      estimatedMinutes: 3
    },
    {
      label: 'Work Environment',
      icon: <Business />,
      description: 'Your ideal work setting and company culture',
      estimatedMinutes: 3
    },
    {
      label: 'Career Values',
      icon: <EmojiEvents />,
      description: 'What matters most to you in your career',
      estimatedMinutes: 4
    },
    {
      label: 'Skills & Interests',
      icon: <School />,
      description: 'Your abilities and areas of interest',
      estimatedMinutes: 5
    },
    {
      label: 'Experience & Goals',
      icon: <TrendingUp />,
      description: 'Your background and career aspirations',
      estimatedMinutes: 3
    }
  ];

  const totalMinutes = steps.reduce((total, step) => total + step.estimatedMinutes, 0);
  const completedMinutes = steps.slice(0, activeStep).reduce((total, step) => total + step.estimatedMinutes, 0);
  const progressPercentage = (activeStep / steps.length) * 100;

  useEffect(() => {
    if (!currentUser) return;
    
    // Initialize assessment data with user ID
    setAssessmentData(prev => ({
      ...prev,
      userId: currentUser.uid,
      assessmentVersion: '1.0'
    }));
  }, [currentUser]);

  const handleStepComplete = async (stepData: any, stepIndex: number) => {
    const updatedData = { ...assessmentData };
    
    switch (stepIndex) {
      case 0:
        updatedData.personalityTraits = stepData as PersonalityTraits;
        break;
      case 1:
        updatedData.workStylePreferences = stepData as WorkStylePreferences;
        break;
      case 2:
        updatedData.workEnvironmentPreferences = stepData as WorkEnvironmentPreferences;
        break;
      case 3:
        updatedData.careerValues = stepData as CareerValues;
        break;
      case 4:
        updatedData.skillsAndInterests = stepData as SkillsAndInterests;
        break;
      case 5:
        updatedData.experienceAndGoals = stepData as ExperienceAndGoals;
        break;
    }
    
    setAssessmentData(updatedData);
    
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Assessment completed
      const completedAssessment: CareerAssessmentData = {
        ...updatedData,
        completedAt: new Date()
      } as CareerAssessmentData;
      
      // Save assessment data to Firestore
      try {
        await assessmentStorageService.saveAssessment(completedAssessment);
        console.log('Assessment data saved successfully');
      } catch (error) {
        console.error('Failed to save assessment data:', error);
        // Continue with completion even if save fails
      }
      
      setIsCompleted(true);
      onComplete?.(completedAssessment);
    }
  };

  const handleBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };

  const handleSaveAndExit = () => {
    setSaveProgress(true);
    // In a real app, save to database here
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const renderStepContent = (stepIndex: number) => {
    const onCompleteHandler = (data: any) => handleStepComplete(data, stepIndex);
    const onBackHandler = stepIndex > 0 ? handleBack : undefined;

    switch (stepIndex) {
      case 0:
        return (
          <PersonalityAssessment
            onComplete={onCompleteHandler}
            onBack={onBackHandler}
            initialData={assessmentData.personalityTraits}
          />
        );
      case 1:
        return (
          <WorkStyleAssessment
            onComplete={onCompleteHandler}
            onBack={onBackHandler}
            initialData={assessmentData.workStylePreferences}
          />
        );
      case 2:
        return (
          <WorkEnvironmentAssessment
            onComplete={onCompleteHandler}
            onBack={onBackHandler}
            initialData={assessmentData.workEnvironmentPreferences}
          />
        );
      case 3:
        return (
          <CareerValuesAssessment
            onComplete={onCompleteHandler}
            onBack={onBackHandler}
            initialData={assessmentData.careerValues}
          />
        );
      case 4:
        return (
          <SkillsInterestsAssessment
            onComplete={onCompleteHandler}
            onBack={onBackHandler}
            initialData={assessmentData.skillsAndInterests}
          />
        );
      case 5:
        return (
          <ExperienceGoalsAssessment
            onComplete={onCompleteHandler}
            onBack={onBackHandler}
            initialData={assessmentData.experienceAndGoals}
          />
        );
      default:
        return null;
    }
  };


  if (isCompleted) {
    return (
      <Dialog open={open} maxWidth="lg" fullWidth>
        <AssessmentResults 
          assessmentData={assessmentData as CareerAssessmentData}
          onClose={onClose}
          onRetake={() => {
            setIsCompleted(false);
            setActiveStep(0);
            setAssessmentData({ userId: currentUser?.uid, assessmentVersion: '1.0' });
          }}
        />
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Career Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover careers that match your personality and preferences
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveAndExit}
              disabled={saveProgress}
            >
              {saveProgress ? 'Saving...' : 'Save & Exit'}
            </Button>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Progress Section */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ~{totalMinutes - completedMinutes} min remaining
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 6, borderRadius: 3, mb: 2 }}
          />
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-iconContainer': {
                      color: index <= activeStep ? 'primary.main' : 'text.disabled'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' } }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Current Step Content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Fade in={true} timeout={300}>
            <Box>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Box sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}>
                  {steps[activeStep].icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {steps[activeStep].label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {steps[activeStep].description}
                </Typography>
              </Box>
              
              {renderStepContent(activeStep)}
            </Box>
          </Fade>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CareerAssessmentForm;