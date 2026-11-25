# Sistem Monitoring Nilai Siswa

Aplikasi tugas akhir untuk SDN 1 Langensari yang membantu sekolah mengelola nilai, absensi, dan catatan perkembangan siswa serta berkomunikasi dengan orang tua.

| Peran | Fitur |
| --- | --- |
| Admin | Dashboard, akun pengguna, data guru, siswa dan orang tua, kelas, tahun ajaran, dan transkrip nilai |
| Guru | Dashboard kelas, absensi, penilaian, catatan perkembangan, chat, dan laporan |
| Orang tua | Ringkasan perkembangan anak, nilai, absensi, catatan, chat, dan laporan |

Frontend menggunakan React dan Vite. Backend menggunakan Express dan MariaDB/MySQL, dengan autentikasi JWT dan bcrypt. Laporan PDF dibuat menggunakan Chromium.

## Demo portofolio

Pada halaman login, pilih **Admin**, **Guru**, atau **Orang tua**. Demo menggunakan data sintetis dan menyediakan akses baca. Perubahan nilai, pengiriman pesan, dan pengelolaan akun tersedia dalam instalasi lokal dengan basis data sendiri.

### Menjalankan demo dengan Docker

Gunakan Docker dalam mode Linux containers.

```sh
docker build -t monitoring-nilai-demo .
docker run --rm -p 10000:10000 monitoring-nilai-demo
```

Buka [http://localhost:10000](http://localhost:10000). Container membuat basis data demo saat dijalankan.

### Deploy ke Render Free

Hubungkan repo GitHub ke **New → Blueprint** di Render, lalu pilih repo yang berisi `render.yaml`. Blueprint menggunakan Dockerfile yang sama, membuat rahasia JWT, dan menetapkan paket **Free**. Render Free akan tidur setelah 15 menit tanpa kunjungan dan dapat memerlukan sekitar satu menit untuk aktif kembali.

### Menjalankan untuk pengembangan

1. Gunakan Node.js 22. Buat basis data lokal `monitoring_ta` di MariaDB.
2. Impor `Backend/database/schema.sql`, lalu `Backend/database/demo.sql`. Keduanya ditujukan untuk basis data kosong.
3. Salin `Backend/.env.example` ke `Backend/.env`. Isi konfigurasi database dan buat rahasia JWT, misalnya dengan `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.
4. Jalankan `npm ci` dan `npm run dev` di folder `Backend`.
5. Buka terminal lain dan jalankan `npm ci` dan `npm run dev` di folder `Frontend`. Buka URL yang dicetak Vite. Untuk port backend lain, salin `Frontend/.env.example` ke `Frontend/.env` dan sesuaikan URL API.

| Akun lokal dengan data sintetis | Username |
| --- | --- |
| Admin | `900001` |
| Guru | `900002` |
| Orang tua | `9000000003` |

Password ketiga akun sintetis adalah `DemoPorto2026`. Simpan konfigurasi dan data sekolah di luar repo publik.
