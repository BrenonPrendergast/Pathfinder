import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings,
  Work,
  People,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Career, careerService, careerFieldsService, careerCSVService, userService, certificationService } from '../services';
import AdminCareerForm from '../components/AdminCareerForm';

const AdminPage: React.FC = () => {
  const { isAdmin, userProfile } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [careerFormOpen, setCareerFormOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState<Career | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('careers');
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [fieldMigrating, setFieldMigrating] = useState(false);
  const [fieldMigrationStatus, setFieldMigrationStatus] = useState<string>('');
  const [csvExporting, setCsvExporting] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string>('');
  const [certSeeding, setCertSeeding] = useState(false);
  const [certSeedStatus, setCertSeedStatus] = useState<string>('');

  useEffect(() => {
    if (isAdmin()) {
      loadCareers();
      loadUsers();
    }
  }, [isAdmin]);

  const loadCareers = async () => {
    try {
      setLoading(true);
      const response = await careerService.getCareers(100); // Load more for admin
      setCareers(response.careers);
    } catch (error) {
      console.error('Error loading careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      await userService.updateUserRole(userId, newRole);
      await loadUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleMigrateRoles = async () => {
    try {
      setMigrating(true);
      setMigrationStatus('Migrating user roles...');
      
      const result = await userService.migrateUserRoles();
      
      setMigrationStatus(
        `Migration complete! Updated ${result.success} users out of ${result.total} total.`
      );
      
      // Refresh users list
      await loadUsers();
      
      setTimeout(() => setMigrationStatus(''), 5000);
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('Migration failed. Please try again.');
      setTimeout(() => setMigrationStatus(''), 5000);
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrateCareerFields = async () => {
    try {
      setFieldMigrating(true);
      setFieldMigrationStatus('Analyzing careers and assigning field categories...');
      
      const result = await careerFieldsService.bulkMigrateCareerFields();
      
      if (result.errors.length > 0) {
        setFieldMigrationStatus(
          `Migration completed with some issues: ${result.updated} careers updated out of ${result.processed} processed, ${result.errors.length} errors. Check console for details.`
        );
        console.error('Migration errors:', result.errors);
      } else {
        setFieldMigrationStatus(
          `Migration successful! Updated ${result.updated} careers out of ${result.processed} processed.`
        );
      }
      
      // Refresh careers list
      await loadCareers();
      
      setTimeout(() => setFieldMigrationStatus(''), 8000);
    } catch (error) {
      console.error('Field migration error:', error);
      setFieldMigrationStatus('Field migration failed. Please try again.');
      setTimeout(() => setFieldMigrationStatus(''), 5000);
    } finally {
      setFieldMigrating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setCsvExporting(true);
      setCsvStatus('Exporting careers to CSV...');
      
      const csvContent = await careerCSVService.exportCareersToCSV();
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pathfinder-careers-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCsvStatus(`Successfully exported ${careers.length} careers to CSV file.`);
      setTimeout(() => setCsvStatus(''), 5000);
    } catch (error) {
      console.error('CSV export error:', error);
      setCsvStatus('Failed to export careers. Please try again.');
      setTimeout(() => setCsvStatus(''), 5000);
    } finally {
      setCsvExporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvStatus('Please select a CSV file.');
      setTimeout(() => setCsvStatus(''), 3000);
      return;
    }
    
    try {
      setCsvImporting(true);
      setCsvStatus('Reading and importing CSV file...');
      
      const csvContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      const result = await careerCSVService.importCareersFromCSV(csvContent);
      
      if (result.errors.length > 0) {
        setCsvStatus(
          `Import completed with issues: ${result.imported} careers imported, ${result.skipped} skipped. ${result.errors.length} errors. Check console for details.`
        );
        console.error('Import errors:', result.errors);
      } else {
        setCsvStatus(
          `Successfully imported ${result.imported} careers from CSV file!`
        );
      }
      
      // Refresh careers list
      await loadCareers();
      
      setTimeout(() => setCsvStatus(''), 8000);
    } catch (error) {
      console.error('CSV import error:', error);
      setCsvStatus('Failed to import CSV file. Please check the format and try again.');
      setTimeout(() => setCsvStatus(''), 5000);
    } finally {
      setCsvImporting(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleSeedCertifications = async () => {
    try {
      setCertSeeding(true);
      setCertSeedStatus('Seeding certification database...');
      
      await certificationService.seedCertifications();
      
      setCertSeedStatus('Successfully seeded certification database with industry-standard certifications!');
      setTimeout(() => setCertSeedStatus(''), 5000);
    } catch (error) {
      console.error('Certification seeding error:', error);
      setCertSeedStatus('Failed to seed certifications. Please try again.');
      setTimeout(() => setCertSeedStatus(''), 5000);
    } finally {
      setCertSeeding(false);
    }
  };

  const handleEditCareer = (career: Career) => {
    setEditingCareer(career);
    setCareerFormOpen(true);
  };

  const handleDeleteCareer = (career: Career) => {
    setCareerToDelete(career);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCareer = async () => {
    if (!careerToDelete) return;

    try {
      await careerService.deleteCareer(careerToDelete.id);
      setCareers(prev => prev.filter(c => c.id !== careerToDelete.id));
      setDeleteConfirmOpen(false);
      setCareerToDelete(null);
    } catch (error) {
      console.error('Error deleting career:', error);
    }
  };

  const handleFormClose = () => {
    setCareerFormOpen(false);
    setEditingCareer(null);
  };

  const handleFormSave = () => {
    loadCareers(); // Refresh the list
  };

  // Filter careers based on search
  const filteredCareers = careers.filter(career =>
    career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    career.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. You don't have administrator permissions.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AdminPanelSettings color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h3" component="h1">
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {userProfile?.displayName || userProfile?.email}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Work color="primary" />
                <Box>
                  <Typography variant="h4">{careers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Careers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="primary" />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AdminPanelSettings color="primary" />
                <Box>
                  <Typography variant="h4">{userProfile?.role}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Role
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Career Management" value="careers" />
          <Tab label="User Management" value="users" />
          <Tab label="Quest Management" value="quests" />
          <Tab label="Skill Management" value="skills" />
          <Tab label="Achievement Management" value="achievements" />
          <Tab label="Data Management" value="data" />
        </Tabs>
      </Box>

      {/* Career Management Tab */}
      {activeTab === 'careers' && (
        <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Career Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                disabled={csvExporting}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {csvExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                disabled={csvImporting}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {csvImporting ? 'Importing...' : 'Import CSV'}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  style={{ display: 'none' }}
                />
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleMigrateCareerFields}
                disabled={fieldMigrating}
                size="small"
                sx={{ minWidth: 140 }}
              >
                {fieldMigrating ? 'Migrating...' : 'Auto-Assign Fields'}
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCareerFormOpen(true)}
                size="small"
              >
                Add Career
              </Button>
            </Box>
          </Box>

          {fieldMigrationStatus && (
            <Alert 
              severity={fieldMigrationStatus.includes('failed') || fieldMigrationStatus.includes('issues') ? 'warning' : 'success'} 
              sx={{ mb: 2 }}
            >
              {fieldMigrationStatus}
            </Alert>
          )}

          {csvStatus && (
            <Alert 
              severity={csvStatus.includes('Failed') || csvStatus.includes('issues') ? 'error' : 'success'} 
              sx={{ mb: 2 }}
            >
              {csvStatus}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>CSV Operations:</strong> Export current careers to CSV for external editing, or import careers from CSV files. Use the same format for imports.
            </Typography>
            <Typography variant="body2">
              <strong>Auto-Assign Fields:</strong> Automatically analyze careers and assign industry field categories based on job titles and descriptions.
            </Typography>
          </Alert>

          <TextField
            fullWidth
            placeholder="Search careers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Time to Master</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCareers.map((career) => (
                  <TableRow key={career.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {career.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {career.onetCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={career.difficulty}
                        size="small"
                        color={
                          career.difficulty === 'beginner' ? 'success' :
                          career.difficulty === 'intermediate' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>{career.estimatedTimeToMaster} months</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {career.skills.length} skills
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCareer(career)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCareer(career)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCareers.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No careers found matching your search.
              </Typography>
            </Box>
          )}
        </CardContent>
        </Card>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2">
                User Management
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleMigrateRoles}
                disabled={migrating}
                sx={{ minWidth: 140 }}
              >
                {migrating ? 'Migrating...' : 'Add Missing Roles'}
              </Button>
            </Box>

            {migrationStatus && (
              <Alert 
                severity={migrationStatus.includes('failed') ? 'error' : 'success'} 
                sx={{ mb: 2 }}
              >
                {migrationStatus}
              </Alert>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Current Role</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }}>
                            {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.displayName || 'Anonymous'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Joined {user.createdAt?.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || 'user'}
                          size="small"
                          color={
                            user.role === 'super_admin' ? 'error' :
                            user.role === 'admin' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        Level {user.level || 1} ({(user.totalXP || 0).toLocaleString()} XP)
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Change Role</InputLabel>
                          <Select
                            value={user.role || 'user'}
                            label="Change Role"
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="super_admin">Super Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {users.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No users found.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Database Management
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Data Seeding Operations:</strong> Initialize database collections with default data.
              </Typography>
              <Typography variant="body2">
                Use these operations to populate your database with essential data for the application.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              {/* Certification Seeding */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Professional Certifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Seed the database with industry-standard certifications from AWS, Google, Microsoft, and other major providers.
                    </Typography>
                    
                    {certSeedStatus && (
                      <Alert 
                        severity={certSeedStatus.includes('Failed') ? 'error' : 'success'} 
                        sx={{ mb: 2, fontSize: '0.875rem' }}
                      >
                        {certSeedStatus}
                      </Alert>
                    )}
                    
                    <Button
                      variant="contained"
                      onClick={handleSeedCertifications}
                      disabled={certSeeding}
                      fullWidth
                      sx={{ mt: 'auto' }}
                    >
                      {certSeeding ? 'Seeding...' : 'Seed Certifications'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Future seed operations can be added here */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hard Skills (O*NET)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Populate the database with O*NET-based hard skills and career mappings. (Available in skill service)
                    </Typography>
                    <Button
                      variant="outlined"
                      disabled
                      fullWidth
                      sx={{ mt: 'auto' }}
                    >
                      Available in Skill Service
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Achievement System
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Initialize default achievements and badges for user gamification.
                    </Typography>
                    <Button
                      variant="outlined"
                      disabled
                      fullWidth
                      sx={{ mt: 'auto' }}
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Quest Management Tab */}
      {activeTab === 'quests' && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Quest Management</Typography>
            <Alert severity="info">Quest management functionality is being implemented. All CRUD operations and CSV import/export will be available here.</Alert>
          </CardContent>
        </Card>
      )}

      {/* Skill Management Tab */}
      {activeTab === 'skills' && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Skill Management</Typography>
            <Alert severity="info">Skill management functionality is being implemented. Soft skills, hard skills, and certifications management will be available here.</Alert>
          </CardContent>
        </Card>
      )}

      {/* Achievement Management Tab */}
      {activeTab === 'achievements' && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Achievement Management</Typography>
            <Alert severity="info">Achievement management functionality is being implemented. Gamification badges and milestone management will be available here.</Alert>
          </CardContent>
        </Card>
      )}

      {/* Career Form Dialog */}
      <AdminCareerForm
        open={careerFormOpen}
        onClose={handleFormClose}
        career={editingCareer}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{careerToDelete?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCareer} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;