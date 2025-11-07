import { useState } from 'react'
import { usePayments } from '../context/PaymentContext'
import { Link } from 'react-router-dom'
import { Edit, Trash2, Pause, Play, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'

const Payments = () => {
  const { payments, deletePayment, togglePaymentStatus } = usePayments()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const categories = ['all', ...new Set(payments.map(p => p.category))]

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || payment.category === filterCategory
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deletePayment(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">All Payments</h1>
          <p className="text-textSecondary mt-1">Manage your recurring payments</p>
        </div>
        <Link to="/add-payment" className="btn-primary">
          Add Payment
        </Link>
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
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-textSecondary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-surface"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-textSecondary/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-surface"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-textPrimary">{payment.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'active' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-warning/20 text-warning'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-textSecondary">
                      <span className="font-medium">Category:</span> {payment.category}
                    </p>
                    <p className="text-sm text-textSecondary">
                      <span className="font-medium">Frequency:</span> {payment.frequency}
                    </p>
                    <p className="text-sm text-textSecondary">
                      <span className="font-medium">Next Payment:</span> {format(payment.nextPaymentDate, 'MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-textSecondary">
                      <span className="font-medium">Payment Method:</span> {payment.paymentMethod}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <p className="text-3xl font-bold text-secondary">${payment.amount}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePaymentStatus(payment.id)}
                      className="p-2 text-textSecondary hover:bg-background rounded-lg transition"
                      title={payment.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {payment.status === 'active' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <Link
                      to={`/edit-payment/${payment.id}`}
                      className="p-2 text-secondary hover:bg-accent/10 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(payment.id, payment.name)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Filter className="h-12 w-12 text-textSecondary mx-auto mb-3" />
          <p className="text-textSecondary">No payments found matching your filters</p>
        </div>
      )}
    </div>
  )
}

export default Payments

