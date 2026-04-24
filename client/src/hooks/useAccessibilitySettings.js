import { useEffect, useState } from 'react';

const STORAGE_KEY = 'boba-accessibility-settings';

const defaultSettings = {
  textScale: 100,
  screenReaderMode: false,
  highContrastMode: false
};

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);

      if (!savedSettings) {
        return defaultSettings;
      }

      return {
        ...defaultSettings,
        ...JSON.parse(savedSettings)
      };
    } catch (error) {
      console.error('Could not load accessibility settings:', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    document.documentElement.style.setProperty(
      '--accessibility-text-scale',
      `${settings.textScale}%`
    );

    document.body.classList.toggle(
      'accessibility-high-contrast',
      settings.highContrastMode
    );

    document.body.classList.toggle(
      'accessibility-screen-reader-mode',
      settings.screenReaderMode
    );
  }, [settings]);

  const updateTextScale = (newScale) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      textScale: Number(newScale)
    }));
  };

  const toggleScreenReaderMode = () => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      screenReaderMode: !previousSettings.screenReaderMode
    }));
  };

  const toggleHighContrastMode = () => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      highContrastMode: !previousSettings.highContrastMode
    }));
  };

  const resetAccessibilitySettings = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateTextScale,
    toggleScreenReaderMode,
    toggleHighContrastMode,
    resetAccessibilitySettings
  };
}