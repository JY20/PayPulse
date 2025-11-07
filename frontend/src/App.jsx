import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import AddPayment from './pages/AddPayment'
import DepositFunds from './pages/DepositFunds'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import { PaymentProvider } from './context/PaymentContext'
import { PolkadotProvider } from './context/PolkadotContext'
import { UserDataProvider } from './context/UserDataContext'

function App() {
  return (
    <PolkadotProvider>
      <UserDataProvider>
        <PaymentProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/add-payment" element={<AddPayment />} />
                <Route path="/edit-payment/:id" element={<AddPayment />} />
                <Route path="/deposit" element={<DepositFunds />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </PaymentProvider>
      </UserDataProvider>
    </PolkadotProvider>
  )
}

export default App

