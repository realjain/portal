const mongoose = require('mongoose')

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  program: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  skills: [{
    type: String,
    trim: true
  }],
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    technologies: [String],
    url: String,
    startDate: Date,
    endDate: Date
  }],
  resumeUrl: String,
  resumeFilename: String,
  cloudinaryPublicId: String, // Store Cloudinary public ID for deletion
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for better query performance (userId already has unique index)
studentProfileSchema.index({ graduationYear: 1 })
studentProfileSchema.index({ skills: 1 })
studentProfileSchema.index({ cgpa: 1 })

module.exports = mongoose.model('StudentProfile', studentProfileSchema)