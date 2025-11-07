import { useState, useEffect } from 'react'
import { usePolkadot } from '../context/PolkadotContext'
import { useUserData } from '../context/UserDataContext'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from 'date-fns'
import { ChevronLeft, ChevronRight, DollarSign, Calendar as CalendarIcon } from 'lucide-react'

const Calendar = () => {
  const { isConnected } = usePolkadot()
  const { fetchCalendarEvents } = useUserData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])

  useEffect(() => {
    const loadEvents = async () => {
      if (isConnected) {
        const calendarEvents = await fetchCalendarEvents()
        setEvents(calendarEvents)
      }
    }
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDay = (day) => {
    return events.filter(event => 
      event.status === 'active' && isSameDay(new Date(event.date), day)
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const today = startOfToday()

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <CalendarIcon className="h-16 w-16 text-textSecondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Connect Your Wallet</h2>
          <p className="text-textSecondary">
            Please connect your Polkadot wallet to view your calendar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">Membership Calendar</h1>
        <p className="text-textSecondary mt-1">View your membership renewal schedule</p>
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
          
          {/* Days with events */}
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDay(day)
            const isCurrentDay = isToday(day)
            const isPast = isBefore(day, today) && !isCurrentDay
            const hasEvents = dayEvents.length > 0

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
                
                {hasEvents && (
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs bg-accent/30 text-primary rounded px-1 py-0.5 truncate"
                        title={`${event.title} - $${event.amount}`}
                      >
                        ${event.amount}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-textSecondary">
                        +{dayEvents.length - 2} more
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
            <span className="text-sm text-textPrimary">Has Renewals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-background border border-textSecondary/20 rounded"></div>
            <span className="text-sm text-textPrimary">Past Date</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="card">
        <h3 className="text-xl font-bold text-textPrimary mb-4">
          Renewals This Month
        </h3>
        <div className="space-y-3">
          {events
            .filter(e => {
              const eventDate = new Date(e.date)
              const eventMonth = eventDate.getMonth()
              const eventYear = eventDate.getFullYear()
              return eventMonth === currentDate.getMonth() && 
                     eventYear === currentDate.getFullYear() &&
                     e.status === 'active'
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-textPrimary">{event.title}</p>
                    <p className="text-sm text-textSecondary">
                      {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-textSecondary">{event.description}</p>
                  </div>
                </div>
                <p className="font-bold text-textPrimary">${event.amount}</p>
              </div>
            ))}
          {events.filter(e => {
            const eventDate = new Date(e.date)
            return eventDate.getMonth() === currentDate.getMonth() && 
                   eventDate.getFullYear() === currentDate.getFullYear()
          }).length === 0 && (
            <p className="text-center text-textSecondary py-8">
              No renewals scheduled for this month
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calendar

