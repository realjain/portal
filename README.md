# 🎓 Internship & Placement Portal

A comprehensive full-stack web application built with the MERN stack for managing internships and placements in educational institutions.

## 🌟 Features

### 👨‍🎓 For Students
- **Profile Management**: Complete profile with skills, projects, and academic details
- **Job Search**: Advanced search and filtering options
- **Application Tracking**: Track application status in real-time
- **Dashboard**: Personalized dashboard with application insights

### 🏢 For Companies
- **Job Posting**: Create and manage job postings
- **Application Management**: Review applications with scoring system
- **Candidate Tracking**: Track candidates through hiring pipeline
- **Analytics Dashboard**: Comprehensive hiring analytics

### 👨‍💼 For Administrators
- **User Management**: Manage students, companies, and their accounts
- **Application Oversight**: Monitor all applications across the platform
- **Analytics & Reporting**: System-wide analytics and insights
- **Company Performance**: Track company hiring patterns

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/placement-portal.git
   cd placement-portal
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install --legacy-peer-deps
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   # MONGODB_URI=mongodb://localhost:27017/placement-portal
   # JWT_SECRET=your-secret-key
   ```

4. **Database Setup**
   ```bash
   # Seed database with sample data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 5173
   ```

## 🔑 Default Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: admin@portal.com / admin123
- **Student**: student@test.com / student123
- **Company**: company@test.com / company123

## 📱 Application Structure

```
placement-portal/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.jsx         # Main app component
│   └── public/             # Static files
├── debug-*.html           # Debug tools
└── package.json           # Project configuration
```

## 🎯 Key Features Implemented

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Company, Admin)
- Password visibility toggles
- Secure password change functionality

### Advanced Application Management
- Multi-stage application process
- Bulk application operations
- Application scoring system
- Real-time status tracking

### Comprehensive Dashboards
- Student dashboard with application insights
- Company dashboard with hiring analytics
- Admin dashboard with system-wide statistics

### Enhanced User Experience
- Responsive design for all devices
- Advanced search and filtering
- Real-time notifications
- Professional UI/UX design

## 🔧 Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run seed         # Seed database with sample data
```

## 🐛 Debugging Tools

The project includes several debugging tools:
- `debug-database.html` - Database management and user debugging
- `debug-admin-stats.html` - Admin statistics debugging
- `debug-job-creation.html` - Job creation debugging
- `test-backend.html` - Backend API testing

## 📊 Database Schema

### Users Collection
- Students with academic profiles
- Companies with hiring information
- Administrators with system access

### Jobs Collection
- Job postings with detailed requirements
- Eligibility criteria and deadlines
- Company association and status tracking

### Applications Collection
- Student applications with cover letters
- Multi-stage tracking (Applied → Shortlisted → Interview → Offered/Rejected)
- Scoring system and reviewer notes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Project Type**: Training Project (Group)
- **Institution**: [Your Institution Name]

## 🙏 Acknowledgments

- Thanks to all team members who contributed to this project
- Special thanks to mentors and instructors for guidance
- Built as part of training program for practical learning

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [your-email@example.com]

---

**⭐ If you found this project helpful, please give it a star!**