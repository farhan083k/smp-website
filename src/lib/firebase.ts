import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC6PRh-hPF7vGdZUvVn8JOqOq3o4lQvXqA",
  authDomain: "smp-darussalam.firebaseapp.com",
  projectId: "smp-darussalam",
  storageBucket: "smp-darussalam.firebasestorage.app",
  messagingSenderId: "329755172871",
  appId: "1:329755172871:web:c01bf5f0b9f3d01d6ccaa2"
};

// ✅ แก้ Error TS2349: ทำให้เรียกใช้งานเป็นฟังก์ชันได้
export const isValidConfig = () => Boolean(firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/** * ฟังก์ชันอัปโหลดหลายรูปพร้อมกัน (รองรับสูงสุด 50 รูป)
 */
export const uploadMultipleImages = async (files: FileList | File[], folder: string): Promise<string[]> => {
  const uploadPromises = Array.from(files).map(async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });
  return Promise.all(uploadPromises);
};

export const uploadStaffImage = async (file: File) => {
  const storageRef = ref(storage, `staff/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const uploadActivityImage = async (file: File) => {
  const storageRef = ref(storage, `activities/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export { app };