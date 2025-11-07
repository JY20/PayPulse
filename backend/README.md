# PayPulse Backend Server 🖥️

Express.js backend server for PayPulse that manages user data, balances, memberships, and payment transactions.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Start Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3001`

## 📦 Tech Stack

- **Express** - Web application framework
- **CORS** - Cross-origin resource sharing
- **Node.js File System** - JSON file-based storage
- **ES Modules** - Modern JavaScript module system

## 🗂️ Data Storage

The backend uses JSON file-based storage with two main data files:

### User Data (`data/users.json`)

User data is stored in `data/users.json` with the following structure:

```json
{
  "POLKADOT_ADDRESS": {
    "address": "POLKADOT_ADDRESS",
    "name": "User Name",
    "email": "user@example.com",
    "balance": 1000.00,
    "memberships": [
      {
        "id": "1",
        "title": "Premium Membership",
        "description": "Description of membership benefits",
        "amount": 29.99,
        "chargeDate": 15,
        "status": "active",
        "lastPaidDate": "2025-11-07T18:00:00.000Z",
        "nextPaymentDate": "2025-12-15T05:00:00.000Z"
      }
    ],
    "transactions": [
      {
        "id": "1699304400000",
        "type": "deposit",
        "amount": 100.00,
        "timestamp": "2025-11-07T12:00:00.000Z",
        "txHash": "0xabc123...",
        "status": "completed"
      },
      {
        "id": "1699308000000",
        "type": "membership_payment",
        "amount": 29.99,
        "membershipId": "1",
        "membershipTitle": "Premium Membership",
        "timestamp": "2025-11-07T13:00:00.000Z",
        "status": "completed"
      }
    ]
  }
}
```

### Admin Data (`data/admin.json`)

Admin configuration is stored in `data/admin.json`:

```json
{
  "name": "System Admin",
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "balance": 5000.00,
  "configured": true
}
```

**Fields:**
- `name` - Admin display name
- `address` - Admin's Polkadot wallet address
- `balance` - Total accumulated balance from all payments
- `configured` - Whether admin has been set up (must be `true` for payments to be credited)

## 📡 API Endpoints

### User Management

#### Get User Data
```http
GET /api/users/:address
```

**Response:**
```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "name": "John Doe",
  "email": "john@example.com",
  "balance": 1000.00,
  "memberships": [...],
  "transactions": [...]
}
```

**Notes:**
- If user doesn't exist, creates a new user with default values
- Automatically initializes with sample memberships for new users

#### Update User Profile
```http
PUT /api/users/:address/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...}
}
```

### Balance Operations

#### Deposit Funds
```http
POST /api/users/:address/deposit
```

**Request Body:**
```json
{
  "amount": 100.50,
  "txHash": "0xabc123..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "balance": 1100.50,
  "transaction": {
    "id": "1699304400000",
    "type": "deposit",
    "amount": 100.50,
    "timestamp": "2025-11-07T12:00:00.000Z",
    "txHash": "0xabc123...",
    "status": "completed"
  }
}
```

**Validation:**
- Amount must be greater than 0
- User must exist (or will be created)

#### Withdraw Funds
```http
POST /api/users/:address/withdraw
```

**Request Body:**
```json
{
  "amount": 50.00,
  "recipient": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

**Response:**
```json
{
  "success": true,
  "balance": 1050.50,
  "transaction": {
    "id": "1699308000000",
    "type": "withdrawal",
    "amount": 50.00,
    "recipient": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "timestamp": "2025-11-07T13:00:00.000Z",
    "status": "completed"
  }
}
```

**Validation:**
- Amount must be greater than 0
- User must have sufficient balance
- User must exist

### Membership Management

#### Get Memberships
```http
GET /api/users/:address/memberships
```

**Response:**
```json
[
  {
    "id": "1",
    "title": "Premium Membership",
    "description": "Description",
    "amount": 29.99,
    "chargeDate": 15,
    "status": "active",
    "lastPaidDate": "2025-11-07T18:00:00.000Z",
    "nextPaymentDate": "2025-12-15T05:00:00.000Z"
  }
]
```

#### Add Membership
```http
POST /api/users/:address/memberships
```

**Request Body:**
```json
{
  "title": "New Membership",
  "description": "Description of the membership",
  "amount": 49.99,
  "chargeDate": 10,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "membership": {
    "id": "1699304400000",
    "title": "New Membership",
    "description": "Description of the membership",
    "amount": 49.99,
    "chargeDate": 10,
    "status": "active"
  }
}
```

#### Pay Membership
```http
POST /api/users/:address/memberships/:membershipId/pay
```

**No Request Body Required**

**Response:**
```json
{
  "success": true,
  "balance": 970.01,
  "transaction": {
    "id": "1699308000000",
    "type": "membership_payment",
    "amount": 29.99,
    "membershipId": "1",
    "membershipTitle": "Premium Membership",
    "timestamp": "2025-11-07T13:00:00.000Z",
    "status": "completed"
  },
  "membership": {
    "id": "1",
    "title": "Premium Membership",
    "description": "Description",
    "amount": 29.99,
    "chargeDate": 15,
    "status": "active",
    "lastPaidDate": "2025-11-07T13:00:00.000Z",
    "nextPaymentDate": "2025-12-15T05:00:00.000Z"
  }
}
```

**Payment Logic:**
1. Validates user has sufficient balance
2. Deducts membership amount from balance
3. Creates a payment transaction record
4. Updates membership's `lastPaidDate` to current timestamp
5. Calculates `nextPaymentDate`:
   - If existing nextPaymentDate is in the future, adds 1 month to that date
   - Otherwise, adds 1 month from current date
   - This allows cumulative payments (pay multiple months in advance)

**Validation:**
- User must exist
- Membership must exist
- User must have sufficient balance
- Amount must match membership amount

**Error Responses:**
```json
{
  "error": "Insufficient balance",
  "required": 29.99,
  "available": 10.00
}
```

### Transaction Management

#### Get Transactions
```http
GET /api/users/:address/transactions
```

**Response:**
```json
[
  {
    "id": "1699308000000",
    "type": "membership_payment",
    "amount": 29.99,
    "membershipId": "1",
    "membershipTitle": "Premium Membership",
    "timestamp": "2025-11-07T13:00:00.000Z",
    "status": "completed"
  },
  {
    "id": "1699304400000",
    "type": "deposit",
    "amount": 100.00,
    "timestamp": "2025-11-07T12:00:00.000Z",
    "txHash": "0xabc123...",
    "status": "completed"
  }
]
```

**Transaction Types:**
- `deposit` - Funds added to platform
- `withdrawal` - Funds removed from platform
- `membership_payment` - Payment for a membership

### Calendar Events

#### Get Calendar Events
```http
GET /api/users/:address/calendar
```

**Response:**
```json
[
  {
    "id": "1-0",
    "title": "Premium Membership",
    "description": "Premium Membership - Monthly charge on day 15",
    "date": "2025-11-15T05:00:00.000Z",
    "amount": 29.99,
    "type": "membership",
    "membershipId": "1",
    "status": "active",
    "chargeDate": 15
  }
]
```

**Notes:**
- Generates events for the next 3 months
- Only includes future dates
- One event per membership per month
- Events are sorted by date

### Admin Management

#### Get Admin Configuration
```http
GET /api/admin/config
```

**Response:**
```json
{
  "name": "System Admin",
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "balance": 5000.00,
  "configured": true
}
```

#### Update Admin Configuration
```http
PUT /api/admin/config
```

**Request Body:**
```json
{
  "name": "Admin Name",
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "name": "Admin Name",
    "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "balance": 5000.00,
    "configured": true
  }
}
```

**Notes:**
- Admin must be configured before payments will be credited
- All membership payments (automatic and manual) are credited to the admin account
- Admin balance accumulates with each successful payment
- The admin address can be a Polkadot wallet address

#### Manual Payment Processing (Admin Only)
```http
POST /api/admin/process-payments
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processing completed"
}
```

**Notes:**
- Manually triggers the automatic payment processor
- Useful for testing or forcing immediate payment checks
- Processes all due payments across all users

#### Retry Failed Payment
```http
POST /api/users/:address/memberships/:membershipId/retry
```

**Response:**
```json
{
  "success": true,
  "balance": 950.50,
  "transaction": {...},
  "membership": {...}
}
```

**Validation:**
- Membership must be in `payment_failed` status
- User must have sufficient balance
- Credits admin account upon successful retry

## ⏰ Automatic Payment System

The backend includes an automatic payment scheduler that:

- **Checks every hour** for due membership payments
- **Automatically processes** payments when `nextPaymentDate` is reached
- **Credits admin account** for each successful payment
- **Handles failures** gracefully by marking memberships as `payment_failed`
- **Logs all activity** with detailed console output

### Payment Flow

1. **User makes manual payment** → Balance deducted → Admin credited → Next payment date set
2. **Scheduled check runs** → Due payments identified → Automatic processing
3. **Sufficient balance** → Payment succeeds → Admin credited → Membership renewed
4. **Insufficient balance** → Payment fails → Transaction logged → Membership marked as failed

### Transaction Types

```json
{
  "type": "membership_payment",
  "status": "completed",
  "automatic": true  // Indicates auto-payment
}
```

```json
{
  "type": "membership_payment", 
  "status": "failed",
  "automatic": true,
  "reason": "Insufficient balance"
}
```

### Admin Data Storage

Admin configuration is stored in `data/admin.json`:

```json
{
  "name": "System Admin",
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "balance": 5000.00,
  "configured": true
}
```

## 🔧 Configuration

### Port Configuration

Default port is 3001. To change, edit `server.js`:

```javascript
const PORT = 3001 // Change this value
```

### CORS Configuration

For production, restrict CORS to your frontend domain:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}))
```

### Data Directory

Data is stored in `backend/data/users.json`. The directory is created automatically if it doesn't exist.

## 🛡️ Security Considerations

### Current Implementation (Development)

- ✅ CORS enabled for all origins (for development)
- ✅ JSON request body parsing
- ✅ Input validation on amounts
- ✅ Balance verification before transactions
- ✅ Automatic data persistence

### Recommended for Production

- ⚠️ Restrict CORS to specific frontend domain(s)
- ⚠️ Add authentication/authorization middleware
- ⚠️ Implement rate limiting
- ⚠️ Add request validation middleware
- ⚠️ Use proper database (PostgreSQL, MongoDB)
- ⚠️ Implement proper error logging
- ⚠️ Add HTTPS/TLS encryption
- ⚠️ Implement request signing/verification
- ⚠️ Add input sanitization

## 💾 Data Management

### Backup

The `users.json` file should be backed up regularly:

```bash
# Manual backup
cp backend/data/users.json backend/data/users.backup.json

# Automated backup script (add to cron)
cp backend/data/users.json backend/data/users.$(date +%Y%m%d_%H%M%S).json
```

### Migration

To migrate to a proper database:

1. Read `users.json`
2. Parse JSON data
3. Insert into database with proper schema
4. Update API endpoints to use database queries
5. Test thoroughly before switching

### Reset Data

To reset all user data:

```bash
# Delete the data file
rm backend/data/users.json

# Server will create new file on next start
npm start
```

## 🔍 Logging

Console logs include:

- ✅ Server start confirmation
- 💰 Payment processing details (amount, dates)
- 📝 Profile updates
- ❌ Errors during operations

Example log output:

```
✅ PayPulse backend server running on http://localhost:3001
💰 Payment processed for Premium Membership
   Base date: 2025-11-07T13:00:00.000Z
   Next payment: 2025-12-15T05:00:00.000Z
📝 Updating profile for: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
✅ Profile updated successfully
```

## 🧪 Testing

### Manual Testing with cURL

**Get User:**
```bash
curl http://localhost:3001/api/users/YOUR_ADDRESS
```

**Deposit Funds:**
```bash
curl -X POST http://localhost:3001/api/users/YOUR_ADDRESS/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "txHash": "0xabc123"}'
```

**Pay Membership:**
```bash
curl -X POST http://localhost:3001/api/users/YOUR_ADDRESS/memberships/1/pay \
  -H "Content-Type: application/json"
```

### Testing with Postman

1. Import endpoints as a collection
2. Set base URL variable: `http://localhost:3001`
3. Create environment with test user address
4. Test all endpoints in sequence

## 🐛 Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (user/membership doesn't exist)
- `500` - Server Error (file system or processing error)

Error response format:

```json
{
  "error": "Error message description"
}
```

## 📊 Performance

### Current Limitations

- File-based storage (not suitable for high traffic)
- No caching mechanism
- Synchronous file I/O
- No connection pooling

### Scalability Recommendations

1. **Database**: Migrate to PostgreSQL or MongoDB
2. **Caching**: Implement Redis for frequent queries
3. **Load Balancing**: Use Nginx or similar
4. **Microservices**: Split into separate services
5. **Queue System**: Use message queue for async operations

## 🚀 Deployment

### Development

```bash
npm run dev
```

Uses `nodemon` for auto-reload on file changes.

### Production

```bash
npm start
```

Or with PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name paypulse-backend
pm2 save
pm2 startup
```

### Environment Variables

Create `.env` file:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
```

Update `server.js` to use environment variables:

```javascript
const PORT = process.env.PORT || 3001
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t paypulse-backend .
docker run -p 3001:3001 -v $(pwd)/data:/app/data paypulse-backend
```

## 📚 Future Enhancements

- [ ] Database integration (PostgreSQL)
- [ ] Authentication with JWT
- [ ] WebSocket support for real-time updates
- [ ] Automated payment scheduling
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Payment analytics and reporting
- [ ] Backup and restore functionality
- [ ] Admin dashboard API
- [ ] Webhook support for external integrations

---

**Backend API for PayPulse Payment Management System**
