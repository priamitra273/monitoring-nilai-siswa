import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import db from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import adminKelasRoutes from './routes/admin/kelasRoutes.js'
import adminTahunAjaranRoutes from './routes/admin/tahunAjaranRoutes.js'
import adminSiswaRoutes from './routes/admin/siswaRoutes.js'
import adminGuruRoutes from './routes/admin/guruRoutes.js'
import adminOrtuRoutes from './routes/admin/ortuRoutes.js'
import adminUserRoutes from './routes/admin/userRoutes.js'
import adminDashboardRoutes from './routes/admin/dashboardRoutes.js'
import adminLaporanRoutes from './routes/admin/laporanRoutes.js'
import guruAbsensiRoutes from './routes/guru/absensiRoutes.js'
import guruCatatanRoutes from './routes/guru/catatanRoutes.js'
import guruNilaiRoutes from './routes/guru/nilaiRoutes.js'
import guruChatRoutes from './routes/guru/chatRoutes.js'
import guruLaporanRoutes from './routes/guru/laporanRoutes.js'
import guruDashboardRoutes from './routes/guru/dashboardRoutes.js'
import ortuDashboardRoutes from './routes/ortu/dashboardRoutes.js'
import ortuNilaiRoutes from './routes/ortu/nilaiRoutes.js'
import ortuAbsensiRoutes from './routes/ortu/absensiRoutes.js'
import ortuCatatanRoutes from './routes/ortu/catatanRoutes.js'
import ortuChatRoutes from './routes/ortu/chatRoutes.js'
import ortuLaporanRoutes from './routes/ortu/laporanRoutes.js'

import { errorHandler } from './middlewares/errorMiddleware.js'

dotenv.config()
const app = express()
const demo = process.env.DEMO_MODE === 'true'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET wajib diisi')
if (!demo) app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  db.query('SELECT 1', (error) => {
    res.status(error ? 503 : 200).json({ status: error ? 'unavailable' : 'ok' })
  })
})

if (demo) {
  const allowedPosts = new Set([
    '/auth/login',
    '/admin/laporan/transkrip/bulk',
    '/guru/laporan/download-perkembangan',
    '/ortu/laporan/download-pdf',
  ])

  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD'].includes(req.method) ||
        (req.method === 'POST' && allowedPosts.has(req.path))) {
      return next()
    }
    res.status(403).json({ status: 'error', message: 'Demo publik hanya mendukung akses baca.' })
  })
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin/kelas', adminKelasRoutes) // Admin routes
app.use('/api/admin/tahun-ajaran', adminTahunAjaranRoutes) // Admin tahun ajaran routes
app.use('/api/admin/siswa', adminSiswaRoutes) // Admin siswa routes
app.use('/api/admin/guru', adminGuruRoutes) // Admin guru routes
app.use('/api/admin/ortu', adminOrtuRoutes) // Admin ortu routes
app.use('/api/admin/users', adminUserRoutes) // Admin user routes
app.use('/api/admin/dashboard', adminDashboardRoutes) // Admin dashboard routes
app.use('/api/admin/laporan', adminLaporanRoutes) // Admin laporan routes
app.use('/api/guru/absensi', guruAbsensiRoutes) // Guru absensi routes
app.use('/api/guru/catatan', guruCatatanRoutes) // Guru catatan routes
app.use('/api/guru/nilai', guruNilaiRoutes) // Guru nilai routes
app.use('/api/guru/chat', guruChatRoutes) // Guru chat routes
app.use('/api/guru/laporan', guruLaporanRoutes) // Guru laporan routes
app.use('/api/guru/dashboard', guruDashboardRoutes) // Guru dashboard routes
app.use('/api/ortu/dashboard', ortuDashboardRoutes) // Ortu dashboard routes
app.use('/api/ortu/nilai', ortuNilaiRoutes) // Ortu nilai routes
app.use('/api/ortu/absensi', ortuAbsensiRoutes) // Ortu absensi routes
app.use('/api/ortu/catatan', ortuCatatanRoutes) // Ortu catatan routes
app.use('/api/ortu/chat', ortuChatRoutes) // Ortu chat routes
app.use('/api/ortu/laporan', ortuLaporanRoutes) // Ortu laporan routes

app.use('/api', (_req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint tidak ditemukan' })
})

if (demo) {
  const frontendDir = fileURLToPath(new URL('../../Frontend/dist/', import.meta.url))
  app.use(express.static(frontendDir))
  app.get('/{*spa}', (_req, res) => res.sendFile(path.join(frontendDir, 'index.html')))
}

// Middleware error (taruh paling bawah)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(chalk.cyan.bold('====================================='))
  console.log(chalk.green.bold('🚀 Server berhasil dijalankan!'))
  console.log(chalk.yellow(`📡 URL: http://localhost:${PORT}`))
  console.log(chalk.cyan.bold('====================================='))
})
