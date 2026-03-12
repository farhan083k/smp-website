import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings, subscribeToSettings, uploadLogo, uploadBanner, isValidConfig } from '@/lib/firebase';

interface Settings {
  logo: string;
  banner: string;
  schoolName: string;
  programName: string;
  subtitle: string;
  primaryColor: string;
  heroTitle1: string;
  heroTitle2: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  // 👇 ตัวแปรใหม่: เก็บไอคอนและพื้นหลังของจุดเด่นทั้ง 3
  feature1Icon: string;
  feature2Icon: string;
  feature3Icon: string;
  feature1Bg: string;
  feature2Bg: string;
  feature3Bg: string;
  
  address: string;
  phone: string;
  email: string;
  facebookUrl: string;
  orderAnnouncements: number;
  orderDocuments: number;
  orderPrograms: number;
  orderActivities: number;
  orderStaff: number;
  orderProjects: number;
  orderOthers: number;
}

const defaultSettings: Settings = {
  logo: '',
  banner: '',
  schoolName: 'โรงเรียนดารุสสาลาม ตันหยงมัส นราธิวาส',
  programName: 'ห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์',
  subtitle: 'Science and Mathematics Program (SMP)',
  primaryColor: '#3498DB',
  heroTitle1: 'ห้องเรียนโปรแกรม',
  heroTitle2: 'วิทยาศาสตร์และคณิตศาสตร์',
  feature1Title: 'วิทยาศาสตร์',
  feature1Desc: 'เรียนรู้ผ่านการทดลองและการค้นคว้าจริงในห้องปฏิบัติการที่ทันสมัย',
  feature2Title: 'คณิตศาสตร์',
  feature2Desc: 'ฝึกฝนการคิดเชิงตรรกะและการแก้ปัญหาที่ซับซ้อนอย่างเป็นระบบ',
  feature3Title: 'ภาษาอังกฤษ',
  feature3Desc: 'เสริมสร้างทักษะการสื่อสารภาษาอังกฤษเพื่อก้าวสู่ระดับสากล',
  // 👇 ค่าเริ่มต้น (ยังไม่มีรูป)
  feature1Icon: '', feature2Icon: '', feature3Icon: '',
  feature1Bg: '', feature2Bg: '', feature3Bg: '',
  
  address: 'โรงเรียนดารุสสาลาม ตันหยงมัส นราธิวาส\nต.ตันหยงมัส อ.ระแงะ จ.นราธิวาส 96110',
  phone: '073-671-xxx',
  email: 'smp@darussalam.ac.th',
  facebookUrl: 'https://facebook.com',
  orderAnnouncements: 1, orderPrograms: 2, orderActivities: 3, orderStaff: 4, orderDocuments: 5, orderProjects: 6, orderOthers: 7,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  uploadLogoFile: (file: File) => Promise<string | null>;
  uploadBannerFile: (file: File) => Promise<string | null>;
  isLoading: boolean;
  isFirebaseReady: boolean;
  lastSync: Date | null;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const isFirebaseReady = isValidConfig();

  useEffect(() => {
    const saved = localStorage.getItem('smp-settings');
    if (saved) {
      try { setSettings(prev => ({ ...prev, ...JSON.parse(saved) })); } 
      catch (e) { console.error('Error parsing local settings:', e); }
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

  const uploadLogoFile = async (file: File) => {
    if (!isFirebaseReady) return null;
    try {
      const url = await uploadLogo(file);
      if (url) await updateSettings({ logo: url });
      return url;
    } catch (error) { return null; }
  };

  const uploadBannerFile = async (file: File) => {
    if (!isFirebaseReady) return null;
    try {
      const url = await uploadBanner(file);
      if (url) await updateSettings({ banner: url });
      return url;
    } catch (error) { return null; }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, uploadLogoFile, uploadBannerFile, isLoading, isFirebaseReady, lastSync }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}