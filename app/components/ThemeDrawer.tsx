"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface ThemeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeDrawer = memo<ThemeDrawerProps>(({ isOpen, onClose }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName);
    handleClose();
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      />

      
      <div
        className={`fixed bottom-0 left-0 right-0 max-h-[80vh] shadow-xl z-50 flex flex-col rounded-t-lg overflow-hidden transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: currentTheme.displayBackground,
          borderTop: `1px solid ${currentTheme.border}`,
        }}
      >
        
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: currentTheme.border }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: currentTheme.textPrimary }}
          >
            Choose Theme
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-opacity-20"
            style={{ color: currentTheme.textSecondary }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(availableThemes).map(([key, theme]) => (
              <ThemeCard
                key={key}
                theme={theme}
                isSelected={key === Object.keys(availableThemes).find(k => availableThemes[k] === currentTheme)}
                onClick={() => handleThemeSelect(key)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
});

ThemeDrawer.displayName = 'ThemeDrawer';

export default ThemeDrawer;

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}

const ThemeCard = memo<ThemeCardProps>(({ theme, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
        isSelected ? 'ring-2 ring-offset-2' : ''
      }`}
      style={{
        backgroundColor: theme.displayBackground,
        borderColor: isSelected ? theme.accent : theme.border,
        '--tw-ring-color': theme.accent,
        '--tw-ring-offset-color': theme.backgroundMain,
      } as React.CSSProperties}
    >
      
      <div className="flex justify-center mb-3">
        <div className="flex space-x-1">
          <div
            className="w-6 h-6 rounded-full border"
            style={{
              backgroundColor: theme.backgroundMain,
              borderColor: theme.border,
            }}
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{
              backgroundColor: theme.buttonOperator,
              borderColor: theme.border,
            }}
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{
              backgroundColor: theme.accent,
              borderColor: theme.border,
            }}
          />
        </div>
      </div>

      
      <div
        className="text-sm font-medium text-center"
        style={{ color: theme.textPrimary }}
      >
        {theme.name}
      </div>

      
      {isSelected && (
        <div
          className="text-xs text-center mt-1"
          style={{ color: theme.accent }}
        >
          Current
        </div>
      )}
    </button>
  );
});

ThemeCard.displayName = 'ThemeCard';