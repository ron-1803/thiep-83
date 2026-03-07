import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// On Render: use /data (persistent disk). Locally: use project root.
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : __dirname
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
const DB_PATH = path.join(DATA_DIR, 'data.db')


const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL CHECK(type IN ('view', 'share')),
    ip         TEXT,
    user_agent TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`)

// Prepared statements
export const insertEvent = db.prepare(
  `INSERT INTO events (type, ip, user_agent) VALUES (?, ?, ?)`
)

export const getStats = db.prepare(`
  SELECT
    COUNT(*)                                         AS total_events,
    SUM(CASE WHEN type = 'view'  THEN 1 ELSE 0 END) AS views,
    SUM(CASE WHEN type = 'share' THEN 1 ELSE 0 END) AS shares
  FROM events
`)

export const getRecent = db.prepare(`
  SELECT id, type, ip, created_at FROM events
  ORDER BY id DESC LIMIT ?
`)

export default db
