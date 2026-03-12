import { useState, useRef, useEffect } from 'react';
import { Settings, Image as ImageIcon, ListOrdered, Loader2, Move, Palette, Globe, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';
import ImageTransformEditor from '@/components/Admin/ImageTransformEditor';

interface AdminSettingsProps { isOpen: boolean; onClose: () => void; }
interface ImageTransform { scale: number; x: number; y: number; }

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const { settings, updateSettings, uploadLogoFile, uploadBannerFile, isFirebaseReady } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [isUploading, setIsUploading] = useState(false);
  const [transformEditorOpen, setTransformEditorOpen] = useState<'logo' | 'banner' | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFormData(settings); }, [settings, isOpen]);

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      alert('บันทึกสำเร็จ!');
      onClose();
    } catch (error) { alert('ผิดพลาด!'); }
  };

  const handleFileChange = async (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let url = type === 'logo' ? await uploadLogoFile(file) : await uploadBannerFile(file);
      if (url) setFormData(prev => ({ ...prev, [type]: url }));
    } finally { setIsUploading(false); }
  };

  const handleSaveTransform = (type: 'logo' | 'banner', t: ImageTransform) => {
    const key = type === 'logo' ? 'logoTransform' : 'bannerTransform';
    setFormData(prev => ({ ...prev, [key]: t }));
    setTransformEditorOpen(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* 👇 ปรับความกว้างเป็น max-w-5xl (กว้างขึ้น) เพื่อให้ใส่ได้ 2 คอลัมน์ */}
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-hidden p-0 border-none shadow-2xl flex flex-col">
          <DialogHeader className="p-6 border-b shrink-0 bg-white">
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <div className="flex items-center text-[#2C3E50]"><Settings className="h-6 w-6 mr-2 text-blue-500" /> ตั้งค่าเว็บไซต์</div>
              <div className={`text-[10px] px-3 py-1 rounded-full font-bold ${isFirebaseReady ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {isFirebaseReady ? 'ONLINE: FIREBASE' : 'LOCAL MODE'}
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* 📦 ส่วนเนื้อหาแบ่งเป็น 2 คอลัมน์ */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* คอลัมน์ซ้าย: การจัดเรียงและสี */}
              <div className="space-y-6">
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center"><ListOrdered className="w-4 h-4 mr-2"/> ลำดับการแสดงผล</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Announcements', 'Programs', 'Activities', 'Staff', 'Documents', 'Projects', 'Others'].map((key) => (
                      <div key={key} className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-400 mb-1 uppercase">{key}</label>
                        <Input type="number" value={(formData as any)[`order${key}`] || 0} onChange={(e) => setFormData({ ...formData, [`order${key}`]: Number(e.target.value) })} className="h-9 text-blue-600 font-bold" />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center"><Palette className="w-4 h-4 mr-2"/> สีธีมเว็บไซต์</h3>
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border">
                    <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-12 cursor-pointer rounded-lg overflow-hidden" />
                    <div><p className="text-sm font-bold text-[#2C3E50]">สีหลักประจำโรงเรียน</p><p className="text-xs text-gray-400">{formData.primaryColor}</p></div>
                  </div>
                </section>
              </div>

              {/* คอลัมน์ขวา: โลโก้และแบนเนอร์ */}
              <div className="space-y-6">
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center"><ImageIcon className="w-4 h-4 mr-2"/> โลโก้ & แบนเนอร์</h3>
                  
                  {/* โลโก้แบบย่อ */}
                  <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
                      {formData.logo ? <img src={formData.logo} className="max-w-none" style={{transform: `translate(${formData.logoTransform.x/4}px, ${formData.logoTransform.y/4}px) scale(${formData.logoTransform.scale})`, width: '40px'}} /> : <ImageIcon className="w-6 h-6 text-gray-200" />}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Button onClick={() => logoInputRef.current?.click()} size="sm" variant="outline" className="flex-1 text-xs">อัปโหลด</Button>
                      <Button onClick={() => setTransformEditorOpen('logo')} size="sm" variant="secondary" className="flex-1 text-xs"><Move className="w-3 h-3 mr-1"/> ปรับตำแหน่ง</Button>
                    </div>
                  </div>

                  {/* แบนเนอร์แบบย่อ */}
                  <div className="space-y-3">
                    <div className="h-24 w-full rounded-xl border bg-gray-100 overflow-hidden flex items-center justify-center relative">
                      {formData.banner ? <img src={formData.banner} className="max-w-none" style={{transform: `translate(${formData.bannerTransform.x/10}px, ${formData.bannerTransform.y/10}px) scale(${formData.bannerTransform.scale})`, width: '100%'}} /> : <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Banner</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => bannerInputRef.current?.click()} size="sm" variant="outline" className="flex-1 text-xs">อัปโหลดแบนเนอร์</Button>
                      <Button onClick={() => setTransformEditorOpen('banner')} size="sm" variant="secondary" className="flex-1 text-xs"><Move className="w-3 h-3 mr-1"/> ปรับตำแหน่ง</Button>
                    </div>
                  </div>
                  <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange('logo', e)} className="hidden" accept="image/*" />
                  <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange('banner', e)} className="hidden" accept="image/*" />
                </section>

                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center"><Globe className="w-4 h-4 mr-2"/> ข้อมูลติดต่อ</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400">ชื่อโรงเรียน</label><Input value={formData.schoolName} onChange={(e)=>setFormData({...formData, schoolName: e.target.value})} className="h-8 text-xs" /></div>
                    <div><label className="text-[10px] font-bold text-gray-400">เบอร์โทร</label><Input value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="h-8 text-xs" /></div>
                    <div><label className="text-[10px] font-bold text-gray-400">อีเมล</label><Input value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="h-8 text-xs" /></div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* 💾 ปุ่มบันทึก (อยู่คงที่ด้านล่าง ไม่ขยับไปไหน) */}
          <div className="p-4 bg-white border-t shrink-0 flex items-center justify-between">
            <div className="flex items-center text-xs text-blue-500 font-bold"><Info className="w-4 h-4 mr-2"/> ตรวจสอบข้อมูลก่อนกดบันทึก</div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="ghost" className="text-gray-400">ยกเลิก</Button>
              <Button onClick={handleSave} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-11 text-lg shadow-lg">
                {isUploading ? <Loader2 className="animate-spin w-5 h-5 mr-2"/> : <Save className="w-5 h-5 mr-2" />} บันทึกทั้งหมด
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🛠️ ส่วนปรับแต่งรูปภาพ (อยู่ข้างนอก Dialog หลัก) */}
      {transformEditorOpen === 'logo' && formData.logo && (
        <ImageTransformEditor imageUrl={formData.logo} initialTransform={formData.logoTransform} onSave={(t) => handleSaveTransform('logo', t)} onClose={() => setTransformEditorOpen(null)} />
      )}
      {transformEditorOpen === 'banner' && formData.banner && (
        <ImageTransformEditor imageUrl={formData.banner} initialTransform={formData.bannerTransform} onSave={(t) => handleSaveTransform('banner', t)} onClose={() => setTransformEditorOpen(null)} />
      )}
    </>
  );
}
// 👇 เพิ่ม icon Save ที่หายไปตอน import
const Save = ({className}: {className?: string}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;