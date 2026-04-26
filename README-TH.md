# Akrivis DocsHub - Deploy Package

ระบบศูนย์รวมคู่มือองค์กร พร้อมหน้า Admin CMS สำหรับเพิ่ม/แก้ไข/ลบคู่มือ บันทึกข้อมูลด้วย Firebase Firestore

## ฟีเจอร์

- หน้าแรกค้นหาคู่มือ
- หน้าอ่านคู่มือพร้อมสารบัญ
- ค้นหาภายในคู่มือ
- พิมพ์เฉพาะหน้า / พิมพ์ทั้งเล่ม
- Admin Login ด้วย Firebase Authentication
- เพิ่ม / แก้ไข / ลบคู่มือ
- เพิ่ม / แก้ไข / ลบ / เรียงบท
- Draft / Published
- Role: admin, editor, viewer
- Audit Log
- DOMPurify ป้องกัน HTML อันตราย

## วิธีติดตั้งบน Windows / Laragon

แตกไฟล์ zip ไปไว้ที่:

```bash
C:\laragon\www\akrivis-docshub
```

เข้าโฟลเดอร์โปรเจกต์:

```bash
cd C:\laragon\www\akrivis-docshub
```

ติดตั้ง package:

```bash
npm install
```

คัดลอกไฟล์ env:

```bash
copy .env.example .env
```

แก้ไฟล์ `.env` ให้ตรงกับ Firebase project ของคุณ

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_ID=akrivis-docs
```

รัน development:

```bash
npm run dev
```

เปิดเว็บ:

```txt
http://localhost:5173
```

## Build Production

```bash
npm run build
```

ไฟล์ production จะอยู่ในโฟลเดอร์:

```txt
dist
```

ทดลอง preview production:

```bash
npm run preview
```

## ตั้งค่า Firebase

1. เข้า Firebase Console
2. สร้าง Project
3. เปิด Authentication > Sign-in method > Email/Password
4. เพิ่ม user เช่น `admin@akrivis.app`
5. เปิด Firestore Database
6. นำ rules จากไฟล์ `firestore.rules` ไปวางใน Firestore Rules

## ตั้งค่า role admin ครั้งแรก

หลัง login ครั้งแรก ระบบจะสร้าง user profile เป็น `viewer` ก่อน ให้ไปที่ Firestore:

```txt
users/{uid}
```

แก้ field:

```json
{
  "role": "admin",
  "active": true
}
```

จากนั้น logout/login ใหม่ จะมีสิทธิ์ admin

## Deploy static hosting

หลัง `npm run build` สามารถนำโฟลเดอร์ `dist` ไป deploy ได้ เช่น:

- Firebase Hosting
- Netlify
- Vercel
- Apache / Nginx static web

ถ้าใช้ Apache ให้ชี้ DocumentRoot ไปที่โฟลเดอร์ `dist`

## หมายเหตุสำคัญ

- ห้าม commit ไฟล์ `.env` ขึ้น public repository
- Public user อ่านคู่มือที่ Published ได้
- Admin/Editor แก้ไขคู่มือได้
- Admin ลบคู่มือได้
