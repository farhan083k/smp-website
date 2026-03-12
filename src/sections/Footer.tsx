import { Mail, Phone, MapPin, Facebook, Globe } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1A252F] text-white py-12 border-t-4" style={{ borderColor: settings.primaryColor || '#3498DB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* ส่วนที่ 1: ข้อมูลโรงเรียน */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-lg h-12 w-12 flex items-center justify-center">
                <img src={settings.logo || "/logo.png"} alt="Logo" className="max-h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight text-[#98D8C8]">{settings.programName}</h3>
                <p className="text-xs text-gray-400">{settings.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {settings.schoolName}<br />
              ห้องเรียนพิเศษสำหรับนักเรียนที่มีความสามารถพิเศษทางวิทยาศาสตร์และคณิตศาสตร์ 
              พร้อมพัฒนาศักยภาพให้ก้าวสู่ความเป็นเลิศทางวิชาการ
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={settings.facebookUrl || "https://facebook.com"} target="_blank" rel="noreferrer" className="hover:text-[#98D8C8] transition-colors bg-white/10 p-2 rounded-full">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#98D8C8] transition-colors bg-white/10 p-2 rounded-full">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ส่วนที่ 2: ข้อมูลติดต่อ (ดึงจาก Settings) */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[#F7DC6F]">ติดต่อเรา</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-[#98D8C8] shrink-0" />
                <span className="whitespace-pre-line">{settings.address || 'โรงเรียนดารุสสาลาม ตันหยงมัส นราธิวาส'}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-[#98D8C8] shrink-0" />
                <span>{settings.phone || '073-671-xxx'}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#98D8C8] shrink-0" />
                <span>{settings.email || 'smp@darussalam.ac.th'}</span>
              </li>
            </ul>
          </div>

          {/* ส่วนที่ 3: ลิงก์ด่วน */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[#F7DC6F]">ลิงก์ด่วน</h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <li><button onClick={() => scrollToSection('announcements')} className="text-gray-300 hover:text-white transition-colors flex items-center">○ ประกาศ</button></li>
              <li><button onClick={() => scrollToSection('programs')} className="text-gray-300 hover:text-white transition-colors flex items-center">○ แนะนำโปรแกรม</button></li>
              <li><button onClick={() => scrollToSection('projects')} className="text-gray-300 hover:text-white transition-colors flex items-center">○ โครงการ</button></li>
              <li><button onClick={() => scrollToSection('activities')} className="text-gray-300 hover:text-white transition-colors flex items-center">○ กิจกรรม</button></li>
              <li><button onClick={() => scrollToSection('staff')} className="text-gray-300 hover:text-white transition-colors flex items-center">○ บุคลากร</button></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-400">
          <p>© 2026 {settings.programName} {settings.schoolName}. All rights reserved.</p>
          <p className="mt-2 opacity-50">พัฒนาโดยทีมงาน SMP | ดารุสสาลาม ตันหยงมัส นราธิวาส</p>
        </div>
      </div>
    </footer>
  );
}