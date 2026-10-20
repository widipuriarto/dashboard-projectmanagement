# Rencana Pengujian Otomatis (E2E Testing Plan) - Cypress
**Proyek**: RSO Area 1 Project Management Dashboard  
**Framework**: Cypress E2E Testing  
**Target Environment**: `http://localhost:5173` (Frontend Vite + React 19 + Supabase)  
**Dokumen Referensi**: `PRD.md`, `Architecture.md`, `Design-System.md`, `AGENTS.md`  

---

## 1. Filosofi & Metodologi Pengujian
1. **Testing Contract Berbasis `data-testid`**:  
   Semua penargetan elemen DOM wajib memprioritaskan atribut semantik `[data-testid="..."]` untuk mencegah kerapuhan tes (*anti-brittle*) akibat perubahan kelas Tailwind CSS atau pergeseran tata letak UI.
2. **Determinisme & Isolasi Alur**:  
   Setiap test case (`it`) berfokus pada satu alur verifikasi yang jelas, memastikan state tabel dan modal kembali bersih pada akhir tes.
3. **Resiliensi Virtualisasi**:  
   Mengingat tabel menggunakan TanStack Virtual (hanya baris dalam viewport yang dirender pada DOM), pengujian scroll dan pencarian data wajib memperhitungkan *virtual buffer*.

---

## 2. Cakupan Skenario Pengujian (Test Coverage Matrix)

### Skenario 1: Master Repository Table & Virtual Scrolling (`01_master_repository_table.cy.ts`)
*Tujuan*: Memverifikasi performa render awal tabel 38 kolom, kestabilan sticky columns, dan mekanisme virtual scrolling.
- **Test 1.1 - Initial Render & Column Layout**:
  - Halaman `/repository` dapat diakses dengan sukses.
  - Elemen toolbar utama terlihat (`search-input`, `btn-add-project`, `filter-button`, `columns-button`).
  - Header tabel memuat kolom esensial (`Aksi`, `No.`, `ID Project PM`, dll.).
  - Setidaknya terdapat 1 baris data ter-render (`[data-testid="table-row"]`).
- **Test 1.2 - Sticky Columns Behavior**:
  - Kolom `actions`, `nomor`, dan `project_id_pm` memiliki styling sticky (`sticky z-10` / `sticky z-30`).
  - Saat container tabel di-scroll horizontal ke arah kanan (koordinat x > 1000px), kolom sticky tetap terlihat di viewport kiri dan tidak bergeser keluar layar.
- **Test 1.3 - Virtual Scrolling Efficiency**:
  - Container tabel di-scroll vertikal secara cepat ke posisi bawah (`scrollTo('bottom')`).
  - Virtualizer me-render baris-baris baru secara dinamis dan tidak menyebabkan tab crash atau blank page.
  - Saat di-scroll kembali ke puncak (`scrollTo('top')`), baris awal kembali ter-render secara utuh.

---

### Skenario 2: Search Input, Scoped Column & Keyboard Shortcut (`02_search_and_shortcuts.cy.ts`)
*Tujuan*: Memverifikasi pencarian global multi-field, pencarian terfokus per-kolom, dan tombol pintasan keyboard `Ctrl+F`.
- **Test 2.1 - Global Search**:
  - Mengetikkan kata kunci nama proyek atau witel pada `[data-testid="search-input"]`.
  - Baris tabel otomatis tersaring hanya menampilkan baris yang mengandung kata kunci tersebut.
- **Test 2.2 - Scoped Column Search**:
  - Membuka dropdown pemilihan kolom pencarian (`[data-testid="search-column-dropdown"]`).
  - Memilih kolom spesifik (misal: "Witel" atau "Segmen").
  - Memasukkan kata kunci dan memastikan pencarian hanya memeriksa kolom yang dipilih.
- **Test 2.3 - Keyboard Shortcut (`Ctrl + F` / `Cmd + F`)**:
  - Mengklik area kosong halaman.
  - Mengirim kombinasi tombol `Ctrl + F`.
  - Memverifikasi fokus kursor browser otomatis berpindah dan aktif di dalam `[data-testid="search-input"]`.
- **Test 2.4 - Clear Search Input**:
  - Mengklik tombol silang `[data-testid="search-clear-button"]`.
  - Input teks terhapus bersih dan tabel kembali menampilkan seluruh populasi data.

---

### Skenario 3: Multi-Category Filter, Column Visibility & Sorting Persistence (`03_filter_columns_sorting.cy.ts`)
*Tujuan*: Memverifikasi sistem penyaringan multi-kategori, pengaturan kolom dinamis, dan persistensi state di LocalStorage.
- **Test 3.1 - Multi-Category Filter & Active Chips**:
  - Mengklik `[data-testid="filter-button"]` untuk membuka popover filter.
  - Memilih kategori (misal: Witel) dan mencentang nilai tertentu (misal: "WITEL SUMUT").
  - Memverifikasi *active filter chip* muncul di atas tabel dengan label yang sesuai.
  - Menghapus chip individual dan memastikan tabel ter-update.
- **Test 3.2 - Clear All Filters**:
  - Mengaktifkan lebih dari satu filter.
  - Mengklik tombol "Clear all" (`[data-testid="clear-all-filters"]` atau `[data-testid="filter-reset-all"]`).
  - Seluruh filter ter-reset dan active chips menghilang.
- **Test 3.3 - Column Visibility & Mandatory Lock**:
  - Membuka popover kolom (`[data-testid="columns-button"]`).
  - Mematikan visibilitas salah satu kolom opsional (misal: "IDLOP").
  - Memverifikasi header dan sel kolom tersebut tidak lagi terlihat di tabel.
  - Memverifikasi bahwa kolom mandatori (`Aksi`, `No.`, `ID Project PM`) tidak dapat dimatikan (*disabled*).
- **Test 3.4 - Sorting State Persistence**:
  - Mengklik header kolom `ID Project PM` untuk mengaktifkan sorting (Ascending / Descending).
  - Melakukan reload halaman menggunakan `cy.reload()`.
  - Memverifikasi urutan sorting pada tabel tetap bertahan dan nilai pada `localStorage` (`pm_rso1_column_sorting`) tetap konsisten.

---

### Skenario 4: Tambah Proyek Baru - CRUD Create (`04_create_project.cy.ts`)
*Tujuan*: Memverifikasi form morphing in-place, kalkulasi reaktif ID Project PM, validasi 8 kolom mandatori, currency masking, dan highlight baris baru 5 detik.
- **Test 4.1 - In-Place Table Morphing**:
  - Mengklik `[data-testid="btn-add-project"]`.
  - Tabel menghilang dan bertransisi mulus menjadi `[data-testid="project-form"]` dengan parameter URL `?action=create`.
- **Test 4.2 - Mandatory Field Validation**:
  - Tanpa mengisi field apapun, klik `[data-testid="btn-save-project"]`.
  - Banner peringatan merah bertanda bintang `[data-testid="form-validation-banner"]` wajib muncul.
  - Form tidak tersubmit dan tidak melakukan request insert ke Supabase.
- **Test 4.3 - Reactive Dynamic ID Project PM Generation**:
  - Mengisi Tahun (`[data-testid="input-tahun-kontrak"]`) dengan `2027`.
  - Memilih Witel (`[data-testid="select-witel"]`) $\rightarrow$ "SUMUT".
  - Memilih Segmen (`[data-testid="select-segment"]`) $\rightarrow$ "DES".
  - Field ID Project PM (`[data-testid="input-project-id-pm"]`) wajib otomatis berubah menjadi `2027-SUMUT-DES-XXX` dengan ikon lock.
- **Test 4.4 - Input Masking (CurrencyInput)**:
  - Memasukkan angka `150000000` pada `[data-testid="input-nilai-kontrak-obl"]`.
  - Input wajib menampilkan format Rupiah terformat: `Rp 150.000.000`.
- **Test 4.5 - Successful Creation & 5-Second Highlight**:
  - Mengisi lengkap 8 field mandatori dan data pendukung.
  - Mengklik `[data-testid="btn-save-project"]`.
  - Notifikasi Toast `[data-testid="toast-item"]` dengan tipe sukses wajib muncul selama 5 detik.
  - Halaman otomatis kembali ke tabel master repository, dan baris proyek baru wajib memiliki highlight biru (`bg-sky-50`) selama 5 detik.

---

### Skenario 5: Ubah Proyek - CRUD Update (`05_update_project.cy.ts`)
*Tujuan*: Memverifikasi pembukaan form edit dari baris tabel, proteksi dirty state tombol simpan, pembaruan reaktif ID dengan retensi sequence asli, dan pembaruan data real-time.
- **Test 5.1 - Pre-populate Data on Edit**:
  - Mengklik `[data-testid="row-actions-edit"]` pada salah satu baris tabel.
  - Form terbuka dengan URL `?action=edit&id=...`.
  - Seluruh field terisi dengan data proyek yang bersangkutan.
- **Test 5.2 - Disabled Save Changes Button on Pristine State**:
  - Saat form baru terbuka dan belum ada field yang diubah, tombol `[data-testid="btn-save-project"]` wajib berstatus `disabled`.
- **Test 5.3 - Dirty State Activation & ID PM Recalculation**:
  - Mengubah Witel dari "SUMUT" ke "ACEH".
  - Tombol `[data-testid="btn-save-project"]` otomatis aktif (*enabled*).
  - Field ID Project PM ter-update menjadi `...-ACEH-...` namun tetap mempertahankan 3 digit nomor sequence aslinya.
- **Test 5.4 - Save Changes & Table Update**:
  - Mengubah Nama Proyek, lalu klik `[data-testid="btn-save-project"]`.
  - Toast sukses muncul, form tertutup, dan nama proyek yang baru langsung tampil pada tabel.

---

### Skenario 6: Hapus Proyek - CRUD Delete (`06_delete_project.cy.ts`)
*Tujuan*: Memverifikasi modal konfirmasi hapus dengan backdrop blur, pembatalan hapus, dan eksekusi penghapusan real-time dari tabel.
- **Test 6.1 - Delete Confirmation Modal Presentation**:
  - Mengklik `[data-testid="row-actions-delete"]` pada salah satu baris.
  - Modal konfirmasi `[data-testid="delete-confirmation-modal"]` muncul dengan teks `Are you sure to delete [ID PROJECT PM]?`.
  - Kotak bingkai nama proyek menampilkan nama proyek yang bersangkutan secara akurat.
- **Test 6.2 - Cancel Deletion**:
  - Mengklik tombol "Cancel" (`[data-testid="delete-modal-cancel"]`) atau menekan tombol `Escape`.
  - Modal tertutup dan baris proyek tetap ada di tabel.
- **Test 6.3 - Confirm Deletion**:
  - Mengklik tombol "Delete" (`[data-testid="delete-modal-confirm"]`).
  - Modal tertutup, notifikasi toast sukses `[Nama Proyek] successfully deleted` muncul selama 5 detik.
  - Baris proyek tersebut langsung terhapus dari tabel.

---

### Skenario 7: Navigation Guard & Unsaved Changes Protection (`07_navigation_guard.cy.ts`)
*Tujuan*: Memverifikasi pencegahan kehilangan data (*data-loss prevention*) saat user membatalkan perubahan atau berpindah rute saat formulir sedang dirty.
- **Test 7.1 - Discard Warning on Back Button**:
  - Masuk ke form Tambah Proyek.
  - Ketik teks pada salah satu input sehingga form berstatus `dirty`.
  - Klik tombol "Back" (`[data-testid="btn-back"]` atau `[data-testid="btn-header-back"]`).
  - Modal peringatan `[data-testid="unsaved-changes-modal"]` wajib muncul di tengah layar.
- **Test 7.2 - Cancel Discard**:
  - Klik tombol "Cancel" (`[data-testid="unsaved-modal-cancel"]`).
  - Modal tertutup, user tetap berada di form, dan teks yang diketik tidak hilang.
- **Test 7.3 - Confirm Discard**:
  - Klik tombol "Discard" (`[data-testid="unsaved-modal-discard"]`).
  - Perubahan dibatalkan, form tertutup, dan user kembali ke tampilan tabel master.

