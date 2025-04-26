# School Payment Portal - Backend

The backend API for the School Payment Portal application, built with Node.js, Express, and MongoDB.

## Features

- **JWT Authentication**: Secure user registration and login
- **Transaction Management**: CRUD operations for transactions
- **Payment Gateway Integration**: Integration with payment processing API
- **School-specific Transaction Views**: Filter transactions by school
- **Transaction Status Checking**: Verify status of any transaction
- **Webhook Integration**: Process payment callback notifications

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── payment.controller.js
│   │   ├── transaction.controller.js
│   │   └── user.controller.js
│   ├── middlewares/       # Custom middleware
│   │   └── auth.middleware.js
│   ├── models/            # Mongoose schemas
│   │   ├── order.model.js
│   │   ├── orderStatus.model.js
│   │   └── user.model.js
│   ├── routes/            # API routes
│   │   ├── payment.routes.js
│   │   ├── transaction.routes.js
│   │   └── user.routes.js
│   ├── services/          # Business logic
│   │   └── payment.service.js
│   ├── utils/             # Utility functions
│   │   ├── ApiError.utils.js
│   │   ├── ApiResponse.utils.js
│   │   └── AsyncHandler.utils.js
│   ├── app.js             # Express app setup
│   └── index.js           # Server entry point
└── package.json           # Dependencies
```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user

  - Request: `{ name, email, password }`
  - Response: `{ success, message, data: { user, token } }`

- `POST /api/users/login` - Login and get JWT token
  - Request: `{ email, password }`
  - Response: `{ success, message, data: { user, token } }`

### Transactions

- `GET /api/transactions` - Get all transactions

  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Results per page (default: 10)
    - `sort`: Field to sort by (default: createdAt)
    - `order`: Sort order (asc/desc, default: desc)
    - `status`: Filter by status
    - `startDate`: Filter by start date
    - `endDate`: Filter by end date
  - Response: `{ success, message, data: { transactions, pagination } }`

- `GET /api/transactions/school/:schoolId` - Get transactions for a specific school

  - Query Parameters: Same as /transactions
  - Response: `{ success, message, data: { transactions, pagination } }`

- `GET /api/transaction-status/:custom_order_id` - Check status of a transaction
  - Response: `{ success, message, data: { order_id, status, ... } }`

### Payment Gateway

- `POST /api/payment/create-payment` - Create a new payment request
  - Request: `{ schoolId, studentInfo, amount, ... }`
  - Response: `{ success, message, data: { redirectUrl, orderId, ... } }`

### Webhook

- `POST /api/webhook` - Receive payment status updates
  - Request: `{ status, order_info: { ... } }`
  - Response: `{ success, message }`

## Database Models

### Order Schema

```javascript
{
  school_id: ObjectId,
  trustee_id: ObjectId,
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String
}
```

### Order Status Schema

```javascript
{
  collect_id: ObjectId,      // Reference to Order schema
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String,
  error_message: String,
  payment_time: Date
}
```

### User Schema

```javascript
{
  name: String,
  email: String,
  password: String,
  role: String
}
```

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- MongoDB Atlas account

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with:

```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRES_IN=90d
PG_KEY=edvtest01
API_KEY=your_payment_api_key
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

### Production

Start the server in production mode:

```bash
npm start
```

## Error Handling

The API uses a consistent error handling approach:

- `ApiError` class for generating error responses
- `ApiResponse` class for generating success responses
- `AsyncHandler` utility for handling async route handler errors

## Authentication Flow

1. User registers or logs in to receive a JWT token
2. Token is included in the Authorization header of subsequent requests
3. Auth middleware validates the token and attaches user info to the request
4. Protected routes check for valid authentication before processing

## Payment Integration Flow

1. Frontend submits payment details to `/api/payment/create-payment`
2. Backend forwards the request to the payment gateway with required JWT-signed payloads
3. Payment gateway responds with a redirect URL for the user
4. After payment completion, the payment gateway sends a webhook notification
5. Backend processes the webhook and updates the transaction status
