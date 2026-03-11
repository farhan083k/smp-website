import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // 👈 เชื่อมสายไฟเข้า Firebase
import { CalendarDays, MapPin, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
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

// ข้อมูลตั้งต้น (จะถูกส่งขึ้น Firebase อัตโนมัติถ้าฐานข้อมูลยังว่างเปล่า)
const initialActivities = [
  {
    title: 'กิจกรรมวันวิทยาศาสตร์แห่งชาติ',
    description: 'กิจกรรมเฉลิมฉลองวันวิทยาศาสตร์แห่งชาติ ประจำปี 2568 มีการจัดแสดงผลงานวิทยาศาสตร์ของ student การสาธิตการทดลอง และการแข่งขันทางวิทยาศาสตร์',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    date: '2026-08-18',
    location: 'โรงเรียนดารุสสาลาม',
  },
  {
    title: 'ค่ายคณิตศาสตร์สนุกคิด',
    description: 'ค่ายคณิตศาสตร์ที่จัดขึ้นเพื่อพัฒนาทักษะการคิดเชิงตรรกะและการแก้ปัญหาทางคณิตศาสตร์ผ่านกิจกรรมสนุกๆ และการแข่งขัน',
    image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop',
    date: '2026-05-20',
    location: 'ห้องเรียน SMP',
  },
  {
    title: 'การแข่งขันวิทยาศาสตร์โอลิมปิกระดับโรงเรียน',
    description: 'การแข่งขันวิทยาศาสตร์โอลิมปิกเพื่อคัดเลือกตัวแทนโรงเรียนเข้าแข่งขันระดับจังหวัดและระดับชาติ',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
    date: '2026-02-15',
    location: 'ห้องสอบโรงเรียน',
  },
  {
    title: 'กิจกรรมทัศนศึกษาพิพิธภัณฑ์วิทยาศาสตร์',
    description: 'กิจกรรมทัศนศึกษาที่พิพิธภัณฑ์วิทยาศาสตร์แห่งชาติ กรุงเทพมหานคร เพื่อเสริมสร้างประสบการณ์การเรียนรู้นอกห้องเรียน',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
    date: '2026-07-10',
    location: 'พิพิธภัณฑ์วิทยาศาสตร์ กรุงเทพฯ',
  },
];

export default function Activities({ isLoggedIn }: ActivitiesProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 🔴 1. ฟังก์ชันดึงข้อมูลจาก Firebase (และอัปโหลดข้อมูลตั้งต้นถ้ายังไม่มี)
  useEffect(() => {
    if (!db) return;

    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'activities'));
      if (querySnapshot.empty) {
        console.log("No activities found, uploading initial data...");
        for (const act of initialActivities) {
          await addDoc(collection(db, 'activities'), act);
        }
      }
    };

    initializeData();

    // ดึงข้อมูลมาแสดงแบบ Real-time (เรียงตามวันที่จากใหม่ไปเก่า)
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

  // 🔴 2. ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    if (!editForm.title || !editForm.description) return;

    try {
      if (editingId) {
        // แก้ไข
        const docRef = doc(db, 'activities', editingId);
        await updateDoc(docRef, {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          date: editForm.date || '',
          location: editForm.location || '',
        });
      } else {
        // เพิ่มใหม่
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

  // 🔴 3. ฟังก์ชันลบข้อมูล
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
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#F7DC6F]/40 p-3 rounded-full border-2 border-[#3498DB] mr-4">
              <CalendarDays className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                กิจกรรม
              </h2>
              <p className="text-[#2C3E50]/70">กิจกรรมและการจัดการเรียนการสอน</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มกิจกรรม
            </Button>
          )}
        </div>

        {/* Activities Timeline */}
        <div className="space-y-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="mint-card overflow-hidden group animate-fade-in"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Date Badge */}
                <div className="lg:w-32 bg-gradient-to-br from-[#98D8C8]/30 to-[#F7DC6F]/30 p-4 flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#3498DB]/20">
                  <CalendarDays className="h-6 w-6 text-[#3498DB] mb-0 lg:mb-2 mr-2 lg:mr-0" />
                  <span className="text-sm font-medium text-[#2C3E50] text-center">
                    {formatDate(activity.date)}
                  </span>
                </div>

                {/* Image */}
                <div className="relative w-full lg:w-48 h-48 lg:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={activity.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 relative">
                  {isLoggedIn && (
                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="p-2 bg-[#98D8C8]/50 rounded-lg hover:bg-[#98D8C8] transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(activity.id)}
                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2 pr-16">
                    {activity.title}
                  </h3>
                  <p className="text-[#2C3E50]/80 text-sm mb-4">
                    {activity.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-sm text-[#2C3E50]/60">
                    <MapPin className="h-4 w-4 mr-1 text-[#3498DB]" />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2C3E50]">
              {editingId ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ชื่อกิจกรรม
              </label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="ชื่อกิจกรรม"
                className="border-[#3498DB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                รูปภาพ URL
              </label>
              <Input
                value={editForm.image || ''}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="border-[#3498DB]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  วันที่
                </label>
                <Input
                  type="date"
                  value={editForm.date || ''}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="border-[#3498DB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  สถานที่
                </label>
                <Input
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="สถานที่จัดกิจกรรม"
                  className="border-[#3498DB]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                คำอธิบาย
              </label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="คำอธิบายกิจกรรม"
                rows={4}
                className="border-[#3498DB]"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <Button onClick={handleSave} className="flex-1 btn-primary">
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1 border-[#3498DB]"
              >
                <X className="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md admin-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2C3E50]">
              ยืนยันการลบ
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#2C3E50]/80 py-4">
            คุณต้องการลบกิจกรรมนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ลบ
            </Button>
            <Button
              onClick={() => setDeleteConfirm(null)}
              variant="outline"
              className="flex-1 border-[#3498DB]"
            >
              ยกเลิก
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}