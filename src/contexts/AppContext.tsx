import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SortOption } from '@/types';

interface AppContextType {
  selectedLanguage: string | null;
  setSelectedLanguage: (language: string | null) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  deviceId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateDeviceId(): string {
  const stored = localStorage.getItem('deviceId');
  if (stored) return stored;
  
  const newId = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('deviceId', newId);
  return newId;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deviceId] = useState(generateDeviceId);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        sortBy,
        setSortBy,
        searchQuery,
        setSearchQuery,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        deviceId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
