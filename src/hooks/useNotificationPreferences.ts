import { useState, useEffect, useCallback } from 'react';

const PREFERENCES_KEY = 'moviereviewhub_notification_prefs';

export interface NotificationPreferences {
  showReviews: boolean;
  showComments: boolean;
}

const defaultPreferences: NotificationPreferences = {
  showReviews: true,
  showComments: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch {
        setPreferences(defaultPreferences);
      }
    }
  }, []);

  const updatePreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPreferences));
    setPreferences(defaultPreferences);
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}
