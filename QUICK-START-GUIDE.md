# 🚀 Quick Start Guide - Placement Portal

## Step-by-Step Setup

### 1. First Time Setup
```bash
# Run the setup script
setup.bat
```
OR manually:
```bash
npm install
cd frontend
npm install --legacy-peer-deps
cd ..
```

### 2. Start the Application

**Option A: Start both servers together**
```bash
npm run dev
```

**Option B: Start servers separately (Recommended for debugging)**
- Terminal 1: `npm run server` (Backend on port 5000)
- Terminal 2: `npm run client` (Frontend on port 5173)

### 3. Create Default Users

**Method 1: Use the debug tool (Recommended)**
1. Open `debug-database.html` in your browser
2. Click "Check Server Status" to verify connection
3. Click "Create Default Users" to create demo accounts
4. Click "Test All Logins" to verify everything works

**Method 2: Use the seed script**
```bash
npm run seed
```

**Method 3: Use the check-users tool**
1. Open `check-users.html` in your browser
2. Click "Create Default Users"

### 4. Login Credentials

After creating default users, you can login with:

- **Admin**: admin@portal.com / admin123
- **Student**: student@test.com / student123  
- **Company**: company@test.com / company123

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Debug Tools**: Open the HTML files in your browser

## Troubleshooting

### Problem: "No default users exist"
**Solution**: Use any of the user creation methods above

### Problem: "Users already exist" but login fails
**Solution**: 
1. Open `debug-database.html`
2. Click "Test All Logins" to see which accounts work
3. Use "Full Reset" if needed

### Problem: Backend server not running
**Solution**: 
1. Make sure MongoDB is running
2. Check if port 5000 is available
3. Run `npm run server` in a separate terminal

### Problem: Frontend not loading
**Solution**:
1. Make sure you're in the project root directory
2. Run `npm run client` or `cd frontend && npm run dev`
3. Check if port 5173 is available

## File Structure

```
project/
├── backend/           # Backend API server
├── frontend/          # React frontend
├── debug-database.html # Complete database management tool
├── check-users.html   # Simple user checking tool
├── RUN-PROJECT.bat    # Interactive menu
└── package.json       # Main project config
```

## Quick Commands

- `npm run dev` - Start both servers
- `npm run server` - Backend only
- `npm run client` - Frontend only
- `npm run seed` - Create sample data
- `RUN-PROJECT.bat` - Interactive menu

## Need Help?

1. Use `debug-database.html` for complete system diagnosis
2. Check the console logs for error messages
3. Ensure MongoDB is running
4. Verify all dependencies are installed