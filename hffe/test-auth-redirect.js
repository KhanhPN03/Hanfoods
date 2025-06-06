const puppeteer = require('puppeteer');

async function testAuthRedirect() {
  const browser = await puppeteer.launch({ headless: false });
  
  try {
    console.log('🔄 Starting Authentication Redirect Tests...\n');
    
    // Test 1: Customer Login Page Redirect
    console.log('📋 Test 1: Customer Login Page Redirect');
    const page1 = await browser.newPage();
    
    // First, clear any existing auth data
    await page1.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    
    // Navigate to login page when not logged in
    console.log('  ➤ Visiting login page (not logged in)...');
    await page1.goto('http://localhost:3001/login');
    await page1.waitForTimeout(2000);
    
    const currentUrl1 = page1.url();
    if (currentUrl1.includes('/login')) {
      console.log('  ✅ Not logged in - stayed on login page ✓');
    } else {
      console.log('  ❌ Unexpected redirect when not logged in');
    }
    
    // Test 2: Admin Login Page Redirect  
    console.log('\n📋 Test 2: Admin Login Page Redirect');
    const page2 = await browser.newPage();
    
    // Clear auth data
    await page2.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    
    // Navigate to admin login when not logged in
    console.log('  ➤ Visiting admin login page (not logged in)...');
    await page2.goto('http://localhost:3001/admin/login');
    await page2.waitForTimeout(2000);
    
    const currentUrl2 = page2.url();
    if (currentUrl2.includes('/admin/login')) {
      console.log('  ✅ Not logged in - stayed on admin login page ✓');
    } else {
      console.log('  ❌ Unexpected redirect when not logged in');
    }
    
    // Test 3: Mock customer login and test redirect
    console.log('\n📋 Test 3: Customer Login Redirect Test');
    const page3 = await browser.newPage();
    
    // Mock a logged-in customer
    await page3.evaluateOnNewDocument(() => {
      localStorage.setItem('token', 'mock_customer_token');
      localStorage.setItem('user', JSON.stringify({
        _id: 'customer123',
        firstname: 'Test',
        lastname: 'Customer', 
        email: 'test@customer.com',
        role: 'customer'
      }));
    });
    
    console.log('  ➤ Visiting customer login page (logged in as customer)...');
    await page3.goto('http://localhost:3001/login');
    await page3.waitForTimeout(3000);
    
    const currentUrl3 = page3.url();
    if (currentUrl3 === 'http://localhost:3001/') {
      console.log('  ✅ Logged-in customer redirected to homepage ✓');
    } else {
      console.log(`  ❌ Expected redirect to homepage, got: ${currentUrl3}`);
    }
    
    // Test 4: Mock admin login and test redirect
    console.log('\n📋 Test 4: Admin Login Redirect Test');
    const page4 = await browser.newPage();
    
    // Mock a logged-in admin
    await page4.evaluateOnNewDocument(() => {
      localStorage.setItem('token', 'mock_admin_token');
      localStorage.setItem('user', JSON.stringify({
        _id: 'admin123',
        firstname: 'Test',
        lastname: 'Admin',
        email: 'admin@test.com', 
        role: 'admin'
      }));
    });
    
    console.log('  ➤ Visiting admin login page (logged in as admin)...');
    await page4.goto('http://localhost:3001/admin/login');
    await page4.waitForTimeout(3000);
    
    const currentUrl4 = page4.url();
    if (currentUrl4.includes('/admin/dashboard')) {
      console.log('  ✅ Logged-in admin redirected to admin dashboard ✓');
    } else {
      console.log(`  ❌ Expected redirect to admin dashboard, got: ${currentUrl4}`);
    }
    
    // Test 5: Customer accessing admin login
    console.log('\n📋 Test 5: Customer Accessing Admin Login Test');
    const page5 = await browser.newPage();
    
    // Mock a logged-in customer
    await page5.evaluateOnNewDocument(() => {
      localStorage.setItem('token', 'mock_customer_token');
      localStorage.setItem('user', JSON.stringify({
        _id: 'customer123',
        firstname: 'Test',
        lastname: 'Customer',
        email: 'test@customer.com',
        role: 'customer'
      }));
    });
    
    console.log('  ➤ Customer trying to access admin login...');
    await page5.goto('http://localhost:3001/admin/login');
    await page5.waitForTimeout(3000);
    
    const currentUrl5 = page5.url();
    if (currentUrl5.includes('/login') && !currentUrl5.includes('/admin')) {
      console.log('  ✅ Customer redirected to customer login page ✓');
    } else {
      console.log(`  ❌ Expected redirect to customer login, got: ${currentUrl5}`);
    }
    
    console.log('\n🎉 Authentication redirect tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testAuthRedirect().catch(console.error);
