# Cloudinary Setup Guide

This guide will help you set up Cloudinary for PDF resume uploads in the Placement Portal.

## What is Cloudinary?

Cloudinary is a cloud-based service that provides image and video management capabilities. We use it to store PDF resume files securely in the cloud instead of on the local server.

## Benefits of Using Cloudinary

- **Scalable Storage**: No need to worry about server disk space
- **Global CDN**: Fast file delivery worldwide
- **Secure URLs**: Direct secure links to files
- **Automatic Backups**: Files are safely stored in the cloud
- **Easy Management**: Web dashboard to manage all uploads

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Cloudinary Credentials

1. After logging in, go to your Dashboard
2. You'll see your account details:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your public API key
   - **API Secret**: Your private API secret (keep this secure!)

### 3. Configure Environment Variables

Update your `.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

**Important**: Replace the placeholder values with your actual Cloudinary credentials.

### 4. Test the Configuration

1. Start your backend server:
   ```bash
   npm run server
   ```

2. Check the server logs for Cloudinary connection status:
   - ✅ Success: "Cloudinary connection successful"
   - ❌ Error: "Cloudinary connection failed"

3. Test the API endpoint:
   ```
   GET http://localhost:5001/api/upload/cloudinary-status
   ```

## File Upload Process

With Cloudinary configured, the resume upload process works as follows:

1. **Student uploads PDF**: File is sent to the server
2. **Server processes**: File is validated (PDF only, max 10MB)
3. **Cloudinary upload**: File is uploaded to Cloudinary cloud storage
4. **Database update**: Cloudinary URL is saved to student profile
5. **Response**: Student receives confirmation with file URL

## File Storage Structure

Files are organized in Cloudinary as:
```
placement-portal/
└── resumes/
    ├── resume_[userId]_[timestamp].pdf
    ├── resume_[userId]_[timestamp].pdf
    └── ...
```

## Security Features

- **Authentication Required**: Only logged-in students can upload
- **File Type Validation**: Only PDF files are accepted
- **Size Limits**: Maximum 10MB per file
- **Unique Filenames**: Prevents conflicts and overwrites
- **Secure URLs**: Direct HTTPS links from Cloudinary

## Troubleshooting

### Connection Issues

If you see "Cloudinary connection failed":

1. **Check credentials**: Verify your `.env` file has correct values
2. **No spaces**: Ensure no extra spaces in credential values
3. **Restart server**: Restart after changing `.env` file
4. **Network**: Check your internet connection

### Upload Failures

If uploads fail:

1. **File size**: Ensure PDF is under 10MB
2. **File type**: Only PDF files are supported
3. **Cloudinary quota**: Check if you've exceeded free tier limits
4. **Server logs**: Check console for detailed error messages

### Common Error Messages

- `"File upload service unavailable"`: Cloudinary connection failed
- `"Only PDF files are allowed"`: Wrong file type uploaded
- `"File too large"`: PDF exceeds 10MB limit
- `"Cloudinary error: 401"`: Invalid API credentials

## Free Tier Limits

Cloudinary free tier includes:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month

This is typically sufficient for a college placement portal.

## Support

If you need help:
1. Check the [Cloudinary Documentation](https://cloudinary.com/documentation)
2. Test your setup using the `/api/upload/test` endpoint
3. Check server logs for detailed error messages
4. Verify your `.env` configuration

## Security Best Practices

1. **Never commit `.env`**: Keep credentials out of version control
2. **Use environment variables**: Don't hardcode credentials
3. **Rotate keys**: Periodically update your API keys
4. **Monitor usage**: Keep track of your Cloudinary usage