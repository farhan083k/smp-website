import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, uploadStaffImage } from '../lib/firebase';
import { Users, Mail, GraduationCap, Plus, Edit2, Trash2, Save, Upload, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const q = query(collection(db, 'staff'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSave = async () => {
    const data = { 
      ...editForm, 
      order: Number(editForm.order) || 99, 
      posX: Number(editForm.posX) || 50, 
      posY: Number(editForm.posY) || 50 
    };
    if (editingId) {
      await updateDoc(doc(db, 'staff', editingId), data);
    } else {
      await addDoc(collection(db, 'staff'), data);
    }
    setIsEditing(false);
  };

  return (
    <section id="staff" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">คณะครู SMP</h2>
          {isLoggedIn && <Button onClick={() => { setEditingId(null); setEditForm({ posX: 50, posY: 50 }); setIsEditing(true); }} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> เพิ่มครู</Button>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member) => (
            <div key={member.id} className="mint-card overflow-hidden group border-[#3498DB]/10">
              <div className="relative h-80 overflow-hidden bg-gray-100">
                <img
                  src={member.image || 'https://via.placeholder.com/300x300'}
                  style={{ objectPosition: `${member.posX || 50}% ${member.posY || 50}%` }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={member.name}
                />
                {isLoggedIn && (
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button onClick={() => { setEditingId(member.id); setEditForm(member); setIsEditing(true); }} className="p-2 bg-white rounded-full shadow-md"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => deleteDoc(doc(db, 'staff', member.id))} className="p-2 bg-white rounded-full shadow-md text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-[#3498DB] text-sm font-bold mb-4">{member.position}</p>
                {member.email && <div className="flex items-center text-sm text-gray-500"><Mail className="h-4 w-4 mr-2" />{member.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md admin-panel">
          <DialogHeader><DialogTitle>{editingId ? 'แก้ไขข้อมูลครู' : 'เพิ่มข้อมูลครู'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#98D8C8] shadow-lg relative bg-gray-200">
                <img 
                  src={editForm.image || ''} 
                  style={{ objectPosition: `${editForm.posX || 50}% ${editForm.posY || 50}%` }}
                  className="w-full h-full object-cover" 
                  alt=""
                />
                {isUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
              </div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-4" disabled={isUploading}>อัปโหลดรูปโปรไฟล์</Button>
              <input type="file" ref={fileInputRef} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                const url = await uploadStaffImage(file);
                setEditForm({...editForm, image: url});
                setIsUploading(false);
              }} className="hidden" accept="image/*" />
            </div>

            {/* ✅ ส่วนปรับตำแหน่งภาพ */}
            <div className="p-4 bg-blue-50 rounded-xl space-y-4 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase">ปรับตำแหน่งใบหน้า (จมูกควรอยู่กึ่งกลาง)</p>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400">ซ้าย-ขวา</span>
                <input type="range" min="0" max="100" value={editForm.posX || 50} onChange={(e) => setEditForm({...editForm, posX: e.target.value})} className="w-full" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400">บน-ล่าง</span>
                <input type="range" min="0" max="100" value={editForm.posY || 50} onChange={(e) => setEditForm({...editForm, posY: e.target.value})} className="w-full" />
              </div>
            </div>

            <Input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="ชื่อ-นามสกุล" />
            <Input value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} placeholder="ตำแหน่ง" />
            <Input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="อีเมล" />
            <Input type="number" value={editForm.order || ''} onChange={(e) => setEditForm({ ...editForm, order: e.target.value })} placeholder="ลำดับการแสดงผล" />
            <Button onClick={handleSave} className="w-full btn-primary" disabled={isUploading}>บันทึกข้อมูล</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}