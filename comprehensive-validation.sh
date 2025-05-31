#!/bin/bash

echo "🚀 Final E-commerce System Validation"
echo "======================================"
echo

# Check if servers are running
echo "1️⃣ Checking Server Status..."
BACKEND_PORT=$(netstat -an | grep ":5000" | grep "LISTENING" | wc -l)
FRONTEND_PORT=$(netstat -an | grep ":3000" | grep "LISTENING" | wc -l)

if [ "$BACKEND_PORT" -gt 0 ]; then
    echo "✅ Backend server running on port 5000"
else
    echo "❌ Backend server not running on port 5000"
    exit 1
fi

if [ "$FRONTEND_PORT" -gt 0 ]; then
    echo "✅ Frontend server running on port 3000"
else
    echo "❌ Frontend server not running on port 3000"
    exit 1
fi

echo

# Test API endpoints using curl
echo "2️⃣ Testing API Endpoints..."

# Health check
echo -n "Testing /api/health... "
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5000/api/health -o /tmp/health_response.txt)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ (200)"
else
    echo "❌ ($HEALTH_RESPONSE)"
fi

# Products endpoint
echo -n "Testing /api/products... "
PRODUCTS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5000/api/products -o /tmp/products_response.txt)
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
    echo "✅ (200)"
else
    echo "❌ ($PRODUCTS_RESPONSE)"
fi

# Auth endpoint (expect 400 for missing data)
echo -n "Testing /api/auth/login... "
AUTH_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{}' -o /tmp/auth_response.txt)
if [ "$AUTH_RESPONSE" = "400" ]; then
    echo "✅ (400 - expected for missing data)"
else
    echo "⚠️  ($AUTH_RESPONSE - unexpected response)"
fi

echo

# Test that old endpoints return 404
echo "3️⃣ Verifying Old Endpoints Return 404..."

OLD_ENDPOINTS=("/health" "/products" "/orders")
for endpoint in "${OLD_ENDPOINTS[@]}"; do
    echo -n "Testing $endpoint... "
    RESPONSE=$(curl -s -w "%{http_code}" http://localhost:5000$endpoint -o /tmp/old_response.txt)
    if [ "$RESPONSE" = "404" ]; then
        echo "✅ (404 - correctly blocked)"
    else
        echo "❌ ($RESPONSE - should be 404)"
    fi
done

echo

# Check frontend accessibility
echo "4️⃣ Testing Frontend Accessibility..."

echo -n "Testing frontend root... "
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000 -o /tmp/frontend_response.txt)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ (200)"
else
    echo "❌ ($FRONTEND_RESPONSE)"
fi

echo -n "Testing admin login page... "
ADMIN_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/admin/login -o /tmp/admin_login_response.txt)
if [ "$ADMIN_LOGIN_RESPONSE" = "200" ]; then
    echo "✅ (200)"
else
    echo "❌ ($ADMIN_LOGIN_RESPONSE)"
fi

echo

# File verification
echo "5️⃣ Verifying Key Files..."

KEY_FILES=(
    "hffe/src/services/apiService.js"
    "hffe/src/services/AdminApiService.js"
    "hffe/src/page/customer/customerComponent/ApiStatusMonitor.jsx"
    "hfbe/app.js"
)

for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo

# Check for API prefix in key files
echo "6️⃣ Verifying API Prefix Fixes..."

echo -n "Checking apiService.js for /api prefix... "
API_PREFIX_COUNT=$(grep -c "/api/" hffe/src/services/apiService.js)
if [ "$API_PREFIX_COUNT" -gt 10 ]; then
    echo "✅ ($API_PREFIX_COUNT occurrences)"
else
    echo "❌ ($API_PREFIX_COUNT occurrences - may be insufficient)"
fi

echo -n "Checking AdminApiService.js for /api prefix... "
ADMIN_API_PREFIX_COUNT=$(grep -c "/api/" hffe/src/services/AdminApiService.js)
if [ "$ADMIN_API_PREFIX_COUNT" -gt 10 ]; then
    echo "✅ ($ADMIN_API_PREFIX_COUNT occurrences)"
else
    echo "❌ ($ADMIN_API_PREFIX_COUNT occurrences - may be insufficient)"
fi

echo -n "Checking ApiStatusMonitor.jsx for /api/health... "
if grep -q "/api/health" hffe/src/page/customer/customerComponent/ApiStatusMonitor.jsx; then
    echo "✅ Fixed"
else
    echo "❌ Not fixed"
fi

echo

# Test database connectivity through API
echo "7️⃣ Testing Database Connectivity..."

echo -n "Testing products count via API... "
PRODUCTS_COUNT=$(curl -s http://localhost:5000/api/products | grep -o '"totalCount":[0-9]*' | cut -d: -f2)
if [ ! -z "$PRODUCTS_COUNT" ] && [ "$PRODUCTS_COUNT" -gt 0 ]; then
    echo "✅ ($PRODUCTS_COUNT products found)"
else
    echo "⚠️  (No products or connection issue)"
fi

echo

# Summary
echo "🎯 VALIDATION SUMMARY"
echo "==================="
echo

# Count issues
ISSUES=0

# Re-run critical tests for summary
if [ "$(curl -s -w "%{http_code}" http://localhost:5000/api/health -o /dev/null)" != "200" ]; then
    echo "❌ Health endpoint failing"
    ((ISSUES++))
fi

if [ "$(curl -s -w "%{http_code}" http://localhost:5000/api/products -o /dev/null)" != "200" ]; then
    echo "❌ Products endpoint failing"
    ((ISSUES++))
fi

if [ "$(curl -s -w "%{http_code}" http://localhost:5000/health -o /dev/null)" != "404" ]; then
    echo "❌ Old health endpoint not properly blocked"
    ((ISSUES++))
fi

if [ "$(curl -s -w "%{http_code}" http://localhost:3000 -o /dev/null)" != "200" ]; then
    echo "❌ Frontend not accessible"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo "🎉 ALL CRITICAL TESTS PASSED!"
    echo "✅ Routing fixes are working correctly"
    echo "✅ Frontend and backend are communicating properly"
    echo "✅ Admin system is ready for testing"
    echo
    echo "🌐 Next Steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Navigate to http://localhost:3000/admin/login"
    echo "3. Create an admin account or test with existing credentials"
    echo "4. Verify admin dashboard functionality"
else
    echo "⚠️  Found $ISSUES critical issues that need attention"
fi

echo
echo "📊 Test completed at $(date)"

# Cleanup temp files
rm -f /tmp/health_response.txt /tmp/products_response.txt /tmp/auth_response.txt 
rm -f /tmp/old_response.txt /tmp/frontend_response.txt /tmp/admin_login_response.txt
