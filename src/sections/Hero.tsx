import { useSettings } from '../contexts/SettingsContext';
import { Beaker, Calculator, BookOpen } from 'lucide-react';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section className="bg-[#F8FAFC] pt-16 pb-12 border-b border-gray-100">
      {/* 👇 ปรับกรอบให้แคบลงด้วย max-w-5xl (จากเดิมน่าจะเป็น 7xl) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* หัวข้อหลัก */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#2C3E50] tracking-tight mb-2 leading-tight">
            {settings.heroTitle1}
          </h1>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight" style={{ color: settings.primaryColor || '#3498DB' }}>
            {settings.heroTitle2}
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            {settings.subtitle}
          </p>
        </div>

        {/* 👇 ปรับช่องว่างระหว่างการ์ด (gap) ให้พอดีขึ้น */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          
          {/* การ์ดที่ 1 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-1">
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Beaker className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#2C3E50] mb-2">{settings.feature1Title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{settings.feature1Desc}</p>
          </div>

          {/* การ์ดที่ 2 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-1">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#2C3E50] mb-2">{settings.feature2Title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{settings.feature2Desc}</p>
          </div>

          {/* การ์ดที่ 3 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-1">
            <div className="mx-auto w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#2C3E50] mb-2">{settings.feature3Title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{settings.feature3Desc}</p>
          </div>

        </div>
      </div>
    </section>
  );
}