-- ==============================================================================
-- AUDIT QUERY: DETEKSI SELURUH ANOMALI DATA PER KOLOM DI TABEL PROJECTS
-- Jalankan skrip ini langsung di Supabase SQL Editor.
-- Output menampilkan: Kolom, Project ID PM, Nilai Saat Ini, dan Jenis Anomali.
-- ==============================================================================

WITH anomalies AS (
  -- 1. Format ID PM Tidak Standar (Bukan YYYY-WITEL-SEGMENT-XXX)
  SELECT 
    'project_id_pm' AS nama_kolom,
    project_id_pm,
    project_id_pm AS nilai_saat_ini,
    'Format ID PM tidak standar (harus YYYY-WITEL-SEGMENT-XXX)' AS keterangan_anomali
  FROM public.projects
  WHERE project_id_pm IS NULL OR project_id_pm !~ '^[0-9]{4}-[A-Z]{3}-[A-Z]{3,4}-[0-9]+$'

  UNION ALL

  -- 2. Jenis Kontrak Berisi Tanggal atau Teks Non-Enum
  SELECT 
    'jenis_kontrak' AS nama_kolom,
    project_id_pm,
    jenis_kontrak AS nilai_saat_ini,
    CASE 
      WHEN jenis_kontrak ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN 'Kolom berisi tanggal/datetime (seharusnya pilihan enum)'
      ELSE 'Nilai di luar pilihan standar (KL, SP, WO, NOPES, SA, KL Amandemen, NOPES Amandemen)'
    END AS keterangan_anomali
  FROM public.projects
  WHERE jenis_kontrak IS NOT NULL 
    AND jenis_kontrak NOT IN ('KL', 'SP', 'WO', 'NOPES', 'SA', 'KL Amandemen', 'NOPES Amandemen')

  UNION ALL

  -- 3. Tahun Kontrak Typo / Tidak Wajar
  SELECT 
    'tahun_kontrak' AS nama_kolom,
    project_id_pm,
    tahun_kontrak::TEXT AS nilai_saat_ini,
    'Tahun kontrak tidak wajar (bukan 4 digit 2020-2030)' AS keterangan_anomali
  FROM public.projects
  WHERE tahun_kontrak IS NOT NULL 
    AND (tahun_kontrak < 2020 OR tahun_kontrak > 2030)

  UNION ALL

  -- 4. No Order Mengandung Huruf atau Multiple Order Belum Terpisah
  SELECT 
    'no_order' AS nama_kolom,
    project_id_pm,
    no_order AS nilai_saat_ini,
    CASE 
      WHEN no_order ~ '[a-zA-Z]' THEN 'Mengandung karakter huruf/teks keterangan'
      WHEN no_order ~ '[,;|\n]' THEN 'Multiple Order belum terpisah (berisi koma/titik koma)'
      ELSE 'Format No Order tidak valid'
    END AS keterangan_anomali
  FROM public.projects
  WHERE no_order IS NOT NULL 
    AND (no_order ~ '[a-zA-Z]' OR no_order ~ '[,;|\n]')

  UNION ALL

  -- 5. SID Mengandung Huruf/Label atau Multiple SID Belum Terpisah
  SELECT 
    'sid' AS nama_kolom,
    project_id_pm,
    sid AS nilai_saat_ini,
    CASE 
      WHEN sid ~ '[a-zA-Z]' THEN 'Mengandung teks keterangan/label (bukan angka SID)'
      WHEN sid ~ '[,;|\n]' THEN 'Multiple SID belum terpisah (berisi separator koma/titik koma)'
      ELSE 'Format SID tidak valid'
    END AS keterangan_anomali
  FROM public.projects
  WHERE sid IS NOT NULL 
    AND (sid ~ '[a-zA-Z]' OR sid ~ '[,;|\n]')

  UNION ALL

  -- 6. PM Berisi Link Web / Google Sheets / Nama Tidak Standar
  SELECT 
    'pm' AS nama_kolom,
    project_id_pm,
    pm AS nilai_saat_ini,
    CASE 
      WHEN pm ~* '^http' THEN 'Berisi URL Google Sheets / Link web (bukan nama PM)'
      ELSE 'Nama variasi/singkatan tidak standar (seharusnya Filipus Tito atau Achadin)'
    END AS keterangan_anomali
  FROM public.projects
  WHERE pm IS NOT NULL 
    AND pm NOT IN ('Filipus Tito', 'Achadin')

  UNION ALL

  -- 7. ID Digireview Mengandung Teks / Format Ganda
  SELECT 
    'id_digireview' AS nama_kolom,
    project_id_pm,
    id_digireview AS nilai_saat_ini,
    'ID Digireview mengandung teks/multiple tahap (seharusnya murni angka ID)' AS keterangan_anomali
  FROM public.projects
  WHERE id_digireview IS NOT NULL 
    AND id_digireview !~ '^[0-9]+$'

  UNION ALL

  -- 8. Segment Lama / Di Luar Enum Standar (DES, DBS)
  SELECT 
    'segment' AS nama_kolom,
    project_id_pm,
    segment AS nilai_saat_ini,
    'Segment lama/di luar standar form (seharusnya DGS, DPS, DSS, SME)' AS keterangan_anomali
  FROM public.projects
  WHERE segment IS NOT NULL 
    AND segment NOT IN ('DGS', 'DPS', 'DSS', 'SME')

  UNION ALL

  -- 9. Jenis Dokumen Delivery Di Luar Standar (Non BAST, AMD, BAPLA)
  SELECT 
    'jenis_dok_delivery' AS nama_kolom,
    project_id_pm,
    jenis_dok_delivery AS nilai_saat_ini,
    'Jenis dokumen delivery tidak standar (seharusnya BAST atau BAPL)' AS keterangan_anomali
  FROM public.projects
  WHERE jenis_dok_delivery IS NOT NULL 
    AND jenis_dok_delivery NOT IN ('BAST', 'BAPL')

  UNION ALL

  -- 10. Status Dokumen Delivery Di Luar Standar (06 Non DR)
  SELECT 
    'status_dokumen_delivery' AS nama_kolom,
    project_id_pm,
    status_dokumen_delivery AS nilai_saat_ini,
    'Nilai di luar standar enum status dokumen delivery' AS keterangan_anomali
  FROM public.projects
  WHERE status_dokumen_delivery IS NOT NULL 
    AND status_dokumen_delivery NOT IN ('01 Closed', '02 Sirkulir TTD', '03 DR/Drafting', '04 Evidence', '05 Delivery NOK')

  UNION ALL

  -- 11. Hardfile BAST Teks Keterangan Panjang (Bukan OK / NOK)
  SELECT 
    'hardfile_bast' AS nama_kolom,
    project_id_pm,
    hardfile_bast AS nilai_saat_ini,
    'Berisi teks catatan panjang (seharusnya OK atau NOK)' AS keterangan_anomali
  FROM public.projects
  WHERE hardfile_bast IS NOT NULL 
    AND hardfile_bast NOT IN ('OK', 'NOK', 'ADA', 'TIDAK ADA')

  UNION ALL

  -- 12. Nama Mitra Dummy / Data Testing
  SELECT 
    'nama_mitra' AS nama_kolom,
    project_id_pm,
    nama_mitra AS nilai_saat_ini,
    'Nilai nama mitra testing / dummy' AS keterangan_anomali
  FROM public.projects
  WHERE nama_mitra ~* '^(test|sdf|asdf|dummy)$'
)
SELECT 
  nama_kolom,
  project_id_pm,
  nilai_saat_ini,
  keterangan_anomali
FROM anomalies
ORDER BY nama_kolom, project_id_pm;

