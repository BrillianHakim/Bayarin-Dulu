# 💰 Bayarin Dulu

> Aplikasi split bill untuk patungan yang adil dan akurat. Dibuat karena capek hitung manual waktu nongkrong bareng teman.

## 🌐 Live Demo

👉 [bayarindulu.vercel.app](https://bayarindulu.vercel.app)

---

## 📱 Tampilan

| Home | Buat Sesi | Sesi Aktif | Selesai |
|------|-----------|------------|---------|
| Riwayat sesi | Input anggota & item | Status bayar | Share ke WA |

---

## ✨ Fitur

- **Buat sesi patungan** — input nama sesi, anggota, dan pesanan masing-masing
- **2 mode input item:**
  - *Per Orang* — item berbeda tiap orang, harga penuh masing-masing
  - *Berbagi qty* — item dibeli bareng (misal gorengan), hitung proporsional
- **Kalkulasi otomatis** — tagihan per orang dihitung real-time sebelum sesi dimulai
- **Penalang** — pilih siapa yang bayar duluan, otomatis ditandai lunas
- **Tracking status** — toggle Lunas/Belum per anggota
- **Share ke WhatsApp** — kirim ringkasan tagihan ke grup langsung
- **Riwayat sesi** — semua sesi tersimpan, bisa dilihat kapan saja
- **Data isolation** — sesi kamu tidak terlihat oleh pengguna lain (localStorage)
- **Hapus sesi** — dengan konfirmasi sebelum dihapus

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Deploy | Vercel |

---

## 🗄 Struktur Database

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js 18+
- Akun Supabase

### Instalasi

```bash
# Clone repo
git clone https://github.com/username-kamu/bayarin-dulu.git
cd bayarin-dulu

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Setup Database

Jalankan SQL ini di Supabase SQL Editor:

```sql
create table sesi (
  id uuid primary key default gen_random_uuid(),
  nama_sesi text not null,
  talang_nama text not null,
  status text default 'aktif',
  created_at timestamp with time zone default now()
);

create table anggota (
  id uuid primary key default gen_random_uuid(),
  sesi_id uuid references sesi(id) on delete cascade,
  nama text not null,
  sudah_bayar boolean default false
);

create table item (
  id uuid primary key default gen_random_uuid(),
  sesi_id uuid references sesi(id) on delete cascade,
  nama text not null,
  harga numeric not null
);

create table item_anggota (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references item(id) on delete cascade,
  anggota_id uuid references anggota(id) on delete cascade,
  qty integer default 1
);
```

### Jalankan

```bash
npm run dev
# Buka http://localhost:3000
```

---

## 💡 Cerita di Balik Project

Project ini lahir dari kebiasaan nongkrong — selalu ada yang nalangin dulu, lalu bingung hitung siapa bayar berapa karena pesanannya beda-beda. **Bayarin Dulu** dibuat untuk menyelesaikan masalah itu: input pesanan masing-masing orang, pilih siapa yang nalangin, dan sistem otomatis hitung tagihan per orang.

Nama "Bayarin Dulu" diambil dari ungkapan yang sering muncul di tongkrongan — simpel, relatable, dan langsung ngerti fungsinya.

---

## 👨‍💻 Developer

**Brillian Hakim** — Mahasiswa IT Semester 8

[![GitHub](https://img.shields.io/badge/GitHub-username-black?style=flat&logo=github)](https://github.com/BrillianHakim)

---

## 📄 License

MIT License — bebas digunakan dan dimodifikasi.