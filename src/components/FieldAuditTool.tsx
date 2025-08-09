import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Career, careerService, careerFieldsService, CAREER_FIELDS, CareerFieldKey } from '../services';

const FieldAuditTool: React.FC = () => {
  const [selectedField, setSelectedField] = useState<CareerFieldKey | ''>('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCareers, setSelectedCareers] = useState<Set<string>>(new Set());
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [fieldsToAdd, setFieldsToAdd] = useState<CareerFieldKey[]>([]);
  const [fieldsToRemove, setFieldsToRemove] = useState<CareerFieldKey[]>([]);

  const loadFieldCareers = async (fieldKey: CareerFieldKey) => {
    try {
      setLoading(true);
      setError('');
      const fieldCareers = await careerFieldsService.getCareersByField(fieldKey);
      setCareers(fieldCareers);
    } catch (error) {
      console.error('Error loading field careers:', error);
      setError('Failed to load careers for this field');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldKey: CareerFieldKey | string) => {
    if (fieldKey && fieldKey !== '') {
      setSelectedField(fieldKey as CareerFieldKey);
      loadFieldCareers(fieldKey as CareerFieldKey);
    } else {
      setSelectedField('');
      setCareers([]);
    }
    setSelectedCareers(new Set());
  };

  const toggleCareerSelection = (careerId: string) => {
    const newSelected = new Set(selectedCareers);
    if (newSelected.has(careerId)) {
      newSelected.delete(careerId);
    } else {
      newSelected.add(careerId);
    }
    setSelectedCareers(newSelected);
  };

  const selectAllCareers = () => {
    if (selectedCareers.size === careers.length) {
      setSelectedCareers(new Set());
    } else {
      setSelectedCareers(new Set(careers.map(c => c.id)));
    }
  };

  const removeFieldFromCareer = async (career: Career, fieldToRemove: CareerFieldKey) => {
    try {
      const updatedFields = career.fields?.filter(f => f !== fieldToRemove) || [];
      await careerService.updateCareer(career.id, { fields: updatedFields });
      
      // Reload the field careers
      if (selectedField) {
        loadFieldCareers(selectedField);
      }
    } catch (error) {
      console.error('Error removing field from career:', error);
      setError('Failed to remove field from career');
    }
  };

  const handleBulkEdit = () => {
    setBulkEditOpen(true);
    setFieldsToAdd([]);
    setFieldsToRemove([]);
  };

  const executeBulkEdit = async () => {
    try {
      setLoading(true);
      
      for (const careerId of Array.from(selectedCareers)) {
        const career = careers.find(c => c.id === careerId);
        if (!career) continue;
        
        let updatedFields = [...(career.fields || [])];
        
        // Remove fields
        for (const fieldToRemove of fieldsToRemove) {
          updatedFields = updatedFields.filter(f => f !== fieldToRemove);
        }
        
        // Add fields (avoid duplicates)
        for (const fieldToAdd of fieldsToAdd) {
          if (!updatedFields.includes(fieldToAdd)) {
            updatedFields.push(fieldToAdd);
          }
        }
        
        await careerService.updateCareer(careerId, { fields: updatedFields });
      }
      
      // Reload the field careers
      if (selectedField) {
        loadFieldCareers(selectedField);
      }
      
      setBulkEditOpen(false);
      setSelectedCareers(new Set());
    } catch (error) {
      console.error('Error in bulk edit:', error);
      setError('Failed to perform bulk edit');
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldForBulkAdd = (fieldKey: CareerFieldKey) => {
    setFieldsToAdd(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const toggleFieldForBulkRemove = (fieldKey: CareerFieldKey) => {
    setFieldsToRemove(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Career Field Audit Tool
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review careers by field and fix incorrect field assignments. Use this tool to clean up careers that appear in wrong categories.
      </Typography>

      {/* Field Selector */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <FormControl fullWidth>
          <InputLabel>Select Field to Audit</InputLabel>
          <Select
            value={selectedField || ''}
            label="Select Field to Audit"
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            <MenuItem value="">
              <em>Choose a field</em>
            </MenuItem>
            {Object.entries(CAREER_FIELDS).map(([fieldKey, fieldInfo]) => (
              <MenuItem key={fieldKey} value={fieldKey}>
                {fieldInfo.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedField && careers.length > 0 ? (
        <>
          {/* Bulk Actions */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={selectAllCareers}
              size="small"
            >
              {selectedCareers.size === careers.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedCareers.size > 0 && (
              <>
                <Typography variant="body2">
                  {selectedCareers.size} career(s) selected
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleBulkEdit}
                  size="small"
                >
                  Bulk Edit Fields
                </Button>
              </>
            )}
          </Box>

          {/* Careers Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Career Title</TableCell>
                  <TableCell>All Fields</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {careers.map((career) => (
                  <TableRow key={career.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCareers.has(career.id)}
                        onChange={() => toggleCareerSelection(career.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {career.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {career.description.substring(0, 100)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {career.fields?.map((fieldKey) => (
                          <Chip
                            key={fieldKey}
                            label={CAREER_FIELDS[fieldKey].name}
                            size="small"
                            color={fieldKey === selectedField ? 'primary' : 'default'}
                            onDelete={() => removeFieldFromCareer(career, fieldKey)}
                            deleteIcon={<DeleteIcon />}
                          />
                        )) || (
                          <Typography variant="caption" color="text.secondary">
                            No fields assigned
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => window.open(`/careers/${career.id}`, '_blank')}
                        title="View Career"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : selectedField && careers.length === 0 && !loading ? (
        <Alert severity="info">
          No careers found in the "{CAREER_FIELDS[selectedField].name}" field.
        </Alert>
      ) : null}

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onClose={() => setBulkEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Bulk Edit Fields for {selectedCareers.size} Career(s)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Fields:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(CAREER_FIELDS).map(([fieldKey, fieldInfo]) => (
                <FormControlLabel
                  key={fieldKey}
                  control={
                    <Checkbox
                      checked={fieldsToAdd.includes(fieldKey as CareerFieldKey)}
                      onChange={() => toggleFieldForBulkAdd(fieldKey as CareerFieldKey)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {fieldInfo.name}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Remove Fields:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(CAREER_FIELDS).map(([fieldKey, fieldInfo]) => (
                <FormControlLabel
                  key={fieldKey}
                  control={
                    <Checkbox
                      checked={fieldsToRemove.includes(fieldKey as CareerFieldKey)}
                      onChange={() => toggleFieldForBulkRemove(fieldKey as CareerFieldKey)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {fieldInfo.name}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEditOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeBulkEdit} 
            variant="contained"
            disabled={fieldsToAdd.length === 0 && fieldsToRemove.length === 0}
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FieldAuditTool;