import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Path to users data file
const USERS_DATA_FILE = path.join(__dirname, 'data', 'users.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
  
  // Initialize users.json if it doesn't exist
  try {
    await fs.access(USERS_DATA_FILE)
  } catch {
    await fs.writeFile(USERS_DATA_FILE, JSON.stringify({}), 'utf-8')
  }
}

// Read users data
async function readUsersData() {
  try {
    const data = await fs.readFile(USERS_DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users data:', error)
    return {}
  }
}

// Write users data
async function writeUsersData(data) {
  try {
    await fs.writeFile(USERS_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing users data:', error)
    return false
  }
}

// Get user data by address
app.get('/api/users/:address', async (req, res) => {
  try {
    const { address } = req.params
    const users = await readUsersData()
    
    if (!users[address]) {
      // Initialize new user with mock memberships
      users[address] = {
        address,
        name: '',
        email: '',
        balance: 0,
        memberships: [
          {
            id: '1',
            title: 'Premium Member',
            description: 'Access to all premium features including advanced analytics and priority support',
            amount: 29.99,
            chargeDate: 8, // Charges on the 8th of each month
            status: 'active'
          },
          {
            id: '2',
            title: 'Pro Trader',
            description: 'Professional trading tools with real-time market data and automated strategies',
            amount: 99.99,
            chargeDate: 15, // Charges on the 15th of each month
            status: 'active'
          },
          {
            id: '3',
            title: 'Enterprise Plan',
            description: 'Full enterprise suite with unlimited users, dedicated support, and custom integrations',
            amount: 499.99,
            chargeDate: 22, // Charges on the 22nd of each month
            status: 'active'
          }
        ],
        transactions: []
      }
      await writeUsersData(users)
    }
    
    res.json(users[address])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' })
  }
})

// Update user balance (deposit)
app.post('/api/users/:address/deposit', async (req, res) => {
  try {
    const { address } = req.params
    const { amount, txHash } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }
    
    const users = await readUsersData()
    
    if (!users[address]) {
      users[address] = {
        address,
        name: '',
        email: '',
        balance: 0,
        memberships: [],
        transactions: []
      }
    }
    
    // Update balance
    users[address].balance += amount
    
    // Add transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      timestamp: new Date().toISOString(),
      txHash: txHash || null,
      status: 'completed'
    }
    
    users[address].transactions.unshift(transaction)
    
    const success = await writeUsersData(users)
    
    if (success) {
      res.json({
        success: true,
        balance: users[address].balance,
        transaction
      })
    } else {
      res.status(500).json({ error: 'Failed to update user data' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process deposit' })
  }
})

// Get memberships for a user
app.get('/api/users/:address/memberships', async (req, res) => {
  try {
    const { address } = req.params
    const users = await readUsersData()
    
    const memberships = users[address]?.memberships || []
    res.json(memberships)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memberships' })
  }
})

// Get calendar events for a user (membership renewals)
app.get('/api/users/:address/calendar', async (req, res) => {
  try {
    const { address } = req.params
    const users = await readUsersData()
    
    if (!users[address] || !users[address].memberships) {
      return res.json([])
    }

    const events = []
    const now = new Date()
    
    // Generate events for each membership for the next 3 months
    users[address].memberships.forEach(membership => {
      const chargeDay = membership.chargeDate || 1
      
      // Generate events for the next 3 months
      for (let i = 0; i < 3; i++) {
        const eventDate = new Date(now.getFullYear(), now.getMonth() + i, chargeDay)
        
        // Only include future dates
        if (eventDate >= now) {
          events.push({
            id: `${membership.id}-${i}`,
            title: membership.title,
            description: `${membership.title} - Monthly charge on day ${chargeDay}`,
            date: eventDate.toISOString(),
            amount: membership.amount,
            type: 'membership',
            membershipId: membership.id,
            status: membership.status,
            chargeDate: chargeDay
          })
        }
      }
    })
    
    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    res.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    res.status(500).json({ error: 'Failed to fetch calendar events' })
  }
})

// Add membership
app.post('/api/users/:address/memberships', async (req, res) => {
  try {
    const { address } = req.params
    const membershipData = req.body
    
    const users = await readUsersData()
    
    if (!users[address]) {
      users[address] = {
        address,
        name: '',
        email: '',
        balance: 0,
        memberships: [],
        transactions: []
      }
    }
    
    const membership = {
      id: Date.now().toString(),
      title: membershipData.title || 'New Membership',
      description: membershipData.description || '',
      amount: membershipData.amount || 0,
      chargeDate: membershipData.chargeDate || 1, // Day of month (1-31)
      status: membershipData.status || 'active'
    }
    
    users[address].memberships.push(membership)
    
    const success = await writeUsersData(users)
    
    if (success) {
      res.json({ success: true, membership })
    } else {
      res.status(500).json({ error: 'Failed to add membership' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add membership' })
  }
})

// Get all transactions for a user
app.get('/api/users/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params
    const users = await readUsersData()
    
    const transactions = users[address]?.transactions || []
    res.json(transactions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Withdraw funds
app.post('/api/users/:address/withdraw', async (req, res) => {
  try {
    const { address } = req.params
    const { amount, recipient } = req.body
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }
    
    const users = await readUsersData()
    
    if (!users[address] || users[address].balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }
    
    // Update balance
    users[address].balance -= amount
    
    // Add transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      recipient,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
    
    users[address].transactions.unshift(transaction)
    
    const success = await writeUsersData(users)
    
    if (success) {
      res.json({
        success: true,
        balance: users[address].balance,
        transaction
      })
    } else {
      res.status(500).json({ error: 'Failed to update user data' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process withdrawal' })
  }
})

// Pay membership
app.post('/api/users/:address/memberships/:membershipId/pay', async (req, res) => {
  try {
    const { address, membershipId } = req.params
    
    const users = await readUsersData()
    
    if (!users[address]) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const membership = users[address].memberships.find(m => m.id === membershipId)
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' })
    }
    
    // Check if user has sufficient balance
    if (users[address].balance < membership.amount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: membership.amount,
        available: users[address].balance
      })
    }
    
    // Deduct balance
    users[address].balance -= membership.amount
    
    // Add payment transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'membership_payment',
      amount: membership.amount,
      membershipId: membership.id,
      membershipTitle: membership.title,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
    
    users[address].transactions.unshift(transaction)
    
    // Update membership with last payment date and next payment date
    const now = new Date()
    membership.lastPaidDate = now.toISOString()
    
    // Calculate next payment date
    // If there's an existing nextPaymentDate in the future, extend from that date
    // Otherwise, calculate from now
    let baseDate
    if (membership.nextPaymentDate) {
      const existingNextDate = new Date(membership.nextPaymentDate)
      // If the existing next payment date is in the future, use it as base
      // This allows multiple payments to stack up
      baseDate = existingNextDate > now ? existingNextDate : now
    } else {
      baseDate = now
    }
    
    // Add one month to the base date, keeping the charge day
    const nextMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, membership.chargeDate)
    membership.nextPaymentDate = nextMonth.toISOString()
    
    console.log(`💰 Payment processed for ${membership.title}`)
    console.log(`   Base date: ${baseDate.toISOString()}`)
    console.log(`   Next payment: ${membership.nextPaymentDate}`)
    
    const success = await writeUsersData(users)
    
    if (success) {
      res.json({
        success: true,
        balance: users[address].balance,
        transaction,
        membership
      })
    } else {
      res.status(500).json({ error: 'Failed to process payment' })
    }
  } catch (error) {
    console.error('Error processing membership payment:', error)
    res.status(500).json({ error: 'Failed to process payment' })
  }
})

// Update user profile
app.put('/api/users/:address/profile', async (req, res) => {
  try {
    const { address } = req.params
    const { name, email } = req.body
    
    console.log('📝 Updating profile for:', address, { name, email })
    
    const users = await readUsersData()
    
    if (!users[address]) {
      users[address] = {
        address,
        name: '',
        email: '',
        balance: 0,
        memberships: [],
        transactions: []
      }
    }
    
    // Update name and/or email
    if (name !== undefined) users[address].name = name
    if (email !== undefined) users[address].email = email
    
    const success = await writeUsersData(users)
    
    if (success) {
      console.log('✅ Profile updated successfully')
      res.json({
        success: true,
        user: users[address]
      })
    } else {
      console.error('❌ Failed to write user data')
      res.status(500).json({ error: 'Failed to update profile' })
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Initialize server
async function startServer() {
  await ensureDataDirectory()
  
  app.listen(PORT, () => {
    console.log(`✅ PayPulse backend server running on http://localhost:${PORT}`)
  })
}

startServer()

