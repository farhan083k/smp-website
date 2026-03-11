import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // 👈 เชื่อมสายไฟเข้า Firebase
import { FolderOpen, Calendar, Clock, Plus, Edit2, Trash2, Save } from 'lucide-react';
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

interface ProjectsProps {
  isLoggedIn: boolean;
}

// ข้อมูลตั้งต้น (จะถูกส่งขึ้น Firebase อัตโนมัติถ้าฐานข้อมูลยังว่างเปล่า)
const initialProjects = [
  {
    order: 1, // ใช้สำหรับเรียงลำดับ
    title: 'โครงการค่ายวิทยาศาสตร์เชิงลึก',
    description: 'ค่ายวิทยาศาสตร์ระดับชาติสำหรับนักเรียนที่มีความสนใจด้านวิทยาศาสตร์ ได้รับการสนับสนุนจากสถาบันวิทยาศาสตร์และเทคโนโลยีแห่งประเทศไทย',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
    status: 'ongoing',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
  },
  {
    order: 2,
    title: 'โครงการแลกเปลี่ยนวัฒนธรรมกับสิงคโปร์',
    description: 'โครงการแลกเปลี่ยนวัฒนธรรมและการศึกษากับโรงเรียนชั้นนำในสิงคโปร์ ระยะเวลา 1 สัปดาห์',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
    status: 'upcoming',
    startDate: '2026-06-15',
    endDate: '2026-06-22',
  },
  {
    order: 3,
    title: 'โครงการติวเข้มคณิตศาสตร์โอลิมปิก',
    description: 'โครงการติวเข้มเตรียมความพร้อมสำหรับการแข่งขันคณิตศาสตร์โอลิมปิกระดับชาติและนานาชาติ',
    image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop',
    status: 'completed',
    startDate: '2025-11-01',
    endDate: '2026-01-31',
  },
  {
    order: 4,
    title: 'โครงการวิจัยเยาวชน',
    description: 'โครงการสนับสนุนให้นักเรียนทำโครงงานวิจัยในหัวข้อที่สนใจ ภายใต้การดูแลของอาจารย์ที่ปรึกษา',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    status: 'ongoing',
    startDate: '2026-01-15',
    endDate: '2026-11-30',
  },
];

const statusLabels = {
  ongoing: { text: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  completed: { text: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700 border-green-300' },
  upcoming: { text: 'upcoming', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
};

export default function Projects({ isLoggedIn }: ProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 🔴 1. ฟังก์ชันดึงข้อมูลจาก Firebase (และอัปโหลดข้อมูลตั้งต้น)
  useEffect(() => {
    if (!db) return;

    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      if (querySnapshot.empty) {
        console.log("No projects found, uploading initial data...");
        for (const proj of initialProjects) {
          await addDoc(collection(db, 'projects'), proj);
        }
      }
    };

    initializeData();

    // ดึงข้อมูลมาแสดงแบบ Real-time (เรียงตาม order)
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      image: '',
      status: 'upcoming',
      startDate: '',
      endDate: '',
      order: projects.length + 1
    });
    setIsEditing(true);
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setEditForm({ ...project });
    setIsEditing(true);
  };

  // 🔴 2. ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    if (!editForm.title || !editForm.description) return;

    try {
      if (editingId) {
        // แก้ไขของเดิม
        const docRef = doc(db, 'projects', editingId);
        await updateDoc(docRef, {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          status: editForm.status || 'upcoming',
          startDate: editForm.startDate || '',
          endDate: editForm.endDate || '',
        });
      } else {
        // เพิ่มของใหม่
        await addDoc(collection(db, 'projects'), {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          status: editForm.status || 'upcoming',
          startDate: editForm.startDate || '',
          endDate: editForm.endDate || '',
          order: editForm.order || 99
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // 🔴 3. ฟังก์ชันลบข้อมูล
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'ไม่ระบุ';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ฟังก์ชันช่วยดึงข้อมูลสถานะป้องกันเว็บพัง
  const getStatusInfo = (statusKey: string) => {
    const validKey = statusKey as keyof typeof statusLabels;
    return statusLabels[validKey] || statusLabels['upcoming'];
  };

  return (
    <section id="projects" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#98D8C8]/30 p-3 rounded-full border-2 border-[#3498DB] mr-4">
              <FolderOpen className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                โครงการ
              </h2>
              <p className="text-[#2C3E50]/70">โครงการและกิจกรรมของห้องเรียน</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มโครงการ
            </Button>
          )}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="mint-card overflow-hidden group animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={project.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusInfo(project.status).color}`}>
                      {getStatusInfo(project.status).text}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 relative">
                  {isLoggedIn && (
                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 bg-[#98D8C8]/50 rounded-lg hover:bg-[#98D8C8] transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(project.id)}
                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2 pr-16">
                    {project.title}
                  </h3>
                  <p className="text-[#2C3E50]/80 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Dates */}
                  <div className="flex items-center space-x-4 text-xs text-[#2C3E50]/60">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>เริ่ม: {formatDate(project.startDate)}</span>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>สิ้นสุด: {formatDate(project.endDate)}</span>
                      </div>
                    )}
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
              {editingId ? 'แก้ไขโครงการ' : 'เพิ่มโครงการ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ชื่อโครงการ
              </label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="ชื่อโครงการ"
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
                สถานะ
              </label>
              <Select
                value={editForm.status || 'upcoming'}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="border-[#3498DB]">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="upcoming">upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  วันที่เริ่ม
                </label>
                <Input
                  type="date"
                  value={editForm.startDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="border-[#3498DB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                  วันที่สิ้นสุด
                </label>
                <Input
                  type="date"
                  value={editForm.endDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
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
                placeholder="คำอธิบายโครงการ"
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
            คุณต้องการลบโครงการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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