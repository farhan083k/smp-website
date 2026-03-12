import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase';
import { Plus, Edit2, Trash2, Loader2, MoreHorizontal, Calendar, Image as ImageIcon, X, Info, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Others({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [others, setOthers] = useState<any[]>([]);
  
  // State สำหรับแอดมิน
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State สำหรับอ่านรายละเอียด
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'others'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOthers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(files, 'others');
      if (urls && urls.length > 0) setEditForm({ ...editForm, image: urls[0] });
    } catch (error) { alert("อัปโหลดรูปภาพไม่สำเร็จ"); } 
    finally { setIsUploading(false); }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return alert("กรุณากรอกหัวข้อและรายละเอียด");
    try {
      if (editingId) {
        await updateDoc(doc(db, 'others', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'others'), { ...editForm, createdAt: new Date().toISOString() });
      }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) await deleteDoc(doc(db, 'others', id));
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ title: '', content: '', image: '', category: 'ทั่วไป' });
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
    <section id="others" className="py-16 bg-[#F8FAFC] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#2C3E50] flex items-center">
            <MoreHorizontal className="mr-3 h-8 w-8 text-slate-600" />
            ข้อมูลอื่นๆ (Others)
          </h2>
          {isLoggedIn && (
            <Button onClick={openAddDialog} className="bg-slate-700 hover:bg-slate-800 text-white shadow-md">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มข้อมูล
            </Button>
          )}
        </div>

        {others.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {others.map((item) => (
              <div key={item.id} onClick={() => openViewDialog(item)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer flex overflow-hidden border border-gray-100 h-40">
                
                {/* รูปภาพ (แสดงด้านซ้าย) */}
                <div className="w-40 h-full shrink-0 bg-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Info className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {item.category || 'ทั่วไป'}
                  </div>
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">{item.content}</p>
                  
                  <div className="flex items-center text-[10px] text-gray-400 font-medium">
                    <Calendar className="h-3 w-3 mr-1" /> อัปเดตเมื่อ: {formatDate(item.createdAt)}
                  </div>
                </div>

                {isLoggedIn && (
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openEditDialog(item); }} className="p-1.5 bg-white/90 text-blue-600 rounded-full shadow hover:bg-blue-50 backdrop-blur-sm"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 bg-white/90 text-red-500 rounded-full shadow hover:bg-red-50 backdrop-blur-sm"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">ยังไม่มีข้อมูลเพิ่มเติมในขณะนี้</p>
          </div>
        )}
      </div>

      {/* 📖 หน้าต่างอ่านรายละเอียด */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl">
          {viewItem?.image && (
            <div className="w-full h-56 relative bg-slate-100">
              <img src={viewItem.image} alt={viewItem.title} className="w-full h-full object-cover" />
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"><X className="h-5 w-5" /></button>
            </div>
          )}
          <div className="p-8 space-y-4">
            {!viewItem?.image && (
               <div className="flex justify-end mb-[-1.5rem]">
                  <button onClick={() => setIsViewOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"><X className="h-6 w-6" /></button>
               </div>
            )}
            <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold w-fit uppercase tracking-wider">
              หมวดหมู่: {viewItem?.category || 'ทั่วไป'}
            </div>
            <DialogTitle className="text-2xl font-bold text-[#2C3E50] leading-tight">{viewItem?.title}</DialogTitle>
            <div className="flex items-center text-xs text-gray-400 mb-6">
              <Calendar className="h-3.5 w-3.5 mr-2" /> วันที่ลงข้อมูล: {formatDate(viewItem?.createdAt)}
            </div>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line text-base border-t border-gray-100 pt-6">
              {viewItem?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📝 แผงแอดมิน */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center text-slate-700"><Info className="w-5 h-5 mr-2"/> {editingId ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            
            <div className="flex gap-4 items-start">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shrink-0" onClick={() => fileInputRef.current?.click()}>
                {editForm.image ? ( <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" /> ) : ( <ImageIcon className="w-6 h-6 text-gray-300" /> )}
                {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin text-slate-600"/></div>}
              </div>
              <div className="flex-1 space-y-3">
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3 h-3 mr-2"/> {editForm.image ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">หมวดหมู่</label>
                  <Input value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="เช่น ศิษย์เก่า, เกียรติบัตร" className="h-8 text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">หัวข้อ</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="ชื่อหัวข้อข้อมูล..." className="mt-1 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">รายละเอียด</label>
              <Textarea value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={4} placeholder="พิมพ์เนื้อหาที่ต้องการโชว์ที่นี่..." className="mt-1" />
            </div>
            
            <Button onClick={handleSave} disabled={isUploading} className="w-full h-10 bg-slate-700 hover:bg-slate-800 text-white">
               บันทึกข้อมูล
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}