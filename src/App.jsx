import { useEffect, useState } from 'react'
import FloatingPetals from './components/FloatingPetals'
import FloatingHearts from './components/FloatingHearts'
import WishForm from './components/WishForm'
import CardPreview from './components/CardPreview'
import TabBar from './components/TabBar'

// Read card data from URL query params (?r=recipient&s=sender&m=message)
function readParamsFromUrl() {
    const p = new URLSearchParams(window.location.search)
    const r = p.get('r')
    const s = p.get('s')
    const m = p.get('m')
    if (r && s && m) return { recipient: r, sender: s, message: m }
    return null
}

export default function App() {
    const [activeTab, setActiveTab] = useState(0)
    const [cardData, setCardData] = useState(null)

    // On mount: track view + auto-load card if URL has share params
    useEffect(() => {
        fetch('/api/view', { method: 'POST' }).catch(() => { })

        const fromUrl = readParamsFromUrl()
        if (fromUrl) {
            setCardData(fromUrl)
            setActiveTab(1)
        }
    }, [])

    const handleComplete = (data) => {
        setCardData(data)
        setActiveTab(1)
    }

    const handleBack = () => {
        // Remove share params from URL so the browser history is clean
        window.history.replaceState({}, '', window.location.pathname)
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
