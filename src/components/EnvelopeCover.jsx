import { useState } from 'react'

export default function EnvelopeCover({ recipient, onOpen }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isFading, setIsFading] = useState(false)

    const handleOpen = () => {
        if (isOpen || isFading) return
        setIsOpen(true)

        // Chờ 0.8s để nắp lật xong, rồi từ từ fade out nguyên phong bì 
        setTimeout(() => {
            setIsFading(true)

            // Xong hiệu ứng fadeout, gọi callback để CardPreview hiện nội dung ra
            setTimeout(() => {
                if (onOpen) onOpen()
            }, 500)

        }, 800)
    }

    return (
        <div className={`envelope-wrapper ${isFading ? 'envelope-fade-out' : ''}`}>
            <div className={`envelope-container ${isOpen ? 'is-open' : ''}`} onClick={handleOpen}>

                {/* Lớp thiệp thò ra nhô nhô bên trong khi mở */}
                <div className="envelope-card-hint">
                    <div className="card-hint-header">🌸💐🌷</div>
                </div>

                {/* Nắp Dưới */}
                <div className="envelope-bottom" />

                {/* Nắp Trên (có thể lật 3d) */}
                <div className="envelope-flap" />

                {/* Nhãn/Seal dán lên trên */}
                {!isOpen && (
                    <div className="envelope-seal">
                        <span className="seal-heart">💖</span>
                        <p className="seal-text">Gửi đến {recipient || 'bạn'}</p>
                        <p className="seal-tap">Nhấn để mở quà!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
