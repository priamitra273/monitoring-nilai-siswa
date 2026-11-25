import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const secureCa = process.env.DB_SSL_CA_BASE64;
const useTls = process.env.VERCEL === '1' || Boolean(secureCa);
const options = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  socketPath: process.env.DB_SOCKET || undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME,
  ...(useTls && {
    ssl: {
      ...(secureCa && { ca: Buffer.from(secureCa, 'base64') }),
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
      verifyIdentity: true,
    },
  }),
};

const db = process.env.VERCEL === '1'
  ? mysql.createPool({ ...options, connectionLimit: 3, maxIdle: 1, idleTimeout: 30_000 })
  : mysql.createConnection(options);

if (process.env.VERCEL !== '1') {
  db.connect((err) => {
    if (err) {
      console.error("❌ Database gagal terkoneksi:", err.message);
      return;
    }
    console.log("✅ Database MySQL terkoneksi");
  });
}

export default db;
