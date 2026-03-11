import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, X, Search } from 'lucide-react'; // 👈 เพิ่ม Search
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Activities({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // 👈 เพิ่ม State สำหรับค้นหา
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // 🔍 กรองกิจกรรมตามชื่อที่พิมพ์ค้นหา
  const filteredActivities = activities.filter(act => 
    act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... (ฟังก์ชัน handleFileChange, handleSave, Lightbox เหมือนเดิม) ...
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(files, 'activities');
      setEditForm((prev: any) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } finally { setIsUploading(false); }
  };

  const handleSave = async () => {
    if (editingId) { await updateDoc(doc(db, 'activities', editingId), editForm); }
    else { await addDoc(collection(db, 'activities'), { ...editForm, createdAt: new Date().toISOString() }); }
    setIsEditing(false);
  };

  const openLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="activities" className="py-16 bg-[#F7DC6F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-[#2C3E50]">กิจกรรม SMP</h2>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            {/* 🔍 ช่องค้นหาใหม่ */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ค้นหากิจกรรม..." 
                className="pl-10 border-[#3498DB]/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isLoggedIn && (
              <Button onClick={() => { setEditingId(null); setEditForm({ images: [] }); setIsEditing(true); }} className="btn-primary">
                <Plus className="mr-2 h-4 w-4" /> เพิ่มกิจกรรม
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => (
              <div key={act.id} className="mint-card overflow-hidden group">
                {/* ... (เนื้อหาการแสดงผลกิจกรรมเหมือนเดิม) ... */}
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-72 h-48 lg:h-auto bg-gray-100 relative cursor-pointer overflow-hidden" onClick={() => openLightbox(act.images, 0)}>
                    <img src={act.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" alt="" />
                    {act.images?.length > 0 && <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">อัลบั้ม {act.images.length} รูป</div>}
                  </div>
                  <div className="flex-1 p-6 relative">
                    <h3 className="text-xl font-bold text-[#2C3E50]">{act.title}</h3>
                    <p className="text-[#2C3E50]/80 my-2">{act.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {act.images?.slice(1, 7).map((img: string, i: number) => (
                        <img key={i} src={img} className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-80" onClick={() => openLightbox(act.images, i + 1)} />
                      ))}
                    </div>
                    {isLoggedIn && (
                      <div className="absolute top-4 right-4 space-x-2">
                        <button onClick={() => { setEditingId(act.id); setEditForm(act); setIsEditing(true); }} className="p-2 bg-white/80 hover:bg-[#98D8C8] rounded-full shadow-sm"><Edit2 className="h-4 w-4 text-[#2C3E50]" /></button>
                        <button onClick={() => deleteDoc(doc(db, 'activities', act.id))} className="p-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full shadow-sm"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบกิจกรรมที่ค้นหา ลองพิมพ์ชื่ออื่นดูนะ</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Dialog (เหมือนเดิม) */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 bg-black/95 border-none flex flex-col justify-center items-center">
          <div className="relative w-full h-full flex items-center justify-center group">
            {currentImages.length > 0 && <img src={currentImages[currentImageIndex]} className="max-h-full max-w-full object-contain p-4" alt="" />}
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500 text-white rounded-full z-50"><X className="h-6 w-6" /></button>
            {currentImages.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)} className="absolute left-4 p-3 bg-white/10 text-white rounded-full"><ChevronLeft className="h-8 w-8" /></button>
                <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)} className="absolute right-4 p-3 bg-white/10 text-white rounded-full"><ChevronRight className="h-8 w-8" /></button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Edit Dialog (เหมือนเดิม) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-3xl admin-panel">
          <DialogHeader><DialogTitle>จัดการกิจกรรม</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-4 gap-2 border p-3 rounded-xl max-h-[30vh] overflow-y-auto">
              {editForm.images?.map((img: string, i: number) => (
                <div key={i} className="relative aspect-square">
                  <img src={img} className="w-full h-full object-cover rounded-lg" alt="" />
                </div>
              ))}
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="aspect-square w-full border-dashed" disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
              </Button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*" />
            <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="ชื่อกิจกรรม" />
            <Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="รายละเอียด" rows={3} />
            <Button onClick={handleSave} className="w-full btn-primary h-12" disabled={isUploading}>บันทึกกิจกรรม</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}