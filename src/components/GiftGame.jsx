import { useState, useRef, useCallback, useEffect } from 'react'

const SECRET_WISHES = [
    { emoji: '🌹', text: 'Bạn xứng đáng được yêu thương mỗi ngày!' },
    { emoji: '✨', text: 'Hãy luôn tỏa sáng theo cách của riêng bạn!' },
    { emoji: '🦋', text: 'Mỗi ngày là một trang mới tuyệt vời!' },
    { emoji: '💎', text: 'Bạn quý giá hơn tất cả những gì bạn nghĩ!' },
    { emoji: '🌸', text: 'Hạnh phúc luôn ở gần bạn, chỉ cần nhìn thật kỹ!' },
    { emoji: '🎀', text: 'Bạn là món quà tuyệt vời nhất của cuộc đời!' },
    { emoji: '🌟', text: 'Ngôi sao sáng nhất chính là bạn đó!' },
    { emoji: '💖', text: 'Yêu bản thân là bước đầu tiên đến hạnh phúc!' },
    { emoji: '🍀', text: 'May mắn luôn đồng hành cùng bạn!' },
    { emoji: '🌈', text: 'Sau mưa trời lại sáng — bạn làm được!' },
]

const CONFETTI_COLORS = ['#FF8FAB', '#FF4D7D', '#FFD700', '#C8B6E2', '#A8C5F0', '#6FCF97', '#F9C7E0']
const MAX_CLICKS = 15

function randomBetween(a, b) { return a + Math.random() * (b - a) }

export default function GiftGame() {
    const [clicks, setClicks] = useState(0)
    const [opened, setOpened] = useState(false)
    const [wish, setWish] = useState(null)
    const [confetti, setConfetti] = useState([])
    const [shaking, setShaking] = useState(false)
    const [miniHearts, setMiniHearts] = useState([])
    const [playAgain, setPlayAgain] = useState(false)
    const timerRef = useRef(null)
    const heartIdRef = useRef(0)
    const confettiIdRef = useRef(0)

    const progress = Math.min((clicks / MAX_CLICKS) * 100, 100)

    // spawn a floating heart on each click
    const spawnHeart = useCallback(() => {
        const id = ++heartIdRef.current
        const emojis = ['💖', '💕', '❤️', '🩷', '💗']
        setMiniHearts(h => [...h, {
            id,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: randomBetween(20, 80),
            duration: randomBetween(0.8, 1.4),
        }])
        setTimeout(() => setMiniHearts(h => h.filter(x => x.id !== id)), 1500)
    }, [])

    // spawn confetti burst
    const spawnConfetti = useCallback(() => {
        const pieces = Array.from({ length: 28 }, (_, i) => ({
            id: ++confettiIdRef.current + i,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            x: randomBetween(5, 95),
            rotation: randomBetween(-360, 360),
            scale: randomBetween(0.6, 1.4),
            duration: randomBetween(0.9, 1.6),
            delay: randomBetween(0, 0.3),
            shape: Math.random() > 0.5 ? 'circle' : 'rect',
        }))
        setConfetti(pieces)
        setTimeout(() => setConfetti([]), 2000)
    }, [])

    const handleBoxClick = useCallback(() => {
        if (opened) return

        // shake animation
        setShaking(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setShaking(false), 400)

        spawnHeart()

        setClicks(prev => {
            const next = prev + 1
            if (next >= MAX_CLICKS) {
                // open!
                setTimeout(() => {
                    setOpened(true)
                    setWish(SECRET_WISHES[Math.floor(Math.random() * SECRET_WISHES.length)])
                    spawnConfetti()
                }, 150)
            }
            return next
        })
    }, [opened, spawnHeart, spawnConfetti])

    const handleReset = () => {
        setClicks(0)
        setOpened(false)
        setWish(null)
        setConfetti([])
        setMiniHearts([])
        setPlayAgain(p => !p)
    }

    useEffect(() => () => clearTimeout(timerRef.current), [])

    const lidAngle = Math.min((clicks / MAX_CLICKS) * 45, 45)

    return (
        <div className="gift-game">
            <p className="gift-game-label">🎁 Tap để mở hộp quà bí ẩn!</p>

            <div className="gift-game-arena" onClick={handleBoxClick} style={{ cursor: opened ? 'default' : 'pointer' }}>

                {/* floating mini hearts */}
                {miniHearts.map(h => (
                    <span
                        key={h.id}
                        className="mini-heart"
                        style={{ left: `${h.x}%`, animationDuration: `${h.duration}s` }}
                    >{h.emoji}</span>
                ))}

                {/* confetti */}
                {confetti.map(c => (
                    <span
                        key={c.id}
                        className={`confetti-piece ${c.shape}`}
                        style={{
                            left: `${c.x}%`,
                            background: c.color,
                            transform: `scale(${c.scale}) rotate(${c.rotation}deg)`,
                            animationDuration: `${c.duration}s`,
                            animationDelay: `${c.delay}s`,
                        }}
                    />
                ))}

                {/* Gift box SVG */}
                <div className={`gift-box-wrap ${shaking ? 'shaking' : ''} ${opened ? 'opened' : ''}`}>
                    {/* LID */}
                    <div className="gift-lid" style={{ transform: `rotateX(${lidAngle}deg)` }}>
                        <div className="gift-lid-face" />
                        <div className="gift-bow">🎀</div>
                    </div>

                    {/* BOX BODY */}
                    <div className="gift-body">
                        {opened && wish ? (
                            <div className="gift-reveal">
                                <span className="gift-reveal-emoji">{wish.emoji}</span>
                            </div>
                        ) : (
                            <div className="gift-ribbon-v" />
                        )}
                    </div>
                </div>

                {/* opened wish text */}
                {opened && wish && (
                    <div className="gift-wish-text">
                        <p>✨ {wish.text}</p>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {!opened && (
                <div className="gift-progress-wrap">
                    <div className="gift-progress-bar">
                        <div className="gift-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="gift-progress-label">{clicks}/{MAX_CLICKS} lần tap</span>
                </div>
            )}

            {opened && (
                <button className="gift-replay-btn" onClick={handleReset} id="gift-replay-btn">
                    🎁 Mở hộp quà khác
                </button>
            )}
        </div>
    )
}
