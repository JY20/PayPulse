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
      // Initialize new user
      users[address] = {
        address,
        name: '',
        email: '',
        balance: 0,
        memberships: [],
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
      ...membershipData,
      createdAt: new Date().toISOString()
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

