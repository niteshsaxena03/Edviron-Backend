# School Payment and Dashboard API

A microservice for a School Payment and Dashboard Application that manages Transactions and Payments.

## Project Overview

This REST API provides a comprehensive solution for managing school payments, including:

- Payment gateway integration with JWT-signed payloads
- Webhook integration for real-time payment status updates
- Transaction management and querying
- User authentication and authorization

## Tech Stack

- Node.js with Express.js
- MongoDB Atlas for database
- JWT for authentication
- RESTful API architecture

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas account
- npm or yarn
- Postman (for testing)

### Installation Steps

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Install dependencies:

   ```
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `src` directory with the following variables:

   ```
   PORT=8000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
   CORS_ORIGIN=*
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   PG_KEY=edvtest01
   PG_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2LCJpYXQiOjE3MTE2MjIyNzAsImV4cCI6MTc0MzE3OTg3MH0.Rye77Dp59GGxwCmwWekJHRj6edXWJnff9finjMhxKuw
   SCHOOL_ID=65b0e6293e9f76a9694d84b4
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Usage

### Authentication

#### Register a new user

```
POST /api/users/register
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login

```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "Login successful",
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "token": "JWT_TOKEN"
  },
  "statusCode": 200
}
```

### Payment Integration

#### Create Payment

```
POST /api/payment/create-payment
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "amount": 5000,
  "callback_url": "https://example.com/callback",
  "student_info": {
    "name": "Test Student",
    "id": "STD12345",
    "email": "student@example.com"
  }
}
```

Response:

```json
{
  "message": "Payment request created successfully",
  "success": true,
  "data": {
    "collect_request_id": "transaction_id",
    "collect_request_url": "payment_gateway_url"
  },
  "statusCode": 200
}
```

#### Payment Callback (Webhook)

```
POST /api/payment/payment-callback
Content-Type: application/json

{
  "status": 200,
  "order_info": {
    "order_id": "transaction_id",
    "order_amount": 5000,
    "transaction_amount": 5000,
    "gateway": "Edviron",
    "bank_reference": "REFXYZ123",
    "status": "SUCCESS",
    "payment_mode": "UPI",
    "payment_details": "UPI transaction",
    "Payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}
```

### Transaction Management

#### Get All Transactions

```
GET /api/transactions?page=1&limit=10&sort=payment_time&order=desc
Authorization: Bearer JWT_TOKEN
```

Query Parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Field to sort by (e.g., payment_time, status)
- `order`: Sort order (asc, desc)
- `status`: Filter by status (e.g., SUCCESS, PENDING, FAILED)
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)

Response:

```json
{
  "message": "Transactions fetched successfully",
  "success": true,
  "data": {
    "transactions": [
      {
        "collect_id": "transaction_id",
        "school_id": "school_id",
        "gateway": "Edviron",
        "order_amount": 5000,
        "transaction_amount": 5000,
        "status": "SUCCESS",
        "custom_order_id": "transaction_id",
        "payment_time": "2025-04-23T08:14:21.945+00:00",
        "payment_mode": "UPI",
        "payment_details": "UPI transaction",
        "student_info": {
          "name": "Test Student",
          "id": "STD12345",
          "email": "student@example.com"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  },
  "statusCode": 200
}
```

#### Get Transactions by School

```
GET /api/transactions/school/{schoolId}?page=1&limit=10&sort=payment_time&order=desc
Authorization: Bearer JWT_TOKEN
```

#### Check Transaction Status

```
GET /api/transactions/status/{custom_order_id}
Authorization: Bearer JWT_TOKEN
```

Response:

```json
{
  "message": "Transaction status fetched successfully",
  "success": true,
  "data": {
    "order_id": "transaction_id",
    "custom_order_id": "transaction_id",
    "status": "SUCCESS",
    "order_amount": 5000,
    "transaction_amount": 5000,
    "payment_mode": "UPI",
    "payment_details": "UPI transaction",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "gateway": "Edviron",
    "school_id": "school_id",
    "student_info": {
      "name": "Test Student",
      "id": "STD12345",
      "email": "student@example.com"
    }
  },
  "statusCode": 200
}
```

## Database Schema

### Order Schema

- `_id`: ObjectId
- `school_id`: String
- `trustee_id`: String
- `student_info`: Object
  - `name`: String
  - `id`: String
  - `email`: String
- `gateway_name`: String

### Order Status Schema

- `collect_id`: ObjectId (Reference to Order schema)
- `order_amount`: Number
- `transaction_amount`: Number
- `payment_mode`: String
- `payment_details`: String
- `bank_reference`: String
- `payment_message`: String
- `status`: String
- `error_message`: String
- `payment_time`: Date

### User Schema

- `name`: String
- `email`: String
- `password`: String (hashed)
- `role`: String

### Webhook Logs Schema

- `collect_id`: ObjectId (Reference to Order schema)
- `payload`: Object (Raw webhook payload)
- `created_at`: Date
- `status`: String
- `error`: String

## Testing with Postman

1. Register a new user or login to get a JWT token
2. Include the token in the Authorization header for all API requests
3. Use the transaction endpoints to fetch data
4. Test the payment flow:
   - Create a payment
   - Use the payment gateway URL to simulate payment
   - Test the webhook endpoint to simulate a callback
   - Verify the transaction status

## Performance and Security

- All endpoints are secured with JWT authentication
- Role-based access control for sensitive operations
- Pagination for list endpoints to handle large datasets
- Sorting and filtering capabilities for efficient data retrieval
- MongoDB indexes on frequently queried fields (school_id, custom_order_id, collect_id)
- Proper error handling and validation for all API requests
- CORS configured for secure cross-origin requests
- Environment variables for sensitive configuration

## Deployment

The project can be deployed on:

- Heroku
- AWS
- Google Cloud
- Any Node.js compatible hosting service

## Future Enhancements

- Additional filtering options for transactions
- Advanced analytics and reporting
- Batch processing for bulk payments
- Email notifications for payment status
- API rate limiting for security
