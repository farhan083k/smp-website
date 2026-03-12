import { useSettings } from '../contexts/SettingsContext';
import { Beaker, Calculator, BookOpen } from 'lucide-react';

export default function Hero() {
  const { settings } = useSettings();

  return (
    // 👇 ปรับส่วนนี้ให้ดึง settings.banner มาใช้เป็นพื้นหลัง
    <section 
      className="relative pt-20 pb-16 border-b border-gray-100 overflow-hidden"
      style={{ 
        backgroundColor: settings.banner ? 'transparent' : '#F8FAFC',
        backgroundImage: settings.banner ? `url(${settings.banner})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll' // หรือ 'fixed' ถ้าอยากให้รูปอยู่กับที่ตอนเลื่อน
      }}
    >
      {/* 🌑 ใส่ Overlay สีขาวจางๆ ทับรูปแบนเนอร์เพื่อให้ตัวหนังสือยังอ่านง่าย */}
      {settings.banner && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-0"></div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="mb-12">
          <h1 className="text-3xl md:text-6xl font-extrabold text-[#2C3E50] tracking-tight mb-3 leading-tight">
            {settings.heroTitle1}
          </h1>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight" style={{ color: settings.primaryColor || '#3498DB' }}>
            {settings.heroTitle2}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {settings.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* การ์ดที่ 1 */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden relative group">
            {settings.feature1Bg && <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url(${settings.feature1Bg})` }}></div>}
            <div className="relative z-10">
              <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                {settings.feature1Icon ? <img src={settings.feature1Icon} className="w-full h-full object-cover rounded-full"/> : <Beaker className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{settings.feature1Title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{settings.feature1Desc}</p>
            </div>
          </div>

          {/* การ์ดที่ 2 */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden relative group">
            {settings.feature2Bg && <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url(${settings.feature2Bg})` }}></div>}
            <div className="relative z-10">
              <div className="mx-auto w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                {settings.feature2Icon ? <img src={settings.feature2Icon} className="w-full h-full object-cover rounded-full"/> : <Calculator className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{settings.feature2Title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{settings.feature2Desc}</p>
            </div>
          </div>

          {/* การ์ดที่ 3 */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden relative group">
            {settings.feature3Bg && <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url(${settings.feature3Bg})` }}></div>}
            <div className="relative z-10">
              <div className="mx-auto w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                {settings.feature3Icon ? <img src={settings.feature3Icon} className="w-full h-full object-cover rounded-full"/> : <BookOpen className="w-7 h-7" />}
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{settings.feature3Title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{settings.feature3Desc}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}