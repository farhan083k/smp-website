import { useState, useRef, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // 👈 นำเข้าตัวอัปโหลด
import { Settings, Image, Type, Save, Upload, Cloud, CloudOff, Palette, Contact, ListOrdered, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSettings } from '@/contexts/SettingsContext';

interface AdminSettingsProps { isOpen: boolean; onClose: () => void; }

export default function AdminSettings({ isOpen, onClose }: AdminSettingsProps) {
  const { settings, updateSettings, isFirebaseReady, uploadLogoFile, uploadBannerFile } = useSettings();
  
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
    setIsUploading(true);
    setUploadProgress(`กำลังอัปโหลด${type === 'logo' ? 'โลโก้' : 'แบนเนอร์'}...`);
    try {
      let downloadURL = type === 'logo' ? await uploadLogoFile(file) : await uploadBannerFile(file);
      if (downloadURL) {
        setFormData(prev => ({ ...prev, [type]: downloadURL }));
        setUploadProgress('อัปโหลดสำเร็จ!');
        setTimeout(() => setUploadProgress(''), 2000);
      }
    } catch (error) { setUploadProgress('เกิดข้อผิดพลาดในการอัปโหลด'); } 
    finally { setIsUploading(false); }
  };

  // 👇 ฟังก์ชันอัปโหลดรูปภาพเฉพาะของส่วนจุดเด่น (Features)
  const handleFeatureUpload = async (feature: string, type: 'Icon' | 'Bg', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(`กำลังอัปโหลด...`);
    try {
      const storage = getStorage();
      const fileRef = ref(storage, `settings/${feature}_${type}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setFormData(prev => ({ ...prev, [`${feature}${type}`]: url }));
      setUploadProgress('อัปโหลดสำเร็จ!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) { setUploadProgress('เกิดข้อผิดพลาดในการอัปโหลด'); } 
    finally { setIsUploading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl admin-panel max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C3E50] flex items-center justify-between">
            <div className="flex items-center"><Settings className="h-6 w-6 mr-2 text-[var(--primary)]" />ตั้งค่าเว็บไซต์</div>
            <div className="flex items-center space-x-2">
              {isUploading && <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> {uploadProgress}</span>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          
          <div className="space-y-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center">
              <ListOrdered className="h-5 w-5 mr-2 text-blue-600" /> จัดเรียงลำดับส่วนต่างๆ บนหน้าเว็บ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">ข่าวประชาสัมพันธ์</label><Input type="number" value={formData.orderAnnouncements || 1} onChange={(e) => setFormData({ ...formData, orderAnnouncements: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">แนะนำโปรแกรม</label><Input type="number" value={formData.orderPrograms || 2} onChange={(e) => setFormData({ ...formData, orderPrograms: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">กิจกรรม</label><Input type="number" value={formData.orderActivities || 3} onChange={(e) => setFormData({ ...formData, orderActivities: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">บุคลากร</label><Input type="number" value={formData.orderStaff || 4} onChange={(e) => setFormData({ ...formData, orderStaff: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">เอกสารดาวน์โหลด</label><Input type="number" value={formData.orderDocuments || 5} onChange={(e) => setFormData({ ...formData, orderDocuments: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">โครงการ</label><Input type="number" value={formData.orderProjects || 6} onChange={(e) => setFormData({ ...formData, orderProjects: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
              <div className="bg-white p-2 rounded-lg border shadow-sm"><label className="text-[10px] font-bold text-gray-500 uppercase">ข้อมูลอื่นๆ</label><Input type="number" value={formData.orderOthers || 7} onChange={(e) => setFormData({ ...formData, orderOthers: Number(e.target.value) })} className="h-8 text-center font-bold text-blue-600" /></div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center"><Palette className="h-5 w-5 mr-2 text-[var(--primary)]" /> สีธีมเว็บไซต์</h3>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input type="color" value={formData.primaryColor || '#3498DB'} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="h-12 w-20 cursor-pointer rounded bg-white" />
              <div><p className="text-sm font-bold text-[#2C3E50]">เลือกสีหลักของเว็บไซต์</p><p className="text-xs text-gray-500">รหัสสีปัจจุบัน: {formData.primaryColor || '#3498DB'}</p></div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center"><Image className="h-5 w-5 mr-2 text-[var(--primary)]" /> โลโก้ & แบนเนอร์</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
              <div className="relative group"><div className="h-24 w-24 rounded-full border-4 border-[#98D8C8]/30 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">{formData.logo ? ( <img src={formData.logo} alt="Logo" className="w-full h-full object-cover scale-[1.2]" /> ) : ( <Image className="h-8 w-8 text-gray-300" /> )}</div></div>
              <div className="flex-1 w-full space-y-3"><Input value={formData.logo || ''} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="URL รูปภาพโลโก้" /><div className="flex gap-2"><input type="file" ref={logoInputRef} onChange={(e) => handleFileChange('logo', e)} accept="image/*" className="hidden" /><Button onClick={() => logoInputRef.current?.click()} variant="outline" className="flex-1 border-dashed border-2" disabled={isUploading}><Upload className="h-4 w-4 mr-2" /> อัปโหลดโลโก้ใหม่</Button></div></div>
            </div>
            <div className="relative h-32 w-full rounded-xl border-2 overflow-hidden bg-gray-100 mb-2">{formData.banner ? ( <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" /> ) : ( <div className="flex flex-col items-center justify-center h-full text-gray-400"><Image className="h-8 w-8 mb-1" /><span className="text-xs">ยังไม่มีรูปแบนเนอร์</span></div> )}</div>
            <Input value={formData.banner || ''} onChange={(e) => setFormData({ ...formData, banner: e.target.value })} placeholder="URL รูปภาพแบนเนอร์" />
            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange('banner', e)} accept="image/*" className="hidden" />
            <Button onClick={() => bannerInputRef.current?.click()} variant="outline" className="w-full border-dashed border-2" disabled={isUploading}><Upload className="h-4 w-4 mr-2" /> อัปโหลดแบนเนอร์ใหม่</Button>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center"><Type className="h-5 w-5 mr-2 text-[var(--primary)]" /> ข้อความหน้าแรก (Hero & Features)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">หัวข้อบรรทัดแรก</label><Input value={formData.heroTitle1 || ''} onChange={(e) => setFormData({ ...formData, heroTitle1: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">หัวข้อบรรทัดที่สอง (สีเด่น)</label><Input value={formData.heroTitle2 || ''} onChange={(e) => setFormData({ ...formData, heroTitle2: e.target.value })} /></div>
              </div>
              
              {/* 👇 เพิ่มช่องอัปโหลดไอคอนและพื้นหลัง */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* จุดเด่น 1 */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                  <p className="text-sm font-bold text-[#2C3E50] border-b pb-2">จุดเด่นที่ 1 (ซ้าย)</p>
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded border"><span className="text-gray-500 font-bold">ไอคอน:</span><div className="flex items-center gap-2">{formData.feature1Icon ? <img src={formData.feature1Icon} className="w-6 h-6 rounded-full object-cover"/> : <span className="text-gray-300">ไม่มี</span>}<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] bg-blue-50 text-blue-600" onClick={() => document.getElementById('f1-icon')?.click()}>อัปโหลด</Button>{formData.feature1Icon && <button onClick={()=>setFormData({...formData, feature1Icon: ''})}><X className="w-3 h-3 text-red-500"/></button>}</div><input type="file" id="f1-icon" className="hidden" accept="image/*" onChange={(e) => handleFeatureUpload('feature1', 'Icon', e)} /></div>
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded border"><span className="text-gray-500 font-bold">พื้นหลัง:</span><div className="flex items-center gap-2">{formData.feature1Bg ? <img src={formData.feature1Bg} className="w-6 h-6 rounded object-cover"/> : <span className="text-gray-300">ไม่มี</span>}<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] bg-blue-50 text-blue-600" onClick={() => document.getElementById('f1-bg')?.click()}>อัปโหลด</Button>{formData.feature1Bg && <button onClick={()=>setFormData({...formData, feature1Bg: ''})}><X className="w-3 h-3 text-red-500"/></button>}</div><input type="file" id="f1-bg" className="hidden" accept="image/*" onChange={(e) => handleFeatureUpload('feature1', 'Bg', e)} /></div>
                  <Input placeholder="ชื่อวิชา/จุดเด่น" value={formData.feature1Title || ''} onChange={(e) => setFormData({ ...formData, feature1Title: e.target.value })} />
                  <Textarea placeholder="คำอธิบาย" rows={3} value={formData.feature1Desc || ''} onChange={(e) => setFormData({ ...formData, feature1Desc: e.target.value })} />
                </div>

                {/* จุดเด่น 2 */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                  <p className="text-sm font-bold text-[#2C3E50] border-b pb-2">จุดเด่นที่ 2 (กลาง)</p>
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded border"><span className="text-gray-500 font-bold">ไอคอน:</span><div className="flex items-center gap-2">{formData.feature2Icon ? <img src={formData.feature2Icon} className="w-6 h-6 rounded-full object-cover"/> : <span className="text-gray-300">ไม่มี</span>}<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] bg-red-50 text-red-600" onClick={() => document.getElementById('f2-icon')?.click()}>อัปโหลด</Button>{formData.feature2Icon && <button onClick={()=>setFormData({...formData, feature2Icon: ''})}><X className="w-3 h-3 text-red-500"/></button>}</div><input type="file" id="f2-icon" className="hidden" accept="image/*" onChange={(e) => handleFeatureUpload('feature2', 'Icon', e)} /></div>
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded border"><span className="text-gray-500 font-bold">พื้นหลัง:</span><div className="flex items-center gap-2">{formData.feature2Bg ? <img src={formData.feature2Bg} className="w-6 h-6 rounded object-cover"/> : <span className="text-gray-300">ไม่มี</span>}<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] bg-red-50 text-red-600" onClick={() => document.getElementById('f2-bg')?.click()}>อัปโหลด</Button>{formData.feature2Bg && <button onClick={()=>setFormData({...formData, feature2Bg: ''})}><X className="w-3 h-3 text-red-500"/></button>}</div><input type="file" id="f2-bg" className="hidden" accept="image/*" onChange={(e) => handleFeatureUpload('feature2', 'Bg', e)} /></div>
                  <Input placeholder="ชื่อวิชา/จุดเด่น" value={formData.feature2Title || ''} onChange={(e) => setFormData({ ...formData, feature2Title: e.target.value })} />
                  <Textarea placeholder="คำอธิบาย" rows={3} value={formData.feature2Desc || ''} onChange={(e) => setFormData({ ...formData, feature2Desc: e.target.value })} />
                </div>

                {/* จุดเด่น 3 */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                  <p className="text-sm font-bold text-[#2C3E50] border-b pb-2">จุดเด่นที่ 3 (ขวา)</p>
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded border"><span className="text-gray-500 font-bold">ไอคอน:</span><div className="flex items-center gap-2">{formData.feature3Icon ? <img src={formData.feature3Icon} className="w-6 h-6 rounded-full object-cover"/> : <span className="text-gray-300">ไม่มี</span>}<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] bg-green-50 text-green-600" onClick={() => document.getElementById('f3-icon')?.click()}>อัปโหลด</Button>{formData.feature3Icon && <button onClick={()=>setFormData({...formData, feature3Icon: ''})}><X className="w-3 h-3 text-red-500"/></button>}</div><input type="file" id="f3-icon" className="hidden" accept="image/*" onChange={(e) => handleFeatureUpload('feature3', 'Icon', e)} /></div>
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded border"><span className="text-gray-500 font-bold">พื้นหลัง:</span><div className="flex items-center gap-2">{formData.feature3Bg ? <img src={formData.feature3Bg} className="w-6 h-6 rounded object-cover"/> : <span className="text-gray-300">ไม่มี</span>}<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] bg-green-50 text-green-600" onClick={() => document.getElementById('f3-bg')?.click()}>อัปโหลด</Button>{formData.feature3Bg && <button onClick={()=>setFormData({...formData, feature3Bg: ''})}><X className="w-3 h-3 text-red-500"/></button>}</div><input type="file" id="f3-bg" className="hidden" accept="image/*" onChange={(e) => handleFeatureUpload('feature3', 'Bg', e)} /></div>
                  <Input placeholder="ชื่อวิชา/จุดเด่น" value={formData.feature3Title || ''} onChange={(e) => setFormData({ ...formData, feature3Title: e.target.value })} />
                  <Textarea placeholder="คำอธิบาย" rows={3} value={formData.feature3Desc || ''} onChange={(e) => setFormData({ ...formData, feature3Desc: e.target.value })} />
                </div>

              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C3E50] flex items-center"><Contact className="h-5 w-5 mr-2 text-[var(--primary)]" /> ข้อมูลติดต่อ (ส่วนท้ายเว็บ)</h3>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">ที่อยู่โรงเรียน (ขึ้นบรรทัดใหม่ได้)</label><Textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">เบอร์โทรศัพท์</label><Input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div><div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">อีเมล</label><Input value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div></div>
              <div><label className="text-xs font-bold text-[#2C3E50]/60 uppercase ml-1">ลิงก์ Facebook (URL)</label><Input value={formData.facebookUrl || ''} onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })} placeholder="เช่น https://facebook.com/darussalam" /></div>
            </div>
          </div>

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