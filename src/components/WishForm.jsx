import { useState, useRef } from 'react'

const PRESET_MESSAGES = [
    'Chúc bạn luôn xinh đẹp, tràn đầy sức sống và hạnh phúc mỗi ngày! 🌸',
    'Cảm ơn vì những gì bạn đã cống hiến. Chúc bạn luôn mạnh mẽ và tỏa sáng! 💪✨',
    'Gửi đến người phụ nữ tuyệt vời nhất — chúc bạn sức khỏe, thành công và hạnh phúc! 💖',
    'Mỗi ngày bạn hiện diện là mỗi ngày thế giới thêm rực rỡ. Chúc mừng ngày 8/3! 🌷',
]

export default function WishForm({ onComplete }) {
    const [sender, setSender] = useState('')
    const [recipient, setRecipient] = useState('')
    const [message, setMessage] = useState('')
    const [photo, setPhoto] = useState(null)   // base64 data URL
    const [errors, setErrors] = useState({})
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef(null)

    const readFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        const MAX = 2 * 1024 * 1024
        if (file.size > MAX) {
            const img = new Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(url)
                const canvas = document.createElement('canvas')
                const maxDim = 800
                let w = img.width, h = img.height
                if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim }
                else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim }
                canvas.width = w; canvas.height = h
                canvas.getContext('2d').drawImage(img, 0, 0, w, h)
                setPhoto(canvas.toDataURL('image/jpeg', 0.78))
            }
            img.src = url
        } else {
            const reader = new FileReader()
            reader.onload = (e) => setPhoto(e.target.result)
            reader.readAsDataURL(file)
        }
    }

    const handleFileChange = (e) => readFile(e.target.files[0])
    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        readFile(e.dataTransfer.files[0])
    }
    const removePhoto = () => {
        setPhoto(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const validate = () => {
        const e = {}
        if (!sender.trim()) e.sender = 'Vui lòng nhập tên người gửi'
        if (!recipient.trim()) e.recipient = 'Vui lòng nhập tên người nhận'
        if (!message.trim()) e.message = 'Vui lòng nhập lời chúc'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return
        onComplete({ sender: sender.trim(), recipient: recipient.trim(), message: message.trim(), photo })
    }

    const usePreset = (text) => {
        setMessage(text)
        setErrors(prev => ({ ...prev, message: undefined }))
    }

    return (
        <div className="wish-form-wrapper">
            <div className="wish-form-card">

                <span className="form-flowers">✍️🌸💌</span>
                <h2 className="form-title">Ghi Lời Chúc</h2>
                <p className="form-subtitle">Tạo thiệp chúc mừng riêng của bạn</p>

                <form onSubmit={handleSubmit} noValidate>

                    {/* Recipient */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="recipient">
                            💐 Gửi đến
                        </label>
                        <input
                            id="recipient"
                            className={`form-input ${errors.recipient ? 'input-error' : ''}`}
                            type="text"
                            placeholder="Tên người nhận (vd: Mẹ, Chị, Bạn Mai...)"
                            value={recipient}
                            onChange={e => { setRecipient(e.target.value); setErrors(p => ({ ...p, recipient: undefined })) }}
                            maxLength={40}
                        />
                        {errors.recipient && <span className="error-text">{errors.recipient}</span>}
                    </div>

                    {/* Sender */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="sender">
                            🖊️ Người gửi
                        </label>
                        <input
                            id="sender"
                            className={`form-input ${errors.sender ? 'input-error' : ''}`}
                            type="text"
                            placeholder="Tên bạn (vd: Con, Em, Anh Nam...)"
                            value={sender}
                            onChange={e => { setSender(e.target.value); setErrors(p => ({ ...p, sender: undefined })) }}
                            maxLength={40}
                        />
                        {errors.sender && <span className="error-text">{errors.sender}</span>}
                    </div>

                    {/* Photo upload */}
                    <div className="form-group">
                        <label className="form-label">📷 Ảnh người nhận <span className="optional-tag">tuỳ chọn</span></label>

                        {photo ? (
                            <div className="photo-preview-wrap">
                                <img src={photo} alt="preview" className="photo-preview-img" />
                                <button type="button" className="photo-remove-btn" onClick={removePhoto} title="Xoá ảnh">✕</button>
                                <span className="photo-preview-label">✅ Ảnh đã chọn</span>
                            </div>
                        ) : (
                            <div
                                className={`photo-drop-zone ${dragOver ? 'drag-over' : ''} ${errors.photo ? 'input-error' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                id="photo-drop-zone"
                            >
                                <span className="photo-drop-icon">🌸</span>
                                <span className="photo-drop-text">Nhấn hoặc kéo ảnh vào đây</span>
                                <span className="photo-drop-sub">JPG, PNG, WEBP — Tối đa 5 MB</span>
                            </div>
                        )}
                        {errors.photo && <span className="error-text" style={{ display: 'block', marginTop: '4px' }}>{errors.photo}</span>}

                        <input
                            ref={fileInputRef}
                            id="photo-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Message */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="message">
                            💬 Lời chúc
                        </label>
                        <textarea
                            id="message"
                            className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                            placeholder="Nhập lời chúc của bạn tại đây..."
                            value={message}
                            onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: undefined })) }}
                            maxLength={200}
                            rows={4}
                        />
                        <div className="char-count">{message.length}/200</div>
                        {errors.message && <span className="error-text">{errors.message}</span>}
                    </div>

                    {/* Preset messages */}
                    <div className="form-group">
                        <label className="form-label">💡 Gợi ý lời chúc</label>
                        <div className="presets-list">
                            {PRESET_MESSAGES.map((text, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="preset-btn"
                                    onClick={() => usePreset(text)}
                                    title={text}
                                >
                                    {text.length > 60 ? text.slice(0, 60) + '…' : text}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary form-submit-btn"
                        disabled={isUploading}
                    >
                        {isUploading ? 'Đang chuẩn bị ảnh...' : '🎨 Tạo thiệp ngay!'}
                    </button>
                </form>

            </div>
        </div>
    )
}
