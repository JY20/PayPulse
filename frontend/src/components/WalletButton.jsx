import { useState } from 'react'
import { usePolkadot } from '../context/PolkadotContext'
import { Wallet, ChevronDown, LogOut, Check, RefreshCw } from 'lucide-react'

const WalletButton = () => {
  const {
    accounts,
    selectedAccount,
    isConnecting,
    isConnected,
    error,
    balance,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getBalance,
    formatBalanceDisplay,
  } = usePolkadot()

  const [showDropdown, setShowDropdown] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleRefreshBalance = async () => {
    if (!selectedAccount) return
    setIsRefreshing(true)
    await getBalance(selectedAccount)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (!isConnected) {
    return (
      <div>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="h-5 w-5" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && (
          <p className="text-error text-xs mt-1 max-w-xs">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-primary rounded-lg transition border border-accent/40"
      >
        <Wallet className="h-5 w-5" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">
            {selectedAccount?.meta?.name || 'Account'}
          </span>
          <span className="text-xs opacity-75">
            {formatAddress(selectedAccount?.address)}
          </span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-surface rounded-lg shadow-lg border border-textSecondary/10 z-20">
            <div className="p-3 border-b border-textSecondary/10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-textSecondary">Connected Account</p>
                <button
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                  className="p-1 hover:bg-background rounded transition"
                  title="Refresh balance"
                >
                  <RefreshCw className={`h-3 w-3 text-textSecondary ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {balance && balance.data && balance.data.free && (
                <p className="text-sm font-semibold text-textPrimary mt-1">
                  {formatBalanceDisplay(balance.data.free)}
                </p>
              )}
            </div>

            {accounts.length > 1 && (
              <div className="p-2">
                <p className="text-xs text-textSecondary px-2 py-1">
                  Switch Account
                </p>
                {accounts.map((account) => (
                  <button
                    key={account.address}
                    onClick={() => {
                      switchAccount(account)
                      setShowDropdown(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                      selectedAccount?.address === account.address
                        ? 'bg-accent/20 text-primary'
                        : 'hover:bg-background text-textPrimary'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {account.meta?.name || 'Unnamed'}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatAddress(account.address)}
                      </span>
                    </div>
                    {selectedAccount?.address === account.address && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-textSecondary/10">
              <button
                onClick={() => {
                  disconnectWallet()
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-error/10 rounded-lg transition text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletButton

