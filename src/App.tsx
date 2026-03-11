import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // ตัวช่วยเช็กสถานะล็อกอินจาก Firebase
import { auth } from './lib/firebase'; // ดึงกุญแจ auth มาจากไฟล์ตั้งค่า
import { SettingsProvider } from './contexts/SettingsContext';
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
  const [loading, setLoading] = useState(true); // สถานะรอเช็กระบบตอนโหลดหน้าเว็บ

  // 🔴 ฟังก์ชัน "รปภ. เฝ้าประตู" - เช็กสถานะการล็อกอินทุกครั้งที่เปิดเว็บ/รีเฟรช
  useEffect(() => {
    // สั่งให้ Firebase เช็กว่ามีคนล็อกอินค้างไว้ในเบราว์เซอร์ไหม
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ถ้า Firebase เจอข้อมูลผู้ใช้ (ล็อกอินค้างไว้)
        setIsLoggedIn(true);
      } else {
        // ถ้าไม่เจอ (ไม่ได้ล็อกอิน หรือกด Logout ไปแล้ว)
        setIsLoggedIn(false);
      }
      setLoading(false); // เช็กเสร็จแล้ว (ไม่ว่าจะเจอหรือไม่เจอ) เลิกแสดงหน้า Loading
    });

    return () => unsubscribe(); // ล้างคำสั่งเมื่อคอมโพเนนต์ถูกถอดออก
  }, []);

  // จังหวะที่เว็บกำลัง "ถาม" Firebase (Loading) ให้โชว์หน้านี้แทน เพื่อไม่ให้หน้าเว็บกะพริบ
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB] mx-auto mb-4"></div>
          <p className="text-[#2C3E50] font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9F6] to-white islamic-pattern">
      {/* ส่งสถานะ isLoggedIn ไปให้ Header เพื่อโชว์ปุ่ม Login/Logout */}
      <Header onLogin={setIsLoggedIn} isLoggedIn={isLoggedIn} />
      
      <main>
        <Hero />
        {/* ส่งสถานะ isLoggedIn ไปให้ทุกส่วน เพื่อเปิด/ปิด ปุ่มแก้ไขข้อมูล */}
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