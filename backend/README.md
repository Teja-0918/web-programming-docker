# MERNexus Backend

This backend powers the MERNexus admin dashboard with a REST API for managing users, products, and orders. It is built with Express and Mongoose and connects to MongoDB through environment-based configuration.

See the [main project documentation](../README.md) for the full-stack overview.

## Overview

The backend follows a simple layered structure:

- Express app entrypoint in [server.js](server.js)
- Application wiring in [src/app.js](src/app.js)
- MongoDB connection logic in [src/config/db.js](src/config/db.js)
- Route handlers in [src/routes](src/routes)
- Controllers in [src/controllers](src/controllers)
- Mongoose models in [src/model](src/model)

The API exposes REST endpoints under the root paths /users, /products, and /orders.

## Backend Tech Stack

- Node.js
- Express.js
- Mongoose
- CORS
- dotenv
- nodemon (development)

## Backend Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── orders.controller.js
│   │   ├── products.controller.js
│   │   └── user.controller.js
│   ├── model/
│   │   ├── orders.model.js
│   │   ├── products.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── user.routes.js
│   └── app.js
├── server.js
└── package.json
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create a .env file in the backend directory with the following variables:

```env
PORT=4000
MONGODB_URL=your_mongodb_atlas_connection_string
```

## MongoDB Atlas Setup

1. Create or select a MongoDB Atlas cluster.
2. Create a database user with a strong password.
3. Configure network access so your local machine can connect.
4. Copy the connection string from Atlas and place it in the MONGODB_URL value.
5. Restart the backend after updating the environment file.

> Never commit the .env file. If your password contains special characters, URL-encode them in the connection string.

## Database Models

### User Model

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | String | Yes | Trimmed |
| email | String | Yes | Unique, lowercase, trimmed |
| age | Number | No | Minimum value 1 |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### Product Model

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | String | Yes | Trimmed |
| description | String | Yes | Trimmed |
| price | Number | Yes | Minimum value 0 |
| category | String | Yes | Trimmed |
| stock | Number | Yes | Minimum value 0, default 0 |
| isavail | Boolean | Yes | Availability flag |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### Order Model

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| user | ObjectId | Yes | References the User model |
| products | Array | Yes | Contains ordered product entries |
| products[].product | ObjectId | Yes | References the Product model |
| products[].quantity | Number | Yes | Minimum 1, default 1 |
| products[].price | Number | Yes | Minimum 0 |
| totalAmount | Number | Yes | Minimum 0 |
| status | String | No | Enum: pending, confirmed, shipped, delivered, cancelled |
| shippingAddress.address | String | Yes | Trimmed |
| shippingAddress.city | String | Yes | Trimmed |
| shippingAddress.state | String | Yes | Trimmed |
| shippingAddress.pincode | String | Yes | Trimmed |
| paymentMethod | String | Yes | Enum: COD, UPI, Card |
| paymentStatus | String | No | Enum: pending, paid, failed |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

## Model Relationships

The orders collection links to users and products through MongoDB ObjectId references. The order controller uses Mongoose populate on the user field and the products.product field so the API can return richer order payloads.

## API Endpoints

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /users | Create a user |
| GET | /users | Get all users |
| GET | /users/:id | Get a user by ID |
| PUT | /users/:id | Update a user |
| DELETE | /users/:id | Delete a user |

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /products | Create a product |
| GET | /products | Get all products |
| GET | /products/:id | Get a product by ID |
| PUT | /products/:id | Update a product |
| DELETE | /products/:id | Delete a product |

### Orders

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /orders | Create an order |
| GET | /orders | Get all orders |
| GET | /orders/:id | Get an order by ID |
| PUT | /orders/:id | Update an order |
| DELETE | /orders/:id | Delete an order |

## Request Examples

### Create User

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 28
}
```

### Create Product

```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling Bluetooth headphones",
  "price": 499,
  "category": "Electronics",
  "stock": 20,
  "isavail": true
}
```

### Create Order

```json
{
  "user": "64f1c5d2e4b0a1b2c3d4e5f6",
  "products": [
    {
      "product": "64f1c5d2e4b0a1b2c3d4e5f7",
      "quantity": 2,
      "price": 499
    }
  ],
  "totalAmount": 998,
  "status": "pending",
  "shippingAddress": {
    "address": "123 Main Street",
    "city": "Vijayawada",
    "state": "Andhra Pradesh",
    "pincode": "520010"
  },
  "paymentMethod": "COD",
  "paymentStatus": "pending"
}
```

## Response Examples

Successful create or update calls return a JSON payload shaped like this:

```json
{
  "success": true,
  "data": {
    "_id": "64f1c5d2e4b0a1b2c3d4e5f6",
    "name": "Jane Doe"
  }
}
```

List endpoints return a similar structure with a count field:

```json
{
  "success": true,
  "count": 3,
  "data": []
}
```

## Order Population

The order list and detail routes populate the related user and product documents so each order includes the resolved customer and product information.

## Validation and Error Handling

The backend relies on Mongoose validation and the controller error handling. Common validation rules include:

- required strings for user and product core fields
- minimum numeric values for price, stock, quantity, and total amount
- enum values for order status, payment method, and payment status
- duplicate email handling through the unique constraint on the user email field

Error responses return a JSON message field when validation or lookup fails.

## Running Backend

```bash
npm run dev
```

The server starts on port 4000 by default, or the value provided in the PORT environment variable.

## API Testing

You can test the API manually with tools such as Postman or curl. The frontend already consumes the same REST endpoints when you run the full application.

## Security Notes

- Keep the .env file local and uncommitted.
- Never expose the MongoDB connection string in public repositories.
- The current implementation does not include authentication or role-based authorization.
