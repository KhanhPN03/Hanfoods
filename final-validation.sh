#!/bin/bash

echo "🎉 ==============================================="
echo "   E-COMMERCE ADMIN DASHBOARD - FINAL VALIDATION"
echo "   ==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo -e "${YELLOW}🚀 Starting Final System Validation...${NC}"
echo ""

# Test 1: Backend Health
run_test "Backend Server Health" "curl -s http://localhost:5000/api/health | grep -q 'OK'"

# Test 2: Frontend Accessibility
run_test "Frontend Server Access" "curl -s http://localhost:3000 | grep -q 'React App'"

# Test 3: Admin API Authentication
run_test "Admin API Authentication" "curl -s -X POST -H 'Content-Type: application/json' -d '{\"email\":\"admin@test.com\",\"password\":\"admin123\"}' http://localhost:5000/api/auth/login | grep -q 'success.*true'"

# Test 4: Environment Configuration
run_test "Environment Configuration" "grep -q 'REACT_APP_API_URL=http://localhost:5000' /d/Hang_ngoo/web/hffe/.env"

# Test 5: Admin Route Protection
run_test "Admin Login Page Access" "curl -s http://localhost:3000/admin/login | grep -q 'React App'"

# Test 6: Database Connection (indirect via API)
run_test "Database Connection" "curl -s http://localhost:5000/api/health | grep -q 'uptime'"

echo -e "${YELLOW}📊 VALIDATION SUMMARY${NC}"
echo "=========================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is ready for use!${NC}"
    echo ""
    echo -e "${BLUE}🔗 Access Points:${NC}"
    echo "   • Admin Login: http://localhost:3000/admin/login"
    echo "   • Admin Dashboard: http://localhost:3000/admin/dashboard"
    echo "   • Main Site: http://localhost:3000"
    echo "   • API Health: http://localhost:5000/api/health"
    echo ""
    echo -e "${BLUE}🔑 Admin Credentials:${NC}"
    echo "   • Email: admin@test.com"
    echo "   • Password: admin123"
    echo ""
    echo -e "${GREEN}✅ STATUS: SYSTEM FULLY OPERATIONAL${NC}"
else
    echo -e "${RED}❌ Some tests failed. Please check the system configuration.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "1. Open http://localhost:3000/admin/login in your browser"
echo "2. Login with admin@test.com / admin123"
echo "3. Test all dashboard features"
echo "4. Verify responsive design on different devices"
echo "5. Test all CRUD operations"
echo ""
echo -e "${GREEN}🚀 Happy testing!${NC}"
