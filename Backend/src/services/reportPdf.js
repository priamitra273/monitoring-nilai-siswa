import PDFDocument from 'pdfkit'

const labels = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpha: 'Alpa' }
const show = (value) => value == null || value === '' ? '-' : String(value)
const period = (year, semester) => [year, semester].filter(Boolean).join(' / ')

export function renderReportPDF(data) {
  const { siswa, role } = data
  const title = role === 'admin' ? 'Transkrip Nilai Siswa' : 'Laporan Perkembangan Siswa'

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: title } })
    const chunks = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.once('end', () => resolve(Buffer.concat(chunks)))
    doc.once('error', reject)

    doc.fillColor('#0f766e').font('Helvetica-Bold').fontSize(12).text('SDN 1 LANGENSARI')
    doc.moveDown(0.4).fillColor('#172033').fontSize(21).text(title)
    doc.moveDown(0.75).font('Helvetica').fontSize(11)

    const row = (label, value) => doc.text(`${label}: ${show(value)}`, { lineGap: 3 })
    const heading = (label) => {
      const remaining = doc.page.height - doc.page.margins.bottom - doc.y
      if (remaining < 62) doc.addPage()
      doc.moveDown(0.75).font('Helvetica-Bold').fontSize(13).text(label)
      doc.moveDown(0.3).font('Helvetica').fontSize(11)
    }
    const grades = (items) => {
      if (!items?.length) doc.text('Belum ada nilai.')
      for (const item of items ?? []) {
        const score = item.nilai_akhir == null ? '-' : Number(item.nilai_akhir).toFixed(2)
        const grade = item.grade && item.grade !== '-' ? ` (${item.grade})` : ''
        row(item.nama_mapel, score + grade)
      }
    }
    const attendance = (stats = {}) => {
      doc.text(Object.entries(labels).map(([key, label]) => `${label}: ${stats[key] ?? 0}`).join('   |   '))
    }

    row('Nama', siswa.nama)
    row('NISN', siswa.nisn)
    row('Kelas', siswa.kelas ?? siswa.kelas_nama ?? data.kelas)
    if (role === 'admin') {
      if (!data.riwayat_nilai.length) doc.text('Belum ada riwayat nilai.')
      for (const term of data.riwayat_nilai) {
        heading(period(term.tahun_ajaran, term.semester))
        row('Kelas', term.kelas)
        grades(term.nilai)
        attendance(term.absensi)
      }
    } else {
      const year = typeof data.tahunAjaran === 'string' ? data.tahunAjaran : data.tahunAjaran?.tahun
      row('Tahun ajaran / semester', period(year, data.semester ?? data.tahunAjaran?.semester))
      row('Wali kelas', data.wali_kelas ?? data.guru?.nama ?? data.guru?.nama_lengkap)
      heading('Nilai Akademik')
      grades(data.nilai_akademik)
      heading('Rekapitulasi Absensi')
      attendance(data.absensi)
      heading('Catatan Perkembangan')
      if (!data.catatan_perkembangan.length) doc.text('Belum ada catatan.')
      for (const note of data.catatan_perkembangan) {
        doc.font('Helvetica-Bold').text([note.tanggal_formatted, note.guru_nama].filter(Boolean).join(' / '))
        doc.font('Helvetica').text(show(note.isi_catatan), { lineGap: 3 }).moveDown(0.4)
      }
      if (data.catatan_wali_kelas) {
        heading('Catatan Wali Kelas')
        doc.text(data.catatan_wali_kelas, { lineGap: 3 })
      }
    }
    doc.moveDown().fontSize(9).fillColor('#475569').text(`Dicetak ${show(data.tanggal_cetak)}`)
    doc.end()
  })
}
