import { createContext, useContext, useState, useEffect } from 'react'
import { usePolkadot } from './PolkadotContext'

const UserDataContext = createContext()

export const useUserData = () => {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}

const API_BASE_URL = 'http://localhost:3001/api'

export const UserDataProvider = ({ children }) => {
  const { selectedAccount, isConnected } = usePolkadot()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user data when account changes
  useEffect(() => {
    if (selectedAccount && isConnected) {
      fetchUserData(selectedAccount.address)
    } else {
      setUserData(null)
    }
  }, [selectedAccount, isConnected])

  // Fetch user data from backend
  const fetchUserData = async (address) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/users/${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setUserData(data)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err.message)
      // Initialize empty user data on error
      setUserData({
        address,
        name: '',
        email: '',
        balance: 0,
        memberships: [],
        transactions: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Deposit funds
  const depositFunds = async (amount, txHash = null) => {
    if (!selectedAccount) {
      throw new Error('No account selected')
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedAccount.address}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, txHash }),
      })

      if (!response.ok) {
        throw new Error('Failed to deposit funds')
      }

      const data = await response.json()
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        balance: data.balance,
        transactions: [data.transaction, ...(prev?.transactions || [])]
      }))

      return { success: true, balance: data.balance, transaction: data.transaction }
    } catch (err) {
      console.error('Error depositing funds:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw funds
  const withdrawFunds = async (amount, recipient) => {
    if (!selectedAccount) {
      throw new Error('No account selected')
    }

    if (!userData || userData.balance < amount) {
      throw new Error('Insufficient balance')
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedAccount.address}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, recipient }),
      })

      if (!response.ok) {
        throw new Error('Failed to withdraw funds')
      }

      const data = await response.json()
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        balance: data.balance,
        transactions: [data.transaction, ...(prev?.transactions || [])]
      }))

      return { success: true, balance: data.balance, transaction: data.transaction }
    } catch (err) {
      console.error('Error withdrawing funds:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Add membership
  const addMembership = async (membershipData) => {
    if (!selectedAccount) {
      throw new Error('No account selected')
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedAccount.address}/memberships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(membershipData),
      })

      if (!response.ok) {
        throw new Error('Failed to add membership')
      }

      const data = await response.json()
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        memberships: [...(prev?.memberships || []), data.membership]
      }))

      return { success: true, membership: data.membership }
    } catch (err) {
      console.error('Error adding membership:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!selectedAccount) {
      return []
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedAccount.address}/transactions`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const transactions = await response.json()
      setUserData(prev => ({ ...prev, transactions }))
      return transactions
    } catch (err) {
      console.error('Error fetching transactions:', err)
      return []
    }
  }

  // Update user profile
  const updateProfile = async (name, email) => {
    if (!selectedAccount) {
      throw new Error('No account selected')
    }

    setIsLoading(true)
    setError(null)
    try {
      const url = `${API_BASE_URL}/users/${selectedAccount.address}/profile`
      console.log('Updating profile at:', url)
      console.log('Payload:', { name, email })
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Response error:', errorData)
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      console.log('Profile updated:', data)
      
      // Update local state
      setUserData(data.user)

      return { success: true, user: data.user }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    userData,
    isLoading,
    error,
    depositFunds,
    withdrawFunds,
    addMembership,
    fetchTransactions,
    updateProfile,
    refreshUserData: () => selectedAccount && fetchUserData(selectedAccount.address)
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserDataContext

