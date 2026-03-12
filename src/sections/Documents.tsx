import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../lib/firebase';
import { Plus, Edit2, Trash2, FileText, Download, Loader2, FileDown, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Documents({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // ดึงข้อมูลเอกสารจากฐานข้อมูล
  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // ฟังก์ชันอัปโหลดไฟล์เอกสาร
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const storage = getStorage();
      const fileRef = ref(storage, `documents/smp_doc_${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditForm({ ...editForm, fileUrl: url, fileName: file.name });
    } catch (error) { 
      alert("อัปโหลดเอกสารไม่สำเร็จ"); 
    } finally { 
      setIsUploadingFile(false); 
    }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.fileUrl) return alert("กรุณากรอกชื่อเอกสารและแนบไฟล์ให้เรียบร้อย");
    try {
      if (editingId) {
        await updateDoc(doc(db, 'documents', editingId), { ...editForm });
      } else {
        await addDoc(collection(db, 'documents'), { ...editForm, createdAt: new Date().toISOString() });
      }
      setIsEditing(false);
    } catch (error) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณต้องการลบเอกสารนี้ใช่หรือไม่?")) {
      await deleteDoc(doc(db, 'documents', id));
    }
  };

  const openAddDialog = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', fileUrl: '', fileName: '' });
    setIsEditing(true);
  };

  const openEditDialog = (item: any) => {
    setEditingId(item.id);
    setEditForm(item);
    setIsEditing(true);
  };

  return (
    <section id="documents" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h2 className="text-3xl font-bold text-[#2C3E50] flex items-center">
            <FileDown className="mr-3 h-8 w-8 text-green-600" />
            เอกสารดาวน์โหลด
          </h2>
          {isLoggedIn && (
            <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มเอกสาร
            </Button>
          )}
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col relative group">
                <div className="flex items-start mb-4">
                  <div className="bg-green-50 p-3 rounded-lg mr-4 text-green-600">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2C3E50] leading-tight mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center justify-center w-full py-2.5 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-lg font-medium text-sm transition-colors border border-gray-200 hover:border-green-200">
                  <Download className="h-4 w-4 mr-2" /> ดาวน์โหลดเอกสาร
                </a>

                {isLoggedIn && (
                  <div className="absolute -top-3 -right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditDialog(item)} className="p-2 bg-white text-blue-600 rounded-full shadow-md border border-gray-100 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-red-500 rounded-full shadow-md border border-gray-100 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <File className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>ยังไม่มีเอกสารในระบบ</p>
          </div>
        )}
      </div>

      {/* 📝 หน้าต่างสำหรับแอดมิน (เพิ่ม/แก้ไขเอกสาร) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md admin-panel border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center"><FileDown className="w-5 h-5 mr-2 text-green-600"/> {editingId ? 'แก้ไขเอกสาร' : 'เพิ่มเอกสารใหม่'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">อัปโหลดไฟล์ (PDF, Word, Excel, ZIP)</label>
              <Button type="button" variant="outline" className="w-full bg-gray-50 border-dashed border-2 hover:bg-green-50 h-16" onClick={() => docInputRef.current?.click()} disabled={isUploadingFile}>
                {isUploadingFile ? <Loader2 className="w-5 h-5 mr-2 animate-spin text-green-600" /> : <FileText className="w-5 h-5 mr-2 text-green-600" />}
                {isUploadingFile ? 'กำลังอัปโหลด...' : 'คลิกเพื่อเลือกไฟล์'}
              </Button>
              <input type="file" ref={docInputRef} onChange={handleDocumentUpload} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" />
              
              {editForm.fileName && (
                <div className="mt-3 flex items-center justify-between text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <span className="truncate font-medium">{editForm.fileName}</span>
                  <button onClick={() => setEditForm({ ...editForm, fileUrl: '', fileName: '' })} className="ml-2 text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">ชื่อเอกสาร</label>
              <Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="เช่น โครงสร้างหลักสูตร SMP 2569" className="mt-1 font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">คำอธิบายเพิ่มเติม (ถ้ามี)</label>
              <Textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} placeholder="เช่น สำหรับนักเรียนชั้น ม.1 - ม.3..." className="mt-1" />
            </div>
            
            <Button onClick={handleSave} disabled={isUploadingFile} className="w-full h-12 mt-4 bg-green-600 hover:bg-green-700 text-white shadow-md">
              {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null} บันทึกข้อมูลเอกสาร
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}