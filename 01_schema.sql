-- =====================================================================
-- KANDAGA — skema database (PostgreSQL 15+)
-- Jalankan sebagai superuser/owner database, sekali, di database kosong:
--   psql -d kandaga -v ON_ERROR_STOP=1 -f 01_schema.sql
--
-- Cara aplikasi memakai skema ini (penting):
--   1. Aplikasi (server Next.js) konek sebagai role DB "kandaga_app",
--      BUKAN sebagai owner. Kredensialnya hanya ada di server.
--   2. Di awal SETIAP transaksi, aplikasi menyetel siapa yang login:
--        BEGIN;
--        SELECT set_config('app.user_id', '<uuid user>', true);
--        ... query ...
--        COMMIT;
--      Untuk pengunjung (belum login) jangan setel apa pun / setel ''.
--   3. Semua aturan role ditegakkan di sini (RLS + trigger), jadi bug di
--      kode aplikasi tidak otomatis menjadi celah data.
--   Jika memakai Supabase: ganti isi fungsi app_uid() dengan auth.uid().
-- =====================================================================

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

create table roles (
  id   smallint primary key,
  nama text not null unique
);

create table users (
  id            uuid primary key default gen_random_uuid(),
  role_id       smallint not null references roles(id),
  nama          text not null,
  email         citext not null unique,
  password_hash text not null,
  status        text not null default 'aktif' check (status in ('aktif','nonaktif')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index users_role_idx on users(role_id);

create table jurusan (
  id   smallint generated always as identity primary key,
  kode text not null unique,
  nama text not null unique
);

create table siswa (
  user_id        uuid primary key references users(id) on delete cascade,
  jurusan_id     smallint not null references jurusan(id),
  nis            text not null unique,
  kelas          text not null,
  angkatan       smallint not null,
  status         text not null default 'aktif' check (status in ('aktif','alumni')),
  bio            text,
  karier_terkini text,
  foto_url       text
);
create index siswa_jurusan_idx on siswa(jurusan_id);

create table guru (
  user_id    uuid primary key references users(id) on delete cascade,
  jurusan_id smallint not null references jurusan(id),
  nip        text unique
);
create index guru_jurusan_idx on guru(jurusan_id);

create table perusahaan (
  user_id           uuid primary key references users(id) on delete cascade,
  nama              text not null,
  bidang            text,
  dokumen_url       text,
  status_verifikasi text not null default 'menunggu'
                    check (status_verifikasi in ('menunggu','disetujui','ditolak')),
  verified_by       uuid references users(id),
  verified_at       timestamptz,
  constraint perusahaan_verif_chk
    check (status_verifikasi = 'menunggu' or (verified_by is not null and verified_at is not null))
);

create table jenis_karya (
  id   smallint generated always as identity primary key,
  nama text not null unique
);

create table tools_skill (
  id   smallint generated always as identity primary key,
  nama text not null unique
);

create table badge (
  id   smallint generated always as identity primary key,
  nama text not null unique,
  tier text not null unique check (tier in ('terpilih','unggulan','juara','industri'))
);

create table karya (
  id                 uuid primary key default gen_random_uuid(),
  siswa_id           uuid not null references siswa(user_id),
  guru_pembimbing_id uuid references guru(user_id),
  jenis_id           smallint references jenis_karya(id),
  judul              text not null check (length(trim(judul)) > 0),
  deskripsi          text,
  tahun              smallint not null check (tahun between 2000 and 2100),
  status             text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  catatan_review     text,
  reviewed_by        uuid references users(id),
  published_at       timestamptz,
  view_count         integer not null default 0 check (view_count >= 0),
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  search_vector      tsvector generated always as
                     (to_tsvector('simple', coalesce(judul,'') || ' ' || coalesce(deskripsi,''))) stored,
  constraint karya_reject_note_chk check (status <> 'rejected' or catatan_review is not null),
  constraint karya_publish_chk     check ((status = 'approved') = (published_at is not null))
);
create index karya_siswa_idx      on karya(siswa_id);
create index karya_pembimbing_idx on karya(guru_pembimbing_id);
create index karya_jenis_idx      on karya(jenis_id);
create index karya_pending_idx    on karya(created_at) where status = 'pending' and deleted_at is null;
create index karya_publik_idx     on karya(published_at desc) where status = 'approved' and deleted_at is null;
create index karya_search_idx     on karya using gin (search_vector);

create table karya_media (
  id       uuid primary key default gen_random_uuid(),
  karya_id uuid not null references karya(id) on delete cascade,
  url      text not null,
  tipe     text not null default 'foto' check (tipe in ('foto','video')),
  urutan   smallint not null default 0,
  unique (karya_id, urutan)
);

create table karya_tools (
  karya_id uuid     not null references karya(id) on delete cascade,
  tool_id  smallint not null references tools_skill(id),
  primary key (karya_id, tool_id)
);

create table karya_badge (
  karya_id        uuid     not null references karya(id) on delete cascade,
  badge_id        smallint not null references badge(id),
  diberikan_oleh  uuid     not null references users(id),
  diberikan_pada  timestamptz not null default now(),
  primary key (karya_id, badge_id)
);
create index karya_badge_badge_idx on karya_badge(badge_id);

create table permintaan_kontak (
  id            uuid primary key default gen_random_uuid(),
  perusahaan_id uuid not null references perusahaan(user_id),
  karya_id      uuid not null references karya(id),
  tujuan        text not null check (tujuan in ('magang','kerja','kolaborasi')),
  pesan         text not null check (length(trim(pesan)) > 0),
  status        text not null default 'terkirim'
                check (status in ('terkirim','ditinjau','klarifikasi','diteruskan','ditolak')),
  catatan_bkk   text,
  reviewed_by   uuid references users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint pk_reviewed_chk
    check (status = 'terkirim' or (reviewed_by is not null and reviewed_at is not null)),
  constraint pk_note_chk
    check (status not in ('klarifikasi','ditolak') or catatan_bkk is not null)
);
create index pk_status_idx     on permintaan_kontak(status);
create index pk_perusahaan_idx on permintaan_kontak(perusahaan_id);
create index pk_karya_idx      on permintaan_kontak(karya_id);

create table bookmark (
  perusahaan_id uuid not null references perusahaan(user_id) on delete cascade,
  karya_id      uuid not null references karya(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (perusahaan_id, karya_id)
);

create table kerja_sama (
  id            uuid primary key default gen_random_uuid(),
  permintaan_id uuid not null unique references permintaan_kontak(id),
  jenis         text not null check (jenis in ('magang','kerja','proyek')),
  tanggal_mulai date,
  catatan       text,
  dicatat_oleh  uuid not null references users(id),
  created_at    timestamptz not null default now()
);

create table notifikasi (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  tipe       text not null,
  judul      text not null,
  isi        text not null,
  dibaca     boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifikasi_user_idx on notifikasi(user_id, dibaca);

create table audit_log (
  id         bigint generated always as identity primary key,
  user_id    uuid references users(id) on delete set null,
  aksi       text not null,
  entitas    text not null,
  entitas_id text,
  data       jsonb,
  created_at timestamptz not null default now()
);
create index audit_entitas_idx on audit_log(entitas, entitas_id);
create index audit_waktu_idx   on audit_log(created_at);

-- ---------------------------------------------------------------------
-- 2. FUNGSI PEMBACA KONTEKS ("siapa yang sedang login?")
--    Konvensi: app_uid() IS NULL  => pengunjung atau skrip sistem
--              (migrasi/seed). Semua penulisan oleh pengunjung ditolak
--              RLS, jadi trigger di bawah aman melewatkannya.
-- ---------------------------------------------------------------------

create function app_uid() returns uuid
language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

create function app_role() returns text
language sql stable security definer set search_path = public as $$
  select r.nama
  from users u join roles r on r.id = u.role_id
  where u.id = app_uid() and u.status = 'aktif'
$$;

create function app_jurusan() returns smallint
language sql stable security definer set search_path = public as $$
  select jurusan_id from guru where user_id = app_uid()
$$;

create function guru_scope(p_siswa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from siswa s
    where s.user_id = p_siswa and s.jurusan_id = app_jurusan()
  )
$$;

-- ---------------------------------------------------------------------
-- 3. TRIGGER: konsistensi data & aturan bisnis
-- ---------------------------------------------------------------------

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and tg_table_name = 'karya'
     and (to_jsonb(new) - 'view_count' - 'updated_at' - 'search_vector')
       = (to_jsonb(old) - 'view_count' - 'updated_at' - 'search_vector') then
    new.updated_at := old.updated_at;   -- hanya view_count yang berubah
  else
    new.updated_at := now();
  end if;
  return new;
end $$;

-- Tabel profil hanya boleh dibuat untuk akun dengan role yang sesuai.
create function enforce_profile_role() returns trigger
language plpgsql as $$
declare actual text;
begin
  select r.nama into actual
  from users u join roles r on r.id = u.role_id
  where u.id = new.user_id;
  if actual is distinct from tg_argv[0] then
    raise exception 'akun % harus ber-role % untuk tabel %', new.user_id, tg_argv[0], tg_table_name
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

-- users: role/status hanya diubah admin; role terkunci setelah profil ada.
create function users_guard() returns trigger
language plpgsql as $$
declare r text;
begin
  if new.role_id is distinct from old.role_id and (
       exists (select 1 from siswa      where user_id = old.id) or
       exists (select 1 from guru       where user_id = old.id) or
       exists (select 1 from perusahaan where user_id = old.id)) then
    raise exception 'role tidak dapat diubah setelah profil dibuat'
      using errcode = 'check_violation';
  end if;
  if app_uid() is null then return new; end if;
  r := app_role();
  if r is null then
    raise exception 'akun tidak aktif' using errcode = 'insufficient_privilege';
  end if;
  if r <> 'admin' and (new.role_id is distinct from old.role_id
                    or new.status  is distinct from old.status) then
    raise exception 'hanya admin yang boleh mengubah role atau status akun'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- siswa: siswa hanya boleh mengubah bio/karier/foto miliknya.
create function siswa_guard() returns trigger
language plpgsql as $$
declare r text;
begin
  if app_uid() is null then return new; end if;
  r := app_role();
  if r is null then
    raise exception 'akun tidak aktif' using errcode = 'insufficient_privilege';
  end if;
  if r = 'siswa' then
    if old.user_id <> app_uid() then
      raise exception 'bukan profil milik sendiri' using errcode = 'insufficient_privilege';
    end if;
    new.user_id    := old.user_id;
    new.jurusan_id := old.jurusan_id;
    new.nis        := old.nis;
    new.kelas      := old.kelas;
    new.angkatan   := old.angkatan;
    new.status     := old.status;
  elsif r <> 'admin' then
    raise exception 'role % tidak boleh mengubah profil siswa', r
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- perusahaan: verifikasi hanya oleh koordinator BKK; data usaha oleh pemilik.
create function perusahaan_guard() returns trigger
language plpgsql as $$
declare r text;
begin
  if new.verified_by is not null and not exists (
       select 1 from users u join roles ro on ro.id = u.role_id
       where u.id = new.verified_by and ro.nama = 'koordinator_bkk') then
    raise exception 'verified_by harus akun koordinator_bkk'
      using errcode = 'check_violation';
  end if;
  if tg_op = 'INSERT' or app_uid() is null then return new; end if;
  r := app_role();
  if r is null then
    raise exception 'akun tidak aktif' using errcode = 'insufficient_privilege';
  end if;
  if r = 'perusahaan' then
    if old.user_id <> app_uid() then
      raise exception 'bukan data perusahaan sendiri' using errcode = 'insufficient_privilege';
    end if;
    new.user_id           := old.user_id;
    new.status_verifikasi := old.status_verifikasi;
    new.verified_by       := old.verified_by;
    new.verified_at       := old.verified_at;
  elsif r = 'koordinator_bkk' then
    new.user_id     := old.user_id;
    new.nama        := old.nama;
    new.bidang      := old.bidang;
    new.dokumen_url := old.dokumen_url;
    if new.status_verifikasi is distinct from old.status_verifikasi then
      new.verified_by := app_uid();
      new.verified_at := now();
    else
      new.verified_by := old.verified_by;
      new.verified_at := old.verified_at;
    end if;
  else
    raise exception 'role % tidak boleh mengubah data perusahaan', r
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- karya: guru pembimbing harus satu jurusan dengan siswa.
create function karya_pembimbing_check() returns trigger
language plpgsql as $$
begin
  if new.guru_pembimbing_id is not null and not exists (
       select 1
       from guru g join siswa s on s.jurusan_id = g.jurusan_id
       where g.user_id = new.guru_pembimbing_id and s.user_id = new.siswa_id) then
    raise exception 'guru pembimbing harus dari jurusan yang sama dengan siswa'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

-- karya: mesin status (pending -> approved/rejected) + pembatasan per role.
create function karya_guard() returns trigger
language plpgsql as $$
declare r text;
begin
  if app_uid() is null then return new; end if;
  r := app_role();
  if r is null then
    raise exception 'akun tidak aktif' using errcode = 'insufficient_privilege';
  end if;

  if tg_op = 'INSERT' then
    if r <> 'siswa' or new.siswa_id <> app_uid() then
      raise exception 'hanya siswa pemilik yang boleh mengunggah karya'
        using errcode = 'insufficient_privilege';
    end if;
    new.status := 'pending';
    new.catatan_review := null;
    new.reviewed_by := null;
    new.published_at := null;
    new.view_count := 0;
    new.deleted_at := null;
    return new;
  end if;

  -- pencatatan jumlah dilihat (hanya view_count berubah): selalu boleh
  if (to_jsonb(new) - 'view_count' - 'updated_at' - 'search_vector')
   = (to_jsonb(old) - 'view_count' - 'updated_at' - 'search_vector') then
    return new;
  end if;
  new.view_count := old.view_count;

  if r = 'siswa' then
    if old.siswa_id <> app_uid() then
      raise exception 'bukan karya milik sendiri' using errcode = 'insufficient_privilege';
    end if;
    if old.status = 'approved' then
      raise exception 'karya yang sudah approved terkunci' using errcode = 'insufficient_privilege';
    end if;
    new.siswa_id     := old.siswa_id;
    new.reviewed_by  := old.reviewed_by;
    new.published_at := old.published_at;
    new.deleted_at   := old.deleted_at;
    new.status       := 'pending';            -- edit = ajukan ulang
    new.catatan_review := old.catatan_review;

  elsif r = 'guru' then
    if not guru_scope(old.siswa_id) then
      raise exception 'karya di luar jurusan yang diampu' using errcode = 'insufficient_privilege';
    end if;
    if new.status is distinct from old.status and old.status <> 'pending' then
      raise exception 'hanya karya pending yang dapat direview' using errcode = 'check_violation';
    end if;
    new.siswa_id           := old.siswa_id;
    new.guru_pembimbing_id := old.guru_pembimbing_id;
    new.jenis_id           := old.jenis_id;
    new.judul              := old.judul;
    new.deskripsi          := old.deskripsi;
    new.tahun              := old.tahun;
    new.deleted_at         := old.deleted_at;
    if new.status is distinct from old.status then
      if new.status not in ('approved','rejected') then
        raise exception 'keputusan review harus approved atau rejected'
          using errcode = 'check_violation';
      end if;
      new.reviewed_by  := app_uid();
      new.published_at := case when new.status = 'approved' then now() else null end;
    else
      new.reviewed_by  := old.reviewed_by;
      new.published_at := old.published_at;
    end if;

  elsif r = 'admin' then
    if (to_jsonb(new) - 'deleted_at' - 'view_count' - 'updated_at' - 'search_vector')
     <> (to_jsonb(old) - 'deleted_at' - 'view_count' - 'updated_at' - 'search_vector') then
      raise exception 'admin hanya boleh takedown/restore (deleted_at), bukan menilai karya'
        using errcode = 'insufficient_privilege';
    end if;

  else
    raise exception 'role % tidak boleh mengubah karya', r
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- karya_badge: guru -> tier terpilih/unggulan/juara (jurusannya);
--              koordinator BKK -> tier industri. Karya harus approved.
create function karya_badge_guard() returns trigger
language plpgsql as $$
declare giver_role text; tier_badge text; giver_jur smallint; karya_jur smallint; k_status text;
begin
  if app_uid() is not null then
    new.diberikan_oleh := app_uid();
  end if;
  select ro.nama into giver_role
  from users u join roles ro on ro.id = u.role_id where u.id = new.diberikan_oleh;
  select tier into tier_badge from badge where id = new.badge_id;
  select k.status, s.jurusan_id into k_status, karya_jur
  from karya k join siswa s on s.user_id = k.siswa_id where k.id = new.karya_id;

  if k_status is distinct from 'approved' then
    raise exception 'badge hanya untuk karya yang sudah approved' using errcode = 'check_violation';
  end if;

  if giver_role = 'koordinator_bkk' then
    if tier_badge <> 'industri' then
      raise exception 'koordinator BKK hanya boleh memberi badge Diminati Industri'
        using errcode = 'insufficient_privilege';
    end if;
  elsif giver_role = 'guru' then
    if tier_badge = 'industri' then
      raise exception 'badge Diminati Industri hanya dari koordinator BKK'
        using errcode = 'insufficient_privilege';
    end if;
    select jurusan_id into giver_jur from guru where user_id = new.diberikan_oleh;
    if giver_jur is distinct from karya_jur then
      raise exception 'guru hanya boleh memberi badge di jurusannya'
        using errcode = 'insufficient_privilege';
    end if;
  else
    raise exception 'hanya guru atau koordinator BKK yang boleh memberi badge'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- permintaan_kontak: alur perusahaan -> BKK -> (klarifikasi | diteruskan | ditolak).
create function permintaan_guard() returns trigger
language plpgsql as $$
declare r text; verif text;
begin
  if new.reviewed_by is not null and not exists (
       select 1 from users u join roles ro on ro.id = u.role_id
       where u.id = new.reviewed_by and ro.nama = 'koordinator_bkk') then
    raise exception 'reviewed_by harus akun koordinator_bkk' using errcode = 'check_violation';
  end if;
  if app_uid() is null then return new; end if;
  r := app_role();
  if r is null then
    raise exception 'akun tidak aktif' using errcode = 'insufficient_privilege';
  end if;

  if tg_op = 'INSERT' then
    if r <> 'perusahaan' or new.perusahaan_id <> app_uid() then
      raise exception 'hanya perusahaan pemilik yang boleh mengajukan kontak'
        using errcode = 'insufficient_privilege';
    end if;
    select status_verifikasi into verif from perusahaan where user_id = new.perusahaan_id;
    if verif is distinct from 'disetujui' then
      raise exception 'akun perusahaan belum diverifikasi BKK' using errcode = 'insufficient_privilege';
    end if;
    if not exists (select 1 from karya where id = new.karya_id
                   and status = 'approved' and deleted_at is null) then
      raise exception 'karya tidak tersedia' using errcode = 'check_violation';
    end if;
    new.status := 'terkirim';
    new.catatan_bkk := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    return new;
  end if;

  if r = 'perusahaan' then
    if old.perusahaan_id <> app_uid() or old.status <> 'klarifikasi' then
      raise exception 'permintaan hanya dapat direvisi saat berstatus klarifikasi'
        using errcode = 'insufficient_privilege';
    end if;
    new.perusahaan_id := old.perusahaan_id;
    new.karya_id      := old.karya_id;
    new.catatan_bkk   := old.catatan_bkk;
    new.reviewed_by   := old.reviewed_by;
    new.reviewed_at   := old.reviewed_at;
    new.status        := 'terkirim';           -- kirim ulang ke antrian BKK

  elsif r = 'koordinator_bkk' then
    if old.status in ('diteruskan','ditolak') then
      raise exception 'permintaan sudah final' using errcode = 'check_violation';
    end if;
    if new.status is distinct from old.status and not (
         (old.status = 'terkirim' and new.status in ('ditinjau','klarifikasi','diteruskan','ditolak'))
      or (old.status = 'ditinjau' and new.status in ('klarifikasi','diteruskan','ditolak'))) then
      raise exception 'transisi status % -> % tidak diizinkan', old.status, new.status
        using errcode = 'check_violation';
    end if;
    new.perusahaan_id := old.perusahaan_id;
    new.karya_id      := old.karya_id;
    new.tujuan        := old.tujuan;
    new.pesan         := old.pesan;
    new.reviewed_by   := app_uid();
    new.reviewed_at   := now();

  else
    raise exception 'role % tidak boleh mengubah permintaan kontak', r
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

-- Notifikasi otomatis (dijalankan sebagai owner agar lolos RLS).
create function notify_karya_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and new.status in ('approved','rejected') then
    insert into notifikasi (user_id, tipe, judul, isi)
    values (
      new.siswa_id, 'review_karya',
      case new.status when 'approved' then 'Karya disetujui' else 'Karya perlu diperbaiki' end,
      format('Karya "%s" %s.%s', new.judul,
             case new.status when 'approved' then 'telah tayang di katalog' else 'belum disetujui' end,
             coalesce(' Catatan: ' || new.catatan_review, ''))
    );
  end if;
  return null;
end $$;

create function notify_permintaan() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status in ('klarifikasi','diteruskan','ditolak') then
      insert into notifikasi (user_id, tipe, judul, isi)
      values (new.perusahaan_id, 'status_kontak',
              'Status permintaan kontak: ' || new.status,
              coalesce(new.catatan_bkk, 'Permintaan Anda telah diproses oleh BKK.'));
    end if;
    if new.status = 'diteruskan' then
      insert into notifikasi (user_id, tipe, judul, isi)
      select u, 'minat_industri', 'Ada minat dari industri',
             format('Sebuah perusahaan berminat pada karya "%s" (tujuan: %s). Koordinasi dilakukan melalui BKK.',
                    k.judul, new.tujuan)
      from karya k, unnest(array[k.siswa_id, k.guru_pembimbing_id]) as u
      where k.id = new.karya_id and u is not null;
    end if;
  end if;
  return null;
end $$;

-- Jejak audit generik.
create function audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare j jsonb; old_j jsonb; new_j jsonb;
begin
  if tg_op = 'DELETE' then
    old_j := to_jsonb(old); new_j := null; j := old_j;
  elsif tg_op = 'INSERT' then
    old_j := null; new_j := to_jsonb(new); j := new_j;
  else
    old_j := to_jsonb(old); new_j := to_jsonb(new); j := new_j;
    if tg_table_name = 'karya'
       and (old_j - 'view_count' - 'updated_at' - 'search_vector')
         = (new_j - 'view_count' - 'updated_at' - 'search_vector') then
      return null;   -- jangan catat kenaikan view_count
    end if;
  end if;
  insert into audit_log (user_id, aksi, entitas, entitas_id, data)
  values (app_uid(), tg_op, tg_table_name,
          coalesce(j->>'id', concat_ws(':', j->>'karya_id', j->>'badge_id', j->>'user_id')),
          jsonb_build_object('old', old_j, 'new', new_j));
  return null;
end $$;

-- Pasang trigger ------------------------------------------------------

create trigger trg_users_1_guard   before update on users
  for each row execute function users_guard();
create trigger trg_users_2_updated before update on users
  for each row execute function set_updated_at();

create trigger trg_siswa_1_role  before insert or update of user_id on siswa
  for each row execute function enforce_profile_role('siswa');
create trigger trg_siswa_2_guard before update on siswa
  for each row execute function siswa_guard();

create trigger trg_guru_role before insert or update of user_id on guru
  for each row execute function enforce_profile_role('guru');

create trigger trg_perusahaan_1_role  before insert or update of user_id on perusahaan
  for each row execute function enforce_profile_role('perusahaan');
create trigger trg_perusahaan_2_guard before insert or update on perusahaan
  for each row execute function perusahaan_guard();

create trigger trg_karya_1_pembimbing before insert or update of siswa_id, guru_pembimbing_id on karya
  for each row execute function karya_pembimbing_check();
create trigger trg_karya_2_guard      before insert or update on karya
  for each row execute function karya_guard();
create trigger trg_karya_3_updated    before update on karya
  for each row execute function set_updated_at();
create trigger trg_karya_4_notify     after update on karya
  for each row execute function notify_karya_review();

create trigger trg_karya_badge_guard before insert on karya_badge
  for each row execute function karya_badge_guard();

create trigger trg_pk_1_guard   before insert or update on permintaan_kontak
  for each row execute function permintaan_guard();
create trigger trg_pk_2_updated before update on permintaan_kontak
  for each row execute function set_updated_at();
create trigger trg_pk_3_notify  after update on permintaan_kontak
  for each row execute function notify_permintaan();

create trigger trg_audit_karya after insert or update or delete on karya
  for each row execute function audit_row();
create trigger trg_audit_karya_badge after insert or update or delete on karya_badge
  for each row execute function audit_row();
create trigger trg_audit_perusahaan after insert or update or delete on perusahaan
  for each row execute function audit_row();
create trigger trg_audit_pk after insert or update or delete on permintaan_kontak
  for each row execute function audit_row();
create trigger trg_audit_kerja_sama after insert or update or delete on kerja_sama
  for each row execute function audit_row();

-- ---------------------------------------------------------------------
-- 4. FUNGSI UNTUK AKSI PUBLIK / TANPA LOGIN
-- ---------------------------------------------------------------------

-- Pengunjung mendaftarkan akun perusahaan (status: menunggu verifikasi BKK).
create function daftar_perusahaan(
  p_nama_kontak text, p_email citext, p_password_hash text,
  p_nama_perusahaan text, p_bidang text, p_dokumen_url text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  insert into users (role_id, nama, email, password_hash)
  values ((select id from roles where nama = 'perusahaan'), p_nama_kontak, p_email, p_password_hash)
  returning id into new_id;
  insert into perusahaan (user_id, nama, bidang, dokumen_url)
  values (new_id, p_nama_perusahaan, p_bidang, p_dokumen_url);
  return new_id;
end $$;

-- Login: ambil kredensial berdasarkan email (password_hash tidak bisa di-SELECT langsung).
create function login_lookup(p_email citext)
returns table (id uuid, password_hash text, status text, role text)
language sql stable security definer set search_path = public as $$
  select u.id, u.password_hash, u.status, r.nama
  from users u join roles r on r.id = u.role_id
  where u.email = p_email
$$;

-- Tambah hitungan dilihat (boleh dipanggil pengunjung).
create function catat_view(p_karya uuid) returns void
language sql security definer set search_path = public as $$
  update karya set view_count = view_count + 1
  where id = p_karya and status = 'approved' and deleted_at is null
$$;

-- ---------------------------------------------------------------------
-- 5. VIEW (kontrak data untuk halaman Next.js)
--    Kolom sensitif (email, NIS, password_hash) sengaja TIDAK ada.
-- ---------------------------------------------------------------------

create view v_katalog_publik with (security_barrier = true) as
select k.id, k.judul, k.deskripsi, k.tahun, k.published_at, k.view_count,
       jk.nama  as jenis_karya,
       j.kode   as jurusan_kode,
       j.nama   as jurusan,
       u.nama   as siswa_nama,
       s.kelas, s.angkatan, s.status as siswa_status,
       (select m.url from karya_media m where m.karya_id = k.id
         order by m.urutan limit 1) as thumbnail_url,
       coalesce((select array_agg(b.tier order by b.id)
                 from karya_badge kb join badge b on b.id = kb.badge_id
                 where kb.karya_id = k.id), '{}'::text[]) as badge_tier,
       k.search_vector
from karya k
join siswa s   on s.user_id = k.siswa_id
join users u   on u.id = s.user_id
join jurusan j on j.id = s.jurusan_id
left join jenis_karya jk on jk.id = k.jenis_id
where k.status = 'approved' and k.deleted_at is null and u.status = 'aktif';

create view v_profil_siswa_publik with (security_barrier = true) as
select s.user_id, u.nama, s.kelas, s.angkatan, j.nama as jurusan,
       s.status, s.bio, s.karier_terkini, s.foto_url
from siswa s
join users u   on u.id = s.user_id
join jurusan j on j.id = s.jurusan_id
where u.status = 'aktif';

create view v_leaderboard with (security_barrier = true) as
select s.user_id as siswa_id, u.nama, s.kelas, j.kode as jurusan_kode,
       count(kb.badge_id) as total_badge,
       max(case b.tier when 'terpilih' then 1 when 'unggulan' then 2
                       when 'juara' then 3 when 'industri' then 4 end) as level_tertinggi,
       dense_rank() over (partition by j.id order by count(kb.badge_id) desc) as peringkat
from siswa s
join users u   on u.id = s.user_id and u.status = 'aktif'
join jurusan j on j.id = s.jurusan_id
join karya k   on k.siswa_id = s.user_id and k.status = 'approved' and k.deleted_at is null
join karya_badge kb on kb.karya_id = k.id
join badge b   on b.id = kb.badge_id
group by s.user_id, u.nama, s.kelas, j.id, j.kode;

-- Antrian review guru (otomatis terbatas pada jurusan guru yang login).
create view v_antrian_review with (security_barrier = true) as
select k.id, k.judul, k.deskripsi, k.tahun, k.created_at, k.updated_at, k.catatan_review,
       u.nama as siswa_nama, s.kelas
from karya k
join siswa s on s.user_id = k.siswa_id
join users u on u.id = s.user_id
where app_role() = 'guru' and k.status = 'pending' and k.deleted_at is null
  and s.jurusan_id = app_jurusan();

-- Antrian permintaan kontak untuk koordinator BKK.
create view v_antrian_kontak with (security_barrier = true) as
select pk.id, pk.status, pk.tujuan, pk.pesan, pk.catatan_bkk, pk.created_at,
       p.nama as perusahaan, p.bidang,
       k.id as karya_id, k.judul as karya_judul,
       u.nama as siswa_nama, s.kelas
from permintaan_kontak pk
join perusahaan p on p.user_id = pk.perusahaan_id
join karya k      on k.id = pk.karya_id
join siswa s      on s.user_id = k.siswa_id
join users u      on u.id = s.user_id
where app_role() = 'koordinator_bkk';

-- Kontak yang sudah diteruskan BKK, untuk siswa pemilik & guru pembimbing.
create view v_kontak_diteruskan with (security_barrier = true) as
select pk.id, pk.tujuan, pk.pesan, pk.reviewed_at as diteruskan_pada,
       p.nama as perusahaan, p.bidang, k.judul as karya_judul
from permintaan_kontak pk
join perusahaan p on p.user_id = pk.perusahaan_id
join karya k      on k.id = pk.karya_id
where pk.status = 'diteruskan'
  and app_role() in ('siswa','guru')
  and (k.siswa_id = app_uid() or k.guru_pembimbing_id = app_uid());

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table roles             enable row level security;
alter table users             enable row level security;
alter table jurusan           enable row level security;
alter table siswa             enable row level security;
alter table guru              enable row level security;
alter table perusahaan        enable row level security;
alter table jenis_karya       enable row level security;
alter table tools_skill       enable row level security;
alter table badge             enable row level security;
alter table karya             enable row level security;
alter table karya_media       enable row level security;
alter table karya_tools       enable row level security;
alter table karya_badge       enable row level security;
alter table permintaan_kontak enable row level security;
alter table bookmark          enable row level security;
alter table kerja_sama        enable row level security;
alter table notifikasi        enable row level security;
alter table audit_log         enable row level security;

-- Data referensi: dibaca semua, diubah admin (roles hanya lewat migrasi).
create policy roles_read on roles for select using (true);
create policy jurusan_read  on jurusan  for select using (true);
create policy jurusan_admin on jurusan  for all using (app_role() = 'admin') with check (app_role() = 'admin');
create policy jenis_read    on jenis_karya for select using (true);
create policy jenis_admin   on jenis_karya for all using (app_role() = 'admin') with check (app_role() = 'admin');
create policy tools_read    on tools_skill for select using (true);
create policy tools_admin   on tools_skill for all using (app_role() = 'admin') with check (app_role() = 'admin');
create policy badge_read    on badge for select using (true);
create policy badge_admin   on badge for all using (app_role() = 'admin') with check (app_role() = 'admin');

-- users
create policy users_select on users for select
  using (id = app_uid() or app_role() = 'admin');
create policy users_insert on users for insert
  with check (app_role() = 'admin');
create policy users_update on users for update
  using (id = app_uid() or app_role() = 'admin')
  with check (id = app_uid() or app_role() = 'admin');

-- siswa (data publik lewat v_profil_siswa_publik)
create policy siswa_select on siswa for select
  using (user_id = app_uid() or app_role() = 'admin'
         or (app_role() = 'guru' and jurusan_id = app_jurusan()));
create policy siswa_insert on siswa for insert with check (app_role() = 'admin');
create policy siswa_update on siswa for update
  using (user_id = app_uid() or app_role() = 'admin')
  with check (user_id = app_uid() or app_role() = 'admin');

-- guru
create policy guru_select on guru for select using (user_id = app_uid() or app_role() = 'admin');
create policy guru_admin  on guru for all
  using (app_role() = 'admin') with check (app_role() = 'admin');

-- perusahaan (pendaftaran lewat daftar_perusahaan())
create policy perusahaan_select on perusahaan for select
  using (user_id = app_uid() or app_role() in ('admin','koordinator_bkk'));
create policy perusahaan_update on perusahaan for update
  using (user_id = app_uid() or app_role() = 'koordinator_bkk')
  with check (user_id = app_uid() or app_role() = 'koordinator_bkk');

-- karya
create policy karya_select on karya for select using (
  (status = 'approved' and deleted_at is null)
  or (siswa_id = app_uid() and deleted_at is null)
  or (app_role() = 'guru' and guru_scope(siswa_id))
  or app_role() = 'admin'
);
create policy karya_insert on karya for insert
  with check (app_role() = 'siswa' and siswa_id = app_uid());
create policy karya_update_siswa on karya for update
  using (app_role() = 'siswa' and siswa_id = app_uid() and status in ('pending','rejected'))
  with check (siswa_id = app_uid());
create policy karya_update_guru on karya for update
  using (app_role() = 'guru' and guru_scope(siswa_id))
  with check (guru_scope(siswa_id));
create policy karya_update_admin on karya for update
  using (app_role() = 'admin') with check (app_role() = 'admin');
-- tidak ada policy DELETE: penghapusan = soft delete (deleted_at)

-- media & tools mengikuti visibilitas karya induknya
create policy media_select on karya_media for select
  using (exists (select 1 from karya k where k.id = karya_id));
create policy media_write on karya_media for all
  using (app_role() = 'siswa' and exists (
           select 1 from karya k where k.id = karya_id
             and k.siswa_id = app_uid() and k.status in ('pending','rejected')))
  with check (app_role() = 'siswa' and exists (
           select 1 from karya k where k.id = karya_id
             and k.siswa_id = app_uid() and k.status in ('pending','rejected')));
create policy ktools_select on karya_tools for select
  using (exists (select 1 from karya k where k.id = karya_id));
create policy ktools_write on karya_tools for all
  using (app_role() = 'siswa' and exists (
           select 1 from karya k where k.id = karya_id
             and k.siswa_id = app_uid() and k.status in ('pending','rejected')))
  with check (app_role() = 'siswa' and exists (
           select 1 from karya k where k.id = karya_id
             and k.siswa_id = app_uid() and k.status in ('pending','rejected')));

-- karya_badge
create policy kbadge_select on karya_badge for select
  using (exists (select 1 from karya k where k.id = karya_id));
create policy kbadge_insert on karya_badge for insert
  with check (app_role() in ('guru','koordinator_bkk'));
create policy kbadge_delete on karya_badge for delete
  using (diberikan_oleh = app_uid());

-- permintaan_kontak (siswa/guru membaca lewat v_kontak_diteruskan)
create policy pk_select on permintaan_kontak for select
  using (perusahaan_id = app_uid() or app_role() in ('koordinator_bkk','admin'));
create policy pk_insert on permintaan_kontak for insert
  with check (app_role() = 'perusahaan' and perusahaan_id = app_uid());
create policy pk_update on permintaan_kontak for update
  using (perusahaan_id = app_uid() or app_role() = 'koordinator_bkk')
  with check (perusahaan_id = app_uid() or app_role() = 'koordinator_bkk');

-- bookmark, kerja sama, notifikasi, audit
create policy bookmark_own on bookmark for all
  using (app_role() = 'perusahaan' and perusahaan_id = app_uid())
  with check (app_role() = 'perusahaan' and perusahaan_id = app_uid());
create policy kerja_sama_read on kerja_sama for select
  using (app_role() in ('koordinator_bkk','admin'));
create policy kerja_sama_write on kerja_sama for all
  using (app_role() = 'koordinator_bkk') with check (app_role() = 'koordinator_bkk');
create policy notif_select on notifikasi for select using (user_id = app_uid());
create policy notif_update on notifikasi for update
  using (user_id = app_uid()) with check (user_id = app_uid());
create policy audit_select on audit_log for select using (app_role() = 'admin');

-- ---------------------------------------------------------------------
-- 7. ROLE DATABASE UNTUK APLIKASI & HAK AKSES
-- ---------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'kandaga_app') then
    create role kandaga_app login password 'GANTI-PASSWORD-INI';
  end if;
end $$;

grant usage on schema public to kandaga_app;
grant select on all tables in schema public to kandaga_app;

-- password_hash tidak boleh dibaca langsung (pakai login_lookup)
revoke select on users from kandaga_app;
grant select (id, role_id, nama, email, status, created_at, updated_at) on users to kandaga_app;
grant insert, update on users to kandaga_app;

grant insert, update, delete on
  karya, karya_media, karya_tools, karya_badge, bookmark, permintaan_kontak,
  kerja_sama, siswa, guru, perusahaan, jurusan, jenis_karya, badge, tools_skill
  to kandaga_app;
grant update on notifikasi to kandaga_app;

revoke execute on all functions in schema public from public;
grant execute on function
  app_uid(), app_role(), app_jurusan(), guru_scope(uuid),
  daftar_perusahaan(text, citext, text, text, text, text),
  login_lookup(citext), catat_view(uuid)
  to kandaga_app;

commit;
