import { createContext, useContext, useState, useEffect } from 'react'
import { addMonths, addDays, addWeeks, addYears } from 'date-fns'

const PaymentContext = createContext()

export const usePayments = () => {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayments must be used within a PaymentProvider')
  }
  return context
}

const initialPayments = [
  {
    id: '1',
    name: 'Netflix Subscription',
    category: 'Entertainment',
    amount: 15.99,
    frequency: 'monthly',
    nextPaymentDate: new Date(2025, 10, 15),
    status: 'active',
    autoDeduct: true,
    paymentMethod: 'Credit Card ****1234'
  },
  {
    id: '2',
    name: 'Rent Payment',
    category: 'Housing',
    amount: 1200,
    frequency: 'monthly',
    nextPaymentDate: new Date(2025, 10, 1),
    status: 'active',
    autoDeduct: true,
    paymentMethod: 'Bank Account ****5678'
  },
  {
    id: '3',
    name: 'Gym Membership',
    category: 'Health',
    amount: 49.99,
    frequency: 'monthly',
    nextPaymentDate: new Date(2025, 10, 10),
    status: 'active',
    autoDeduct: true,
    paymentMethod: 'Credit Card ****1234'
  },
  {
    id: '4',
    name: 'Spotify Premium',
    category: 'Entertainment',
    amount: 9.99,
    frequency: 'monthly',
    nextPaymentDate: new Date(2025, 10, 20),
    status: 'active',
    autoDeduct: true,
    paymentMethod: 'Credit Card ****1234'
  }
]

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('paypulse-payments')
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'nextPaymentDate') return new Date(value)
      return value
    }) : initialPayments
  })

  const [paymentHistory, setPaymentHistory] = useState(() => {
    const saved = localStorage.getItem('paypulse-history')
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'date') return new Date(value)
      return value
    }) : []
  })

  useEffect(() => {
    localStorage.setItem('paypulse-payments', JSON.stringify(payments))
  }, [payments])

  useEffect(() => {
    localStorage.setItem('paypulse-history', JSON.stringify(paymentHistory))
  }, [paymentHistory])

  const addPayment = (payment) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      status: 'active',
      nextPaymentDate: new Date(payment.nextPaymentDate)
    }
    setPayments([...payments, newPayment])
  }

  const updatePayment = (id, updatedPayment) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, ...updatedPayment, nextPaymentDate: new Date(updatedPayment.nextPaymentDate) } : payment
    ))
  }

  const deletePayment = (id) => {
    setPayments(payments.filter(payment => payment.id !== id))
  }

  const togglePaymentStatus = (id) => {
    setPayments(payments.map(payment => 
      payment.id === id ? { ...payment, status: payment.status === 'active' ? 'paused' : 'active' } : payment
    ))
  }

  const processPayment = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId)
    if (!payment) return

    // Add to history
    const historyEntry = {
      id: Date.now().toString(),
      paymentId: payment.id,
      name: payment.name,
      amount: payment.amount,
      date: new Date(),
      status: 'completed'
    }
    setPaymentHistory([historyEntry, ...paymentHistory])

    // Update next payment date
    let nextDate = new Date(payment.nextPaymentDate)
    switch (payment.frequency) {
      case 'daily':
        nextDate = addDays(nextDate, 1)
        break
      case 'weekly':
        nextDate = addWeeks(nextDate, 1)
        break
      case 'monthly':
        nextDate = addMonths(nextDate, 1)
        break
      case 'yearly':
        nextDate = addYears(nextDate, 1)
        break
      default:
        nextDate = addMonths(nextDate, 1)
    }

    updatePayment(paymentId, { nextPaymentDate: nextDate })
  }

  return (
    <PaymentContext.Provider value={{
      payments,
      paymentHistory,
      addPayment,
      updatePayment,
      deletePayment,
      togglePaymentStatus,
      processPayment
    }}>
      {children}
    </PaymentContext.Provider>
  )
}

