# Han Foods E-commerce Backend

A full-featured e-commerce backend built with Node.js, Express, and MongoDB, following MVC architecture and SOLID principles.

## Features

1. **Authentication System**
   - User registration and login
   - Google OAuth integration
   - Role-based authorization (admin/customer)
   - JWT token-based authentication

2. **Product Management**
   - CRUD operations for products
   - Search and filter capabilities
   - Category management

3. **Cart & Wishlist**
   - Add/remove items from cart
   - Update quantities
   - Transfer items between wishlist and cart
   - Stock validation

4. **Address Management**
   - Multiple shipping addresses per user
   - Set default address

5. **Payment Processing**
   - Cash on Delivery option
   - VietQR payment integration with QR code generation

6. **Order Management**
   - Create orders from cart items
   - Track order status (pending, processing, shipped, delivered, cancelled)
   - Order history

7. **Billing System**
   - Payment tracking
   - Transaction records
   - Reporting

8. **Discount System**
   - Create and manage discount codes
   - Support for percentage and fixed amount discounts
   - Validity period and minimum order amount

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm (v6+)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd web
```

2. Setup the project
```powershell
# On Windows with PowerShell
.\setup.ps1

# On Windows with Command Prompt
setup.bat

# On Linux/Mac
bash setup.sh
```

3. Configure environment variables
```
# Edit the .env file in the hfbe directory
# Make sure to update the following:
# - MONGO_URI
# - SESSION_SECRET
# - JWT_SECRET
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

4. Start the backend server
```
cd hfbe
npm run dev
```

5. Start the frontend (in a separate terminal)
```
cd hffe
npm start
```

## Project Structure

```
hfbe/
├── app.js                  # Main application file
├── package.json            # Project dependencies
├── controllers/            # Request handlers
├── middlewares/            # Authentication & utility middlewares
├── models/                 # Database models
├── routes/                 # API routes
├── services/               # Business logic
└── utils/                  # Helper functions
```

## API Routes

| Route | Description |
|-------|-------------|
| `/api/auth` | Authentication endpoints |
| `/api/products` | Product management |
| `/api/carts` | Cart operations |
| `/api/wishlists` | Wishlist operations |
| `/api/addresses` | Address management |
| `/api/orders` | Order processing |
| `/api/payments` | Payment processing |
| `/api/billings` | Billing records |
| `/api/discounts` | Discount code management |

## Authentication

The system supports two authentication methods:
1. Email/password authentication
2. Google OAuth

Protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling

For better error handling, use the included script to check for issues:
```
node verify-backend.js
```

## Troubleshooting

If you encounter issues:

1. **Missing dependencies**: Run `npm install` in both hfbe and hffe directories
2. **Google OAuth errors**: Check that you have valid Google OAuth credentials in the .env file
3. **MongoDB connection issues**: Verify your MongoDB connection string and ensure MongoDB is running

## License

This project is licensed under the MIT License.
