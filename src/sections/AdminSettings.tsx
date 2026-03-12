import { useState, useRef, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// 👇 ลบ X ออกจากตรงนี้แล้วครับ
import { Settings, Image, Type, Save, Upload, Palette, Contact, ListOrdered, Loader2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';
import ImageTransformEditor from '@/components/Admin/ImageTransformEditor';

interface AdminSettingsProps { isOpen: boolean; onClose: () => void; }
interface ImageTransform { scale: number; x: number; y: number; }

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const { settings, updateSettings, uploadLogoFile, uploadBannerFile, isFirebaseReady } = useSettings();
  
  const [formData, setFormData] = useState(settings);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [transformEditorOpen, setTransformEditorOpen] = useState<'logo' | 'banner' | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFormData(settings); }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      onClose();
    } catch (error) { alert('เกิดข้อผิดพลาดในการบันทึก'); }
  };

  const handleFileChange = async (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(`กำลังอัปโหลด...`);
    try {
      let downloadURL = type === 'logo' ? await uploadLogoFile(file) : await uploadBannerFile(file);
      if (downloadURL) { setFormData(prev => ({ ...prev, [type]: downloadURL })); }
    } finally { setIsUploading(false); setUploadProgress(''); }
  };

  const handleSaveTransform = (type: 'logo' | 'banner', transform: ImageTransform) => {
    const key = type === 'logo' ? 'logoTransform' : 'bannerTransform';
    setFormData(prev => ({ ...prev, [key]: transform }));
    setTransformEditorOpen(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl admin-panel max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2C3E50] flex items-center justify-between">
              <div className="flex items-center"><Settings className="h-6 w-6 mr-2 text-[var(--primary)]" />ตั้งค่าเว็บไซต์</div>
              <div className="flex items-center space-x-2">
                {isUploading && <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> {uploadProgress}</span>}
                <span className={`text-[10px] px-2 py-1 rounded-full ${isFirebaseReady ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isFirebaseReady ? 'Firebase: Connected' : 'Local Mode'}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="space-y-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
                <ListOrdered className="h-5 w-5 mr-2 text-blue-600" /> จัดเรียงลำดับหน้าเว็บ
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">ข่าวสาร</label><Input type="number" value={formData.orderAnnouncements || 1} onChange={(e) => setFormData({ ...formData, orderAnnouncements: Number(e.target.value) })} className="h-8 text-center" /></div>
                <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">กิจกรรม</label><Input type="number" value={formData.orderActivities || 3} onChange={(e) => setFormData({ ...formData, orderActivities: Number(e.target.value) })} className="h-8 text-center" /></div>
                <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">โครงการ</label><Input type="number" value={formData.orderProjects || 6} onChange={(e) => setFormData({ ...formData, orderProjects: Number(e.target.value) })} className="h-8 text-center" /></div>
                <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">อื่นๆ</label><Input type="number" value={formData.orderOthers || 7} onChange={(e) => setFormData({ ...formData, orderOthers: Number(e.target.value) })} className="h-8 text-center" /></div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#2C3E50] flex items-center"><Image className="h-5 w-5 mr-2 text-[var(--primary)]" /> โลโก้ & แบนเนอร์</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
                <div className="h-24 w-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {formData.logo ? ( <img src={formData.logo} alt="Logo" className="max-w-none origin-center" style={{transform: `translate(${formData.logoTransform.x}px, ${formData.logoTransform.y}px) scale(${formData.logoTransform.scale})`}} /> ) : ( <Image className="h-8 w-8 text-gray-300" /> )}
                </div>
                <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                        <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange('logo', e)} accept="image/*" className="hidden" />
                        <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="flex-1 border-dashed">อัปโหลดโลโก้</Button>
                        <Button onClick={() => setTransformEditorOpen('logo')} variant="secondary"><Move className="h-4 w-4 mr-2" /> ปรับตำแหน่ง</Button>
                    </div>
                </div>
              </div>
              <div className="relative h-32 w-full rounded-xl border-2 overflow-hidden bg-gray-100">
                {formData.banner ? ( <img src={formData.banner} alt="Banner" className="max-w-none origin-center" style={{transform: `translate(${formData.bannerTransform.x}px, ${formData.bannerTransform.y}px) scale(${formData.bannerTransform.scale})`}} /> ) : ( <div className="h-full flex items-center justify-center text-gray-400">ยังไม่มีแบนเนอร์</div> )}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange('banner', e)} accept="image/*" className="hidden" />
                <Button onClick={() => bannerInputRef.current?.click()} variant="outline" className="flex-1 border-dashed">อัปโหลดแบนเนอร์</Button>
                <Button onClick={() => setTransformEditorOpen('banner')} variant="secondary"><Move className="h-4 w-4 mr-2" /> ปรับตำแหน่ง</Button>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full h-12 text-lg" style={{ backgroundColor: 'var(--primary)' }}>บันทึกทั้งหมด</Button>
          </div>
        </DialogContent>
      </Dialog>

      {transformEditorOpen === 'logo' && formData.logo && (
        <ImageTransformEditor imageUrl={formData.logo} initialTransform={formData.logoTransform} onSave={(t) => handleSaveTransform('logo', t)} onClose={() => setTransformEditorOpen(null)} />
      )}
      {transformEditorOpen === 'banner' && formData.banner && (
        <ImageTransformEditor imageUrl={formData.banner} initialTransform={formData.bannerTransform} onSave={(t) => handleSaveTransform('banner', t)} onClose={() => setTransformEditorOpen(null)} />
      )}
    </>
  );
}