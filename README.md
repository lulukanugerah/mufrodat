# Mufrodat Kids

Aplikasi pembelajaran kosakata Bahasa Arab untuk siswa kelas III SD/MI. Siswa dapat belajar melalui kartu kosakata, audio pelafalan, dan permainan menjodohkan. Guru mengelola materi melalui dashboard admin.

## Fitur MVP

- Beranda dan halaman materi yang responsif.
- Kategori mufrodat dan kartu kosakata Arab berharakat.
- Audio dari file yang diunggah; jika audio belum tersedia, browser mencoba menggunakan Speech Synthesis bahasa Arab.
- Matching game berbasis klik yang nyaman digunakan di HP dan laptop.
- Skor, jumlah kesalahan, durasi, dan riwayat permainan.
- Siswa menggunakan guest session, tanpa email atau password.
- Login admin/guru melalui Supabase Auth.
- Pengelolaan kategori dan kosakata: tambah, edit, dan hapus kosakata; tambah dan edit kategori; membuat/memperbarui serta menghapus permainan.
- Supabase PostgreSQL, Storage, dan Row Level Security.
- Mode demo tanpa Supabase untuk mencoba tampilan dan permainan. Hasil demo hanya tersimpan di browser.

## Teknologi

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase PostgreSQL, Auth, Storage, dan RLS
- Vercel untuk deployment

## 1. Persyaratan

- Node.js 20.9 atau lebih baru.
- npm.
- Akun Supabase.
- Akun GitHub dan Vercel untuk deployment.

## 2. Jalankan aplikasi secara lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Di Windows PowerShell, gunakan `Copy-Item .env.example .env.local` untuk menyalin file environment.

Buka `http://localhost:3000`.

Jika variabel Supabase belum diisi, aplikasi berjalan dalam **mode demo** menggunakan data contoh. Permainan dapat dicoba, tetapi hasilnya hanya disimpan di `localStorage` browser.

## 3. Konfigurasi Supabase

1. Buat project baru di Supabase.
2. Buka **Project Settings → API**.
3. Salin Project URL dan publishable key ke `.env.local`.
4. Salin service role key ke variabel `SUPABASE_SERVICE_ROLE_KEY`. Key ini hanya untuk server dan tidak boleh memakai awalan `NEXT_PUBLIC_`.
5. Buka **SQL Editor** di Supabase.
6. Jalankan isi file `supabase/migrations/202611060001_initial_schema.sql`.
7. Jalankan isi file `supabase/seed.sql` untuk memasukkan tiga kategori dan 18 kosakata contoh.
8. Buat akun admin di **Authentication → Users → Add user**.
9. Setelah akun dibuat, jalankan SQL berikut dengan mengganti email dan nama admin:

```sql
insert into public.admin_profiles (user_id, display_name)
select id, 'Guru Mufrodat'
from auth.users
where email = 'admin@contoh.com'
on conflict (user_id) do update
set display_name = excluded.display_name;
```

10. Pastikan bucket `mufrodat-media` muncul di **Storage**. Migration membuat bucket publik untuk membaca media dan membatasi upload/hapus hanya untuk admin.

### Variabel environment

Isi `.env.local` seperti berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Setelah mengubah `.env.local`, restart development server.

## 4. Login admin

Buka `http://localhost:3000/admin/login`, lalu masuk menggunakan email dan password yang dibuat di Supabase Auth. Akun hanya dapat membuka dashboard setelah `user_id`-nya tercatat di tabel `admin_profiles`.

Di dashboard admin, guru dapat:

- Menambah kategori.
- Menambah kosakata Arab, transliterasi, arti, emoji, gambar, dan audio.
- Membuat atau memperbarui permainan untuk suatu kategori.
- Menghapus kosakata dan permainan.
- Melihat aktivitas permainan terbaru.

Untuk membuat permainan, tambahkan kosakata ke kategori terlebih dahulu. Sistem akan memasukkan semua kosakata aktif pada kategori tersebut ke matching game.

## 5. Alur siswa

1. Siswa membuka halaman **Materi** atau **Permainan**.
2. Siswa memilih kategori atau matching game.
3. Siswa mengisi nama panggilan. Tidak ada email atau password.
4. Siswa memilih satu gambar lalu memilih kosakata Arab yang sesuai.
5. Backend memvalidasi pasangan jawaban dari database, menghitung skor, dan menyimpan hasil.

Pada mode Supabase, server membuat guest session dan mengirim token acak kepada browser. Database hanya menyimpan hash token. Pengiriman skor dilakukan melalui Next.js Route Handler yang memvalidasi token dan menghitung skor berdasarkan data soal di database. Jangan mengizinkan browser menulis langsung ke tabel `guest_sessions`, `attempts`, atau `attempt_answers`.

## 6. Struktur proyek

```text
mufrodat-kids/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/guest/
│   │   ├── materi/
│   │   ├── permainan/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.example
├── proxy.ts
└── package.json
```

## 7. Deployment ke GitHub dan Vercel

1. Buat repository baru di GitHub.
2. Jalankan perintah berikut dari folder proyek:

```bash
git init
git add .
git commit -m "Initial Mufrodat Kids MVP"
git branch -M main
git remote add origin https://github.com/USERNAME/mufrodat-kids.git
git push -u origin main
```

3. Masuk ke Vercel dan pilih **Add New → Project**.
4. Import repository GitHub `mufrodat-kids`.
5. Tambahkan environment variables yang sama dengan `.env.local` di menu Project Settings → Environment Variables.
6. Deploy.
7. Tambahkan URL domain Vercel ke Supabase Auth → URL Configuration → Site URL dan Redirect URLs.
8. Uji login admin, upload media, sesi guest, permainan, dan penyimpanan hasil di domain produksi.

Vercel mendeteksi Next.js secara otomatis. Jangan mengunggah `.env.local` atau service role key ke GitHub.

## 8. Catatan keamanan dan batasan MVP

- Siswa guest tidak memiliki akun permanen. Riwayat melekat pada guest session yang disimpan di browser.
- Sesi guest memakai token acak; database menyimpan hash token, bukan token aslinya.
- Hasil permainan dikirim ke server. Server memeriksa setiap pasangan berdasarkan `activity_items` dan menghitung skor dari database.
- Guest session dan tabel hasil tidak menyediakan kebijakan baca/tulis publik. Service role hanya dipakai di Route Handler server.
- Akun admin harus didaftarkan manual di `admin_profiles` setelah dibuat melalui Supabase Auth.
- Audio browser menggunakan Speech Synthesis sebagai fallback. Untuk pembelajaran pelafalan yang konsisten, unggah rekaman audio yang sudah diperiksa guru.
- Media contoh menggunakan emoji sebagai placeholder. Guru dapat menggantinya dengan ilustrasi/gambar sendiri melalui dashboard.
- MVP belum menyediakan edit kosakata, pengaturan kelas, akun siswa permanen, ekspor Excel, sertifikat, atau analitik lanjutan.
- Sebelum digunakan secara luas oleh anak, lakukan uji aksesibilitas, uji keamanan, backup database, dan pemeriksaan materi Bahasa Arab oleh guru.

## 9. Roadmap pengembangan

1. **MVP:** materi, guest session, matching game, admin login, pengelolaan kategori/kosakata/permainan, dan penyimpanan skor.
2. **Versi 1.1:** edit kosakata, pencarian, filter kategori, kuis pilihan ganda, dan riwayat hasil per guest session.
3. **Versi 1.2:** dashboard analitik guru, ekspor CSV/XLSX, badge, level, dan pencapaian.
4. **Versi 2:** kelas, kode akses kelas, akun siswa terkelola, multi-guru, dan laporan lintas perangkat.
