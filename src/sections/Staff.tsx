import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // 👈 เชื่อมสายไฟเข้า Firebase
import { Users, Mail, GraduationCap, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StaffProps {
  isLoggedIn: boolean;
}

// ข้อมูลตั้งต้น (จะถูกส่งขึ้น Firebase อัตโนมัติถ้าฐานข้อมูลยังว่างเปล่า)
const initialStaff = [
  {
    order: 1,
    name: 'นายอับดุลเลาะห์ สามาแอ',
    position: 'ครูประจำห้องเรียน SMP',
    subject: 'คณิตศาสตร์',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    email: 'abdul.samaae@darussalam.ac.th',
  },
  {
    order: 2,
    name: 'นางสาวนูรฮายาตี มะสาแม',
    position: 'ครูวิทยาศาสตร์',
    subject: 'ฟิสิกส์',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    email: 'nurhayati.masamae@darussalam.ac.th',
  },
  {
    order: 3,
    name: 'นายมูฮำหมัด อิสมาอีล',
    position: 'ครูวิทยาศาสตร์',
    subject: 'เคมี',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    email: 'muhammad.ismail@darussalam.ac.th',
  },
  {
    order: 4,
    name: 'นางฟาติมะ หะยีสมาแอ',
    position: 'ครูคณิตศาสตร์',
    subject: 'คณิตศาสตร์',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    email: 'fatima.hayisamaae@darussalam.ac.th',
  },
  {
    order: 5,
    name: 'นายอาหมัด อาลี',
    position: 'ครูภาษาอังกฤษ',
    subject: 'ภาษาอังกฤษ',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    email: 'ahmad.ali@darussalam.ac.th',
  },
  {
    order: 6,
    name: 'นางสาวอามีเนาะห์ ยูโซะ',
    position: 'ครูชีววิทยา',
    subject: 'ชีววิทยา',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    email: 'amineah.yuso@darussalam.ac.th',
  },
];

export default function Staff({ isLoggedIn }: StaffProps) {
  const [staff, setStaff] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 🔴 1. ฟังก์ชันดึงข้อมูลจาก Firebase (และอัปโหลดข้อมูลตั้งต้นถ้ายังไม่มี)
  useEffect(() => {
    if (!db) return;

    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'staff'));
      if (querySnapshot.empty) {
        console.log("No staff found, uploading initial data...");
        for (const member of initialStaff) {
          await addDoc(collection(db, 'staff'), member);
        }
      }
    };

    initializeData();

    // ดึงข้อมูลมาแสดงแบบ Real-time (เรียงตามลำดับ order)
    const q = query(collection(db, 'staff'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStaff(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      position: '',
      subject: '',
      image: '',
      email: '',
      order: staff.length + 1
    });
    setIsEditing(true);
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setEditForm({ ...member });
    setIsEditing(true);
  };

  // 🔴 2. ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    if (!editForm.name || !editForm.position) return;

    try {
      if (editingId) {
        // แก้ไข
        const docRef = doc(db, 'staff', editingId);
        await updateDoc(docRef, {
          name: editForm.name,
          position: editForm.position,
          subject: editForm.subject || '',
          image: editForm.image || '',
          email: editForm.email || '',
        });
      } else {
        // เพิ่มใหม่
        await addDoc(collection(db, 'staff'), {
          name: editForm.name,
          position: editForm.position,
          subject: editForm.subject || '',
          image: editForm.image || '',
          email: editForm.email || '',
          order: editForm.order || 99
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving staff member:', error);
    }
  };

  // 🔴 3. ฟังก์ชันลบข้อมูล
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'staff', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting staff member:', error);
    }
  };

  return (
    <section id="staff" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#98D8C8]/30 p-3 rounded-full border-2 border-[#3498DB] mr-4">
              <Users className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                บุคลากร
              </h2>
              <p className="text-[#2C3E50]/70">คณะครูประจำห้องเรียน SMP</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มบุคลากร
            </Button>
          )}
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div
              key={member.id}
              className="mint-card overflow-hidden group animate-fade-in"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={member.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Subject Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7DC6F]/90 text-[#2C3E50] text-xs font-medium border border-[#3498DB]">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {member.subject}
                  </span>
                </div>

                {isLoggedIn && (
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(member.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#2C3E50] mb-1">
                  {member.name}
                </h3>
                <p className="text-[#3498DB] text-sm font-medium mb-3">
                  {member.position}
                </p>
                
                {member.email && (
                  <div className="flex items-center text-sm text-[#2C3E50]/60">
                    <Mail className="h-4 w-4 mr-2 text-[#3498DB]" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
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
              {editingId ? 'แก้ไขบุคลากร' : 'เพิ่มบุคลากร'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ชื่อ-นามสกุล
              </label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
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
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ตำแหน่ง
              </label>
              <Input
                value={editForm.position || ''}
                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                placeholder="ตำแหน่ง"
                className="border-[#3498DB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                วิชาที่สอน
              </label>
              <Input
                value={editForm.subject || ''}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                placeholder="วิชาที่สอน"
                className="border-[#3498DB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                อีเมล
              </label>
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@example.com"
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
            คุณต้องการลบบุคลากรนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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