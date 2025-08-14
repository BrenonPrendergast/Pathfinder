import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Edit,
  Delete,
  ContentCopy,
  Link,
  LinkOff,
  Add,
  ColorLens,
  Star,
  Layers,
} from '@mui/icons-material';

interface ConstellationContextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedType: 'node' | 'edge' | 'canvas' | null;
  selectedCount: number;
  onAction: (action: string) => void;
}

const ConstellationContextMenu: React.FC<ConstellationContextMenuProps> = ({
  anchorEl,
  open,
  onClose,
  selectedType,
  selectedCount,
  onAction,
}) => {
  const handleAction = (action: string) => {
    onAction(action);
    onClose();
  };

  const renderNodeMenu = () => (
    <>
      <MenuItem onClick={() => handleAction('edit')}>
        <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
        <ListItemText>Edit Properties</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('duplicate')}>
        <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
        <ListItemText>Duplicate</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('change-star-type')}>
        <ListItemIcon><Star fontSize="small" /></ListItemIcon>
        <ListItemText>Change Star Type</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('change-category')}>
        <ListItemIcon><Layers fontSize="small" /></ListItemIcon>
        <ListItemText>Change Category</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('change-color')}>
        <ListItemIcon><ColorLens fontSize="small" /></ListItemIcon>
        <ListItemText>Customize Color</ListItemText>
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => handleAction('create-connection')}>
        <ListItemIcon><Link fontSize="small" /></ListItemIcon>
        <ListItemText>Create Connection</ListItemText>
      </MenuItem>
      
      <Divider />
      
      <MenuItem 
        onClick={() => handleAction('delete')}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon sx={{ color: 'error.main' }}>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Delete {selectedCount > 1 ? `${selectedCount} Skills` : 'Skill'}
        </ListItemText>
      </MenuItem>
    </>
  );

  const renderEdgeMenu = () => (
    <>
      <MenuItem onClick={() => handleAction('edit-connection')}>
        <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
        <ListItemText>Edit Connection</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('reverse-connection')}>
        <ListItemIcon><Link fontSize="small" /></ListItemIcon>
        <ListItemText>Reverse Direction</ListItemText>
      </MenuItem>
      
      <Divider />
      
      <MenuItem 
        onClick={() => handleAction('delete-connection')}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon sx={{ color: 'error.main' }}>
          <LinkOff fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          Delete {selectedCount > 1 ? `${selectedCount} Connections` : 'Connection'}
        </ListItemText>
      </MenuItem>
    </>
  );

  const renderCanvasMenu = () => (
    <>
      <MenuItem onClick={() => handleAction('create-skill')}>
        <ListItemIcon><Add fontSize="small" /></ListItemIcon>
        <ListItemText>Create New Skill</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('paste')}>
        <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
        <ListItemText>Paste</ListItemText>
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => handleAction('auto-arrange')}>
        <ListItemIcon><Layers fontSize="small" /></ListItemIcon>
        <ListItemText>Auto Arrange</ListItemText>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('reset-layout')}>
        <ListItemIcon><Star fontSize="small" /></ListItemIcon>
        <ListItemText>Reset Layout</ListItemText>
      </MenuItem>
    </>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          minWidth: 200,
        },
      }}
    >
      {selectedType === 'node' && renderNodeMenu()}
      {selectedType === 'edge' && renderEdgeMenu()}
      {selectedType === 'canvas' && renderCanvasMenu()}
      
      {selectedType && (
        <>
          <Divider />
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              {selectedType === 'node' && `${selectedCount} skill${selectedCount > 1 ? 's' : ''} selected`}
              {selectedType === 'edge' && `${selectedCount} connection${selectedCount > 1 ? 's' : ''} selected`}
              {selectedType === 'canvas' && 'Canvas actions'}
            </Typography>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default ConstellationContextMenu;