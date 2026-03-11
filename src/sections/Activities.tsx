import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db, uploadMultipleImages } from '../lib/firebase';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Activities({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('date', 'desc'));
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

  return (
    <section id="activities" className="py-16 bg-[#F7DC6F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">กิจกรรม SMP</h2>
          {isLoggedIn && <Button onClick={() => { setEditingId(null); setEditForm({ images: [] }); setIsEditing(true); }} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> เพิ่มกิจกรรม</Button>}
        </div>

        <div className="space-y-6">
          {activities.map((act) => (
            <div key={act.id} className="mint-card overflow-hidden group">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-64 h-48 lg:h-auto bg-gray-100 relative">
                  <img src={act.images?.[0] || 'https://via.placeholder.com/400x300'} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                    {act.images?.length || 0} รูปภาพ
                  </div>
                </div>
                <div className="flex-1 p-6 relative">
                  <h3 className="text-xl font-bold">{act.title}</h3>
                  <p className="text-gray-600 my-2">{act.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {act.images?.slice(0, 10).map((img: string, i: number) => (
                      <img key={i} src={img} className="h-12 w-16 object-cover rounded border" alt="" />
                    ))}
                  </div>
                  {isLoggedIn && <div className="absolute top-4 right-4 space-x-2">
                    <button onClick={() => { setEditingId(act.id); setEditForm(act); setIsEditing(true); }} className="p-2 hover:bg-gray-100 rounded-full"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => deleteDoc(doc(db, 'activities', act.id))} className="p-2 hover:bg-red-50 text-red-500 rounded-full"><Trash2 className="h-4 w-4" /></button>
                  </div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-2xl admin-panel">
          <DialogHeader><DialogTitle>จัดการกิจกรรม (สูงสุด 50 รูป)</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-5 gap-2 border p-2 rounded-xl max-h-60 overflow-y-auto bg-gray-50">
              {editForm.images?.map((img: string, i: number) => (
                <div key={i} className="relative group aspect-square">
                  <img src={img} className="w-full h-full object-cover rounded-lg" alt="" />
                  <button onClick={() => setEditForm({...editForm, images: editForm.images.filter((_:any,idx:any)=>idx!==i)})} className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"><Trash2 className="h-3 w-3"/></button>
                </div>
              ))}
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="aspect-square w-full border-dashed" disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin" /> : <Plus />}
              </Button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*" />
            <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="ชื่อกิจกรรม" />
            <Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="รายละเอียดกิจกรรม" />
            <Button onClick={handleSave} className="w-full btn-primary" disabled={isUploading}>บันทึกกิจกรรม</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}