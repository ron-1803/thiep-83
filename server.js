import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { insertEvent, getStats, getRecent, insertCard, getCard } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────────
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Skip ngrok's browser warning interstitial (allows phones to open directly)
app.use((_req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true')
    next()
})

// Helper to get real IP (behind ngrok / proxy)
const getIP = (req) =>
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

// ── API Routes ──────────────────────────────────────────────

/**
 * POST /api/view
 * Record a page view event
 */
app.post('/api/view', (req, res) => {
    try {
        insertEvent.run('view', getIP(req), req.headers['user-agent'] ?? '')
        res.json({ ok: true, message: 'View recorded 👁️' })
    } catch (err) {
        console.error('[/api/view]', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

/**
 * POST /api/share
 * Record a share event
 */
app.post('/api/share', (req, res) => {
    try {
        insertEvent.run('share', getIP(req), req.headers['user-agent'] ?? '')
        res.json({ ok: true, message: 'Share recorded 💌' })
    } catch (err) {
        console.error('[/api/share]', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

/**
 * GET /api/stats
 * Return aggregate statistics + recent 20 events
 */
app.get('/api/stats', (req, res) => {
    try {
        const stats = getStats.get()
        const recent = getRecent.all(20)
        res.json({
            ok: true,
            stats: {
                total_events: stats.total_events ?? 0,
                views: stats.views ?? 0,
                shares: stats.shares ?? 0,
            },
            recent,
        })
    } catch (err) {
        console.error('[/api/stats]', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

/**
 * POST /api/cards
 * Save card data and return a short ID
 */
app.post('/api/cards', (req, res) => {
    try {
        const { sender, recipient, message, photo } = req.body
        if (!sender || !recipient || !message) {
            return res.status(400).json({ ok: false, error: 'Thiếu thông tin bắt buộc' })
        }

        // Generate a 6-character hex short ID
        const id = crypto.randomBytes(3).toString('hex')
        insertCard.run(id, sender, recipient, message, photo || null)

        res.json({ ok: true, id })
    } catch (err) {
        console.error('[/api/cards POST]', err)
        res.status(500).json({ ok: false, error: 'Lỗi server khi lưu thiệp' })
    }
})

/**
 * GET /api/cards/:id
 * Retrieve card data by short ID
 */
app.get('/api/cards/:id', (req, res) => {
    try {
        const card = getCard.get(req.params.id)
        if (!card) return res.status(404).json({ ok: false, error: 'Không tìm thấy thiệp' })

        res.json({
            ok: true,
            data: {
                sender: card.sender,
                recipient: card.recipient,
                message: card.message,
                photo: card.photo,
            }
        })
    } catch (err) {
        console.error('[/api/cards GET]', err)
        res.status(500).json({ ok: false, error: 'Lỗi server khi xem thiệp' })
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
