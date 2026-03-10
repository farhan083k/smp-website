import { useState, useRef } from 'react';
import { Settings, Image, Type, Save, X, Upload, Eye, EyeOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
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

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const { 
    settings, 
    updateSettings, 
    uploadLogoFile, 
    uploadBannerFile,
    isFirebaseReady,
    lastSync 
  } = useSettings();
  
  const [formData, setFormData] = useState(settings);
  const [previewMode, setPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await updateSettings({
      programName: formData.programName,
      schoolName: formData.schoolName,
      subtitle: formData.subtitle,
      logo: formData.logo,
      banner: formData.banner,
    });
    onClose();
  };

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    setIsUploading(true);
    setUploadProgress(`กำลังอัพโหลด${type === 'logo' ? 'โลโก้' : 'แบนเนอร์'}...`);
    
    try {
      let result: string | null = null;
      
      if (type === 'logo') {
        result = await uploadLogoFile(file);
      } else {
        result = await uploadBannerFile(file);
      }
      
      if (result) {
        if (type === 'logo') {
          setFormData({ ...formData, logo: result });
        } else {
          setFormData({ ...formData, banner: result });
        }
        setUploadProgress('อัพโหลดสำเร็จ!');
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        setUploadProgress('อัพโหลดไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadProgress('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadProgress('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
        return;
      }
      
      await handleImageUpload(type, file);
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
      <DialogContent className="sm:max-w-2xl admin-panel max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C3E50] flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-6 w-6 mr-2 text-[#3498DB]" />
              ตั้งค่าเว็บไซต์
            </div>
            <div className="flex items-center space-x-2">
              {isFirebaseReady ? (
                <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  <Cloud className="h-3 w-3 mr-1" />
                  Cloud Ready
                </span>
              ) : (
                <span className="flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                  <CloudOff className="h-3 w-3 mr-1" />
                  Local Only
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Cloud Status */}
          <div className="p-3 bg-[#98D8C8]/20 rounded-lg border border-[#3498DB]/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#2C3E50]">
                  สถานะการเชื่อมต่อ
                </p>
                <p className="text-xs text-[#2C3E50]/60">
                  {isFirebaseReady 
                    ? 'เชื่อมต่อ Firebase แล้ว - ข้อมูลซิงค์แบบ Realtime' 
                    : 'ใช้งานแบบ Offline - ข้อมูลจะถูกเก็บในเบราว์เซอร์'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#2C3E50]/60">ซิงค์ล่าสุด:</p>
                <p className="text-xs font-medium text-[#2C3E50]">{formatLastSync()}</p>
              </div>
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#3498DB]/30">
            <span className="text-sm font-medium text-[#2C3E50]">โหมดแสดงตัวอย่าง</span>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded-lg transition-colors ${
                previewMode ? 'bg-[#3498DB] text-white' : 'bg-white border border-[#3498DB] text-[#3498DB]'
              }`}
            >
              {previewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Logo Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#2C3E50] flex items-center">
              <Image className="h-5 w-5 mr-2 text-[#3498DB]" />
              โลโก้
            </h3>
            
            {/* Current Logo Preview */}
            {(formData.logo || previewMode) && (
              <div className="p-4 bg-white rounded-lg border border-[#3498DB]/30">
                <p className="text-xs text-[#2C3E50]/60 mb-2">ตัวอย่างโลโก้:</p>
                <div className="flex items-center space-x-3">
                  {formData.logo ? (
                    <img
                      src={formData.logo}
                      alt="Logo"
                      className="h-16 w-16 object-contain rounded-lg border border-[#3498DB]/20"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-[#98D8C8]/30 rounded-lg flex items-center justify-center border border-[#3498DB]/20">
                      <Image className="h-8 w-8 text-[#3498DB]/50" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Logo URL Input */}
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                URL รูปโลโก้
              </label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="border-[#3498DB]"
              />
            </div>

            {/* Logo File Upload */}
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                หรืออัพโหลดไฟล์ {isFirebaseReady && '(จะอัพโหลดไปยัง Cloud อัตโนมัติ)'}
              </label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={(e) => handleFileChange('logo', e)}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => logoInputRef.current?.click()}
                variant="outline"
                className="w-full border-[#3498DB] border-dashed"
                disabled={isUploading}
              >
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? uploadProgress : 'เลือกไฟล์รูปภาพ'}
              </Button>
              <p className="text-xs text-[#2C3E50]/50 mt-1">
                รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB
              </p>
            </div>
          </div>

          {/* Banner Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#2C3E50] flex items-center">
              <Image className="h-5 w-5 mr-2 text-[#3498DB]" />
              แบนเนอร์หน้าแรก
            </h3>
            
            {/* Current Banner Preview */}
            {(formData.banner || previewMode) && (
              <div className="p-4 bg-white rounded-lg border border-[#3498DB]/30">
                <p className="text-xs text-[#2C3E50]/60 mb-2">ตัวอย่างแบนเนอร์:</p>
                {formData.banner ? (
                  <img
                    src={formData.banner}
                    alt="Banner"
                    className="w-full h-32 object-cover rounded-lg border border-[#3498DB]/20"
                  />
                ) : (
                  <div className="w-full h-32 bg-[#98D8C8]/30 rounded-lg flex items-center justify-center border border-[#3498DB]/20">
                    <Image className="h-12 w-12 text-[#3498DB]/50" />
                  </div>
                )}
              </div>
            )}

            {/* Banner URL Input */}
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                URL รูปแบนเนอร์
              </label>
              <Input
                value={formData.banner}
                onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="border-[#3498DB]"
              />
            </div>

            {/* Banner File Upload */}
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                หรืออัพโหลดไฟล์ {isFirebaseReady && '(จะอัพโหลดไปยัง Cloud อัตโนมัติ)'}
              </label>
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleFileChange('banner', e)}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => bannerInputRef.current?.click()}
                variant="outline"
                className="w-full border-[#3498DB] border-dashed"
                disabled={isUploading}
              >
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? uploadProgress : 'เลือกไฟล์รูปภาพ'}
              </Button>
              <p className="text-xs text-[#2C3E50]/50 mt-1">
                แนะนำขนาด 1920x600 พิกเซล สำหรับแบนเนอร์หน้าแรก
              </p>
            </div>
          </div>

          {/* Text Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#2C3E50] flex items-center">
              <Type className="h-5 w-5 mr-2 text-[#3498DB]" />
              ข้อความ
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ชื่อโปรแกรม
              </label>
              <Input
                value={formData.programName}
                onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                placeholder="ชื่อโปรแกรม"
                className="border-[#3498DB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ชื่อโรงเรียน
              </label>
              <Input
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="ชื่อโรงเรียน"
                className="border-[#3498DB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                คำอธิบาย (Subtitle)
              </label>
              <Textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="คำอธิบายโปรแกรม"
                rows={2}
                className="border-[#3498DB]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-[#3498DB]/20">
            <Button onClick={handleSave} className="flex-1 btn-primary" disabled={isUploading}>
              <Save className="h-4 w-4 mr-2" />
              บันทึกการตั้งค่า
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-[#3498DB]"
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
