import { useSettings } from '../contexts/SettingsContext';
import { Beaker, Calculator, BookOpen } from 'lucide-react';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section className="bg-[#F8FAFC] pt-16 pb-12 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          
          {/* 👇 การ์ดที่ 1 (วิทยาศาสตร์) */}
          <div 
            className="relative rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-1 overflow-hidden group"
            style={{ 
              backgroundColor: settings.feature1Bg ? 'transparent' : 'white',
              backgroundImage: settings.feature1Bg ? `url(${settings.feature1Bg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* เลเยอร์สีขาวจางๆ ทับรูปพื้นหลัง เพื่อให้ยังอ่านตัวหนังสือออก */}
            {settings.feature1Bg && <div className="absolute inset-0 bg-white/85 group-hover:bg-white/90 transition-colors z-0"></div>}
            
            <div className="relative z-10">
              <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-sm border border-blue-100">
                {settings.feature1Icon ? <img src={settings.feature1Icon} alt="Icon" className="w-full h-full object-cover" /> : <Beaker className="w-6 h-6" />}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#2C3E50] mb-2">{settings.feature1Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{settings.feature1Desc}</p>
            </div>
          </div>

          {/* 👇 การ์ดที่ 2 (คณิตศาสตร์) */}
          <div 
            className="relative rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-1 overflow-hidden group"
            style={{ 
              backgroundColor: settings.feature2Bg ? 'transparent' : 'white',
              backgroundImage: settings.feature2Bg ? `url(${settings.feature2Bg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {settings.feature2Bg && <div className="absolute inset-0 bg-white/85 group-hover:bg-white/90 transition-colors z-0"></div>}
            
            <div className="relative z-10">
              <div className="mx-auto w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-sm border border-red-100">
                {settings.feature2Icon ? <img src={settings.feature2Icon} alt="Icon" className="w-full h-full object-cover" /> : <Calculator className="w-6 h-6" />}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#2C3E50] mb-2">{settings.feature2Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{settings.feature2Desc}</p>
            </div>
          </div>

          {/* 👇 การ์ดที่ 3 (ภาษาอังกฤษ) */}
          <div 
            className="relative rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-6 md:p-8 transition-all hover:-translate-y-1 overflow-hidden group"
            style={{ 
              backgroundColor: settings.feature3Bg ? 'transparent' : 'white',
              backgroundImage: settings.feature3Bg ? `url(${settings.feature3Bg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {settings.feature3Bg && <div className="absolute inset-0 bg-white/85 group-hover:bg-white/90 transition-colors z-0"></div>}
            
            <div className="relative z-10">
              <div className="mx-auto w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-sm border border-green-100">
                {settings.feature3Icon ? <img src={settings.feature3Icon} alt="Icon" className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6" />}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#2C3E50] mb-2">{settings.feature3Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{settings.feature3Desc}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}