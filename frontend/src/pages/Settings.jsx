import { useState } from 'react'
import { Bell, CreditCard, Shield, User, Download, Trash2 } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    paymentReminders: true,
    weeklyReport: false,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  })

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleExportData = () => {
    alert('Exporting your payment data...')
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary">Settings</h1>
        <p className="text-textSecondary mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="input-field"
            />
          </div>
          <button className="btn-primary">Update Profile</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-textPrimary">Email Notifications</p>
              <p className="text-sm text-textSecondary">Receive payment alerts via email</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.emailNotifications ? 'bg-secondary' : 'bg-textSecondary/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-textPrimary">Push Notifications</p>
              <p className="text-sm text-textSecondary">Receive push notifications on your device</p>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.pushNotifications ? 'bg-secondary' : 'bg-textSecondary/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-textPrimary">Payment Reminders</p>
              <p className="text-sm text-textSecondary">Get reminded 3 days before payment</p>
            </div>
            <button
              onClick={() => handleToggle('paymentReminders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.paymentReminders ? 'bg-secondary' : 'bg-textSecondary/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.paymentReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-textPrimary">Weekly Report</p>
              <p className="text-sm text-textSecondary">Receive weekly payment summary</p>
            </div>
            <button
              onClick={() => handleToggle('weeklyReport')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.weeklyReport ? 'bg-secondary' : 'bg-textSecondary/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Preferences</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="input-field"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="input-field"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-6 w-6 text-secondary" />
          <h2 className="text-xl font-bold text-textPrimary">Payment Methods</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <p className="font-medium text-textPrimary">Credit Card</p>
              <p className="text-sm text-textSecondary">•••• •••• •••• 1234</p>
            </div>
            <span className="text-xs bg-accent/30 text-primary px-2 py-1 rounded">Primary</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
              <p className="font-medium text-textPrimary">Bank Account</p>
              <p className="text-sm text-textSecondary">•••• •••• •••• 5678</p>
            </div>
          </div>
          <button className="btn-primary w-full">Add Payment Method</button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-bold text-textPrimary mb-6">Data Management</h2>
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            <Download className="h-5 w-5" />
            Export My Data
          </button>
          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 bg-error hover:bg-error/90 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            <Trash2 className="h-5 w-5" />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings

