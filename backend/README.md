# PayPulse Backend Server

This is the backend server for PayPulse that handles user data storage in a local JSON file.

## Features

- User data storage (balance, memberships, transactions)
- Each user is identified by their Polkadot account address
- Deposit and withdrawal functionality
- Transaction history tracking
- Membership management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Get User Data
```
GET /api/users/:address
```
Returns user data including balance, memberships, and transactions.

### Deposit Funds
```
POST /api/users/:address/deposit
Body: {
  amount: number,
  txHash?: string
}
```
Deposits funds to user's balance and creates a transaction record.

### Withdraw Funds
```
POST /api/users/:address/withdraw
Body: {
  amount: number,
  recipient: string
}
```
Withdraws funds from user's balance and creates a transaction record.

### Add Membership
```
POST /api/users/:address/memberships
Body: {
  name: string,
  type: string,
  ...other fields
}
```
Adds a new membership to the user's account.

### Get Transactions
```
GET /api/users/:address/transactions
```
Returns all transactions for a user.

## Data Storage

User data is stored in `backend/data/users.json` with the following structure:

```json
{
  "USER_ADDRESS": {
    "address": "USER_ADDRESS",
    "balance": 0,
    "memberships": [],
    "transactions": []
  }
}
```

Each transaction has:
- `id`: Unique identifier
- `type`: "deposit" or "withdrawal"
- `amount`: Transaction amount
- `timestamp`: ISO timestamp
- `status`: Transaction status
- `txHash` (optional): Blockchain transaction hash
- `recipient` (optional): For withdrawals

## CORS

The server allows cross-origin requests from any origin for development purposes. In production, you should restrict this to your frontend domain.

