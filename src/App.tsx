import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { SettingsProvider, useSettings } from './contexts/SettingsContext'; // 👈 นำเข้า useSettings
import Header from './sections/Header';
import Hero from './sections/Hero';
import Announcements from './sections/Announcements';
import Programs from './sections/Programs';
import Projects from './sections/Projects';
import Activities from './sections/Activities';
import Staff from './sections/Staff';
import Others from './sections/Others';
import Footer from './sections/Footer';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 👈 เรียกใช้ค่า settings เพื่อดึงสี primaryColor มาใช้
  const { settings } = useSettings(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setIsLoggedIn(true);
      else setIsLoggedIn(false);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB] mx-auto mb-4" style={{ borderColor: settings.primaryColor || '#3498DB' }}></div>
          <p className="text-[#2C3E50] font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-white islamic-pattern">
      
      {/* 🎨 เครื่องย้อมสีอัตโนมัติ (Dynamic Theme Overrider) */}
      <style>
        {`
          :root {
            --primary: ${settings.primaryColor || '#3498DB'};
          }
          /* สั่งย้อมสีรหัสเดิม #3498DB ให้กลายเป็นสีใหม่ที่เลือก */
          .bg-\\[\\#3498DB\\] { background-color: var(--primary) !important; }
          .text-\\[\\#3498DB\\] { color: var(--primary) !important; }
          .border-\\[\\#3498DB\\] { border-color: var(--primary) !important; }
          .hover\\:bg-\\[\\#3498DB\\]:hover { background-color: var(--primary) !important; }
          .hover\\:text-\\[\\#3498DB\\]:hover { color: var(--primary) !important; }
          .ring-\\[\\#3498DB\\] { --tw-ring-color: var(--primary) !important; }
        `}
      </style>

      <Header onLogin={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      
      <main>
        <Hero />
        <Announcements isLoggedIn={isLoggedIn} />
        <Programs isLoggedIn={isLoggedIn} />
        <Projects isLoggedIn={isLoggedIn} />
        <Activities isLoggedIn={isLoggedIn} />
        <Staff isLoggedIn={isLoggedIn} />
        <Others isLoggedIn={isLoggedIn} />
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;