import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase'; // 👈 นำเข้าฟังก์ชันอัปโหลดรูป
import { Plus, Edit2, Trash2, Bell, Calendar, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Announcements({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // State สำหรับแอดมิน (เพิ่ม/แก้ไข)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 State สำหรับผู้ใช้ทั่วไป (กดดูรายละเอียดข่าว)
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 👇 ฟังก์ชันอัปโหลดรูปภาพข่าว
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      // ใช้ฟังก์ชัน uploadMultipleImages ที่มีอยู่แล้ว แล้วเอามาแค่รูปแรกรูปเดียว
      const urls = await uploadMultipleImages(files, 'announcements');
      if (urls && urls.length > 0) {
        setEditForm({ ...editForm, image: urls[0] });
      }
    } catch (error) {
      alert("อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return alert("กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน");
    try {
      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'announcements'), { 
          ...editForm, 
          createdAt: new Date().toISOString() 
        });
      }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบประกาศนี้ใช่หรือไม่?")) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ title: '', content: '', image: '' });
    setIsEditing(true);
  };

  const openEditDialog = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
    setIsEditing(true);
  };

  // 👇 ฟังก์ชันเปิดหน้าต่างอ่านข่าวเต็มๆ
  const openViewDialog = (item: any) => {
    setViewItem(item);
    setIsViewOpen(true);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
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
              // 👇 เปลี่ยนกล่องข่าวให้กดได้ (cursor-pointer)
              <div 
                key={item.id} 
                onClick={() => openViewDialog(item)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative group cursor-pointer flex flex-col overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                {/* ถ้ารูปมีให้แสดงรูป ถ้าไม่มีให้แสดงสีพื้นหลัง */}
                {item.image ? (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-2 bg-[var(--primary)] w-full"></div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                    <Calendar className="h-3 w-3 mr-1.5 text-[var(--primary)]" />
                    {formatDate(item.createdAt)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">{item.content}</p>
                  
                  <span className="text-[var(--primary)] text-sm font-bold flex items-center mt-auto">
                    อ่านเพิ่มเติม &rarr;
                  </span>
                </div>

                {/* ปุ่มแอดมิน (ต้องใส่ e.stopPropagation() เพื่อไม่ให้พอกดแก้ไขแล้วเด้งไปหน้าอ่านข่าว) */}
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

      {/* 👇 📖 หน้าต่าง Pop-up สำหรับ "อ่านข่าวฉบับเต็ม" */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl">
          {viewItem?.image && (
            <div className="w-full h-64 sm:h-80 relative bg-gray-100">
              <img src={viewItem.image} alt={viewItem.title} className="w-full h-full object-cover" />
              {/* ปุ่มปิดทับบนรูป */}
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="p-6 sm:p-8 space-y-6">
            {!viewItem?.image && (
               <div className="flex justify-end mb-[-1rem]">
                  <button onClick={() => setIsViewOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"><X className="h-6 w-6" /></button>
               </div>
            )}
            <div className="flex items-center text-sm text-[var(--primary)] font-bold bg-blue-50 w-fit px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(viewItem?.createdAt)}
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#2C3E50] leading-tight">
              {viewItem?.title}
            </DialogTitle>
            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {viewItem?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📝 หน้าต่าง Pop-up สำหรับ "แอดมิน (เพิ่ม/แก้ไขข่าว)" */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-xl admin-panel border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center"><Edit2 className="w-5 h-5 mr-2 text-[var(--primary)]"/> {editingId ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-4">
            
            {/* 👇 ส่วนอัปโหลดรูปภาพข่าว */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">รูปภาพประกอบ (ถ้ามี)</label>
              <div className="relative h-48 w-full rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 group flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => fileInputRef.current?.click()}>
                {editForm.image ? (
                  <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ</span>
                  </div>
                )}
                {/* เอฟเฟกต์ตอนโหลดและตอนเอาเมาส์ชี้ */}
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Upload className="w-8 h-8 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              {editForm.image && (
                <button onClick={() => setEditForm({ ...editForm, image: '' })} className="text-xs text-red-500 mt-2 font-bold hover:underline">
                  ลบรูปภาพนี้
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">หัวข้อประกาศ</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="เช่น รับสมัครนักเรียนใหม่ ปีการศึกษา 2569" className="mt-1 font-bold text-lg h-12" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">เนื้อหาประกาศ (เว้นวรรค/ขึ้นบรรทัดใหม่ได้)</label>
              <Textarea value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={6} placeholder="พิมพ์รายละเอียดที่นี่..." className="mt-1" />
            </div>
            <Button onClick={handleSave} disabled={isUploading} className="w-full h-12 mt-4 text-lg shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null} บันทึกประกาศ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}