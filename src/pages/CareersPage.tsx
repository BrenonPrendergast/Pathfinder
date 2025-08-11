import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Work,
  AttachMoney,
  TrendingUp,
  ArrowForward,
  Category,
  Computer,
  LocalHospital,
  Business,
  School,
  Construction,
  Palette,
  Science,
  Restaurant,
  Gavel,
  LocalShipping,
  Agriculture,
  Factory
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { careerService, careerFieldsService, Career, CAREER_FIELDS, CareerFieldKey } from '../services';


const CareersPage: React.FC = () => {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [displayedCareers, setDisplayedCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Career[]>([]);
  const [searching, setSearching] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedField, setSelectedField] = useState<CareerFieldKey | null>(null);
  const [fieldCareers, setFieldCareers] = useState<Career[]>([]);
  const [fieldCareersCache, setFieldCareersCache] = useState<Record<CareerFieldKey, Career[]>>({} as Record<CareerFieldKey, Career[]>);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [letterFilteredCareers, setLetterFilteredCareers] = useState<Career[]>([]);
  const [fieldCareerCounts, setFieldCareerCounts] = useState<Record<CareerFieldKey, number>>({} as Record<CareerFieldKey, number>);
  const [countsLoading, setCountsLoading] = useState(false);
  
  const CAREERS_PER_PAGE = 20;

  // Field icons mapping for new industry classifications
  const fieldIcons: Record<CareerFieldKey, React.ReactElement> = {
    accommodation_food: <Restaurant />,
    admin_support: <Business />,
    agriculture_forestry: <Agriculture />,
    arts_entertainment: <Palette />,
    construction: <Construction />,
    educational: <School />,
    finance_insurance: <AttachMoney />,
    government: <Gavel />,
    healthcare_social: <LocalHospital />,
    information: <Computer />,
    management: <Category />,
    manufacturing: <Factory />,
    mining_extraction: <Factory />,
    other_services: <Work />,
    professional_scientific: <Science />,
    real_estate: <Business />,
    retail_trade: <Work />,
    transportation_warehousing: <LocalShipping />,
    utilities: <Factory />,
    wholesale_trade: <LocalShipping />
  };

  useEffect(() => {
    loadInitialCareers();
    // Load field counts asynchronously without blocking the UI
    loadFieldCareerCountsOptimized();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      // Reset to showing all careers if no other filters are active
      if (!selectedField && !selectedLetter) {
        setDisplayedCareers(careers);
      }
      return;
    }

    // Clear field and letter filters when searching
    if (selectedField) {
      setSelectedField(null);
      setFieldCareers([]);
    }
    if (selectedLetter) {
      setSelectedLetter(null);
      setLetterFilteredCareers([]);
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await careerService.searchCareers(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, careers, selectedField, selectedLetter]);

  const loadInitialCareers = async () => {
    try {
      setLoading(true);
      const response = await careerService.getCareers(CAREERS_PER_PAGE);
      setCareers(response.careers);
      setDisplayedCareers(response.careers);
      setLastDoc(response.lastDoc);
      setHasMore(response.hasMore);
    } catch (error) {
      setError('Failed to load careers. Please try again later.');
      console.error('Error loading careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCareers = async () => {
    try {
      setLoadingMore(true);
      const response = await careerService.getCareers(CAREERS_PER_PAGE, lastDoc);
      
      if (response.careers.length > 0) {
        const newCareers = [...careers, ...response.careers];
        setCareers(newCareers);
        setDisplayedCareers(newCareers);
        setLastDoc(response.lastDoc);
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Error loading more careers:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadFieldCareerCountsOptimized = async () => {
    try {
      setCountsLoading(true);
      
      // Clear local cache when reloading counts (e.g., after admin updates)
      setFieldCareersCache({} as Record<CareerFieldKey, Career[]>);
      
      // Get all careers once and calculate counts client-side
      // This is much more efficient than 18+ separate API calls
      const response = await careerService.getCareers(1000); // Get a large batch
      const allCareers = response.careers;
      
      const counts: Record<CareerFieldKey, number> = {} as Record<CareerFieldKey, number>;
      
      // Initialize all counts to 0
      Object.keys(CAREER_FIELDS).forEach(fieldKey => {
        counts[fieldKey as CareerFieldKey] = 0;
      });
      
      // Count careers for each field
      allCareers.forEach(career => {
        // Handle both new fields array and legacy single field
        if (career.fields && career.fields.length > 0) {
          career.fields.forEach(fieldKey => {
            if (counts[fieldKey] !== undefined) {
              counts[fieldKey]++;
            }
          });
        } else if ((career as any).field) {
          // Handle legacy single field format
          const legacyField = (career as any).field as CareerFieldKey;
          if (counts[legacyField] !== undefined) {
            counts[legacyField]++;
          }
        }
      });
      
      setFieldCareerCounts(counts);
    } catch (error) {
      console.error('Error loading field career counts:', error);
      // Set default counts to prevent endless loading
      const defaultCounts: Record<CareerFieldKey, number> = {} as Record<CareerFieldKey, number>;
      Object.keys(CAREER_FIELDS).forEach(fieldKey => {
        defaultCounts[fieldKey as CareerFieldKey] = 0;
      });
      setFieldCareerCounts(defaultCounts);
    } finally {
      setCountsLoading(false);
    }
  };

  const handleFieldSelect = async (fieldKey: CareerFieldKey | string) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      // Clear other filters when selecting a field
      setSelectedLetter(null);
      setLetterFilteredCareers([]);
      
      if (fieldKey === '' || fieldKey === null) {
        // "All Fields" selected - reset to show all careers
        setSelectedField(null);
        setFieldCareers([]);
        setDisplayedCareers(careers);
      } else {
        const fieldKeyTyped = fieldKey as CareerFieldKey;
        setSelectedField(fieldKeyTyped);
        
        // Check if we have cached data for this specific field
        if (fieldCareersCache[fieldKeyTyped] && fieldCareersCache[fieldKeyTyped].length > 0) {
          // Use cached data for this field
          const cachedCareers = fieldCareersCache[fieldKeyTyped];
          setFieldCareers(cachedCareers);
          setDisplayedCareers(cachedCareers);
        } else {
          // Fetch data for this field
          const fieldCareersData = await careerFieldsService.getCareersByField(fieldKeyTyped);
          
          // Update both the current field state and the cache
          setFieldCareers(fieldCareersData);
          setDisplayedCareers(fieldCareersData);
          setFieldCareersCache(prev => ({
            ...prev,
            [fieldKeyTyped]: fieldCareersData
          }));
        }
      }
    } catch (error) {
      console.error('Error loading field careers:', error);
      setError('Failed to load careers for this field. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleLetterFilter = async (letter: string) => {
    // Clear field selection when using letter filter
    setSelectedField(null);
    setFieldCareers([]);
    
    if (selectedLetter === letter) {
      // Deselect current letter
      setSelectedLetter(null);
      setLetterFilteredCareers([]);
      setDisplayedCareers(careers);
    } else {
      // Select new letter - need to get ALL careers to filter properly
      setSelectedLetter(letter);
      setLoading(true);
      
      try {
        // Get more careers to ensure we have all careers starting with this letter
        const response = await careerService.getCareers(1000); // Get a large batch
        const filtered = response.careers.filter(career => 
          career.title.charAt(0).toUpperCase() === letter
        );
        setLetterFilteredCareers(filtered);
        setDisplayedCareers(filtered);
      } catch (error) {
        console.error('Error filtering by letter:', error);
        // Fallback to filtering current careers
        const filtered = careers.filter(career => 
          career.title.charAt(0).toUpperCase() === letter
        );
        setLetterFilteredCareers(filtered);
        setDisplayedCareers(filtered);
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate alphabet array
  const alphabet = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));

  const getCurrentDisplayedCareers = () => {
    if (searchTerm.trim()) {
      return searchResults;
    }
    
    if (selectedField) {
      return fieldCareers;
    }
    
    if (selectedLetter) {
      return letterFilteredCareers;
    }
    
    return displayedCareers;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatSalary = (salary?: { min: number; max: number; median: number }) => {
    if (!salary) return 'Salary info not available';
    return `$${(salary.min / 1000).toFixed(0)}K - $${(salary.max / 1000).toFixed(0)}K`;
  };

  return (
    <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Explore Career Paths 
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover over 1,000 career opportunities from the O*NET database. Search by keywords or browse by industry field.
        </Typography>

        {/* Search Bar and Career Field Selector on same line */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            placeholder="Search careers, skills, or job descriptions... (try 'actors', 'software', 'nurse')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flex: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(25, 118, 210, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(25, 118, 210, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searching ? <CircularProgress size={20} /> : <Search />}
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ 
            flex: 1, 
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(25, 118, 210, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(25, 118, 210, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}>
            <InputLabel>Select Career Field (Optional)</InputLabel>
            <Select
              value={selectedField || ''}
              label="Select Career Field (Optional)"
              onChange={(e) => handleFieldSelect(e.target.value as CareerFieldKey)}
            >
              <MenuItem value="">
                <em>All Fields</em>
              </MenuItem>
              {Object.entries(CAREER_FIELDS).map(([fieldKey, fieldInfo]) => (
                <MenuItem key={fieldKey} value={fieldKey}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ fontSize: '1.2rem', minWidth: 24 }}>
                      {fieldIcons[fieldKey as CareerFieldKey]}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {fieldInfo.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {countsLoading 
                          ? 'Loading...'
                          : fieldCareerCounts[fieldKey as CareerFieldKey] !== undefined
                            ? `${fieldCareerCounts[fieldKey as CareerFieldKey]} careers available`
                            : 'Loading...'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Alphabetical Filter */}
        {!searchTerm.trim() && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filter by First Letter:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              mb: 2
            }}>
              {alphabet.map((letter) => (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "contained" : "outlined"}
                  size="small"
                  sx={{ 
                    minWidth: '40px',
                    height: '40px',
                    fontSize: '0.875rem'
                  }}
                  onClick={() => handleLetterFilter(letter)}
                >
                  {letter}
                </Button>
              ))}
              {selectedLetter && (
                <Button
                  variant="text"
                  size="small"
                  color="secondary"
                  onClick={() => handleLetterFilter(selectedLetter)}
                  sx={{ ml: 2 }}
                >
                  Clear Filter
                </Button>
              )}
            </Box>
            {selectedLetter && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {letterFilteredCareers.length} careers starting with "{selectedLetter}"
                </Typography>
              )}
            </Box>
          )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {getCurrentDisplayedCareers().length === 0 && searchTerm.trim() && (
                <Alert severity="info" sx={{ mb: 4 }}>
                  No careers found matching "{searchTerm}". Try searching for "software", "nurse", "teacher", or "engineer".
                </Alert>
              )}

              {getCurrentDisplayedCareers().length === 0 && selectedLetter && !searchTerm.trim() && (
                <Alert severity="info" sx={{ mb: 4 }}>
                  No careers found starting with "{selectedLetter}". Try a different letter.
                </Alert>
              )}

              <Grid container spacing={3}>
                {getCurrentDisplayedCareers().map((career) => (
                  <Grid item xs={12} md={6} lg={4} key={career.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                          <Work color="primary" />
                          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                            {career.title}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {career.description.length > 150 
                            ? `${career.description.substring(0, 150)}...` 
                            : career.description
                          }
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip 
                            label={career.difficulty} 
                            color={getDifficultyColor(career.difficulty) as any}
                            size="small" 
                          />
                          <Chip 
                            label={`${career.estimatedTimeToMaster} months`} 
                            icon={<TrendingUp />}
                            size="small" 
                            variant="outlined"
                          />
                        </Box>

                        {career.averageSalary && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AttachMoney color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              {formatSalary(career.averageSalary)}
                            </Typography>
                          </Box>
                        )}

                        <Typography variant="caption" color="text.secondary">
                          Skills: {career.skills.slice(0, 3).map(s => s.skillName).join(', ')}
                          {career.skills.length > 3 && ` +${career.skills.length - 3} more`}
                        </Typography>
                      </CardContent>

                      <CardActions>
                        <Button 
                          size="small" 
                          endIcon={<ArrowForward />}
                          onClick={() => navigate(`/careers/${career.id}`)}
                        >
                          Learn More
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Load More Button */}
              {!loading && !searchTerm.trim() && !selectedField && !selectedLetter && displayedCareers.length > 0 && hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button 
                    variant="outlined" 
                    onClick={loadMoreCareers}
                    disabled={loadingMore}
                    startIcon={loadingMore ? <CircularProgress size={20} /> : undefined}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Careers'}
                  </Button>
                </Box>
              )}
            </>
          )}
    </Box>
  );
};

export default CareersPage;