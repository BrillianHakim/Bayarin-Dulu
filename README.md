# 💰 Bayarin Dulu

> Aplikasi split bill untuk patungan yang adil dan akurat. Dibuat karena capek hitung manual waktu nongkrong bareng teman.

![Bayarin Dulu](public/BayarinDulu.png)

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