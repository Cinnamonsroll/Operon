"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export interface Theme {
  name: string;
  backgroundMain: string;
  displayBackground: string;
  textPrimary: string;
  textSecondary: string;
  buttonDefault: string;
  buttonOperator: string;
  buttonAC: string;
  buttonEqual: string;
  textAC: string;
  textEqual: string;
  textOperator: string;
  accent: string;
  border: string;
  
  code: {
    background: string;
    text: string;
    keyword: string;
    string: string;
    number: string;
    comment: string;
    operator: string;
    function: string;
    bracket: string;
    identifier: string;
    selection: string;
  };
}

export const themes: Record<string, Theme> = {
  forest: {
    name: 'Forest',
    backgroundMain: '#1c2a25',
    displayBackground: '#23332b',
    textPrimary: '#dce7dd',
    textSecondary: '#aeb9ae',
    buttonDefault: '#2c3c35',
    buttonOperator: '#4a5a4d',
    buttonAC: '#8b4513',
    buttonEqual: '#6b8e6b',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#6b8e6b',
    border: '#3a4a3d',
    code: {
      background: '#23332b',
      text: '#dce7dd',
      keyword: '#8fbc8f',
      string: '#90ee90',
      number: '#98fb98',
      comment: '#708070',
      operator: '#9acd32',
      function: '#7cfc00',
      bracket: '#dce7dd',
      identifier: '#dce7dd',
      selection: '#4a5a4d40',
    },
  },
  dark: {
    name: 'Dark',
    backgroundMain: '#1a1a1a',
    displayBackground: '#2d2d2d',
    textPrimary: '#ffffff',
    textSecondary: '#b3b3b3',
    buttonDefault: '#404040',
    buttonOperator: '#666666',
    buttonAC: '#ff6b6b',
    buttonEqual: '#007acc',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#007acc',
    border: '#555555',
    code: {
      background: '#2d2d2d',
      text: '#ffffff',
      keyword: '#569cd6',
      string: '#ce9178',
      number: '#b5cea8',
      comment: '#6a9955',
      operator: '#d4d4d4',
      function: '#dcdcaa',
      bracket: '#ffd700',
      identifier: '#9cdcfe',
      selection: '#66666640',
    },
  },
  light: {
    name: 'Light',
    backgroundMain: '#ffffff',
    displayBackground: '#f5f5f5',
    textPrimary: '#333333',
    textSecondary: '#666666',
    buttonDefault: '#e0e0e0',
    buttonOperator: '#d0d0d0',
    buttonAC: '#ff6b6b',
    buttonEqual: '#0066cc',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#0066cc',
    border: '#cccccc',
    code: {
      background: '#f5f5f5',
      text: '#333333',
      keyword: '#0000ff',
      string: '#a31515',
      number: '#098658',
      comment: '#008000',
      operator: '#000000',
      function: '#795e26',
      bracket: '#0431fa',
      identifier: '#001080',
      selection: '#d0d0d040',
    },
  },
  space: {
    name: 'Space',
    backgroundMain: '#0f0f23',
    displayBackground: '#1a1a3a',
    textPrimary: '#e6e6ff',
    textSecondary: '#9999cc',
    buttonDefault: '#2d2d4d',
    buttonOperator: '#4d4d7a',
    buttonAC: '#ff6b6b',
    buttonEqual: '#6666ff',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#6666ff',
    border: '#404066',
    code: {
      background: '#1a1a3a',
      text: '#e6e6ff',
      keyword: '#8080ff',
      string: '#ff80ff',
      number: '#80ffff',
      comment: '#8080c0',
      operator: '#c0c0ff',
      function: '#ffff80',
      bracket: '#ff8080',
      identifier: '#c0c0ff',
      selection: '#4d4d7a40',
    },
  },
  fire: {
    name: 'Fire',
    backgroundMain: '#2a1a0f',
    displayBackground: '#3d2817',
    textPrimary: '#ffddcc',
    textSecondary: '#cc9966',
    buttonDefault: '#4d3322',
    buttonOperator: '#664433',
    buttonAC: '#cc3333',
    buttonEqual: '#ff6633',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#ff6633',
    border: '#5a3d2a',
    code: {
      background: '#3d2817',
      text: '#ffddcc',
      keyword: '#ff8c42',
      string: '#ffb347',
      number: '#ffa500',
      comment: '#cd853f',
      operator: '#ff6347',
      function: '#ff7f50',
      bracket: '#ff4500',
      identifier: '#ffdab9',
      selection: '#66443340',
    },
  },
  ocean: {
    name: 'Ocean',
    backgroundMain: '#0f1f2a',
    displayBackground: '#1a2f3d',
    textPrimary: '#cce6ff',
    textSecondary: '#99ccdd',
    buttonDefault: '#2d4d5a',
    buttonOperator: '#4d6b7a',
    buttonAC: '#ff6b6b',
    buttonEqual: '#3399cc',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#3399cc',
    border: '#3d5a66',
    code: {
      background: '#1a2f3d',
      text: '#cce6ff',
      keyword: '#4fc3f7',
      string: '#81d4fa',
      number: '#4dd0e1',
      comment: '#607d8b',
      operator: '#29b6f6',
      function: '#26c6da',
      bracket: '#00bcd4',
      identifier: '#b3e5fc',
      selection: '#4d6b7a40',
    },
  },
  sunset: {
    name: 'Sunset',
    backgroundMain: '#2a1f0f',
    displayBackground: '#3d2f1a',
    textPrimary: '#ffe6cc',
    textSecondary: '#ddaa77',
    buttonDefault: '#5a4433',
    buttonOperator: '#7a5544',
    buttonAC: '#cc5533',
    buttonEqual: '#ff8844',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#ff8844',
    border: '#664d3a',
    code: {
      background: '#3d2f1a',
      text: '#ffe6cc',
      keyword: '#ffab40',
      string: '#ffcc80',
      number: '#ffc947',
      comment: '#bf8f36',
      operator: '#ff9800',
      function: '#ffb74d',
      bracket: '#ff8a65',
      identifier: '#ffe0b2',
      selection: '#7a554440',
    },
  },
  neon: {
    name: 'Neon',
    backgroundMain: '#0a0a0a',
    displayBackground: '#1a1a1a',
    textPrimary: '#00ff88',
    textSecondary: '#88ffaa',
    buttonDefault: '#2a2a2a',
    buttonOperator: '#3a3a3a',
    buttonAC: '#ff0088',
    buttonEqual: '#00ff88',
    textAC: '#ffffff',
    textEqual: '#000000',
    textOperator: '#00ff88',
    accent: '#ff0088',
    border: '#444444',
    code: {
      background: '#1a1a1a',
      text: '#00ff88',
      keyword: '#ff0088',
      string: '#00ffff',
      number: '#ffff00',
      comment: '#666666',
      operator: '#ff4081',
      function: '#00e676',
      bracket: '#ff6ec7',
      identifier: '#64ffda',
      selection: '#3a3a3a40',
    },
  },
  purple: {
    name: 'Purple',
    backgroundMain: '#1f0f2a',
    displayBackground: '#2f1a3d',
    textPrimary: '#e6ccff',
    textSecondary: '#cc99dd',
    buttonDefault: '#4d2d5a',
    buttonOperator: '#6b4d7a',
    buttonAC: '#ff6b6b',
    buttonEqual: '#9933cc',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#9933cc',
    border: '#5a3d66',
    code: {
      background: '#2f1a3d',
      text: '#e6ccff',
      keyword: '#ba68c8',
      string: '#ce93d8',
      number: '#ab47bc',
      comment: '#9575cd',
      operator: '#e1bee7',
      function: '#da70d6',
      bracket: '#dda0dd',
      identifier: '#f3e5f5',
      selection: '#6b4d7a40',
    },
  },
  mint: {
    name: 'Mint',
    backgroundMain: '#0f2a1f',
    displayBackground: '#1a3d2f',
    textPrimary: '#ccffe6',
    textSecondary: '#99ddcc',
    buttonDefault: '#2d5a4d',
    buttonOperator: '#4d7a6b',
    buttonAC: '#ff6b6b',
    buttonEqual: '#33cc99',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#33cc99',
    border: '#3d665a',
    code: {
      background: '#1a3d2f',
      text: '#ccffe6',
      keyword: '#4db6ac',
      string: '#80cbc4',
      number: '#26a69a',
      comment: '#607d8b',
      operator: '#00acc1',
      function: '#1de9b6',
      bracket: '#64ffda',
      identifier: '#b2dfdb',
      selection: '#4d7a6b40',
    },
  },
  vscode: {
    name: 'VSCode',
    backgroundMain: '#1e1e1e',
    displayBackground: '#252526',
    textPrimary: '#d4d4d4',
    textSecondary: '#858585',
    buttonDefault: '#2d2d30',
    buttonOperator: '#3c3c3c',
    buttonAC: '#f44747',
    buttonEqual: '#007acc',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#007acc',
    border: '#3c3c3c',
    code: {
      background: '#1e1e1e',
      text: '#d4d4d4',
      keyword: '#c586c0',
      string: '#ce9178',
      number: '#b5cea8',
      comment: '#6a9955',
      operator: '#d4d4d4',
      function: '#dcdcaa',
      bracket: '#da70d6',
      identifier: '#9cdcfe',
      selection: '#264f7840',
    },
  },
  discord: {
    name: 'Discord',
    backgroundMain: '#2c2f33',
    displayBackground: '#36393f',
    textPrimary: '#dcddde',
    textSecondary: '#b9bbbe',
    buttonDefault: '#40444b',
    buttonOperator: '#4f545c',
    buttonAC: '#f04747',
    buttonEqual: '#5865f2',
    textAC: '#ffffff',
    textEqual: '#ffffff',
    textOperator: '#ffffff',
    accent: '#5865f2',
    border: '#202225',
    code: {
      background: '#36393f',
      text: '#dcddde',
      keyword: '#5865f2',
      string: '#43b581',
      number: '#faa61a',
      comment: '#72767d',
      operator: '#dcddde',
      function: '#7289da',
      bracket: '#f47fff',
      identifier: '#99aab5',
      selection: '#4f545c40',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState('forest');

  
  useEffect(() => {
    const savedTheme = localStorage.getItem('calculator-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeName(savedTheme);
    }
  }, []);

  
  useEffect(() => {
    localStorage.setItem('calculator-theme', currentThemeName);
  }, [currentThemeName]);

  const setTheme = useCallback((themeName: string) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  }, []);

  const value: ThemeContextType = useMemo(() => ({
    currentTheme: themes[currentThemeName],
    setTheme,
    availableThemes: themes,
  }), [currentThemeName, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}