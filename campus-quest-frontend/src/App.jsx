import { useState } from 'react'
import { connectWallet, disconnectWallet } from './wallet'
import {
  getTokenBalance,
  hasCompletedQuest,
  completeQuest,
  redeemReward,
  getAllQuests,
  createQuest,
  getAllRewards,
  createReward,
} from './campusQuest'
import './App.css'

const ADMIN_ADDRESS = 'GDG5FK6IJWVD6KBDSQDSEMYECGHJONBPQS5MB57NXQEOS2EA3IGPRU4N'

function shortenAddress(address) {
  return `${address.slice(0, 5)}...${address.slice(-4)}`
}

function App() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)
  const [completedQuests, setCompletedQuests] = useState({})
  const [processingId, setProcessingId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [quests, setQuests] = useState([])
  const [newQuestId, setNewQuestId] = useState('')
  const [newQuestTitle, setNewQuestTitle] = useState('')
  const [newQuestReward, setNewQuestReward] = useState('')
  const [rewards, setRewards] = useState([])
  const [newRewardId, setNewRewardId] = useState('')
  const [newRewardTitle, setNewRewardTitle] = useState('')
  const [newRewardCost, setNewRewardCost] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const [creatingQuest, setCreatingQuest] = useState(false)
  const [creatingReward, setCreatingReward] = useState(false)

  async function refreshBalance(address) {
    try {
      const result = await getTokenBalance(address)
      setBalance(result.toString())
    } catch (err) {
      console.error(err)
      setError('Could not fetch token balance.')
    }
  }

  async function refreshQuests(address) {
    try {
      const data = await getAllQuests(address)
      setQuests(data)
    } catch (err) {
      console.error(err)
      setError('Could not load quests.')
    }
  }

  async function refreshRewards(address) {
    try {
      const data = await getAllRewards(address)
      setRewards(data)
    } catch (err) {
      console.error(err)
      setError('Could not load rewards.')
    }
  }

  async function refreshCompletedQuests(address, questList) {
    const results = {}
    for (const quest of questList) {
      try {
        results[quest.id] = await hasCompletedQuest(quest.id, address)
      } catch (err) {
        console.error(err)
        results[quest.id] = false
      }
    }
    setCompletedQuests(results)
  }

  async function handleConnect() {
    setError(null)
    try {
      const address = await connectWallet()
      setWalletAddress(address)
      await refreshBalance(address)
      const questList = await getAllQuests(address)
      setQuests(questList)
      await refreshRewards(address)
      await refreshCompletedQuests(address, questList)
    } catch (err) {
      console.error(err)
      setError('Wallet connection failed.')
    }
  }

  async function handleDisconnect() {
    await disconnectWallet()
    setWalletAddress(null)
    setBalance(null)
    setCompletedQuests({})
    setWalletMenuOpen(false)
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(walletAddress)
    setFeedback('Address copied to clipboard!')
    setWalletMenuOpen(false)
  }

  async function handleCompleteQuest(questId) {
    setError(null)
    setFeedback(null)
    setProcessingId(questId)

    try {
      await completeQuest(questId, walletAddress)
      setFeedback('Quest completed! Tokens have been added to your balance.')
      await refreshBalance(walletAddress)
      await refreshCompletedQuests(walletAddress, quests)
    } catch (err) {
      console.error(err)
      setError('Could not complete this quest. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleRedeemReward(rewardId) {
    setError(null)
    setFeedback(null)
    setProcessingId(rewardId)

    try {
      await redeemReward(rewardId, walletAddress)
      setFeedback('Reward redeemed successfully!')
      await refreshBalance(walletAddress)
    } catch (err) {
      console.error(err)
      setError('Could not redeem this reward. You may not have enough tokens.')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleCreateQuest() {
    setError(null)
    setFeedback(null)
    setCreatingQuest(true)
    
    await new Promise(resolve => setTimeout(resolve, 3000))

    try {
      await createQuest(
        Number(newQuestId),
        newQuestTitle,
        Number(newQuestReward),
        walletAddress
      )

      await refreshQuests(walletAddress)

      setFeedback('Quest created successfully!')

      setNewQuestId('')
      setNewQuestTitle('')
      setNewQuestReward('')
    } catch (err) {
      console.error(err)
      setError('Could not create quest.')
    } finally {
      setCreatingQuest(false)
    }
  }

  async function handleCreateReward() {
    setError(null)
    setFeedback(null)
    setCreatingReward(true)

    try {
      await createReward(
        Number(newRewardId),
        newRewardTitle,
        Number(newRewardCost),
        walletAddress
      )

      await refreshRewards(walletAddress)

      setFeedback('Reward created successfully!')

      setNewRewardId('')
      setNewRewardTitle('')
      setNewRewardCost('')
    } catch (err) {
      console.error(err)
      setError('Could not create reward.')
    } finally {
      setCreatingReward(false)
    }
  }

  const isAdmin = walletAddress === ADMIN_ADDRESS

  function goToTab(tab) {
    setActiveTab(tab)
    setMenuOpen(false)
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-left">
          <button
            className="icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 >Campus Quest</h1>
        </div>

        {walletAddress && (
          <div className="topbar-right">
            <button
              className="wallet-chip"
              onClick={() => setWalletMenuOpen((open) => !open)}
            >
              👤 {shortenAddress(walletAddress)}
            </button>

            {walletMenuOpen && (
              <div className="wallet-dropdown">
                <p>{walletAddress}</p>
                <button className="app-button" onClick={handleCopyAddress}>
                  Copy address
                </button>
                <button className="app-button secondary" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="menu-drawer">
            <div className="menu-item" onClick={() => goToTab('home')}>Home</div>
            <div className="menu-item disabled">
              Leaderboard
              <span className="soon">Coming in Level 5</span>
            </div>
            <div className="menu-item disabled">
              Upcoming Quests
              <span className="soon">Coming in Level 5</span>
            </div>
            <div className="menu-item disabled">
              Badges
              <span className="soon">Coming in Level 5</span>
            </div>
            <div className="menu-item" onClick={() => goToTab('tokens')}>Reward Store</div>
            <div className="menu-item disabled">Contact</div>
          </div>
        </>
      )}

      <div className="main-content">
        {!walletAddress ? (
          <div className="connect-wrapper">
            <div className="hero">
              <h2>Campus Quest</h2>
              <p>Complete quests. Earn campus tokens. Unlock rewards.</p>
            </div>
            <button className="app-button" onClick={handleConnect}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <div className="hero">
              <h2>Welcome back!</h2>
            </div>

            <div className="balance-card">
              <div className="label">Balance</div>
              <div className="value">
                {balance !== null ? `${balance} Campus Tokens` : 'Loading...'}
              </div>
            </div>

            {activeTab === 'home' && (
              <section className="section">
                <h2>Available Quests</h2>
                <div className="card-list">
                  {quests.map((quest) => (
                    <div className="card" key={quest.id}>
                      <h3>{quest.title}</h3>
                      <p>Reward: {quest.reward_amount}</p>
                      {completedQuests[quest.id] ? (
                        <span className="badge-completed">Completed</span>
                      ) : (
                        <button
                          className="app-button"
                          onClick={() => handleCompleteQuest(quest.id)}
                          disabled={
                            processingId === quest.id ||
                            completedQuests[quest.id]
                          }
                        >
                          {processingId === quest.id ? 'Processing...' : 'Complete Quest'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'tokens' && (
              <section className="section">
                <h2>Reward Store</h2>
                <div className="card-list">
                  {rewards.map((reward) => (
                    <div className="card" key={reward.id}>
                      <h3>{reward.title}</h3>
                      <p>{reward.cost} tokens</p>
                      <button
                        className="app-button"
                        onClick={() => handleRedeemReward(reward.id)}
                        disabled={processingId === reward.id}
                      >
                        {processingId === reward.id ? 'Processing...' : 'Redeem'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isAdmin && (
              <section className="section">
                <h2>Admin Panel</h2>

                <input
                  className="app-input"
                  type="number"
                  placeholder="Quest ID"
                  value={newQuestId}
                  onChange={(e) => setNewQuestId(e.target.value)}
                />
                <input
                  className="app-input"
                  type="text"
                  placeholder="Quest Title"
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                />
                <input
                  className="app-input"
                  type="number"
                  placeholder="Reward Amount"
                  value={newQuestReward}
                  onChange={(e) => setNewQuestReward(e.target.value)}
                />
                <button
                  className="app-button"
                  onClick={handleCreateQuest}
                  disabled={creatingQuest}
                >
                  {creatingQuest ? 'Creating...' : 'Create Quest'}
                </button>

                <h3>Create Reward</h3>

                <input
                  className="app-input"
                  type="number"
                  placeholder="Reward ID"
                  value={newRewardId}
                  onChange={(e) => setNewRewardId(e.target.value)}
                />
                <input
                  className="app-input"
                  type="text"
                  placeholder="Reward Title"
                  value={newRewardTitle}
                  onChange={(e) => setNewRewardTitle(e.target.value)}
                />
                <input
                  className="app-input"
                  type="number"
                  placeholder="Cost"
                  value={newRewardCost}
                  onChange={(e) => setNewRewardCost(e.target.value)}
                />
                <button
                  className="app-button"
                  onClick={handleCreateReward}
                  disabled={creatingReward}
                >
                  {creatingReward ? 'Creating...' : 'Create Reward'}
                </button>
              </section>
            )}
          </div>
        )}

        {feedback && <p className="feedback-success">{feedback}</p>}
        {error && <p className="feedback-error">{error}</p>}
      </div>
    </div>
  )
}

export default App
