import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/data/data.db'
  : path.join(__dirname, 'data.db')


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

  CREATE TABLE IF NOT EXISTS cards (
    id         TEXT PRIMARY KEY,
    sender     TEXT NOT NULL,
    recipient  TEXT NOT NULL,
    message    TEXT NOT NULL,
    photo      TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`)

// Prepared statements
export const insertEvent = db.prepare(
  `INSERT INTO events (type, ip, user_agent) VALUES (?, ?, ?)`
)

export const insertCard = db.prepare(
  `INSERT INTO cards (id, sender, recipient, message, photo) VALUES (?, ?, ?, ?, ?)`
)

export const getCard = db.prepare(
  `SELECT id, sender, recipient, message, photo, created_at FROM cards WHERE id = ?`
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
