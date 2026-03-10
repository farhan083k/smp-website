// Firebase Configuration
// ผู้ใช้ต้องแก้ไขค่าเหล่านี้หลังจากสร้าง Firebase Project

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// TODO: แก้ไขค่าเหล่านี้หลังจากสร้าง Firebase Project
// วิธีการ:
// 1. ไปที่ https://console.firebase.google.com/
// 2. สร้างโปรเจคใหม่
// 3. เพิ่มแอปเว็บ
// 4. คัดลอกค่า configuration มาใส่ที่นี่
const firebaseConfig = {
  apiKey: "AIzaSyC6PRh-hPF7vGdZUvVn8JOqOq3o4lQvXqA",
  authDomain: "smp-darussalam.firebaseapp.com",
  projectId: "smp-darussalam",
  storageBucket: "smp-darussalam.firebasestorage.app",
  messagingSenderId: "329755172871",
  appId: "1:329755172871:web:c01bf5f0b9f3d01d6ccaa2"
};
// ตัวอย่างค่าที่ต้องใส่ (หลังจากสร้าง Firebase Project):
// const firebaseConfig = {
//   apiKey: "AIzaSyB...",
//   authDomain: "smp-darussalam.firebaseapp.com",
//   projectId: "smp-darussalam",
//   storageBucket: "smp-darussalam.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abcdef123456"
// };

// Check if Firebase config is valid
const isValidConfig = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

let app: any = null;
let db: any = null;
let storage: any = null;

if (isValidConfig()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase not configured. Please update firebase.ts with your config.');
}

export { app, db, storage, isValidConfig };

// Firestore functions
export const getSettings = async () => {
  if (!db) return null;
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

export const saveSettings = async (settings: any) => {
  if (!db) return false;
  try {
    const docRef = doc(db, 'settings', 'site');
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const subscribeToSettings = (callback: (data: any) => void) => {
  if (!db) {
    console.warn('Firebase not configured, using localStorage only');
    return () => {};
  }
  
  const docRef = doc(db, 'settings', 'site');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  }, (error) => {
    console.error('Error subscribing to settings:', error);
  });
};

// Storage functions
export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  if (!storage) return null;
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

export const uploadLogo = async (file: File): Promise<string | null> => {
  return uploadImage(file, `logos/${Date.now()}_${file.name}`);
};

export const uploadBanner = async (file: File): Promise<string | null> => {
  return uploadImage(file, `banners/${Date.now()}_${file.name}`);
};
