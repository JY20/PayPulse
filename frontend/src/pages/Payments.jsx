import { useState, useEffect } from 'react'
import { usePolkadot } from '../context/PolkadotContext'
import { useUserData } from '../context/UserDataContext'
import { Link } from 'react-router-dom'
import { Wallet, Filter, Search, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const Payments = () => {
  const { isConnected } = usePolkadot()
  const { userData, fetchMemberships, payMembership, isLoading } = useUserData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [notification, setNotification] = useState(null)
  const [payingMembershipId, setPayingMembershipId] = useState(null)

  useEffect(() => {
    if (isConnected) {
      fetchMemberships()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const memberships = userData?.memberships || []
  const userBalance = userData?.balance || 0

  const handlePayNow = async (membershipId, membershipAmount, membershipTitle) => {
    // Check if user has sufficient balance
    if (userBalance < membershipAmount) {
      setNotification({
        type: 'error',
        message: `Insufficient balance. You need $${membershipAmount.toFixed(2)} but have $${userBalance.toFixed(2)}`
      })
      return
    }

    setPayingMembershipId(membershipId)
    
    try {
      const result = await payMembership(membershipId)
      
      if (result.success) {
        const nextDate = result.membership?.nextPaymentDate 
          ? format(new Date(result.membership.nextPaymentDate), 'MMM dd, yyyy')
          : 'N/A'
        setNotification({
          type: 'success',
          message: `Payment of $${membershipAmount.toFixed(2)} for "${membershipTitle}" was successful! Next payment due: ${nextDate}. New balance: $${result.balance.toFixed(2)}`
        })
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Payment failed'
        })
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to process payment'
      })
    } finally {
      setPayingMembershipId(null)
    }
  }

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || membership.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <Wallet className="h-16 w-16 text-textSecondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Connect Your Wallet</h2>
          <p className="text-textSecondary">
            Please connect your Polkadot wallet to view your memberships
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`card ${notification.type === 'success' ? 'bg-success/10 border-success' : 'bg-error/10 border-error'} border-2 flex items-center gap-3`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
          ) : (
            <AlertCircle className="h-6 w-6 text-error flex-shrink-0" />
          )}
          <p className={`${notification.type === 'success' ? 'text-success' : 'text-error'} font-medium`}>
            {notification.message}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Active Memberships</h1>
          <p className="text-textSecondary mt-1">Manage your subscription memberships</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-textSecondary">Available Balance</p>
          <p className="text-2xl font-bold text-accent">${userBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textSecondary" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-textSecondary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-surface"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-textSecondary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-surface"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Memberships List */}
      {filteredMemberships.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredMemberships.map((membership) => (
            <div key={membership.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-textPrimary">{membership.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      membership.status === 'active' 
                        ? 'bg-success/20 text-success' 
                        : membership.status === 'paused'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-error/20 text-error'
                    }`}>
                      {membership.status}
                    </span>
                  </div>
                  <p className="text-sm text-textSecondary mb-3">
                    {membership.description}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="text-textSecondary">
                        Charges on day <span className="font-semibold text-textPrimary">{membership.chargeDate}</span> each month
                      </span>
                    </div>
                    {membership.lastPaidDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-textSecondary">
                          Last paid: <span className="font-semibold text-success">
                            {format(new Date(membership.lastPaidDate), 'MMM dd, yyyy')}
                          </span>
                        </span>
                      </div>
                    )}
                    {membership.nextPaymentDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-warning" />
                        <span className="text-textSecondary">
                          Next payment: <span className="font-semibold text-textPrimary">
                            {format(new Date(membership.nextPaymentDate), 'MMM dd, yyyy')}
                          </span>
                        </span>
                      </div>
                    )}
                    {membership.lastPaidDate && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-accent" />
                        <span className="text-textSecondary">
                          Payments made: <span className="font-semibold text-accent">
                            {userData?.transactions?.filter(t => t.membershipId === membership.id).length || 0}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-accent">${membership.amount.toFixed(2)}</p>
                    <p className="text-sm text-textSecondary">/month</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handlePayNow(membership.id, membership.amount, membership.title)}
                      disabled={isLoading || payingMembershipId === membership.id || userBalance < membership.amount}
                      className={`btn-primary text-sm px-4 py-2 w-full ${
                        userBalance < membership.amount 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      {payingMembershipId === membership.id ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          Pay Now
                        </>
                      )}
                    </button>
                    <Link
                      to="/deposit"
                      className="btn-secondary text-sm px-4 py-2 text-center"
                    >
                      Add Funds
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Filter className="h-12 w-12 text-textSecondary mx-auto mb-3" />
          <p className="text-textSecondary">No memberships found matching your filters</p>
        </div>
      )}
    </div>
  )
}

export default Payments

