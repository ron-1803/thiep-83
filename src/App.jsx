import { useEffect, useState } from 'react'
import FloatingPetals from './components/FloatingPetals'
import FloatingHearts from './components/FloatingHearts'
import WishForm from './components/WishForm'
import CardPreview from './components/CardPreview'
import TabBar from './components/TabBar'

export default function App() {
    const [activeTab, setActiveTab] = useState(0)
    const [cardData, setCardData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // On mount: track view + auto-load card if URL has share params
    useEffect(() => {
        fetch('/api/view', { method: 'POST' }).catch(() => { })

        const p = new URLSearchParams(window.location.search)
        const id = p.get('id')

        if (id) {
            setIsLoading(true)
            fetch(`/api/cards/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setCardData(data.data) // data.data contains id, sender, recipient, message, photo
                        setActiveTab(1)
                    } else {
                        console.error('Card not found:', data.error)
                        // Giữ nguyên tab 0 
                    }
                })
                .catch(err => console.error('Lỗi tải thiệp:', err))
                .finally(() => setIsLoading(false))
        } else {
            // Fallback link cũ
            const r = p.get('r')
            const s = p.get('s')
            const m = p.get('m')
            const photo = p.get('p')
            if (r && s && m) {
                setCardData({ recipient: r, sender: s, message: m, photo: photo || null })
                setActiveTab(1)
            }
        }
    }, [])

    const handleComplete = (data) => {
        setCardData(data)
        setActiveTab(1)
    }

    const handleBack = () => {
        // Just go back to tab 0
        setActiveTab(0)
    }

    return (
        <div className="app-bg">
            <FloatingPetals />
            <FloatingHearts />

            <div className="app-layout">
                <TabBar
                    activeTab={activeTab}
                    onTabChange={(i) => {
                        if (i === 1 && !cardData) return
                        setActiveTab(i)
                    }}
                    hasCardData={!!cardData}
                />

                <div className="tab-content">
                    {activeTab === 0 && (
                        <WishForm onComplete={handleComplete} initialData={cardData} />
                    )}
                    {activeTab === 1 && cardData && (
                        <CardPreview data={cardData} onBack={handleBack} />
                    )}
                </div>
            </div>
        </div>
    )
}
