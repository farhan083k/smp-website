import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Activities({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  
  // State สำหรับจัดการฟอร์มแก้ไข/เพิ่มกิจกรรม
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ State สำหรับระบบกดดูรูป (Lightbox)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length + (editForm.images?.length || 0) > 50) return alert("อัปโหลดได้สูงสุด 50 รูปครับ");
    
    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(files, 'activities');
      setEditForm((prev: any) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } finally { setIsUploading(false); }
  };

  const handleSave = async () => {
    if (editingId) {
      await updateDoc(doc(db, 'activities', editingId), editForm);
    } else {
      await addDoc(collection(db, 'activities'), { ...editForm, createdAt: new Date().toISOString() });
    }
    setIsEditing(false);
  };

  // ✅ ฟังก์ชันเปิดระบบดูรูป
  const openLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // ✅ ฟังก์ชันเลื่อนรูปซ้าย-ขวา
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  return (
    <section id="activities" className="py-16 bg-[#F7DC6F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#2C3E50]">กิจกรรม SMP</h2>
          {isLoggedIn && (
            <Button onClick={() => { setEditingId(null); setEditForm({ images: [] }); setIsEditing(true); }} className="btn-primary">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มกิจกรรม
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {activities.map((act) => (
            <div key={act.id} className="mint-card overflow-hidden group">
              <div className="flex flex-col lg:flex-row">
                {/* รูปปกกิจกรรม (กดเพื่อเปิด Lightbox ได้) */}
                <div 
                  className="lg:w-72 h-48 lg:h-auto bg-gray-100 relative cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(act.images, 0)}
                >
                  <img 
                    src={act.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    alt="รูปปกกิจกรรม" 
                  />
                  {act.images?.length > 0 && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                      อัลบั้ม {act.images.length} รูป
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 relative">
                  <h3 className="text-xl font-bold text-[#2C3E50]">{act.title}</h3>
                  <p className="text-[#2C3E50]/80 my-2 leading-relaxed">{act.description}</p>
                  
                  {/* รูปขนาดเล็กด้านล่าง (กดเพื่อเปิดรูปนั้นๆ ใน Lightbox ได้) */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {act.images?.slice(1, 7).map((img: string, i: number) => (
                      <div 
                        key={i + 1} 
                        className="relative cursor-pointer overflow-hidden rounded-md border-2 border-transparent hover:border-[#3498DB] transition-all"
                        onClick={() => openLightbox(act.images, i + 1)}
                      >
                        <img src={img} className="h-16 w-16 sm:w-20 object-cover" alt={`รูปกิจกรรมที่ ${i+2}`} />
                        {/* ถ้ามีรูปมากกว่า 7 รูป ให้แสดง +จำนวนที่เหลือ บนรูปสุดท้าย */}
                        {i === 5 && act.images.length > 7 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
                            +{act.images.length - 7}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ปุ่มแก้ไข/ลบ สำหรับ Admin */}
                  {isLoggedIn && (
                    <div className="absolute top-4 right-4 space-x-2">
                      <button onClick={() => { setEditingId(act.id); setEditForm(act); setIsEditing(true); }} className="p-2 bg-white/80 hover:bg-[#98D8C8] rounded-full shadow-sm"><Edit2 className="h-4 w-4 text-[#2C3E50]" /></button>
                      <button onClick={() => deleteDoc(doc(db, 'activities', act.id))} className="p-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full shadow-sm"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================== */}
      {/* ✅ หน้าต่าง Lightbox สำหรับกดดูรูปและเลื่อนซ้าย-ขวา */}
      {/* ====================================================== */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 bg-black/95 border-none shadow-2xl flex flex-col justify-center items-center">
          
          <div className="relative w-full h-full flex items-center justify-center group">
            {/* รูปภาพหลักที่แสดงผล */}
            {currentImages.length > 0 && (
              <img 
                src={currentImages[currentImageIndex]} 
                className="max-h-full max-w-full object-contain p-4 select-none" 
                alt={`ภาพที่ ${currentImageIndex + 1}`} 
              />
            )}

            {/* ปุ่มเลื่อนซ้าย */}
            {currentImages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 sm:left-8 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {/* ปุ่มเลื่อนขวา */}
            {currentImages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 sm:right-8 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* ปุ่มปิด (X) มุมขวาบน */}
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors z-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* ตัวนับภาพ (เช่น 1 / 10) ด้านล่าง */}
          <div className="absolute bottom-4 text-white/80 bg-black/50 px-4 py-1 rounded-full text-sm tracking-widest font-medium">
            {currentImageIndex + 1} / {currentImages.length}
          </div>

        </DialogContent>
      </Dialog>

      {/* ====================================================== */}
      {/* กล่อง Dialog สำหรับเพิ่ม/แก้ไขกิจกรรมโดยแอดมิน */}
      {/* ====================================================== */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-3xl admin-panel">
          <DialogHeader><DialogTitle className="text-xl font-bold">จัดการกิจกรรม (อัลบั้มสูงสุด 50 รูป)</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 border p-3 rounded-xl max-h-[30vh] overflow-y-auto bg-gray-50/50">
              {editForm.images?.map((img: string, i: number) => (
                <div key={i} className="relative group aspect-square">
                  <img src={img} className="w-full h-full object-cover rounded-lg shadow-sm" alt="" />
                  <button 
                    onClick={() => setEditForm({...editForm, images: editForm.images.filter((_:any,idx:any)=>idx!==i)})} 
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3"/>
                  </button>
                </div>
              ))}
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="aspect-square w-full border-dashed bg-white hover:bg-blue-50" disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin text-[#3498DB]" /> : <Plus className="text-[#3498DB]" />}
              </Button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*" />
            <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="ชื่อกิจกรรม" className="font-bold border-[#3498DB]/30" />
            <Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="รายละเอียดกิจกรรม" rows={3} className="border-[#3498DB]/30" />
            <Button onClick={handleSave} className="w-full btn-primary h-12 text-lg shadow-lg shadow-blue-200" disabled={isUploading}>บันทึกกิจกรรม</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}