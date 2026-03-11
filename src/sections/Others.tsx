import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MoreHorizontal, FileText, Download, ExternalLink, Plus, Edit2, Trash2, X, Save, Link as LinkIcon } from 'lucide-react';
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

const initialOthers = [
  { order: 1, title: 'เอกสารรับสมัครนักเรียน SMP ปี 2568', content: 'ดาวน์โหลดเอกสารการรับสมัครนักเรียนเข้าห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์ ประจำปีการศึกษา 2568', category: 'documents', date: '2026-03-01' },
  { order: 2, title: 'หลักสูตรห้องเรียน SMP', content: 'รายละเอียดหลักสูตรการเรียนการสอนของห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์', category: 'curriculum', date: '2026-01-15' },
];

// ข้อมูลลิงก์ตั้งต้น
const initialLinks = [
  { order: 1, title: 'เว็บไซต์โรงเรียน', url: 'https://www.darussalam.ac.th' },
  { order: 2, title: 'ดาวน์โหลดเอกสาร', url: '#' },
  { order: 3, title: 'ผลงานนักเรียน', url: '#' },
  { order: 4, title: 'Facebook SMP', url: 'https://facebook.com' },
];

export default function Others({ isLoggedIn }: OthersProps) {
  const [others, setOthers] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // สำหรับจัดการ Link แยกต่างหาก
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({ title: '', url: '', order: 1 });

  useEffect(() => {
    if (!db) return;

    // 1. จัดการข้อมูลเนื้อหา (Others)
    const initOthers = async () => {
      const snap = await getDocs(collection(db, 'others'));
      if (snap.empty) {
        for (const item of initialOthers) await addDoc(collection(db, 'others'), item);
      }
    };
    initOthers();
    const unsubOthers = onSnapshot(query(collection(db, 'others'), orderBy('order', 'asc')), (snap) => {
      setOthers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. จัดการข้อมูลลิงก์ (Links)
    const initLinks = async () => {
      const snap = await getDocs(collection(db, 'quickLinks'));
      if (snap.empty) {
        for (const link of initialLinks) await addDoc(collection(db, 'quickLinks'), link);
      }
    };
    initLinks();
    const unsubLinks = onSnapshot(query(collection(db, 'quickLinks'), orderBy('order', 'asc')), (snap) => {
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubOthers(); unsubLinks(); };
  }, []);

  // --- Functions สำหรับเนื้อหาหลัก ---
  const handleSave = async () => {
    if (!editForm.title || !editForm.content) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, 'others', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'others'), { ...editForm, order: others.length + 1 });
      }
      setIsEditing(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'others', id));
    setDeleteConfirm(null);
  };

  // --- Functions สำหรับลิงก์ด่วน ---
  const handleLinkEdit = (link: any) => {
    setEditingLinkId(link.id);
    setLinkForm({ title: link.title, url: link.url, order: link.order });
    setIsLinkEditing(true);
  };

  const handleLinkSave = async () => {
    if (!linkForm.title || !linkForm.url) return;
    try {
      if (editingLinkId) {
        await updateDoc(doc(db, 'quickLinks', editingLinkId), linkForm);
      }
      setIsLinkEditing(false);
    } catch (e) { console.error(e); }
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
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">อื่นๆ</h2>
              <p className="text-[#2C3E50]/70">เอกสารและข้อมูลเพิ่มเติม</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={() => { setEditingId(null); setEditForm({ category: 'other', date: new Date().toISOString().split('T')[0] }); setIsEditing(true); }} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> เพิ่มเนื้อหา
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
                  </div>
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2">{item.title}</h3>
                  <p className="text-[#2C3E50]/80 text-sm whitespace-pre-line">{item.content}</p>
                </div>
                {isLoggedIn && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => { setEditingId(item.id); setEditForm(item); setIsEditing(true); }} className="p-2 bg-[#98D8C8]/50 rounded-lg hover:bg-[#98D8C8] transition-colors"><Edit2 className="h-4 w-4 text-[#2C3E50]" /></button>
                    <button onClick={() => setDeleteConfirm(item.id)} className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"><Trash2 className="h-4 w-4 text-red-600" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* --- Quick Links Section --- */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-[#2C3E50] mb-4">ลิงก์ที่เกี่ยวข้อง</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {links.map((link) => (
              <div key={link.id} className="relative group">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="mint-card p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow block h-full">
                  <div className="bg-[#3498DB]/10 p-2 rounded-lg"><ExternalLink className="h-5 w-5 text-[#3498DB]" /></div>
                  <span className="font-medium text-[#2C3E50]">{link.title}</span>
                </a>
                {isLoggedIn && (
                  <button onClick={() => handleLinkEdit(link)} className="absolute -top-2 -right-2 p-1 bg-white border border-[#3498DB] rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="h-3 w-3 text-[#3498DB]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog แก้ไขเนื้อหาหลัก */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg admin-panel">
          <DialogHeader><DialogTitle className="text-xl font-bold">{editingId ? 'แก้ไขเนื้อหา' : 'เพิ่มเนื้อหา'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="หัวข้อ" />
            <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
              <SelectTrigger><SelectValue placeholder="หมวดหมู่" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="documents">เอกสาร</SelectItem><SelectItem value="curriculum">หลักสูตร</SelectItem>
                <SelectItem value="criteria">เกณฑ์การคัดเลือก</SelectItem><SelectItem value="schedule">ตารางเรียน</SelectItem>
                <SelectItem value="contact">ติดต่อ</SelectItem><SelectItem value="other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} placeholder="เนื้อหา" rows={4} />
            <Button onClick={handleSave} className="w-full btn-primary"><Save className="mr-2 h-4 w-4" /> บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog แก้ไขลิงก์ด่วน */}
      <Dialog open={isLinkEditing} onOpenChange={setIsLinkEditing}>
        <DialogContent className="sm:max-w-md admin-panel">
          <DialogHeader><DialogTitle className="text-xl font-bold">แก้ไขลิงก์ที่เกี่ยวข้อง</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><label className="text-sm">ชื่อลิงก์</label><Input value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} /></div>
            <div><label className="text-sm">URL (เช่น https://google.com)</label><Input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} /></div>
            <Button onClick={handleLinkSave} className="w-full btn-primary"><Save className="mr-2 h-4 w-4" /> บันทึกการแก้ไขลิงก์</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ยืนยันการลบ */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md admin-panel">
          <p className="py-4">คุณต้องการลบเนื้อหานี้ใช่หรือไม่?</p>
          <div className="flex space-x-3">
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white">ลบ</Button>
            <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="flex-1">ยกเลิก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const categoryLabels: Record<string, { text: string; color: string }> = {
  documents: { text: 'เอกสาร', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  curriculum: { text: 'หลักสูตร', color: 'bg-green-100 text-green-700 border-green-300' },
  criteria: { text: 'เกณฑ์การคัดเลือก', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  schedule: { text: 'ตารางเรียน', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  contact: { text: 'ติดต่อ', color: 'bg-pink-100 text-pink-700 border-pink-300' },
  other: { text: 'อื่นๆ', color: 'bg-gray-100 text-gray-700 border-gray-300' },
};