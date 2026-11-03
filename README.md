# TATAP - Platform Video Pendek

TATAP adalah aplikasi web video pendek interaktif (mirip TikTok) yang dibangun menggunakan **HTML5**, **Tailwind CSS**, dan terintegrasi secara langsung dengan **Supabase** sebagai backend (Database & Storage) serta mendukung deployment instan melalui **GitHub Pages**.

## Fitur Utama
- **Feed Video Vertikal**: Navigasi layar penuh dengan gaya *snap scroll* yang mulus.
- **Interaksi Pengguna**: Fitur Like dengan animasi, kolom komentar interaktif (*sliding drawer*), dan tombol bagikan.
- **Dukungan Supabase**: Sinkronisasi data video, komentar, dan penyimpanan file video langsung ke Supabase Storage.
- **Mode Mock Fallback**: Tetap dapat diuji secara lokal menggunakan data tiruan meskipun belum menghubungkan Supabase.

---

## Panduan Pengaturan Supabase

Agar aplikasi dapat menyimpan dan menampilkan data asli dari database Anda, ikuti langkah-langkah berikut di dashboard Supabase Anda:

### 1. Buat Tabel Database (`videos` & `comments`)
Masuk ke menu **SQL Editor** di Supabase, lalu jalankan perintah SQL berikut:

```sql
-- Tabel Videos
create table videos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text not null,
  caption text,
  music text,
  video_url text not null,
  likes_count integer default 0,
  comments_count integer default 0
);

-- Tabel Comments
create table comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  video_id uuid references videos(id) on delete cascade,
  username text not null,
  comment text not null
);
