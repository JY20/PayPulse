import { useState } from 'react'
import { usePayments } from '../context/PaymentContext'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from 'date-fns'
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'

const Calendar = () => {
  const { payments } = usePayments()
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getPaymentsForDay = (day) => {
    return payments.filter(payment => 
      payment.status === 'active' && isSameDay(payment.nextPaymentDate, day)
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const today = startOfToday()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">Payment Calendar</h1>
        <p className="text-textSecondary mt-1">View your upcoming payment schedule</p>
      </div>

      <div className="card">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-textPrimary">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-background rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-background rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-textPrimary py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {/* Days with payments */}
          {daysInMonth.map(day => {
            const dayPayments = getPaymentsForDay(day)
            const isCurrentDay = isToday(day)
            const isPast = isBefore(day, today) && !isCurrentDay
            const hasPayments = dayPayments.length > 0
            const totalAmount = dayPayments.reduce((sum, p) => sum + p.amount, 0)

            return (
              <div
                key={day.toString()}
                className={`aspect-square border rounded-lg p-2 transition ${
                  isCurrentDay 
                    ? 'border-secondary bg-accent/20' 
                    : isPast
                    ? 'bg-background border-textSecondary/20'
                    : 'border-textSecondary/20 hover:border-textSecondary/40'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isCurrentDay ? 'text-primary' : isPast ? 'text-textSecondary/50' : 'text-textPrimary'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {hasPayments && (
                  <div className="space-y-1">
                    {dayPayments.slice(0, 2).map(payment => (
                      <div
                        key={payment.id}
                        className="text-xs bg-accent/30 text-primary rounded px-1 py-0.5 truncate"
                        title={`${payment.name} - $${payment.amount}`}
                      >
                        ${payment.amount}
                      </div>
                    ))}
                    {dayPayments.length > 2 && (
                      <div className="text-xs text-textSecondary">
                        +{dayPayments.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-textPrimary mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-secondary bg-accent/20 rounded"></div>
            <span className="text-sm text-textPrimary">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent/30 rounded"></div>
            <span className="text-sm text-textPrimary">Has Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-background border border-textSecondary/20 rounded"></div>
            <span className="text-sm text-textPrimary">Past Date</span>
          </div>
        </div>
      </div>

      {/* Upcoming Payments List */}
      <div className="card">
        <h3 className="text-xl font-bold text-textPrimary mb-4">
          Payments This Month
        </h3>
        <div className="space-y-3">
          {payments
            .filter(p => {
              const paymentMonth = p.nextPaymentDate.getMonth()
              const paymentYear = p.nextPaymentDate.getFullYear()
              return paymentMonth === currentDate.getMonth() && 
                     paymentYear === currentDate.getFullYear() &&
                     p.status === 'active'
            })
            .sort((a, b) => a.nextPaymentDate - b.nextPaymentDate)
            .map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-textPrimary">{payment.name}</p>
                    <p className="text-sm text-textSecondary">
                      {format(payment.nextPaymentDate, 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-textPrimary">${payment.amount}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Calendar

