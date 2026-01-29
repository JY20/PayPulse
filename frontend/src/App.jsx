import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import AddPayment from './pages/AddPayment'
import DepositFunds from './pages/DepositFunds'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import OneMonth from './pages/OneMonth'
import MemoryDetail from './pages/MemoryDetail'
import { PaymentProvider } from './context/PaymentContext'
import { PolkadotProvider } from './context/PolkadotContext'
import { UserDataProvider } from './context/UserDataContext'

function App() {
  return (
    <PolkadotProvider>
      <UserDataProvider>
        <PaymentProvider>
          <Router>
            <Routes>
              {/* Memory pages without Layout (no navbar) */}
              <Route path="/1month" element={<OneMonth />} />
              <Route path="/1month/memory/:id" element={<MemoryDetail />} />
              
              {/* Regular pages with Layout */}
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/payments" element={<Layout><Payments /></Layout>} />
              <Route path="/add-payment" element={<Layout><AddPayment /></Layout>} />
              <Route path="/edit-payment/:id" element={<Layout><AddPayment /></Layout>} />
              <Route path="/deposit" element={<Layout><DepositFunds /></Layout>} />
              <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
            </Routes>
          </Router>
        </PaymentProvider>
      </UserDataProvider>
    </PolkadotProvider>
  )
}

export default App

