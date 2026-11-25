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

### Deploy ke Vercel Hobby dan TiDB Cloud Starter

1. Di [TiDB Cloud](https://tidbcloud.com/), buat instance **Starter** dengan kompatibilitas **MySQL** dan paket gratis. Buat database kosong `monitoring_demo`, lalu gunakan klien MySQL dengan verifikasi TLS sesuai detail di menu **Connect**. Buat file impor dari folder repo dengan `node Backend/database/tidb-demo.mjs > tidb-demo.sql` (di Windows, jalankan perintah tersebut di Command Prompt). Impor file itu ke database demo. Gunakan akun tersendiri yang hanya punya hak `SELECT` pada database tersebut untuk aplikasi.
2. Buat project Vercel untuk backend. Pilih repo ini, root directory `Backend`, dan preset **Express**. Gunakan `PUPPETEER_SKIP_DOWNLOAD=true npm ci` sebagai install command.
3. Di pengaturan environment backend, isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET` (acak), dan `DEMO_MODE=true`. Backend memakai akses baca dan verifikasi TLS di Vercel. Untuk CA khusus, isi `DB_SSL_CA_BASE64` dengan sertifikat PEM yang dienkode Base64. Uji `/api/health` pada URL backend setelah deploy.
4. Buat project Vercel kedua dari repo yang sama dengan root directory `Frontend` dan preset **Vite**. Isi `VITE_API_URL` dengan URL backend diikuti `/api` dan `VITE_PUBLIC_DEMO=true`.
5. Tambahkan URL asal frontend (misalnya `https://contoh.vercel.app`) sebagai `DEMO_FRONTEND_ORIGIN` pada project backend, lalu deploy ulang backend. Coba login sebagai Admin, Guru, dan Orang tua.
6. Laporkan hasil uji ekspor PDF secara terpisah. Ekspor bawaan membutuhkan Chromium dan setup di atas belum menyediakan binari Chromium di Vercel.

### Deploy ke alwaysdata Free

Opsi ini tersedia jika akun alwaysdata sudah aktif. Halaman pendaftarannya dapat meminta verifikasi kartu. Alwaysdata menyediakan hosting Node.js dan MariaDB dalam satu akun. Pilih paket **Free** untuk demo portofolio. Gunakan basis data kosong yang terpisah dan isi dengan data sintetis.

1. Di panel alwaysdata, pilih Node.js 22 di **Environment → Node.js**. Di **Databases → MySQL**, buat database demo, satu pengguna untuk impor, dan satu pengguna dengan hak **READONLY** pada database tersebut.
2. Masuk ke SSH sesuai host dan username yang ditampilkan di panel. Jalankan perintah ini di sesi SSH:

   ```sh
   git clone https://github.com/priamitra273/monitoring-nilai-siswa.git
   cd monitoring-nilai-siswa
   npm --prefix Frontend ci
   VITE_API_URL=/api VITE_PUBLIC_DEMO=true npm --prefix Frontend run build
   PUPPETEER_SKIP_DOWNLOAD=true npm --prefix Backend ci --omit=dev
   ```

3. Impor kedua file SQL menggunakan akun impor. Ganti `HOST`, `USER_IMPOR`, dan `NAMA_DB` dengan nilai dari panel. Kedua perintah akan meminta password.

   ```sh
   mysql -h HOST -u USER_IMPOR -p NAMA_DB < Backend/database/schema.sql
   mysql -h HOST -u USER_IMPOR -p NAMA_DB < Backend/database/demo.sql
   ```

4. Buat `Backend/.env` dari `Backend/.env.example`. Isi `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, dan `DB_PASS` memakai kredensial pengguna **READONLY**. Buat rahasia JWT baru dengan `node -p "require('node:crypto').randomBytes(32).toString('hex')"`, masukkan ke `JWT_SECRET`, dan tambahkan `DEMO_MODE=true`. Hapus baris `PORT` agar port dikelola oleh alwaysdata. Batasi akses file dengan `chmod 600 Backend/.env`.
5. Di **Web → Sites**, pilih tipe **Node.js** dan alamat `NAMA_AKUN.alwaysdata.net` yang disediakan. Gunakan command `cd "$HOME/monitoring-nilai-siswa/Backend" && node src/app.js`. Aplikasi mengikuti IP dan port yang diberikan alwaysdata.
6. Buka `/api/health` dan pastikan responsnya `{"status":"ok"}`. Lalu buka halaman login dan coba ketiga peran. Unduhan PDF membutuhkan Chromium. Jika tersedia di server, tambahkan `PUPPETEER_EXECUTABLE_PATH` dengan path binarinya di `Backend/.env`, restart situs, lalu uji unduhan.

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
