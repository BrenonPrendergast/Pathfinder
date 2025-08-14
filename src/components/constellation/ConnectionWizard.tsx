import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  Link,
  Mouse,
  DragIndicator,
  TouchApp,
  CheckCircle,
  Warning,
  Info,
  PlayArrow,
  KeyboardArrowRight,
} from '@mui/icons-material';

interface ConnectionWizardProps {
  open: boolean;
  onClose: () => void;
  onStartConnectionMode: () => void;
}

const ConnectionWizard: React.FC<ConnectionWizardProps> = ({
  open,
  onClose,
  onStartConnectionMode,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Understanding Skill Connections',
      description: 'Learn what skill prerequisites are and why they matter',
    },
    {
      label: 'Creating Connections',
      description: 'Step-by-step guide to linking skills together',
    },
    {
      label: 'Managing Connections',
      description: 'Edit, remove, and organize skill relationships',
    },
    {
      label: 'Best Practices',
      description: 'Tips for creating effective skill trees',
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStartPractice = () => {
    onStartConnectionMode();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link />
          <Typography variant="h6">Connection Tutorial</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Understanding Skill Connections</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      What are skill prerequisites?
                    </Typography>
                    <Typography variant="body2">
                      Prerequisites are skills that must be learned before another skill becomes available. 
                      They create logical learning paths in your constellation.
                    </Typography>
                  </Alert>

                  <Typography variant="h6" gutterBottom>
                    Examples of Good Prerequisites:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Basic Math → Advanced Math"
                        secondary="Foundation skills come first"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="HTML → CSS → JavaScript"
                        secondary="Building complexity step by step"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Communication → Leadership"
                        secondary="Soft skills building on each other"
                      />
                    </ListItem>
                  </List>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                    Continue
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Creating Connections</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Method 1: Drag and Drop (Recommended)
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><TouchApp color="primary" /></ListItemIcon>
                        <ListItemText primary="Click and hold on the prerequisite skill" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DragIndicator color="primary" /></ListItemIcon>
                        <ListItemText primary="Drag to the dependent skill" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Link color="primary" /></ListItemIcon>
                        <ListItemText primary="Release to create the connection" />
                      </ListItem>
                    </List>
                  </Paper>

                  <Typography variant="h6" gutterBottom>
                    Method 2: Connection Mode
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0, 177, 98, 0.1)' }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Mouse color="success" /></ListItemIcon>
                        <ListItemText primary="Click the Connection Mode button in toolbar" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TouchApp color="success" /></ListItemIcon>
                        <ListItemText primary="Click the prerequisite skill first" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><KeyboardArrowRight color="success" /></ListItemIcon>
                        <ListItemText primary="Then click the dependent skill" />
                      </ListItem>
                    </List>
                  </Paper>

                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Direction Matters!</strong> Always connect FROM prerequisite TO dependent skill. 
                      Think: "You need A before you can learn B"
                    </Typography>
                  </Alert>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                    Continue
                  </Button>
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Managing Connections</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Connection Visual Indicators
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Active Connection" 
                      sx={{ backgroundColor: '#00B162', color: 'white' }}
                      size="small"
                    />
                    <Chip 
                      label="Available Connection" 
                      sx={{ backgroundColor: '#6366f1', color: 'white' }}
                      size="small"
                    />
                    <Chip 
                      label="Locked Connection" 
                      sx={{ backgroundColor: '#6b7280', color: 'white' }}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Editing Connections
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Select Connection"
                        secondary="Click on any connection line to select it"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Delete Connection"
                        secondary="Press Delete key or use right-click menu"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Multiple Selection"
                        secondary="Hold Shift to select multiple connections"
                      />
                    </ListItem>
                  </List>

                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Tip:</strong> Use the property panel on the right to see all connections 
                      for the currently selected skill.
                    </Typography>
                  </Alert>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                    Continue
                  </Button>
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Best Practices</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Creating Effective Skill Trees
                  </Typography>
                  
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>✓ DO</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Create logical learning progressions</li>
                      <li>Keep prerequisites minimal (1-3 per skill)</li>
                      <li>Group related skills by category</li>
                      <li>Test your skill tree with learners</li>
                      <li>Use clear, descriptive skill names</li>
                    </ul>
                  </Alert>

                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>✗ DON'T</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Create circular dependencies</li>
                      <li>Make every skill require many prerequisites</li>
                      <li>Skip foundational skills</li>
                      <li>Create isolated skill islands</li>
                      <li>Forget to save your changes</li>
                    </ul>
                  </Alert>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Keyboard Shortcuts
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(31, 41, 55, 0.5)' }}>
                    <Typography variant="body2" component="div">
                      <strong>Delete:</strong> Remove selected skills/connections<br/>
                      <strong>Ctrl+Z:</strong> Undo last action<br/>
                      <strong>Ctrl+Y:</strong> Redo last action<br/>
                      <strong>Shift+Click:</strong> Multi-select items<br/>
                      <strong>Right-Click:</strong> Context menu
                    </Typography>
                  </Paper>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={handleStartPractice}
                    startIcon={<PlayArrow />}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Start Creating Connections
                  </Button>
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close Tutorial</Button>
        {activeStep < steps.length - 1 && (
          <Button variant="contained" onClick={handleNext}>
            Next Step
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionWizard;