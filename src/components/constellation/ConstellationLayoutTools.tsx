import React, { useState } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  GridOn,
  AccountTree,
  Refresh,
  CenterFocusStrong,
  Timeline,
  ScatterPlot,
  DonutSmall,
  Settings,
} from '@mui/icons-material';
import { Node, Edge } from '@xyflow/react';

interface ConstellationLayoutToolsProps {
  nodes: Node[];
  edges: Edge[];
  onLayoutChange: (nodes: Node[], layoutType: string) => void;
}

interface LayoutSettings {
  algorithm: 'force' | 'circular' | 'hierarchical' | 'grid' | 'spiral';
  spacing: number;
  centerX: number;
  centerY: number;
  groupByCategory: boolean;
  preserveConnections: boolean;
  animateTransition: boolean;
}

const ConstellationLayoutTools: React.FC<ConstellationLayoutToolsProps> = ({
  nodes,
  edges,
  onLayoutChange,
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [settings, setSettings] = useState<LayoutSettings>({
    algorithm: 'force',
    spacing: 150,
    centerX: 400,
    centerY: 300,
    groupByCategory: true,
    preserveConnections: true,
    animateTransition: true,
  });

  // Force-directed layout algorithm
  const applyForceDirectedLayout = (): Node[] => {
    const nodeMap = new Map(nodes.map(node => [node.id, { 
      ...node, 
      position: { ...node.position },
      vx: 0, 
      vy: 0 
    }]));
    
    const iterations = 300;
    const forceStrength = 0.1;
    const repulsionStrength = 5000;
    const damping = 0.9;

    for (let i = 0; i < iterations; i++) {
      // Apply repulsive forces between all nodes
      for (const [id1, node1] of Array.from(nodeMap.entries())) {
        for (const [id2, node2] of Array.from(nodeMap.entries())) {
          if (id1 !== id2) {
            const dx = node2.position.x - node1.position.x;
            const dy = node2.position.y - node1.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) + 1;
            const force = repulsionStrength / (distance * distance);
            
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            node1.vx -= fx;
            node1.vy -= fy;
            node2.vx += fx;
            node2.vy += fy;
          }
        }
      }

      // Apply attractive forces along edges
      edges.forEach(edge => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        
        if (source && target) {
          const dx = target.position.x - source.position.x;
          const dy = target.position.y - source.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const desiredDistance = settings.spacing;
          
          const force = (distance - desiredDistance) * forceStrength;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Update positions and apply damping
      for (const [, node] of Array.from(nodeMap.entries())) {
        node.position.x += node.vx;
        node.position.y += node.vy;
        node.vx *= damping;
        node.vy *= damping;
      }
    }

    return Array.from(nodeMap.values()).map(node => ({
      ...node,
      position: { ...node.position }
    }));
  };

  // Circular layout algorithm
  const applyCircularLayout = (): Node[] => {
    const categories = settings.groupByCategory 
      ? Array.from(new Set(nodes.map(node => node.data.category || 'general')))
      : ['all'];
    
    const updatedNodes: Node[] = [];
    
    categories.forEach((category, categoryIndex) => {
      const categoryNodes = settings.groupByCategory 
        ? nodes.filter(node => (node.data.category || 'general') === category)
        : nodes;
      
      const radius = 200 + (categoryIndex * 150);
      const centerX = settings.centerX + (categoryIndex % 3) * 400;
      const centerY = settings.centerY + Math.floor(categoryIndex / 3) * 400;
      
      categoryNodes.forEach((node, nodeIndex) => {
        const angle = (nodeIndex / categoryNodes.length) * 2 * Math.PI;
        updatedNodes.push({
          ...node,
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          },
        });
      });
    });
    
    return updatedNodes;
  };

  // Hierarchical layout algorithm
  const applyHierarchicalLayout = (): Node[] => {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, level: 0 }]));
    
    // Calculate node levels based on prerequisites
    const calculateLevels = () => {
      let changed = true;
      while (changed) {
        changed = false;
        edges.forEach(edge => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (source && target && target.level <= source.level) {
            target.level = source.level + 1;
            changed = true;
          }
        });
      }
    };
    
    calculateLevels();
    
    // Group nodes by level
    const levels = new Map<number, Node[]>();
    for (const node of Array.from(nodeMap.values())) {
      if (!levels.has(node.level)) {
        levels.set(node.level, []);
      }
      levels.get(node.level)!.push(node);
    }
    
    // Position nodes
    const updatedNodes: Node[] = [];
    for (const [level, levelNodes] of Array.from(levels.entries())) {
      levelNodes.forEach((node, index) => {
        const x = (index - levelNodes.length / 2) * settings.spacing + settings.centerX;
        const y = level * settings.spacing + settings.centerY;
        updatedNodes.push({
          ...node,
          position: { x, y },
        });
      });
    }
    
    return updatedNodes;
  };

  // Grid layout algorithm
  const applyGridLayout = (): Node[] => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % cols) * settings.spacing + settings.centerX,
        y: Math.floor(index / cols) * settings.spacing + settings.centerY,
      },
    }));
  };

  // Spiral layout algorithm
  const applySpiralLayout = (): Node[] => {
    const categories = settings.groupByCategory 
      ? Array.from(new Set(nodes.map(node => node.data.category || 'general')))
      : ['all'];
    
    const updatedNodes: Node[] = [];
    
    categories.forEach((category, categoryIndex) => {
      const categoryNodes = settings.groupByCategory 
        ? nodes.filter(node => (node.data.category || 'general') === category)
        : nodes;
      
      const centerX = settings.centerX + (categoryIndex % 3) * 600;
      const centerY = settings.centerY + Math.floor(categoryIndex / 3) * 600;
      
      categoryNodes.forEach((node, nodeIndex) => {
        const angle = nodeIndex * 0.5;
        const radius = 50 + nodeIndex * 15;
        
        updatedNodes.push({
          ...node,
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          },
        });
      });
    });
    
    return updatedNodes;
  };

  const applyLayout = (algorithm: string) => {
    let newNodes: Node[] = [];
    
    switch (algorithm) {
      case 'force':
        newNodes = applyForceDirectedLayout();
        break;
      case 'circular':
        newNodes = applyCircularLayout();
        break;
      case 'hierarchical':
        newNodes = applyHierarchicalLayout();
        break;
      case 'grid':
        newNodes = applyGridLayout();
        break;
      case 'spiral':
        newNodes = applySpiralLayout();
        break;
      default:
        newNodes = nodes;
    }
    
    onLayoutChange(newNodes, algorithm);
  };

  return (
    <Box>
      {/* Quick Layout Buttons */}
      <ButtonGroup variant="outlined" size="small">
        <Tooltip title="Force-Directed Layout">
          <Button onClick={() => applyLayout('force')}>
            <AccountTree />
          </Button>
        </Tooltip>
        
        <Tooltip title="Circular Layout">
          <Button onClick={() => applyLayout('circular')}>
            <DonutSmall />
          </Button>
        </Tooltip>
        
        <Tooltip title="Hierarchical Layout">
          <Button onClick={() => applyLayout('hierarchical')}>
            <Timeline />
          </Button>
        </Tooltip>
        
        <Tooltip title="Grid Layout">
          <Button onClick={() => applyLayout('grid')}>
            <GridOn />
          </Button>
        </Tooltip>
        
        <Tooltip title="Spiral Layout">
          <Button onClick={() => applyLayout('spiral')}>
            <ScatterPlot />
          </Button>
        </Tooltip>
        
        <Tooltip title="Center View">
          <Button onClick={() => onLayoutChange(nodes, 'center')}>
            <CenterFocusStrong />
          </Button>
        </Tooltip>
        
        <Tooltip title="Advanced Settings">
          <Button onClick={() => setShowAdvancedSettings(true)}>
            <Settings />
          </Button>
        </Tooltip>
      </ButtonGroup>

      {/* Advanced Layout Settings Dialog */}
      <Dialog
        open={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Layout Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Layout Algorithm</InputLabel>
              <Select
                value={settings.algorithm}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  algorithm: e.target.value as LayoutSettings['algorithm'] 
                }))}
              >
                <MenuItem value="force">Force-Directed</MenuItem>
                <MenuItem value="circular">Circular</MenuItem>
                <MenuItem value="hierarchical">Hierarchical</MenuItem>
                <MenuItem value="grid">Grid</MenuItem>
                <MenuItem value="spiral">Spiral</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>Node Spacing</Typography>
            <Slider
              value={settings.spacing}
              onChange={(_, value) => setSettings(prev => ({ ...prev, spacing: value as number }))}
              min={50}
              max={400}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Center X"
                type="number"
                value={settings.centerX}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  centerX: parseInt(e.target.value) 
                }))}
                fullWidth
              />
              <TextField
                label="Center Y"
                type="number"
                value={settings.centerY}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  centerY: parseInt(e.target.value) 
                }))}
                fullWidth
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.groupByCategory}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    groupByCategory: e.target.checked 
                  }))}
                />
              }
              label="Group by Category"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.preserveConnections}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    preserveConnections: e.target.checked 
                  }))}
                />
              }
              label="Preserve Connections"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.animateTransition}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    animateTransition: e.target.checked 
                  }))}
                />
              }
              label="Animate Layout Changes"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedSettings(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              applyLayout(settings.algorithm);
              setShowAdvancedSettings(false);
            }}
          >
            Apply Layout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConstellationLayoutTools;