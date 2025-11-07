import { useState, useEffect } from 'react'
import { User, Wallet, CreditCard, History, Award } from 'lucide-react'
import { usePolkadot } from '../context/PolkadotContext'
import { useUserData } from '../context/UserDataContext'

const Settings = () => {
  const { selectedAccount, isConnected, formatBalanceDisplay, balance: walletBalance } = usePolkadot()
  const { userData, updateProfile, isLoading } = useUserData()
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || ''
      })
    }
  }, [userData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveStatus('saving')
    
    try {
      const result = await updateProfile(formData.name, formData.email)
      
      if (result.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (err) {
      setSaveStatus('error')
    }
  }

  const getWalletBalanceDisplay = () => {
    if (walletBalance?.data?.free) {
      return formatBalanceDisplay(walletBalance.data.free)
    }
    return '0.0000 DOT'
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <Wallet className="h-16 w-16 text-textSecondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Connect Your Wallet</h2>
          <p className="text-textSecondary">
            Please connect your Polkadot wallet to view your settings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">Account Settings</h1>
        <p className="text-textSecondary mt-1">Manage your profile and view account information</p>
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Profile Information</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input-field"
            />
          </div>

          {saveStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-600 text-sm">✅ Profile updated successfully!</p>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-600 text-sm">❌ Failed to update profile</p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading || saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Wallet Information */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Wallet Information</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Wallet Address</p>
            <p className="font-mono text-sm text-textPrimary break-all">
              {selectedAccount?.address}
            </p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Wallet Balance</p>
            <p className="text-lg font-semibold text-textPrimary">
              {getWalletBalanceDisplay()}
            </p>
          </div>
          
          <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Platform Balance</p>
            <p className="text-2xl font-bold text-accent">
              {userData ? `${userData.balance.toFixed(2)} DOT` : '0.00 DOT'}
            </p>
          </div>
        </div>
      </div>

      {/* Memberships */}
      {userData && userData.memberships && userData.memberships.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-bold text-textPrimary">Memberships</h2>
          </div>
          
          <div className="space-y-3">
            {userData.memberships.map((membership) => (
              <div 
                key={membership.id}
                className="bg-background/50 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-textPrimary">{membership.name}</p>
                    <p className="text-sm text-textSecondary capitalize">{membership.type}</p>
                  </div>
                  <p className="text-xs text-textSecondary">
                    {new Date(membership.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      {userData && userData.transactions && userData.transactions.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <History className="h-6 w-6 text-secondary" />
            <h2 className="text-xl font-bold text-textPrimary">Recent Transactions</h2>
          </div>
          
          <div className="space-y-2">
            {userData.transactions.slice(0, 10).map((tx) => (
              <div 
                key={tx.id}
                className="bg-background/50 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-textPrimary capitalize">
                      {tx.type}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} DOT
                    </p>
                    <p className="text-xs text-textSecondary capitalize">{tx.status}</p>
                  </div>
                </div>
                {tx.txHash && (
                  <p className="text-xs text-textSecondary font-mono break-all mt-1">
                    Tx: {tx.txHash}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Statistics */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Account Statistics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-textPrimary">
              {userData?.transactions?.length || 0}
            </p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Total Deposits</p>
            <p className="text-2xl font-bold text-green-600">
              {userData?.transactions?.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0).toFixed(2) || '0.00'} DOT
            </p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Active Memberships</p>
            <p className="text-2xl font-bold text-textPrimary">
              {userData?.memberships?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
