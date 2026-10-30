# Matriks Identifikasi Kolom, Form Add Project & Validasi Sistem

**Project**: RSO Area 1 Project Management Dashboard  
**Status Audit**: Verified & Synchronized  
**Source of Truth**: `PRD.md`, `ERD.md`, `ProjectForm.tsx`, `columns.tsx`

---

## 1. Analisis Kesesuaian Sistem Form Add Project

Berdasarkan pengecekan menyeluruh terhadap kode implementasi formulir ([`ProjectForm.tsx`](frontend/src/components/organisms/ProjectForm.tsx) dan molekul-molekulnya di [`frontend/src/components/molecules/project-form/`](frontend/src/components/molecules/project-form/)), seluruh struktur pengelompokan formulir **telah sesuai 100%** dengan spesifikasi bisnis yang ditetapkan:

1. **Seksi 1 (DATA PROJECT)**:
   - Menampung seluruh data inisiasi kontrak dan komitmen bisnis.
   - Dilengkapi 3 field fondasi sistem: `ID PROJECT PM` (auto-generated, readonly, lock icon), `SEGMENT` (dropdown mandatory), dan `WITEL` (dropdown mandatory).
   - Sinkronisasi otomatis: Pengisian `Tgl Kontrak` otomatis mengisi `Tahun Kontrak`. Jika terdapat perubahan tahun manual atau inkonsistensi, sistem memicu modal konfirmasi `YearMismatchModal`.
   - `KOMITMEN BC` ditempatkan di Seksi Data Project menggunakan picker khusus `Month-YYYY` (tersimpan ke database sebagai `YYYY-MM-01`).

2. **Seksi 2 (STATUS DOK OBL)**:
   - Menampung `Quote Number`, `STATUS EMAIL HANDOVER` (Dropdown: `OK`; `NOK`), `Note Email Hand Over`, dan `Status Dokumen OBL` (Dropdown: `KL/NOPES OK`; `IN PROCESS`; `P8 OK`).
   - Penegakan mandatory (*): `STATUS EMAIL HANDOVER` dan `Status Dokumen OBL` wajib diisi sebelum form dapat disimpan.

3. **Seksi 3 (LAYANAN & STATUS DELIVERY)**:
   - Menggunakan atom/molekul hirarkis [`OrderSidTreeInput.tsx`](frontend/src/components/molecules/project-form/OrderSidTreeInput.tsx) yang mendukung relasi 1:N (1 Order ID memiliki multi SID).
   - Validasi format: `No Order` diwajibkan berformat `1-(11 digit)` dan `SID` berformat `10 digit` (atau `1-(11 digit)`).
   - `Status Delivery Project` menggunakan dropdown standar (`Delivered`, `In Process`, `Hold`).

4. **Seksi 4 (DATA DOK DELIVERY)**:
   - `ID DIGIREVIEW` diproteksi secara real-time hanya menerima input numerik dengan panjang tepat 6 digit.
   - Auto-filled fields:
     - `Tahun BAST`: Otomatis mengekstrak tahun 4 digit dari `Tanggal BAST`.
     - `PM`: Otomatis terisi berdasarkan pilihan `SEGMENT` (Jika `DGS` $\rightarrow$ `Filipus Tito`, selain DGS $\rightarrow$ `Achadin`).
     - `Waktu Penyelesaian BAST (hari)`: Dihitung secara reaktif di antarmuka form berdasarkan selisih absolut antara `Tanggal Close DR` dan `Tanggal Request DR`. Di database PostgreSQL juga diamankan oleh *Generated Always Stored Column*.

5. **Seksi 5 (STATUS ORDER & REPOSITORY DOK)**:
   - Dropdown standar: `STATUS ORDER` (`01 BC`, `02 Pending BASO`, `03 Prov Issue`), `Status GR` (`DONE`, `IN PROCESS`), dan `Hardfile BAST` (`OK`, `NOK`).
   - `Bulan BC` menggunakan picker `Month-YYYY` (disimpan `YYYY-MM-01`).
   - `File BAST` & `File BAPL` menampung URL link Microsoft Teams/SharePoint, yang pada tabel front end dirender sebagai tombol interaktif berikon resmi Teams.

---

## 2. Tabel Matriks Identifikasi Lengkap Setiap Kolom

Tabel di bawah ini mengidentifikasi seluruh kolom pada sistem, membandingkan tipe data tingkat database, tipe input pada form Add/Edit Project, format presentasi pada tabel dashboard front end, serta aturan validasi dan justifikasi teknisnya:

| No | Nama Kolom Bisnis | Field Key (DB & Code) | Seksi Form | Tipe Data Database | Tipe Data di Input Field | Tipe di Front End (Tabel) | Keterangan & Validasi |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **ID Project PM** | `project_id_pm` | Data Project | `VARCHAR(50)` / `TEXT` (UNIQUE, NOT NULL) | Readonly / Locked | Text Mono Center (Sortable) | **Wajib (Sistem)**. Format otomatis: `[Tahun]-[Witel]-[Segmen]-[NoUrut]`. Readonly dengan ikon gembok, tidak dapat diedit manual. |
| 2 | **Segment** | `segment` | Data Project | `VARCHAR(50)` | Dropdown | Status Chip (Default Badge) | **Wajib (*)**. Pilihan: `DGS`, `DPS`, `DSS`, `SME`. Mengontrol auto-fill PM. Filter multi-select aktif. |
| 3 | **Witel** | `witel` | Data Project | `VARCHAR(50)` | Dropdown | Status Chip (Default Badge) | **Wajib (*)**. Pilihan: `SMG JATENG UTARA`, `SLO JATENG TIMUR`, `YOG JATENG SELATAN`. Filter multi-select aktif. |
| 4 | **Nama Proyek** | `nama_proyek` | Data Project | `TEXT` | Free text | Text Left + Sort A-Z + Popover | **Wajib (*)**. Minimal 3 karakter. Mendukung ekspansi teks panjang via popover double-click. |
| 5 | **Nama Mitra** | `nama_mitra` | Data Project | `VARCHAR(255)` | Dropdown / Combobox | Text Left + Sort A-Z + Popover | **Wajib (*)**. Berisi 27 daftar mitra resmi Telkom. Di tabel ditampilkan teks biasa dengan sorting & popover overflow. |
| 6 | **Nama Pelanggan** | `nama_pelanggan` | Data Project | `VARCHAR(255)` | Free text | Text Left + Sort A-Z + Popover | **Wajib (*)**. Nama instansi/klien. Dilengkapi popover overflow jika melebihi lebar sel. |
| 7 | **IDLOP** | `idlop` | Data Project | `VARCHAR(100)` | Free text | Text Left + Popover | Opsional. Nomor identifikasi LOP internal Telkom. |
| 8 | **Jenis Kontrak** | `jenis_kontrak` | Data Project | `VARCHAR(50)` | Dropdown | Status Chip (Default Badge) | Opsional. Pilihan: `KL`, `SP`, `WO`, `NOPES`, `SA`, `KL Amandemen`, `NOPES Amandemen`. |
| 9 | **Nomor KL/SP/WO/NOPES** | `nomor_kl_sp_wo_nopes` | Data Project | `VARCHAR(255)` | Free text | Text Left + Popover | Opsional. Nomor berkas perjanjian/kontrak resmi. |
| 10 | **Tgl Kontrak** | `tgl_kontrak` | Data Project | `DATE` | DatePicker (`YYYY-MM-DD`) | Date Center (Sortable) | Opsional. Format ISO `YYYY-MM-DD`. Memilih tanggal ini otomatis mengisi `Tahun Kontrak`. |
| 11 | **Tahun Kontrak** | `tahun_kontrak` | Data Project | `INTEGER` | Number (Auto-filled / Input) | Number Center (Sortable) | **Wajib (*)**. Tahun buku 4 digit (2020–2030). Terisi otomatis dari `Tgl Kontrak`, diproteksi `YearMismatchModal`. |
| 12 | **Nilai Kontrak (OBL)** | `nilai_kontrak_obl` | Data Project | `NUMERIC` | Currency Input (`Rp`) | Currency IDR Right (Sortable) | Opsional. Input diformat dengan pemisah ribuan otomatis. Di tabel ditampilkan format standar `Rp 123.456.789`. |
| 13 | **Komitmen BC** | `komitmen_bc` | Data Project | `DATE` | MonthYearPicker (`Month-YYYY`) | Formatted Date Center (Sortable) | Opsional. Periode komitmen Billing Complete. Disimpan ke PostgreSQL sebagai tanggal 1 (`YYYY-MM-01`). |
| 14 | **Quote Number** | `quote_number` | Status Dok OBL | `VARCHAR(100)` | Free text | Text Center | Opsional. Nomor penawaran sistem OBL (contoh: `1-37841806771`). |
| 15 | **Status Email Handover** | `status_email_handover` | Status Dok OBL | `TEXT` (`'OK'`, `'NOK'`) | Dropdown | Status Chip (Success / Destructive) | **Wajib (*)**. Pilihan: `OK` (Hijau) atau `NOK` (Merah). Database menggunakan check constraint `IN ('OK', 'NOK')`. |
| 16 | **Note Email Hand Over** | `note_email_handover` | Status Dok OBL | `TEXT` | Free text | Text Left + Popover | Opsional. Catatan progres email handover. |
| 17 | **Status Dokumen OBL** | `status_dokumen_obl` | Status Dok OBL | `VARCHAR(100)` | Dropdown | Status Chip (Multi-variant Badge) | **Wajib (*)**. Pilihan: `KL/NOPES OK`, `IN PROCESS`, `P8 OK`. Di tabel: OK (Hijau), Process (Kuning), Lainnya (Abu). |
| 18 | **No Order** | `no_order` | Layanan & Delivery | `VARCHAR(255)` / `JSONB` | Number Format `1-(11digit)` | Expandable Tree Cell (Center) | Opsional. Format angka `1-XXXXXXXXXXX`. Terintegrasi dengan pohon hirarki multi-order dan tombol expand baris. |
| 19 | **SID** | `sid` | Layanan & Delivery | `VARCHAR(255)` / `JSONB` | Number Format `10 digit` / `1-(11digit)` | Expandable Tree Cell (Center) | Opsional. Format angka 10 digit (contoh `2084785162`) atau format 1-(11 digit). Multi-SID terstruktur rapi per order. |
| 20 | **Jenis Layanan** | `jenis_layanan` | Layanan & Delivery | `TEXT` | Free text | Text Left + Popover | Opsional. Rincian deskripsi portofolio layanan (Internet, Astinet, M2M, Router, dll). Dilengkapi popover cell expansion. |
| 21 | **Status Delivery Project** | `status_delivery_project` | Layanan & Delivery | `VARCHAR(100)` | Dropdown | Status Chip (Multi-variant Badge) | Opsional. Pilihan: `Delivered` (Hijau), `In Process` (Kuning), `Hold` (Merah). |
| 22 | **Jenis Dok Delivery** | `jenis_dok_delivery` | Data Dok Delivery | `VARCHAR(50)` | Dropdown | Status Chip (Default Badge) | Opsional. Pilihan: `BAST`, `BAPL`. |
| 23 | **Status Dokumen Delivery** | `status_dokumen_delivery` | Data Dok Delivery | `VARCHAR(100)` | Dropdown | Status Chip (Multi-variant Badge) | Opsional. Pilihan: `01 Closed`, `02 Sirkulir TTD`, `03 DR/Drafting`, `04 Evidence`, `05 Delivery NOK`. Closed bernilai Hijau. |
| 24 | **ID Digireview** | `id_digireview` | Data Dok Delivery | `VARCHAR(100)` | Numeric Input (`6 digit`) | Text Center | Opsional. Validasi ketat murni angka 6 digit (`^\d{6}$`). Keyboard handler memblokir karakter selain angka. |
| 25 | **Tanggal Request DR** | `tanggal_request_dr` | Data Dok Delivery | `DATE` | DatePicker (`YYYY-MM-DD`) | Date Center (Sortable) | Opsional. Format ISO `YYYY-MM-DD`. Mempengaruhi kalkulasi otomatis hari SLA BAST. |
| 26 | **Tanggal Close DR** | `tanggal_close_dr` | Data Dok Delivery | `DATE` | DatePicker (`YYYY-MM-DD`) | Date Center (Sortable) | Opsional. Format ISO `YYYY-MM-DD`. Mempengaruhi kalkulasi otomatis hari SLA BAST. |
| 27 | **No BAST Telkom** | `no_bast_telkom` | Data Dok Delivery | `VARCHAR(255)` | Free text | Text Left + Popover | Opsional. Nomor surat BAST Telkom. |
| 28 | **Tanggal BAST** | `tanggal_bast` | Data Dok Delivery | `DATE` | DatePicker (`YYYY-MM-DD`) | Date Center (Sortable) | Opsional. Format ISO `YYYY-MM-DD`. Input tanggal ini otomatis mengisi nilai `Tahun BAST`. |
| 29 | **Tahun BAST** | `tahun_bast` | Data Dok Delivery | `INTEGER` | Readonly (Auto-filled) | Number Center (Sortable) | Opsional. Terisi otomatis dari 4 digit tahun pada `Tanggal BAST`. Readonly di form. |
| 30 | **PM** | `pm` | Data Dok Delivery | `VARCHAR(100)` | Readonly (Auto-filled) | Status Chip (Default Badge) | Opsional. Terisi otomatis sesuai `SEGMENT`: Jika `DGS` $\rightarrow$ `Filipus Tito`, segmen lainnya $\rightarrow$ `Achadin`. |
| 31 | **Waktu Penyelesaian BAST** | `waktu_penyelesaian_bast` | Data Dok Delivery | `INTEGER` *(Generated Stored)* | Readonly (Live Preview) | Status Chip SLA (Success/Warning/Destructive) | **Kalkulasi Otomatis**. Selisih hari antara `Tanggal Close DR` dan `Tanggal Request DR`. $\le 7$ hari (Hijau), 8–10 hari (Kuning), $> 10$ hari (Merah). |
| 32 | **Ket Update** | `ket_update` | Data Dok Delivery | `TEXT` | Textarea (Free text) | Text Left + Popover | Opsional. Riwayat dan catatan mutakhir tindak lanjut proyek. |
| 33 | **Status Order** | `status_order` | Status Order & Repositori | `VARCHAR(100)` | Dropdown | Status Chip (Multi-variant Badge) | Opsional. Pilihan: `01 BC` (Hijau), `02 Pending BASO` (Kuning), `03 Prov Issue` (Merah). |
| 34 | **Bulan BC** | `bulan_bc` | Status Order & Repositori | `DATE` | MonthYearPicker (`Month-YYYY`) | Formatted Date Center (Sortable) | Opsional. Periode bulan Billing Complete aktual. Disimpan format tanggal 1 (`YYYY-MM-01`). |
| 35 | **File BAST** | `file_bast` | Status Order & Repositori | `TEXT` | URL Input | Teams Icon Button (Center) | Opsional. URL tautan dokumen di Microsoft Teams/SharePoint. Di tabel dirender sebagai tombol icon Teams sekali klik. |
| 36 | **File BAPL** | `file_bapl` | Status Order & Repositori | `TEXT` | URL Input | Teams Icon Button (Center) | Opsional. URL tautan dokumen BAPL di Microsoft Teams/SharePoint. Di tabel dirender sebagai tombol icon Teams sekali klik. |
| 37 | **Status GR** | `status_gr` | Status Order & Repositori | `VARCHAR(100)` | Dropdown | Status Chip (Multi-variant Badge) | Opsional. Pilihan: `DONE` (Hijau), `IN PROCESS` (Kuning). |
| 38 | **Hardfile BAST** | `hardfile_bast` | Status Order & Repositori | `VARCHAR(100)` | Dropdown | Status Chip (Success / Destructive) | Opsional. Pilihan: `OK` (Hijau), `NOK` (Merah). |

---

## 3. Justifikasi Desain & Rekomendasi Sinkronisasi Database

1. **Struktur Relasi No Order & SID**:
   - Di tingkat antarmuka, form menggunakan hierarki pohon `orders_data` (`JSONB`), sementara kolom teks legacy `no_order` dan `sid` tetap disinkronkan secara otomatis oleh fungsi `serializeOrdersData()`. Hal ini menjamin kompabilitas ganda antara pembacaan cepat tabular dan struktur relasi 1:N yang valid.
2. **Karakteristik Generated Column `waktu_penyelesaian_bast`**:
   - Menggunakan klausa PostgreSQL `GENERATED ALWAYS AS (tanggal_close_dr - tanggal_request_dr) STORED`. Form Add Project hanya menampilkan preview reaktif (`liveSlaDays`) tanpa mengirimkan nilai ini pada payload insert, sehingga mencegah anomali inkonsistensi data di level database engine.
3. **Penyelarasan Nilai Historis Legacy**:
   - Nilai historis lama di database seperti `segment = 'DES'` atau `pm = 'Adin'` tetap dapat ditampilkan secara anggun di tabel dashboard, namun ketika proyek tersebut diedit melalui `ProjectForm`, sistem form secara otomatis menstandarisasi nilainya ke opsi resmi yang valid (`DGS/DPS/DSS/SME` dan `Filipus Tito / Achadin`).

