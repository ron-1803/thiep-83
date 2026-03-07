import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { insertEvent, getStats, getRecent, insertCard, getCard } from './db.js'
import dotenv from 'dotenv'

// Cloudflare R2 Imports
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import crypto from 'crypto'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// ── Cloudflare R2 Configuration ──────────────────────────────
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'thiep83-images'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY || '',
        secretAccessKey: R2_SECRET_KEY || ''
    }
})

// Multer middleware: store in memory (RAM) buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit max
})

// ── Middleware ──────────────────────────────────────────────
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Skip ngrok's browser warning interstitial
app.use((_req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true')
    next()
})

const getIP = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'

// ── API Routes ──────────────────────────────────────────────

/**
 * POST /api/upload
 * Nhận file từ WishForm Frontend và put lên R2.
 */
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image provided' })
        }
        if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
            console.error('Missing R2 environment variables. Check Render Dashboard.')
            return res.status(500).json({ success: false, error: 'R2 Server Not Configured' })
        }

        // Tạo tên file ngẫu nhiên chống trùng lặp
        const ext = path.extname(req.file.originalname) || '.jpg'
        const rawFileName = crypto.randomBytes(8).toString('hex') + ext
        const keyName = `photos/${rawFileName}`

        // Build put command
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: keyName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype || 'image/jpeg'
        })

        await s3Client.send(command)

        // Tạo URL có thể xem công khai
        const publicUrl = `${R2_PUBLIC_URL}/${keyName}`

        res.json({ success: true, url: publicUrl })

    } catch (err) {
        console.error('[/api/upload error]:', err)
        res.status(500).json({ success: false, error: 'Failed to upload photo to R2 block storage' })
    }
})

/**
 * POST /api/cards
 * Nhận dữ liệu thiệp và tạo mã ID
 */
app.post('/api/cards', (req, res) => {
    try {
        const { sender, recipient, message, photo } = req.body
        if (!sender || !recipient || !message) {
            return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' })
        }

        let id = crypto.randomBytes(3).toString('hex') // mã ngắn 6 kí tự
        // Đảm bảo ID không bị trùng lặp
        while (getCard.get(id)) {
            id = crypto.randomBytes(3).toString('hex')
        }

        insertCard.run(id, sender, recipient, message, photo || null)
        res.json({ success: true, id })
    } catch (err) {
        console.error('[/api/cards]', err)
        res.status(500).json({ success: false, error: err.message })
    }
})

/**
 * GET /api/cards/:id
 * Truy xuất thông tin thiệp
 */
app.get('/api/cards/:id', (req, res) => {
    try {
        const card = getCard.get(req.params.id)
        if (!card) {
            return res.status(404).json({ success: false, error: 'Card not found' })
        }
        res.json({ success: true, data: card })
    } catch (err) {
        console.error('[/api/cards/:id]', err)
        res.status(500).json({ success: false, error: err.message })
    }
})

app.post('/api/view', (req, res) => {
    try {
        insertEvent.run('view', getIP(req), req.headers['user-agent'] ?? '')
        res.json({ ok: true, message: 'View recorded 👁️' })
    } catch (err) {
        console.error('[/api/view]', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

app.post('/api/share', (req, res) => {
    try {
        insertEvent.run('share', getIP(req), req.headers['user-agent'] ?? '')
        res.json({ ok: true, message: 'Share recorded 💌' })
    } catch (err) {
        console.error('[/api/share]', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

app.get('/api/stats', (req, res) => {
    try {
        const stats = getStats.get()
        const recent = getRecent.all(20)
        res.json({
            ok: true,
            stats: { total_events: stats.total_events ?? 0, views: stats.views ?? 0, shares: stats.shares ?? 0 },
            recent,
        })
    } catch (err) {
        console.error('[/api/stats]', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})


// ── Serve React build (production) ─────────────────────────
const DIST = path.join(__dirname, 'dist')
app.use(express.static(DIST))

// SPA fallback — all unknown routes → index.html
app.use((_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
})

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('')
    console.log('  🌸 Women\'s Day Card — Backend Server')
    console.log('  ─────────────────────────────────────')
    console.log(`  🚀 Running at  http://localhost:${PORT}`)
    console.log(`  📊 Stats API   http://localhost:${PORT}/api/stats`)
    console.log('')
})
