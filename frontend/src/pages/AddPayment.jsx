import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePayments } from '../context/PaymentContext'
import { ArrowLeft, Save } from 'lucide-react'
import { format } from 'date-fns'

const AddPayment = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { payments, addPayment, updatePayment } = usePayments()
  
  const isEditMode = Boolean(id)
  const existingPayment = isEditMode ? payments.find(p => p.id === id) : null

  const [formData, setFormData] = useState({
    name: '',
    category: 'Entertainment',
    amount: '',
    frequency: 'monthly',
    nextPaymentDate: format(new Date(), 'yyyy-MM-dd'),
    autoDeduct: true,
    paymentMethod: ''
  })

  useEffect(() => {
    if (existingPayment) {
      setFormData({
        name: existingPayment.name,
        category: existingPayment.category,
        amount: existingPayment.amount.toString(),
        frequency: existingPayment.frequency,
        nextPaymentDate: format(existingPayment.nextPaymentDate, 'yyyy-MM-dd'),
        autoDeduct: existingPayment.autoDeduct,
        paymentMethod: existingPayment.paymentMethod
      })
    }
  }, [existingPayment])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount)
    }

    if (isEditMode) {
      updatePayment(id, paymentData)
    } else {
      addPayment(paymentData)
    }
    
    navigate('/payments')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-textSecondary hover:text-textPrimary transition"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div>
        <h1 className="text-3xl font-bold text-textPrimary">
          {isEditMode ? 'Edit Payment' : 'Add New Payment'}
        </h1>
        <p className="text-textSecondary mt-1">
          {isEditMode ? 'Update your recurring payment details' : 'Set up a new recurring payment'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-2">
            Payment Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Netflix Subscription"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-textPrimary mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="Entertainment">Entertainment</option>
              <option value="Housing">Housing</option>
              <option value="Health">Health</option>
              <option value="Utilities">Utilities</option>
              <option value="Insurance">Insurance</option>
              <option value="Transportation">Transportation</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-textPrimary mb-2">
              Amount ($) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-textPrimary mb-2">
              Frequency *
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-textPrimary mb-2">
              Next Payment Date *
            </label>
            <input
              type="date"
              id="nextPaymentDate"
              name="nextPaymentDate"
              value={formData.nextPaymentDate}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-textPrimary mb-2">
            Payment Method *
          </label>
          <input
            type="text"
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            placeholder="e.g., Credit Card ****1234"
            className="input-field"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoDeduct"
            name="autoDeduct"
            checked={formData.autoDeduct}
            onChange={handleChange}
            className="h-4 w-4 text-secondary focus:ring-accent border-textSecondary/20 rounded"
          />
          <label htmlFor="autoDeduct" className="ml-2 block text-sm text-textPrimary">
            Enable automatic deduction
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex items-center gap-2 flex-1">
            <Save className="h-5 w-5" />
            {isEditMode ? 'Update Payment' : 'Add Payment'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPayment

