# Payso Social Style

แบบทดสอบ Social Style 30 ข้อ พร้อมแผนที่ทีม สำหรับทีม Sales & Marketing

- `public/index.html` หน้าเว็บ มี 2 แท็บ คือแบบทดสอบและแผนที่ทีม
- `public/questions.js` คำถามและวิธีคิดคะแนน ใช้ร่วมกันทั้งหน้าเว็บและ server
- `server.js` Express server
  - เก็บข้อมูลใน Postgres เมื่อมีตัวแปร `DATABASE_URL`
  - ถ้าไม่มีตัวแปรนี้ จะเก็บเป็นไฟล์ `data/results.json` (ใช้ตอนทดสอบในเครื่อง)

## Deploy บน Railway

1. อัปโหลดโฟลเดอร์นี้ขึ้น GitHub repo
2. ใน Railway กด **New Project** แล้วเลือก **Deploy from GitHub repo** จากนั้นเลือก repo นี้
3. ในโปรเจกต์เดียวกัน กด **+ New** แล้วเลือก **Database → PostgreSQL**
4. เข้าไปที่ service ของแอป เปิด **Variables** แล้วเพิ่มตัวแปร 2 ตัว
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (ถ้าตั้งชื่อ service ของ Postgres เป็นอย่างอื่น ให้เปลี่ยนคำว่า `Postgres` เป็นชื่อนั้น)
   - `ACCESS_CODE` = รหัสทีม เช่น `payso2026` (แนะนำให้ตั้ง เพราะหน้าแผนที่ทีมแสดงชื่อคน ถ้าไม่ตั้ง ใครมีลิงก์ก็เข้าดูได้)
5. ไปที่ **Settings → Networking** แล้วกด **Generate Domain** เพื่อสร้างลิงก์สำหรับส่งให้ทีม

ตาราง `results` จะถูกสร้างให้อัตโนมัติตอนแอปเริ่มทำงาน

## รันในเครื่อง

```bash
npm install
ACCESS_CODE=test npm start   # เปิด http://localhost:3000
```

## หมายเหตุ

- **การจำตัวตน:** แต่ละคนถูกจำด้วยรหัสที่เก็บไว้ในเบราว์เซอร์ ถ้าทำใหม่ในเบราว์เซอร์เดิม ระบบจะอัปเดตผลเดิม แต่ถ้าเปลี่ยนเครื่องหรือเปลี่ยนเบราว์เซอร์ ระบบจะนับเป็นคนใหม่
- **ข้อมูลที่ทีมเห็น:** คนอื่นเห็นแค่ชื่อ ทีม และสไตล์ คำตอบรายข้อเก็บไว้ที่ server เท่านั้น
- **ลบผลที่ไม่ต้องการ:** ต่อ Postgres แล้วรัน `DELETE FROM results WHERE name = 'ชื่อ';`
- **ตัวแปร `PGSSL`:** ตั้ง `PGSSL=true` เฉพาะกรณีต่อฐานข้อมูลผ่าน public URL ที่บังคับใช้ SSL
