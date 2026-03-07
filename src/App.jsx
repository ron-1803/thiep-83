import { useEffect, useState } from 'react'
import FloatingPetals from './components/FloatingPetals'
import FloatingHearts from './components/FloatingHearts'
import WishForm from './components/WishForm'
import CardPreview from './components/CardPreview'
import TabBar from './components/TabBar'

// Read card data from URL query param (?id=abc12)
async function fetchCardFromUrl() {
    const p = new URLSearchParams(window.location.search)
    const id = p.get('id')
    if (!id) return null

    try {
        const res = await fetch(`/api/cards/${id}`)
        const data = await res.json()
        if (data.ok && data.data) {
            return data.data
        }
    } catch (err) {
        console.error('Failed to fetch card:', err)
    }
    return null
}

export default function App() {
    const [activeTab, setActiveTab] = useState(0)
    const [cardData, setCardData] = useState(null)
    const [isLoadingCard, setIsLoadingCard] = useState(false)

    // On mount: track view + auto-load card if URL has share params
    useEffect(() => {
        fetch('/api/view', { method: 'POST' }).catch(() => { })

        const loadCard = async () => {
            const params = new URLSearchParams(window.location.search)
            if (params.has('id')) {
                setIsLoadingCard(true)
                const data = await fetchCardFromUrl()
                if (data) {
                    setCardData(data)
                    setActiveTab(1)
                }
                setIsLoadingCard(false)
            }
        }
        loadCard()
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
