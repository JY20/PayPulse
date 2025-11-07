import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePolkadot } from '../context/PolkadotContext'
import { useUserData } from '../context/UserDataContext'
import { ArrowLeft, Wallet, DollarSign, TrendingUp, AlertCircle, Send } from 'lucide-react'
import { getConfig } from '../config'

const DepositFunds = () => {
  const navigate = useNavigate()
  const { selectedAccount, isConnected, balance: walletBalance, formatBalanceDisplay, createTransfer, signAndSubmitTransaction, getBalance } = usePolkadot()
  const { userData, depositFunds, isLoading } = useUserData()
  
  const [formData, setFormData] = useState({
    amount: '',
    notes: ''
  })
  const [depositStatus, setDepositStatus] = useState(null)
  const [depositError, setDepositError] = useState(null)
  const [txHash, setTxHash] = useState(null)

  useEffect(() => {
    if (!isConnected) {
      navigate('/')
    }
  }, [isConnected, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setDepositStatus(null)
    setDepositError(null)
    setTxHash(null)
    
    const amount = parseFloat(formData.amount)
    
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a valid amount')
      return
    }

    // Check if user has a signer (not in demo mode)
    if (!selectedAccount?.polkadotSigner) {
      setDepositError('Cannot make deposits in demo mode. Please connect a real wallet.')
      return
    }

    try {
      setDepositStatus('creating_tx')
      
      // Step 1: Create the Polkadot transfer transaction
      const config = getConfig()
      const platformAddress = config.platformAddress
      console.log('Creating transfer to platform address:', platformAddress)
      const transaction = createTransfer(platformAddress, amount)
      
      if (!transaction) {
        throw new Error('Failed to create transaction')
      }
      
      setDepositStatus('signing')
      
      // Step 2: Sign and submit the transaction
      console.log('Signing and submitting transaction...')
      const hash = await signAndSubmitTransaction(transaction)
      
      if (!hash) {
        throw new Error('Transaction was not completed')
      }
      
      console.log('Transaction completed! Hash:', hash)
      setTxHash(hash)
      setDepositStatus('recording')
      
      // Step 3: Record the deposit in the backend
      const result = await depositFunds(amount, hash)
      
      if (result.success) {
        setDepositStatus('success')
        setFormData({ amount: '', notes: '' })
        
        // Refresh wallet balance
        await getBalance(selectedAccount)
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/payments')
        }, 3000)
      } else {
        setDepositError(result.error || 'Failed to record deposit in backend')
        setDepositStatus('error')
      }
    } catch (err) {
      console.error('Error depositing funds:', err)
      setDepositError(err.message || 'An error occurred while depositing funds')
      setDepositStatus('error')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getWalletBalanceDisplay = () => {
    if (walletBalance?.data?.free) {
      return formatBalanceDisplay(walletBalance.data.free)
    }
    return '0.0000 DOT'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-textSecondary hover:text-textPrimary transition"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div>
        <h1 className="text-3xl font-bold text-textPrimary">
          Deposit Funds
        </h1>
        <p className="text-textSecondary mt-1">
          Add funds to your PayPulse platform balance
        </p>
      </div>

      {/* Account Info Card */}
      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-textPrimary flex items-center gap-2">
          <Wallet className="h-5 w-5 text-accent" />
          Account Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Your Wallet Address</p>
            <p className="font-mono text-sm text-textPrimary break-all">
              {selectedAccount?.address || 'Not connected'}
            </p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-sm text-textSecondary mb-1">Wallet Balance</p>
            <p className="text-lg font-semibold text-textPrimary">
              {getWalletBalanceDisplay()}
            </p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Send className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-textPrimary mb-1">
                Platform Address
              </p>
              <p className="font-mono text-xs text-textSecondary break-all">
                {getConfig().platformAddress}
              </p>
              <p className="text-xs text-textSecondary mt-1">
                Your deposit will be transferred to this address on the Polkadot network
              </p>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-textPrimary mb-1">
                Platform Balance
              </p>
              <p className="text-2xl font-bold text-accent">
                {userData ? `$${userData.balance.toFixed(2)}` : '$0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-xl font-semibold text-textPrimary flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          Deposit Amount
        </h2>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-textPrimary mb-2">
            Amount (DOT) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className="input-field text-lg"
            disabled={isLoading || depositStatus === 'creating_tx' || depositStatus === 'signing' || depositStatus === 'recording'}
          />
          <p className="text-xs text-textSecondary mt-1">
            Enter the amount in DOT you want to transfer to the platform
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-textPrimary mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Add any notes about this deposit..."
            className="input-field resize-none"
            disabled={isLoading || depositStatus === 'processing'}
          />
        </div>

        {/* Status Messages */}
        {depositStatus === 'creating_tx' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-600 font-medium">
              ⚙️ Creating transaction...
            </p>
          </div>
        )}

        {depositStatus === 'signing' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-600 font-medium">
              ✍️ Please sign the transaction in your wallet...
            </p>
          </div>
        )}

        {depositStatus === 'recording' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-600 font-medium">
              📝 Recording deposit in platform...
            </p>
          </div>
        )}

        {depositStatus === 'success' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
            <p className="text-green-600 font-medium">
              ✅ Deposit successful! Redirecting...
            </p>
            {txHash && (
              <p className="text-xs text-textSecondary font-mono break-all">
                Transaction Hash: {txHash}
              </p>
            )}
          </div>
        )}

        {depositError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-medium">Deposit Failed</p>
              <p className="text-red-600/80 text-sm mt-1">{depositError}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2 flex-1"
            disabled={isLoading || depositStatus === 'creating_tx' || depositStatus === 'signing' || depositStatus === 'recording'}
          >
            <Send className="h-5 w-5" />
            {depositStatus === 'creating_tx' && 'Creating Transaction...'}
            {depositStatus === 'signing' && 'Waiting for Signature...'}
            {depositStatus === 'recording' && 'Recording Deposit...'}
            {!depositStatus && 'Transfer & Deposit'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="btn-secondary flex-1"
            disabled={depositStatus === 'creating_tx' || depositStatus === 'signing' || depositStatus === 'recording'}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Recent Transactions */}
      {userData && userData.transactions && userData.transactions.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">
            Recent Transactions
          </h2>
          
          <div className="space-y-2">
            {userData.transactions.slice(0, 5).map((tx) => (
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
    </div>
  )
}

export default DepositFunds

