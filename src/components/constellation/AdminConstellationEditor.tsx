import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  SelectionMode,
  OnConnectStartParams,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Typography,
  Button,
  Paper,
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
} from '@mui/material';
import {
  Save,
  Add,
  Edit,
  Delete,
  Undo,
  Redo,
  ContentCopy,
  Upload,
  Download,
  Settings,
  Visibility,
  VisibilityOff,
  Link,
  LinkOff,
  Grid3x3,
  Layers,
  Info,
  GridOn,
  GridOff,
  Tune,
  ZoomIn,
  ZoomOut,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import SkillStarNode from './SkillStarNode';
import ConstellationEdge from './ConstellationEdge';
import ConstellationContextMenu from './ConstellationContextMenu';
import ConstellationLayoutTools from './ConstellationLayoutTools';
import SkillImportDialog from './SkillImportDialog';
import ConnectionWizard from './ConnectionWizard';
import { skillService } from '../../services/skill/skill.service';

// Admin-specific node and edge types
const adminNodeTypes = {
  skillStar: SkillStarNode,
};

const adminEdgeTypes = {
  constellation: ConstellationEdge,
};

interface AdminConstellationEditorProps {
  careerPath?: string;
  careerName?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onCancel?: () => void;
}

interface SkillEditData {
  id: string;
  name: string;
  description: string;
  level: number;
  category: string;
  xpReward: number;
  prerequisites: string[];
  starType: 'main-sequence' | 'giant' | 'supergiant' | 'dwarf';
}

const AdminConstellationEditor: React.FC<AdminConstellationEditorProps> = ({
  careerPath = 'general',
  careerName,
  onSave,
  onCancel
}) => {
  const { userProfile, isAdmin } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  
  // Admin state
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [editingNode, setEditingNode] = useState<SkillEditData | null>(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);
  const [isConnectingMode, setIsConnectingMode] = useState(false);
  const [undoStack, setUndoStack] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [redoStack, setRedoStack] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    type: 'node' | 'edge' | 'canvas' | null;
    selectedCount: number;
  } | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showConnectionWizard, setShowConnectionWizard] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'none' | 'creating' | 'tutorial' | 'deleting'>('none');
  const [firstSelectedNode, setFirstSelectedNode] = useState<string | null>(null);
  const [selectedEdgeForDeletion, setSelectedEdgeForDeletion] = useState<Edge | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Grid and scaling state
  const [gridSize, setGridSize] = useState(50);
  const [nodeScale, setNodeScale] = useState(1);
  const [textScale, setTextScale] = useState(1);
  const [showGridSettings, setShowGridSettings] = useState(false);
  // Node color customization by star type
  const [starColors, setStarColors] = useState({
    'main-sequence': '#6366f1',
    'giant': '#f59e0b', 
    'supergiant': '#ef4444',
    'dwarf': '#8b5cf6'
  });

  // Grid snapping is now handled natively by React Flow with snapToGrid and snapGrid props

  // Load initial data
  useEffect(() => {
    if (isAdmin()) {
      loadSkillsForEditing();
      setIsEditing(true);
    }
  }, [careerPath, isAdmin]);

  // Update node data when connection mode, first selected node, scale, or colors change
  useEffect(() => {
    setNodes(prev => prev.map(node => ({
      ...node,
      data: {
        ...node.data,
        connectionMode,
        isFirstSelected: firstSelectedNode === node.id,
        nodeScale,
        textScale,
        starColors,
      }
    })));
  }, [connectionMode, firstSelectedNode, nodeScale, textScale, starColors, setNodes]);

  // Update edges when connection mode changes to show delete mode styling
  useEffect(() => {
    setEdges(currentEdges => 
      currentEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          isDeleteMode: connectionMode === 'deleting'
        }
      }))
    );
  }, [connectionMode, setEdges]);

  const loadSkillsForEditing = async () => {
    try {
      console.log(`Loading skills for career path: ${careerPath}`);
      const skillsData = await skillService.getSkillsByCareerPath(careerPath);
      console.log(`Loaded ${skillsData.length} skills:`, skillsData);
      
      const processedData = processSkillsForAdmin(skillsData);
      console.log(`Processed into ${processedData.nodes.length} nodes and ${processedData.edges.length} edges`);
      
      setNodes(processedData.nodes);
      setEdges(processedData.edges);
      saveToHistory(processedData.nodes, processedData.edges);
      
      // Show user feedback about data source
      const displayName = careerName || careerPath;
      if (skillsData.length > 0 && skillsData[0].id && !skillsData[0].id.startsWith('temp_')) {
        showInfo(`Loaded saved constellation data for ${displayName}`, 'Data Loaded');
      } else {
        showWarning(`Using default template for ${displayName} - no saved data found`, 'Default Template');
      }
    } catch (error) {
      console.error('Error loading skills for editing:', error);
      showError(`Failed to load skills: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Load Failed');
    }
  };

  const processSkillsForAdmin = (rawSkills: any[]): { nodes: Node[], edges: Edge[] } => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const constellations = groupSkillsByConstellation(rawSkills);

    Object.entries(constellations).forEach(([constellation, constellationSkills], constellationIndex) => {
      const centerX = (constellationIndex % 3) * 800 + 400;
      const centerY = Math.floor(constellationIndex / 3) * 600 + 300;
      
      (constellationSkills as any[]).forEach((skill: any, skillIndex: number) => {
        // Use saved position if available, otherwise calculate default position
        let position;
        if (skill.position && typeof skill.position.x === 'number' && typeof skill.position.y === 'number') {
          position = { x: skill.position.x, y: skill.position.y };
          console.log(`Using saved position for ${skill.name}:`, position);
        } else {
          // Calculate default constellation position
          const angle = (skillIndex * 2.4) + (constellationIndex * 0.8);
          const radius = 80 + (skillIndex * 30);
          position = {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          };
          console.log(`Using calculated position for ${skill.name}:`, position);
        }

        newNodes.push({
          id: skill.id,
          type: 'skillStar',
          position,
          data: {
            ...skill,
            isUnlocked: userProfile?.completedQuests?.some(questId => questId.includes(skill.id)) || false,
            isAvailable: true, // In admin mode, all skills are available for editing
            onSelect: () => handleNodeSelect(skill.id),
            onEdit: () => handleNodeEdit(skill),
            starColors,
            textScale,
            isAdminMode: true,
          },
          draggable: true,
          connectable: true,
        });

        // Create edges for prerequisites
        skill.prerequisites?.forEach((prereqId: string) => {
          if (rawSkills.find(s => s.id === prereqId)) {
            newEdges.push({
              id: `${prereqId}-${skill.id}`,
              source: prereqId,
              target: skill.id,
              type: 'constellation',
              data: {
                isActive: false,
                isAvailable: true,
                canEdit: true,
              },
            });
          }
        });
      });
    });

    return { nodes: newNodes, edges: newEdges };
  };

  const groupSkillsByConstellation = (skills: any[]) => {
    return skills.reduce((groups, skill) => {
      const constellation = skill.category || 'general';
      if (!groups[constellation]) {
        groups[constellation] = [];
      }
      groups[constellation].push(skill);
      return groups;
    }, {} as Record<string, any[]>);
  };

  // History management
  const saveToHistory = (newNodes: Node[], newEdges: Edge[]) => {
    setUndoStack(prev => [...prev.slice(-9), { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, { nodes: [...nodes], edges: [...edges] }]);
      setUndoStack(prev => prev.slice(0, -1));
      setNodes(previous.nodes);
      setEdges(previous.edges);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, { nodes: [...nodes], edges: [...edges] }]);
      setRedoStack(prev => prev.slice(0, -1));
      setNodes(next.nodes);
      setEdges(next.edges);
    }
  };

  // Node operations
  const handleNodeSelect = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Handle connection mode selection
      if (connectionMode === 'creating') {
        if (!firstSelectedNode) {
          // First selection - this is the prerequisite
          setFirstSelectedNode(nodeId);
          showMessage(`Selected prerequisite: ${node.data.name}. Now click the dependent skill.`, 'success');
        } else if (firstSelectedNode !== nodeId) {
          // Second selection - create connection from first to second
          handleCreateConnection(firstSelectedNode, nodeId);
          setFirstSelectedNode(null);
        } else {
          // Same node clicked twice - cancel selection
          setFirstSelectedNode(null);
          showMessage('Selection cancelled. Click a skill to start over.', 'warning');
        }
      } else {
        // Normal selection mode
        setSelectedNodes([node]);
      }
    }
  };

  // Create connection between two nodes
  const handleCreateConnection = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return;

    // Check if connection already exists
    const existingConnection = edges.find(e => e.source === sourceId && e.target === targetId);
    if (existingConnection) {
      showMessage('Connection already exists between these skills.', 'warning');
      return;
    }

    // Create the connection
    saveToHistory(nodes, edges);
    const newEdge: Edge = {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'constellation',
      data: {
        isActive: false,
        isAvailable: true,
        canEdit: true,
      },
    };

    setEdges(prev => [...prev, newEdge]);
    showMessage(`Connected ${sourceNode.data.name} → ${targetNode.data.name}`, 'success');
  };

  const handleNodeEdit = (nodeData: any) => {
    setEditingNode({
      id: nodeData.id,
      name: nodeData.name,
      description: nodeData.description || '',
      level: nodeData.level || 1,
      category: nodeData.category || 'general',
      xpReward: nodeData.xpReward || 10,
      prerequisites: nodeData.prerequisites || [],
      starType: nodeData.starType || 'main-sequence',
    });
  };

  const handleCreateNode = () => {
    const newId = `skill_${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'skillStar',
      position: { x: 400, y: 300 },
      data: {
        id: newId,
        name: 'New Skill',
        description: 'Description for new skill',
        level: 1,
        category: 'general',
        xpReward: 10,
        prerequisites: [],
        starType: 'main-sequence',
        isUnlocked: false,
        isAvailable: true,
        onSelect: () => handleNodeSelect(newId),
        onEdit: () => handleNodeEdit({ id: newId, name: 'New Skill' }),
        textScale,
        isAdminMode: true,
      },
      draggable: true,
      connectable: true,
    };

    saveToHistory(nodes, edges);
    setNodes(prev => [...prev, newNode]);
    setEditingNode({
      id: newId,
      name: 'New Skill',
      description: 'Description for new skill',
      level: 1,
      category: 'general',
      xpReward: 10,
      prerequisites: [],
      starType: 'main-sequence',
    });
  };

  const handleDeleteSelected = () => {
    if (selectedNodes.length === 0) return;

    saveToHistory(nodes, edges);
    
    const nodeIdsToDelete = selectedNodes.map(node => node.id);
    
    // Remove nodes
    setNodes(prev => prev.filter(node => !nodeIdsToDelete.includes(node.id)));
    
    // Remove edges connected to deleted nodes
    setEdges(prev => prev.filter(edge => 
      !nodeIdsToDelete.includes(edge.source) && 
      !nodeIdsToDelete.includes(edge.target)
    ));
    
    setSelectedNodes([]);
    showMessage(`Deleted ${nodeIdsToDelete.length} skill(s)`, 'success');
  };

  const handleSaveNodeEdit = () => {
    if (!editingNode) return;

    saveToHistory(nodes, edges);

    setNodes(prev => prev.map(node => {
      if (node.id === editingNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...editingNode,
          }
        };
      }
      return node;
    }));

    setEditingNode(null);
    showMessage('Skill updated successfully', 'success');
  };

  // Edge operations
  const onConnect = useCallback(
    (params: Connection) => {
      saveToHistory(nodes, edges);
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: 'constellation',
        data: {
          isActive: false,
          isAvailable: true,
          canEdit: true,
          isDeleteMode: connectionMode === 'deleting',
        },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
      showMessage('Connection created', 'success');
    },
    [nodes, edges, setEdges, connectionMode]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (connectionMode === 'deleting') {
      event.stopPropagation();
      setSelectedEdgeForDeletion(edge);
      setShowDeleteDialog(true);
    }
  }, [connectionMode]);

  const handleDeleteSelectedEdges = () => {
    if (selectedEdges.length === 0) return;

    saveToHistory(nodes, edges);
    const edgeIdsToDelete = selectedEdges.map(edge => edge.id);
    setEdges(prev => prev.filter(edge => !edgeIdsToDelete.includes(edge.id!)));
    setSelectedEdges([]);
    showMessage(`Deleted ${edgeIdsToDelete.length} connection(s)`, 'success');
  };

  // Context menu handlers
  const handleContextMenu = (event: React.MouseEvent, type: 'node' | 'edge' | 'canvas', count: number = 0) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      type,
      selectedCount: count,
    });
  };

  const handleContextMenuAction = (action: string) => {
    switch (action) {
      case 'edit':
        if (selectedNodes.length === 1) {
          handleNodeEdit(selectedNodes[0].data);
        }
        break;
      case 'duplicate':
        handleDuplicateNodes();
        break;
      case 'delete':
        handleDeleteSelected();
        break;
      case 'create-skill':
        handleCreateNode();
        break;
      case 'auto-arrange':
        // Will be handled by layout tools
        break;
      default:
        console.log('Context action:', action);
    }
  };

  const handleDuplicateNodes = () => {
    if (selectedNodes.length === 0) return;

    saveToHistory(nodes, edges);
    
    const duplicatedNodes = selectedNodes.map(node => {
      const newId = `${node.id}_copy_${Date.now()}`;
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          ...node.data,
          id: newId,
          name: `${node.data.name} (Copy)`,
        },
      };
    });

    setNodes(prev => [...prev, ...duplicatedNodes]);
    showMessage(`Duplicated ${duplicatedNodes.length} skill(s)`, 'success');
  };

  // Layout change handler
  const handleLayoutChange = (newNodes: Node[], layoutType: string) => {
    saveToHistory(nodes, edges);
    setNodes(newNodes);
    showMessage(`Applied ${layoutType} layout`, 'success');
  };

  // Import skills handler
  const handleImportSkills = (importedSkills: any[]) => {
    saveToHistory(nodes, edges);
    
    const newNodes: Node[] = [];
    
    importedSkills.forEach((skill, index) => {
      // Position imported skills in a grid
      const col = index % 4;
      const row = Math.floor(index / 4);
      const baseX = 200 + col * 200;
      const baseY = 200 + row * 150;
      // React Flow will snap positions automatically, but we can pre-align for consistency
      const position = {
        x: Math.round(baseX / gridSize) * gridSize,
        y: Math.round(baseY / gridSize) * gridSize,
      };

      newNodes.push({
        id: skill.id,
        type: 'skillStar',
        position,
        data: {
          ...skill,
          isUnlocked: false,
          isAvailable: true,
          onSelect: () => handleNodeSelect(skill.id),
          onEdit: () => handleNodeEdit(skill),
          connectionMode,
          isFirstSelected: firstSelectedNode === skill.id,
          nodeScale,
          starColors,
          textScale,
          isAdminMode: true,
        },
        draggable: true,
        connectable: true,
      });
    });

    setNodes(prev => [...prev, ...newNodes]);
    showMessage(`Imported ${importedSkills.length} skills successfully`, 'success');
  };

  // Connection mode handlers
  const handleStartConnectionMode = () => {
    setConnectionMode('creating');
    setIsConnectingMode(true);
    showInfo('Click prerequisite skill first, then click dependent skill to create connection', 'Connection Mode Active');
  };

  const handleStopConnectionMode = () => {
    setConnectionMode('none');
    setIsConnectingMode(false);
    setFirstSelectedNode(null);
    showMessage('Connection mode disabled', 'success');
  };

  // Delete mode handlers
  const handleStartDeleteMode = () => {
    setConnectionMode('deleting');
    showWarning('Click any connection line to delete it', 'Delete Mode Active');
  };

  const handleStopDeleteMode = () => {
    setConnectionMode('none');
    setSelectedEdgeForDeletion(null);
    showMessage('Delete mode disabled', 'success');
  };

  const handleConfirmDeleteConnection = () => {
    if (selectedEdgeForDeletion) {
      saveToHistory(nodes, edges);
      setEdges(prev => prev.filter(e => e.id !== selectedEdgeForDeletion.id));
      
      const sourceNode = nodes.find(n => n.id === selectedEdgeForDeletion.source);
      const targetNode = nodes.find(n => n.id === selectedEdgeForDeletion.target);
      
      showSuccess(
        `Removed prerequisite: ${sourceNode?.data.name || 'Unknown'} → ${targetNode?.data.name || 'Unknown'}`, 
        'Connection Deleted'
      );
    }
    setShowDeleteDialog(false);
    setSelectedEdgeForDeletion(null);
  };

  // Align selected nodes to grid
  const alignSelectedNodesToGrid = () => {
    if (selectedNodes.length === 0) {
      showMessage('No nodes selected for alignment', 'warning');
      return;
    }

    saveToHistory(nodes, edges);
    
    setNodes(prev => prev.map(node => {
      if (selectedNodes.some(selected => selected.id === node.id)) {
        // Use the same snapping logic as React Flow
        const snappedPosition = {
          x: Math.round(node.position.x / gridSize) * gridSize,
          y: Math.round(node.position.y / gridSize) * gridSize,
        };
        return {
          ...node,
          position: snappedPosition,
        };
      }
      return node;
    }));

    showMessage(`Aligned ${selectedNodes.length} node(s) to grid`, 'success');
  };

  // Save operations
  const handleSaveChanges = async () => {
    try {
      showInfo('Saving constellation changes...', 'Saving');
      
      // Convert nodes and edges back to skill format with position data preserved
      const skillsData = nodes.map(node => ({
        id: node.data.id,
        name: node.data.name,
        description: node.data.description || '',
        level: node.data.level || 1,
        category: node.data.category || 'General',
        xpReward: node.data.xpReward || 10,
        prerequisites: edges
          .filter(edge => edge.target === node.id)
          .map(edge => edge.source),
        starType: node.data.starType || 'main-sequence',
        constellation: careerPath,
        // Preserve position data for constellation layout
        position: {
          x: node.position.x,
          y: node.position.y
        }
      }));

      console.log('Saving constellation data:', { careerPath, skillsData, totalNodes: nodes.length, totalEdges: edges.length });
      
      // Save to Firebase
      await skillService.saveSkillConstellation(careerPath, skillsData);
      console.log('Successfully saved to Firestore');
      
      // Reload data to verify save and update UI
      console.log('Reloading data to verify save...');
      await loadSkillsForEditing();
      
      onSave?.(nodes, edges);
      const displayName = careerName || careerPath;
      showSuccess(`Successfully saved ${skillsData.length} skills to constellation`, `${displayName} Saved`);
    } catch (error) {
      console.error('Save error:', error);
      showError(`Error saving changes: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Save Failed');
    }
  };

  const showMessage = (message: string, severity: 'success' | 'error' | 'warning') => {
    switch (severity) {
      case 'success':
        showSuccess(message);
        break;
      case 'error':
        showError(message);
        break;
      case 'warning':
        showWarning(message);
        break;
      default:
        showInfo(message);
    }
  };

  // Connection event handlers for drag-and-drop
  const onConnectStart = useCallback((event: any, params: OnConnectStartParams) => {
    console.log('Connection start:', params.nodeId, params.handleType);
    if (connectionMode !== 'creating') {
      showMessage('Drag-and-drop connection started. Release on target skill.', 'success');
    }
  }, [connectionMode]);

  const onConnectEnd = useCallback((event: any) => {
    console.log('Connection end:', event);
  }, []);

  // Enhanced node/edge change handlers
  const handleNodesChange = (changes: NodeChange[]) => {
    // React Flow handles snapping natively with snapToGrid and snapGrid props
    onNodesChange(changes);
    
    // Track selection changes
    const selectionChanges = changes.filter(change => change.type === 'select');
    if (selectionChanges.length > 0) {
      const selected = nodes.filter(node => node.selected);
      setSelectedNodes(selected);
    }
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    onEdgesChange(changes);
    
    // Track selection changes
    const selectionChanges = changes.filter(change => change.type === 'select');
    if (selectionChanges.length > 0) {
      const selected = edges.filter(edge => edge.selected);
      setSelectedEdges(selected);
    }
  };

  if (!isAdmin()) {
    return (
      <Alert severity="error">
        Admin access required to edit constellation skills.
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '90vh', width: '100%', position: 'relative' }}>
      {/* Admin Toolbar - Left Side Vertical */}
      <Paper sx={{
        position: 'absolute',
        top: 120,
        left: 16,
        zIndex: 1000,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'center',
        background: 'rgba(31, 41, 55, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}>
        <Tooltip 
          title="Add New Skill"
          enterDelay={connectionMode === 'creating' || connectionMode === 'deleting' ? 1000 : 500}
          componentsProps={{
            tooltip: {
              sx: { zIndex: 999 }
            }
          }}
        >
          <IconButton onClick={handleCreateNode} size="small">
            <Add />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Delete Selected">
          <IconButton 
            onClick={handleDeleteSelected} 
            disabled={selectedNodes.length === 0}
            size="small"
          >
            <Delete />
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: '100%', bgcolor: 'rgba(99, 102, 241, 0.3)' }} />

        <Tooltip title="Undo">
          <IconButton onClick={handleUndo} disabled={undoStack.length === 0} size="small">
            <Undo />
          </IconButton>
        </Tooltip>

        <Tooltip title="Redo">
          <IconButton onClick={handleRedo} disabled={redoStack.length === 0} size="small">
            <Redo />
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: '100%', bgcolor: 'rgba(99, 102, 241, 0.3)' }} />

        <Tooltip title="Import Skills">
          <IconButton onClick={() => setShowImportDialog(true)} size="small">
            <Download />
          </IconButton>
        </Tooltip>

        <Tooltip title="Connection Tutorial">
          <IconButton onClick={() => setShowConnectionWizard(true)} size="small">
            <Info />
          </IconButton>
        </Tooltip>

        <Tooltip 
          title={connectionMode === 'creating' ? 'Exit Connection Mode' : 'Connection Mode'}
          enterDelay={connectionMode === 'creating' ? 1500 : 500}
          componentsProps={{
            tooltip: {
              sx: { zIndex: 999, pointerEvents: 'none' }
            }
          }}
        >
          <IconButton 
            onClick={connectionMode === 'creating' ? handleStopConnectionMode : handleStartConnectionMode}
            color={connectionMode === 'creating' ? 'error' : 'default'}
            size="small"
            sx={{
              backgroundColor: connectionMode === 'creating' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              border: firstSelectedNode ? '2px solid #fbbf24' : 'none',
            }}
          >
            <Link />
          </IconButton>
        </Tooltip>

        <Tooltip 
          title={connectionMode === 'deleting' ? 'Exit Delete Mode' : 'Delete Connections'}
          enterDelay={connectionMode === 'deleting' ? 1500 : 500}
          componentsProps={{
            tooltip: {
              sx: { zIndex: 999, pointerEvents: 'none' }
            }
          }}
        >
          <IconButton 
            onClick={connectionMode === 'deleting' ? handleStopDeleteMode : handleStartDeleteMode}
            color={connectionMode === 'deleting' ? 'error' : 'default'}
            size="small"
            sx={{
              backgroundColor: connectionMode === 'deleting' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              border: connectionMode === 'deleting' ? '2px solid #ef4444' : 'none',
            }}
          >
            <LinkOff />
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: '100%', bgcolor: 'rgba(99, 102, 241, 0.3)' }} />

        <Tooltip title="Node & Grid Settings">
          <IconButton onClick={() => setShowGridSettings(true)} size="small">
            <Tune />
          </IconButton>
        </Tooltip>

        <Tooltip title="Scale Down Nodes">
          <IconButton onClick={() => setNodeScale(prev => Math.max(0.5, prev - 0.1))} size="small">
            <ZoomOut />
          </IconButton>
        </Tooltip>

        <Tooltip title="Scale Up Nodes">
          <IconButton onClick={() => setNodeScale(prev => Math.min(2.0, prev + 0.1))} size="small">
            <ZoomIn />
          </IconButton>
        </Tooltip>

        <Tooltip title="Scale Down Text">
          <IconButton 
            onClick={() => setTextScale(prev => Math.max(0.5, prev - 0.1))} 
            size="small"
            sx={{ color: textScale !== 1 ? '#00B162' : 'inherit' }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>T-</Typography>
          </IconButton>
        </Tooltip>

        <Tooltip title="Scale Up Text">
          <IconButton 
            onClick={() => setTextScale(prev => Math.min(2.0, prev + 0.1))} 
            size="small"
            sx={{ color: textScale !== 1 ? '#00B162' : 'inherit' }}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>T+</Typography>
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Selected to Grid">
          <IconButton 
            onClick={alignSelectedNodesToGrid} 
            size="small"
            disabled={selectedNodes.length === 0}
          >
            <Grid3x3 />
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: '100%', bgcolor: 'rgba(99, 102, 241, 0.3)' }} />

        <Tooltip title="Toggle Property Panel">
          <IconButton onClick={() => setShowPropertyPanel(!showPropertyPanel)} size="small">
            {showPropertyPanel ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: '100%', bgcolor: 'rgba(99, 102, 241, 0.3)' }} />

        <Tooltip title="Save Changes">
          <IconButton 
            onClick={handleSaveChanges}
            size="small"
            sx={{
              backgroundColor: '#00B162',
              color: 'white',
              '&:hover': {
                backgroundColor: '#009654',
              }
            }}
          >
            <Save />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cancel">
          <IconButton 
            onClick={onCancel}
            size="small"
            sx={{
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': {
                backgroundColor: '#dc2626',
              }
            }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Constellation Editor Heading */}
      <Paper sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        p: 2,
        background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 2,
      }}>
        <Typography variant="h6" sx={{ 
          color: 'white', 
          fontWeight: 600, 
          textAlign: 'center',
          background: 'linear-gradient(45deg, #00B162, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {careerPath === 'general' ? 'General Skills Constellation' : `${careerName || careerPath} Career Constellation`}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          textAlign: 'center',
          fontSize: '0.85rem',
          mt: 0.5,
        }}>
          {careerPath === 'general' ? 'Editing soft skills and general competencies' : `Editing skills for ${careerName || careerPath} career path`}
        </Typography>
      </Paper>

      {/* Selection Info & Connection Status */}
      {((selectedNodes.length > 0 || selectedEdges.length > 0) || connectionMode === 'creating' || connectionMode === 'deleting') && (
        <Paper sx={{
          position: 'absolute',
          top: 120,
          left: 120,
          zIndex: 1000,
          p: 2,
          background: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(10px)',
        }}>
          <Typography variant="subtitle2" gutterBottom>
            {connectionMode === 'creating' ? 'Connection Mode' : 
             connectionMode === 'deleting' ? 'Delete Mode' : 'Selection Info'}
          </Typography>
          
          {connectionMode === 'deleting' && (
            <Box>
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 500 }}>
                Click any connection to delete it
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Connections will turn red and pulse when hovering
              </Typography>
            </Box>
          )}
          
          {connectionMode === 'creating' && (
            <>
              <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 500 }}>
                {firstSelectedNode 
                  ? `Selected prerequisite: ${nodes.find(n => n.id === firstSelectedNode)?.data.name || 'Unknown'}`
                  : 'Click a skill to select prerequisite'
                }
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {firstSelectedNode ? 'Click dependent skill to create connection' : 'First click = prerequisite, Second click = dependent'}
              </Typography>
            </>
          )}
          
          {connectionMode !== 'creating' && connectionMode !== 'deleting' && (
            <>
              {selectedNodes.length > 0 && (
                <Typography variant="body2">
                  {selectedNodes.length} skill(s) selected
                </Typography>
              )}
              {selectedEdges.length > 0 && (
                <Typography variant="body2">
                  {selectedEdges.length} connection(s) selected
                </Typography>
              )}
            </>
          )}
        </Paper>
      )}

      {/* Property Panel */}
      <Drawer
        anchor="right"
        open={showPropertyPanel}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: 240, // Reduced from 320 to 240
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Constellation Editor
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Career Path: {careerName || careerPath}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Statistics
            </Typography>
            <Chip label={`${nodes.length} Skills`} size="small" sx={{ mr: 1, mb: 1 }} />
            <Chip label={`${edges.length} Connections`} size="small" sx={{ mr: 1, mb: 1 }} />
            <Chip label={`Grid: ${gridSize}px`} size="small" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(99, 102, 241, 0.2)' }} />
            <Chip 
              label={`Scale: ${Math.round(nodeScale * 100)}%`} 
              size="small" 
              sx={{ mr: 1, mb: 1 }} 
            />
            <Chip 
              label={`Text: ${Math.round(textScale * 100)}%`} 
              size="small" 
              sx={{ mr: 1, mb: 1, backgroundColor: textScale !== 1 ? 'rgba(0, 177, 98, 0.2)' : 'inherit' }} 
            />
          </Box>

          {selectedNodes.length === 1 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Skill
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => handleNodeEdit(selectedNodes[0].data)}
                sx={{ mb: 2 }}
              >
                Edit Skill Properties
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={handleCreateNode}
              sx={{ mb: 1 }}
            >
              Add New Skill
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Grid3x3 />}
              sx={{ mb: 1 }}
            >
              Auto Arrange
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Node Edit Dialog */}
      <Dialog
        open={!!editingNode}
        onClose={() => setEditingNode(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Skill Properties</DialogTitle>
        <DialogContent>
          {editingNode && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Skill Name"
                value={editingNode.name}
                onChange={(e) => setEditingNode(prev => prev ? {...prev, name: e.target.value} : null)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editingNode.description}
                onChange={(e) => setEditingNode(prev => prev ? {...prev, description: e.target.value} : null)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Star Type</InputLabel>
                  <Select
                    value={editingNode.starType}
                    onChange={(e) => setEditingNode(prev => prev ? {...prev, starType: e.target.value as any} : null)}
                  >
                    <MenuItem value="dwarf">Dwarf</MenuItem>
                    <MenuItem value="main-sequence">Main Sequence</MenuItem>
                    <MenuItem value="giant">Giant</MenuItem>
                    <MenuItem value="supergiant">Supergiant</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Level"
                  type="number"
                  value={editingNode.level}
                  onChange={(e) => setEditingNode(prev => prev ? {...prev, level: parseInt(e.target.value)} : null)}
                  inputProps={{ min: 1, max: 5 }}
                />

                <TextField
                  label="XP Reward"
                  type="number"
                  value={editingNode.xpReward}
                  onChange={(e) => setEditingNode(prev => prev ? {...prev, xpReward: parseInt(e.target.value)} : null)}
                />
              </Box>

              <TextField
                fullWidth
                label="Category"
                value={editingNode.category}
                onChange={(e) => setEditingNode(prev => prev ? {...prev, category: e.target.value} : null)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingNode(null)}>Cancel</Button>
          <Button onClick={handleSaveNodeEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onEdgeClick={onEdgeClick}
        nodeTypes={adminNodeTypes}
        edgeTypes={adminEdgeTypes}
        snapToGrid={true}
        snapGrid={[gridSize, gridSize]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        selectNodesOnDrag={false}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={["Delete", "Backspace"]}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#fbbf24', strokeWidth: 3 }}
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f15 100%)',
          cursor: connectionMode === 'deleting' ? 'crosshair' : 'default',
        }}
      >
        <Controls 
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '8px',
          }}
        />
        <MiniMap 
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
          }}
          nodeColor={(node) => {
            if (node.selected) return '#fbbf24';
            return '#6366f1';
          }}
        />
        {/* Visual grid removed - using React Flow's built-in snap grid only */}
      </ReactFlow>

      {/* Import Skills Dialog */}
      <SkillImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportSkills}
        existingSkillIds={nodes.map(node => node.id)}
      />

      {/* Connection Tutorial Wizard */}
      <ConnectionWizard
        open={showConnectionWizard}
        onClose={() => setShowConnectionWizard(false)}
        onStartConnectionMode={() => {
          setConnectionMode('creating');
          setIsConnectingMode(true);
          showMessage('Connection mode active. Click skills to create prerequisites.', 'success');
        }}
      />

      {/* Grid Settings Dialog */}
      <Dialog
        open={showGridSettings}
        onClose={() => setShowGridSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Node & Grid Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Grid Alignment
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Grid Size: {gridSize}px
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption">25</Typography>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={gridSize}
                    onChange={(e) => setGridSize(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Typography variant="caption">100</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#00B162', fontWeight: 600 }}>
                ✓ Nodes automatically snap to grid for precise alignment
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Node Scaling
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Node Scale: {Math.round(nodeScale * 100)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption">50%</Typography>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={Math.round(nodeScale * 100)}
                    onChange={(e) => setNodeScale(parseInt(e.target.value) / 100)}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Typography variant="caption">200%</Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Text Scaling
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Text Scale: {Math.round(textScale * 100)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption">50%</Typography>
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={Math.round(textScale * 100)}
                    onChange={(e) => setTextScale(parseInt(e.target.value) / 100)}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: textScale !== 1 ? '#00B162' : '#ddd',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Typography variant="caption">200%</Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Star Colors by Type
            </Typography>
            
            {Object.entries(starColors).map(([starType, color]) => (
              <Box key={starType} sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {starType.replace('-', ' ')} Stars
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setStarColors(prev => ({
                      ...prev,
                      [starType]: e.target.value
                    }))}
                    style={{
                      width: '40px',
                      height: '25px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {color}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGridSettings(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowGridSettings(false);
              showMessage('Grid settings updated', 'success');
            }}
          >
            Apply Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Connection Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(to right, transparent, rgba(31, 41, 55, 0.95), transparent)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#ef4444' }}>
          Delete Connection
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            Are you sure you want to delete this skill connection? This will remove the prerequisite relationship between these skills.
          </DialogContentText>
          <DialogContentText sx={{ color: '#ef4444', fontWeight: 'bold' }}>
            {selectedEdgeForDeletion ? 
              `Connection: ${nodes.find(n => n.id === selectedEdgeForDeletion.source)?.data.name || 'Unknown'} → ${nodes.find(n => n.id === selectedEdgeForDeletion.target)?.data.name || 'Unknown'}` 
              : ''
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDeleteConnection}
            sx={{ 
              color: '#ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminConstellationEditor;