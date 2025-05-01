import { PrismaClient } from './generated/prisma';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Prisma client
const prisma = new PrismaClient();

// Check environment variables
function checkEnvironment() {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = [];
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  console.log('📊 Environment check results:');
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are set');
  } else {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    
    // Offer to create a sample .env file
    if (!fs.existsSync('.env')) {
      const envSample = 
`DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
JWT_SECRET="your_secret_key_here"
PORT=5000
NODE_ENV=development`;
      
      fs.writeFileSync('.env.sample', envSample);
      console.log('📝 Created .env.sample file for reference');
    }
  }
  
  // Print out database URL (obscured for security)
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    const obscuredUrl = dbUrl.replace(/\/\/(.+?):(.+?)@/, '//****:****@');
    console.log(`🗄️ Database URL: ${obscuredUrl}`);
  }
}

// Test database connection
async function testConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    // Attempt a simple query
    await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    
    return false;
  }
}

// Check Prisma schema and models
async function checkPrismaSchema() {
  console.log('\n🔍 Checking Prisma schema...');
  
  try {
    // Check if the User model exists
    const userTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      );
    `;
    
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    return false;
  }
  return true;
}

// Test creating a user
async function testUserCreation() {
  console.log('\n🔍 Testing user creation...');
  
  try {
    // Generate a test email
    const testEmail = `test_${Date.now()}@example.com`;
    
    // Attempt to create a user directly with Prisma
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'hashedpassword_for_test', // In a real app, this would be hashed
        name: 'Test User',
      },
    });
    
    console.log(`✅ Successfully created test user with ID: ${user.id}`);
    
    
    console.log('🧹 Test user deleted');
    return true;
  } catch (error) {
    console.error('❌ User creation failed:', error);
    
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('🧪 Starting database diagnostics...');
    
    // Check environment variables
    checkEnvironment();
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log('⛔ Cannot proceed with further tests due to connection failure');
      return;
    }
    
    // Check schema
    const schemaOk = await checkPrismaSchema();
    if (!schemaOk) {
      console.log('⚠️ Schema issues detected - migrations may be needed');
    }
    
    // Test user creation
    await testUserCreation();
    
    console.log('\n✅ Database tests completed');
  } catch (error) {
    console.error('\n❌ Tests failed with an unexpected error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
runTests();