import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase'; // 👈 เชื่อมสายไฟเข้า Firebase
import { Megaphone, Calendar, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Announcement } from '@/types';

interface AnnouncementsProps {
  isLoggedIn: boolean;
}

export default function Announcements({ isLoggedIn }: AnnouncementsProps) {
  // เปลี่ยนมารับข้อมูลจาก Firebase เป็นหลัก
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 🔴 1. ฟังก์ชันดึงข้อมูลจาก Firebase แบบ Real-time
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsEditing(true);
  };

  const handleEdit = (announcement: any) => {
    setEditingId(announcement.id);
    setEditForm({ ...announcement });
    setIsEditing(true);
  };

  // 🔴 2. ฟังก์ชันบันทึกข้อมูลลง Firebase (ทั้งเพิ่มใหม่และแก้ไข)
  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return;

    try {
      if (editingId) {
        // กรณีแก้ไขของเดิม
        const docRef = doc(db, 'announcements', editingId);
        await updateDoc(docRef, {
          title: editForm.title,
          content: editForm.content,
          date: editForm.date,
        });
      } else {
        // กรณีเพิ่มประกาศใหม่
        await addDoc(collection(db, 'announcements'), {
          title: editForm.title,
          content: editForm.content,
          date: editForm.date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  // 🔴 3. ฟังก์ชันลบข้อมูลออกจาก Firebase
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section id="announcements" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#98D8C8]/30 p-3 rounded-full border-2 border-[#3498DB] mr-4">
              <Megaphone className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                ประกาศ
              </h2>
              <p className="text-[#2C3E50]/70">ข่าวสารและประกาศสำคัญ</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มประกาศ
            </Button>
          )}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีประกาศในขณะนี้
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="mint-card p-6 relative group animate-fade-in"
              >
                {isLoggedIn && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 bg-[#98D8C8]/50 rounded-lg hover:bg-[#98D8C8] transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(announcement.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-[#F7DC6F]/40 px-3 py-2 rounded-lg border border-[#3498DB]/30 text-center">
                      <Calendar className="h-5 w-5 text-[#3498DB] mx-auto mb-1" />
                      <span className="text-xs font-medium text-[#2C3E50]">
                        {formatDate(announcement.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2C3E50] mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-[#2C3E50]/80 leading-relaxed whitespace-pre-line">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2C3E50]">
              {editingId ? 'แก้ไขประกาศ' : 'เพิ่มประกาศ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                หัวข้อ
              </label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="หัวข้อประกาศ"
                className="border-[#3498DB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                เนื้อหา
              </label>
              <Textarea
                value={editForm.content || ''}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                placeholder="เนื้อหาประกาศ"
                rows={5}
                className="border-[#3498DB]"
              />
            </div>
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
            คุณต้องการลบประกาศนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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