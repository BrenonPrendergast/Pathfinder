import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertColor } from '@mui/material';

interface NotificationData {
  id: string;
  message: string;
  type: AlertColor;
  title?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  showNotification: (message: string, type?: AlertColor, options?: Partial<NotificationData>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeNotification: (id: string) => void;
  currentNotification: NotificationData | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [transitionDelay, setTransitionDelay] = useState<NodeJS.Timeout | null>(null);

  const generateId = () => `notification-${Date.now()}-${Math.random()}`;

  const showNotification = useCallback((
    message: string, 
    type: AlertColor = 'info',
    options: Partial<NotificationData> = {}
  ) => {
    const id = generateId();
    const notification: NotificationData = {
      id,
      message,
      type,
      duration: options.persistent ? undefined : (options.duration || 5000),
      title: options.title,
      persistent: options.persistent || false,
    };

    // Clear any existing transition delay
    if (transitionDelay) {
      clearTimeout(transitionDelay);
    }

    // If there's an existing notification, add a brief delay for smooth transition
    if (currentNotification) {
      setCurrentNotification(null);
      const delay = setTimeout(() => {
        setCurrentNotification(notification);
      }, 250); // Brief delay for smooth replacement
      setTransitionDelay(delay);
    } else {
      // No existing notification, show immediately
      setCurrentNotification(notification);
    }

    // Auto-remove after duration if not persistent
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration + (currentNotification ? 250 : 0)); // Account for transition delay
    }
  }, [currentNotification, transitionDelay]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification(message, 'success', { title });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string) => {
    showNotification(message, 'error', { title, duration: 8000 });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification(message, 'warning', { title, duration: 6000 });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification(message, 'info', { title });
  }, [showNotification]);

  const removeNotification = useCallback((id: string) => {
    setCurrentNotification(prev => prev && prev.id === id ? null : prev);
  }, []);

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeNotification,
      currentNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new globalThis.Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};