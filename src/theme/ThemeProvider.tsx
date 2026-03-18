import React, { createContext, useContext, useState, useCallback } from 'react';
import { theme, Theme } from './tokens';

type ThemeMode = 'lcars' | 'hud' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'lcars' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'lcars' ? 'hud' : prev === 'hud' ? 'dark' : 'lcars');
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// CSS custom properties generator
export function generateCSSVariables(themeObj: Theme): string {
  const vars: string[] = [];
  
  const flatten = (obj: Record<string, unknown>, prefix = ''): void => {
    Object.entries(obj).forEach(([key, value]) => {
      const varName = prefix ? `${prefix}-${key}` : key;
      if (typeof value === 'string') {
        vars.push(`--nrv-${varName.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`);
      } else if (typeof value === 'object' && value !== null) {
        flatten(value as Record<string, unknown>, varName);
      }
    });
  };
  
  flatten(themeObj as unknown as Record<string, unknown>);
  return `:root {\n  ${vars.join('\n  ')}\n}`;
}
