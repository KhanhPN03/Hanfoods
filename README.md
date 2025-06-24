# 🥥 HanFoods - Coconut Products E-commerce Platform

<div align="center">

![HanFoods](https://img.shields.io/badge/HanFoods-Coconut%20Products%20Platform-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)

**Specialized online marketplace for premium Vietnamese coconut products**

*Connecting coconut farmers with health-conscious consumers worldwide*

[🚀 Features](#-features) • [📦 Installation](#-installation) • [🎯 Usage](#-usage) • [🛠️ API](#-api-documentation) • [📞 Contact](#-contact)

</div>

---

## 🌟 Overview

HanFoods is a specialized e-commerce platform dedicated to coconut-based products, with a primary focus on fresh and dried coconut hearts (củ hủ dừa). The platform connects Vietnamese coconut farmers and processors directly with consumers seeking authentic, premium natural coconut products. Built with modern web technologies, it features comprehensive farmer portal, cold-chain logistics, and complete business management capabilities.

### 🏗️ Architecture
- **Backend**: Node.js + Express.js + MongoDB (MVC Pattern)
- **Frontend**: React.js + Material-UI + Chart.js
- **Authentication**: JWT + Google OAuth2
- **Payment**: VietQR Integration + Cash on Delivery
- **Cold-Chain**: Temperature monitoring and logistics tracking
- **Farmer Portal**: Dedicated interface for coconut farmers and processors
- **Admin Panel**: Complete dashboard with agricultural analytics

---

## ✨ Features

### 🥥 **Coconut Product Specialization**
- 🌱 **Fresh Coconut Hearts (Củ Hủ Dừa)**: Premium fresh coconut hearts with cold-chain delivery
- 🍯 **Dried Coconut Products**: Dehydrated coconut hearts and processed coconut items
- 🏷️ **Product Traceability**: Track products from farm to table
- �‍🌾 **Farmer Profiles**: Connect directly with coconut farmers and processors
- 🌡️ **Cold-Chain Management**: Temperature-controlled storage and delivery tracking

### �🔐 **Authentication & Security**
- 📧 Email/Password authentication
- 🔍 Google OAuth2 integration
- 👥 Role-based access control (Admin/Customer/Farmer)
- 🛡️ JWT token-based security
- 🚦 Rate limiting and security headers

### 🛍️ **E-commerce Core**
- 📱 **Product Management**: Coconut product catalog with freshness indicators
- 🛒 **Shopping Cart**: Real-time cart with freshness validation
- ❤️ **Wishlist**: Save favorite coconut products
- 📍 **Address Management**: Multiple shipping addresses with cold-chain preferences
- 🎫 **Discount System**: Seasonal coconut product promotions and farmer incentives

### 💳 **Payment & Orders**
- 💰 **Payment Methods**: VietQR (QR code), Cash on Delivery
- 📋 **Order Management**: Complete order lifecycle with cold-chain tracking
- 📊 **Order Status**: Harvest → Processing → Cold Storage → Shipped → Delivered
- 🧾 **Billing System**: Transparent pricing with farmer revenue sharing
- 🚚 **Cold-Chain Delivery**: Temperature-controlled logistics for fresh products

### 👨‍💼 **Admin Dashboard**
- 📈 **Agricultural Analytics**: Harvest tracking, seasonal trends, farmer performance
- 🏪 **Product Management**: Inventory control with freshness monitoring
- 👤 **User Management**: Customer and farmer account management
- 📦 **Order Processing**: Order fulfillment with cold-chain coordination
- 🎯 **Farmer Incentives**: Create and manage farmer reward programs
- 🌡️ **Cold-Chain Monitoring**: Real-time temperature and logistics tracking

### 👨‍🌾 **Farmer Portal**
- � **Product Listing**: Easy coconut product catalog management
- 📊 **Sales Analytics**: Track revenue and customer feedback
- 🚚 **Logistics Coordination**: Coordinate cold-chain pickup schedules
- 💰 **Revenue Tracking**: Transparent earnings and payment schedules
- 📱 **Mobile-Friendly**: Optimized for farmers using mobile devices

### 📱 **User Experience**
- 🎨 **Modern UI**: Responsive design with coconut-themed Material-UI
- 📊 **Agricultural Data**: Interactive charts for harvest and delivery tracking
- 🔍 **Smart Search**: Find coconut products by origin, freshness, and farmer
- 📱 **Mobile Responsive**: Optimized for all devices including farmers' smartphones
- 🌡️ **Freshness Indicators**: Real-time product quality and temperature data

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
MONGO_URI=mongodb://localhost:27017/hanfoods-coconut

# Authentication
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payment (VietQR)
VIETQR_API_KEY=your-vietqr-api-key

# Cold-Chain & Logistics
COLD_CHAIN_API_KEY=your-cold-chain-monitoring-api-key
TEMPERATURE_ALERT_THRESHOLD=4  # Celsius for coconut hearts
FRESHNESS_TRACKING_ENABLED=true

# Farmer Verification
FARMER_VERIFICATION_API=your-farmer-verification-endpoint
FARM_LOCATION_VALIDATION=true

# Product Quality
COCONUT_QUALITY_STANDARDS=premium,standard,economy
HARVEST_DATE_VALIDATION=true
ORIGIN_CERTIFICATION_REQUIRED=true

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```
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

### 👤 Customer Features
1. **Registration**: Create account for coconut product purchases
2. **Product Discovery**: Browse fresh and dried coconut hearts (củ hủ dừa) with origin tracking
3. **Freshness Verification**: Check product freshness indicators and cold-chain status
4. **Shopping**: Add coconut products to cart with quantity and freshness preferences
5. **Cold-Chain Checkout**: Select delivery address with temperature-controlled options
6. **Order Tracking**: Monitor harvest, processing, and cold-chain delivery status

### 👨‍🌾 Farmer Features
1. **Farmer Registration**: Register as coconut farmer or processor
2. **Product Listing**: List fresh coconut hearts and processed coconut products
3. **Harvest Management**: Update product availability based on harvest schedules
4. **Order Fulfillment**: Coordinate cold-chain pickup and processing timelines
5. **Revenue Tracking**: Monitor earnings and payment schedules
6. **Customer Feedback**: View product reviews and quality ratings

### 👨‍💼 Admin Features
1. **Agricultural Dashboard**: View harvest trends, farmer performance, and seasonal analytics
2. **Product Management**: Oversee coconut product inventory with freshness monitoring
3. **Cold-Chain Monitoring**: Track temperature-controlled storage and delivery
4. **Order Processing**: Coordinate farmer fulfillment and customer delivery
5. **Farmer Management**: Onboard and support coconut farmers and processors
6. **Quality Control**: Monitor product quality standards and customer satisfaction

---

## 📁 Project Structure

```
📦 HanFoods - Coconut Products E-commerce
├── 🗂️ hfbe/                     # Backend (Node.js/Express)
│   ├── 📄 app.js                # Main application entry
│   ├── 🎛️ controllers/         # Request handlers (Products, Farmers, Cold-chain)
│   ├── 🛡️ middlewares/         # Authentication & farmer verification
│   ├── 📊 models/              # Database schemas (Products, Farmers, Cold-chain)
│   ├── 🛣️ routes/              # API endpoints (Coconut products, Farmer portal)
│   ├── ⚙️ services/            # Business logic (Cold-chain, Freshness tracking)
│   ├── 🔧 utils/               # Helper functions (Temperature monitoring)
│   ├── 🌱 seeds/               # Database seeders (Coconut products, Farmers)
│   └── 📋 scripts/             # Utility scripts (Harvest data, Analytics)
├── 🗂️ hffe/                     # Frontend (React.js)
│   ├── 📁 public/              # Static assets (Coconut product images)
│   ├── 📁 src/                 # Source code
│   │   ├── 🎨 components/      # Reusable components (Product cards, Freshness indicators)
│   │   ├── 📄 pages/           # Page components
│   │   │   ├── 👨‍💼 admin/        # Admin dashboard (Agricultural analytics)
│   │   │   ├── 👨‍🌾 farmer/       # Farmer portal (Product management, Revenue tracking)
│   │   │   └── 👤 customer/     # Customer interface (Product browsing, Order tracking)
│   │   ├── 🔧 services/        # API services (Coconut products, Cold-chain tracking)
│   │   ├── 🎯 context/         # React contexts (Farmer auth, Product freshness)
│   │   └── 💫 utils/           # Utility functions (Freshness calculations, Temperature display)
├── 📚 documentation/           # BRS, SRS, and technical documentation
└── 📋 README.md               # This file
```

---

## 🛠️ API Documentation

### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Customer/Farmer registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/google` | Google OAuth login |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/profile` | Get user profile |
| `POST` | `/api/auth/farmer-verify` | Farmer verification process |

### 🥥 Coconut Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products/coconut` | Get all coconut products |
| `GET` | `/api/products/coconut-hearts` | Get fresh coconut hearts (củ hủ dừa) |
| `GET` | `/api/products/dried-coconut` | Get dried coconut products |
| `GET` | `/api/products/:id` | Get product with freshness data |
| `GET` | `/api/products/:id/traceability` | Get product farm-to-table tracking |
| `POST` | `/api/products` | Create coconut product (Farmer/Admin) |
| `PUT` | `/api/products/:id` | Update product freshness (Farmer/Admin) |
| `DELETE` | `/api/products/:id` | Remove product (Farmer/Admin) |

### 👨‍🌾 Farmer Portal Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/farmers/profile` | Get farmer profile |
| `PUT` | `/api/farmers/profile` | Update farmer information |
| `GET` | `/api/farmers/products` | Get farmer's product listings |
| `GET` | `/api/farmers/orders` | Get farmer's order fulfillment queue |
| `POST` | `/api/farmers/harvest-update` | Update harvest availability |
| `GET` | `/api/farmers/revenue` | Get farmer revenue analytics |
| `POST` | `/api/farmers/cold-chain-pickup` | Schedule cold-chain pickup |

### 🛒 Cart & Wishlist (Coconut Focus)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/carts` | Get customer cart with freshness check |
| `POST` | `/api/carts/add-coconut` | Add coconut product to cart |
| `PUT` | `/api/carts/update-freshness` | Update cart based on freshness |
| `DELETE` | `/api/carts/remove` | Remove from cart |
| `GET` | `/api/wishlists/coconut` | Get coconut product wishlist |
| `POST` | `/api/wishlists/add` | Add coconut product to wishlist |

### � Cold-Chain Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders/cold-chain` | Get cold-chain order status |
| `POST` | `/api/orders/coconut-delivery` | Create coconut product order |
| `GET` | `/api/orders/:id/temperature` | Get order temperature tracking |
| `PUT` | `/api/orders/:id/harvest-status` | Update harvest/processing status |
| `GET` | `/api/orders/:id/farmer-info` | Get order farmer information |

### �️ Cold-Chain & Freshness Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cold-chain/temperature/:orderId` | Get temperature log |
| `POST` | `/api/cold-chain/update-temp` | Log temperature data |
| `GET` | `/api/freshness/check/:productId` | Check product freshness status |
| `POST` | `/api/freshness/quality-report` | Submit quality report |

### 🎫 Farmer Incentive & Discount System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/discounts/seasonal-coconut` | Get seasonal coconut promotions |
| `POST` | `/api/discounts/farmer-bonus` | Create farmer incentive program |
| `POST` | `/api/discounts/validate` | Validate discount code |
| `GET` | `/api/discounts/harvest-specials` | Get harvest season specials |

### 🔒 Authentication
Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Testing & Validation

### Backend Verification (Coconut Products)
```bash
cd hfbe
node verify-backend.js
node scripts/test-products-api.js  # Test coconut product APIs
```

### Frontend Build Test
```bash
cd hffe
npm run build
```

### Cold-Chain System Validation
```bash
bash admin-final-validation.sh
cd hfbe
node scripts/comprehensive-test-runner.js  # Test cold-chain and farmer features
```

### Farmer Portal Testing
```bash
cd hfbe
node scripts/system-integration-test.js  # Test farmer registration and product management
```

---

## 🚀 Deployment

### 🌐 Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export MONGO_URI=your-production-mongodb-uri
export COLD_CHAIN_API_KEY=your-cold-chain-api-key
export FARMER_VERIFICATION_API=your-farmer-verification-endpoint
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
- Monitor MongoDB performance for coconut product data
- Use PM2 for process management
- Implement cold-chain temperature logging and alerts
- Track farmer onboarding and product listing metrics
- Set up SSL certificates for HTTPS
- Monitor freshness indicators and delivery tracking

---

## 🛠️ Technologies Used

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose (Agricultural data optimized)
- **Authentication**: Passport.js + JWT (Multi-role: Customer/Farmer/Admin)
- **Payment**: VietQR API + Farmer revenue sharing
- **Cold-Chain**: Temperature monitoring APIs
- **Security**: Helmet, CORS, Rate Limiting

### Frontend Stack
- **Framework**: React.js 18
- **UI Library**: Material-UI (MUI) with coconut-themed components
- **Charts**: Chart.js + Recharts (Agricultural analytics)
- **Routing**: React Router v6 (Customer/Farmer/Admin routes)
- **State Management**: React Context + Hooks (Product freshness state)
- **HTTP Client**: Axios (API calls for coconut products and cold-chain)

### Specialized Features
- **Cold-Chain Integration**: Temperature tracking and logistics
- **Farmer Portal**: Mobile-optimized interface for farmers
- **Product Traceability**: Farm-to-table tracking system
- **Freshness Monitoring**: Real-time quality indicators
- **Agricultural Analytics**: Harvest trends and seasonal data

### Development Tools
- **Package Manager**: npm
- **Development Server**: Nodemon
- **Code Quality**: ESLint
- **Version Control**: Git
- **Testing**: Comprehensive test suites for coconut products and farmer workflows

---

## 🤝 Contributing

We welcome contributions to improve the HanFoods coconut products platform! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/coconut-enhancement`)
3. 💾 Commit your changes (`git commit -m 'Add coconut product feature'`)
4. 📤 Push to the branch (`git push origin feature/coconut-enhancement`)
5. 🔄 Open a Pull Request

### 📋 Code Style Guidelines
- Use meaningful variable names (prefer coconut/farmer context)
- Follow agricultural domain terminology
- Include freshness and cold-chain considerations in product features
- Ensure mobile-friendly design for farmer interfaces
- Add comments for complex logic
- Follow React and Node.js best practices
- Test your changes before submitting

---

## 📞 Contact

### 👨‍💻 Creator & Platform Developer

**Phạm Nam Khánh**
- 📧 Email: [khanhpn31@gmail.com](mailto:khanhpn31@gmail.com)
- 💼 LinkedIn: Connect for agricultural technology and e-commerce inquiries
- 🐙 GitHub: Check out other agricultural technology projects

*Passionate about connecting farmers with consumers through technology. Feel free to reach out for questions about coconut products, farmer partnerships, or platform collaboration opportunities!*

---

## 🙏 Acknowledgments

- Thanks to all the open-source libraries that made this agricultural e-commerce platform possible
- Special appreciation to Vietnamese coconut farmers who inspired this project
- Gratitude to the React and Node.js communities for excellent tools
- Inspired by sustainable agriculture and direct farmer-to-consumer initiatives
- Recognition to cold-chain logistics innovations that make fresh coconut heart delivery possible

---

<div align="center">

**⭐ Star this repository if you support sustainable coconut farming and fresh product delivery!**

🥥 Made with ❤️ for Vietnamese coconut farmers and health-conscious consumers 🥥

*Connecting farms to tables, one coconut heart at a time*

</div>
