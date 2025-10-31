const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Simple User schema for testing
const testUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String
})

const TestUser = mongoose.model('TestUser', testUserSchema)

const testDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')

    // Clear test users
    await TestUser.deleteMany({})
    console.log('✅ Cleared existing test users')

    // Create a simple test user
    const testUser = new TestUser({
      name: 'Test User',
      email: 'test@test.com',
      password: await bcrypt.hash('test123', 10),
      role: 'student',
      department: 'Computer Science'
    })

    await testUser.save()
    console.log('✅ Test user created successfully!')

    // Check if user exists
    const users = await TestUser.find({})
    console.log(`✅ Found ${users.length} users in database`)
    console.log('Users:', users)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testDatabase()