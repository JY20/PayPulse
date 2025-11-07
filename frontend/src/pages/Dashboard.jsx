import { useEffect } from 'react'
import { useUserData } from '../context/UserDataContext'
import { usePolkadot } from '../context/PolkadotContext'
import { DollarSign, TrendingUp, Calendar, Wallet, Award } from 'lucide-react'
import { format, isThisMonth } from 'date-fns'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { userData, fetchMemberships } = useUserData()
  const { isConnected } = usePolkadot()

  useEffect(() => {
    if (isConnected) {
      fetchMemberships()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  const memberships = userData?.memberships || []
  const transactions = userData?.transactions || []
  
  const activeMemberships = memberships.filter(m => m.status === 'active')
  
  const monthlyTotal = activeMemberships.reduce((sum, m) => sum + m.amount, 0)
  
  const recentTransactions = transactions.slice(0, 5)

  const thisMonthTransactions = transactions.filter(t => 
    isThisMonth(new Date(t.timestamp))
  )

  const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => {
    return t.type === 'deposit' ? sum + t.amount : sum - t.amount
  }, 0)

  const stats = [
    {
      title: 'Platform Balance',
      value: `${userData?.balance.toFixed(2) || '0.00'} DOT`,
      icon: Wallet,
      color: 'bg-accent',
      change: 'Available for payments'
    },
    {
      title: 'Active Memberships',
      value: activeMemberships.length,
      icon: Award,
      color: 'bg-secondary',
      change: `${memberships.length} total memberships`
    },
    {
      title: 'Monthly Total',
      value: `$${monthlyTotal.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-success',
      change: 'Combined membership fees'
    },
    {
      title: 'This Month Activity',
      value: `${thisMonthTotal >= 0 ? '+' : ''}${thisMonthTotal.toFixed(2)} DOT`,
      icon: TrendingUp,
      color: 'bg-warning',
      change: `${thisMonthTransactions.length} transactions`
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">Dashboard</h1>
        <p className="text-textSecondary mt-1">Welcome back! Here's your payment overview</p>
      </div>

      {/* Platform Balance Card */}
      {isConnected && userData && (
        <div className="card bg-gradient-to-r from-accent/20 to-secondary/20 border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-accent" />
                <p className="text-sm font-medium text-textSecondary">Platform Balance</p>
              </div>
              <p className="text-4xl font-bold text-textPrimary">${userData.balance.toFixed(2)}</p>
              <p className="text-sm text-textSecondary mt-2">
                {userData.transactions.length} transactions
              </p>
            </div>
            <Link
              to="/deposit"
              className="btn-primary"
            >
              Deposit Funds
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textSecondary">{stat.title}</p>
                  <p className="text-3xl font-bold text-textPrimary mt-2">{stat.value}</p>
                  <p className="text-xs text-textSecondary mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Memberships */}
      {isConnected && activeMemberships.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Active Memberships</h2>
            <Link to="/payments" className="text-secondary hover:text-primary text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMemberships.map((membership) => (
              <div key={membership.id} className="bg-gradient-to-br from-accent/10 to-secondary/10 border border-accent/20 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Award className="h-5 w-5 text-accent" />
                  <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                    {membership.status}
                  </span>
                </div>
                <h3 className="font-bold text-textPrimary mb-1">{membership.title}</h3>
                <p className="text-sm text-textSecondary mb-3 line-clamp-2">
                  {membership.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-accent">${membership.amount}</span>
                  <span className="text-xs text-textSecondary">Day {membership.chargeDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Upcoming Renewals</h2>
            <Link to="/calendar" className="text-secondary hover:text-primary text-sm font-medium">
              View Calendar
            </Link>
          </div>
          <div className="space-y-3">
            {activeMemberships.length > 0 ? (
              activeMemberships.slice(0, 5).map((membership) => (
                <div key={membership.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-accent/10 transition">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent/20 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary">{membership.title}</p>
                      <p className="text-sm text-textSecondary">Charges on day {membership.chargeDate}</p>
                    </div>
                  </div>
                  <p className="font-bold text-textPrimary">${membership.amount}</p>
                </div>
              ))
            ) : (
              <p className="text-textSecondary text-center py-8">No active memberships</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Recent Transactions</h2>
            <Link to="/settings" className="text-secondary hover:text-primary text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`${transaction.type === 'deposit' ? 'bg-success/20' : 'bg-error/20'} p-2 rounded-lg`}>
                      <DollarSign className={`h-5 w-5 ${transaction.type === 'deposit' ? 'text-success' : 'text-error'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary capitalize">{transaction.type}</p>
                      <p className="text-sm text-textSecondary">{format(new Date(transaction.timestamp), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${transaction.type === 'deposit' ? 'text-success' : 'text-error'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toFixed(2)} DOT
                  </p>
                </div>
              ))
            ) : (
              <p className="text-textSecondary text-center py-8">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      {/* Connect Wallet Message */}
      {!isConnected && (
        <div className="card text-center py-12">
          <Wallet className="h-16 w-16 text-textSecondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Connect Your Wallet</h2>
          <p className="text-textSecondary mb-4">
            Connect your Polkadot wallet to view your dashboard
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard

