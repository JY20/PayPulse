import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration for auto-payment scheduler
const AUTO_PAYMENT_CHECK_INTERVAL = 60 * 60 * 1000 // Check every hour (in milliseconds)

// Admin configuration file path
const ADMIN_CONFIG_FILE = path.join(__dirname, 'data', 'admin.json')

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
  
  // Initialize admin.json if it doesn't exist
  try {
    await fs.access(ADMIN_CONFIG_FILE)
  } catch {
    const defaultAdmin = {
      name: 'System Admin',
      address: '',
      balance: 0,
      configured: false
    }
    await fs.writeFile(ADMIN_CONFIG_FILE, JSON.stringify(defaultAdmin, null, 2), 'utf-8')
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

// Read admin data
async function readAdminData() {
  try {
    const data = await fs.readFile(ADMIN_CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading admin data:', error)
    return {
      name: 'System Admin',
      address: '',
      balance: 0,
      configured: false
    }
  }
}

// Write admin data
async function writeAdminData(data) {
  try {
    await fs.writeFile(ADMIN_CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing admin data:', error)
    return false
  }
}

// Credit payment to admin account
async function creditAdminAccount(amount, membership, userAddress) {
  try {
    // Get admin address from membership or fall back to global admin
    const adminAddress = membership.adminAddress
    
    if (!adminAddress) {
      console.log('⚠️  No admin address specified for this membership')
      return false
    }
    
    // Read all users data
    const users = await readUsersData()
    
    // Initialize admin user if doesn't exist
    if (!users[adminAddress]) {
      users[adminAddress] = {
        address: adminAddress,
        name: membership.admin || 'Admin',
        email: '',
        balance: 0,
        memberships: [],
        transactions: []
      }
    }
    
    // Credit the admin's user account
    users[adminAddress].balance += amount
    
    // Add transaction to admin's account
    const adminTransaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'payment_received',
      amount,
      from: userAddress,
      membershipTitle: membership.title,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
    
    users[adminAddress].transactions.unshift(adminTransaction)
    
    console.log(`💰 Credited $${amount} to ${membership.admin || 'Admin'} (${adminAddress})`)
    console.log(`   New admin balance: $${users[adminAddress].balance.toFixed(2)}`)
    
    // Save users data
    await writeUsersData(users)
    
    // Also update global admin.json for tracking
    const admin = await readAdminData()
    if (admin.configured) {
      admin.balance += amount
      await writeAdminData(admin)
    }
    
    return true
  } catch (error) {
    console.error('Error crediting admin account:', error)
    return false
  }
}

// Process automatic payments for all users
async function processAutomaticPayments() {
  try {
    console.log('🔄 Checking for due automatic payments...')
    const users = await readUsersData()
    const now = new Date()
    let paymentsProcessed = 0
    let paymentsFailed = 0
    
    // Iterate through all users
    for (const [address, userData] of Object.entries(users)) {
      if (!userData.memberships || userData.memberships.length === 0) {
        continue
      }
      
      // Check each membership for due payments
      for (const membership of userData.memberships) {
        // Skip if membership is not active
        if (membership.status !== 'active') {
          continue
        }
        
        // Check if nextPaymentDate exists and is due
        if (membership.nextPaymentDate) {
          const nextPaymentDate = new Date(membership.nextPaymentDate)
          
          // If current time is past or equal to the next payment date
          if (now >= nextPaymentDate) {
            console.log(`💳 Processing automatic payment for ${address}`)
            console.log(`   Membership: ${membership.title}`)
            console.log(`   Amount: $${membership.amount}`)
            console.log(`   Due date: ${nextPaymentDate.toISOString()}`)
            
            // Check if user has sufficient balance
            if (userData.balance >= membership.amount) {
              // Deduct balance
              userData.balance -= membership.amount
              
              // Add payment transaction
              const transaction = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                type: 'membership_payment',
                amount: membership.amount,
                membershipId: membership.id,
                membershipTitle: membership.title,
                timestamp: now.toISOString(),
                status: 'completed',
                automatic: true // Flag to indicate this was an automatic payment
              }
              
              userData.transactions.unshift(transaction)
              
              // Update membership dates
              membership.lastPaidDate = now.toISOString()
              
              // Calculate next payment date (add one month, keeping the charge day)
              const nextMonth = new Date(
                nextPaymentDate.getFullYear(),
                nextPaymentDate.getMonth() + 1,
                membership.chargeDate
              )
              membership.nextPaymentDate = nextMonth.toISOString()
              
              // Credit the admin account
              await creditAdminAccount(membership.amount, membership, address)
              
              paymentsProcessed++
              console.log(`   ✅ Payment successful! New balance: $${userData.balance.toFixed(2)}`)
              console.log(`   Next payment date: ${membership.nextPaymentDate}`)
            } else {
              // Insufficient balance - mark membership as pending or create a failed transaction
              console.log(`   ❌ Insufficient balance (Required: $${membership.amount}, Available: $${userData.balance.toFixed(2)})`)
              
              // Add failed payment transaction
              const transaction = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                type: 'membership_payment',
                amount: membership.amount,
                membershipId: membership.id,
                membershipTitle: membership.title,
                timestamp: now.toISOString(),
                status: 'failed',
                automatic: true,
                reason: 'Insufficient balance'
              }
              
              userData.transactions.unshift(transaction)
              
              // Optionally update membership status
              membership.status = 'payment_failed'
              membership.failedPaymentDate = now.toISOString()
              
              paymentsFailed++
            }
          }
        }
      }
    }
    
    // Save all changes
    if (paymentsProcessed > 0 || paymentsFailed > 0) {
      await writeUsersData(users)
      console.log(`✅ Automatic payment check complete:`)
      console.log(`   Successful payments: ${paymentsProcessed}`)
      console.log(`   Failed payments: ${paymentsFailed}`)
    } else {
      console.log('✅ No payments due at this time')
    }
    
  } catch (error) {
    console.error('❌ Error processing automatic payments:', error)
  }
}

// Start automatic payment scheduler
function startPaymentScheduler() {
  console.log(`⏰ Starting automatic payment scheduler (checks every ${AUTO_PAYMENT_CHECK_INTERVAL / 1000 / 60} minutes)`)
  
  // Run immediately on startup
  processAutomaticPayments()
  
  // Then run on interval
  setInterval(processAutomaticPayments, AUTO_PAYMENT_CHECK_INTERVAL)
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
            status: 'active',
            admin: 'Premium Services Manager',
            adminAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8'
          },
          {
            id: '2',
            title: 'Pro Trader',
            description: 'Professional trading tools with real-time market data and automated strategies',
            amount: 99.99,
            chargeDate: 15, // Charges on the 15th of each month
            status: 'active',
            admin: 'Trading Platform Manager',
            adminAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8'
          },
          {
            id: '3',
            title: 'Enterprise Plan',
            description: 'Full enterprise suite with unlimited users, dedicated support, and custom integrations',
            amount: 499.99,
            chargeDate: 22, // Charges on the 22nd of each month
            status: 'active',
            admin: 'Enterprise Solutions Manager',
            adminAddress: '5FedX18utL5FphajHzATymbBYntSV2SEb4smRciZMW4FWBX8'
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
    
    // Credit the admin account
    await creditAdminAccount(membership.amount, membership, address)
    
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

// Manual trigger for automatic payment processing (useful for testing)
app.post('/api/admin/process-payments', async (req, res) => {
  try {
    console.log('🔧 Manual trigger: Processing automatic payments...')
    await processAutomaticPayments()
    res.json({ success: true, message: 'Payment processing completed' })
  } catch (error) {
    console.error('Error in manual payment processing:', error)
    res.status(500).json({ error: 'Failed to process payments' })
  }
})

// Retry a failed payment for a specific membership
app.post('/api/users/:address/memberships/:membershipId/retry', async (req, res) => {
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
    
    // Check if membership is in failed state
    if (membership.status !== 'payment_failed') {
      return res.status(400).json({ error: 'Membership is not in payment_failed state' })
    }
    
    // Check if user has sufficient balance
    if (users[address].balance < membership.amount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: membership.amount,
        available: users[address].balance
      })
    }
    
    // Process the payment
    users[address].balance -= membership.amount
    
    // Add payment transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'membership_payment',
      amount: membership.amount,
      membershipId: membership.id,
      membershipTitle: membership.title,
      timestamp: new Date().toISOString(),
      status: 'completed',
      retried: true
    }
    
    users[address].transactions.unshift(transaction)
    
    // Update membership status and dates
    membership.status = 'active'
    membership.lastPaidDate = new Date().toISOString()
    
    // Calculate next payment date
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, membership.chargeDate)
    membership.nextPaymentDate = nextMonth.toISOString()
    
    // Remove failed payment date if it exists
    delete membership.failedPaymentDate
    
    // Credit the admin account
    await creditAdminAccount(membership.amount, membership, address)
    
    const success = await writeUsersData(users)
    
    if (success) {
      res.json({
        success: true,
        balance: users[address].balance,
        transaction,
        membership
      })
    } else {
      res.status(500).json({ error: 'Failed to process payment retry' })
    }
  } catch (error) {
    console.error('Error retrying payment:', error)
    res.status(500).json({ error: 'Failed to retry payment' })
  }
})

// Get admin configuration
app.get('/api/admin/config', async (req, res) => {
  try {
    const admin = await readAdminData()
    // Don't expose sensitive info in response, only relevant data
    res.json({
      name: admin.name,
      address: admin.address,
      balance: admin.balance,
      configured: admin.configured
    })
  } catch (error) {
    console.error('Error fetching admin config:', error)
    res.status(500).json({ error: 'Failed to fetch admin configuration' })
  }
})

// Update admin configuration
app.put('/api/admin/config', async (req, res) => {
  try {
    const { name, address } = req.body
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' })
    }
    
    const admin = await readAdminData()
    
    admin.name = name
    admin.address = address
    admin.configured = true
    
    const success = await writeAdminData(admin)
    
    if (success) {
      console.log('✅ Admin configuration updated:')
      console.log(`   Name: ${admin.name}`)
      console.log(`   Address: ${admin.address}`)
      
      res.json({
        success: true,
        admin: {
          name: admin.name,
          address: admin.address,
          balance: admin.balance,
          configured: admin.configured
        }
      })
    } else {
      res.status(500).json({ error: 'Failed to update admin configuration' })
    }
  } catch (error) {
    console.error('Error updating admin config:', error)
    res.status(500).json({ error: 'Failed to update admin configuration' })
  }
})

// Initialize server
async function startServer() {
  await ensureDataDirectory()
  
  // Check admin configuration
  const admin = await readAdminData()
  
  app.listen(PORT, () => {
    console.log(`✅ PayPulse backend server running on http://localhost:${PORT}`)
    console.log(`⚡ Server ready to accept requests`)
    
    // Display admin status
    if (admin.configured) {
      console.log(`👤 Admin configured: ${admin.name} (${admin.address})`)
      console.log(`💰 Admin balance: $${admin.balance.toFixed(2)}`)
    } else {
      console.log(`⚠️  Admin not configured. Please set admin via POST /api/admin/config`)
    }
  })
  
  // Start the automatic payment scheduler
  startPaymentScheduler()
}

startServer()

