import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getSettings, 
  saveSettings, 
  subscribeToSettings, 
  uploadLogo, 
  uploadBanner,
  isValidConfig 
} from '@/lib/firebase';

interface Settings {
  logo: string;
  banner: string;
  schoolName: string;
  programName: string;
  subtitle: string;
  primaryColor: string; // 👈 เพิ่มตัวแปรสีหลัก
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  uploadLogoFile: (file: File) => Promise<string | null>;
  uploadBannerFile: (file: File) => Promise<string | null>;
  isLoading: boolean;
  isFirebaseReady: boolean;
  lastSync: Date | null;
}

const defaultSettings: Settings = {
  logo: '',
  banner: '',
  schoolName: 'โรงเรียนดารุสสาลาม ตันหยงมัส นราธิวาส',
  programName: 'ห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์',
  subtitle: 'Science and Mathematics Program (SMP)',
  primaryColor: '#3498DB', // 👈 ตั้งค่าสีเริ่มต้นเป็นสีฟ้าเดิม
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const isFirebaseReady = isValidConfig();

  useEffect(() => {
    const saved = localStorage.getItem('smp-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error parsing local settings:', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isFirebaseReady) return;
    
    getSettings().then((firebaseSettings: any) => {
      if (firebaseSettings) {
        setSettings(prev => ({ ...prev, ...firebaseSettings }));
        localStorage.setItem('smp-settings', JSON.stringify({ ...settings, ...firebaseSettings }));
        setLastSync(new Date());
      }
    });

    const unsubscribe = subscribeToSettings((firebaseSettings: any) => {
      if (firebaseSettings) {
        setSettings(prev => ({ ...prev, ...firebaseSettings }));
        localStorage.setItem('smp-settings', JSON.stringify({ ...settings, ...firebaseSettings }));
        setLastSync(new Date());
      }
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('smp-settings', JSON.stringify(updatedSettings));
    
    if (isFirebaseReady) {
      try {
        const success = await saveSettings(newSettings);
        if (success) setLastSync(new Date());
      } catch (error) { console.error('Error saving to Firebase:', error); }
    }
  };

  const uploadLogoFile = async (file: File): Promise<string | null> => {
    if (!isFirebaseReady) return null;
    try {
      const url = await uploadLogo(file);
      if (url) await updateSettings({ logo: url });
      return url;
    } catch (error) { return null; }
  };

  const uploadBannerFile = async (file: File): Promise<string | null> => {
    if (!isFirebaseReady) return null;
    try {
      const url = await uploadBanner(file);
      if (url) await updateSettings({ banner: url });
      return url;
    } catch (error) { return null; }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, updateSettings, uploadLogoFile, uploadBannerFile, isLoading, isFirebaseReady, lastSync
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}