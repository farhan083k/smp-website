import { Star, Beaker, Calculator, BookOpen } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center">
        
        {/* ป้ายชื่อโรงเรียน */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-sm mb-8 shadow-sm">
          <Star className="w-4 h-4 mr-2 fill-current" />
          {settings.schoolName}
        </div>
        
        {/* หัวข้อหลัก */}
        <h1 className="text-4xl md:text-6xl font-bold text-[#2C3E50] mb-4 tracking-tight">
          {settings.heroTitle1 || 'ห้องเรียนโปรแกรม'}<br />
          <span className="text-[var(--primary)]">{settings.heroTitle2 || 'วิทยาศาสตร์และคณิตศาสตร์'}</span>
        </h1>
        
        {/* คำโปรย */}
        <p className="text-xl md:text-2xl text-[#2C3E50]/70 mb-12 max-w-3xl mx-auto font-light">
          {settings.subtitle}
        </p>

        {/* การ์ด 3 ใบ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--primary)]/20 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 mx-auto bg-blue-50 text-[var(--primary)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Beaker className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{settings.feature1Title || 'วิทยาศาสตร์'}</h3>
            <p className="text-[#2C3E50]/70 text-sm leading-relaxed">{settings.feature1Desc || 'เรียนรู้ผ่านการทดลองและการค้นคว้าจริงในห้องปฏิบัติการที่ทันสมัย'}</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--primary)]/20 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calculator className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{settings.feature2Title || 'คณิตศาสตร์'}</h3>
            <p className="text-[#2C3E50]/70 text-sm leading-relaxed">{settings.feature2Desc || 'ฝึกฝนการคิดเชิงตรรกะและการแก้ปัญหาที่ซับซ้อนอย่างเป็นระบบ'}</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--primary)]/20 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{settings.feature3Title || 'ภาษาอังกฤษ'}</h3>
            <p className="text-[#2C3E50]/70 text-sm leading-relaxed">{settings.feature3Desc || 'เสริมสร้างทักษะการสื่อสารภาษาอังกฤษเพื่อก้าวสู่ระดับสากล'}</p>
          </div>
        </div>

      </div>
    </section>
  );
}