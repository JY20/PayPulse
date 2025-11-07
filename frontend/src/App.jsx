import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import AddPayment from './pages/AddPayment'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import { PaymentProvider } from './context/PaymentContext'

function App() {
  return (
    <PaymentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/add-payment" element={<AddPayment />} />
            <Route path="/edit-payment/:id" element={<AddPayment />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </PaymentProvider>
  )
}

export default App

