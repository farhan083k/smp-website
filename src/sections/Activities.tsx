import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db, uploadActivityImage } from '../lib/firebase'; // 👈 นำเข้าฟังก์ชันอัปโหลดที่เราเพิ่มไว้
import { CalendarDays, MapPin, Plus, Edit2, Trash2, X, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActivitiesProps {
  isLoggedIn: boolean;
}

const initialActivities = [
  {
    title: 'กิจกรรมวันวิทยาศาสตร์แห่งชาติ',
    description: 'กิจกรรมเฉลิมฉลองวันวิทยาศาสตร์แห่งชาติ มีการจัดแสดงผลงานวิทยาศาสตร์ของนักเรียน',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    date: '2026-08-18',
    location: 'โรงเรียนดารุสสาลาม',
  }
];

export default function Activities({ isLoggedIn }: ActivitiesProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // สถานะสำหรับการอัปโหลด
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!db) return;

    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'activities'));
      if (querySnapshot.empty) {
        for (const act of initialActivities) {
          await addDoc(collection(db, 'activities'), act);
        }
      }
    };

    initializeData();

    const q = query(collection(db, 'activities'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
    });
    setIsEditing(true);
  };

  const handleEdit = (activity: any) => {
    setEditingId(activity.id);
    setEditForm({ ...activity });
    setIsEditing(true);
  };

  // 🔴 ฟังก์ชันจัดการการอัปโหลดรูปภาพกิจกรรม
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    setIsUploading(true);
    try {
      const downloadURL = await uploadActivityImage(file);
      if (downloadURL) {
        setEditForm(prev => ({ ...prev, image: downloadURL }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('อัปโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.description) return;

    try {
      if (editingId) {
        const docRef = doc(db, 'activities', editingId);
        await updateDoc(docRef, {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          date: editForm.date || '',
          location: editForm.location || '',
        });
      } else {
        await addDoc(collection(db, 'activities'), {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          date: editForm.date || '',
          location: editForm.location || '',
          createdAt: new Date().toISOString()
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุวันที่';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section id="activities" className="py-16 relative bg-gradient-to-b from-[#F7DC6F]/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#F7DC6F]/40 p-3 rounded-full border-2 border-[#3498DB] mr-4 shadow-sm">
              <CalendarDays className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">กิจกรรม</h2>
              <p className="text-[#2C3E50]/70">กิจกรรมและการจัดการเรียนการสอน</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> เพิ่มกิจกรรม
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="mint-card overflow-hidden group animate-fade-in border-[#3498DB]/10">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-32 bg-gradient-to-br from-[#98D8C8]/20 to-[#F7DC6F]/20 p-4 flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#3498DB]/10">
                  <CalendarDays className="h-5 w-5 text-[#3498DB] mb-0 lg:mb-2 mr-2 lg:mr-0" />
                  <span className="text-xs font-bold text-[#2C3E50] text-center">{formatDate(activity.date)}</span>
                </div>

                <div className="relative w-full lg:w-56 h-48 lg:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={activity.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex-1 p-6 relative">
                  {isLoggedIn && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button onClick={() => handleEdit(activity)} className="p-2 bg-white/80 rounded-full shadow-sm hover:bg-[#98D8C8] transition-colors border border-gray-100">
                        <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                      </button>
                      <button onClick={() => setDeleteConfirm(activity.id)} className="p-2 bg-white/80 rounded-full shadow-sm hover:bg-red-100 transition-colors border border-gray-100">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-3 pr-16">{activity.title}</h3>
                  <p className="text-[#2C3E50]/80 text-sm mb-4 leading-relaxed">{activity.description}</p>
                  <div className="flex items-center text-sm font-medium text-[#2C3E50]/60 bg-gray-50 w-fit px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4 mr-1 text-[#3498DB]" />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2C3E50] flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-[#3498DB]" />
              {editingId ? 'แก้ไขข้อมูลกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            {/* ส่วนแสดงตัวอย่างรูปภาพและปุ่มอัปโหลด */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#2C3E50]">รูปภาพกิจกรรม</label>
              <div className="relative h-48 w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group">
                {editForm.image ? (
                  <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-xs">ยังไม่มีรูปภาพ</p>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[#3498DB] animate-spin mb-2" />
                    <p className="text-xs font-bold text-[#3498DB]">กำลังอัปโหลด...</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={editForm.image || ''}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  placeholder="หรือวาง URL รูปภาพที่นี่"
                  className="flex-1"
                />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="border-[#3498DB] border-dashed"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C3E50] mb-2">ชื่อกิจกรรม</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="เช่น กิจกรรมทัศนศึกษา..." className="border-[#3498DB]/20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#2C3E50] mb-2">วันที่</label>
                <Input type="date" value={editForm.date || ''} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="border-[#3498DB]/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C3E50] mb-2">สถานที่</label>
                <Input value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="สถานที่จัด" className="border-[#3498DB]/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C3E50] mb-2">รายละเอียดกิจกรรม</label>
              <Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="border-[#3498DB]/20" />
            </div>

            <div className="flex space-x-3 pt-2">
              <Button onClick={handleSave} className="flex-1 btn-primary h-11 shadow-lg shadow-blue-100" disabled={isUploading}>
                <Save className="h-4 w-4 mr-2" /> บันทึกกิจกรรม
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="px-6 text-gray-500" disabled={isUploading}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md admin-panel border-none">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">ยืนยันการลบ</DialogTitle></DialogHeader>
          <p className="text-[#2C3E50]/80 py-4">คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้? ข้อมูลจะหายไปจากระบบทันที</p>
          <div className="flex space-x-3">
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white">ลบออกทันที</Button>
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="flex-1">ยกเลิก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}