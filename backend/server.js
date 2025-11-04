const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { testCloudinaryConnection } = require('./config/cloudinary')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const jobRoutes = require('./routes/jobs')
const profileRoutes = require('./routes/profiles')
const applicationRoutes = require('./routes/applications')
const adminRoutes = require('./routes/admin')

const app = express()

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}))

// CORS configuration for file serving
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')

mongoose.connection.on('connected', async () => {
  console.log('Connected to MongoDB')
  
  // Test Cloudinary connection
  console.log('Testing Cloudinary connection...')
  const cloudinaryConnected = await testCloudinaryConnection()
  if (cloudinaryConnected) {
    console.log('✅ Cloudinary is ready for file uploads')
  } else {
    console.log('⚠️  Cloudinary not configured - check your environment variables')
    console.log('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
  }
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/faculty', require('./routes/faculty'))
app.use('/api/upload', require('./routes/upload'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})