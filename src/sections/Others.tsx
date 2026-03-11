import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // 👈 เชื่อมสายไฟเข้า Firebase
import { MoreHorizontal, FileText, Download, ExternalLink, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OthersProps {
  isLoggedIn: boolean;
}

// ข้อมูลตั้งต้น (จะถูกส่งขึ้น Firebase อัตโนมัติถ้ายังไม่มี)
const initialOthers = [
  {
    order: 1,
    title: 'เอกสารรับสมัครนักเรียน SMP ปี 2568',
    content: 'ดาวน์โหลดเอกสารการรับสมัครนักเรียนเข้าห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์ ประจำปีการศึกษา 2568',
    category: 'documents',
    date: '2026-03-01',
  },
  {
    order: 2,
    title: 'หลักสูตรห้องเรียน SMP',
    content: 'รายละเอียดหลักสูตรการเรียนการสอนของห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์',
    category: 'curriculum',
    date: '2026-01-15',
  },
  {
    order: 3,
    title: 'เกณฑ์การคัดเลือกเข้าห้องเรียน SMP',
    content: 'เกณฑ์และเงื่อนไขการคัดเลือกนักเรียนเข้าห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์',
    category: 'criteria',
    date: '2026-02-01',
  },
  {
    order: 4,
    title: 'ตารางเรียนห้อง SMP ม.1',
    content: 'ตารางเรียนประจำภาคเรียนของนักเรียนชั้นมัธยมศึกษาปีที่ 1 ห้องเรียน SMP',
    category: 'schedule',
    date: '2026-05-15',
  },
  {
    order: 5,
    title: 'ติดต่อห้องเรียน SMP',
    content: 'ข้อมูลการติดต่อห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์ โทรศัพท์: 073-xxx-xxx อีเมล: smp@darussalam.ac.th',
    category: 'contact',
    date: '2026-01-01',
  },
];

const categoryLabels: Record<string, { text: string; color: string }> = {
  documents: { text: 'เอกสาร', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  curriculum: { text: 'หลักสูตร', color: 'bg-green-100 text-green-700 border-green-300' },
  criteria: { text: 'เกณฑ์การคัดเลือก', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  schedule: { text: 'ตารางเรียน', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  contact: { text: 'ติดต่อ', color: 'bg-pink-100 text-pink-700 border-pink-300' },
  other: { text: 'อื่นๆ', color: 'bg-gray-100 text-gray-700 border-gray-300' },
};

export default function Others({ isLoggedIn }: OthersProps) {
  const [others, setOthers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 🔴 1. ฟังก์ชันดึงข้อมูลแบบ Real-time และอัปโหลดข้อมูลตั้งต้น
  useEffect(() => {
    if (!db) return;

    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'others'));
      if (querySnapshot.empty) {
        console.log("No data found, uploading initial others...");
        for (const item of initialOthers) {
          await addDoc(collection(db, 'others'), item);
        }
      }
    };

    initializeData();

    const q = query(collection(db, 'others'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOthers(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      content: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      order: others.length + 1
    });
    setIsEditing(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setIsEditing(true);
  };

  // 🔴 2. ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return;

    try {
      if (editingId) {
        const docRef = doc(db, 'others', editingId);
        await updateDoc(docRef, {
          title: editForm.title,
          content: editForm.content,
          category: editForm.category || 'other',
          date: editForm.date || '',
        });
      } else {
        await addDoc(collection(db, 'others'), {
          title: editForm.title,
          content: editForm.content,
          category: editForm.category || 'other',
          date: editForm.date || '',
          order: editForm.order || 99
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  // 🔴 3. ฟังก์ชันลบข้อมูล
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'others', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section id="others" className="py-16 relative bg-gradient-to-b from-[#98D8C8]/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#F7DC6F]/40 p-3 rounded-full border-2 border-[#3498DB] mr-4">
              <MoreHorizontal className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                อื่นๆ
              </h2>
              <p className="text-[#2C3E50]/70">เอกสารและข้อมูลเพิ่มเติม</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มเนื้อหา
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {others.map((item) => (
            <div key={item.id} className="mint-card p-5 group animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryLabels[item.category]?.color || categoryLabels.other.color}`}>
                      {categoryLabels[item.category]?.text || 'อื่นๆ'}
                    </span>
                    <span className="text-xs text-[#2C3E50]/50">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#2C3E50]/80 text-sm whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 bg-[#98D8C8]/30 rounded-lg hover:bg-[#98D8C8]/50 transition-colors">
                    <FileText className="h-5 w-5 text-[#3498DB]" />
                  </button>
                  {isLoggedIn && (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-[#98D8C8]/50 rounded-lg hover:bg-[#98D8C8] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-[#2C3E50] mb-4">ลิงก์ที่เกี่ยวข้อง</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="#" className="mint-card p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
              <div className="bg-[#3498DB]/10 p-2 rounded-lg"><ExternalLink className="h-5 w-5 text-[#3498DB]" /></div>
              <span className="font-medium text-[#2C3E50]">เว็บไซต์โรงเรียน</span>
            </a>
            <a href="#" className="mint-card p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
              <div className="bg-[#98D8C8]/30 p-2 rounded-lg"><Download className="h-5 w-5 text-[#3498DB]" /></div>
              <span className="font-medium text-[#2C3E50]">ดาวน์โหลดเอกสาร</span>
            </a>
            <a href="#" className="mint-card p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
              <div className="bg-[#F7DC6F]/40 p-2 rounded-lg"><FileText className="h-5 w-5 text-[#3498DB]" /></div>
              <span className="font-medium text-[#2C3E50]">ผลงานนักเรียน</span>
            </a>
            <a href="#" className="mint-card p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow">
              <div className="bg-[#3498DB]/10 p-2 rounded-lg"><ExternalLink className="h-5 w-5 text-[#3498DB]" /></div>
              <span className="font-medium text-[#2C3E50]">Facebook SMP</span>
            </a>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel">
          <DialogHeader><DialogTitle className="text-xl font-bold text-[#2C3E50]">{editingId ? 'แก้ไขเนื้อหา' : 'เพิ่มเนื้อหา'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">หัวข้อ</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="หัวข้อ" className="border-[#3498DB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">หมวดหมู่</label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger className="border-[#3498DB]"><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="documents">เอกสาร</SelectItem>
                  <SelectItem value="curriculum">หลักสูตร</SelectItem>
                  <SelectItem value="criteria">เกณฑ์การคัดเลือก</SelectItem>
                  <SelectItem value="schedule">ตารางเรียน</SelectItem>
                  <SelectItem value="contact">ติดต่อ</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">เนื้อหา</label>
              <Textarea value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} placeholder="เนื้อหา" rows={4} className="border-[#3498DB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">วันที่</label>
              <Input type="date" value={editForm.date || ''} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="border-[#3498DB]" />
            </div>
            <div className="flex space-x-3 pt-2">
              <Button onClick={handleSave} className="flex-1 btn-primary"><Save className="h-4 w-4 mr-2" />บันทึก</Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 border-[#3498DB]"><X className="h-4 w-4 mr-2" />ยกเลิก</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md admin-panel">
          <DialogHeader><DialogTitle className="text-xl font-bold text-[#2C3E50]">ยืนยันการลบ</DialogTitle></DialogHeader>
          <p className="text-[#2C3E50]/80 py-4">คุณต้องการลบเนื้อหานี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          <div className="flex space-x-3">
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white"><Trash2 className="h-4 w-4 mr-2" />ลบ</Button>
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="flex-1 border-[#3498DB]">ยกเลิก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}