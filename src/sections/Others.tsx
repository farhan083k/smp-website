import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MoreHorizontal, ExternalLink, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Others({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'others'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSave = async () => {
    if (editingId) {
      await updateDoc(doc(db, 'others', editingId), editForm);
    } else {
      await addDoc(collection(db, 'others'), { ...editForm, order: items.length + 1 });
    }
    setIsEditing(false);
  };

  return (
    <section id="others" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gray-100 p-3 rounded-full mr-4"><MoreHorizontal className="h-6 w-6 text-gray-600" /></div>
            <h2 className="text-3xl font-bold">ข้อมูลอื่นๆ</h2>
          </div>
          {isLoggedIn && <Button onClick={() => { setEditingId(null); setEditForm({}); setIsEditing(true); }} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> เพิ่มรายการ</Button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="mint-card p-6 border-[#3498DB]/10 relative group">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              {/* ✅ ซ่อน/แสดงปุ่มลิงก์อัตโนมัติ */}
              {item.link && item.link.trim() !== "" && (
                <Button asChild variant="outline" className="border-[#3498DB] text-[#3498DB]">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    ดูรายละเอียดเพิ่มเติม <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}

              {isLoggedIn && (
                <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingId(item.id); setEditForm(item); setIsEditing(true); }} className="p-2 hover:bg-gray-100 rounded-full"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => deleteDoc(doc(db, 'others', item.id))} className="p-2 hover:bg-red-50 text-red-500 rounded-full"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md admin-panel">
          <DialogHeader><DialogTitle>จัดการรายการ</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="หัวข้อ" />
            <Input value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="รายละเอียดสั้นๆ" />
            <Input value={editForm.link || ''} onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} placeholder="Link (ถ้ามี / ถ้าไม่มีให้เว้นว่าง)" />
            <Button onClick={handleSave} className="w-full btn-primary">บันทึกข้อมูล</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}