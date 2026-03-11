import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression'; // 👈 นำเข้าเครื่องย่อรูป

const firebaseConfig = {
  apiKey: "AIzaSyC6PRh-hPF7vGdZUvVn8JOqOq3o4lQvXqA",
  authDomain: "smp-darussalam.firebaseapp.com",
  projectId: "smp-darussalam",
  storageBucket: "smp-darussalam.firebasestorage.app",
  messagingSenderId: "329755172871",
  appId: "1:329755172871:web:c01bf5f0b9f3d01d6ccaa2"
};

export const isValidConfig = () => Boolean(firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ==========================================
// ส่วนของการดึงข้อมูลการตั้งค่าเว็บไซต์
// ==========================================
export const getSettings = async () => {
  const docSnap = await getDoc(doc(db, 'settings', 'site'));
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveSettings = async (settings: any) => {
  await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
  return true;
};

export const subscribeToSettings = (callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'settings', 'site'), (doc) => {
    if (doc.exists()) callback(doc.data());
  });
};

// ==========================================
// 🚀 ระบบบีบอัดรูปภาพอัตโนมัติ
// ==========================================
const compressImage = async (file: File) => {
  // ตั้งค่าเครื่องบีบอัด
  const options = {
    maxSizeMB: 0.5, // บีบให้ไฟล์ไม่เกิน 500KB (ประหยัดพื้นที่มากๆ)
    maxWidthOrHeight: 1920, // ลดขนาดความกว้าง/ยาวสูงสุดไม่เกิน 1920px (ระดับ Full HD)
    useWebWorker: true, // ให้ประมวลผลเบื้องหลัง เว็บจะได้ไม่ค้าง
  };

  try {
    console.log(`ขนาดก่อนย่อ: ${file.size / 1024 / 1024} MB`);
    const compressedFile = await imageCompression(file, options);
    console.log(`ขนาดย่อแล้ว: ${compressedFile.size / 1024 / 1024} MB`);
    return compressedFile;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการย่อรูป:", error);
    return file; // ถ้าย่อไม่สำเร็จ ให้ส่งไฟล์ต้นฉบับขึ้นไปแทน
  }
};

// ==========================================
// ส่วนของการอัปโหลดรูปภาพ
// ==========================================
export const uploadImage = async (file: File, path: string) => {
  const compressedFile = await compressImage(file); // 👈 สั่งให้วิ่งผ่านเครื่องย่อรูปก่อน
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressedFile);
  return getDownloadURL(storageRef);
};

export const uploadLogo = (file: File) => uploadImage(file, `logos/${Date.now()}_${file.name}`);
export const uploadBanner = (file: File) => uploadImage(file, `banners/${Date.now()}_${file.name}`);
export const uploadStaffImage = (file: File) => uploadImage(file, `staff/${Date.now()}_${file.name}`);
export const uploadActivityImage = (file: File) => uploadImage(file, `activities/${Date.now()}_${file.name}`);

export const uploadMultipleImages = async (files: FileList | File[], folder: string) => {
  const promises = Array.from(files).map(file => uploadImage(file, `${folder}/${Date.now()}_${file.name}`));
  return Promise.all(promises);
};

export { app };