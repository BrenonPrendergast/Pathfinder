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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Assignment,
  Star,
  Schedule,
  EmojiEvents,
} from '@mui/icons-material';
import { Quest, questService } from '../../services';

interface QuestManagementProps {}

const QuestManagement: React.FC<QuestManagementProps> = () => {
  // State management
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [questFormOpen, setQuestFormOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [importingCSV, setImportingCSV] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string>('');

  // Form state for quest creation/editing
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    xpReward: 100,
    estimatedHours: 2,
    category: 'career_exploration',
    relatedSkills: [] as string[],
    prerequisites: [] as string[],
    isActive: true,
  });

  // Load quests data
  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const questsData = await questService.getQuests();
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle quest form submission
  const handleQuestSave = async () => {
    try {
      if (editingQuest) {
        // Update existing quest
        await questService.updateQuest(editingQuest.id, questForm);
      } else {
        // Create new quest
        await questService.createQuest(questForm);
      }
      
      await loadQuests();
      handleFormClose();
    } catch (error) {
      console.error('Error saving quest:', error);
    }
  };

  // Handle quest deletion
  const handleDeleteQuest = (quest: Quest) => {
    setQuestToDelete(quest);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteQuest = async () => {
    if (questToDelete) {
      try {
        await questService.deleteQuest(questToDelete.id);
        await loadQuests();
        setDeleteConfirmOpen(false);
        setQuestToDelete(null);
      } catch (error) {
        console.error('Error deleting quest:', error);
      }
    }
  };

  // Handle quest editing
  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setQuestForm({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      xpReward: quest.xpReward,
      estimatedHours: quest.estimatedHours,
      category: quest.category,
      relatedSkills: quest.relatedSkills || [],
      prerequisites: quest.prerequisites || [],
      isActive: quest.isActive,
    });
    setQuestFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setQuestFormOpen(false);
    setEditingQuest(null);
    setQuestForm({
      title: '',
      description: '',
      difficulty: 'beginner',
      xpReward: 100,
      estimatedHours: 2,
      category: 'career_exploration',
      relatedSkills: [],
      prerequisites: [],
      isActive: true,
    });
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      setCsvStatus('Exporting quests to CSV...');
      
      // Create CSV content
      const headers = ['ID', 'Title', 'Description', 'Difficulty', 'XP Reward', 'Estimated Hours', 'Category', 'Related Skills', 'Prerequisites'];
      const csvRows = [headers.join(',')];
      
      quests.forEach(quest => {
        const row = [
          quest.id,
          `"${quest.title.replace(/"/g, '""')}"`,
          `"${quest.description.replace(/"/g, '""')}"`,
          quest.difficulty,
          quest.xpReward.toString(),
          quest.estimatedHours.toString(),
          quest.category,
          `"${(quest.relatedSkills || []).join(';')}"`,
          `"${(quest.prerequisites || []).join(';')}"`,
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pathfinder-quests-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCsvStatus(`Successfully exported ${quests.length} quests to CSV file.`);
      setTimeout(() => setCsvStatus(''), 5000);
    } catch (error) {
      console.error('CSV export error:', error);
      setCsvStatus('Failed to export quests. Please try again.');
      setTimeout(() => setCsvStatus(''), 5000);
    } finally {
      setExportingCSV(false);
    }
  };

  // Handle CSV import
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvStatus('Please select a CSV file.');
      setTimeout(() => setCsvStatus(''), 3000);
      return;
    }
    
    try {
      setImportingCSV(true);
      setCsvStatus('Reading and importing CSV file...');
      
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Validate headers
      const expectedHeaders = ['ID', 'Title', 'Description', 'Difficulty', 'XP Reward', 'Estimated Hours', 'Category'];
      const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
      
      if (!hasValidHeaders) {
        setCsvStatus('Invalid CSV format. Please check the headers.');
        setTimeout(() => setCsvStatus(''), 5000);
        return;
      }
      
      // Process CSV rows (skip header)
      let imported = 0;
      let errors = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        try {
          const values = line.split(',');
          const questData = {
            title: values[1]?.replace(/"/g, ''),
            description: values[2]?.replace(/"/g, ''),
            difficulty: values[3] as 'beginner' | 'intermediate' | 'advanced',
            xpReward: parseInt(values[4]) || 100,
            estimatedHours: parseInt(values[5]) || 2,
            category: values[6] || 'career_exploration',
            relatedSkills: values[7]?.replace(/"/g, '').split(';').filter(Boolean) || [],
            prerequisites: values[8]?.replace(/"/g, '').split(';').filter(Boolean) || [],
            isActive: true,
          };
          
          // Create or update quest
          if (values[0] && values[0] !== 'ID') {
            await questService.updateQuest(values[0].replace(/"/g, ''), questData);
          } else {
            await questService.createQuest(questData);
          }
          imported++;
        } catch (error) {
          console.error(`Error importing row ${i + 1}:`, error);
          errors++;
        }
      }
      
      setCsvStatus(`Import completed! ${imported} quests imported${errors > 0 ? `, ${errors} errors` : ''}.`);
      await loadQuests();
      setTimeout(() => setCsvStatus(''), 8000);
    } catch (error) {
      console.error('CSV import error:', error);
      setCsvStatus('Failed to import CSV file. Please check the format and try again.');
      setTimeout(() => setCsvStatus(''), 5000);
    } finally {
      setImportingCSV(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  // Filter quests based on search term
  const filteredQuests = quests.filter(quest =>
    quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Quest Management
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
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={importingCSV}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {importingCSV ? 'Importing...' : 'Import CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setQuestFormOpen(true)}
              size="small"
            >
              Add Quest
            </Button>
          </Box>
        </Box>

        {csvStatus && (
          <Alert 
            severity={csvStatus.includes('Failed') || csvStatus.includes('errors') ? 'error' : 'success'} 
            sx={{ mb: 2 }}
          >
            {csvStatus}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Quest Management:</strong> Create, edit, and manage learning quests. CSV operations support bulk import/export with related skills and prerequisites.
          </Typography>
        </Alert>

        <TextField
          fullWidth
          placeholder="Search quests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quest</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>XP Reward</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Skills</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuests.map((quest) => (
                <TableRow key={quest.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ backgroundColor: 'primary.main' }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {quest.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {quest.description.length > 60 
                            ? `${quest.description.substring(0, 60)}...` 
                            : quest.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Schedule sx={{ fontSize: 14 }} />
                          <Typography variant="caption">
                            {quest.estimatedHours}h
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={quest.difficulty}
                      size="small"
                      color={getDifficultyColor(quest.difficulty) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEvents sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2">{quest.xpReward} XP</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {quest.category.replace(/_/g, ' ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                      {(quest.relatedSkills || []).slice(0, 3).map((skill: string) => (
                        <Chip
                          key={skill}
                          label={skill.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                      {(quest.relatedSkills || []).length > 3 && (
                        <Chip
                          label={`+${quest.relatedSkills!.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', opacity: 0.7 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Quest">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditQuest(quest)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Quest">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteQuest(quest)}
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

        {filteredQuests.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No quests found.
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Quest Form Dialog */}
      <Dialog open={questFormOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuest ? 'Edit Quest' : 'Create New Quest'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quest Title"
                value={questForm.title}
                onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={questForm.description}
                onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={questForm.difficulty}
                  onChange={(e) => setQuestForm({ ...questForm, difficulty: e.target.value as any })}
                  label="Difficulty"
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Category"
                value={questForm.category}
                onChange={(e) => setQuestForm({ ...questForm, category: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="XP Reward"
                type="number"
                value={questForm.xpReward}
                onChange={(e) => setQuestForm({ ...questForm, xpReward: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={questForm.estimatedHours}
                onChange={(e) => setQuestForm({ ...questForm, estimatedHours: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
          <Button 
            onClick={handleQuestSave} 
            variant="contained"
            disabled={!questForm.title || !questForm.description}
          >
            {editingQuest ? 'Update Quest' : 'Create Quest'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{questToDelete?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteQuest} color="error" variant="contained">
            Delete Quest
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default QuestManagement;