# Task Management App

Sebuah aplikasi manajemen tugas dengan fitur CRUD lengkap, autentikasi pengguna, dan komunikasi API antara backend Laravel dan frontend React.

## 🧱 Stack yang Digunakan

- **Backend:** Laravel 10 + Sanctum (untuk JWT Auth)
- **Frontend:** React.js + Axios + TailwindCSS
- **Database:** MySQL
- **Authentication:** Laravel Sanctum
- **API Communication:** RESTful API

---

## 🚀 Fitur Utama

- Register & Login (JWT-based authentication)
- CRUD Board, List, dan Task
- Hirarki: Board > Task List > Task
- Upload file opsional pada Task
- Tampilan dashboard interaktif
- Dokumentasi API rapi
- Modular coding & struktur clean

---

## ⚙️ Cara Setup

### 1. Clone Repositori

```bash
git clone https://github.com/ergavrndr/task-management.git
cd task-management-app
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Pastikan backend berjalan di `http://localhost:8000` dan frontend di `http://localhost:5173` (default Vite).

---

## 🔐 Test Credential

Gunakan akun berikut untuk login saat testing:

```text
Email: test@gmail.com
Password: 123456
```

---

## 🧪 Contoh `.env` Backend

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:zjAUU1JBucIKsI+Q8RCFUJqTCVJWysVrlbxNbdMHt+s=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_db
DB_USERNAME=root
DB_PASSWORD=
```

---

## 🗃️ Struktur Folder

task-management
/backend
  ├── app/
  │   ├── Http/
  │   ├── Models/
  │   └── Providers/
  ├── bootstrap/
  ├── config/
  ├── database/
  ├── public/
  ├── resources/
  ├── routes/
  │   ├── api.php
  │   ├── web.php
  │   └── console.php
  ├── storage/
  ├── tests/
  ├── vendor/
  ├── .env
  ├── .env.example
  └── artisan

/frontend
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.cjs
```