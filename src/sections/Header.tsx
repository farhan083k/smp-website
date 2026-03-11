import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { auth } from '../lib/firebase'; 
import { GraduationCap, Menu, X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import AdminSettings from './AdminSettings';

interface HeaderProps {
  onLogin: (isLoggedIn: boolean) => void;
  isLoggedIn: boolean;
}

export default function Header({ onLogin, isLoggedIn }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { settings } = useSettings();

  const handleLogin = async () => {
    try {
      setLoginError('');
      await signInWithEmailAndPassword(auth, 'admin@darussalam.ac.th', password);
      setLoginOpen(false);
      setPassword('');
    } catch (error: any) {
      console.error(error);
      setLoginError('รหัสผ่านไม่ถูกต้อง หรือยังไม่ได้เปิดระบบ Authentication');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogin(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header-gradient sticky top-0 z-50">
        <div className="absolute inset-0 islamic-ornament opacity-30 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section - ปรับให้เต็มวงที่นี่ */}
            <div className="flex items-center space-x-3">
              <div className="bg-white/80 rounded-full border-2 border-[#3498DB] h-14 w-14 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="w-full h-full object-cover" // 👈 แก้ให้รูปเต็มพื้นที่และไม่เบี้ยว
                  />
                ) : (
                  <GraduationCap className="h-8 w-8 text-[#2C3E50]" />
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#2C3E50] leading-tight">{settings.programName}</h1>
                <p className="text-sm text-[#2C3E50]/80">{settings.schoolName}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { id: 'announcements', label: 'ประกาศ' },
                { id: 'programs', label: 'แนะนำโปรแกรม' },
                { id: 'projects', label: 'โครงการ' },
                { id: 'activities', label: 'กิจกรรม' },
                { id: 'staff', label: 'บุคลากร' },
                { id: 'others', label: 'อื่นๆ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="nav-link px-4 py-2 rounded-lg hover:bg-[#98D8C8]/30 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Admin Controls */}
            <div className="flex items-center space-x-2">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setSettingsOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-[#3498DB] text-[#2C3E50] hover:bg-[#98D8C8]/30"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">ตั้งค่า</span>
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-[#3498DB] text-[#2C3E50] hover:bg-[#98D8C8]/30"
                  >
                    <User className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">ออกจากระบบ</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setLoginOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#3498DB] text-[#2C3E50] hover:bg-[#98D8C8]/30"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#98D8C8]/30 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6 text-[#2C3E50]" /> : <Menu className="h-6 w-6 text-[#2C3E50]" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 space-y-1">
              {[
                { id: 'announcements', label: 'ประกาศ' },
                { id: 'programs', label: 'แนะนำโปรแกรม' },
                { id: 'projects', label: 'โครงการ' },
                { id: 'activities', label: 'กิจกรรม' },
                { id: 'staff', label: 'บุคลากร' },
                { id: 'others', label: 'อื่นๆ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 rounded-lg hover:bg-[#98D8C8]/30 text-[#2C3E50] font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Login Dialog */}
        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogContent className="sm:max-w-md admin-panel">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-[#2C3E50]">
                เข้าสู่ระบบ Admin
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">รหัสผ่าน</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="border-[#3498DB] focus:ring-[#3498DB]"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
              <Button onClick={handleLogin} className="w-full btn-primary">เข้าสู่ระบบ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <AdminSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}