# LinkedIn Certifications Integration Setup Guide

## Why LinkedIn Integration is Different from GitHub

Unlike GitHub's public API, LinkedIn requires:
- **OAuth 2.0 authentication** (can't be done directly in browser)
- **API keys** that must be kept secret (server-side only)
- **LinkedIn Developer Application** registration and approval
- **Server-side implementation** for security

## Option 1: Serverless Function (Recommended for Static Sites)

### Using Vercel

1. Create a folder `api` in your project root
2. Create `api/fetch-linkedin-certifications.js`:

```javascript
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // Get LinkedIn access token from environment variable
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.json({ 
        success: false, 
        message: 'LinkedIn token not configured' 
      });
    }
    
    // Fetch certifications from LinkedIn API
    const response = await fetch(
      'https://api.linkedin.com/v2/people/(id:YOUR_PROFILE_ID)/certifications',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ success: true, certifications: data.elements });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

3. Add environment variable in Vercel dashboard:
   - `LINKEDIN_ACCESS_TOKEN` - Your LinkedIn OAuth token

### Using Netlify

1. Create `netlify/functions/fetch-linkedin-certifications.js`
2. Use similar code structure (see `fetch-linkedin-certifications.js` file)

## Option 2: Get LinkedIn OAuth Token

### Steps:

1. **Register your application** at https://www.linkedin.com/developers/apps
2. **Create an app** and note:
   - Client ID
   - Client Secret
3. **Request OAuth permissions**:
   - `r_liteprofile` (read basic profile)
   - `r_member_social` (read certifications/licenses)
4. **Get access token** using OAuth 2.0 flow
5. **Store token securely** (environment variables, not in code!)

### OAuth Flow Example (Node.js):

```javascript
const express = require('express');
const fetch = require('node-fetch');
const app = express();

const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = 'http://localhost:3000/auth/linkedin/callback';

// Step 1: Redirect to LinkedIn authorization
app.get('/auth/linkedin', (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=r_liteprofile%20r_member_social`;
  res.redirect(authUrl);
});

// Step 2: Handle callback and exchange code for token
app.get('/auth/linkedin/callback', async (req, res) => {
  const { code } = req.query;
  
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  
  const tokenData = await tokenResponse.json();
  // Store token securely (database, environment variable, etc.)
  console.log('Access Token:', tokenData.access_token);
  
  res.send('Token received! Check server logs.');
});
```

## Option 3: Manual Sync (Current Implementation)

The current implementation uses `certifications.json` file which you can manually update whenever you add certifications to LinkedIn.

**Advantages:**
- ✅ No API setup required
- ✅ Works with static hosting
- ✅ Full control over displayed data
- ✅ No rate limits

**Disadvantages:**
- ❌ Requires manual updates
- ❌ Not automatically synced

### To Sync Manually:

1. Go to your LinkedIn profile
2. Navigate to "Licenses & Certifications" section
3. For each certification, add to `certifications.json`:
   - Title
   - Organization
   - Image URL (certification badge)
   - Issue date
   - Credential ID
   - Credential URL (if available)

## Option 4: Use a Third-Party Service

Services like RapidAPI or Apify offer LinkedIn profile scraping services, but:
- May violate LinkedIn's Terms of Service
- Usually require payment
- Less reliable than official API

## Current Status

The code is set up to:
1. ✅ Try to fetch from `/api/linkedin-certifications` endpoint first
2. ✅ Fall back to `certifications.json` if API is not available
3. ✅ Display certifications beautifully with images and details

**Your portfolio will work with the JSON file right now!** You can set up the LinkedIn API integration later if you want automatic syncing.

## Quick Start (Use JSON File)

Just edit `certifications.json` with your actual certifications from LinkedIn. The section will automatically display them!

```json
[
  {
    "title": "Your Certification Name",
    "organization": "Issuing Organization",
    "image": "https://example.com/cert-badge.png",
    "issueDate": "2024-01-15",
    "credentialId": "ABC-123-XYZ",
    "credentialUrl": "https://www.credly.com/badges/...",
    "color": "#FF9900"
  }
]
```

