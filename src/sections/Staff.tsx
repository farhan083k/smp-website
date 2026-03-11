import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db, uploadStaffImage } from '../lib/firebase'; // 👈 นำเข้าฟังก์ชันอัปโหลดรูปบุคลากร
import { Users, Mail, GraduationCap, Plus, Edit2, Trash2, Save, Upload, Loader2, } from 'lucide-react';
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

const initialStaff = [
  {
    order: 1,
    name: 'นายอับดุลเลาะห์ สามาแอ',
    position: 'ครูประจำห้องเรียน SMP',
    subject: 'คณิตศาสตร์',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    email: 'abdul.samaae@darussalam.ac.th',
  }
];

export default function Staff({ isLoggedIn }: StaffProps) {
  const [staff, setStaff] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // สถานะสำหรับการอัปโหลดรูป
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!db) return;

    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'staff'));
      if (querySnapshot.empty) {
        for (const member of initialStaff) {
          await addDoc(collection(db, 'staff'), member);
        }
      }
    };

    initializeData();

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

  // 🔴 ฟังก์ชันจัดการการอัปโหลดรูปโปรไฟล์บุคลากร
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    setIsUploading(true);
    try {
      const downloadURL = await uploadStaffImage(file);
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
    if (!editForm.name || !editForm.position) return;

    try {
      if (editingId) {
        const docRef = doc(db, 'staff', editingId);
        await updateDoc(docRef, {
          name: editForm.name,
          position: editForm.position,
          subject: editForm.subject || '',
          image: editForm.image || '',
          email: editForm.email || '',
          order: Number(editForm.order) || 99
        });
      } else {
        await addDoc(collection(db, 'staff'), {
          name: editForm.name,
          position: editForm.position,
          subject: editForm.subject || '',
          image: editForm.image || '',
          email: editForm.email || '',
          order: Number(editForm.order) || staff.length + 1
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving staff member:', error);
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#98D8C8]/30 p-3 rounded-full border-2 border-[#3498DB] mr-4 shadow-sm">
              <Users className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">บุคลากร</h2>
              <p className="text-[#2C3E50]/70">คณะครูประจำห้องเรียน SMP</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> เพิ่มบุคลากร
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member) => (
            <div key={member.id} className="mint-card overflow-hidden group animate-fade-in border-[#3498DB]/10 hover:shadow-xl transition-all duration-300">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={member.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F7DC6F] text-[#2C3E50] text-xs font-bold border border-white shadow-sm">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {member.subject}
                  </span>
                </div>

                {isLoggedIn && (
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(member)} className="p-2 bg-white/90 rounded-full shadow-md hover:bg-[#98D8C8] transition-colors">
                      <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                    </button>
                    <button onClick={() => setDeleteConfirm(member.id)} className="p-2 bg-white/90 rounded-full shadow-md hover:bg-red-100 transition-colors">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 text-center lg:text-left">
                <h3 className="text-xl font-bold text-[#2C3E50] mb-1">{member.name}</h3>
                <p className="text-[#3498DB] text-sm font-bold mb-4 uppercase tracking-wider">{member.position}</p>
                
                {member.email && (
                  <div className="flex items-center justify-center lg:justify-start text-sm text-[#2C3E50]/60 bg-gray-50 p-2 rounded-lg">
                    <Mail className="h-4 w-4 mr-2 text-[#3498DB] flex-shrink-0" />
                    <span className="truncate font-medium">{member.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2C3E50]">
              {editingId ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            {/* ส่วนอัปโหลดรูปโปรไฟล์ */}
            <div className="flex flex-col items-center space-y-4 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                {editForm.image ? (
                  <img src={editForm.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Users className="h-12 w-12" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[#3498DB] animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="flex-1 border-[#3498DB] border-dashed"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปถ่าย'}
                </Button>
              </div>
              <Input 
                value={editForm.image || ''} 
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} 
                placeholder="หรือวาง URL รูปภาพที่นี่"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#2C3E50] mb-1">ชื่อ-นามสกุล</label>
                <Input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="ชื่อ-นามสกุล" className="border-[#3498DB]/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#2C3E50] mb-1">ตำแหน่ง</label>
                  <Input value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} placeholder="ตำแหน่ง" className="border-[#3498DB]/20" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2C3E50] mb-1">วิชาที่สอน</label>
                  <Input value={editForm.subject || ''} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} placeholder="วิชา" className="border-[#3498DB]/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C3E50] mb-1">อีเมล</label>
                <Input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="email@darussalam.ac.th" className="border-[#3498DB]/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C3E50] mb-1">ลำดับการแสดงผล</label>
                <Input type="number" value={editForm.order || ''} onChange={(e) => setEditForm({ ...editForm, order: e.target.value })} placeholder="ลำดับ (เลขน้อยขึ้นก่อน)" className="border-[#3498DB]/20" />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button onClick={handleSave} className="flex-1 btn-primary h-11 shadow-lg shadow-blue-100" disabled={isUploading}>
                <Save className="h-4 w-4 mr-2" /> บันทึกข้อมูล
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="px-6 text-gray-500" disabled={isUploading}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md admin-panel border-none">
          <DialogHeader><DialogTitle className="text-xl font-bold text-red-600">ยืนยันการลบ</DialogTitle></DialogHeader>
          <p className="text-[#2C3E50]/80 py-4">คุณแน่ใจหรือไม่ที่จะลบรายชื่อบุคลากรท่านนี้ออกจากระบบ?</p>
          <div className="flex space-x-3">
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white">ยืนยันการลบ</Button>
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="flex-1">ยกเลิก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// 1. เพิ่มสถานะใน editForm
// { ... , posX: 50, posY: 50 }

// 2. ส่วนการแสดงผลรูปในหน้าเว็บ
<img 
  src={member.image} 
  style={{ objectPosition: `${member.posX || 50}% ${member.posY || 50}%` }}
  className="w-full h-full object-cover"
/>

// 3. เพิ่มคอนโทรลใน Dialog แก้ไข
<div className="space-y-2">
  <label className="text-xs font-bold">ปรับตำแหน่งรูป (ซ้าย-ขวา / บน-ล่าง)</label>
  <div className="grid grid-cols-2 gap-4">
    <input 
      type="range" min="0" max="100" 
      value={editForm.posX || 50} 
      onChange={(e) => setEditForm({...editForm, posX: e.target.value})}
    />
    <input 
      type="range" min="0" max="100" 
      value={editForm.posY || 50} 
      onChange={(e) => setEditForm({...editForm, posY: e.target.value})}
    />
  </div>
</div>