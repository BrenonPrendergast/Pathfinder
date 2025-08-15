import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Chip,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  CloudDownload,
  FilterList,
  Search,
  Category,
  ExpandMore,
  CheckBox,
  CheckBoxOutlineBlank,
} from '@mui/icons-material';
import { skillService } from '../../services/skill/skill.service';

interface SkillImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (skills: any[]) => void;
  existingSkillIds?: string[];
  careerPath?: string;
  careerName?: string;
}

interface ImportSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  category: string;
  xpReward: number;
  prerequisites: string[];
  starType: string;
  source: string;
  usageCount: number;
  careerTitle?: string;
}

const SkillImportDialog: React.FC<SkillImportDialogProps> = ({
  open,
  onClose,
  onImport,
  existingSkillIds = [],
  careerPath,
  careerName,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [availableSkills, setAvailableSkills] = useState<ImportSkill[]>([]);
  const [careerSkills, setCareerSkills] = useState<ImportSkill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingCareerSkills, setLoadingCareerSkills] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [collections, setCollections] = useState<{name: string, count: number, description: string}[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  // Load available skills and collections
  useEffect(() => {
    if (open) {
      loadSkillsData();
      loadCollections();
      if (careerPath && careerPath !== 'general') {
        loadCareerSkills();
      }
    }
  }, [open, careerPath]);

  const loadSkillsData = async () => {
    try {
      setLoading(true);
      const skills = await skillService.importExistingSkills();
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const collectionsData = await skillService.getSkillCollections();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadCareerSkills = async () => {
    try {
      setLoadingCareerSkills(true);
      // Import career service dynamically to avoid circular dependencies
      const { careerService } = await import('../../services/career/career.service');
      const career = await careerService.getCareer(careerPath!);
      
      if (career && career.skills && career.skills.length > 0) {
        const formattedSkills: ImportSkill[] = career.skills.map((skill, index) => ({
          id: skill.skillId || `career_skill_${index}`,
          name: skill.skillName || `Skill ${index + 1}`,
          description: `${skill.skillType} skill for ${career.title} (${skill.proficiencyLevel}/5 required)`,
          category: skill.skillType || 'general',
          level: skill.proficiencyLevel || 1,
          xpReward: (skill.proficiencyLevel || 1) * 10,
          prerequisites: index === 0 ? [] : [career.skills[index - 1]?.skillId || `career_skill_${index - 1}`],
          starType: skill.proficiencyLevel && skill.proficiencyLevel >= 4 ? 'giant' : 
                   skill.proficiencyLevel === 5 ? 'supergiant' :
                   skill.proficiencyLevel === 1 ? 'dwarf' : 'main-sequence',
          source: 'career_database',
          usageCount: skill.estimatedHours || 0,
          careerTitle: career.title,
        }));
        setCareerSkills(formattedSkills);
      } else {
        setCareerSkills([]);
      }
    } catch (error) {
      console.error('Error loading career skills:', error);
      setCareerSkills([]);
    } finally {
      setLoadingCareerSkills(false);
    }
  };

  // Filter skills based on search and filters
  const filteredSkills = availableSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    const matchesSource = sourceFilter === 'all' || skill.source === sourceFilter;
    const notExisting = !existingSkillIds.includes(skill.id);
    
    return matchesSearch && matchesCategory && matchesSource && notExisting;
  });

  // Get unique categories and sources
  const categories = Array.from(new Set(availableSkills.map(skill => skill.category)));
  const sources = Array.from(new Set(availableSkills.map(skill => skill.source)));

  const handleSkillToggle = (skillId: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
    } else {
      newSelected.add(skillId);
    }
    setSelectedSkills(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSkills.size === filteredSkills.length) {
      setSelectedSkills(new Set());
    } else {
      setSelectedSkills(new Set(filteredSkills.map(skill => skill.id)));
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setImportProgress(0);
      
      // Combine skills from both sources (career skills and Firestore skills)
      const allAvailableSkills = [...availableSkills, ...careerSkills];
      const skillsToImport = allAvailableSkills.filter(skill => selectedSkills.has(skill.id));
      
      // Simulate progress for better UX
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      onImport(skillsToImport);
      setSelectedSkills(new Set());
      onClose();
    } catch (error) {
      console.error('Error importing skills:', error);
    } finally {
      setLoading(false);
      setImportProgress(0);
    }
  };

  const renderOverviewTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Skill Collections
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Import existing skills from your Firestore database. Skills are automatically categorized and deduplicated.
      </Typography>

      {collections.map((collection, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {collection.name}
              </Typography>
              <Chip label={`${collection.count} items`} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {collection.description}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Import Summary
        </Typography>
        <Typography variant="body2">
          • Total Skills Available: {availableSkills.length}
        </Typography>
        <Typography variant="body2">
          • Already in Constellation: {existingSkillIds.length}
        </Typography>
        <Typography variant="body2">
          • Available to Import: {filteredSkills.length}
        </Typography>
        <Typography variant="body2">
          • Selected for Import: {selectedSkills.size}
        </Typography>
      </Box>
    </Box>
  );

  const renderSkillsTab = () => (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <MenuItem value="all">All Sources</MenuItem>
            {sources.map(source => (
              <MenuItem key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          startIcon={selectedSkills.size === filteredSkills.length ? <CheckBox /> : <CheckBoxOutlineBlank />}
          onClick={handleSelectAll}
          size="small"
        >
          {selectedSkills.size === filteredSkills.length ? 'Deselect All' : 'Select All'}
        </Button>
      </Box>

      {/* Skills List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredSkills.map((skill) => (
            <ListItem
              key={skill.id}
              button
              onClick={() => handleSkillToggle(skill.id)}
              sx={{ 
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 1,
                borderRadius: 1,
                backgroundColor: selectedSkills.has(skill.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              }}
            >
              <Checkbox
                checked={selectedSkills.has(skill.id)}
                onChange={() => handleSkillToggle(skill.id)}
                sx={{ mr: 1 }}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">{skill.name}</Typography>
                    <Chip label={skill.category} size="small" variant="outlined" />
                    {skill.usageCount > 0 && (
                      <Chip 
                        label={`${skill.usageCount} users`} 
                        size="small" 
                        sx={{ backgroundColor: '#00B162', color: 'white' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {skill.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption">
                        Level: {skill.level}
                      </Typography>
                      <Typography variant="caption">
                        XP: {skill.xpReward}
                      </Typography>
                      <Typography variant="caption">
                        Source: {skill.source}
                      </Typography>
                      {skill.careerTitle && (
                        <Typography variant="caption">
                          Career: {skill.careerTitle}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {filteredSkills.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No skills found matching your criteria
          </Typography>
        </Box>
      )}
    </Box>
  );


  const renderCareerSkillsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {careerName} Skills
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These are the skills defined for the {careerName} career path in your database.
        They will be automatically imported and positioned in the constellation.
      </Typography>

      {loadingCareerSkills ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : careerSkills.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No skills found for this career path in the database.
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              size="small"
              onClick={() => {
                const allCareerSkillIds = careerSkills.map(s => s.id);
                const hasAll = allCareerSkillIds.every(id => selectedSkills.has(id));
                setSelectedSkills(prev => {
                  const newSet = new Set(prev);
                  if (hasAll) {
                    allCareerSkillIds.forEach(id => newSet.delete(id));
                  } else {
                    allCareerSkillIds.forEach(id => newSet.add(id));
                  }
                  return newSet;
                });
              }}
            >
              {careerSkills.every(skill => selectedSkills.has(skill.id)) ? 'Deselect All Career Skills' : 'Select All Career Skills'}
            </Button>
          </Box>

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {careerSkills.map((skill) => (
              <ListItem
                key={skill.id}
                button
                onClick={() => handleSkillToggle(skill.id)}
                sx={{ 
                  border: '1px solid rgba(0, 177, 98, 0.3)',
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: selectedSkills.has(skill.id) ? 'rgba(0, 177, 98, 0.1)' : 'rgba(0, 177, 98, 0.05)',
                }}
              >
                <Checkbox
                  checked={selectedSkills.has(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                  sx={{ mr: 1, color: '#00B162' }}
                />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{skill.name}</Typography>
                      <Chip 
                        label={skill.category} 
                        size="small" 
                        sx={{ backgroundColor: '#00B162', color: 'white' }}
                      />
                      <Chip 
                        label={`Level ${skill.level}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderColor: '#00B162', color: '#00B162' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {skill.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {skill.usageCount > 0 && (
                          <Typography variant="caption">
                            Est. Hours: {skill.usageCount}
                          </Typography>
                        )}
                        <Typography variant="caption">
                          From: {skill.careerTitle}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudDownload />
          <Typography variant="h6">
            Import Skills {careerName ? `for ${careerName}` : 'from Firestore'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {importProgress > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Importing skills...
            </Typography>
            <LinearProgress variant="determinate" value={importProgress} />
          </Box>
        )}

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          {careerPath && careerPath !== 'general' && (
            <Tab label={`${careerName || 'Career'} Skills (${careerSkills.length})`} />
          )}
          <Tab label="Overview" />
          <Tab label={`Skills Browser (${filteredSkills.length})`} />
        </Tabs>

        {careerPath && careerPath !== 'general' ? (
          <>
            {tabValue === 0 && renderCareerSkillsTab()}
            {tabValue === 1 && renderOverviewTab()}
            {tabValue === 2 && renderSkillsTab()}
          </>
        ) : (
          <>
            {tabValue === 0 && renderOverviewTab()}
            {tabValue === 1 && renderSkillsTab()}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={selectedSkills.size === 0 || loading}
          startIcon={<CloudDownload />}
        >
          Import {selectedSkills.size} Skill{selectedSkills.size !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkillImportDialog;