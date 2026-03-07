const FLOAT_HEARTS = ['💖', '💝', '💗', '🩷', '💕', '❤️', '💓']

export default function FloatingHearts() {
    const hearts = Array.from({ length: 15 }, (_, i) => {
        const emoji = FLOAT_HEARTS[i % FLOAT_HEARTS.length]
        const left = `${5 + Math.random() * 90}%`
        const animationDuration = `${7 + Math.random() * 10}s`
        const animationDelay = `${Math.random() * 12}s`
        const fontSize = `${0.7 + Math.random() * 0.9}rem`

        return { key: i, emoji, left, animationDuration, animationDelay, fontSize }
    })

    return (
        <div className="floating-hearts-bg">
            {hearts.map(({ key, emoji, left, animationDuration, animationDelay, fontSize }) => (
                <div
                    key={key}
                    className="float-heart"
                    style={{ left, animationDuration, animationDelay, fontSize }}
                >
                    {emoji}
                </div>
            ))}
        </div>
    )
}
