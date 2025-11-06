# 🚀 Deployment Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

## Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/job-placement-portal.git
   cd job-placement-portal
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual credentials.

4. **Database Setup**
   ```bash
   npm run seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

## Production Deployment

### Heroku Deployment
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Vercel/Netlify (Frontend)
1. Build frontend: `cd frontend && npm run build`
2. Deploy `dist` folder

### MongoDB Atlas
1. Create cluster
2. Get connection string
3. Update MONGODB_URI in .env

### Cloudinary Setup
1. Create account at cloudinary.com
2. Get cloud name, API key, and secret
3. Update .env file

## Default Accounts
After seeding, you can login with:
- **Admin**: admin@portal.com / admin123
- **Faculty**: faculty@test.com / faculty123
- **Student**: student@test.com / student123
- **Company**: company@test.com / company123