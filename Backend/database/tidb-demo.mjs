import { readFileSync } from 'node:fs'

const readSql = (name) => readFileSync(new URL(name, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const schema = readSql('schema.sql')
const seed = readSql('demo.sql')
const [gradeTrigger] = schema.matchAll(/CREATE TRIGGER `nilai_calculate_insert`[\s\S]*?SET NEW\.nilai_akhir = ([\s\S]*?);/g)
const triggerBlocks = /^DELIMITER \$\$\n[\s\S]*?^DELIMITER ;\n/gm

if (!gradeTrigger || [...schema.matchAll(triggerBlocks)].length !== 4) {
  throw new Error('Periksa perubahan trigger di schema.sql sebelum membuat impor TiDB.')
}

const readonlySchema = schema
  .replace(triggerBlocks, '')
  .replace(/^ALTER TABLE `[^ `]+`\n  MODIFY `id` int\(11\) NOT NULL AUTO_INCREMENT;\n/gm, '')
  .replace(/^  `id` int\(11\) NOT NULL,/gm, '  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,')
  .replace(/^ALTER TABLE `[^ `]+`\n  ADD PRIMARY KEY \(`id`\);\n/gm, '')
  .replace(/^  ADD PRIMARY KEY \(`id`\),\n/gm, '')

const grade = gradeTrigger[1].replaceAll('NEW.', '')
const readonlySeed = seed.replace(/^COMMIT;$/m, `UPDATE guru SET status = 'aktif' WHERE user_id IS NOT NULL;\nUPDATE nilai SET nilai_akhir = ${grade};\nCOMMIT;`)

process.stdout.write(`-- Schema dan data sintetis untuk demo TiDB baca saja.\n${readonlySchema.trim()}\n\n${readonlySeed}`)
