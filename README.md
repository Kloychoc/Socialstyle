# Payso Social Style

แบบทดสอบ Social Style 30 ข้อ พร้อมแผนที่ทีม สำหรับทีม Sales & Marketing

| ไฟล์ | หน้าที่ |
|---|---|
| `public/index.html` | หน้าเว็บ มี 2 แท็บ คือแบบทดสอบและแผนที่ทีม |
| `public/questions.js` | คำถามและวิธีคิดคะแนน ใช้ร่วมกันทั้งหน้าเว็บและ server |
| `public/map-layout.js` | คำนวณตำแหน่งจุดบนแผนที่ (มีชุดทดสอบด้วย `npm test`) |
| `server.js` | Express server เก็บข้อมูลใน Postgres ถ้ามี `DATABASE_URL` ถ้าไม่มีจะเก็บเป็นไฟล์ในเครื่อง |

## Deploy บน Railway

1. **New Project → Deploy from GitHub repo** แล้วเลือก repo **Socialstyle**
2. ในโปรเจกต์เดียวกัน กด **+ New → Database → PostgreSQL**
3. เข้า service ของแอป ไปที่ **Variables** แล้วเพิ่ม:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (ถ้า service ฐานข้อมูลตั้งชื่ออื่นไว้ ให้เปลี่ยนคำว่า `Postgres` เป็นชื่อนั้น)
   - `ACCESS_CODE` = รหัสทีม (แนะนำให้ตั้ง เพราะแผนที่ทีมแสดงชื่อคน)
4. ไปที่ **Settings → Networking** แล้วกด **Generate Domain**
5. เปิด `https://<โดเมน>/api/health` ถ้าเห็น `"database":"connected"` แปลว่าพร้อมใช้ ส่งลิงก์หน้าแรกให้ทีมได้เลย

ตาราง `results` ระบบจะสร้างให้เองตอนใช้งานครั้งแรก

### ถ้า `/api/health` ไม่ขึ้น connected

| สิ่งที่เห็น | แปลว่า | วิธีแก้ |
|---|---|---|
| `"storage":"file"` | ยังไม่ได้ตั้ง `DATABASE_URL` | กลับไปทำข้อ 3 |
| `"database":"error: ..."` | ตั้งตัวแปรแล้ว แต่ต่อฐานข้อมูลไม่ติด | เช็กชื่อ service ใน `${{...}}` ว่าตรงกับ service ฐานข้อมูลไหม แล้ว Redeploy |
| error เรื่อง SSL | ตั้งค่า SSL ไม่ตรงกับฐานข้อมูล | ปกติต่อผ่าน `*.railway.internal` จะไม่ใช้ SSL ถ้าเจอ error นี้ให้ลองตั้ง `PGSSL=true` หรือ `PGSSL=false` |

## รันในเครื่อง

```bash
npm install
ACCESS_CODE=test npm start   # เปิด http://localhost:3000
npm test                     # ตรวจว่าจุดบนแผนที่อยู่ถูกช่อง
```

## หมายเหตุ

- **การจำตัวตน:** ระบบจำแต่ละคนด้วยรหัสที่เก็บไว้ในเบราว์เซอร์ ทำซ้ำในเบราว์เซอร์เดิมจะอัปเดตผลเดิม แต่ถ้าเปลี่ยนเครื่องหรือเบราว์เซอร์ ระบบจะนับเป็นคนใหม่
- **สิ่งที่ทีมเห็น:** คนอื่นเห็นแค่ชื่อ ทีม และสไตล์ ส่วนคำตอบรายข้อเก็บไว้ที่ server เท่านั้น
- **ลบผลที่ไม่ต้องการ:** ต่อเข้า Postgres แล้วรัน `DELETE FROM results WHERE name = 'ชื่อ';`
