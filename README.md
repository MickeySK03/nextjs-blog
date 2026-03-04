# CMS Project

ระบบจัดการเว็บไซต์พร้อม Admin Panel สร้างด้วย Next.js, Prisma ORM และ MySQL

## 🏗️ โครงสร้างโปรเจค

```
src/
├── app/
│   ├── (frontend)/          # หน้าบ้าน (Public)
│   │   ├── page.tsx         # หน้าแรก (แสดง Banners + Contents)
│   │   └── blog/
│   │       ├── page.tsx     # รายการบทความ
│   │       └── [slug]/page.tsx  # บทความเดี่ยว
│   ├── admin/               # หลังบ้าน (Protected)
│   │   ├── login/           # หน้า Login
│   │   ├── dashboard/       # Dashboard
│   │   ├── users/           # จัดการ Users
│   │   ├── roles/           # จัดการ Roles
│   │   ├── banners/         # จัดการ Banners
│   │   └── contents/        # จัดการ Contents
│   └── api/
│       ├── auth/            # NextAuth
│       ├── admin/           # API (Protected)
│       │   ├── banners/
│       │   ├── contents/
│       │   └── users/
│       └── public/          # API (Public)
│           ├── banners/
│           └── contents/
├── components/
│   ├── admin/               # Admin components
│   └── providers/           # Providers
└── lib/
    ├── prisma.ts            # Prisma client
    └── auth.ts              # NextAuth config
```

## 🚀 Getting Started

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment
```bash
cp .env.example .env
# แก้ไข DATABASE_URL และ NEXTAUTH_SECRET
```

### 3. สร้าง Database และ Migrate
```bash
npm run db:migrate
```

### 4. Seed ข้อมูลเริ่มต้น
```bash
npm run db:seed
```

### 5. รัน Development Server
```bash
npm run dev
```

## 🔑 Default Accounts

| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@example.com   | admin123   |
| Editor | editor@example.com  | editor123  |

## 📋 Features

### หลังบ้าน (/admin)
- **Dashboard**: สรุปข้อมูลสถิติ
- **Users**: จัดการผู้ใช้งาน (Admin only)
- **Roles**: จัดการ Role และ Permissions
- **Banners**: จัดการ Banner แต่ละตำแหน่ง (HOME_TOP, HOME_MIDDLE, HOME_BOTTOM, SIDEBAR)
- **Contents**: จัดการบทความ (DRAFT, PUBLISHED, ARCHIVED)
- **Categories**: จัดการหมวดหมู่
- **Media**: จัดการไฟล์

### หน้าบ้าน (/)
- **Home**: แสดง Banners + Featured Contents + Latest Contents
- **Blog**: รายการบทความทั้งหมด
- **Blog Detail**: อ่านบทความ

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MySQL
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Language**: TypeScript

## 📡 API Endpoints

### Public (ไม่ต้อง Auth)
- `GET /api/public/banners` - ดึง Active Banners (filter ด้วย ?position=HOME_TOP)
- `GET /api/public/contents` - ดึง Published Contents
- `GET /api/public/contents/:slug` - ดึง Content เดี่ยว

### Admin (ต้อง Auth)
- `GET/POST /api/admin/banners` - จัดการ Banners
- `GET/PUT/DELETE /api/admin/banners/:id`
- `GET/POST /api/admin/contents` - จัดการ Contents
- `GET/POST /api/admin/users` - จัดการ Users

## 🗄️ Database Schema

- **User** → Role (many-to-one)
- **Role** → Permission (one-to-many)
- **Banner** (position, isActive, sortOrder, startDate, endDate)
- **Content** → Category (many-to-one), Tag (many-to-many)
- **Media** (file management)
