import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // 👈 เชื่อมสายไฟเข้า Firebase
import { BookOpen, CheckCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProgramsProps {
  isLoggedIn: boolean;
}

// ข้อมูลตั้งต้น (จะถูกส่งขึ้น Firebase อัตโนมัติถ้ายังไม่มี)
const initialPrograms = [
  {
    order: 1, // ใช้เรียงลำดับ
    title: 'โปรแกรมวิทยาศาสตร์',
    description: 'หลักสูตรที่เน้นการเรียนรู้วิทยาศาสตร์อย่างลึกซึ้ง ผ่านการทดลองและการค้นคว้าด้วยตนเอง นักเรียนจะได้เรียนรู้ฟิสิกส์ เคมี ชีววิทยา และโลกศาสตร์ในระดับที่สูงกว่าหลักสูตรปกติ',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    features: [
      'ห้องปฏิบัติการวิทยาศาสตร์ที่ทันสมัย',
      'โครงงานวิทยาศาสตร์ระดับชาติ',
      'ค่ายวิทยาศาสตร์เชิงลึก',
      'การแข่งขันโอลิมปิกวิชาการ',
    ],
  },
  {
    order: 2,
    title: 'โปรแกรมคณิตศาสตร์',
    description: 'หลักสูตรที่พัฒนาทักษะการคิดเชิงตรรกะ การแก้ปัญหา และการวิเคราะห์เชิงคณิตศาสตร์ นักเรียนจะได้เรียนรู้คณิตศาสตร์ขั้นสูง สถิติ และคอมพิวเตอร์',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    features: [
      'การแข่งขันคณิตศาสตร์โอลิมปิก',
      'การแก้ปัญหาเชิงคณิตศาสตร์',
      'การเขียนโปรแกรมและ算法',
      'โครงงานคณิตศาสตร์ประยุกต์',
    ],
  },
  {
    order: 3,
    title: 'โปรแกรมภาษาอังกฤษ',
    description: 'หลักสูตรที่พัฒนาทักษะภาษาอังกฤษครบทั้ง 4 ด้าน ฟัง พูด อ่าน เขียน โดยครูเจ้าของภาษาและครูไทยที่มีประสบการณ์',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop',
    features: [
      'การสอนโดยครูเจ้าของภาษา',
      'การเตรียมสอบ TOEIC/TOEFL',
      'การแข่งขันพูดภาษาอังกฤษ',
      'โครงการแลกเปลี่ยนวัฒนธรรม',
    ],
  },
];

export default function Programs({ isLoggedIn }: ProgramsProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 🔴 1. ฟังก์ชันดึงข้อมูลจาก Firebase (และอัปโหลดข้อมูลตั้งต้นให้ถ้าย่อมห่างเปล่า)
  useEffect(() => {
    if (!db) return;

    // ฟังก์ชันเช็กและอัปโหลดข้อมูลตั้งต้น
    const initializeData = async () => {
      const querySnapshot = await getDocs(collection(db, 'programs'));
      if (querySnapshot.empty) {
        console.log("No programs found, uploading initial data...");
        for (const prog of initialPrograms) {
          await addDoc(collection(db, 'programs'), prog);
        }
      }
    };

    initializeData();

    // ดึงข้อมูลแบบ Real-time มาแสดง (เรียงตาม order)
    const q = query(collection(db, 'programs'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrograms(fetchedData);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      image: '',
      features: [''],
      order: programs.length + 1 // ให้โปรแกรมใหม่อยู่ต่อท้าย
    });
    setIsEditing(true);
  };

  const handleEdit = (program: any) => {
    setEditingId(program.id);
    setEditForm({ ...program });
    setIsEditing(true);
  };

  // 🔴 2. ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    if (!editForm.title || !editForm.description) return;

    try {
      if (editingId) {
        // แก้ไข
        const docRef = doc(db, 'programs', editingId);
        await updateDoc(docRef, {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          features: editForm.features || [],
        });
      } else {
        // เพิ่มใหม่
        await addDoc(collection(db, 'programs'), {
          title: editForm.title,
          description: editForm.description,
          image: editForm.image || '',
          features: editForm.features || [],
          order: editForm.order || 99
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  // 🔴 3. ฟังก์ชันลบข้อมูล
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'programs', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(editForm.features || [])];
    newFeatures[index] = value;
    setEditForm({ ...editForm, features: newFeatures });
  };

  const addFeature = () => {
    setEditForm({ ...editForm, features: [...(editForm.features || []), ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = (editForm.features || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, features: newFeatures });
  };

  return (
    <section id="programs" className="py-16 relative bg-gradient-to-b from-[#98D8C8]/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-[#F7DC6F]/40 p-3 rounded-full border-2 border-[#3498DB] mr-4">
              <BookOpen className="h-6 w-6 text-[#3498DB]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                แนะนำโปรแกรม
              </h2>
              <p className="text-[#2C3E50]/70">หลักสูตรการเรียนการสอน</p>
            </div>
          </div>
          {isLoggedIn && (
            <Button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มโปรแกรม
            </Button>
          )}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              className="mint-card overflow-hidden group animate-fade-in"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={program.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {isLoggedIn && (
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(program)}
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-[#2C3E50]" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(program.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                  {program.title}
                </h3>
                <p className="text-[#2C3E50]/80 text-sm mb-4 leading-relaxed">
                  {program.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#2C3E50] text-sm">
                    จุดเด่นของหลักสูตร:
                  </h4>
                  <ul className="space-y-1">
                    {(program.features || []).map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-[#2C3E50]/70"
                      >
                        <CheckCircle className="h-4 w-4 text-[#98D8C8] mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
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
              {editingId ? 'แก้ไขโปรแกรม' : 'เพิ่มโปรแกรม'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                ชื่อโปรแกรม
              </label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="ชื่อโปรแกรม"
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
                คำอธิบาย
              </label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="คำอธิบายโปรแกรม"
                rows={4}
                className="border-[#3498DB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                จุดเด่น
              </label>
              <div className="space-y-2">
                {(editForm.features || []).map((feature: string, index: number) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={`จุดเด่นที่ ${index + 1}`}
                      className="border-[#3498DB] flex-1"
                    />
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
                <Button
                  onClick={addFeature}
                  variant="outline"
                  className="w-full border-[#3498DB] border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มจุดเด่น
                </Button>
              </div>
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
            คุณต้องการลบโปรแกรมนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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