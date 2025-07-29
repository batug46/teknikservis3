'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
    );
  }

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
    },
    {
      value: 'dark', 
      label: 'Dark',
      icon: Moon,
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-150 ease-out text-gray-700 dark:text-gray-200"
        aria-label="Theme selector"
      >
        <CurrentIcon className="w-4 h-4" />
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 transform transition-all duration-150 ease-out origin-top-right">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors duration-150 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{themeOption.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
            
            {/* System theme indicator */}
            {theme === 'system' && (
              <div className="px-3 py-1 border-t border-gray-200 dark:border-gray-700 mt-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  {resolvedTheme === 'dark' ? (
                    <>
                      <Moon className="w-3 h-3" />
                      <span>Using dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3 h-3" />
                      <span>Using light</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 