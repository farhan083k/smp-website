import { useState, useRef, useEffect } from 'react';
import { Settings, Image, Type, Save, Upload, Cloud, CloudOff, RefreshCw, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';

interface AdminSettingsProps { isOpen: boolean; onClose: () => void; }

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  // ดึงฟังก์ชันอัปโหลดจาก Context โดยตรง เพื่อเลี่ยงปัญหา Import
  const { settings, updateSettings, isFirebaseReady, lastSync, uploadLogoFile, uploadBannerFile } = useSettings();
  
  const [formData, setFormData] = useState(settings);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
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
    if (!file.type.startsWith('image/')) return alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    if (file.size > 5 * 1024 * 1024) return alert('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
    
    setIsUploading(true);
    setUploadProgress(`กำลังอัปโหลด${type === 'logo' ? 'โลโก้' : 'แบนเนอร์'}...`);

    try {
      let downloadURL: string | null = null;
      if (type === 'logo') downloadURL = await uploadLogoFile(file);
      else downloadURL = await uploadBannerFile(file);

      if (downloadURL) {
        setFormData(prev => ({ ...prev, [type]: downloadURL }));
        setUploadProgress('อัปโหลดสำเร็จ!');
        setTimeout(() => setUploadProgress(''), 2000);
      }
    } catch (error) { setUploadProgress('เกิดข้อผิดพลาดในการอัปโหลด'); } 
    finally { setIsUploading(false); }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'ยังไม่เคยซิงค์';
    return lastSync.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl admin-panel max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C3E50] flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-6 w-6 mr-2 text-[var(--primary)]" />
              ตั้งค่าเว็บไซต์
            </div>
            <div className="flex items-center space-x-2">
              {isFirebaseReady ? (
                <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                  <Cloud className="h-3 w-3 mr-1" /> Cloud Connected
                </span>
              ) : (
                <span className="flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
                  <CloudOff className="h-3 w-3 mr-1" /> Local Mode
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center text-sm">
            <div className="flex items-center text-[#2C3E50]/70">
              <RefreshCw className={`h-3 w-3 mr-2 ${isUploading ? 'animate-spin' : ''}`} />
              ซิงค์ล่าสุด: {formatLastSync()}
            </div>
          </div>

          {/* 🎨 สีธีมเว็บไซต์ */}
          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Palette className="h-5 w-5 mr-2 text-[var(--primary)]" /> สีธีมเว็บไซต์
            </h3>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input type="color" value={formData.primaryColor || '#3498DB'} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="h-12 w-20 cursor-pointer rounded bg-white" />
              <div>
                <p className="text-sm font-bold text-[#2C3E50]">เลือกสีหลักของเว็บไซต์</p>
                <p className="text-xs text-gray-500">รหัสสีปัจจุบัน: {formData.primaryColor || '#3498DB'}</p>
              </div>
            </div>
          </div>

          {/* 🖼️ Logo Section */}
          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Image className="h-5 w-5 mr-2 text-[var(--primary)]" /> โลโก้ & แบนเนอร์
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full border-4 border-[#98D8C8]/30 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
                  {formData.logo ? ( <img src={formData.logo} alt="Logo" className="w-full h-full object-cover scale-[1.2]" /> ) : ( <Image className="h-8 w-8 text-gray-300" /> )}
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                <Input value={formData.logo || ''} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="URL รูปภาพโลโก้" />
                <div className="flex gap-2">
                  <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange('logo', e)} accept="image/*" className="hidden" />
                  <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="flex-1 border-dashed border-2" disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" /> อัปโหลดโลโก้ใหม่
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="relative h-32 w-full rounded-xl border-2 overflow-hidden bg-gray-100 mb-2">
              {formData.banner ? ( <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" /> ) : ( <div className="flex flex-col items-center justify-center h-full text-gray-400"><Image className="h-8 w-8 mb-1" /><span className="text-xs">ยังไม่มีรูปแบนเนอร์</span></div> )}
            </div>
            <Input value={formData.banner || ''} onChange={(e) => setFormData({ ...formData, banner: e.target.value })} placeholder="URL รูปภาพแบนเนอร์" />
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange('banner', e)} accept="image/*" className="hidden" />
            <Button onClick={() => bannerInputRef.current?.click()} variant="outline" className="w-full border-dashed border-2" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" /> {isUploading ? uploadProgress : 'อัปโหลดแบนเนอร์ใหม่ (1920x600)'}
            </Button>
          </div>

          {/* 📝 Text Settings */}
          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Type className="h-5 w-5 mr-2 text-[var(--primary)]" /> ข้อมูลโรงเรียน
            </h3>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">ชื่อโปรแกรม</label><Input value={formData.programName || ''} onChange={(e) => setFormData({ ...formData, programName: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">ชื่อโรงเรียน</label><Input value={formData.schoolName || ''} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">คำอธิบายเพิ่มเติม</label><Textarea value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} rows={3} /></div>
            </div>
          </div>

          {/* 📝 ข้อความหน้าแรก (Hero Section) */}
          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Type className="h-5 w-5 mr-2 text-[var(--primary)]" /> ข้อความหน้าแรก (Hero & Features)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">หัวข้อบรรทัดแรก</label><Input value={formData.heroTitle1 || ''} onChange={(e) => setFormData({ ...formData, heroTitle1: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">หัวข้อบรรทัดที่สอง (สีเด่น)</label><Input value={formData.heroTitle2 || ''} onChange={(e) => setFormData({ ...formData, heroTitle2: e.target.value })} /></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-sm font-bold text-[#2C3E50] border-b pb-2">จุดเด่นที่ 1 (ซ้าย)</p>
                  <Input placeholder="ชื่อวิชา/จุดเด่น" value={formData.feature1Title || ''} onChange={(e) => setFormData({ ...formData, feature1Title: e.target.value })} />
                  <Textarea placeholder="คำอธิบาย" rows={3} value={formData.feature1Desc || ''} onChange={(e) => setFormData({ ...formData, feature1Desc: e.target.value })} />
                </div>
                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-sm font-bold text-[#2C3E50] border-b pb-2">จุดเด่นที่ 2 (กลาง)</p>
                  <Input placeholder="ชื่อวิชา/จุดเด่น" value={formData.feature2Title || ''} onChange={(e) => setFormData({ ...formData, feature2Title: e.target.value })} />
                  <Textarea placeholder="คำอธิบาย" rows={3} value={formData.feature2Desc || ''} onChange={(e) => setFormData({ ...formData, feature2Desc: e.target.value })} />
                </div>
                <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-sm font-bold text-[#2C3E50] border-b pb-2">จุดเด่นที่ 3 (ขวา)</p>
                  <Input placeholder="ชื่อวิชา/จุดเด่น" value={formData.feature3Title || ''} onChange={(e) => setFormData({ ...formData, feature3Title: e.target.value })} />
                  <Textarea placeholder="คำอธิบาย" rows={3} value={formData.feature3Desc || ''} onChange={(e) => setFormData({ ...formData, feature3Desc: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-2">
            <Button onClick={handleSave} className="flex-1 btn-primary h-12 text-lg" disabled={isUploading} style={{ backgroundColor: 'var(--primary)' }}>
              <Save className="h-5 w-5 mr-2" /> บันทึกข้อมูลทั้งหมด
            </Button>
            <Button onClick={onClose} variant="ghost" className="px-6 text-gray-500" disabled={isUploading}>ยกเลิก</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}