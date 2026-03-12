import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase';
import { Plus, Edit2, Trash2, Loader2, Target, Calendar, Image as ImageIcon, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Projects({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [projects, setProjects] = useState<any[]>([]);
  
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
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(files, 'projects');
      if (urls && urls.length > 0) setEditForm({ ...editForm, image: urls[0] });
    } catch (error) { alert("อัปโหลดรูปภาพไม่สำเร็จ"); } 
    finally { setIsUploading(false); }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.description) return alert("กรุณากรอกชื่อและรายละเอียดโครงการ");
    try {
      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'projects'), { ...editForm, createdAt: new Date().toISOString() });
      }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบโครงการนี้ใช่หรือไม่?")) await deleteDoc(doc(db, 'projects', id));
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', image: '', status: 'กำลังดำเนินการ' });
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
    <section id="projects" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#2C3E50] flex items-center">
            <Target className="mr-3 h-8 w-8 text-indigo-600" />
            โครงการ (Projects)
          </h2>
          {isLoggedIn && (
            <Button onClick={openAddDialog} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มโครงการ
            </Button>
          )}
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((item) => (
              <div key={item.id} onClick={() => openViewDialog(item)} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative group cursor-pointer flex flex-col overflow-hidden border border-gray-100 hover:-translate-y-2">
                
                {/* รูปปกโครงการ */}
                {item.image ? (
                  <div className="h-56 w-full overflow-hidden relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="h-32 bg-indigo-100 w-full flex items-center justify-center">
                    <Target className="h-10 w-10 text-indigo-300" />
                  </div>
                )}
                
                {/* สถานะโครงการ (ป้ายกำกับ) */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm border border-indigo-100">
                  {item.status || 'โครงการ SMP'}
                </div>
                
                <div className="p-6 flex-1 flex flex-col bg-white relative z-10 -mt-6 mx-4 rounded-xl shadow-sm border border-gray-50 mb-4 group-hover:border-indigo-100 transition-colors">
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-400 font-medium">
                      <Calendar className="h-3 w-3 mr-1" /> {formatDate(item.createdAt)}
                    </div>
                    <span className="text-indigo-600 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">รายละเอียด <ArrowRight className="ml-1 w-4 h-4" /></span>
                  </div>
                </div>

                {isLoggedIn && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={(e) => { e.stopPropagation(); openEditDialog(item); }} className="p-2 bg-white/90 text-blue-600 rounded-full shadow hover:bg-blue-50 backdrop-blur-sm"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 bg-white/90 text-red-500 rounded-full shadow hover:bg-red-50 backdrop-blur-sm"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Target className="h-12 w-12 mx-auto mb-3 text-indigo-300" />
            <p>ยังไม่มีข้อมูลโครงการในระบบ</p>
          </div>
        )}
      </div>

      {/* 📖 หน้าต่างอ่านรายละเอียดโครงการ */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl">
          {viewItem?.image && (
            <div className="w-full h-64 sm:h-80 relative bg-gray-100">
              <img src={viewItem.image} alt={viewItem.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-indigo-700 shadow-sm">
                สถานะ: {viewItem.status || 'กำลังดำเนินการ'}
              </div>
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"><X className="h-5 w-5" /></button>
            </div>
          )}
          <div className="p-6 sm:p-8 space-y-6">
            {!viewItem?.image && (
               <div className="flex justify-between items-center mb-[-1rem]">
                  <div className="bg-indigo-50 px-3 py-1 rounded-full text-sm font-bold text-indigo-700">สถานะ: {viewItem?.status || 'กำลังดำเนินการ'}</div>
                  <button onClick={() => setIsViewOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"><X className="h-6 w-6" /></button>
               </div>
            )}
            
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#2C3E50] leading-tight mt-2">{viewItem?.title}</DialogTitle>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" /> โพสต์เมื่อ: {formatDate(viewItem?.createdAt)}
            </div>
            
            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-base sm:text-lg border-t border-gray-100 pt-6">
              {viewItem?.description}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📝 หน้าต่างสำหรับแอดมิน (เพิ่ม/แก้ไขโครงการ) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-xl admin-panel border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center text-indigo-700"><Target className="w-5 h-5 mr-2"/> {editingId ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-5 pt-4">
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">รูปภาพหน้าปกโครงการ</label>
              <div className="relative h-40 w-full rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 group flex items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors" onClick={() => fileInputRef.current?.click()}>
                {editForm.image ? ( <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" /> ) : ( <div className="text-center text-gray-400"><ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" /><span className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ</span></div> )}
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Upload className="w-8 h-8 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              {editForm.image && <button onClick={() => setEditForm({ ...editForm, image: '' })} className="text-xs text-red-500 mt-2 font-bold hover:underline">ลบรูปภาพนี้</button>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">ชื่อโครงการ</label>
                <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="เช่น โครงการค่ายวิทยาศาสตร์ทางทะเล" className="mt-1 font-bold text-lg h-12 border-indigo-100 focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">สถานะ</label>
                <select 
                  value={editForm.status || 'กำลังดำเนินการ'} 
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="mt-1 flex h-12 w-full items-center justify-between rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                >
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="เปิดรับสมัคร">เปิดรับสมัคร</option>
                  <option value="เสร็จสิ้นแล้ว">เสร็จสิ้นแล้ว</option>
                  <option value="โครงการประจำปี">โครงการประจำปี</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">รายละเอียดโครงการ</label>
              <Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={5} placeholder="พิมพ์รายละเอียด วัตถุประสงค์ หรือกำหนดการที่นี่..." className="mt-1 border-indigo-100 focus:border-indigo-500" />
            </div>
            
            <Button onClick={handleSave} disabled={isUploading} className="w-full h-12 mt-4 text-lg shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null} บันทึกข้อมูลโครงการ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}