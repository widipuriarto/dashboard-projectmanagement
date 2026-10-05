# Design System & Brief: Telkom RSO Dashboard

**Role**: Senior Product Designer
**Context**: Mengubah spreadsheet Google Sheets 38 kolom yang berantakan menjadi antarmuka elegan berbasis Web, memadukan identitas *Telkom* dan *Apple-esque aesthetics*.

---

## 1. Design Principles
Tiga aturan mutlak UI ini:
1. **Density without Clutter (Padat namun Bersih)**: Sistem harus merender 38 kolom tanpa membuat pengguna kewalahan. Gunakan penyembunyian kolom (*toggle visibility*) dan *sticky headers* secara bawaan.
2. **Unmistakable Status (Status Tanpa Ambiguitas)**: KPI BAST SLA (7 hari) adalah nyawa operasional. Indikator batas waktu harus langsung menarik perhatian mata (*Red* vs *Green*) dalam radius 3 detik pertama.
3. **Frictionless Data Entry (Input Tanpa Hambatan)**: Formulir CRUD harus mendukung navigasi *Keyboard* (Tab-to-next) secara instan. *Klik* sekecil mungkin.

## 2. Visual Direction
- **Mood**: Profesional, Modern, Ringan (*Weightless*), dan Terpercaya (*Trustworthy*).
- **Referensi**: Antarmuka macOS (Transparansi/Glassmorphism) yang dipadukan dengan wibawa warna BUMN Telkom.
- **Hindari**: Bayangan hitam pekat (*harsh drop-shadows*), desain *flat* abu-abu ala sistem *enterprise* tahun 2010 yang membosankan, dan penggunaan *font* berukuran di bawah 12px.

## 3. Design Tokens (Variabel Keputusan)
Keputusan: Menggunakan **Inter**, karena memiliki angka tabular (*tabular numerals*) yang sempurna untuk data finansial dan statistik, sangat identik dengan *SF Pro* milik Apple.
- **Palet Warna**:
  - `Telkom Navy` (#002D62): Teks primer, header, tombol utama. (Kesan otoritas).
  - `Telkom Red` (#ED1C24): Aksen kritis, SLA > 7 hari, tombol destruktif.
  - `Apple Surface` (#FBFBFD): Latar belakang utama, sangat bersih.
  - `Glass Overlay` (rgba(255,255,255,0.7)): Untuk Navbar & Sidebar dengan efek `backdrop-blur-xl`.
  - `Emerald Success` (#10B981): Untuk status *Billing Complete* dan SLA <= 7 hari.
- **Skala Tipografi (Base 14px)**: H1 (24px, Bold), H2 (18px, Semi), Body (14px, Reg), Table Cell (13px, Medium).
- **Radius**: `lg` (8px) untuk input/tombol, `2xl` (16px) untuk kontainer *Card/Modal* luar.
- **Shadow**: `0 4px 24px rgba(0, 0, 0, 0.04)` (Difusi sangat halus agar elemen seolah melayang).

## 4. Screen Inventory
1. **Tab 1: Master Repository Table**
   *Tujuan*: Tempat staf melakukan CRUD harian, mencari data spesifik (Global Search), dan membuka file ke Microsoft Teams.
2. **Tab 2: Analytics Pivot Dashboard**
   *Tujuan*: Tempat Manager melihat ringkasan (4 *Chart* utama) performa Witel/Segmen tanpa perlu membaca baris data mentah.

## 5. User Flow (Core Journey)
- **Journey Tambah Proyek (P8 Turun)**: 
  Klik `[+ Tambah Proyek]` -> Panel *Slide-out* (bukan pop-up tengah) muncul dari kanan -> Isi 10 kolom wajib awal (SID/Order ID dibiarkan kosong) -> Tekan `Simpan` (`Enter`) -> Notifikasi *Toast Success* -> Baris baru langsung berkedip hijau di tabel.

## 6. Layout per Screen
- **Master Repository**: 
  - *Kiri*: Sidebar navigasi (Glassmorphism, 250px lebar).
  - *Atas*: Header berisi *Global Search Bar* panjang (gaya Apple Spotlight) dan Profil.
  - *Konten Utama*: Memakan 90% layar. Tabel TanStack yang lebar (overflow-x: auto) dengan *Primary Action* di kanan atas tabel.

## 7. Component Library (Shadcn UI Customized)
- **Data Table**: Mendukung *Zebra striping* ultra-halus (abu-abu 2%), *sticky header*.
- **Badge (Status)**: Bentuk oval penuh (`rounded-full`). *Variant*: Success (Hijau muda), Warning (Kuning), Destructive (Merah muda). Teks di dalamnya tebal dan berukuran 12px.
- **Buttons**:
  - *Primary*: Latar belakang `Telkom Navy`, teks putih, efek sedikit menekan (*scale 0.98*) saat diklik.
  - *Ghost*: Tanpa latar, untuk fungsi sekunder.

## 8. State Management
- **Empty State**: Tabel kosong harus menampilkan ilustrasi SVG rapi (folder kosong) dengan teks "Belum ada proyek" dan tombol panah mengarah ke aksi penambahan.
- **Loading State**: Dilarang menggunakan *spinner* berputar untuk tabel. Wajib menggunakan **Skeleton Loaders** (kotak abu-abu berkedip halus) agar mata tidak lelah.
- **Error State**: Input yang salah/kosong diberi garis tepi `Telkom Red` dengan teks penjelasan kecil di bawah kotak (bukan alert pop-up!).
- **Success State**: Notifikasi melayang (*Toast*) di sudut kanan bawah, hilang otomatis dalam 3 detik.

## 9. Responsive Behaviour
Sistem Dashboard Tabel sangat sulit di-desain untuk HP.
- **Desktop (1024px+)**: Pengalaman optimal 100%. Sidebar terbuka. Tabel Horizontal *Scroll*.
- **Tablet (768px)**: Sidebar mengecil menjadi ikon saja.
- **Mobile (<768px)**: Tampilan tabel horizontal disembunyikan dan diubah menjadi *Card List View* vertikal (setiap baris menjadi kotak info).

## 10. Accessibility (A11y)
- **Contrast Ratio**: Teks putih pada *Telkom Navy* memiliki kontras 10:1 (melewati standar WCAG AAA). Latar abu muda dengan teks abu tua dipastikan 4.5:1 (WCAG AA).
- **Focus Order**: Navigasi `Tab` wajib berjalan dari Kiri -> Kanan, Atas -> Bawah. Elemen aktif dikelilingi efek cincin biru terang (`ring-2 ring-blue-500`) (Gaya Apple).
- **ARIA**: *Table*, *Row*, dan *Cell* wajib dideklarasikan untuk *screen reader*. Teks hipertaut ke Microsoft Teams disisipi label "Buka file [Nama] di tab baru".
