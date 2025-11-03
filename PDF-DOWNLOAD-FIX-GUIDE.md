# 🔧 PDF Download & Viewing Fix Guide

## Issue: PDF not downloading and cannot be viewed

### Step 1: Test the Backend Server
1. **Open `test-pdf-direct.html`** in your browser
2. **Click "Login & Get Resume URL"** - This will test if the backend is working
3. **Check the console** for any error messages

### Step 2: Verify Upload System
1. **Go to**: `http://localhost:5001/api/upload/test`
2. **Check the response** - Should show upload directory info and files
3. **Look for**:
   - `dirExists: true`
   - `fileCount: > 0` (if you have uploaded files)
   - List of uploaded files with URLs

### Step 3: Test PDF Access
1. **In the test tool**, click "Test Direct Access"
2. **Should show**:
   - Status: 200 OK
   - Content-Type: application/pdf
   - PDF Header: %PDF ✅
   - File size in KB

### Step 4: Test Download
1. **Click "Test Download"** in the test tool
2. **Should trigger** browser download
3. **Check** your Downloads folder for the PDF file

## Common Issues & Solutions

### Issue A: "Upload directory not found"
**Solution:**
```bash
# Create the directory manually
mkdir -p backend/uploads/resumes
chmod 755 backend/uploads/resumes
```

### Issue B: "CORS error" in browser console
**Solution:** Already fixed in server.js with proper CORS headers

### Issue C: "File not found" but file exists
**Solution:** Check file permissions
```bash
# Fix file permissions
chmod 644 backend/uploads/resumes/*
```

### Issue D: PDF shows as corrupted
**Solution:** 
1. Check if the uploaded file is actually a valid PDF
2. Try uploading a new PDF file
3. Check server logs for upload errors

## Testing Checklist

- [ ] Backend server running on port 5001
- [ ] Upload test endpoint returns success
- [ ] Student can login successfully
- [ ] Resume upload works without errors
- [ ] PDF URL is accessible (returns 200 OK)
- [ ] PDF header shows "%PDF"
- [ ] Download triggers browser download
- [ ] Downloaded file opens in PDF viewer

## Expected Behavior After Fix

### ✅ What Should Work:
1. **Upload**: Student uploads PDF → Success message
2. **View URL**: Direct PDF URL opens in browser
3. **Download**: Download button saves PDF to computer
4. **Faculty View**: Faculty can see and download student PDFs

### 🔧 Debug Commands:

#### Check if backend is running:
```bash
curl http://localhost:5001/api/upload/test
```

#### Check specific PDF file:
```bash
curl -I http://localhost:5001/api/upload/resume/FILENAME.pdf
```

#### Check uploads directory:
```bash
ls -la backend/uploads/resumes/
```

## If Still Not Working:

1. **Restart backend server** - Stop and start again
2. **Clear browser cache** - Hard refresh (Ctrl+F5)
3. **Check browser console** - Look for error messages
4. **Try different browser** - Test in Chrome, Firefox, etc.
5. **Check antivirus/firewall** - May block file downloads

The fix should resolve PDF viewing and downloading issues!