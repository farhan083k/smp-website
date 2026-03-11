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

// ✅ แก้ Error TS2349
export const isValidConfig = () => Boolean(firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/** * ฟังก์ชันจัดการ Settings (แก้ Error TS2305 ใน SettingsContext)
 */
export const getSettings = async () => {
  const docSnap = await getDoc(doc(db, 'settings', 'site'));
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveSettings = async (settings: any) => {
  await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
  return true; // 👈 เติมบรรทัดนี้เข้าไปเพื่อให้ Context รู้ว่าบันทึกเสร็จแล้ว
};

export const subscribeToSettings = (callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'settings', 'site'), (doc) => {
    if (doc.exists()) callback(doc.data());
  });
};

/** * ฟังก์ชันอัปโหลดรูปภาพ (แก้ Error TS2305 ใน AdminSettings)
 */
export const uploadImage = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
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