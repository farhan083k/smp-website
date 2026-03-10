import { BookOpen, Calculator, FlaskConical, Star } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background Banner */}
      {settings.banner && (
        <div className="absolute inset-0 z-0">
          <img
            src={settings.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F0F9F6]/90 via-[#F0F9F6]/70 to-[#F0F9F6]/90" />
        </div>
      )}

      {/* Background Islamic Pattern (if no banner) */}
      {!settings.banner && (
        <>
          <div className="absolute inset-0 islamic-pattern" />
          <div className="absolute inset-0 islamic-ornament opacity-20" />
        </>
      )}
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#3498DB]/20 rounded-full" />
      <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-[#98D8C8]/30 rounded-full" />
      <div className="absolute top-1/2 right-20 w-24 h-24 border-4 border-[#F7DC6F]/25 rounded-full transform -translate-y-1/2" />
      
      {/* Islamic Geometric Shapes */}
      <div className="absolute top-20 right-10 opacity-10">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 110,35 110,85 60,110 10,85 10,35"
            fill="none"
            stroke="#3498DB"
            strokeWidth="2"
          />
          <polygon
            points="60,25 95,42 95,78 60,95 25,78 25,42"
            fill="none"
            stroke="#98D8C8"
            strokeWidth="2"
          />
        </svg>
      </div>
      
      <div className="absolute bottom-20 left-10 opacity-10">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#F7DC6F" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#3498DB" strokeWidth="2" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="#98D8C8" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#98D8C8]/30 border-2 border-[#3498DB] mb-6">
            <Star className="h-4 w-4 text-[#3498DB] mr-2" />
            <span className="text-sm font-medium text-[#2C3E50]">
              {settings.schoolName}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C3E50] mb-6 leading-tight">
            ห้องเรียนโปรแกรม
            <br />
            <span className="text-[#3498DB]">วิทยาศาสตร์และคณิตศาสตร์</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#2C3E50]/80 max-w-3xl mx-auto mb-10">
            {settings.subtitle}
            <br />
            ห้องเรียนพิเศษสำหรับนักเรียนที่มีความสามารถพิเศษทางวิทยาศาสตร์และคณิตศาสตร์
            พร้อมพัฒนาศักยภาพให้ก้าวสู่ความเป็นเลิศ
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="mint-card p-6 text-center">
              <div className="bg-[#98D8C8]/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#3498DB]">
                <FlaskConical className="h-8 w-8 text-[#3498DB]" />
              </div>
              <h3 className="font-bold text-[#2C3E50] mb-2">วิทยาศาสตร์</h3>
              <p className="text-sm text-[#2C3E50]/70">
                เรียนรู้ผ่านการทดลองและการค้นคว้าจริง
              </p>
            </div>

            <div className="mint-card p-6 text-center">
              <div className="bg-[#F7DC6F]/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#3498DB]">
                <Calculator className="h-8 w-8 text-[#3498DB]" />
              </div>
              <h3 className="font-bold text-[#2C3E50] mb-2">คณิตศาสตร์</h3>
              <p className="text-sm text-[#2C3E50]/70">
                พัฒนาการคิดเชิงตรรกะและการแก้ปัญหา
              </p>
            </div>

            <div className="mint-card p-6 text-center">
              <div className="bg-[#98D8C8]/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#3498DB]">
                <BookOpen className="h-8 w-8 text-[#3498DB]" />
              </div>
              <h3 className="font-bold text-[#2C3E50] mb-2">ภาษาอังกฤษ</h3>
              <p className="text-sm text-[#2C3E50]/70">
                สื่อสารภาษาอังกฤษได้อย่างมืออาชีพ
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
