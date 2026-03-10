import { useState } from 'react';
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

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'รับสมัครนักเรียนเข้าห้องเรียน SMP ปีการศึกษา 2568',
    content: 'โรงเรียนดารุสสาลาม เปิดรับสมัครนักเรียนเข้าห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์ (SMP) ประจำปีการศึกษา 2568 สำหรับนักเรียนชั้น ม.1 และ ม.4 ผู้ที่มีความสามารถพิเศษทางวิทยาศาสตร์และคณิตศาสตร์ สามารถสมัครได้ตั้งแต่วันนี้ - 30 มีนาคม 2568',
    date: '2026-03-01',
  },
  {
    id: 2,
    title: 'ประกาศผลการแข่งขันคณิตศาสตร์โอลิมปิกระดับชาติ',
    content: 'ขอแสดงความยินดีกับนักเรียนห้องเรียน SMP ที่ได้รับรางวัลจากการแข่งขันคณิตศาสตร์โอลิมปิกระดับชาติ ประจำปี 2568 ได้แก่ ด.ช.อhmad สานิ รางวัลเหรียญทอง ด.ญ.ฟาติมะ หะยีมามะ รางวัลเหรียญเงิน และ ด.ช.มูฮำหมัด อามีน รางวัลเหรียญทองแดง',
    date: '2026-02-15',
  },
  {
    id: 3,
    title: 'กำหนดการสอบเข้าห้องเรียน SMP',
    content: 'ขอแจ้งกำหนดการสอบคัดเลือกเข้าห้องเรียน SMP ประจำปีการศึกษา 2568 วันที่ 5 เมษายน 2568 ณ ห้องสอบโรงเรียนดารุสสาลาม เริ่มเวลา 09:00 น. ผู้สมัครต้องมารายงานตัวก่อนเวลา 30 นาที',
    date: '2026-03-05',
  },
];

export default function Announcements({ isLoggedIn }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Announcement>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsEditing(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setEditForm({ ...announcement });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editForm.title || !editForm.content) return;

    if (editingId) {
      setAnnouncements(announcements.map(a => 
        a.id === editingId ? { ...a, ...editForm } as Announcement : a
      ));
    } else {
      const newId = Math.max(...announcements.map(a => a.id), 0) + 1;
      setAnnouncements([...announcements, { ...editForm, id: newId } as Announcement]);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    setDeleteConfirm(null);
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
          {announcements.map((announcement) => (
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
                  <p className="text-[#2C3E50]/80 leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
