# 🚀 gogo - Personal Productivity Dashboard

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Tugas Akhir Pemrograman Web** - Solusi untuk mengatasi "Productivity Illusion"

---

## 📋 Deskripsi Project

**gogo** adalah aplikasi web produktivitas personal yang membantu pengguna merencanakan hari mereka dengan lebih efektif, melacak kebiasaan, dan mendapatkan insight tentang produktivitas mereka melalui AI coaching dan visualisasi heatmap.

### 🎯 Problem Statement

Banyak orang merasa sibuk sepanjang hari tetapi tidak merasa produktif. Mereka kesulitan:
- Mengatur waktu dengan efektif
- Membangun kebiasaan konsisten
- Melacak progres jangka panjang
- Mendapat feedback tentang produktivitas mereka

### 💡 Solution Overview

gogo menyediakan solusi all-in-one dengan:
1. **Smart Daily Scheduler** - Time-blocking dengan deteksi konflik otomatis
2. **Habit Chain Tracker** - Sistem streak untuk membangun konsistensi
3. **Productivity Heatmap** - Visualisasi 365 hari produktivitas Anda
4. **AI Daily Coach** - Feedback personal berdasarkan performa harian

---

## 🛠️ Tech Stack

### Frontend
- **React 18** dengan TypeScript
- **Vite** - Build tool modern & cepat
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client
- **React Calendar Heatmap** - GitHub-style heatmap visualization

### Backend
- **Node.js** dengan Express.js
- **TypeScript** - Type-safe JavaScript
- **MongoDB** dengan Mongoose - NoSQL database
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

---

## ✨ Fitur Utama

### 1. Authentication System
- ✅ Register dengan username, email, password
- ✅ Login dengan JWT token (expires 7 days)
- ✅ Password di-hash menggunakan bcrypt (salt rounds: 10)
- ✅ Token disimpan di localStorage
- ✅ Auto-redirect jika tidak authenticated

### 2. Smart Daily Scheduler
- ✅ Create tasks dengan time-blocking (HH:MM format)
- ✅ Custom categories (BUKAN enum, user input sendiri!)
- ✅ Deteksi konflik waktu otomatis
- ✅ Upload & attach files (PDF, images, documents)
- ✅ Mark tasks sebagai completed
- ✅ Update & delete tasks
- ✅ Filter by date

### 3. Habit Chain Tracker
- ✅ 5 default habits saat register:
  - 💧 Drink Water
  - 📚 Read 15 Minutes
  - 😴 Sleep 7 Hours
  - 🧹 Tidy Up
  - ✨ Custom Habit
- ✅ Add custom habits dengan emoji
- ✅ Streak counter dengan 🔥 emoji
- ✅ Streak logic: cek yesterday's log sebelum update
- ✅ Toggle completion per hari
- ✅ Streak reset jika miss a day

### 4. Productivity Heatmap
- ✅ GitHub-style heatmap visualization
- ✅ Aggregate 365 hari terakhir
- ✅ Color intensity berdasarkan activity:
  - Gray: 0 activities
  - Light green: 1-2 activities
  - Medium green: 3-5 activities
  - Dark green: 6+ activities
- ✅ Hover tooltip: "X tasks, Y habits completed"

### 5. AI Daily Coach
- ✅ "End Day" button untuk generate review
- ✅ Productivity score calculation:
  - 60% dari completed tasks
  - 40% dari completed habits
- ✅ Rule-based AI comment (fallback)
- ✅ Skor 0-100 dengan feedback motivational
- ✅ Store review di database

### 6. Dark Mode
- ✅ Toggle di navbar
- ✅ Persist di localStorage
- ✅ Sync dengan database (user.darkMode)
- ✅ Smooth transition animations

### 7. History Page
- ✅ List semua daily reviews
- ✅ Sort by date (newest first)
- ✅ Display score, tasks, habits stats
- ✅ Show AI comment untuk setiap review

---

## 📁 Struktur Project

```
gogo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts       # MongoDB connection
│   │   │   └── multer.ts         # GridFS storage config
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT authentication
│   │   ├── models/
│   │   │   ├── User.ts           # User schema
│   │   │   ├── Task.ts           # Task schema
│   │   │   ├── Habit.ts          # Habit schema
│   │   │   └── DailyReview.ts    # Review schema
│   │   ├── routes/
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── tasks.ts          # Task CRUD
│   │   │   ├── habits.ts         # Habit CRUD
│   │   │   ├── reviews.ts        # Review & heatmap
│   │   │   └── upload.ts         # GridFS file upload
│   │   └── server.ts             # Express app
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🚀 Cara Menjalankan Project

### Prerequisites
- Node.js (v18 atau lebih baru)
- MongoDB (lokal atau MongoDB Atlas)
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd gogo
```

### 2. Setup Backend

```bash
cd backend
npm install
```

**Buat file `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gogo
JWT_SECRET=your-super-secret-jwt-key-change-this
OPENAI_API_KEY=optional-for-ai-coach
FRONTEND_URL=http://localhost:5173
```

**Jalankan MongoDB:**
```bash
# Jika menggunakan MongoDB lokal:
mongod

# Atau gunakan MongoDB Atlas (cloud)
```

**Start Backend Server:**
```bash
npm run dev
```

Server akan running di `http://localhost:5000`

### 3. Setup Frontend

**Buka terminal baru:**
```bash
cd frontend
npm install
```

**Buat file `.env` (optional):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```bash
npm run dev
```

Frontend akan running di `http://localhost:5173`

### 4. Buka Aplikasi

Akses aplikasi di browser:
```
http://localhost:5173
```

---

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/dark-mode` | Update dark mode preference |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?date=YYYY-MM-DD` | Get tasks for date |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all user habits |
| POST | `/api/habits` | Create new habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| PATCH | `/api/habits/:id/toggle` | Toggle habit today |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews/end-day` | Create daily review |
| GET | `/api/reviews` | Get all reviews |
| GET | `/api/reviews/heatmap` | Get heatmap data |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/single` | Upload single file |
| POST | `/api/upload/multiple` | Upload multiple files |

---

## 🎨 UI/UX Design

### Color Palette

**Light Mode:**
- Background: `bg-gray-50`
- Cards: `bg-white`
- Text: `text-gray-900`
- Primary: `bg-blue-600 hover:bg-blue-700`
- Success: `bg-green-600`
- Warning: `bg-yellow-500`
- Danger: `bg-red-600`

**Dark Mode:**
- Background: `bg-gray-900`
- Cards: `bg-gray-800`
- Text: `text-gray-100`
- Primary: `bg-blue-500 hover:bg-blue-600`
- Success: `bg-green-500`
- Warning: `bg-yellow-400`
- Danger: `bg-red-500`

### Navigation
- Sidebar: Fixed left side with 4 menu items
- Active state: Blue background dengan icon color
- Smooth transitions pada hover
- Responsive: Collapsible pada mobile

### Modals
- Backdrop blur effect
- Smooth fade-in animation (300ms)
- Close dengan ESC key atau click outside
- Validation errors ditampilkan inline

---

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  username: string (unique, 3-30 chars),
  email: string (unique, valid email),
  password: string (hashed dengan bcrypt),
  darkMode: boolean,
  createdAt: Date
}
```

### Tasks Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: string (required, max 200 chars),
  description: string (max 1000 chars),
  category: string (custom input, max 50 chars),
  startTime: string (HH:MM format),
  endTime: string (HH:MM format),
  date: Date,
  completed: boolean,
  attachments: [string],
  createdAt: Date
}
```

### Habits Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: string (required, max 100 chars),
  emoji: string,
  currentStreak: number (min 0),
  logs: [{
    date: Date,
    completed: boolean
  }],
  createdAt: Date
}
```

### DailyReviews Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  date: Date (unique per user per day),
  tasksCompleted: number,
  tasksTotal: number,
  habitsCompleted: number,
  habitsTotal: number,
  productivityScore: number (0-100),
  aiComment: string (max 1000 chars),
  createdAt: Date
}
```

---

## 🔒 Security Features

1. **Password Security**
   - Hashed dengan bcrypt (10 salt rounds)
   - Never stored in plain text
   - Validated minimal 6 characters

2. **JWT Authentication**
   - Token expires in 7 days
   - Stored in localStorage (frontend)
   - Verified pada setiap protected route

3. **Authorization**
   - Middleware checks userId dari token
   - Users hanya bisa akses data mereka sendiri
   - 401 Unauthorized jika token invalid/expired

4. **Input Validation**
   - Frontend: Form validation sebelum submit
   - Backend: Mongoose schema validation
   - XSS prevention dengan proper escaping

5. **File Upload Security**
   - Only allowed file types (images, PDFs, docs)
   - Max file size: 5MB
   - Unique filenames untuk prevent overwrite

---

## 🎯 User Journey

### Hari Pertama (Onboarding)
1. User register dengan username, email, password
2. System otomatis create 5 default habits
3. User explore dashboard dan fitur-fitur
4. User create task pertama untuk hari ini/besok
5. User toggle habits yang sudah completed

### Daily Routine
**Pagi:**
1. Login ke aplikasi
2. Check scheduler untuk tasks hari ini
3. Review habits yang perlu completed

**Siang - Sore:**
4. Toggle tasks ketika completed
5. Check off habits ketika done
6. Upload files ke tasks jika perlu

**Malam:**
7. Review semua tasks & habits
8. Click "End Day" button
9. Baca AI feedback & productivity score
10. Plan tasks untuk besok

### Long-term
- Habits streaks bertambah setiap hari
- Heatmap mulai menunjukkan pola produktivitas
- History page menampilkan progress over time
- User adjust routine based on insights

---

## 🐛 Known Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:**
- Pastikan MongoDB sudah running
- Check MONGODB_URI di `.env` file
- Untuk MongoDB Atlas, pastikan IP address di-whitelist

### Issue: CORS Error
**Solution:**
- Pastikan `FRONTEND_URL` di backend `.env` match dengan frontend URL
- Check CORS middleware configuration

### Issue: Token Expired
**Solution:**
- User harus login ulang
- Token auto-refresh bisa ditambahkan di future update

### Issue: File Upload Gagal
**Solution:**
- Check folder `backend/uploads/` exists dan writable
- Verify file type dan size sesuai limit

---

## 🚀 Future Enhancements

1. **OpenAI Integration** - Real AI coaching dengan GPT-4
2. **Email Notifications** - Daily reminders & weekly reports
3. **Team Collaboration** - Share tasks & habits dengan team
4. **Mobile App** - React Native version
5. **Data Export** - Export data ke PDF/CSV
6. **Goals System** - Long-term goal tracking
7. **Pomodoro Timer** - Built-in focus timer
8. **Social Features** - Friend leaderboards
9. **Analytics Dashboard** - Advanced productivity metrics
10. **Integrations** - Calendar sync, Slack notifications

---

## 👨‍💻 Developer

**Nama:** Ahmad Rafi Fadhillah Dwiputra 

**NRP:** 5027241068

**Kelas:** B 

**Mata Kuliah:** Pemrograman Web

---

## 🙏 Acknowledgments

- **React** - UI library
- **Tailwind CSS** - Styling framework
- **MongoDB** - Database
- **Express.js** - Backend framework
- **Lucide Icons** - Beautiful icons
- **GitHub Contribution Graph** - Inspiration untuk heatmap

---

**by tanmachi**
