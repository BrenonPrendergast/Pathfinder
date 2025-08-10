import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Psychology,
  Code,
  School,
  TrendingUp,
  Assessment,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { 
  skillService, 
  hardSkillsService, 
  onetIntegrationService,
  certificationService 
} from '../../services';
import { SkillType, SkillCategory, SkillProficiencyLevel } from '../../services/types/skill.types';

interface SkillManagementProps {}

const SkillManagement: React.FC<SkillManagementProps> = () => {
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [softSkills, setSoftSkills] = useState<any[]>([]);
  const [hardSkills, setHardSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<any>(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [importingCSV, setImportingCSV] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string>('');
  const [seedingStatus, setSeedingStatus] = useState<string>('');
  const [seeding, setSeeding] = useState(false);

  // Form state for skill creation/editing
  const [skillForm, setSkillForm] = useState({
    name: '',
    description: '',
    category: SkillCategory.TECHNICAL,
    type: SkillType.HARD,
    prerequisites: [] as string[],
    relatedCareers: [] as string[],
    onetCode: '',
    estimatedHoursToMaster: 40,
  });

  // Load skills data
  useEffect(() => {
    loadSkillsData();
  }, []);

  const loadSkillsData = async () => {
    try {
      setLoading(true);
      
      // Load soft skills
      const softSkillsTree = await skillService.getSoftSkillsTree('admin-view');
      setSoftSkills(softSkillsTree.map(node => node.skill));
      
      // Load hard skills (O*NET based)
      const hardSkillsData = await hardSkillsService.getAllHardSkills();
      setHardSkills(hardSkillsData);
      
      // Load certifications
      const certificationsData = await certificationService.getAllCertifications();
      setCertifications(certificationsData);
    } catch (error) {
      console.error('Error loading skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSearchTerm(''); // Clear search when switching tabs
  };

  // Handle skill form submission
  const handleSkillSave = async () => {
    try {
      if (tabValue === 0) {
        // Soft skills
        if (editingSkill) {
          await skillService.updateSoftSkill(editingSkill.id, skillForm);
        } else {
          await skillService.createSoftSkill(skillForm);
        }
      } else if (tabValue === 1) {
        // Hard skills - Note: O*NET skills are read-only, but we can create custom ones
        if (editingSkill) {
          await skillService.updateHardSkill(editingSkill.id, skillForm);
        } else {
          await skillService.createHardSkill(skillForm);
        }
      }
      
      await loadSkillsData();
      handleFormClose();
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  // Handle skill deletion
  const handleDeleteSkill = (skill: any) => {
    setSkillToDelete(skill);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSkill = async () => {
    if (skillToDelete) {
      try {
        if (tabValue === 0) {
          await skillService.deleteSoftSkill(skillToDelete.id);
        } else if (tabValue === 1) {
          await skillService.deleteHardSkill(skillToDelete.id);
        } else if (tabValue === 2) {
          await certificationService.removeUserCertification('admin', skillToDelete.id);
        }
        
        await loadSkillsData();
        setDeleteConfirmOpen(false);
        setSkillToDelete(null);
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  // Handle skill editing
  const handleEditSkill = (skill: any) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      description: skill.description,
      category: skill.category || SkillCategory.TECHNICAL,
      type: skill.type || SkillType.HARD,
      prerequisites: skill.prerequisites || [],
      relatedCareers: skill.relatedCareers || [],
      onetCode: skill.onetCode || '',
      estimatedHoursToMaster: skill.estimatedHoursToMaster || 40,
    });
    setSkillFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setSkillFormOpen(false);
    setEditingSkill(null);
    setSkillForm({
      name: '',
      description: '',
      category: SkillCategory.TECHNICAL,
      type: SkillType.HARD,
      prerequisites: [],
      relatedCareers: [],
      onetCode: '',
      estimatedHoursToMaster: 40,
    });
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      setCsvStatus('Exporting skills to CSV...');
      
      let dataToExport: any[] = [];
      let filename = '';
      
      if (tabValue === 0) {
        dataToExport = softSkills;
        filename = 'soft-skills';
      } else if (tabValue === 1) {
        dataToExport = hardSkills;
        filename = 'hard-skills';
      } else if (tabValue === 2) {
        dataToExport = certifications;
        filename = 'certifications';
      }
      
      // Create CSV content
      const headers = ['ID', 'Name', 'Description', 'Category', 'Type', 'Prerequisites', 'Related Careers'];
      const csvRows = [headers.join(',')];
      
      dataToExport.forEach(item => {
        const row = [
          item.id,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.description.replace(/"/g, '""')}"`,
          item.category || '',
          item.type || '',
          `"${(item.prerequisites || []).join(';')}"`,
          `"${(item.relatedCareers || item.skillsUnlocked || []).join(';')}"`,
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pathfinder-${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCsvStatus(`Successfully exported ${dataToExport.length} items to CSV file.`);
      setTimeout(() => setCsvStatus(''), 5000);
    } catch (error) {
      console.error('CSV export error:', error);
      setCsvStatus('Failed to export data. Please try again.');
      setTimeout(() => setCsvStatus(''), 5000);
    } finally {
      setExportingCSV(false);
    }
  };

  // Handle data seeding
  const handleSeedData = async () => {
    try {
      setSeeding(true);
      
      if (tabValue === 1) {
        setSeedingStatus('Seeding O*NET hard skills database...');
        await hardSkillsService.seedHardSkills();
        setSeedingStatus('Successfully seeded O*NET hard skills!');
      } else if (tabValue === 2) {
        setSeedingStatus('Seeding professional certifications database...');
        await certificationService.seedCertifications();
        setSeedingStatus('Successfully seeded professional certifications!');
      }
      
      await loadSkillsData();
      setTimeout(() => setSeedingStatus(''), 5000);
    } catch (error) {
      console.error('Seeding error:', error);
      setSeedingStatus('Failed to seed data. Please try again.');
      setTimeout(() => setSeedingStatus(''), 5000);
    } finally {
      setSeeding(false);
    }
  };

  // Get current data based on tab
  const getCurrentData = () => {
    if (tabValue === 0) return softSkills;
    if (tabValue === 1) return hardSkills;
    if (tabValue === 2) return certifications;
    return [];
  };

  // Filter data based on search term
  const filteredData = getCurrentData().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.provider && item.provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'technical':
      case 'programming languages':
      case 'web frameworks': return 'primary';
      case 'analytical':
      case 'data science': return 'info';
      case 'foundational': return 'success';
      case 'leadership': return 'warning';
      case 'interpersonal': return 'secondary';
      default: return 'default';
    }
  };

  // Render data table
  const renderDataTable = () => {
    const currentData = filteredData;
    const isHardSkillsTab = tabValue === 1;
    const isCertificationsTab = tabValue === 2;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category{isCertificationsTab && '/Provider'}</TableCell>
              {!isCertificationsTab && <TableCell>Type</TableCell>}
              {isHardSkillsTab && <TableCell>Market Demand</TableCell>}
              {isCertificationsTab && <TableCell>Skills Unlocked</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      backgroundColor: isCertificationsTab ? 'warning.main' : 
                                     tabValue === 0 ? 'secondary.main' : 'primary.main'
                    }}>
                      {isCertificationsTab ? <School /> :
                       tabValue === 0 ? <Psychology /> : <Code />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description.length > 80 
                          ? `${item.description.substring(0, 80)}...` 
                          : item.description}
                      </Typography>
                      {isHardSkillsTab && item.onetCodes && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ 
                            backgroundColor: 'grey.100', 
                            px: 1, 
                            py: 0.25, 
                            borderRadius: 0.5,
                            fontSize: '0.7rem'
                          }}>
                            O*NET: {item.onetCodes.slice(0, 2).join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={isCertificationsTab ? item.provider : item.category?.replace(/_/g, ' ')}
                    size="small"
                    color={getCategoryColor(item.category) as any}
                  />
                </TableCell>
                {!isCertificationsTab && (
                  <TableCell>
                    <Typography variant="body2">
                      {item.type?.replace(/_/g, ' ') || 'N/A'}
                    </Typography>
                  </TableCell>
                )}
                {isHardSkillsTab && (
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.marketDemand || 50}
                        sx={{ width: 60, height: 6 }}
                        color={
                          (item.marketDemand || 50) > 80 ? 'success' :
                          (item.marketDemand || 50) > 60 ? 'warning' : 'error'
                        }
                      />
                      <Typography variant="caption">
                        {item.marketDemand || 50}%
                      </Typography>
                    </Box>
                  </TableCell>
                )}
                {isCertificationsTab && (
                  <TableCell>
                    <Typography variant="body2">
                      {item.skillsUnlocked?.length || 0} skills (+{item.skillBoostAmount || 1} levels)
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Tooltip title={`Edit ${isCertificationsTab ? 'Certification' : 'Skill'}`}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditSkill(item)}
                      color="primary"
                      disabled={isHardSkillsTab && item.onetCodes} // O*NET skills are read-only
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${isCertificationsTab ? 'Certification' : 'Skill'}`}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteSkill(item)}
                      color="error"
                      disabled={isHardSkillsTab && item.onetCodes} // O*NET skills are read-only
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Loading Skills Data...</Typography>
              <LinearProgress sx={{ width: 200 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Skill Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={exportingCSV}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {exportingCSV ? 'Exporting...' : 'Export CSV'}
            </Button>
            
            {(tabValue === 1 || tabValue === 2) && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleSeedData}
                disabled={seeding}
                size="small"
                color="secondary"
                sx={{ minWidth: 120 }}
              >
                {seeding ? 'Seeding...' : 'Seed Data'}
              </Button>
            )}
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSkillFormOpen(true)}
              size="small"
              disabled={tabValue === 1} // O*NET skills are managed automatically
            >
              Add {tabValue === 0 ? 'Skill' : tabValue === 1 ? 'Custom Skill' : 'Certification'}
            </Button>
          </Box>
        </Box>

        {csvStatus && (
          <Alert 
            severity={csvStatus.includes('Failed') ? 'error' : 'success'} 
            sx={{ mb: 2 }}
          >
            {csvStatus}
          </Alert>
        )}

        {seedingStatus && (
          <Alert 
            severity={seedingStatus.includes('Failed') ? 'error' : 'success'} 
            sx={{ mb: 2 }}
          >
            {seedingStatus}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<Psychology />} 
              label={`Soft Skills (${softSkills.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<Code />} 
              label={`Hard Skills (${hardSkills.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<School />} 
              label={`Certifications (${certifications.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {tabValue === 0 && (
              <><strong>Soft Skills:</strong> Manage universal skills like communication, leadership, and problem-solving. These skills apply across all careers.</>
            )}
            {tabValue === 1 && (
              <><strong>Hard Skills:</strong> Technical skills from O*NET database with market demand data. O*NET skills are read-only but you can create custom skills.</>
            )}
            {tabValue === 2 && (
              <><strong>Certifications:</strong> Professional certifications that unlock and advance related skills. Import industry-standard certifications or create custom ones.</>
            )}
          </Typography>
        </Alert>

        <TextField
          fullWidth
          placeholder={`Search ${tabValue === 0 ? 'soft skills' : tabValue === 1 ? 'hard skills' : 'certifications'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        {renderDataTable()}

        {filteredData.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No {tabValue === 0 ? 'soft skills' : tabValue === 1 ? 'hard skills' : 'certifications'} found.
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Skill Form Dialog */}
      <Dialog open={skillFormOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSkill ? `Edit ${tabValue === 0 ? 'Skill' : 'Item'}` : `Create New ${tabValue === 0 ? 'Skill' : 'Item'}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={skillForm.description}
                onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value as SkillCategory })}
                  label="Category"
                >
                  {Object.values(SkillCategory).map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={skillForm.type}
                  onChange={(e) => setSkillForm({ ...skillForm, type: e.target.value as SkillType })}
                  label="Type"
                >
                  {Object.values(SkillType).map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="O*NET Code (Optional)"
                value={skillForm.onetCode}
                onChange={(e) => setSkillForm({ ...skillForm, onetCode: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Estimated Hours to Master"
                type="number"
                value={skillForm.estimatedHoursToMaster}
                onChange={(e) => setSkillForm({ ...skillForm, estimatedHoursToMaster: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
          <Button 
            onClick={handleSkillSave} 
            variant="contained"
            disabled={!skillForm.name || !skillForm.description}
          >
            {editingSkill ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{skillToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteSkill} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SkillManagement;