# Vercel Multi-Service Deployment Guide

## ✅ Updated Configuration

Your `vercel.json` is now configured for **Vercel's experimental multi-service deployment**:

```json
{
  "experimentalServices": {
    "frontend": {
      "root": "frontend",
      "routePrefix": "/",
      "framework": "nextjs"
    },
    "backend": {
      "root": "backend",
      "routePrefix": "/api"
    }
  }
}
```

This means:
- **Frontend** (Next.js) serves from `/` (root)
- **Backend** (Express API) serves from `/api`
- Both deployed in the same Vercel project

---

## 🚀 Deployment Steps

### 1. Setup MongoDB Atlas (5 minutes)

1. Go to https://mongodb.com/cloud/atlas/register
2. Create a **FREE M0 cluster**
3. Create database user:
   - Username: `vedaai-admin`
   - Password: (generate strong password - save it!)
4. Network Access → Add IP Address → **Allow from Anywhere** (`0.0.0.0/0`)
5. Get connection string:
   ```
   mongodb+srv://vedaai-admin:YOUR_PASSWORD@cluster.mongodb.net/vedaai-assessment?retryWrites=true&w=majority
   ```

---

### 2. Deploy to Vercel (10 minutes)

#### Step 1: Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `Himanshu-Lohokane/VEDA_AI`
4. Click **"Import"**

#### Step 2: Configure Project
Vercel will auto-detect the multi-service setup from `vercel.json`.

**DO NOT change the Root Directory** - leave it empty (Vercel will use the config from vercel.json)

#### Step 3: Add Environment Variables
Click **"Environment Variables"** and add these **5 variables**:

```
NEXT_PUBLIC_API_URL=https://YOUR_PROJECT_NAME.vercel.app/api
MONGODB_URI=mongodb+srv://vedaai-admin:YOUR_PASSWORD@cluster.mongodb.net/vedaai-assessment
OPENROUTER_API_KEY=your_openrouter_api_key_here
CORS_ORIGIN=https://YOUR_PROJECT_NAME.vercel.app
NODE_ENV=production
```

⚠️ **IMPORTANT**: 
- Replace `YOUR_PROJECT_NAME` with your actual Vercel project name (you'll see it in the URL)
- Replace `YOUR_PASSWORD` with your MongoDB password
- Replace `your_openrouter_api_key_here` with your actual OpenRouter API key

#### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment
3. Copy your Vercel URL (e.g., `https://veda-ai-abc123.vercel.app`)

#### Step 5: Update Environment Variables with Real URL
1. Go to **Settings** → **Environment Variables**
2. Update these 2 variables with your actual Vercel URL:
   - `NEXT_PUBLIC_API_URL` → `https://veda-ai-abc123.vercel.app/api`
   - `CORS_ORIGIN` → `https://veda-ai-abc123.vercel.app`
3. Click **"Save"**

#### Step 6: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ Test Your Deployment

### Test 1: API Health Check
Visit: `https://YOUR_PROJECT.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test 2: Frontend
Visit: `https://YOUR_PROJECT.vercel.app`

You should see the home page with "Create Assignment" button.

### Test 3: Full Flow
1. Click "Create Assignment"
2. Upload a test file (image or PDF)
3. Fill in the form
4. Click "Generate Assessment"
5. Wait for progress
6. View generated question paper

---

## 📤 Submission Information

**Live Application**: `https://YOUR_PROJECT.vercel.app`  
**GitHub Repository**: `https://github.com/Himanshu-Lohokane/VEDA_AI`  
**API Health Check**: `https://YOUR_PROJECT.vercel.app/api/health`

### Email Template for VedaAI:

```
Subject: VedaAI Full Stack Engineering Internship - Round 2 Submission

Hi VedaAI Team,

I have completed the AI-powered Assessment Creator assignment.

🔗 Live Application: https://YOUR_PROJECT.vercel.app
🔗 Source Code: https://github.com/Himanshu-Lohokane/VEDA_AI
🔗 API Health Check: https://YOUR_PROJECT.vercel.app/api/health

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand, shadcn/ui
- Backend: Express, TypeScript, MongoDB Atlas, GridFS
- AI: OpenRouter API (GPT-4)
- Deployment: Vercel Multi-Service (Experimental)

Key Features:
✓ AI-powered question generation with GPT-4
✓ File upload support (images, PDFs, text files)
✓ Real-time progress tracking
✓ Question paper with difficulty levels and marks
✓ PDF/TXT download functionality
✓ Fully responsive design (mobile + desktop)
✓ Pixel-perfect UI matching Figma designs
✓ Production-ready with error handling and logging

The application is fully functional and deployed on Vercel's free tier using their experimental multi-service feature.

Best regards,
Himanshu Lohokane
```

---

## 🐛 Troubleshooting

### Issue: "experimentalServices is not supported"
**Solution**: This is a newer Vercel feature. If you see this error:
1. Contact Vercel support to enable experimental features
2. OR use the alternative deployment (separate frontend/backend)

### Issue: Backend API returns 404
**Solution**:
- Verify `vercel.json` is in the root directory
- Check that `backend/vercel.json` exists
- Verify environment variables are set
- Check deployment logs in Vercel dashboard

### Issue: MongoDB connection fails
**Solution**:
- Verify connection string is correct
- Check that IP `0.0.0.0/0` is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions
- Test connection string locally first

### Issue: CORS errors
**Solution**:
- Verify `CORS_ORIGIN` matches your Vercel URL exactly (no trailing slash)
- Check browser console for specific error
- Redeploy after changing environment variables

### Issue: Frontend can't reach backend
**Solution**:
- Verify `NEXT_PUBLIC_API_URL` ends with `/api`
- Should be: `https://YOUR_PROJECT.vercel.app/api`
- Check Network tab in browser DevTools (F12)
- Verify backend is deployed (check `/api/health`)

---

## 💰 Cost

**100% FREE:**
- Vercel: FREE (Hobby plan)
- MongoDB Atlas: FREE (512MB, M0 cluster)
- GitHub: FREE
- **Total: $0/month**

---

## 📝 Notes

- Vercel's `experimentalServices` feature is in beta
- First request after deployment may take 2-3 seconds (cold start)
- Subsequent requests are fast (<500ms)
- MongoDB Atlas free tier is always-on (no sleep)
- Vercel free tier has 10-second timeout for serverless functions

---

## 🎉 You're Ready!

Your code is on GitHub and ready to deploy. Follow the steps above and you'll have a live application in ~15 minutes!

**GitHub**: https://github.com/Himanshu-Lohokane/VEDA_AI  
**Vercel**: https://vercel.com/new

Good luck with your submission! 🚀
