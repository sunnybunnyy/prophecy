const axios = require('axios');
require('dotenv').config();

// Config
const API_URL = 'http://localhost:5000'; // Your backend API URL
const TEST_USER = {
  name: 'Test User',
  email: `test${Math.floor(Math.random() * 10000)}@example.com`, // Random email to avoid duplicates
  password: 'Test@1234'
};

// Set up Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`📤 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`📥 Response (${response.status}):`);
    console.log(response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`❌ Response error (${error.response.status}):`);
      console.error(error.response.data);
    } else if (error.request) {
      console.error('❌ No response received');
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Test health check
async function testHealthCheck() {
  console.log('\n🔍 Testing API health check...');
  try {
    const response = await api.get('/api/health');
    console.log('✅ API is healthy');
  } catch (error) {
    console.error('❌ API health check failed');
  }
}

// Test user registration
async function testRegistration() {
  console.log('\n🔍 Testing user registration...');
  try {
    const response = await api.post('/api/users/register', TEST_USER);
    console.log('✅ Registration successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Registration failed');
    return null;
  }
}

// Test user login
async function testLogin() {
  console.log('\n🔍 Testing user login...');
  try {
    const response = await api.post('/api/users/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log('✅ Login successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed');
    return null;
  }
}

// Test get current user
async function testGetCurrentUser(token) {
  console.log('\n🔍 Testing get current user...');
  if (!token) {
    console.log('⚠️ Skipping: No token available');
    return;
  }
  
  try {
    const response = await api.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Got user profile successfully');
  } catch (error) {
    console.error('❌ Failed to get user profile');
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('🧪 Starting API tests...');
    console.log(`🌐 API URL: ${API_URL}`);
    console.log(`👤 Test User: ${TEST_USER.email}`);
    
    await testHealthCheck();
    
    const registrationToken = await testRegistration();
    if (registrationToken) {
      await testGetCurrentUser(registrationToken);
    } else {
      const loginToken = await testLogin();
      await testGetCurrentUser(loginToken);
    }
    
    console.log('\n✅ Tests completed');
  } catch (error) {
    console.error('\n❌ Tests failed', error);
  }
}

// Run the tests
runTests();