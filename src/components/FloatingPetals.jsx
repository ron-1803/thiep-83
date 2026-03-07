import { useEffect, useRef } from 'react'

const PETALS = ['🌸', '🌺', '🌷', '💮', '🏵️', '🌹']

function Petal({ style, emoji }) {
    return (
        <div className="petal" style={style}>
            {emoji}
        </div>
    )
}

export default function FloatingPetals() {
    const petals = Array.from({ length: 22 }, (_, i) => {
        const emoji = PETALS[i % PETALS.length]
        const left = `${Math.random() * 100}%`
        const animationDuration = `${5 + Math.random() * 8}s`
        const animationDelay = `${Math.random() * 10}s`
        const fontSize = `${0.9 + Math.random() * 1.2}rem`
        const opacity = 0.5 + Math.random() * 0.5

        return {
            key: i,
            emoji,
            style: {
                left,
                animationDuration,
                animationDelay,
                fontSize,
                opacity,
            },
        }
    })

    return (
        <div className="petals-container">
            {petals.map(({ key, emoji, style }) => (
                <Petal key={key} emoji={emoji} style={style} />
            ))}
        </div>
    )
}
