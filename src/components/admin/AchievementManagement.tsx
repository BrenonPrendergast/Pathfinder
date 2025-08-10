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
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  EmojiEvents,
  Star,
  Psychology,
  TrendingUp,
  School,
  Work,
  Assessment,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { achievementService, Achievement, UserStats } from '../../services';

interface AchievementManagementProps {}

const AchievementManagement: React.FC<AchievementManagementProps> = () => {
  // State management
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [achievementFormOpen, setAchievementFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [importingCSV, setImportingCSV] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string>('');
  const [seedingStatus, setSeedingStatus] = useState<string>('');
  const [seeding, setSeeding] = useState(false);

  // Form state for achievement creation/editing
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    category: 'career_progress' as 'career_progress' | 'skill_mastery' | 'quest_completion' | 'learning_milestone' | 'engagement',
    badgeIcon: '🏆',
    xpReward: 100,
    isSecret: false,
    isActive: true,
    criteria: {
      type: 'quest_completion' as 'quest_completion' | 'xp_milestone' | 'skill_mastery' | 'career_path' | 'custom',
      value: 1,
      target: '',
    },
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
  });

  // Load achievements data
  useEffect(() => {
    loadAchievementsData();
  }, []);

  const loadAchievementsData = async () => {
    try {
      setLoading(true);
      
      // Load achievements
      const achievementsData = await achievementService.getAchievements();
      setAchievements(achievementsData);
      
      // Load user stats for analytics
      const stats = await achievementService.getUserAchievementStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle achievement form submission
  const handleAchievementSave = async () => {
    try {
      if (editingAchievement) {
        await achievementService.updateAchievement(editingAchievement.id, achievementForm);
      } else {
        await achievementService.createAchievement(achievementForm);
      }
      
      await loadAchievementsData();
      handleFormClose();
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  };

  // Handle achievement deletion
  const handleDeleteAchievement = (achievement: Achievement) => {
    setAchievementToDelete(achievement);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAchievement = async () => {
    if (achievementToDelete) {
      try {
        await achievementService.deleteAchievement(achievementToDelete.id);
        await loadAchievementsData();
        setDeleteConfirmOpen(false);
        setAchievementToDelete(null);
      } catch (error) {
        console.error('Error deleting achievement:', error);
      }
    }
  };

  // Handle achievement editing
  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      badgeIcon: achievement.badgeIcon,
      xpReward: achievement.xpReward,
      isSecret: achievement.isSecret,
      isActive: achievement.isActive,
      criteria: achievement.criteria,
      rarity: achievement.rarity,
    });
    setAchievementFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setAchievementFormOpen(false);
    setEditingAchievement(null);
    setAchievementForm({
      title: '',
      description: '',
      category: 'career_progress' as 'career_progress' | 'skill_mastery' | 'quest_completion' | 'learning_milestone' | 'engagement',
      badgeIcon: '🏆',
      xpReward: 100,
      isSecret: false,
      isActive: true,
      criteria: {
        type: 'quest_completion' as 'quest_completion' | 'xp_milestone' | 'skill_mastery' | 'career_path' | 'custom',
        value: 1,
        target: '',
      },
      rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    });
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      setCsvStatus('Exporting achievements to CSV...');
      
      // Create CSV content
      const headers = [
        'ID', 'Title', 'Description', 'Category', 'Badge Icon', 
        'XP Reward', 'Rarity', 'Is Secret', 'Criteria Type', 
        'Criteria Value', 'Criteria Target', 'Total Unlocks'
      ];
      const csvRows = [headers.join(',')];
      
      achievements.forEach(achievement => {
        const unlocksCount = userStats.filter(stat => 
          stat.achievements.includes(achievement.id)
        ).length;
        
        const row = [
          achievement.id,
          `"${achievement.title.replace(/"/g, '""')}"`,
          `"${achievement.description.replace(/"/g, '""')}"`,
          achievement.category,
          achievement.badgeIcon,
          achievement.xpReward.toString(),
          achievement.rarity,
          achievement.isSecret.toString(),
          achievement.criteria.type,
          achievement.criteria.value.toString(),
          `"${achievement.criteria.target || ''}"`,
          unlocksCount.toString(),
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pathfinder-achievements-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCsvStatus(`Successfully exported ${achievements.length} achievements to CSV file.`);
      setTimeout(() => setCsvStatus(''), 5000);
    } catch (error) {
      console.error('CSV export error:', error);
      setCsvStatus('Failed to export achievements. Please try again.');
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
      
      // Process CSV rows (skip header)
      let imported = 0;
      let errors = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        try {
          const values = line.split(',');
          const achievementData = {
            title: values[1]?.replace(/"/g, ''),
            description: values[2]?.replace(/"/g, ''),
            category: (values[3] as 'career_progress' | 'skill_mastery' | 'quest_completion' | 'learning_milestone' | 'engagement') || 'career_progress',
            badgeIcon: values[4] || '🏆',
            xpReward: parseInt(values[5]) || 100,
            rarity: (values[6] as 'common' | 'rare' | 'epic' | 'legendary') || 'common',
            isSecret: values[7] === 'true',
            isActive: true,
            criteria: {
              type: (values[8] as 'quest_completion' | 'xp_milestone' | 'skill_mastery' | 'career_path' | 'custom') || 'quest_completion',
              value: parseInt(values[9]) || 1,
              target: values[10]?.replace(/"/g, '') || '',
            },
          };
          
          // Create or update achievement
          if (values[0] && values[0] !== 'ID') {
            await achievementService.updateAchievement(values[0].replace(/"/g, ''), achievementData);
          } else {
            await achievementService.createAchievement(achievementData);
          }
          imported++;
        } catch (error) {
          console.error(`Error importing row ${i + 1}:`, error);
          errors++;
        }
      }
      
      setCsvStatus(`Import completed! ${imported} achievements imported${errors > 0 ? `, ${errors} errors` : ''}.`);
      await loadAchievementsData();
      setTimeout(() => setCsvStatus(''), 8000);
    } catch (error) {
      console.error('CSV import error:', error);
      setCsvStatus('Failed to import CSV file. Please check the format and try again.');
      setTimeout(() => setCsvStatus(''), 5000);
    } finally {
      setImportingCSV(false);
      event.target.value = '';
    }
  };

  // Handle data seeding
  const handleSeedData = async () => {
    try {
      setSeeding(true);
      setSeedingStatus('Seeding default achievements...');
      
      await achievementService.seedAchievements();
      
      setSeedingStatus('Successfully seeded default achievements!');
      await loadAchievementsData();
      setTimeout(() => setSeedingStatus(''), 5000);
    } catch (error) {
      console.error('Seeding error:', error);
      setSeedingStatus('Failed to seed achievements. Please try again.');
      setTimeout(() => setSeedingStatus(''), 5000);
    } finally {
      setSeeding(false);
    }
  };

  // Filter achievements based on search term
  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'default';
      case 'rare': return 'primary';
      case 'epic': return 'secondary';
      case 'legendary': return 'warning';
      default: return 'default';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career_progress': return <Work />;
      case 'skill_mastery': return <Psychology />;
      case 'quest_completion': return <Assessment />;
      case 'learning_milestone': return <School />;
      case 'engagement': return <TrendingUp />;
      default: return <EmojiEvents />;
    }
  };

  // Get unlock stats for achievement
  const getUnlockStats = (achievementId: string) => {
    return userStats.filter(stat => stat.achievements.includes(achievementId)).length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Loading Achievement Data...</Typography>
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
            Achievement Management
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
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAchievementFormOpen(true)}
              size="small"
            >
              Add Achievement
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

        {seedingStatus && (
          <Alert 
            severity={seedingStatus.includes('Failed') ? 'error' : 'success'} 
            sx={{ mb: 2 }}
          >
            {seedingStatus}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Achievement System:</strong> Manage gamification badges and milestones. Achievements motivate users and track progress across different aspects of their career journey.
          </Typography>
        </Alert>

        <TextField
          fullWidth
          placeholder="Search achievements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Achievement</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Rarity</TableCell>
                <TableCell>XP Reward</TableCell>
                <TableCell>Criteria</TableCell>
                <TableCell>Unlocks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAchievements.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        badgeContent={achievement.isSecret ? '🤫' : null}
                        color="secondary"
                      >
                        <Avatar 
                          sx={{ 
                            backgroundColor: `${getRarityColor(achievement.rarity)}.main`,
                            fontSize: '1.2rem'
                          }}
                        >
                          {achievement.badgeIcon}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {achievement.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.description.length > 60 
                            ? `${achievement.description.substring(0, 60)}...` 
                            : achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCategoryIcon(achievement.category)}
                      <Typography variant="body2">
                        {achievement.category.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={achievement.rarity}
                      size="small"
                      color={getRarityColor(achievement.rarity) as any}
                      icon={<Star />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEvents sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2">{achievement.xpReward} XP</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {achievement.criteria.type.replace(/_/g, ' ')}: {achievement.criteria.value}
                      {achievement.criteria.target && ` (${achievement.criteria.target})`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {getUnlockStats(achievement.id)} users
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Achievement">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditAchievement(achievement)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Achievement">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteAchievement(achievement)}
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

        {filteredAchievements.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No achievements found.
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Achievement Form Dialog */}
      <Dialog open={achievementFormOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Achievement Title"
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Badge Icon (Emoji)"
                value={achievementForm.badgeIcon}
                onChange={(e) => setAchievementForm({ ...achievementForm, badgeIcon: e.target.value })}
                required
                placeholder="🏆"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="XP Reward"
                type="number"
                value={achievementForm.xpReward}
                onChange={(e) => setAchievementForm({ ...achievementForm, xpReward: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={achievementForm.category}
                  onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value as 'career_progress' | 'skill_mastery' | 'quest_completion' | 'learning_milestone' | 'engagement' })}
                  label="Category"
                >
                  <MenuItem value="career_progress">Career Progress</MenuItem>
                  <MenuItem value="skill_mastery">Skill Mastery</MenuItem>
                  <MenuItem value="quest_completion">Quest Completion</MenuItem>
                  <MenuItem value="learning_milestone">Learning Milestone</MenuItem>
                  <MenuItem value="engagement">Engagement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Rarity</InputLabel>
                <Select
                  value={achievementForm.rarity}
                  onChange={(e) => setAchievementForm({ ...achievementForm, rarity: e.target.value as any })}
                  label="Rarity"
                >
                  <MenuItem value="common">Common</MenuItem>
                  <MenuItem value="rare">Rare</MenuItem>
                  <MenuItem value="epic">Epic</MenuItem>
                  <MenuItem value="legendary">Legendary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Achievement Criteria
              </Typography>
            </Grid>
            
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Criteria Type</InputLabel>
                <Select
                  value={achievementForm.criteria.type}
                  onChange={(e) => setAchievementForm({ 
                    ...achievementForm, 
                    criteria: { ...achievementForm.criteria, type: e.target.value as any }
                  })}
                  label="Criteria Type"
                >
                  <MenuItem value="quest_completion">Quest Completion</MenuItem>
                  <MenuItem value="xp_milestone">XP Milestone</MenuItem>
                  <MenuItem value="skill_mastery">Skill Mastery</MenuItem>
                  <MenuItem value="career_path">Career Path</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Target Value"
                type="number"
                value={achievementForm.criteria.value}
                onChange={(e) => setAchievementForm({ 
                  ...achievementForm, 
                  criteria: { ...achievementForm.criteria, value: parseInt(e.target.value) || 0 }
                })}
                required
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Target ID (Optional)"
                value={achievementForm.criteria.target}
                onChange={(e) => setAchievementForm({ 
                  ...achievementForm, 
                  criteria: { ...achievementForm.criteria, target: e.target.value }
                })}
                placeholder="skill_id, quest_id, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
          <Button 
            onClick={handleAchievementSave} 
            variant="contained"
            disabled={!achievementForm.title || !achievementForm.description}
          >
            {editingAchievement ? 'Update Achievement' : 'Create Achievement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{achievementToDelete?.title}"?
            This action cannot be undone and will affect user progress.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAchievement} color="error" variant="contained">
            Delete Achievement
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AchievementManagement;