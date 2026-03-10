import { GraduationCap, MapPin, Phone, Mail, Facebook, Globe } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="relative bg-gradient-to-br from-[#2C3E50] to-[#1a252f] text-white overflow-hidden">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M30 5 L55 17.5 L55 42.5 L30 55 L5 42.5 L5 17.5 Z"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
              <circle cx="30" cy="30" r="10" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#98D8C8] via-[#3498DB] to-[#F7DC6F]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/10 p-2 rounded-full border border-[#98D8C8]/50 overflow-hidden">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <GraduationCap className="h-8 w-8 text-[#98D8C8]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#98D8C8]">
                  {settings.programName}
                </h3>
                <p className="text-sm text-white/70">
                  {settings.subtitle}
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              {settings.schoolName}
              <br />
              ห้องเรียนพิเศษสำหรับนักเรียนที่มีความสามารถพิเศษทางวิทยาศาสตร์และคณิตศาสตร์
              พร้อมพัฒนาศักยภาพให้ก้าวสู่ความเป็นเลิศทางวิชาการ
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-[#3498DB]/50 transition-colors border border-white/20"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-[#3498DB]/50 transition-colors border border-white/20"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-[#F7DC6F] mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#98D8C8] flex-shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">
                  {settings.schoolName}
                  <br />
                  ตันหยงมัส นราธิวาส 96110
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#98D8C8] flex-shrink-0" />
                <span className="text-white/80 text-sm">073-xxx-xxx</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#98D8C8] flex-shrink-0" />
                <span className="text-white/80 text-sm">smp@darussalam.ac.th</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-[#F7DC6F] mb-4">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              <li>
                <a href="#announcements" className="text-white/80 text-sm hover:text-[#98D8C8] transition-colors">
                  ประกาศ
                </a>
              </li>
              <li>
                <a href="#programs" className="text-white/80 text-sm hover:text-[#98D8C8] transition-colors">
                  แนะนำโปรแกรม
                </a>
              </li>
              <li>
                <a href="#projects" className="text-white/80 text-sm hover:text-[#98D8C8] transition-colors">
                  โครงการ
                </a>
              </li>
              <li>
                <a href="#activities" className="text-white/80 text-sm hover:text-[#98D8C8] transition-colors">
                  กิจกรรม
                </a>
              </li>
              <li>
                <a href="#staff" className="text-white/80 text-sm hover:text-[#98D8C8] transition-colors">
                  บุคลากร
                </a>
              </li>
              <li>
                <a href="#others" className="text-white/80 text-sm hover:text-[#98D8C8] transition-colors">
                  อื่นๆ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-white/60 text-sm text-center sm:text-left">
              © 2026 {settings.programName} {settings.schoolName}
            </p>
            <p className="text-white/40 text-xs">
              พัฒนาโดยทีมงาน SMP | ตันหยงมัส นราธิวาส
            </p>
          </div>
        </div>
      </div>

      {/* Islamic Geometric Decoration */}
      <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <polygon
            points="100,20 170,60 170,140 100,180 30,140 30,60"
            fill="none"
            stroke="#98D8C8"
            strokeWidth="2"
          />
          <polygon
            points="100,50 145,75 145,125 100,150 55,125 55,75"
            fill="none"
            stroke="#F7DC6F"
            strokeWidth="2"
          />
          <circle cx="100" cy="100" r="25" fill="none" stroke="#3498DB" strokeWidth="2" />
        </svg>
      </div>
    </footer>
  );
}
