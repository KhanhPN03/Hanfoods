# 🍜 Han Foods E-commerce Platform

<div align="center">

![Han Foods](https://img.shields.io/badge/Han%20Foods-E--commerce%20Platform-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)

**A complete, modern e-commerce solution with comprehensive admin dashboard**

*Built with passion by Phạm Nam Khánh*

[🚀 Features](#-features) • [📦 Installation](#-installation) • [🎯 Usage](#-usage) • [🛠️ API](#-api-documentation) • [📞 Contact](#-contact)

</div>

---

## 🌟 Overview

Han Foods is a full-stack e-commerce platform designed specifically for food businesses. It combines a powerful Node.js backend with a modern React frontend, featuring a comprehensive admin dashboard for complete business management.

### 🏗️ Architecture
- **Backend**: Node.js + Express.js + MongoDB (MVC Pattern)
- **Frontend**: React.js + Material-UI + Chart.js
- **Authentication**: JWT + Google OAuth2
- **Payment**: VietQR Integration + Cash on Delivery
- **Admin Panel**: Complete dashboard with analytics

---

## ✨ Features

### 🔐 **Authentication & Security**
- 📧 Email/Password authentication
- 🔍 Google OAuth2 integration
- 👥 Role-based access control (Admin/Customer)
- 🛡️ JWT token-based security
- 🚦 Rate limiting and security headers

### 🛍️ **E-commerce Core**
- 📱 **Product Management**: Full CRUD operations, categories, search & filtering
- 🛒 **Shopping Cart**: Real-time cart management with stock validation
- ❤️ **Wishlist**: Save favorite items for later
- 📍 **Address Management**: Multiple shipping addresses support
- 🎫 **Discount System**: Flexible coupon codes with various conditions

### 💳 **Payment & Orders**
- 💰 **Payment Methods**: VietQR (QR code), Cash on Delivery
- 📋 **Order Management**: Complete order lifecycle tracking
- 📊 **Order Status**: Pending → Processing → Shipped → Delivered
- 🧾 **Billing System**: Comprehensive transaction records

### 👨‍💼 **Admin Dashboard**
- 📈 **Analytics Dashboard**: Revenue tracking, sales analytics
- 🏪 **Product Management**: Inventory control, category management
- 👤 **User Management**: Customer accounts and permissions
- 📦 **Order Processing**: Order status updates and tracking
- 🎯 **Discount Management**: Create and manage promotional campaigns
- ⚙️ **Settings**: System configuration and preferences

### 📱 **User Experience**
- 🎨 **Modern UI**: Responsive design with Material-UI
- 📊 **Data Visualization**: Interactive charts and graphs
- 🔍 **Advanced Search**: Smart product discovery
- 📱 **Mobile Responsive**: Optimized for all devices

---

## 📦 Installation

### 🔧 Prerequisites
- **Node.js** (v14+ recommended)
- **MongoDB** (v4.4+ recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### 🚀 Quick Start

#### 1️⃣ Clone the Repository
```bash
git clone <repository-url>
cd web
```

#### 2️⃣ Automated Setup (Recommended)
Choose your platform and run the setup script:

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Windows (Command Prompt):**
```cmd
setup.bat
```

**Linux/Mac:**
```bash
bash setup.sh
```

#### 3️⃣ Manual Setup (Alternative)
If automated setup doesn't work:

**Backend Setup:**
```bash
cd hfbe
npm install
cp .env.example .env
# Edit .env with your configuration
```

**Frontend Setup:**
```bash
cd hffe
npm install
```

#### 4️⃣ Environment Configuration
Edit the `.env` file in the `hfbe` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/hanfoods

# Authentication
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payment (VietQR)
VIETQR_API_KEY=your-vietqr-api-key

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 5️⃣ Start the Application

**Backend Server (Port 5000):**
```bash
cd hfbe
npm run dev
```

**Frontend Server (Port 3000):**
```bash
cd hffe
npm start
```

#### 6️⃣ Seed Database (Optional)
```bash
cd hfbe
npm run seed
```

### 🌐 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin

---

## 🎯 Usage

### 👤 User Features
1. **Registration**: Create account or use Google OAuth
2. **Shopping**: Browse products, add to cart/wishlist
3. **Checkout**: Select address, choose payment method
4. **Orders**: Track order status and history

### 👨‍💼 Admin Features
1. **Dashboard**: View analytics and system overview
2. **Products**: Manage inventory and categories
3. **Orders**: Process and track customer orders
4. **Users**: Manage customer accounts
5. **Discounts**: Create promotional campaigns
6. **Settings**: Configure system preferences

---

## 📁 Project Structure

```
📦 Han Foods E-commerce
├── 🗂️ hfbe/                     # Backend (Node.js/Express)
│   ├── 📄 app.js                # Main application entry
│   ├── 🎛️ controllers/         # Request handlers
│   ├── 🛡️ middlewares/         # Authentication & utilities
│   ├── 📊 models/              # Database schemas
│   ├── 🛣️ routes/              # API endpoints
│   ├── ⚙️ services/            # Business logic
│   ├── 🔧 utils/               # Helper functions
│   ├── 🌱 seeds/               # Database seeders
│   └── 📋 scripts/             # Utility scripts
├── 🗂️ hffe/                     # Frontend (React.js)
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/                 # Source code
│   │   ├── 🎨 components/      # Reusable components
│   │   ├── 📄 pages/           # Page components
│   │   │   ├── 👨‍💼 admin/        # Admin dashboard
│   │   │   └── 👤 user/         # User interface
│   │   ├── 🔧 services/        # API services
│   │   ├── 🎯 context/         # React contexts
│   │   └── 💫 utils/           # Utility functions
├── 📚 docs/                    # Documentation
└── 📋 README.md               # This file
```

---

## 🛠️ API Documentation

### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/google` | Google OAuth login |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/profile` | Get user profile |

### 🛍️ Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get product by ID |
| `POST` | `/api/products` | Create product (Admin) |
| `PUT` | `/api/products/:id` | Update product (Admin) |
| `DELETE` | `/api/products/:id` | Delete product (Admin) |

### 🛒 Cart & Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/carts` | Get user cart |
| `POST` | `/api/carts/add` | Add item to cart |
| `PUT` | `/api/carts/update` | Update cart item |
| `DELETE` | `/api/carts/remove` | Remove from cart |
| `GET` | `/api/wishlists` | Get user wishlist |
| `POST` | `/api/wishlists/add` | Add to wishlist |

### 📦 Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | Get user orders |
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders/:id` | Get order details |
| `PUT` | `/api/orders/:id/status` | Update order status |

### 🎫 Discount System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/discounts` | Get available discounts |
| `POST` | `/api/discounts/validate` | Validate discount code |
| `POST` | `/api/discounts` | Create discount (Admin) |
| `PUT` | `/api/discounts/:id` | Update discount (Admin) |

### 🔒 Authentication
Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Testing & Validation

### Backend Verification
```bash
cd hfbe
node verify-backend.js
```

### Frontend Build Test
```bash
cd hffe
npm run build
```

### Admin System Validation
```bash
bash admin-final-validation.sh
```

---

## 🚀 Deployment

### 🌐 Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export MONGO_URI=your-production-mongodb-uri
```

2. **Build Frontend**
```bash
cd hffe
npm run build
```

3. **Start Production Server**
```bash
cd hfbe
npm start
```

### 📊 Performance Monitoring
- Monitor MongoDB performance
- Use PM2 for process management
- Implement logging and error tracking
- Set up SSL certificates for HTTPS

---

## 🛠️ Technologies Used

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js + JWT
- **Payment**: VietQR API
- **Security**: Helmet, CORS, Rate Limiting

### Frontend Stack
- **Framework**: React.js 18
- **UI Library**: Material-UI (MUI)
- **Charts**: Chart.js + Recharts
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios

### Development Tools
- **Package Manager**: npm
- **Development Server**: Nodemon
- **Code Quality**: ESLint
- **Version Control**: Git

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

### 📋 Code Style Guidelines
- Use meaningful variable names
- Add comments for complex logic
- Follow React and Node.js best practices
- Test your changes before submitting

---

## 📞 Contact

### 👨‍💻 Creator & Lead Developer

**Phạm Nam Khánh**
- 📧 Email: [khanhpn31@gmail.com](mailto:khanhpn31@gmail.com)
- 💼 LinkedIn: Connect for professional inquiries
- 🐙 GitHub: Check out other projects

*Feel free to reach out for any questions, suggestions, or collaboration opportunities!*

---

## 🙏 Acknowledgments

- Thanks to all the open-source libraries that made this project possible
- Special appreciation to the React and Node.js communities
- Inspired by modern e-commerce platforms and best practices

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by Phạm Nam Khánh

</div>
