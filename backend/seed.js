const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const StudentProfile = require('./models/StudentProfile')
require('dotenv').config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal')
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await StudentProfile.deleteMany({})
    console.log('✅ Cleared existing data')

    // Create Admin User
    const admin = new User({
      name: 'System Admin',
      email: 'admin@portal.com',
      password: 'admin123', // Let the pre-save hook handle hashing
      role: 'admin'
    })
    await admin.save()
    console.log('✅ Admin user created')

    // Create Faculty User
    const faculty = new User({
      name: 'Dr. Sarah Wilson',
      email: 'faculty@test.com',
      password: 'faculty123', // Let the pre-save hook handle hashing
      role: 'faculty',
      department: 'Computer Science'
    })
    await faculty.save()
    console.log('✅ Faculty user created')

    // Create Sample Student (unverified initially)
    const student = new User({
      name: 'John Doe',
      email: 'student@test.com',
      password: 'student123', // Let the pre-save hook handle hashing
      role: 'student',
      department: 'Computer Science',
      isVerified: false,
      verificationStatus: 'pending'
    })
    await student.save()
    console.log('✅ Student user created')

    // Create Student Profile
    const studentProfile = new StudentProfile({
      userId: student._id,
      program: 'B.Tech Computer Science',
      graduationYear: 2025,
      cgpa: 8.5,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      projects: [{
        title: 'E-commerce Website',
        description: 'Full-stack e-commerce application with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'],
        url: 'https://github.com/johndoe/ecommerce'
      }],
      resumeUrl: 'https://example.com/resume.pdf',
      isProfileComplete: true
    })
    await studentProfile.save()

    // Create Sample Company
    const company = new User({
      name: 'Tech Corp',
      email: 'company@test.com',
      password: 'company123', // Let the pre-save hook handle hashing
      role: 'company',
      companyName: 'Tech Corp Solutions'
    })
    await company.save()
    console.log('✅ Company user created')

    // Verify users were created
    const userCount = await User.countDocuments()
    console.log(`✅ Total users created: ${userCount}`)

    console.log('\n🎉 Sample data created successfully!')
    console.log('\n🔑 Login Credentials:')
    console.log('Admin: admin@portal.com / admin123')
    console.log('Faculty: faculty@test.com / faculty123')
    console.log('Student: student@test.com / student123 (pending verification)')
    console.log('Company: company@test.com / company123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    console.error('Full error:', error.stack)
    process.exit(1)
  }
}

seedData()