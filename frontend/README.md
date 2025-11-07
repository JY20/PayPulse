# PayPulse Frontend 🎨

The frontend application for PayPulse - a modern React-based interface for managing recurring payments on the Polkadot network.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Polkadot wallet browser extension (Polkadot{.js}, Talisman, SubWallet, etc.)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Tech Stack

### Core
- **React 18.2** - UI library with Hooks
- **Vite 5** - Build tool and dev server
- **React Router DOM 6** - Client-side routing

### Styling
- **Tailwind CSS 3** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Polkadot Integration
- **@polkadot/api** - Polkadot API for blockchain interaction
- **@polkadot/extension-dapp** - Browser wallet integration
- **@polkadot/util** - Utility functions
- **@polkadot/util-crypto** - Cryptographic utilities
- **polkadot-api** - Modern Polkadot API
- **@polkadot-api/pjs-signer** - Transaction signing

### Utilities
- **date-fns** - Date manipulation and formatting
- **lucide-react** - Icon library

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Layout.jsx              # Main app layout with navigation
│   └── WalletButton.jsx        # Wallet connection button component
│
├── context/
│   ├── PaymentContext.jsx      # Local payment state (legacy, can be removed)
│   ├── PolkadotContext.jsx     # Wallet connection & blockchain state
│   └── UserDataContext.jsx     # User data, backend API calls, payment logic
│
├── pages/
│   ├── Dashboard.jsx           # Main dashboard with stats and overview
│   ├── Payments.jsx            # Memberships list with pay functionality
│   ├── AddPayment.jsx          # Add/edit payment form (legacy)
│   ├── DepositFunds.jsx        # Deposit DOT to platform balance
│   ├── Calendar.jsx            # Calendar view of payment schedules
│   └── Settings.jsx            # User settings and transaction history
│
├── App.jsx                     # Root component with routing
├── main.jsx                    # Application entry point
├── index.css                   # Global styles and Tailwind directives
└── config.js                   # Configuration loader
```

## 🎯 Key Features

### 1. Wallet Integration
- Connect to any Polkadot-compatible wallet
- Display wallet address and balance
- Real-time balance updates
- Multiple account support

**Components:**
- `WalletButton.jsx` - Connection UI
- `PolkadotContext.jsx` - State management

### 2. Balance Management
- View wallet balance and platform balance
- Deposit DOT from wallet to platform
- Transfer functionality with transaction signing
- Balance validation before payments

**Pages:**
- `DepositFunds.jsx` - Deposit interface
- `Dashboard.jsx` - Balance overview

### 3. Membership Payments
- View all active memberships
- Pay memberships directly from platform balance
- Cumulative payment support (pay multiple months in advance)
- Real-time payment processing with notifications
- Track last payment and next due date

**Pages:**
- `Payments.jsx` - Main payment interface
- `Dashboard.jsx` - Quick overview

**Context:**
- `UserDataContext.jsx` - Payment API calls

### 4. Transaction History
- Complete transaction log
- Deposit, withdrawal, and payment records
- Transaction details with timestamps
- Filter by transaction type

**Pages:**
- `Settings.jsx` - Full transaction history
- `Dashboard.jsx` - Recent transactions

### 5. Calendar View
- Visual representation of payment schedules
- Monthly view with navigation
- Membership renewal dates
- Amount due per day

**Pages:**
- `Calendar.jsx` - Calendar interface

## 🔌 Context Providers

### PolkadotContext

Manages wallet connection and blockchain interaction.

```jsx
const {
  isConnected,
  accounts,
  selectedAccount,
  balance,
  connectWallet,
  disconnectWallet,
  selectAccount,
  formatBalanceDisplay
} = usePolkadot()
```

**Key Functions:**
- `connectWallet()` - Connect to Polkadot wallet
- `disconnectWallet()` - Disconnect wallet
- `selectAccount(address)` - Switch active account
- `formatBalanceDisplay(balance)` - Format balance for display

### UserDataContext

Manages user data and backend API interactions.

```jsx
const {
  userData,
  isLoading,
  error,
  depositFunds,
  withdrawFunds,
  payMembership,
  addMembership,
  fetchMemberships,
  fetchTransactions,
  fetchCalendarEvents,
  updateProfile,
  refreshUserData
} = useUserData()
```

**Key Functions:**
- `depositFunds(amount, txHash)` - Add funds to platform balance
- `withdrawFunds(amount, recipient)` - Withdraw funds
- `payMembership(membershipId)` - Pay for a membership
- `fetchMemberships()` - Refresh membership list
- `updateProfile(name, email)` - Update user profile

**User Data Structure:**
```javascript
{
  address: string,
  name: string,
  email: string,
  balance: number,
  memberships: [
    {
      id: string,
      title: string,
      description: string,
      amount: number,
      chargeDate: number (1-31),
      status: 'active' | 'paused' | 'cancelled',
      lastPaidDate?: ISO string,
      nextPaymentDate?: ISO string
    }
  ],
  transactions: [
    {
      id: string,
      type: 'deposit' | 'withdrawal' | 'membership_payment',
      amount: number,
      timestamp: ISO string,
      status: string,
      txHash?: string,
      membershipId?: string,
      membershipTitle?: string
    }
  ]
}
```

## ⚙️ Configuration

### Network Configuration

Edit `public/config.json`:

```json
{
  "WS_PROVIDER": "wss://westend-rpc.polkadot.io"
}
```

**Available Networks:**
- Westend (Testnet): `wss://westend-rpc.polkadot.io`
- Polkadot (Mainnet): `wss://rpc.polkadot.io`
- Kusama: `wss://kusama-rpc.polkadot.io`

### API Configuration

Backend API URL is configured in `UserDataContext.jsx`:

```javascript
const API_BASE_URL = 'http://localhost:3001/api'
```

Change this to your backend URL in production.

### Tailwind Configuration

Customize theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        // Add custom colors
      }
    }
  }
}
```

## 🎨 Styling

### Color Scheme

The app uses a gradient-based color scheme defined in `tailwind.config.js`:

- **Primary**: Blue (`#0ea5e9`) - Main brand color
- **Secondary**: Purple (`#8b5cf6`) - Accent color
- **Accent**: Cyan (`#06b6d4`) - Highlight color
- **Success**: Green - Positive actions
- **Warning**: Orange - Alerts
- **Error**: Red - Errors and critical actions

### Custom CSS

Global styles are defined in `index.css`:

- `.card` - Card container style
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.input-field` - Form input style

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)

Navigation adapts:
- Mobile: Bottom tab bar
- Desktop: Top navigation bar

## 🔐 Security Considerations

1. **Wallet Connection**: Uses official Polkadot extension APIs
2. **Transaction Signing**: All transactions signed in user's wallet
3. **Private Keys**: Never stored or accessed by the app
4. **API Calls**: Backend validates all operations
5. **Balance Checks**: Frontend and backend validate sufficient funds

## 🧪 Development Tips

### Hot Module Replacement

Vite provides HMR out of the box. Changes to React components will update instantly without full page reload.

### Debugging

Use React Developer Tools to inspect:
- Component state
- Context values
- Re-render patterns

### Testing Wallet Connection

1. Use Westend testnet for development
2. Get free testnet tokens from the faucet
3. Test all wallet operations before mainnet deployment

### Code Quality

```bash
# Run linter
npm run lint
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Create `.env.production`:

```env
VITE_API_URL=https://your-backend-api.com
VITE_WS_PROVIDER=wss://rpc.polkadot.io
```

### Deployment Platforms

The app can be deployed to:

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Build and deploy `dist/` folder
- **Custom Server**: Serve `dist/` folder with any static server

### Important: CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// Backend server.js
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}))
```

## 📊 Performance

### Bundle Size

The production build is optimized with:
- Code splitting by route
- Tree shaking unused code
- Minification and compression
- Lazy loading of heavy components

### Optimization Tips

1. **Images**: Use WebP format, compress before upload
2. **Icons**: Lucide icons are tree-shakeable
3. **Fonts**: Load fonts locally instead of from CDN
4. **API Calls**: Implement caching strategy

## 🐛 Common Issues

### Wallet Not Connecting

1. Ensure Polkadot extension is installed
2. Check that extension is unlocked
3. Verify you've approved the connection request
4. Try refreshing the page

### Balance Not Updating

1. Wait a few seconds for blockchain confirmation
2. Click refresh button or reload page
3. Check network connection
4. Verify correct network is selected

### Transaction Failed

1. Check sufficient balance for transaction + fees
2. Verify wallet has enough DOT for gas
3. Check network status (Polkadot status page)
4. Try again after a few moments

## 📚 Further Reading

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Happy Coding! 🚀**
