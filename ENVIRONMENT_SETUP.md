# Environment Configuration Guide

## 📋 Tổng quan

Hệ thống HanFoods sử dụng environment variables để quản lý cấu hình một cách chuyên nghiệp và bảo mật. Tất cả các URL API, cài đặt database, và thông tin nhạy cảm đều được quản lý thông qua file `.env`.

## 🔧 Cấu trúc Environment

### Backend Environment Variables

```bash
# File: /hfbe/.env
NODE_ENV=development|production
API_BASE_URL=http://localhost:5000
MONGO_URI=mongodb://localhost:27017/hanfoods
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
# ... và nhiều cài đặt khác
```

### Frontend Environment Variables

```bash
# File: /hffe/.env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development|production
REACT_APP_ENABLE_GOOGLE_LOGIN=true|false
# ... và nhiều cài đặt khác
```

## 🚀 Setup cho Development

### 1. Backend Setup
```bash
cd hfbe
cp .env.example .env
# Chỉnh sửa .env với các giá trị phù hợp
```

### 2. Frontend Setup
```bash
cd hffe
# File .env đã được tạo sẵn với cấu hình development
```

## 🏭 Setup cho Production

### 1. Backend Production
```bash
cd hfbe
cp .env.production .env
# Cập nhật tất cả các giá trị production
```

### 2. Frontend Production
```bash
cd hffe
cp .env.production .env
# Cập nhật tất cả các URL production
```

## 🔒 Bảo mật Environment Variables

### Quy tắc bảo mật:
1. **KHÔNG BAO GIỜ** commit file `.env` vào Git
2. Sử dụng secrets mạnh cho JWT_SECRET và SESSION_SECRET (tối thiểu 32 ký tự)
3. Trong production, sử dụng HTTPS cho tất cả URLs
4. Thường xuyên rotate các secrets
5. Sử dụng environment-specific secrets

### Danh sách các biến nhạy cảm:
- `JWT_SECRET`
- `SESSION_SECRET`
- `MONGO_URI` (nếu chứa password)
- `SMTP_PASS`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_PASSWORD`

## 📁 Files Structure

```
/hfbe/
  ├── .env                    # Current environment config
  ├── .env.example           # Template for development
  ├── .env.production        # Template for production
  └── config/
      └── environment.js     # Centralized config management

/hffe/
  ├── .env                   # Current environment config
  ├── .env.production        # Template for production
  └── src/
      ├── config/
      │   ├── environment.js # Frontend config management
      │   └── api.js         # API endpoints constants
      └── setupProxy.js      # Development proxy config
```

## 🔄 API Endpoints Management

### Centralized API Configuration

Tất cả API endpoints được quản lý tập trung trong:
- Backend: `/hfbe/config/environment.js`
- Frontend: `/hffe/src/config/api.js`

### Sử dụng API Endpoints

```javascript
// Frontend - Sử dụng constants thay vì hardcode URLs
import { API_ENDPOINTS } from '../config/api';

// Thay vì: '/api/admin/orders'
// Sử dụng: API_ENDPOINTS.ORDERS.ADMIN.BASE
const response = await api.get(API_ENDPOINTS.ORDERS.ADMIN.BASE);
```

## 🌍 Environment Validation

Hệ thống tự động validate environment configuration khi startup:

### Backend Validation
- Kiểm tra required variables
- Validate security settings
- Cảnh báo về cấu hình yếu
- Tự động exit nếu có lỗi critical trong production

### Frontend Validation
- Kiểm tra API URL accessibility
- Validate feature toggles
- Cảnh báo về missing configurations

## 🚨 Troubleshooting

### Lỗi thường gặp:

#### 1. "Required environment variable not set"
```bash
# Kiểm tra file .env có tồn tại
ls -la .env

# Kiểm tra biến có được load
echo $JWT_SECRET
```

#### 2. "API connection failed"
```bash
# Kiểm tra URL trong .env
cat .env | grep API_URL

# Test connection
curl http://localhost:5000/api/health
```

#### 3. "CORS error"
```bash
# Kiểm tra CORS_ORIGIN trong backend .env
# Đảm bảo frontend URL match với CORS setting
```

## 📊 Monitoring và Logging

### Environment Logging
- Startup validation logs
- Configuration warnings
- Feature status reports
- Security check results

### Production Monitoring
- API endpoint health checks
- Configuration drift detection
- Security audit logs
- Performance metrics

## 🔄 Migration Guide

### Từ hardcoded URLs sang Environment Config:

1. **Identify hardcoded URLs**
   ```bash
   grep -r "localhost:5000" src/
   grep -r "http://" src/
   ```

2. **Replace với environment variables**
   ```javascript
   // Before
   const API_URL = 'http://localhost:5000';
   
   // After
   import config from '../config/environment';
   const API_URL = config.api.baseUrl;
   ```

3. **Test thoroughly**
   - Development environment
   - Production-like environment
   - All API endpoints
   - Feature toggles

## 📞 Support

Nếu gặp vấn đề với environment configuration:

1. Kiểm tra file `.env` có đúng format
2. Validate các required variables
3. Test API connectivity
4. Check console logs cho validation warnings
5. Refer to production checklist trong .env.production

---

**Lưu ý quan trọng**: Luôn backup environment configuration trước khi thay đổi và test thoroughly trong staging environment trước khi deploy production.
