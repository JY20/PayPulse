import { usePayments } from '../context/PaymentContext'
import { DollarSign, TrendingUp, Calendar, Activity } from 'lucide-react'
import { format, isThisMonth, isBefore, startOfToday } from 'date-fns'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { payments, paymentHistory } = usePayments()

  const activePayments = payments.filter(p => p.status === 'active')
  
  const monthlyTotal = activePayments
    .filter(p => p.frequency === 'monthly')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const upcomingPayments = activePayments
    .filter(p => isThisMonth(p.nextPaymentDate))
    .sort((a, b) => a.nextPaymentDate - b.nextPaymentDate)
    .slice(0, 5)

  const recentHistory = paymentHistory.slice(0, 5)

  const overduePayments = activePayments.filter(
    p => isBefore(p.nextPaymentDate, startOfToday())
  )

  const stats = [
    {
      title: 'Monthly Total',
      value: `$${monthlyTotal.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-success',
      change: '+12% from last month'
    },
    {
      title: 'Active Payments',
      value: activePayments.length,
      icon: Activity,
      color: 'bg-secondary',
      change: `${payments.length} total subscriptions`
    },
    {
      title: 'Next Payment',
      value: upcomingPayments.length > 0 ? format(upcomingPayments[0].nextPaymentDate, 'MMM dd') : 'None',
      icon: Calendar,
      color: 'bg-primary',
      change: `${upcomingPayments.length} this month`
    },
    {
      title: 'Paid This Month',
      value: `$${paymentHistory.filter(p => isThisMonth(p.date)).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-warning',
      change: `${paymentHistory.filter(p => isThisMonth(p.date)).length} transactions`
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">Dashboard</h1>
        <p className="text-textSecondary mt-1">Welcome back! Here's your payment overview</p>
      </div>

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

      {/* Overdue Alerts */}
      {overduePayments.length > 0 && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-4">
          <h3 className="text-error font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overdue Payments
          </h3>
          <div className="mt-3 space-y-2">
            {overduePayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center bg-surface p-3 rounded-lg">
                <div>
                  <p className="font-medium text-textPrimary">{payment.name}</p>
                  <p className="text-sm text-textSecondary">Due: {format(payment.nextPaymentDate, 'MMM dd, yyyy')}</p>
                </div>
                <p className="text-error font-bold">${payment.amount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Upcoming Payments</h2>
            <Link to="/calendar" className="text-secondary hover:text-primary text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-accent/10 transition">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent/20 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary">{payment.name}</p>
                      <p className="text-sm text-textSecondary">{format(payment.nextPaymentDate, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <p className="font-bold text-textPrimary">${payment.amount}</p>
                </div>
              ))
            ) : (
              <p className="text-textSecondary text-center py-8">No upcoming payments this month</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Recent Activity</h2>
            <Link to="/payments" className="text-secondary hover:text-primary text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentHistory.length > 0 ? (
              recentHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-success/20 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-textPrimary">{transaction.name}</p>
                      <p className="text-sm text-textSecondary">{format(transaction.date, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <p className="font-bold text-success">-${transaction.amount}</p>
                </div>
              ))
            ) : (
              <p className="text-textSecondary text-center py-8">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

