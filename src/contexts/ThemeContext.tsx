
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ThemeContextType {
  theme: string;
  currency: string;
  updateTheme: (newTheme: string) => void;
  updateCurrency: (newCurrency: string) => void;
  refreshProfile: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, user }) => {
  const [theme, setTheme] = useState('galaxy');
  const [currency, setCurrency] = useState('USD');

  const { data: profile, refetch } = useQuery({
    queryKey: ['theme-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setTheme(profile.theme || 'galaxy');
      setCurrency(profile.preferred_currency || 'USD');
    }
  }, [profile]);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  const updateCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const refreshProfile = () => {
    refetch();
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currency, 
      updateTheme, 
      updateCurrency, 
      refreshProfile 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
