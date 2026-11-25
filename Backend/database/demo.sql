-- Data fiktif untuk demo portofolio.
START TRANSACTION;
SET @tahun = YEAR(CURRENT_DATE) - IF(MONTH(CURRENT_DATE) < 7, 1, 0);
SET @semester = IF(MONTH(CURRENT_DATE) >= 7, 'Ganjil', 'Genap');
SET @mulai = IF(@semester = 'Ganjil', MAKEDATE(@tahun, 1) + INTERVAL 6 MONTH, MAKEDATE(@tahun + 1, 1));
SET @password_demo = '$2b$10$ZyeIIsGNT5IzsFxV/pxYCeVGQorwo8DjJ/.QDLJVRlCG9aDIkiDHa';

INSERT INTO tahun_ajaran (id, tahun, semester, tanggal_mulai, tanggal_selesai, status)
VALUES (1, CONCAT(@tahun, '/', @tahun + 1), @semester, @mulai, @mulai + INTERVAL 6 MONTH - INTERVAL 1 DAY, 'aktif');

INSERT INTO orangtua (id, nama_lengkap, relasi) VALUES (1, 'Wali Demo A', 'Wali');
INSERT INTO users (id, nama_lengkap, username, password, role, ortu_id) VALUES
  (1, 'Admin Demo', '900001', @password_demo, 'admin', NULL),
  (2, 'Guru Demo', '900002', @password_demo, 'guru', NULL),
  (3, 'Wali Demo A', '9000000003', @password_demo, 'ortu', 1);

INSERT INTO guru (id, user_id, nama_lengkap, nip) VALUES (1, 2, 'Guru Demo', '900002');
INSERT INTO siswa (id, nama_lengkap, nisn, jenis_kelamin) VALUES
  (1, 'Siswa Demo A', '9000000003', 'Perempuan'),
  (2, 'Siswa Demo B', '9000000004', 'Laki-laki'),
  (3, 'Siswa Demo C', '9000000005', 'Perempuan');

INSERT INTO orangtua_siswa (orangtua_id, siswa_id) VALUES (1, 1);
INSERT INTO kelas (id, nama_kelas, wali_kelas_id, tahun_ajaran_id) VALUES (1, '5A', 1, 1);
INSERT INTO kelas_siswa (kelas_id, siswa_id, tahun_ajaran_id) VALUES (1, 1, 1), (1, 2, 1), (1, 3, 1);
INSERT INTO mapel (id, nama_mapel) VALUES (1, 'Matematika'), (2, 'Bahasa Indonesia');
INSERT INTO kelas_mapel (kelas_id, mapel_id, guru_id, tahun_ajaran_id) VALUES (1, 1, 1, 1), (1, 2, 1, 1);

INSERT INTO absensi (siswa_id, kelas_id, tanggal, status, guru_id) VALUES
  (1, 1, CURRENT_DATE, 'Hadir', 1), (2, 1, CURRENT_DATE, 'Sakit', 1),
  (3, 1, CURRENT_DATE, 'Hadir', 1);

INSERT INTO nilai (siswa_id, kelas_id, mapel_id, tahun_ajaran_id, semester, lm1_tp1, lm1_tp2, lm1_ulangan, uts, uas, created_by, updated_by)
VALUES
  (1, 1, 1, 1, @semester, 83, 89, 86, 88, 91, 2, 2),
  (1, 1, 2, 1, @semester, 90, 86, 88, 92, 93, 2, 2),
  (2, 1, 1, 1, @semester, 79, 83, 81, 84, 86, 2, 2),
  (3, 1, 1, 1, @semester, 87, 91, 89, 90, 94, 2, 2);

INSERT INTO catatan_header (id, guru_id, orangtua_id, siswa_id, kategori, jenis, kelas_id, mapel_id, status)
VALUES (1, 1, 1, 1, 'Positif', 'Akademik', 1, 1, 'Dibaca');
INSERT INTO catatan_detail (header_id, pengirim_id, pesan)
VALUES (1, 2, 'Siswa Demo A dapat menjelaskan langkah penyelesaian soal pecahan.');

INSERT INTO chat_conversations (id, guru_id, ortu_id, siswa_id, last_message, last_message_time)
VALUES (1, 1, 1, 1, 'Terima kasih atas kabarnya, Bu.', NOW());
INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message, is_read)
VALUES
  (1, 2, 'guru', 'Latihan pecahan hari ini sudah selesai dengan baik.', 1),
  (1, 3, 'ortu', 'Terima kasih atas kabarnya, Bu.', 1);

COMMIT;
