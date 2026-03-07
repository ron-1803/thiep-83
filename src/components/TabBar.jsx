const TABS = [
    { label: '✍️ Ghi lời chúc', id: 'tab-wish' },
    { label: '🎁 Thành quả', id: 'tab-result' },
]

export default function TabBar({ activeTab, onTabChange, hasCardData }) {
    return (
        <div className="tabbar">
            {TABS.map((tab, i) => {
                const locked = i === 1 && !hasCardData
                return (
                    <button
                        key={i}
                        id={tab.id}
                        className={`tab-btn ${activeTab === i ? 'tab-active' : ''} ${locked ? 'tab-locked' : ''}`}
                        onClick={() => onTabChange(i)}
                        disabled={locked}
                        title={locked ? 'Hãy ghi lời chúc trước nhé!' : tab.label}
                    >
                        {tab.label}
                        {locked && <span className="tab-lock-icon">🔒</span>}
                    </button>
                )
            })}
        </div>
    )
}
