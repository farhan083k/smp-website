# คู่มือการตั้งค่า Firebase สำหรับ SMP Website

## ขั้นตอนที่ 1: สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Create a project" หรือ "Add project"
3. ตั้งชื่อโปรเจค เช่น `smp-darussalam`
4. ยอมรับข้อตกลงและคลิก "Continue"
5. รอสักครู่จนโปรเจกต์สร้างเสร็จ

## ขั้นตอนที่ 2: เพิ่มแอปเว็บ

1. ในหน้า Project Overview คลิกไอคอน `</>` (Web)
2. ตั้งชื่อแอป เช่น `smp-website`
3. คลิก "Register app"
4. **คัดลอกค่า Firebase configuration** ที่แสดงขึ้นมา

## ขั้นตอนที่ 3: แก้ไขไฟล์ firebase.ts

1. เปิดไฟล์ `src/lib/firebase.ts`
2. แก้ไขค่า `firebaseConfig` ด้วยค่าที่คัดลอกมา:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "smp-darussalam.firebaseapp.com",
  projectId: "smp-darussalam",
  storageBucket: "smp-darussalam.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## ขั้นตอนที่ 4: เปิดใช้งาน Firestore Database

1. ใน Firebase Console เลือก "Firestore Database" จากเมนูซ้าย
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับการทดสอบ)
4. เลือก location: `asia-southeast1` (Singapore) หรือ `asia-east2` (Hong Kong)
5. คลิก "Enable"

## ขั้นตอนที่ 5: เปิดใช้งาน Storage

1. ใน Firebase Console เลือก "Storage" จากเมนูซ้าย
2. คลิก "Get started"
3. เลือก "Start in test mode" (สำหรับการทดสอบ)
4. คลิก "Next"
5. เลือก location เดียวกับ Firestore
6. คลิก "Done"

## ขั้นตอนที่ 6: สร้าง Document เริ่มต้น

1. ไปที่ Firestore Database
2. คลิก "Start collection"
3. ใส่ Collection ID: `settings`
4. คลิก "Next"
5. ใส่ Document ID: `site`
6. เพิ่มฟิลด์ต่อไปนี้:
   - `programName` (string): "ห้องเรียนโปรแกรมวิทยาศาสตร์และคณิตศาสตร์"
   - `schoolName` (string): "โรงเรียนดารุสสาลาม ตันหยงมัส นราธิวาส"
   - `subtitle` (string): "Science and Mathematics Program (SMP)"
   - `logo` (string): "" (ว่างไว้)
   - `banner` (string): "" (ว่างไว้)
7. คลิก "Save"

## ขั้นตอนที่ 7: Build และ Deploy

```bash
cd /mnt/okcomputer/output/app
npm run build
```

## การใช้งาน

หลังจากตั้งค่า Firebase เสร็จ:

1. เข้าสู่ระบบ Admin ด้วยรหัสผ่าน `admin083`
2. คลิกปุ่ม "ตั้งค่า"
3. อัพโหลดโลโก้และแบนเนอร์
4. ข้อมูลจะถูกบันทึกไปยัง Firebase แบบ Realtime
5. ผู้ใช้ทุกคนจะเห็นการเปลี่ยนแปลงทันที

## หมายเหตุด้านความปลอดภัย

สำหรับการใช้งานจริง ควร:

1. **ตั้งค่า Security Rules** สำหรับ Firestore:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

2. **ตั้งค่า Security Rules** สำหรับ Storage:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. **เปิดใช้งาน Authentication** หากต้องการควบคุมการเข้าถึง

## การแก้ไขปัญหา

### หากข้อมูลไม่ซิงค์
- ตรวจสอบว่าใส่ค่า Firebase config ถูกต้อง
- ตรวจสอบ Firestore Database เปิดใช้งานแล้ว
- ดู Console ของเบราว์เซอร์เพื่อดู error

### หากอัพโหลดรูปไม่ได้
- ตรวจสอบว่า Storage เปิดใช้งานแล้ว
- ตรวจสอบขนาดไฟล์ไม่เกิน 5MB
- ตรวจสอบรูปแบบไฟล์ (JPG, PNG, GIF)

## ติดต่อสอบถาม

หากมีปัญหาในการตั้งค่า สามารถติดต่อผู้พัฒนาได้
