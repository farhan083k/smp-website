import { useState, useRef, useEffect } from 'react';
import { Settings, Image, Type, Save, Upload, Cloud, CloudOff, RefreshCw, Loader2 } from 'lucide-react'; // 👈 ลบ X, Eye, EyeOff ออกแล้ว
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';
import { uploadLogo, uploadBanner } from '@/lib/firebase';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const { 
    settings, 
    updateSettings, 
    isFirebaseReady,
    lastSync 
  } = useSettings();
  
  const [formData, setFormData] = useState(settings);
  // 👈 ลบ previewMode และ setPreviewMode ออกแล้วตามที่ Vercel บ่น
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      onClose();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleFileChange = async (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(`กำลังอัปโหลด${type === 'logo' ? 'โลโก้' : 'แบนเนอร์'}...`);

    try {
      let downloadURL: string | null = null;
      if (type === 'logo') {
        downloadURL = await uploadLogo(file);
      } else {
        downloadURL = await uploadBanner(file);
      }

      if (downloadURL) {
        setFormData(prev => ({ ...prev, [type]: downloadURL }));
        setUploadProgress('อัปโหลดสำเร็จ!');
        setTimeout(() => setUploadProgress(''), 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'ยังไม่เคยซิงค์';
    return lastSync.toLocaleString('th-TH', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl admin-panel max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C3E50] flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-6 w-6 mr-2 text-[#3498DB]" />
              ตั้งค่าเว็บไซต์
            </div>
            <div className="flex items-center space-x-2">
              {isFirebaseReady ? (
                <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                  <Cloud className="h-3 w-3 mr-1" />
                  Cloud Connected
                </span>
              ) : (
                <span className="flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
                  <CloudOff className="h-3 w-3 mr-1" />
                  Local Mode
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

          <div className="space-y-4 p-4 bg-white rounded-xl border border-[#3498DB]/10 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Image className="h-5 w-5 mr-2 text-[#3498DB]" />
              โลโก้โรงเรียน
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full border-4 border-[#98D8C8]/30 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-cover scale-[1.2]" />
                  ) : (
                    <Image className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                {isUploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full"><Loader2 className="animate-spin text-[#3498DB]" /></div>}
              </div>
              <div className="flex-1 w-full space-y-3">
                <Input value={formData.logo || ''} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="URL รูปภาพโลโก้" />
                <div className="flex gap-2">
                  <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange('logo', e)} accept="image/*" className="hidden" />
                  <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="flex-1 border-[#3498DB] border-dashed" disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" /> อัปโหลดไฟล์ใหม่
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-xl border border-[#3498DB]/10 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Image className="h-5 w-5 mr-2 text-[#3498DB]" />
              แบนเนอร์หน้าแรก
            </h3>
            <div className="relative h-32 w-full rounded-xl border-2 border-[#3498DB]/10 overflow-hidden bg-gray-100">
              {formData.banner ? (
                <img src={formData.banner} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Image className="h-8 w-8 mb-1" />
                  <span className="text-xs">ยังไม่มีรูปแบนเนอร์</span>
                </div>
              )}
              {isUploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-[#3498DB]" /></div>}
            </div>
            <Input value={formData.banner || ''} onChange={(e) => setFormData({ ...formData, banner: e.target.value })} placeholder="URL รูปภาพแบนเนอร์" />
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange('banner', e)} accept="image/*" className="hidden" />
            <Button onClick={() => bannerInputRef.current?.click()} variant="outline" className="w-full border-[#3498DB] border-dashed" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? uploadProgress : 'เลือกไฟล์แบนเนอร์ใหม่ (1920x600)'}
            </Button>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-xl border border-[#3498DB]/10 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <Type className="h-5 w-5 mr-2 text-[#3498DB]" />
              ข้อมูลข้อความ
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">ชื่อโปรแกรม</label>
                <Input value={formData.programName} onChange={(e) => setFormData({ ...formData, programName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">ชื่อโรงเรียน</label>
                <Input value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">คำอธิบายเพิ่มเติม</label>
                <Textarea value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} rows={3} />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-2">
            <Button onClick={handleSave} className="flex-1 btn-primary h-12 text-lg" disabled={isUploading}>
              <Save className="h-5 w-5 mr-2" /> บันทึกข้อมูลทั้งหมด
            </Button>
            <Button onClick={onClose} variant="ghost" className="px-6 text-gray-500" disabled={isUploading}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}