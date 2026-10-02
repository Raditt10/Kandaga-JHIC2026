-- =====================================================================
-- KANDAGA — Migrasi 02: Tambah catatan_verifikasi + trigger notifikasi
-- untuk tabel perusahaan (companies).
--
-- Jalankan SETELAH schema utama (01_schema.sql / db push) sudah ada:
--   psql -d kandaga -v ON_ERROR_STOP=1 -f 02_verifikasi_perusahaan.sql
--
-- Kalau pakai Supabase: paste ke SQL Editor, jalankan sekali.
-- =====================================================================

begin;

-- 1. Tambah kolom catatan_verifikasi (alasan tolak dari BKK)
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS catatan_verifikasi text;

-- 2. Constraint: penolakan WAJIB disertai catatan (meniru pola karya_reject_note_chk)
ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS perusahaan_catatan_ditolak_chk;

ALTER TABLE companies
  ADD CONSTRAINT perusahaan_catatan_ditolak_chk
  CHECK (
    verification_status <> 'ditolak'
    OR (catatan_verifikasi IS NOT NULL AND length(trim(catatan_verifikasi)) > 0)
  );

-- 3. Trigger: notifikasi otomatis ke perusahaan saat status verifikasi berubah
CREATE OR REPLACE FUNCTION notify_perusahaan_verifikasi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hanya kirim notifikasi saat status benar-benar berubah
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN

    IF NEW.verification_status = 'disetujui' THEN
      INSERT INTO notifications (user_id, type, title, content)
      VALUES (
        NEW.user_id,
        'verifikasi_akun',
        'Akun Anda Telah Disetujui',
        'Selamat! Akun mitra perusahaan Anda telah diverifikasi oleh Koordinator BKK SMKN 13 Bandung. Anda kini dapat mengakses katalog karya siswa dan mengajukan minat rekrutmen.'
      );

    ELSIF NEW.verification_status = 'ditolak' THEN
      INSERT INTO notifications (user_id, type, title, content)
      VALUES (
        NEW.user_id,
        'verifikasi_akun',
        'Pendaftaran Tidak Dapat Diproses',
        format(
          'Maaf, pendaftaran akun mitra Anda tidak dapat diproses saat ini. Alasan: %s. Silakan hubungi BKK untuk klarifikasi atau daftar ulang dengan dokumen yang lengkap.',
          COALESCE(NEW.catatan_verifikasi, 'tidak ada keterangan')
        )
      );
    END IF;

  END IF;
  RETURN NULL;
END;
$$;

-- Pasang trigger (AFTER UPDATE supaya notifikasi hanya dibuat setelah row benar-benar berubah)
DROP TRIGGER IF EXISTS trg_company_verif_notify ON companies;

CREATE TRIGGER trg_company_verif_notify
  AFTER UPDATE OF verification_status ON companies
  FOR EACH ROW
  EXECUTE FUNCTION notify_perusahaan_verifikasi();

commit;

