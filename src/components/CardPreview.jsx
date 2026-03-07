import { useState } from 'react'
import GiftGame from './GiftGame'

export default function CardPreview({ data, onBack }) {
    const { sender, recipient, message, photo } = data

    const [shareState, setShareState] = useState('idle')
    const [toast, setToast] = useState({ show: false, message: '', type: '' })

    const buildShareUrl = () => {
        const base = `${window.location.origin}${window.location.pathname}`
        const params = new URLSearchParams({ r: recipient, s: sender, m: message })
        return `${base}?${params.toString()}`
    }

    const shareUrl = buildShareUrl()
    const shareData = {
        title: `🌸 Thiệp Chúc Mừng Ngày 8/3 từ ${sender}`,
        text: `💐 Gửi đến ${recipient}: ${message} 🌷`,
        url: shareUrl,
    }

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3200)
    }

    const handleShare = async () => {
        setShareState('sharing')

        if (navigator.share) {
            try {
                await navigator.share(shareData)
                setShareState('shared')
                showToast('🎉 Thiệp đã được chia sẻ! 💖', 'success')
                fetch('/api/share', { method: 'POST' }).catch(() => { })
            } catch (err) {
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

        try {
            const clipText = `${shareData.title}\n${shareData.text}\n🔗 ${shareUrl}`
            await navigator.clipboard.writeText(clipText)
            setShareState('copied')
            showToast('📋 Đã sao chép link thiệp! Dán vào tin nhắn để chia sẻ nhé 💕', 'copy')
            fetch('/api/share', { method: 'POST' }).catch(() => { })
        } catch {
            setShareState('error')
            showToast('😢 Không thể sao chép, hãy thử lại!', 'error')
        }
        setTimeout(() => setShareState('idle'), 3500)
    }

    const btnLabel = {
        idle: '🌸 Chia sẻ với bạn bè',
        sharing: '⏳ Đang mở...',
        shared: '✅ Đã chia sẻ! 💕',
        copied: '📋 Đã sao chép!',
        error: '❌ Thử lại nhé',
    }[shareState]

    const toastClass = `toast${toast.show ? ' show' : ''}${toast.type === 'error' ? ' toast-error' : toast.type === 'copy' ? ' toast-copy' : ''}`

    return (
        <>
            <div className="preview-wrapper">

                {/* ── Top decorative banner ── */}
                <div className="preview-banner">
                    <span className="preview-banner-text">🌸 Ngày Quốc Tế Phụ Nữ 8/3 🌸</span>
                </div>

                {/* ── Main card body ── */}
                <div className="preview-card">

                    {/* Header flowers */}
                    <span className="flowers-header">🌸💐🌷</span>

                    <div>
                        <span className="date-badge">🗓️ Ngày 8 tháng 3</span>
                    </div>

                    <h1 className="card-title">Chúc Mừng Ngày<br />Quốc Tế Phụ Nữ</h1>
                    <p className="card-subtitle">International Women's Day 🌍</p>

                    {/* ── Recipient Photo (Main Focus) ── */}
                    <div className="recipient-photo-frame">
                        <div className="photo-wrapper-with-stickers">
                            {photo ? (
                                <img src={photo} alt={recipient} className="recipient-photo-img" />
                            ) : (
                                <div className="recipient-photo-placeholder">
                                    <span>💐</span>
                                </div>
                            )}
                            {/* Cute Stickers */}
                            <span className="photo-sticker sticker-1">✨</span>
                            <span className="photo-sticker sticker-2">🎀</span>
                            <span className="photo-sticker sticker-3">🌸</span>
                            <span className="photo-sticker sticker-4">💖</span>
                        </div>
                        <div className="recipient-photo-badge">Gửi đến {recipient}</div>
                    </div>

                    {/* Hearts */}
                    <div className="hearts-row" style={{ marginTop: '16px' }}>
                        {['💖', '💝', '🩷', '💗', '❤️'].map((h, i) => (
                            <span key={i} className="heart">{h}</span>
                        ))}
                    </div>

                    {/* Message */}
                    <div className="message-box">
                        <p className="message-text">{message}</p>
                    </div>

                    {/* Ribbon */}
                    <div className="ribbon" style={{ marginTop: '22px' }}>
                        <div className="ribbon-line" />
                        <span className="ribbon-text">💌 Từ {sender} với tất cả tình yêu 💌</span>
                        <div className="ribbon-line" />
                    </div>

                    {/* Actions */}
                    <div className="preview-actions">
                        <button
                            className={`share-btn ${shareState !== 'idle' ? 'sent' : ''}`}
                            onClick={handleShare}
                            disabled={shareState === 'sharing'}
                            id="share-preview-btn"
                        >
                            {btnLabel}
                        </button>

                        <button
                            className="back-btn"
                            onClick={onBack}
                            id="back-to-form-btn"
                        >
                            ✏️ Sửa lời chúc
                        </button>
                    </div>

                    {!navigator.share && (
                        <p className="share-hint">
                            💡 Nhấn nút để sao chép link thiệp, dán vào tin nhắn là bạn bè mở được ngay!
                        </p>
                    )}

                </div>
            </div>

            {/* ── Minigame ── */}
            <GiftGame />

            <div className={toastClass}>{toast.message}</div>
        </>
    )
}
