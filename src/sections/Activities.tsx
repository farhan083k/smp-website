import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight, X, Search, Image as ImageIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Activities({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับแอดมิน
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State สำหรับดูรูปขยาย (Lightbox)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 👇 State ใหม่ สำหรับหน้าต่างอ่านรายละเอียดกิจกรรมฉบับเต็ม
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const filteredActivities = activities.filter(act => 
    act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) {
      await deleteDoc(doc(db, 'activities', id));
    }
  };

  const openLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return;
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // 👇 ฟังก์ชันเปิดหน้าอ่านรายละเอียด
  const openViewDialog = (act: any) => {
    setViewItem(act);
    setIsViewOpen(true);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section id="activities" className="py-16 bg-[#F7DC6F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-[#2C3E50]">กิจกรรม SMP</h2>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="ค้นหากิจกรรม..." className="pl-10 border-[#3498DB]/20 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {isLoggedIn && (
              <Button onClick={() => { setEditingId(null); setEditForm({ images: [] }); setIsEditing(true); }} className="btn-primary" style={{ backgroundColor: 'var(--primary)' }}>
                <Plus className="mr-2 h-4 w-4" /> เพิ่มกิจกรรม
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => (
              // 👇 เปลี่ยนการ์ดให้กดได้ทั้งใบ เพื่อเปิดหน้าอ่านรายละเอียด
              <div key={act.id} onClick={() => openViewDialog(act)} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 flex flex-col lg:flex-row hover:-translate-y-1">
                
                <div className="lg:w-80 h-56 lg:h-auto bg-gray-100 relative overflow-hidden shrink-0">
                  <img src={act.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                  {act.images?.length > 1 && <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center backdrop-blur-sm"><ImageIcon className="w-3 h-3 mr-1.5" /> +{act.images.length - 1} รูป</div>}
                </div>
                
                <div className="flex-1 p-6 sm:p-8 flex flex-col relative">
                  {act.createdAt && (
                    <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                      <Calendar className="h-3 w-3 mr-1.5 text-[var(--primary)]" /> {formatDate(act.createdAt)}
                    </div>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2C3E50] mb-3 line-clamp-2">{act.title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base line-clamp-3 mb-4 flex-1 leading-relaxed">{act.description}</p>
                  <span className="text-[var(--primary)] text-sm font-bold flex items-center mt-auto">อ่านเพิ่มเติม &rarr;</span>

                  {/* ปุ่มแอดมิน */}
                  {isLoggedIn && (
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(act.id); setEditForm(act); setIsEditing(true); }} className="p-2 bg-white/90 hover:bg-blue-50 text-blue-600 rounded-full shadow-md backdrop-blur-sm"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(act.id); }} className="p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-full shadow-md backdrop-blur-sm"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบกิจกรรมที่ค้นหา ลองพิมพ์ชื่ออื่นดูนะ</p>
            </div>
          )}
        </div>
      </div>

      {/* 👇 📖 หน้าต่าง Pop-up สำหรับ "อ่านรายละเอียดกิจกรรมฉบับเต็ม" */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl">
          {/* รูปปก */}
          {viewItem?.images?.[0] && (
            <div className="w-full h-64 sm:h-80 relative bg-gray-100 cursor-pointer group" onClick={() => openLightbox(viewItem.images, 0)}>
              <img src={viewItem.images[0]} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" alt={viewItem.title} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                 <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center"><Search className="w-4 h-4 mr-2"/> คลิกเพื่อขยายรูป</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setIsViewOpen(false); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm z-10"><X className="h-5 w-5" /></button>
            </div>
          )}
          
          <div className="p-6 sm:p-8 space-y-6">
            {!viewItem?.images?.[0] && (
               <div className="flex justify-end mb-[-1rem]">
                  <button onClick={() => setIsViewOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"><X className="h-6 w-6" /></button>
               </div>
            )}
            
            {viewItem?.createdAt && (
              <div className="flex items-center text-sm text-[var(--primary)] font-bold bg-blue-50 w-fit px-3 py-1.5 rounded-full">
                <Calendar className="h-4 w-4 mr-2" /> {formatDate(viewItem.createdAt)}
              </div>
            )}
            
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#2C3E50] leading-tight">{viewItem?.title}</DialogTitle>
            
            {/* เนื้อหาฉบับเต็ม */}
            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {viewItem?.description}
            </div>

            {/* แกลเลอรีรูปภาพทั้งหมด */}
            {viewItem?.images?.length > 1 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-[var(--primary)]" /> ประมวลภาพกิจกรรม ({viewItem.images.length} รูป)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {viewItem.images.map((img: string, i: number) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all relative group" onClick={() => openLightbox(viewItem.images, i)}>
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`ภาพที่ ${i+1}`} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 🖼️ Lightbox ขยายรูป (อันเดิม แต่ปรับให้ทับ ViewDialog ได้) */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 bg-black/95 border-none flex flex-col justify-center items-center z-[100]">
          <div className="relative w-full h-full flex items-center justify-center group">
            {currentImages.length > 0 && <img src={currentImages[currentImageIndex]} className="max-h-full max-w-full object-contain p-4" alt="" />}
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500 text-white rounded-full z-50"><X className="h-6 w-6" /></button>
            {currentImages.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)} className="absolute left-4 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors"><ChevronLeft className="h-8 w-8" /></button>
                <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)} className="absolute right-4 p-3 bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors"><ChevronRight className="h-8 w-8" /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {currentImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 📝 Admin Edit Dialog (ปรับให้มีปุ่มลบรูปภาพได้ง่ายๆ) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-3xl admin-panel border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center"><Edit2 className="w-5 h-5 mr-2 text-[var(--primary)]"/> {editingId ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-4">
            
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">รูปภาพกิจกรรม (เลือกได้หลายรูป)</label>
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 max-h-[40vh] overflow-y-auto">
                 {editForm.images?.map((img: string, i: number) => (
                   <div key={i} className="relative aspect-square group">
                     <img src={img} className="w-full h-full object-cover rounded-lg border border-gray-200" alt="" />
                     <button onClick={() => setEditForm({ ...editForm, images: editForm.images.filter((_:any, index:number) => index !== i) })} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"><X className="w-4 h-4"/></button>
                   </div>
                 ))}
                 <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="aspect-square w-full border-dashed border-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 flex flex-col transition-colors h-full" disabled={isUploading}>
                   {isUploading ? <Loader2 className="animate-spin mb-2 w-6 h-6" /> : <Plus className="mb-2 w-6 h-6" />}
                   <span className="text-xs">{isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพ'}</span>
                 </Button>
               </div>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*" />
            </div>

            <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">ชื่อกิจกรรม</label><Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="พิมพ์ชื่อกิจกรรม..." className="mt-1 font-bold text-lg h-12" /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">รายละเอียดกิจกรรม (ขึ้นบรรทัดใหม่ได้)</label><Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="พิมพ์รายละเอียดที่นี่..." rows={6} className="mt-1" /></div>
            
            <Button onClick={handleSave} className="w-full h-12 mt-4 text-lg shadow-md" disabled={isUploading} style={{ backgroundColor: 'var(--primary)' }}>
               {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null} บันทึกกิจกรรม
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}