import { BookOpen, Calculator, FlaskConical, Star } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section className="relative overflow-hidden py-20 lg:py-32 min-h-[60vh] flex items-center">
      {/* 🖼️ Background Banner - ปรับให้เต็มพื้นที่และเห็นรูปชัดขึ้น */}
      {settings.banner && (
        <div className="absolute inset-0 z-0">
          <img
            src={settings.banner}
            alt="Banner"
            className="w-full h-full object-cover object-center" // 👈 เต็มพื้นที่และจัดกลางรูปเสมอ
          />
          {/* ปรับ Gradient ให้จางลงเพื่อให้เห็นแบนเนอร์สวยๆ ของคุณ */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F0F9F6]/80 via-[#F0F9F6]/40 to-[#F0F9F6]/80" />
        </div>
      )}

      {/* Background Islamic Pattern (โชว์เมื่อไม่มีแบนเนอร์) */}
      {!settings.banner && (
        <>
          <div className="absolute inset-0 islamic-pattern" />
          <div className="absolute inset-0 islamic-ornament opacity-20" />
        </>
      )}
      
      {/* Decorative Elements - วงกลมตกแต่ง */}
      <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#3498DB]/20 rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-[#98D8C8]/30 rounded-full animate-bounce-slow" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          {/* Badge โรงเรียน */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border-2 border-[#3498DB] mb-8 animate-fade-in">
            <Star className="h-4 w-4 text-[#3498DB] mr-2" />
            <span className="text-sm font-bold text-[#2C3E50]">
              {settings.schoolName || 'โรงเรียนดารุสสาลาม'}
            </span>
          </div>

          {/* ชื่อโปรแกรมหลัก */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#2C3E50] mb-8 leading-tight drop-shadow-sm">
            ห้องเรียนโปรแกรม
            <br />
            <span className="text-[#3498DB] drop-shadow-none">วิทยาศาสตร์และคณิตศาสตร์</span>
          </h1>

          {/* คำโปรยข้างล่าง */}
          <p className="text-lg sm:text-2xl text-[#2C3E50]/90 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            {settings.subtitle || 'ห้องเรียนพิเศษสำหรับนักเรียนที่มีความสามารถพิเศษ พร้อมพัฒนาศักยภาพให้ก้าวสู่ความเป็นเลิศ'}
          </p>

          {/* Feature Cards - 3 หัวใจหลัก */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="mint-card p-8 text-center bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all group">
              <div className="bg-[#98D8C8]/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#3498DB] group-hover:scale-110 transition-transform">
                <FlaskConical className="h-10 w-10 text-[#3498DB]" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3E50] mb-3">วิทยาศาสตร์</h3>
              <p className="text-sm text-[#2C3E50]/70 font-medium">
                เรียนรู้ผ่านการทดลองและการค้นคว้าจริงในห้องปฏิบัติการที่ทันสมัย
              </p>
            </div>

            <div className="mint-card p-8 text-center bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all group">
              <div className="bg-[#F7DC6F]/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#3498DB] group-hover:scale-110 transition-transform">
                <Calculator className="h-10 w-10 text-[#3498DB]" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3E50] mb-3">คณิตศาสตร์</h3>
              <p className="text-sm text-[#2C3E50]/70 font-medium">
                ฝึกฝนการคิดเชิงตรรกะและการแก้ปัญหาที่ซับซ้อนอย่างเป็นระบบ
              </p>
            </div>

            <div className="mint-card p-8 text-center bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all group">
              <div className="bg-[#98D8C8]/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#3498DB] group-hover:scale-110 transition-transform">
                <BookOpen className="h-10 w-10 text-[#3498DB]" />
              </div>
              <h3 className="font-bold text-xl text-[#2C3E50] mb-3">ภาษาอังกฤษ</h3>
              <p className="text-sm text-[#2C3E50]/70 font-medium">
                เสริมสร้างทักษะการสื่อสารภาษาอังกฤษเพื่อก้าวสู่ระดับสากล
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}