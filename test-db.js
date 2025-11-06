const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection successful!');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();