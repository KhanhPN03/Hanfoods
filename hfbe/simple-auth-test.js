const axios = require('axios');

console.log('Testing admin login...');

axios.post('http://localhost:5000/api/auth/login', {
  email: 'admin@test.com',
  password: 'admin123'
})
.then(response => {
  console.log('SUCCESS!');
  console.log('Token:', response.data.token ? 'Received' : 'Missing');
  console.log('User role:', response.data.user?.role);
  console.log('User name:', response.data.user?.firstname, response.data.user?.lastname);
})
.catch(error => {
  console.log('ERROR:', error.response?.data || error.message);
});
