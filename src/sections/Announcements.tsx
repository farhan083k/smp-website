import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // 👈 นำเข้าระบบจัดการไฟล์ของ Firebase
import { db, uploadMultipleImages } from '../lib/firebase'; 
import { Plus, Edit2, Trash2, Bell, Calendar, Image as ImageIcon, Loader2, Upload, X, FileText, ExternalLink, Download, Link as LinkIcon, Paperclip } from 'lucide-react'; // 👈 นำเข้าไอคอนใหม่ๆ
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Announcements({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // State สำหรับแอดมิน
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [isUploading, setIsUploading] = useState(false); // โหลดรูปภาพ
  const [isUploadingFile, setIsUploadingFile] = useState(false); // โหลดไฟล์เอกสาร
  
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref สำหรับรูปภาพ
  const docInputRef = useRef<HTMLInputElement>(null); // Ref สำหรับไฟล์เอกสาร

  // State สำหรับผู้ใช้ทั่วไป (กดดูรายละเอียด)
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 🖼️ อัปโหลดรูปภาพ
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(files, 'announcements');
      if (urls && urls.length > 0) setEditForm({ ...editForm, image: urls[0] });
    } catch (error) { alert("อัปโหลดรูปภาพไม่สำเร็จ"); } 
    finally { setIsUploading(false); }
  };

  // 📄 อัปโหลดไฟล์เอกสาร (PDF, Word, Excel)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const storage = getStorage();
      const fileRef = ref(storage, `documents/smp_${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditForm({ ...editForm, fileUrl: url, fileName: file.name });
    } catch (error) { 
      console.error(error);
      alert("อัปโหลดเอกสารไม่สำเร็จ"); 
    } 
    finally { setIsUploadingFile(false); }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return alert("กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน");
    try {
      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'announcements'), { ...editForm, createdAt: new Date().toISOString() });
      }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบประกาศนี้ใช่หรือไม่?")) await deleteDoc(doc(db, 'announcements', id));
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ title: '', content: '', image: '', linkUrl: '', fileUrl: '', fileName: '' });
    setIsEditing(true);
  };

  const openEditDialog = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
    setIsEditing(true);
  };

  const openViewDialog = (item: any) => {
    setViewItem(item);
    setIsViewOpen(true);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section id="announcements" className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#2C3E50] flex items-center">
            <Bell className="mr-3 h-8 w-8 text-[var(--primary)]" />
            ข่าวประชาสัมพันธ์
          </h2>
          {isLoggedIn && (
            <Button onClick={openAddDialog} className="btn-primary shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มประกาศ
            </Button>
          )}
        </div>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <div key={item.id} onClick={() => openViewDialog(item)} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative group cursor-pointer flex flex-col overflow-hidden border border-gray-100 hover:-translate-y-1">
                {item.image ? (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-2 bg-[var(--primary)] w-full"></div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* แถบไอคอน วันที่ + แนบไฟล์ + แนบลิงก์ */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
                      <Calendar className="h-3 w-3 mr-1.5 text-[var(--primary)]" /> {formatDate(item.createdAt)}
                    </div>
                    {item.fileUrl && (
                      <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100" title="มีเอกสารแนบ">
                        <Paperclip className="h-3 w-3 mr-1" /> มีไฟล์แนบ
                      </div>
                    )}
                    {item.linkUrl && (
                      <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100" title="มีลิงก์แนบ">
                        <LinkIcon className="h-3 w-3 mr-1" /> ลิงก์
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{item.content}</p>
                  
                  <span className="text-[var(--primary)] text-sm font-bold flex items-center mt-auto">อ่านเพิ่มเติม &rarr;</span>
                </div>

                {isLoggedIn && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openEditDialog(item); }} className="p-2 bg-white/90 text-blue-600 rounded-full shadow hover:bg-blue-50 backdrop-blur-sm"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 bg-white/90 text-red-500 rounded-full shadow hover:bg-red-50 backdrop-blur-sm"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</p>
          </div>
        )}
      </div>

      {/* 📖 หน้าต่างอ่านข่าวฉบับเต็ม */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl">
          {viewItem?.image && (
            <div className="w-full h-64 sm:h-80 relative bg-gray-100">
              <img src={viewItem.image} alt={viewItem.title} className="w-full h-full object-cover" />
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"><X className="h-5 w-5" /></button>
            </div>
          )}
          <div className="p-6 sm:p-8 space-y-6">
            {!viewItem?.image && (
               <div className="flex justify-end mb-[-1rem]">
                  <button onClick={() => setIsViewOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"><X className="h-6 w-6" /></button>
               </div>
            )}
            <div className="flex items-center text-sm text-[var(--primary)] font-bold bg-blue-50 w-fit px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4 mr-2" /> {formatDate(viewItem?.createdAt)}
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#2C3E50] leading-tight">{viewItem?.title}</DialogTitle>
            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-base sm:text-lg">{viewItem?.content}</div>
            
            {/* 👇 ส่วนแสดงปุ่มลิงก์และดาวน์โหลดเอกสาร */}
            {(viewItem?.linkUrl || viewItem?.fileUrl) && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                {viewItem?.fileUrl && (
                  <a href={viewItem.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm rounded-xl transition-all font-bold text-sm border border-green-200">
                    <Download className="w-5 h-5 mr-2" /> โหลดเอกสาร: {viewItem.fileName || 'ไฟล์แนบ'}
                  </a>
                )}
                {viewItem?.linkUrl && (
                  <a href={viewItem.linkUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm rounded-xl transition-all font-bold text-sm border border-blue-200">
                    <ExternalLink className="w-5 h-5 mr-2" /> เปิดลิงก์ที่เกี่ยวข้อง
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 📝 หน้าต่างสำหรับแอดมิน (เพิ่ม/แก้ไขข่าว) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-2xl admin-panel border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center"><Edit2 className="w-5 h-5 mr-2 text-[var(--primary)]"/> {editingId ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* อัปโหลดรูปภาพ (ฝั่งซ้าย) */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">รูปภาพประกอบ (หน้าปก)</label>
                <div className="relative h-32 w-full rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 group flex items-center justify-center cursor-pointer hover:bg-gray-100" onClick={() => fileInputRef.current?.click()}>
                  {editForm.image ? ( <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" /> ) : ( <div className="text-center text-gray-400"><ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" /><span className="text-xs">คลิกอัปโหลดรูป</span></div> )}
                  <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {editForm.image && <button onClick={() => setEditForm({ ...editForm, image: '' })} className="text-xs text-red-500 mt-1 font-bold hover:underline">ลบรูปภาพนี้</button>}
              </div>

              {/* อัปโหลดไฟล์เอกสาร (ฝั่งขวา) */}
              <div className="flex flex-col justify-end space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">ไฟล์เอกสารแนบ (PDF, Word, Excel)</label>
                  <Button type="button" variant="outline" className="w-full bg-white border-dashed border-2 hover:bg-gray-50" onClick={() => docInputRef.current?.click()} disabled={isUploadingFile}>
                    {isUploadingFile ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-600" /> : <FileText className="w-4 h-4 mr-2 text-green-600" />}
                    {isUploadingFile ? 'กำลังอัปโหลด...' : 'เลือกไฟล์อัปโหลด'}
                  </Button>
                  <input type="file" ref={docInputRef} onChange={handleDocumentUpload} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" />
                  
                  {editForm.fileName && (
                    <div className="mt-2 flex items-center justify-between text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <span className="truncate flex-1 font-medium">{editForm.fileName}</span>
                      <button onClick={() => setEditForm({ ...editForm, fileUrl: '', fileName: '' })} className="ml-2 text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">ลิงก์ที่เกี่ยวข้อง (URL)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={editForm.linkUrl || ''} onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })} placeholder="เช่น https://forms.gle/..." className="pl-9" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">หัวข้อประกาศ</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="พิมพ์หัวข้อประกาศ..." className="mt-1 font-bold text-lg h-12" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">เนื้อหาประกาศ</label>
              <Textarea value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={5} placeholder="พิมพ์รายละเอียดที่นี่..." className="mt-1" />
            </div>
            
            <Button onClick={handleSave} disabled={isUploading || isUploadingFile} className="w-full h-12 mt-4 text-lg shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              {(isUploading || isUploadingFile) ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null} บันทึกประกาศ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}