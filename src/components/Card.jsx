import { useState } from 'react'

const WISHES = [
    { icon: '🌸', text: 'Sức khỏe dồi dào' },
    { icon: '😊', text: 'Luôn rạng rỡ' },
    { icon: '💪', text: 'Mạnh mẽ & tự tin' },
    { icon: '✨', text: 'Thành công rực rỡ' },
    { icon: '💖', text: 'Hạnh phúc mãi mãi' },
    { icon: '🌺', text: 'Tươi trẻ mỗi ngày' },
]

const SHARE_DATA = {
    title: '🌸 Chúc Mừng Ngày Quốc Tế Phụ Nữ 8/3!',
    text: '💐 Gửi đến những người phụ nữ tuyệt vời — chúc sức khỏe, hạnh phúc và luôn tỏa sáng! 🌷❤️',
    url: window.location.href,
}

export default function Card() {
    const [shareState, setShareState] = useState('idle') // 'idle' | 'sharing' | 'shared' | 'copied' | 'error'
    const [toast, setToast] = useState({ show: false, message: '', type: '' })

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3200)
    }

    const handleShare = async () => {
        setShareState('sharing')

        // ── Web Share API (native share sheet on mobile / supported browsers) ──
        if (navigator.share) {
            try {
                await navigator.share(SHARE_DATA)
                setShareState('shared')
                showToast('🎉 Thiệp đã được chia sẻ! 💖', 'success')
                fetch('/api/share', { method: 'POST' }).catch(() => { })
            } catch (err) {
                // User cancelled the share dialog — treat as idle, no error toast
                if (err.name !== 'AbortError') {
                    setShareState('error')
                    showToast('😢 Chia sẻ thất bại, thử lại nhé!', 'error')
                } else {
                    setShareState('idle')
                    return
                }
            }
            setTimeout(() => setShareState('idle'), 3500)
            return
        }

        // ── Fallback: copy link to clipboard ──
        try {
            await navigator.clipboard.writeText(
                `${SHARE_DATA.title}\n${SHARE_DATA.text}\n🔗 ${SHARE_DATA.url}`
            )
            setShareState('copied')
            showToast('📋 Đã sao chép liên kết! Dán vào tin nhắn để chia sẻ nhé 💕', 'copy')
            fetch('/api/share', { method: 'POST' }).catch(() => { })
        } catch {
            setShareState('error')
            showToast('😢 Không thể sao chép, hãy thử lại!', 'error')
        }

        setTimeout(() => setShareState('idle'), 3500)
    }

    const btnLabel = {
        idle: '🌸 Chia sẻ thiệp!',
        sharing: '⏳ Đang mở...',
        shared: '✅ Đã chia sẻ! 💕',
        copied: '📋 Đã sao chép!',
        error: '❌ Thử lại nhé',
    }[shareState]

    const toastClass = `toast${toast.show ? ' show' : ''}${toast.type === 'error' ? ' toast-error' : toast.type === 'copy' ? ' toast-copy' : ''}`

    return (
        <>
            <div className="card-wrapper">
                <div className="card">

                    {/* Header flowers */}
                    <span className="flowers-header">🌸💐🌷</span>

                    {/* Date badge */}
                    <div>
                        <span className="date-badge">
                            🗓️ Ngày 8 tháng 3
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="card-title">
                        Chúc Mừng Ngày<br />Quốc Tế Phụ Nữ
                    </h1>
                    <p className="card-subtitle">International Women's Day 🌍</p>

                    {/* Bouquet */}
                    <div className="bouquet-section" style={{ margin: '0 auto 26px' }}>
                        <div className="bouquet-circle">💐</div>
                        <span className="sparkle sparkle-1">✨</span>
                        <span className="sparkle sparkle-2">⭐</span>
                        <span className="sparkle sparkle-3">💫</span>
                    </div>

                    {/* Hearts row */}
                    <div className="hearts-row">
                        {['💖', '💝', '🩷', '💗', '❤️'].map((heart, i) => (
                            <span key={i} className="heart">{heart}</span>
                        ))}
                    </div>

                    {/* Message */}
                    <div className="message-box">
                        <p className="message-text">
                            Gửi đến những người phụ nữ <em>tuyệt vời</em> —
                            cảm ơn vì đã luôn tỏa sáng, <em>mạnh mẽ</em> và
                            mang lại <em>yêu thương</em> cho thế giới này 🌷
                        </p>
                    </div>

                    {/* Wishes grid */}
                    <div className="wishes-grid">
                        {WISHES.map(({ icon, text }, i) => (
                            <div key={i} className="wish-item">
                                <span className="wish-icon">{icon}</span>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Ribbon */}
                    <div className="ribbon">
                        <div className="ribbon-line" />
                        <span className="ribbon-text">💌 Gửi yêu thương tới bạn 💌</span>
                        <div className="ribbon-line" />
                    </div>

                    {/* Footer */}
                    <div className="card-footer">
                        <button
                            className={`share-btn ${shareState !== 'idle' ? 'sent' : ''}`}
                            onClick={handleShare}
                            disabled={shareState === 'sharing'}
                            id="share-card-btn"
                        >
                            {btnLabel}
                        </button>
                        <div className="date-text">
                            🌹 8/3/2026<br />
                            <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>Ngày của những người phụ nữ</span>
                        </div>
                    </div>

                    {/* Share hint — shown when Web Share API not available */}
                    {!navigator.share && (
                        <p className="share-hint">
                            💡 Trình duyệt này không hỗ trợ chia sẻ trực tiếp — nhấn nút để sao chép liên kết!
                        </p>
                    )}

                </div>
            </div>

            {/* Toast */}
            <div className={toastClass}>
                {toast.message}
            </div>
        </>
    )
}
