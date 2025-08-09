import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { Career, CareerSkill, careerService, CAREER_FIELDS, CareerFieldKey } from '../services';
import { suggestCareerField, suggestCareerFields, getFieldSuggestionReason } from '../utils/careerFieldSuggestions';

interface AdminCareerFormProps {
  open: boolean;
  onClose: () => void;
  career?: Career | null;
  onSave: () => void;
}

const AdminCareerForm: React.FC<AdminCareerFormProps> = ({
  open,
  onClose,
  career,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    onetCode: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    estimatedTimeToMaster: 24,
    jobOutlook: '',
    relatedCareers: [] as string[],
    skills: [] as CareerSkill[],
    fields: [] as CareerFieldKey[],
    averageSalary: {
      min: 0,
      max: 0,
      median: 0,
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    skillType: 'hard' as 'hard' | 'soft',
    proficiencyLevel: 3,
    isRequired: true,
    estimatedHours: 50,
  });
  const [newRelatedCareer, setNewRelatedCareer] = useState('');

  // Initialize form with career data if editing
  useEffect(() => {
    if (career) {
      // Handle both new fields array and legacy single field
      let currentFields: CareerFieldKey[] = [];
      
      if (career.fields && career.fields.length > 0) {
        currentFields = career.fields;
      } else if ((career as any).field) {
        // Convert legacy single field to array
        currentFields = [(career as any).field];
      } else {
        // Suggest multiple fields if career doesn't have any fields
        const suggestedFields = suggestCareerFields(career);
        if (suggestedFields.length > 0) {
          currentFields = suggestedFields;
        }
      }
      
      setFormData({
        title: career.title,
        description: career.description,
        onetCode: career.onetCode,
        difficulty: career.difficulty,
        estimatedTimeToMaster: career.estimatedTimeToMaster,
        jobOutlook: career.jobOutlook || '',
        relatedCareers: career.relatedCareers,
        skills: career.skills,
        fields: currentFields,
        averageSalary: career.averageSalary || { min: 0, max: 0, median: 0 },
      });
    } else {
      // Reset form for new career
      setFormData({
        title: '',
        description: '',
        onetCode: '',
        difficulty: 'intermediate',
        estimatedTimeToMaster: 24,
        jobOutlook: '',
        relatedCareers: [],
        skills: [],
        fields: [],
        averageSalary: { min: 0, max: 0, median: 0 },
      });
    }
    setError('');
  }, [career, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field: 'min' | 'max' | 'median', value: number) => {
    setFormData(prev => ({
      ...prev,
      averageSalary: {
        ...prev.averageSalary,
        [field]: value,
      },
    }));
  };

  const addSkill = () => {
    if (!newSkill.skillName.trim()) return;
    
    const skill: CareerSkill = {
      skillId: newSkill.skillName.toLowerCase().replace(/\s+/g, '-'),
      skillName: newSkill.skillName,
      skillType: newSkill.skillType,
      proficiencyLevel: newSkill.proficiencyLevel,
      isRequired: newSkill.isRequired,
      estimatedHours: newSkill.estimatedHours,
    };

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setNewSkill({
      skillName: '',
      skillType: 'hard',
      proficiencyLevel: 3,
      isRequired: true,
      estimatedHours: 50,
    });
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addRelatedCareer = () => {
    if (!newRelatedCareer.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      relatedCareers: [...prev.relatedCareers, newRelatedCareer],
    }));
    setNewRelatedCareer('');
  };

  const removeRelatedCareer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedCareers: prev.relatedCareers.filter((_, i) => i !== index),
    }));
  };

  const toggleField = (fieldKey: CareerFieldKey) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldKey)
        ? prev.fields.filter(f => f !== fieldKey)
        : [...prev.fields, fieldKey]
    }));
  };

  const removeField = (fieldKey: CareerFieldKey) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f !== fieldKey)
    }));
  };

  const handleSubmit = async () => {
    let careerData: any;
    
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Title and description are required');
        return;
      }

      careerData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        onetCode: formData.onetCode.trim(),
        difficulty: formData.difficulty,
        estimatedTimeToMaster: formData.estimatedTimeToMaster,
        jobOutlook: formData.jobOutlook.trim() || undefined,
        relatedCareers: formData.relatedCareers,
        skills: formData.skills,
        fields: formData.fields.length > 0 ? formData.fields : undefined,
        averageSalary: formData.averageSalary.min > 0 ? formData.averageSalary : undefined,
      };

      if (career) {
        // Update existing career
        await careerService.updateCareer(career.id, careerData);
        
        // Clean up legacy field property if it exists
        if ((career as any).field && !career.fields) {
          await careerService.removeLegacyField(career.id);
        }
      } else {
        // Create new career
        await careerService.createCareer(careerData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving career:', error);
      if (careerData) {
        console.error('Career data being saved:', careerData);
      }
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save career. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Permission denied. Please check your admin permissions.';
        } else if (error.message.includes('invalid-argument')) {
          errorMessage = 'Invalid data format. Please check all fields are properly filled.';
        } else if (error.message.includes('not-found')) {
          errorMessage = 'Career not found. It may have been deleted by another admin.';
        } else {
          errorMessage = `Failed to save career: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {career ? 'Edit Career' : 'Add New Career'}
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Career Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="O*NET Code"
              value={formData.onetCode}
              onChange={(e) => handleInputChange('onetCode', e.target.value)}
              placeholder="e.g., 15-1252.00"
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                value={formData.difficulty}
                label="Difficulty Level"
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Career Fields Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Career Fields ({formData.fields.length})
            </Typography>
            
            {/* Selected Fields Display */}
            {formData.fields.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Fields:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.fields.map((fieldKey) => (
                    <Chip
                      key={fieldKey}
                      label={CAREER_FIELDS[fieldKey].name}
                      onDelete={() => removeField(fieldKey)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Field Selection Checkboxes */}
            <Typography variant="subtitle2" gutterBottom>
              Available Fields:
            </Typography>
            <Grid container spacing={1} sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {Object.entries(CAREER_FIELDS).map(([fieldKey, fieldInfo]) => (
                <Grid item xs={12} sm={6} key={fieldKey}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.fields.includes(fieldKey as CareerFieldKey)}
                        onChange={() => toggleField(fieldKey as CareerFieldKey)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {fieldInfo.name}
                      </Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
            
            {career && !career.fields && !(career as any).field && formData.fields.length > 0 && (
              <Typography variant="caption" color="info.main" sx={{ mt: 1, display: 'block' }}>
                💡 Suggested fields based on career title and description. You can modify these selections as needed.
              </Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Time to Master (months)"
              value={formData.estimatedTimeToMaster}
              onChange={(e) => handleInputChange('estimatedTimeToMaster', parseInt(e.target.value) || 0)}
              inputProps={{ min: 1, max: 120 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Outlook"
              value={formData.jobOutlook}
              onChange={(e) => handleInputChange('jobOutlook', e.target.value)}
              placeholder="e.g., Faster than average growth (8% from 2021-2031)"
            />
          </Grid>

          {/* Salary Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Salary Information (Optional)
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Salary ($)"
              value={formData.averageSalary.min}
              onChange={(e) => handleSalaryChange('min', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Salary ($)"
              value={formData.averageSalary.max}
              onChange={(e) => handleSalaryChange('max', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Median Salary ($)"
              value={formData.averageSalary.median}
              onChange={(e) => handleSalaryChange('median', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>

        {/* Skills Section */}
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Skills ({formData.skills.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Add New Skill */}
            <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Add New Skill
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Skill Name"
                    value={newSkill.skillName}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, skillName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newSkill.skillType}
                      label="Type"
                      onChange={(e) => setNewSkill(prev => ({ ...prev, skillType: e.target.value as 'hard' | 'soft' }))}
                    >
                      <MenuItem value="hard">Hard</MenuItem>
                      <MenuItem value="soft">Soft</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Level (1-5)"
                    value={newSkill.proficiencyLevel}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, proficiencyLevel: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1, max: 5 }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Hours"
                    value={newSkill.estimatedHours}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Required</InputLabel>
                    <Select
                      value={newSkill.isRequired.toString()}
                      label="Required"
                      onChange={(e) => setNewSkill(prev => ({ ...prev, isRequired: e.target.value === 'true' }))}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={addSkill} color="primary">
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>

            {/* Skills List */}
            {formData.skills.map((skill, index) => (
              <Chip
                key={index}
                label={`${skill.skillName} (${skill.skillType}, Level ${skill.proficiencyLevel})`}
                onDelete={() => removeSkill(index)}
                sx={{ m: 0.5 }}
                color={skill.isRequired ? 'primary' : 'default'}
              />
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Related Careers Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Related Careers ({formData.relatedCareers.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Add Related Career"
                value={newRelatedCareer}
                onChange={(e) => setNewRelatedCareer(e.target.value)}
              />
              <Button onClick={addRelatedCareer} variant="outlined" startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
            {formData.relatedCareers.map((career, index) => (
              <Chip
                key={index}
                label={career}
                onDelete={() => removeRelatedCareer(index)}
                sx={{ m: 0.5 }}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (career ? 'Update Career' : 'Create Career')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminCareerForm;