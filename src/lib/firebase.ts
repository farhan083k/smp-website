import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6PRh-hPF7vGdZUvVn8JOqOq3o4lQvXqA",
  authDomain: "smp-darussalam.firebaseapp.com",
  projectId: "smp-darussalam",
  storageBucket: "smp-darussalam.firebasestorage.app",
  messagingSenderId: "329755172871",
  appId: "1:329755172871:web:c01bf5f0b9f3d01d6ccaa2"
};

// 🔴 แก้ไข Error TS2305: ตรวจสอบว่า Config ถูกต้องหรือไม่
export const isValidConfig = () => Boolean(firebaseConfig.apiKey);

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 3. Export กุญแจสำคัญสำหรับใช้งานในส่วนต่างๆ
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { app };

/** * ==========================================
 * FIRESTORE FUNCTIONS (จัดการข้อมูลตัวอักษร)
 * ==========================================
 */

// ดึงข้อมูลการตั้งค่าเว็บไซต์ (ชื่อโรงเรียน, โลโก้, แบนเนอร์)
export const getSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// บันทึกการตั้งค่าเว็บไซต์
export const saveSettings = async (settings: any) => {
  try {
    const docRef = doc(db, 'settings', 'site');
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// ติดตามการเปลี่ยนแปลงข้อมูลแบบ Real-time
export const subscribeToSettings = (callback: (data: any) => void) => {
  const docRef = doc(db, 'settings', 'site');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  }, (error) => {
    console.error('Error subscribing to settings:', error);
  });
};

/** * ==========================================
 * STORAGE FUNCTIONS (จัดการไฟล์รูปภาพ)
 * ==========================================
 */

// ฟังก์ชันกลางสำหรับอัปโหลดรูปภาพ
export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// เฉพาะทาง: อัปโหลดโลโก้
export const uploadLogo = async (file: File): Promise<string | null> => {
  return uploadImage(file, `logos/${Date.now()}_${file.name}`);
};

// เฉพาะทาง: อัปโหลดแบนเนอร์
export const uploadBanner = async (file: File): Promise<string | null> => {
  return uploadImage(file, `banners/${Date.now()}_${file.name}`);
};

// เฉพาะทาง: อัปโหลดรูปกิจกรรม
export const uploadActivityImage = async (file: File): Promise<string | null> => {
  return uploadImage(file, `activities/${Date.now()}_${file.name}`);
};

// เฉพาะทาง: อัปโหลดรูปบุคลากร
export const uploadStaffImage = async (file: File): Promise<string | null> => {
  return uploadImage(file, `staff/${Date.now()}_${file.name}`);
};
