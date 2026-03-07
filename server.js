import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { insertEvent, getStats, getRecent } from './db.js'

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
