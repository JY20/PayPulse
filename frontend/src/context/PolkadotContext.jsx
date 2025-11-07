/* global BigInt */

import { createContext, useContext, useState, useEffect } from 'react'
import { dot } from '@polkadot-api/descriptors'
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider/web'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import { getInjectedExtensions, connectInjectedExtension } from 'polkadot-api/pjs-signer'
import { loadConfig, getConfig } from '../config'

// MultiAddress helper for transactions
const MultiAddress = {
  Id: (address) => ({
    type: 'Id',
    value: address
  })
}

const PolkadotContext = createContext(null)

// Helper function to convert BigInt values to strings for display
const formatBalanceData = (data) => {
  if (data === null || data === undefined) {
    return data
  }
  
  if (typeof data === 'bigint') {
    return data.toString()
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => formatBalanceData(item))
    } else {
      const result = {}
      for (const key in data) {
        result[key] = formatBalanceData(data[key])
      }
      return result
    }
  }
  
  return data
}

// Format balance for user-friendly display with units
export const formatBalanceDisplay = (balance) => {
  if (balance === undefined || balance === null) {
    return '0 DOT'
  }
  
  // Convert to string if it's a BigInt
  const balanceStr = typeof balance === 'bigint' ? balance.toString() : balance
  
  // Convert to a number we can work with
  const balanceNum = parseFloat(balanceStr)
  
  // Polkadot has 10 decimal places (1 DOT = 10^10 Planck)
  const dotValue = balanceNum / Math.pow(10, 10)
  
  // Format with 4 decimal places
  return `${dotValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} DOT`
}

export const PolkadotProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [extension, setExtension] = useState(null)
  const [client, setClient] = useState(null)
  const [dotApi, setDotApi] = useState(null)

  // Initialize Polkadot API client using generated descriptors
  useEffect(() => {
    const initClient = async () => {
      try {
        // Load configuration first
        await loadConfig()
        const config = getConfig()
        const nodeUrl = config.polkadotNodeUrl
        
        console.log('🔗 Connecting to:', nodeUrl)
        
        // Create client with compatibility layer
        const newClient = createClient(
          withPolkadotSdkCompat(
            getWsProvider(nodeUrl)
          )
        )

        if (!newClient) {
          console.error('❌ Failed to create Polkadot client')
          setError('Failed to create Polkadot client')
          return
        }

        // Subscribe to finalized blocks
        let subscription
        try {
          subscription = newClient.finalizedBlock$.subscribe(
            (finalizedBlock) => {
              console.log('✅ Connected to chain - Block:', finalizedBlock.number, finalizedBlock.hash)
            },
            (err) => console.error('Finalized block subscription error:', err)
          )
        } catch (err) {
          console.error('Error subscribing to finalized blocks:', err)
        }

        // Get the typed API using the generated "dot" descriptor
        try {
          if (!dot) {
            console.error('❌ Polkadot dot descriptor is undefined')
            setError('Polkadot descriptor not available')
            return
          }
          
          const api = newClient.getTypedApi(dot)
          if (api) {
            setClient(newClient)
            setDotApi(api)
            console.log('✅ Polkadot API initialized successfully using dot descriptor')
          } else {
            console.error('❌ Failed to get typed API')
            setError('Failed to initialize API')
          }
        } catch (err) {
          console.error('❌ Error getting typed API:', err)
          setError(err.message)
        }

        // Cleanup function
        return () => {
          if (subscription) {
            try {
              subscription.unsubscribe()
            } catch (err) {
              console.error('Error unsubscribing:', err)
            }
          }
          
          if (newClient) {
            try {
              newClient.destroy()
            } catch (err) {
              console.error('Error destroying client:', err)
            }
          }
        }
      } catch (err) {
        console.error('❌ Error initializing Polkadot client:', err)
        setError(err.message)
      }
    }

    initClient()
  }, [])

  // Connect to SubWallet
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Get the list of installed extensions
      let availableExtensions = []
      try {
        availableExtensions = getInjectedExtensions() || []
      } catch (err) {
        console.error('Error getting injected extensions:', err)
      }

      if (availableExtensions.length === 0) {
        console.warn('⚠️ No Polkadot extensions found - using demo mode')
        
        // Create a demo account for testing
        const demoAccount = {
          address: '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
          meta: {
            name: 'Demo Account',
            source: 'Demo'
          },
          polkadotSigner: null
        }
        
        setAccounts([demoAccount])
        setSelectedAccount(demoAccount)
        setIsConnected(true)
        setBalance({ free: '1000000000000' })
        
        setIsConnecting(false)
        return { 
          success: true, 
          accounts: [demoAccount], 
          selectedAccount: demoAccount,
          demoMode: true
        }
      }
      
      console.log('📱 Available extensions:', availableExtensions)
      
      // Connect to the first available extension with timeout
      let selectedExtension
      try {
        const connectPromise = connectInjectedExtension(availableExtensions[0])
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Extension connection timed out after 10 seconds')), 10000)
        })
        
        selectedExtension = await Promise.race([connectPromise, timeoutPromise])
        setExtension(selectedExtension)
        console.log('✅ Connected to extension:', availableExtensions[0])
      } catch (err) {
        console.error('❌ Error connecting to extension:', err)
        setError(`Error connecting to extension: ${err.message || String(err)}`)
        setIsConnecting(false)
        return { 
          success: false, 
          error: `Error connecting to extension: ${err.message || String(err)}` 
        }
      }
      
      // Get accounts from extension with timeout
      let extensionAccounts
      try {
        const accountsPromise = selectedExtension.getAccounts()
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Getting accounts timed out after 10 seconds')), 10000)
        })
        
        extensionAccounts = await Promise.race([accountsPromise, timeoutPromise])
      } catch (err) {
        console.error('❌ Error getting accounts from extension:', err)
        setError(`Error getting accounts: ${err.message || String(err)}`)
        setIsConnecting(false)
        return { 
          success: false, 
          error: `Error getting accounts: ${err.message || String(err)}` 
        }
      }
      
      if (!extensionAccounts || extensionAccounts.length === 0) {
        setError('No accounts found in wallet. Please create or import an account first.')
        setIsConnecting(false)
        return { 
          success: false, 
          error: 'No accounts found in the wallet. Please create or import an account first.' 
        }
      }
      
      console.log('👛 Extension accounts:', extensionAccounts)
      
      // Format accounts
      const formattedAccounts = extensionAccounts.map(acc => ({
        address: acc.address,
        meta: {
          name: acc.name,
          source: availableExtensions[0]
        },
        polkadotSigner: acc.polkadotSigner
      }))
      
      setAccounts(formattedAccounts)
      setSelectedAccount(formattedAccounts[0])
      setIsConnected(true)
      
      // Get balance for the first account
      try {
        await getBalance(formattedAccounts[0])
      } catch (err) {
        console.error('Error getting initial balance:', err)
      }
      
      console.log('✅ Wallet connected successfully')
      setIsConnecting(false)
      return { 
        success: true, 
        accounts: formattedAccounts, 
        selectedAccount: formattedAccounts[0] 
      }
    } catch (err) {
      console.error('❌ Error connecting wallet:', err)
      setError(err.message || String(err))
      setIsConnecting(false)
      return { 
        success: false, 
        error: err.message || String(err) 
      }
    }
  }

  // Get account balance
  const getBalance = async (account) => {
    if (!account || !account.address) {
      console.warn('Cannot get balance: Invalid account or address')
      return null
    }

    try {
      if (!dotApi) {
        console.error('Polkadot API not initialized')
        return null
      }
      
      if (!dotApi.query || !dotApi.query.System || !dotApi.query.System.Account) {
        console.error('Polkadot API query methods not available')
        return null
      }
      
      // Query the account balance with timeout using typed API
      const accountInfoPromise = dotApi.query.System.Account.getValue(account.address)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Balance query timed out after 10 seconds')), 10000)
      })
      
      const accountInfo = await Promise.race([accountInfoPromise, timeoutPromise])
      
      if (!accountInfo) {
        console.warn('Account info is undefined or null')
        return null
      }
      
      // Convert BigInt values to strings
      const formattedBalance = formatBalanceData(accountInfo)
      setBalance(formattedBalance)
      console.log('💰 Balance updated:', formatBalanceDisplay(formattedBalance?.data?.free))
      return formattedBalance
    } catch (err) {
      console.error('Error getting balance:', err)
      return null
    }
  }

  // Switch account
  const switchAccount = async (account) => {
    if (!account) return { success: false, error: 'Invalid account' }
    
    const foundAccount = accounts.find(acc => acc.address === account.address)
    if (foundAccount) {
      setSelectedAccount(foundAccount)
      await getBalance(foundAccount)
      return { success: true, account: foundAccount }
    }
    return { success: false, error: 'Account not found' }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false)
    setSelectedAccount(null)
    setBalance(null)
    setAccounts([])
    setError(null)
    console.log('👋 Wallet disconnected')
    return { success: true }
  }

  // Create a transfer transaction
  const createTransfer = (recipientAddress, amount) => {
    if (!dotApi || !selectedAccount) {
      return null
    }
    
    // Convert amount to planck (1 DOT = 10^10 planck)
    const amountInPlanck = BigInt(Math.floor(amount * 10000000000))
    
    // Create the transaction using typed API with proper MultiAddress format
    return dotApi.tx.Balances.transfer_keep_alive({
      dest: {
        type: 'Id',
        value: recipientAddress
      },
      value: amountInPlanck,
    })
  }

  // Sign and submit a transaction
  const signAndSubmitTransaction = (transaction) => {
    if (!selectedAccount || !selectedAccount.polkadotSigner) {
      return Promise.reject(new Error('No signer available for this account'))
    }
    
    return new Promise((resolve, reject) => {
      let txHash = null
      
      transaction.signSubmitAndWatch(selectedAccount.polkadotSigner).subscribe({
        next: (event) => {
          console.log('📝 Tx event:', event.type)
          if (event.type === 'txBestBlocksState' && event.txHash) {
            txHash = event.txHash
            console.log('✅ Transaction included in block! Hash:', txHash)
          }
        },
        error: (err) => {
          console.error('❌ Transaction error:', err)
          reject(err)
        },
        complete() {
          console.log('✅ Transaction process completed!')
          // Refresh balance
          getBalance(selectedAccount)
          resolve(txHash)
        },
      })
    })
  }

  const value = {
    client,
    dotApi,
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
    createTransfer,
    signAndSubmitTransaction,
    formatBalanceDisplay,
    wsEndpoint: getConfig().polkadotNodeUrl,
  }

  return (
    <PolkadotContext.Provider value={value}>
      {children}
    </PolkadotContext.Provider>
  )
}

export const usePolkadot = () => {
  const context = useContext(PolkadotContext)
  if (!context) {
    throw new Error('usePolkadot must be used within PolkadotProvider')
  }
  return context
}

export default PolkadotContext
