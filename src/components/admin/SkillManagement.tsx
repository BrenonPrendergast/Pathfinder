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
  certificationService,
  careerService 
} from '../../services';
import type { Career, CareerSkill } from '../../services/types';
import { SkillType, SkillCategory, SkillProficiencyLevel } from '../../services/types/skill.types';

interface SkillManagementProps {}

const SkillManagement: React.FC<SkillManagementProps> = () => {
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [careerSkills, setCareerSkills] = useState<CareerSkill[]>([]);
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
    pathfinderCode: '',
    estimatedHoursToMaster: 40,
    // Career-specific fields
    proficiencyLevel: 3,
    isRequired: true,
  });

  // Load skills data
  useEffect(() => {
    loadSkillsData();
    loadCareers();
  }, []);

  const loadSkillsData = async () => {
    try {
      setLoading(true);
      
      // Load soft skills
      const softSkillsData = await skillService.getAllSoftSkills();
      setSoftSkills(softSkillsData);
      
      // Load hard skills (Pathfinder database)
      let hardSkillsData = await hardSkillsService.getAllHardSkills();
      
      // Auto-seed hard skills if empty
      if (hardSkillsData.length === 0) {
        setSeedingStatus('Auto-seeding hard skills database...');
        setSeeding(true);
        try {
          await hardSkillsService.seedHardSkills();
          hardSkillsData = await hardSkillsService.getAllHardSkills();
          setSeedingStatus('Successfully auto-seeded hard skills!');
          setTimeout(() => setSeedingStatus(''), 3000);
        } catch (seedError) {
          console.error('Error seeding hard skills:', seedError);
          setSeedingStatus('Failed to seed hard skills');
          setTimeout(() => setSeedingStatus(''), 3000);
        } finally {
          setSeeding(false);
        }
      }
      setHardSkills(hardSkillsData);
      
      // Load certifications
      let certificationsData = await certificationService.getAllCertifications();
      
      // Auto-seed certifications if empty
      if (certificationsData.length === 0) {
        setSeedingStatus('Auto-seeding certifications database...');
        setSeeding(true);
        try {
          await certificationService.seedCertifications();
          certificationsData = await certificationService.getAllCertifications();
          setSeedingStatus('Successfully auto-seeded certifications!');
          setTimeout(() => setSeedingStatus(''), 3000);
        } catch (seedError) {
          console.error('Error seeding certifications:', seedError);
          setSeedingStatus('Failed to seed certifications');
          setTimeout(() => setSeedingStatus(''), 3000);
        } finally {
          setSeeding(false);
        }
      }
      setCertifications(certificationsData);
    } catch (error) {
      console.error('Error loading skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load careers for career-skill association management
  const loadCareers = async () => {
    try {
      const response = await careerService.getCareers(1000); // Get all careers
      setCareers(response.careers);
    } catch (error) {
      console.error('Error loading careers:', error);
    }
  };

  // Load skills for selected career
  const loadCareerSkills = async (career: Career) => {
    try {
      setSelectedCareer(career);
      setCareerSkills(career.skills || []);
    } catch (error) {
      console.error('Error loading career skills:', error);
    }
  };

  // Add skill to career
  const handleAddSkillToCareer = async (skillData: CareerSkill) => {
    if (!selectedCareer) return;
    
    try {
      const updatedSkills = [...careerSkills, skillData];
      await careerService.updateCareer(selectedCareer.id, {
        skills: updatedSkills
      });
      setCareerSkills(updatedSkills);
      
      // Update local career state
      setCareers(prev => prev.map(c => 
        c.id === selectedCareer.id 
          ? { ...c, skills: updatedSkills }
          : c
      ));
      
      setCsvStatus('Successfully added skill to career!');
      setTimeout(() => setCsvStatus(''), 3000);
    } catch (error) {
      console.error('Error adding skill to career:', error);
      setCsvStatus('Failed to add skill to career.');
      setTimeout(() => setCsvStatus(''), 3000);
    }
  };

  // Remove skill from career
  const handleRemoveSkillFromCareer = async (skillIndex: number) => {
    if (!selectedCareer) return;
    
    try {
      const updatedSkills = careerSkills.filter((_, index) => index !== skillIndex);
      await careerService.updateCareer(selectedCareer.id, {
        skills: updatedSkills
      });
      setCareerSkills(updatedSkills);
      
      // Update local career state
      setCareers(prev => prev.map(c => 
        c.id === selectedCareer.id 
          ? { ...c, skills: updatedSkills }
          : c
      ));
      
      setCsvStatus('Successfully removed skill from career!');
      setTimeout(() => setCsvStatus(''), 3000);
    } catch (error) {
      console.error('Error removing skill from career:', error);
      setCsvStatus('Failed to remove skill from career.');
      setTimeout(() => setCsvStatus(''), 3000);
    }
  };

  // Update skill in career
  const handleUpdateCareerSkill = async (skillIndex: number, updatedSkill: CareerSkill) => {
    if (!selectedCareer) return;
    
    try {
      const updatedSkills = careerSkills.map((skill, index) => 
        index === skillIndex ? updatedSkill : skill
      );
      await careerService.updateCareer(selectedCareer.id, {
        skills: updatedSkills
      });
      setCareerSkills(updatedSkills);
      
      // Update local career state
      setCareers(prev => prev.map(c => 
        c.id === selectedCareer.id 
          ? { ...c, skills: updatedSkills }
          : c
      ));
      
      setCsvStatus('Successfully updated skill in career!');
      setTimeout(() => setCsvStatus(''), 3000);
    } catch (error) {
      console.error('Error updating career skill:', error);
      setCsvStatus('Failed to update skill in career.');
      setTimeout(() => setCsvStatus(''), 3000);
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
        // Hard skills - Create custom hard skills for your Pathfinder database
        if (editingSkill) {
          await skillService.updateHardSkill(editingSkill.id, skillForm);
        } else {
          await skillService.createHardSkill(skillForm);
        }
      } else if (tabValue === 3 && selectedCareer) {
        // Career skills
        const careerSkill: CareerSkill = {
          skillId: skillForm.name.toLowerCase().replace(/\s+/g, '_'),
          skillName: skillForm.name,
          skillType: skillForm.type === SkillType.SOFT ? 'soft' : skillForm.type === SkillType.HARD ? 'hard' : 'transferable',
          proficiencyLevel: skillForm.proficiencyLevel,
          isRequired: skillForm.isRequired,
          estimatedHours: skillForm.estimatedHoursToMaster,
        };
        
        if (editingSkill && typeof editingSkill.index === 'number') {
          // Update existing skill
          await handleUpdateCareerSkill(editingSkill.index, careerSkill);
        } else {
          // Add new skill
          await handleAddSkillToCareer(careerSkill);
        }
      }
      
      if (tabValue !== 3) {
        await loadSkillsData();
      }
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
        } else if (tabValue === 3 && typeof skillToDelete.index === 'number') {
          // Remove skill from career
          await handleRemoveSkillFromCareer(skillToDelete.index);
        }
        
        if (tabValue !== 3) {
          await loadSkillsData();
        }
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
      pathfinderCode: skill.pathfinderCode || '',
      estimatedHoursToMaster: skill.estimatedHoursToMaster || 40,
      proficiencyLevel: skill.proficiencyLevel || 3,
      isRequired: skill.isRequired !== undefined ? skill.isRequired : true,
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
      pathfinderCode: '',
      estimatedHoursToMaster: 40,
      proficiencyLevel: 3,
      isRequired: true,
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
        setSeedingStatus('Seeding Pathfinder hard skills database...');
        await hardSkillsService.seedHardSkills();
        setSeedingStatus('Successfully seeded Pathfinder hard skills!');
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

  // Render career skills management
  const renderCareerSkillsManagement = () => {
    return (
      <Grid container spacing={3} sx={{ minHeight: '600px' }}>
        {/* Career Selection */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.3), transparent)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              pb: 1
            }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Select Career
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose a career to view and manage its skills
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search careers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                minHeight: 0, // Important for flexbox scrolling
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  },
                },
              }}>
                {careers
                  .filter(career => 
                    career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    career.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((career) => (
                    <Card 
                      key={career.id}
                      sx={{ 
                        mb: 1, 
                        cursor: 'pointer',
                        border: selectedCareer?.id === career.id ? 2 : 1,
                        borderColor: selectedCareer?.id === career.id ? 'primary.main' : 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                      onClick={() => loadCareerSkills(career)}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {career.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {career.skills?.length || 0} skills • {career.difficulty}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Management */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.3), transparent)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment />
                  {selectedCareer ? `${selectedCareer.title} Skills` : 'Career Skills'}
                </Typography>
                {selectedCareer && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      // Open dialog to add new skill
                      setSkillForm({
                        name: '',
                        description: '',
                        category: SkillCategory.TECHNICAL,
                        type: SkillType.HARD,
                        prerequisites: [],
                        relatedCareers: [selectedCareer.id],
                        pathfinderCode: '',
                        estimatedHoursToMaster: 40,
                        proficiencyLevel: 3,
                        isRequired: true,
                      });
                      setSkillFormOpen(true);
                    }}
                    sx={{
                      backgroundColor: '#00B162',
                      '&:hover': {
                        backgroundColor: '#009654',
                      },
                    }}
                  >
                    Add Skill
                  </Button>
                )}
              </Box>

              {!selectedCareer ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Select a career to manage skills
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a career from the list on the left to view and edit its associated skills.
                  </Typography>
                </Box>
              ) : careerSkills.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No skills found for {selectedCareer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This career doesn't have any skills defined yet. Add skills to help users understand what's required.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSkillForm({
                        name: '',
                        description: '',
                        category: SkillCategory.TECHNICAL,
                        type: SkillType.HARD,
                        prerequisites: [],
                        relatedCareers: [selectedCareer.id],
                        pathfinderCode: '',
                        estimatedHoursToMaster: 40,
                        proficiencyLevel: 3,
                        isRequired: true,
                      });
                      setSkillFormOpen(true);
                    }}
                  >
                    Add First Skill
                  </Button>
                </Box>
              ) : (
                <Box sx={{ 
                  flexGrow: 1, 
                  overflow: 'auto',
                  minHeight: 0
                }}>
                  <TableContainer component={Paper} sx={{ height: '100%' }}>
                    <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Skill Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Proficiency Level</TableCell>
                        <TableCell>Required</TableCell>
                        <TableCell>Est. Hours</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {careerSkills.map((skill, index) => (
                        <TableRow key={`${skill.skillId}-${index}`}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {skill.skillName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {skill.skillId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={skill.skillType}
                              size="small"
                              color={skill.skillType === 'hard' ? 'primary' : skill.skillType === 'soft' ? 'secondary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                Level {skill.proficiencyLevel}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(skill.proficiencyLevel / 5) * 100}
                                sx={{ width: 60, height: 6 }}
                                color={
                                  skill.proficiencyLevel >= 4 ? 'success' :
                                  skill.proficiencyLevel >= 3 ? 'warning' : 'error'
                                }
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={skill.isRequired ? 'Required' : 'Optional'}
                              size="small"
                              color={skill.isRequired ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {skill.estimatedHours || 0}h
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit Skill">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  // Edit skill logic here
                                  setSkillForm({
                                    name: skill.skillName,
                                    description: `${skill.skillType} skill for ${selectedCareer.title}`,
                                    category: skill.skillType === 'soft' ? SkillCategory.INTERPERSONAL : SkillCategory.TECHNICAL,
                                    type: skill.skillType === 'soft' ? SkillType.SOFT : SkillType.HARD,
                                    prerequisites: [],
                                    relatedCareers: [selectedCareer.id],
                                    pathfinderCode: '',
                                    estimatedHoursToMaster: skill.estimatedHours || 40,
                                    proficiencyLevel: skill.proficiencyLevel || 3,
                                    isRequired: skill.isRequired !== undefined ? skill.isRequired : true,
                                  });
                                  setEditingSkill({ ...skill, index });
                                  setSkillFormOpen(true);
                                }}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove from Career">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setSkillToDelete({ ...skill, index });
                                  setDeleteConfirmOpen(true);
                                }}
                                color="error"
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
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
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
                      {isHardSkillsTab && item.pathfinderCode && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ 
                            backgroundColor: 'grey.100', 
                            px: 1, 
                            py: 0.25, 
                            borderRadius: 0.5,
                            fontSize: '0.7rem'
                          }}>
                            Code: {item.pathfinderCode}
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
                      disabled={false} // All skills are editable in Pathfinder
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${isCertificationsTab ? 'Certification' : 'Skill'}`}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteSkill(item)}
                      color="error"
                      disabled={false} // All skills are editable in Pathfinder
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
              disabled={false} // All skills are editable in Pathfinder
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
            <Tab 
              icon={<TrendingUp />} 
              label={`Career Skills (${careers.length})`}
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
              <><strong>Hard Skills:</strong> Technical skills in your Pathfinder database. All skills are fully customizable.</>
            )}
            {tabValue === 2 && (
              <><strong>Certifications:</strong> Professional certifications that unlock and advance related skills. Import industry-standard certifications or create custom ones.</>
            )}
            {tabValue === 3 && (
              <><strong>Career Skills:</strong> View and manage skills associated with specific career paths. Add, edit, or remove skills for each career, set proficiency levels and requirements.</>
            )}
          </Typography>
        </Alert>

        {tabValue !== 3 && (
          <TextField
            fullWidth
            placeholder={`Search ${tabValue === 0 ? 'soft skills' : tabValue === 1 ? 'hard skills' : 'certifications'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
          />
        )}

        {tabValue === 3 ? renderCareerSkillsManagement() : renderDataTable()}

        {tabValue !== 3 && filteredData.length === 0 && !loading && (
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
          {editingSkill ? 
            (tabValue === 3 ? `Edit Career Skill` : `Edit ${tabValue === 0 ? 'Skill' : 'Item'}`) : 
            (tabValue === 3 ? `Add Skill to ${selectedCareer?.title || 'Career'}` : `Create New ${tabValue === 0 ? 'Skill' : 'Item'}`)
          }
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
                label="Pathfinder Code"
                value={skillForm.pathfinderCode}
                onChange={(e) => setSkillForm({ ...skillForm, pathfinderCode: e.target.value })}
                placeholder="Auto-generated unique identifier"
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
            
            {/* Career-specific fields */}
            {tabValue === 3 && (
              <>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Proficiency Level Required</InputLabel>
                    <Select
                      value={skillForm.proficiencyLevel}
                      onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: parseInt(e.target.value as string) })}
                      label="Proficiency Level Required"
                    >
                      <MenuItem value={1}>1 - Novice</MenuItem>
                      <MenuItem value={2}>2 - Beginner</MenuItem>
                      <MenuItem value={3}>3 - Intermediate</MenuItem>
                      <MenuItem value={4}>4 - Advanced</MenuItem>
                      <MenuItem value={5}>5 - Expert</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Requirement Status</InputLabel>
                    <Select
                      value={skillForm.isRequired.toString()}
                      onChange={(e) => setSkillForm({ ...skillForm, isRequired: e.target.value === 'true' })}
                      label="Requirement Status"
                    >
                      <MenuItem value="true">Required</MenuItem>
                      <MenuItem value="false">Optional</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
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