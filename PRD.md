# Product Requirements Document (PRD)

**Project Name**: RSO Area 1 Project Management Dashboard
**Status**: Approved (MVP Scope Locked)
**Document Version**: 5.0 (10-Point PM Format + Apple-esque UI)

---

## 1. Problem Statement
Tim Project Management (PM) RSO Area 1 saat ini mengandalkan Google Sheets yang berantakan untuk melacak siklus proyek (P8 -> Delivery -> BAST -> Bima/NCX). Hal ini merugikan tim karena rawan *human error*, tidak memiliki validasi relasional (Order ID/SID sering bermasalah), dan menyita banyak waktu untuk membuat laporan rekapitulasi/pivot secara manual. Tidak adanya indikator KPI yang jelas juga menghambat *tracking* SLA 7 hari BAST.

## 2. Target User + 2 Personas
Target pengguna adalah 6-10 anggota tim internal PM RSO Area 1.
Kedua persona di bawah ini **berbagi peran dan hak akses (RBAC) yang identik** dalam sistem:
- **Persona 1: Project Manager (Manager/PM Eksternal)**. Fokus pada pemantauan *helicopter view*, analisis metrik Pivot, dan melacak komitmen *Billing Complete* bulanan.
- **Persona 2: PM Staff / Support Admin**. Fokus pada kecepatan operasional CRUD (Create, Read, Update, Delete) data harian, dan akses cepat ke repositori Microsoft Teams.

## 3. Goals dan Non-Goals
- **Goals**: 
  - Menciptakan *Single Source of Truth* tersentralisasi berbasis Web dengan pengalaman UI/UX yang modern.
  - Memfasilitasi operasi CRUD yang aman.
  - Mengotomatisasi 4 laporan Pivot Dashboard.
- **Non-Goals (Luar Lingkup)**: 
  - Kolaborasi *real-time* soket ganda (melihat ketikan *user* lain secara *live* layaknya Google Docs). 
  - API *Write* otomatis ke sistem Bima/NCX Telkom (Sistem ini berjalan independen).

## 4. User Stories
- **Sebagai PM Staff**, saya ingin menambahkan baris proyek baru tanpa harus mengisi *Order ID* atau *SID*, supaya saya bisa melacak inisiasi proyek (tahap P8) sejak hari pertama.
- **Sebagai Project Manager**, saya ingin melihat visualisasi metrik Pivot, supaya saya tahu berapa proyek yang *Pending Baso* vs *Billing Complete*.
- **Sebagai Pengguna**, saya ingin mengklik kolom `File BAST`, supaya saya bisa langsung membuka *storage* Microsoft Teams tanpa mencarinya secara manual.

## 5. Daftar Fitur (MVP vs v2)
**MVP (Rilis Pertama - Saat Ini):**
- Tab 1: Master Data Table interaktif (38 Kolom standar Data Dictionary) dengan fungsi CRUD penuh.
- Filter Data, *Global Search*, dan *Column Toggling*, Search berdasarkan kriteria tertentu.
- Indikator SLA KPI 7 Hari BAST (Highlight warna).
- Hyperlink Repo (File BAST & File BAPL).
- Tab 2: Dashboard Analytics (4 Tabel Pivot/Card).

**v2 (Rilis Berikutnya - Nanti):**
- Otomasi Telegram Bot untuk dokumen BAPL.
- Integrasi *Read-Only* API dari server Bima/NCX.

## 6. Functional Requirement Detail (MVP)
- **Table CRUD**: UI harus memfasilitasi pembuatan proyek baru, pengeditan sel (update), dan penghapusan baris data. Tabel CRUD berada didalam setiap row.
- **UI/UX System**: Menerapkan Telkom Corporate Theme x Apple Aesthetics (*Glassmorphism*, *Rounded-2xl*, *Soft Shadows*) menggunakan Shadcn UI dan Tailwind CSS.
- **KPI Formatting**: Jika `Tanggal Close DR` - `Tanggal Request DR` <= 7 hari, tampilkan warna Hijau (`#10B981`). Jika > 7, tampilkan Merah (`#ED1C24`).
- **Data Mapping Constraint**: Field UI harus memetakan `SEGMENT` dari `NEW SEGMENT`, dan `WITEL` dari `WITEL NEW` (dengan fallback ke nilai lama).

## 7. Sketsa Data Model (Entitas + Field Kunci)
**Entity: `Projects`** (Tabel Utama)
- `id` (UUID / Primary Key DB)
- `project_id_pm` (String, Format RSO Unik: `26DPS-SMG001`)
- `segment` & `witel` (String)
- `nama_proyek`, `nama_mitra`, `nama_pelanggan` (String)
- `order_id` & `sid` (String, **Nullable** / Diizinkan Kosong)
- `status_delivery_project` & `status_order` (Enum/String)
- `file_bast` & `file_bapl` (String URL)
- `tgl_request_dr` & `tgl_close_dr` (Date/Time)

## 8. Edge Case dan Failure State
- **Edge Case 1: Proyek Awal Tanpa SID**: Proyek baru inisiasi (P6/P8) tidak akan memiliki `Order ID` dan `SID`. Skema database **wajib melegalkan null** untuk field ini.
- **Edge Case 2: Data Kosong pada Fallback**: Jika `NEW SEGMENT` dan `SEGMENT` keduanya kosong, sistem menyimpan string "Uncategorized".

## 9. Success Metrics
- 100% operasional pemantauan harian PM berpindah dari Google Sheets ke sistem dashboard.
- Pengguna dapat melakukan CRUD dan melihat laporan keseluruhan (Monitoring Overview) tanpa hambatan (*zero blocking issues*).

## 10. Open Questions
- *Concurrency*: Karena kolaborasi *real-time* (live socket) ditiadakan, jika 2 user secara tidak sengaja mengedit baris (row) yang **sama** di detik yang **sama**, apakah kita menerapkan *Optimistic Locking* (menolak save user kedua) atau *Last Write Wins* (timpa paksa)? (Jawabannya adalah ini: *Last Write Wins*).

