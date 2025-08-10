import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  Add,
  School,
  Verified,
  TrendingUp,
  Star,
  Launch,
  CheckCircle,
  Lock,
  FilterList,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { certificationService } from '../services/certification/certification.service';
import { Certification, UserCertification, SkillProficiencyLevel } from '../services/types/skill.types';

interface CertificationGalleryProps {
  careerPath?: string;
  userSkills?: Record<string, number>;
}

const CertificationGallery: React.FC<CertificationGalleryProps> = ({ 
  careerPath = 'general',
  userSkills = {} 
}) => {
  const theme = useTheme();
  const { currentUser } = useAuth();

  // State management
  const [tabValue, setTabValue] = useState(0);
  const [allCertifications, setAllCertifications] = useState<Certification[]>([]);
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([]);
  const [recommendedCertifications, setRecommendedCertifications] = useState<{
    certification: Certification;
    score: number;
    reason: string;
  }[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addDialog, setAddDialog] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state for adding certification
  const [earnedDate, setEarnedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [credentialUrl, setCredentialUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Load certification data
  useEffect(() => {
    const loadCertificationData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load all certifications
        const certifications = await certificationService.getAllCertifications();
        setAllCertifications(certifications);
        
        // Load user's certifications
        const userCerts = await certificationService.getUserCertifications(currentUser.uid);
        setUserCertifications(userCerts);
        
        // Load recommended certifications
        const recommendations = await certificationService.getRecommendedCertifications(
          currentUser.uid,
          [careerPath],
          userSkills,
          12
        );
        setRecommendedCertifications(recommendations);
        
        // Load providers
        const certProviders = await certificationService.getCertificationProviders();
        setProviders(certProviders);
      } catch (error) {
        console.error('Error loading certification data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCertificationData();
  }, [currentUser, careerPath, userSkills]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle add certification
  const handleAddCertification = (certification: Certification) => {
    setSelectedCertification(certification);
    setAddDialog(true);
    setEarnedDate(new Date().toISOString().split('T')[0]);
    setCredentialUrl('');
    setNotes('');
  };

  // Handle save certification
  const handleSaveCertification = async () => {
    if (!currentUser || !selectedCertification) return;
    
    try {
      await certificationService.addUserCertification(
        currentUser.uid,
        selectedCertification.id,
        new Date(earnedDate),
        credentialUrl || undefined,
        notes || undefined
      );
      
      // Reload user certifications
      const userCerts = await certificationService.getUserCertifications(currentUser.uid);
      setUserCertifications(userCerts);
      
      setAddDialog(false);
      setSelectedCertification(null);
    } catch (error) {
      console.error('Error adding certification:', error);
    }
  };

  // Filter certifications
  const filterCertifications = (certifications: Certification[]) => {
    const earnedCertIds = new Set(userCertifications.map(uc => uc.certificationId));
    
    return certifications.filter(cert => {
      // Filter by search query
      if (searchQuery && !cert.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !cert.provider.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by provider
      if (selectedProvider !== 'all' && cert.provider !== selectedProvider) {
        return false;
      }
      
      // For available tab, exclude already earned certifications
      if (tabValue === 1 && earnedCertIds.has(cert.id)) {
        return false;
      }
      
      return true;
    });
  };

  // Get earned certifications with details
  const getEarnedCertifications = () => {
    const earnedCertIds = new Set(userCertifications.map(uc => uc.certificationId));
    return allCertifications.filter(cert => earnedCertIds.has(cert.id));
  };

  // Get provider icon color
  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      'AWS': '#FF9900',
      'Google': '#4285F4',
      'Microsoft': '#00A4EF',
      'Oracle': '#F80000',
      'MongoDB': '#47A248',
      'Adobe': '#FF0000',
      'CompTIA': '#C41E3A',
      'Docker': '#2496ED',
      'CNCF': '#326CE5',
      'IBM': '#054ADA',
      'ISACA': '#0066CC'
    };
    return colors[provider] || theme.palette.primary.main;
  };

  // Render certification card
  const renderCertificationCard = (certification: Certification, isEarned: boolean = false) => {
    const earnedCert = userCertifications.find(uc => uc.certificationId === certification.id);
    
    return (
      <Card
        key={certification.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
          border: isEarned ? `2px solid ${theme.palette.success.main}` : undefined,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                backgroundColor: getProviderColor(certification.provider),
                width: 48,
                height: 48
              }}
            >
              <School />
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              {certification.verified && (
                <Tooltip title="Verified Certification">
                  <Verified sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                </Tooltip>
              )}
              {isEarned && (
                <Tooltip title="Earned">
                  <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20, ml: 0.5 }} />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Title and Provider */}
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
            {certification.name}
          </Typography>
          <Chip
            label={certification.provider}
            size="small"
            sx={{
              backgroundColor: getProviderColor(certification.provider),
              color: 'white',
              mb: 2
            }}
          />

          {/* Description */}
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {certification.description}
          </Typography>

          {/* Skills Unlocked */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
              Skills Advanced (+{certification.skillBoostAmount} levels):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {certification.skillsUnlocked.slice(0, 4).map((skillId) => (
                <Chip
                  key={skillId}
                  label={skillId.replace('_', ' ')}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {certification.skillsUnlocked.length > 4 && (
                <Chip
                  label={`+${certification.skillsUnlocked.length - 4} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', opacity: 0.7 }}
                />
              )}
            </Box>
          </Box>

          {/* Earned Date if applicable */}
          {isEarned && earnedCert && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="success.main">
                Earned: {earnedCert.dateEarned.toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Actions */}
        <Box sx={{ p: 2, pt: 0 }}>
          {certification.url && (
            <Button
              size="small"
              startIcon={<Launch />}
              href={certification.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mr: 1, mb: 1 }}
            >
              Learn More
            </Button>
          )}
          {!isEarned && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleAddCertification(certification)}
              sx={{ mb: 1 }}
            >
              Add to Profile
            </Button>
          )}
        </Box>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Loading Certifications...</Typography>
          <LinearProgress sx={{ width: 200 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Professional Certifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Advance your skills and career with industry-recognized certifications
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              fontFamily: '"Nacelle", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab 
            icon={<Star />} 
            label={
              <Badge badgeContent={recommendedCertifications.length} color="primary">
                Recommended
              </Badge>
            }
            iconPosition="start"
          />
          <Tab 
            icon={<School />} 
            label={
              <Badge badgeContent={filterCertifications(allCertifications).length} color="secondary">
                Available
              </Badge>
            }
            iconPosition="start"
          />
          <Tab 
            icon={<EmojiEvents />} 
            label={
              <Badge badgeContent={userCertifications.length} color="success">
                Earned
              </Badge>
            }
            iconPosition="start"
          />
        </Tabs>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search certifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="all">All Providers</MenuItem>
              {providers.map(provider => (
                <MenuItem key={provider} value={provider}>{provider}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Tab Content */}
      <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
        {/* Recommended Tab */}
        {tabValue === 0 && (
          <Box>
            {recommendedCertifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Recommendations Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete your skill assessment to get personalized certification recommendations.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {recommendedCertifications.map(({ certification, score, reason }) => (
                  <Grid item xs={12} sm={6} md={4} key={certification.id}>
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        border: `2px dashed ${theme.palette.warning.main}`,
                        boxShadow: `0 0 10px ${theme.palette.warning.main}40`
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                        <Chip
                          label={`${Math.round(score)}% match`}
                          size="small"
                          color="warning"
                          icon={<TrendingUp />}
                        />
                      </Box>
                      {renderCertificationCard(certification)}
                      <Box sx={{ px: 2, pb: 1 }}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="caption">{reason}</Typography>
                        </Alert>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Available Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {filterCertifications(allCertifications).map(certification => (
              <Grid item xs={12} sm={6} md={4} key={certification.id}>
                {renderCertificationCard(certification)}
              </Grid>
            ))}
          </Grid>
        )}

        {/* Earned Tab */}
        {tabValue === 2 && (
          <Box>
            {userCertifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Certifications Earned Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start your certification journey by exploring recommended certifications.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {getEarnedCertifications().map(certification => (
                  <Grid item xs={12} sm={6} md={4} key={certification.id}>
                    {renderCertificationCard(certification, true)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* Add Certification Dialog */}
      <Dialog 
        open={addDialog} 
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCertification && (
          <>
            <DialogTitle>
              Add {selectedCertification.name} to Your Profile
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedCertification.description}
                </Typography>
              </Box>
              
              <TextField
                label="Date Earned"
                type="date"
                fullWidth
                value={earnedDate}
                onChange={(e) => setEarnedDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <TextField
                label="Credential URL (Optional)"
                fullWidth
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="https://www.credly.com/badges/..."
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Notes (Optional)"
                multiline
                rows={3}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information about your certification..."
              />

              {/* Skill Boost Preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  This certification will advance these skills by +{selectedCertification.skillBoostAmount} levels:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedCertification.skillsUnlocked.map(skillId => (
                    <Chip
                      key={skillId}
                      label={skillId.replace('_', ' ')}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSaveCertification}
                disabled={!earnedDate}
              >
                Add Certification
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CertificationGallery;