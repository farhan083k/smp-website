import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadStaffImage } from '../lib/firebase';
import { Plus, Edit2, Trash2, Loader2, Upload, UserCircle, X, ChevronDown } from 'lucide-react'; // 👈 เพิ่ม ChevronDown เข้ามา
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Staff({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [staff, setStaff] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🖼️ State สำหรับ Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  // 👇 🚀 State สำหรับกำหนดจำนวนที่จะแสดงผล (เริ่มต้นที่ 8 คน)
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const q = query(collection(db, 'staff'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadStaffImage(file);
      setEditForm({ ...editForm, image: url });
    } catch (error) { alert("อัปโหลดรูปภาพไม่สำเร็จ"); } 
    finally { setIsUploading(false); }
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.position) return alert("กรุณากรอกชื่อและตำแหน่งให้ครบถ้วน");
    const staffData = {
      name: editForm.name,
      position: editForm.position,
      image: editForm.image || '',
      order: editForm.order || 99,
    };
    try {
      if (editingId) { await updateDoc(doc(db, 'staff', editingId), staffData); } 
      else { await addDoc(collection(db, 'staff'), { ...staffData, createdAt: new Date().toISOString() }); }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบข้อมูลบุคลากรท่านนี้ใช่หรือไม่?")) {
      await deleteDoc(doc(db, 'staff', id));
    }
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ name: '', position: '', image: '', order: 99 });
    setIsEditing(true);
  };

  const openEditDialog = (person: any) => {
    setEditingId(person.id);
    setEditForm(person);
    setIsEditing(true);
  };

  const openLightbox = (imageUrl: string) => {
    if (!imageUrl) return;
    setCurrentImage(imageUrl);
    setLightboxOpen(true);
  };

  return (
    <section id="staff" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#2C3E50]">บุคลากร SMP</h2>
          {isLoggedIn && (
            <Button onClick={openAddDialog} className="btn-primary" style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มบุคลากร
            </Button>
          )}
        </div>

        {staff.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* 👇 ใช้ .slice(0, visibleCount) เพื่อตัดเอาเฉพาะจำนวนที่กำหนดมาแสดง */}
              {staff.slice(0, visibleCount).map((person) => (
                <div key={person.id} className="bg-gray-50 rounded-2xl p-6 text-center shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow">
                  <div 
                    className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-gray-200 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openLightbox(person.image)}
                  >
                    {person.image ? (
                      <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <UserCircle className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#2C3E50]">{person.name}</h3>
                  <p className="text-sm text-[#3498DB] font-medium mt-1">{person.position}</p>

                  {isLoggedIn && (
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditDialog(person)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(person.id)} className="p-2 bg-white text-red-500 rounded-full shadow hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 👇 🚀 ปุ่มดูบุคลากรเพิ่มเติม (จะโชว์ก็ต่อเมื่อมีบุคลากรมากกว่าที่กำลังแสดงอยู่) */}
            {staff.length > visibleCount && (
              <div className="text-center mt-12">
                <Button 
                  onClick={() => setVisibleCount(prev => prev + 8)} 
                  variant="outline" 
                  className="px-8 py-6 rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 shadow-sm"
                >
                  ดูบุคลากรเพิ่มเติม ({staff.length - visibleCount} ท่าน) <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <UserCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>ยังไม่มีข้อมูลบุคลากร</p>
          </div>
        )}
      </div>

      {/* 🖼️ Lightbox Dialog (เหมือนเดิม) */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl w-[90vw] h-[80vh] p-0 bg-black/95 border-none flex flex-col justify-center items-center">
          <div className="relative w-full h-full flex items-center justify-center group">
            {currentImage && <img src={currentImage} className="max-h-full max-w-full object-contain p-4" alt="Staff Preview" />}
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500 text-white rounded-full z-50 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📝 Admin Pop-up (เหมือนเดิม) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md admin-panel border-none shadow-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 bg-gray-50 relative group">
                {editForm.image ? ( <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" /> ) : ( <div className="w-full h-full flex items-center justify-center text-gray-400"><UserCircle className="w-12 h-12" /></div> )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Upload className="w-8 h-8 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <p className="text-xs text-gray-500">คลิกที่รูปด้านบนเพื่ออัปโหลด/เปลี่ยนรูปภาพ</p>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500">ชื่อ-นามสกุล</label><Input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="เช่น นายสมชาย ใจดี" /></div>
              <div><label className="text-xs font-bold text-gray-500">ตำแหน่ง</label><Input value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} placeholder="เช่น ครูสอนวิชาคณิตศาสตร์" /></div>
              <div><label className="text-xs font-bold text-gray-500">ลำดับการแสดงผล (เลขน้อยขึ้นก่อน)</label><Input type="number" value={editForm.order || 99} onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })} placeholder="เช่น 1 = ผอ., 2 = หัวหน้า..." /></div>
            </div>
            <Button onClick={handleSave} className="w-full h-12 mt-4" disabled={isUploading} style={{ backgroundColor: 'var(--primary)' }}>
              {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null} บันทึกข้อมูลบุคลากร
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}