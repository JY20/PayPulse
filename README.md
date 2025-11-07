# PayPulse 💳⚡

An automated payment platform built on Polkadot that seamlessly manages recurring memberships, subscriptions, and rent through intelligent scheduled payments and real-time balance management.

![PayPulse](https://img.shields.io/badge/React-18.2.0-blue)
![Polkadot](https://img.shields.io/badge/Polkadot-API-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Functionality
- **🔐 Polkadot Wallet Integration** - Connect with any Polkadot wallet using browser extension
- **💰 Balance Management** - Deposit DOT tokens to maintain platform balance for payments
- **🔄 Membership Payments** - Pay for active memberships directly from your platform balance
- **📊 Real-time Dashboard** - View all payment statistics and upcoming renewals at a glance
- **📅 Smart Calendar** - Visual calendar showing all scheduled membership payments
- **📈 Transaction History** - Complete tracking of deposits, withdrawals, and payments
- **🎯 Payment Tracking** - Monitor last payment date and next due date for each membership

### Advanced Payment Features
- **✨ Cumulative Payments** - Pay multiple months in advance; each payment extends the next due date by one month
- **💳 Direct Payment Processing** - Instant payment with balance deduction and transaction recording
- **🔔 Payment Notifications** - Real-time success/error notifications for all transactions
- **📉 Balance Validation** - Automatic insufficient funds checking before processing payments
- **🗓️ Next Payment Calculation** - Intelligent date calculation based on membership charge dates

### User Interface
- **🎨 Modern UI** - Beautiful, responsive design with Tailwind CSS
- **📱 Mobile Responsive** - Works seamlessly on all device sizes
- **🌓 Clean Theme** - Professional gradient design with accent colors
- **⚡ Fast & Efficient** - Built with Vite for optimal performance

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with Hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Polkadot.js** - Wallet integration and blockchain interaction
- **Lucide React** - Beautiful icon library
- **date-fns** - Modern date utility library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **CORS** - Cross-origin resource sharing
- **JSON File Storage** - Simple data persistence

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm installed
- Polkadot wallet browser extension (Polkadot{.js}, Talisman, SubWallet, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/PayPulse.git
   cd PayPulse
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on `http://localhost:3001`

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
The backend runs directly with Node.js - no build step required.

## 📖 Usage Guide

### 1. Connect Your Wallet

1. Install a Polkadot wallet extension in your browser
2. Create or import a Polkadot account
3. Click "Connect Wallet" in the top right corner of PayPulse
4. Select your account from the wallet popup
5. Your account address and balance will be displayed

### 2. Deposit Funds

1. Navigate to the "Deposit" page
2. Enter the amount of DOT you want to deposit
3. Choose deposit method:
   - **From Wallet**: Transfer DOT from your connected wallet to the platform
   - **Manual Entry**: Record a deposit from another source
4. Confirm the transaction
5. Your platform balance will be updated immediately

### 3. View Your Memberships

1. Go to the "Payments" page
2. View all active memberships with:
   - Membership title and description
   - Monthly cost
   - Charge date (day of month)
   - Last payment date
   - Next payment due date
   - Total payments made
3. Search and filter memberships by status

### 4. Pay for Memberships

1. On the Payments page, find the membership you want to pay
2. Check your available balance at the top
3. Click "Pay Now" button
4. System validates sufficient balance
5. Payment is processed immediately:
   - Balance is deducted
   - Transaction is recorded
   - Last payment date is updated
   - Next payment date is calculated (extended by one month)
6. Success notification shows new balance and next due date

### 5. Multiple Payments (Advance Payments)

- You can pay the same membership multiple times
- Each payment extends the next due date by one month
- Example: Pay twice in November → Next due date moves from December to January
- Perfect for paying several months in advance
- Track total payments made per membership

### 6. Monitor Your Activity

**Dashboard:**
- View platform balance and wallet balance
- See active membership count
- Check monthly payment totals
- Review recent transactions

**Calendar:**
- Visual view of all upcoming payment dates
- Navigate between months
- See which memberships are due each day

**Settings:**
- View complete transaction history
- Update profile information (name, email)
- Check account statistics:
  - Total transactions
  - Total deposits
  - Total payments made
  - Active memberships

## 📁 Project Structure

```
PayPulse/
├── backend/
│   ├── data/
│   │   └── users.json              # User data storage
│   ├── node_modules/
│   ├── package.json
│   ├── server.js                   # Express server
│   └── README.md
├── frontend/
│   ├── public/
│   │   ├── config.json             # Configuration file
│   │   └── paypulse.png           # Logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Main layout with navigation
│   │   │   └── WalletButton.jsx   # Wallet connection button
│   │   ├── context/
│   │   │   ├── PaymentContext.jsx  # Payment state management
│   │   │   ├── PolkadotContext.jsx # Wallet & blockchain state
│   │   │   └── UserDataContext.jsx # User data & API calls
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Dashboard overview
│   │   │   ├── Payments.jsx        # Memberships list
│   │   │   ├── AddPayment.jsx      # Add/Edit payment form
│   │   │   ├── DepositFunds.jsx    # Deposit interface
│   │   │   ├── Calendar.jsx        # Calendar view
│   │   │   └── Settings.jsx        # Settings & profile
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx               # Entry point
│   │   ├── config.js              # App configuration
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
├── PayPulse.png                    # Project logo
└── README.md                       # This file
```

## 🔍 Features in Detail

### Wallet Integration
- Connect any Polkadot-compatible wallet
- Display wallet address and balance
- Real-time balance updates
- Secure transaction signing

### Payment Processing
- **Validation**: Checks sufficient balance before payment
- **Immediate Deduction**: Balance updated in real-time
- **Transaction Recording**: Every payment creates a transaction record
- **Date Management**: Automatic calculation of next payment dates
- **Cumulative Logic**: Multiple payments stack up chronologically

### Data Persistence
- Backend stores all user data in JSON files
- Each user identified by Polkadot address
- Automatic data initialization for new users
- Transaction history preserved indefinitely
- Membership status and payment dates saved

### User Experience
- Instant feedback on all actions
- Loading states during processing
- Error handling with clear messages
- Success notifications with details
- Disabled buttons when actions unavailable

## 🔧 Configuration

### Frontend Configuration

Edit `frontend/public/config.json`:

```json
{
  "WS_PROVIDER": "wss://westend-rpc.polkadot.io"
}
```

Change the WebSocket provider to connect to different Polkadot networks:
- Westend (Testnet): `wss://westend-rpc.polkadot.io`
- Polkadot (Mainnet): `wss://rpc.polkadot.io`
- Kusama: `wss://kusama-rpc.polkadot.io`

### Backend Configuration

The backend server runs on port 3001 by default. To change:

Edit `backend/server.js`:
```javascript
const PORT = 3001 // Change to your preferred port
```

## 🎨 Customization

### Theme Colors

Edit `frontend/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        // ... customize more colors
      }
    }
  }
}
```

### Add More Memberships

Memberships can be added through the API or directly in the `backend/data/users.json` file:

```json
{
  "id": "4",
  "title": "New Membership",
  "description": "Description of the membership",
  "amount": 49.99,
  "chargeDate": 10,
  "status": "active"
}
```

## 🧪 Testing

### Test Payment Flow

1. Connect wallet with test DOT tokens (use Westend testnet)
2. Deposit funds to platform
3. Make a payment for a membership
4. Verify balance deduction
5. Check transaction history
6. Verify next payment date updated
7. Make another payment to test cumulative logic

## 📝 API Documentation

See [Backend README](backend/README.md) for detailed API documentation.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include screenshots if applicable
4. Provide your browser and wallet extension details

## 🗺️ Roadmap

- [ ] Automated scheduled payments (smart contracts)
- [ ] Multi-token support (USDT, USDC, etc.)
- [ ] Email notifications for due payments
- [ ] Mobile app version
- [ ] Recurring payment templates
- [ ] Budget analysis and insights
- [ ] Export transactions to CSV

## 👏 Acknowledgments

- Built with [Polkadot.js](https://polkadot.js.org/)
- Icons by [Lucide](https://lucide.dev/)
- UI inspired by modern fintech applications

---

**Built with ❤️ for the Polkadot ecosystem**

*PayPulse - Never miss a payment again!*
