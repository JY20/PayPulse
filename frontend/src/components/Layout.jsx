import { Link, useLocation } from 'react-router-dom'
import { Home, CreditCard, Plus, CalendarDays, Settings } from 'lucide-react'
import WalletButton from './WalletButton'

const Layout = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/add-payment', icon: Plus, label: 'Add Payment' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/paypulse.png" 
                alt="PayPulse Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-2xl font-bold text-primary">
                PayPulse
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <WalletButton />
              <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-accent/20 text-primary font-semibold'
                        : 'text-textSecondary hover:bg-background hover:text-textPrimary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-surface border-t border-textSecondary/10 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 px-2 ${
                  isActive ? 'text-secondary' : 'text-textSecondary'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}

export default Layout

