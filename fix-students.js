const mongoose = require('mongoose')
require('dotenv').config()

// Simple User schema for this fix
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  department: String,
  companyName: String,
  isActive: { type: Boolean, default: true },
  isVerified: Boolean,
  verificationStatus: String,
  verifiedBy: mongoose.Schema.Types.ObjectId,
  verificationDate: Date,
  verificationNotes: String
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

const fixStudents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')

    // Find all students
    const students = await User.find({ role: 'student' })
    console.log(`Found ${students.length} students`)

    // Update students without verification fields
    for (const student of students) {
      let needsUpdate = false
      const updates = {}

      if (student.isVerified === undefined) {
        updates.isVerified = false
        needsUpdate = true
      }

      if (!student.verificationStatus) {
        updates.verificationStatus = 'pending'
        needsUpdate = true
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(student._id, updates)
        console.log(`✅ Updated student: ${student.name} (${student.email})`)
      } else {
        console.log(`✓ Student already has verification fields: ${student.name}`)
      }
    }

    // Show all students with their verification status
    const allStudents = await User.find({ role: 'student' }).select('name email verificationStatus isVerified')
    console.log('\n📋 All Students:')
    allStudents.forEach(student => {
      console.log(`- ${student.name} (${student.email}): ${student.verificationStatus} | Verified: ${student.isVerified}`)
    })

    // Check if faculty exists
    const faculty = await User.findOne({ role: 'faculty' })
    if (!faculty) {
      console.log('\n⚠️  No faculty found. Creating faculty user...')
      const newFaculty = new User({
        name: 'Dr. Sarah Wilson',
        email: 'faculty@test.com',
        password: '$2b$10$rOvHPGkwJkAVqNpjpCQ7/.vJ8owBz7Jq9X5qJ5qJ5qJ5qJ5qJ5qJ5O', // faculty123 hashed
        role: 'faculty',
        department: 'Computer Science',
        isVerified: true,
        verificationStatus: 'approved'
      })
      await newFaculty.save()
      console.log('✅ Faculty user created')
    } else {
      console.log(`✓ Faculty exists: ${faculty.name} (${faculty.email})`)
    }

    console.log('\n🎉 Fix completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixStudents()