# 🔧 Resume Upload & View Fix Guide

## Issue: Resume upload/viewing not working properly

### Step 1: Test the System
1. **Open `test-resume-upload.html`** in your browser
2. **Follow the steps** in order:
   - Login as student
   - Check resume status
   - Upload a PDF resume
   - Test resume viewing
   - Test faculty access

### Step 2: Common Issues & Solutions

#### Issue A: "No file uploaded" error
**Cause:** File not being sent properly
**Solution:**
- Make sure you select a PDF file
- Check file size (must be < 5MB)
- Check browser console for errors

#### Issue B: "Resume not found" when viewing
**Cause:** File not saved to server or wrong path
**Solution:**
1. Check if `backend/uploads/resumes/` directory exists
2. Check server console logs for upload errors
3. Verify file permissions on uploads directory

#### Issue C: Faculty can't see student resumes
**Cause:** Student hasn't uploaded resume or profile not complete
**Solution:**
1. Student must upload resume first
2. Student must complete profile
3. Faculty must refresh the student list

### Step 3: Manual Verification

#### Check Backend Uploads Directory:
```bash
# Navigate to backend directory
cd backend

# Check if uploads directory exists
ls -la uploads/resumes/

# If directory doesn't exist, create it
mkdir -p uploads/resumes
chmod 755 uploads/resumes
```

#### Check Server Logs:
1. **Start backend server** with logging
2. **Watch console** for upload/serve messages
3. **Look for errors** during file operations

### Step 4: Test Resume Upload Process

#### As Student:
1. **Login** as student (`student@test.com` / `student123`)
2. **Go to Profile** page (`/profile`)
3. **Scroll to Resume Upload** section
4. **Select a PDF file** (< 5MB)
5. **Click upload** and wait for success message
6. **Save profile** to complete

#### As Faculty:
1. **Login** as faculty (`faculty@test.com` / `faculty123`)
2. **Go to Faculty Dashboard**
3. **Look for students** with "📄 Resume" badge
4. **Click eye icon** to view detailed profile
5. **Check Resume section** - should show PDF viewer

### Step 5: Debug Checklist

- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 3000/5173
- [ ] Student logged in successfully
- [ ] PDF file selected (not other formats)
- [ ] File size under 5MB
- [ ] Upload directory exists and writable
- [ ] No CORS errors in browser console
- [ ] Student profile exists in database
- [ ] Faculty user exists and can login

### Step 6: Expected Behavior

#### Successful Upload:
1. **Student uploads PDF** → Gets success message
2. **Profile shows resume** → "Resume Uploaded" status
3. **Faculty views student** → Can see resume in modal
4. **PDF displays** → Either embedded or opens in new tab

#### Resume Viewing:
1. **Faculty clicks eye icon** → Opens detailed modal
2. **Resume section shows** → PDF viewer or download link
3. **"Show Resume Here" button** → Toggles embedded viewer
4. **"View Resume (New Tab)"** → Opens PDF in new window

### Step 7: Troubleshooting Commands

#### Check if files are being uploaded:
```bash
# In backend directory
find uploads/resumes/ -name "*.pdf" -ls
```

#### Check server permissions:
```bash
# Make sure uploads directory is writable
chmod -R 755 uploads/
```

#### Test direct file access:
```
# Try accessing resume directly in browser
http://localhost:5001/api/upload/resume/FILENAME.pdf
```

### Step 8: If Still Not Working

1. **Use the test tool** (`test-resume-upload.html`) to identify exact issue
2. **Check browser Network tab** for failed requests
3. **Check server console** for error messages
4. **Verify file system permissions**
5. **Try with a different PDF file**

The system should work correctly after following these steps!