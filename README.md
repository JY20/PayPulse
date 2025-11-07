# PayPulse 💳⚡

An automated payment platform that seamlessly manages recurring expenses such as memberships, subscriptions, and rent through intelligent scheduled deductions.

![PayPulse](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features ✨

- **Dashboard Overview** - View all your payment statistics and upcoming payments at a glance
- **Payment Management** - Add, edit, pause, and delete recurring payments
- **Smart Calendar** - Visual calendar showing all your scheduled payments
- **Multiple Frequencies** - Support for daily, weekly, monthly, and yearly payments
- **Auto-Deduction** - Automatic payment processing for enabled subscriptions
- **Payment History** - Track all your past transactions
- **Categories** - Organize payments by category (Entertainment, Housing, Health, etc.)
- **Modern UI** - Beautiful, responsive design with Tailwind CSS
- **Local Storage** - Data persists in your browser

## Tech Stack 🛠️

- **React 18** - Modern React with Hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **date-fns** - Modern date utility library

## Getting Started 🚀

### Prerequisites

- Node.js 16+ and npm/yarn installed

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build files will be generated in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage 📖

### Adding a Payment

1. Navigate to "Add Payment" in the navigation menu
2. Fill in the payment details:
   - Name (e.g., "Netflix Subscription")
   - Category (Entertainment, Housing, Health, etc.)
   - Amount
   - Frequency (Daily, Weekly, Monthly, Yearly)
   - Next Payment Date
   - Payment Method
3. Enable/disable automatic deduction
4. Click "Add Payment"

### Managing Payments

- **View All Payments**: Go to the Payments page to see all your recurring payments
- **Search & Filter**: Use the search bar and category/status filters
- **Edit**: Click the edit icon to modify payment details
- **Pause/Resume**: Click the pause/play icon to temporarily stop/resume payments
- **Delete**: Click the trash icon to remove a payment

### Calendar View

- View all payments for any month
- Click prev/next arrows to navigate between months
- See payments highlighted on their due dates
- View a summary of all payments for the selected month

### Settings

- Configure notification preferences
- Manage payment methods
- Export or clear your data
- Update profile information

## Project Structure 📁

```
PayPulse/
├── public/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── context/
│   │   └── PaymentContext.jsx  # Global state management
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard overview
│   │   ├── Payments.jsx        # All payments list
│   │   ├── AddPayment.jsx      # Add/Edit payment form
│   │   ├── Calendar.jsx        # Calendar view
│   │   └── Settings.jsx        # Settings page
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Features in Detail 🔍

### Dashboard
- **Stats Cards**: Monthly total, active payments, next payment, paid this month
- **Overdue Alerts**: Highlights any overdue payments
- **Upcoming Payments**: Next 5 upcoming payments
- **Recent Activity**: Last 5 transactions

### Payment Context
- Global state management using React Context API
- LocalStorage persistence for data
- CRUD operations for payments
- Payment history tracking
- Automatic next payment date calculation

### Responsive Design
- Mobile-first approach
- Works seamlessly on desktop, tablet, and mobile
- Bottom navigation on mobile devices
- Top navigation on larger screens

## Customization 🎨

### Colors
Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  primary: {
    // Customize these values
    500: '#0ea5e9',
    600: '#0284c7',
    // ...
  },
}
```

### Categories
Add more categories in `src/pages/AddPayment.jsx`:

```javascript
<option value="YourCategory">Your Category</option>
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is open source and available under the MIT License.

## Support 💬

If you have any questions or need help, please open an issue.

---

Built with ❤️ using React and Vite
