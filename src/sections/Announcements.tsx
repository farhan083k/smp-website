import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Edit2, Trash2, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Announcements({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // ดึงข้อมูลข่าวจากฐานข้อมูล โดยเรียงจากวันที่ใหม่ล่าสุด (desc) ไปเก่าสุด
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return alert("กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน");
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'announcements'), { 
          ...editForm, 
          createdAt: new Date().toISOString() 
        });
      }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบประกาศนี้ใช่หรือไม่?")) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ title: '', content: '' });
    setIsEditing(true);
  };

  const openEditDialog = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
    setIsEditing(true);
  };

  // ตัวช่วยแปลงวันที่ให้เป็นภาษาไทยแบบสวยงาม
  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section id="announcements" className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* หัวข้อส่วนข่าวประชาสัมพันธ์ */}
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#2C3E50] flex items-center">
            <Bell className="mr-3 h-8 w-8 text-[var(--primary)]" />
            ข่าวประชาสัมพันธ์
          </h2>
          {isLoggedIn && (
            <Button onClick={openAddDialog} className="btn-primary shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มประกาศ
            </Button>
          )}
        </div>

        {/* รายการข่าว (ถ้ามีข่าว จะแสดงเป็นกล่องๆ) */}
        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4 hover:shadow-md transition-shadow relative group" style={{ borderLeftColor: 'var(--primary)' }}>
                
                <div className="flex items-center text-sm text-gray-500 mb-3 bg-gray-50 w-fit px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4 mr-2 text-[var(--primary)]" />
                  {formatDate(item.createdAt)}
                </div>
                
                <h3 className="text-xl font-bold text-[#2C3E50] mb-2">{item.title}</h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm">{item.content}</p>

                {isLoggedIn && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditDialog(item)} className="p-2 bg-gray-100 text-blue-600 rounded-full hover:bg-blue-100 shadow-sm"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-gray-100 text-red-500 rounded-full hover:bg-red-100 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* ถ้าไม่มีข่าว จะแสดงข้อความนี้ */
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</p>
          </div>
        )}
      </div>

      {/* 📝 หน้าต่าง Pop-up สำหรับเพิ่ม/แก้ไขข่าว */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md admin-panel border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold">{editingId ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">หัวข้อประกาศ</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="เช่น รับสมัครนักเรียนใหม่ ปีการศึกษา 2569" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">เนื้อหาประกาศ (เว้นวรรค/ขึ้นบรรทัดใหม่ได้)</label>
              <Textarea value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={5} placeholder="พิมพ์รายละเอียดที่นี่..." className="mt-1" />
            </div>
            <Button onClick={handleSave} className="w-full h-12 mt-4 text-lg shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              บันทึกประกาศ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}