import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'canvas' | 'task' | 'ai' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  sidebarPosition: 'left' | 'right';
  notificationsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  aiEnabled: boolean;
}

interface AppState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'chat' | 'notifications';
  commandPaletteOpen: boolean;
  notifications: Notification[];
  settings: AppSettings;
  recentSearches: string[];
  recentActivity: { type: string; title: string; timestamp: string; path: string }[];
}

interface AppContextType extends AppState {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'chat' | 'notifications') => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addRecentSearch: (query: string) => void;
  addRecentActivity: (activity: Omit<AppState['recentActivity'][0], 'timestamp'>) => void;
  unreadNotificationCount: number;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: 'purple',
  fontSize: 'medium',
  sidebarPosition: 'left',
  notificationsEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  aiEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'study-buddy-app-state';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          sidebarCollapsed: parsed.sidebarCollapsed ?? false,
          rightPanelOpen: false,
          rightPanelTab: 'chat' as const,
          commandPaletteOpen: false,
          notifications: parsed.notifications ?? [],
          settings: { ...defaultSettings, ...parsed.settings },
          recentSearches: parsed.recentSearches ?? [],
          recentActivity: parsed.recentActivity ?? [],
        };
      } catch {
        return getDefaultState();
      }
    }
    return getDefaultState();
  });

  function getDefaultState(): AppState {
    return {
      sidebarCollapsed: false,
      rightPanelOpen: false,
      rightPanelTab: 'chat',
      commandPaletteOpen: false,
      notifications: [],
      settings: defaultSettings,
      recentSearches: [],
      recentActivity: [],
    };
  }

  useEffect(() => {
    const toSave = {
      sidebarCollapsed: state.sidebarCollapsed,
      notifications: state.notifications,
      settings: state.settings,
      recentSearches: state.recentSearches,
      recentActivity: state.recentActivity.slice(0, 20),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setState(prev => ({ ...prev, commandPaletteOpen: !prev.commandPaletteOpen }));
      }
      if (e.key === 'Escape' && state.commandPaletteOpen) {
        setState(prev => ({ ...prev, commandPaletteOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.commandPaletteOpen]);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  const toggleRightPanel = useCallback(() => {
    setState(prev => ({ ...prev, rightPanelOpen: !prev.rightPanelOpen }));
  }, []);

  const setRightPanelTab = useCallback((tab: 'chat' | 'notifications') => {
    setState(prev => ({ ...prev, rightPanelTab: tab, rightPanelOpen: true }));
  }, []);

  const openCommandPalette = useCallback(() => {
    setState(prev => ({ ...prev, commandPaletteOpen: true }));
  }, []);

  const closeCommandPalette = useCallback(() => {
    setState(prev => ({ ...prev, commandPaletteOpen: false }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications].slice(0, 50),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      recentSearches: [query, ...prev.recentSearches.filter(s => s !== query)].slice(0, 10),
    }));
  }, []);

  const addRecentActivity = useCallback((activity: Omit<AppState['recentActivity'][0], 'timestamp'>) => {
    setState(prev => ({
      ...prev,
      recentActivity: [
        { ...activity, timestamp: new Date().toISOString() },
        ...prev.recentActivity.filter(a => a.path !== activity.path),
      ].slice(0, 20),
    }));
  }, []);

  const unreadNotificationCount = state.notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        ...state,
        toggleSidebar,
        setSidebarCollapsed,
        toggleRightPanel,
        setRightPanelTab,
        openCommandPalette,
        closeCommandPalette,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        addRecentSearch,
        addRecentActivity,
        unreadNotificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
