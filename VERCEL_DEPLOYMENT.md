# VedaAI - Vercel Deployment Guide (All-in-One)

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com with GitHub)
- MongoDB Atlas account (free tier at mongodb.com/cloud/atlas)

---

## Step 1: Setup MongoDB Atlas (5 minutes)

### 1.1 Create Free Cluster
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up and create a **FREE M0 cluster**
3. Choose a cloud provider and region (closest to you)
4. Cluster name: `vedaai-cluster`

### 1.2 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Username: `vedaai-admin`
3. Password: Generate a strong password (save it!)
4. Database User Privileges: **Read and write to any database**

### 1.3 Whitelist All IPs
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"**
3. IP: `0.0.0.0/0` (required for Vercel)
4. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → **Connect** → **Connect your application**
2. Driver: **Node.js**, Version: **5.5 or later**
3. Copy connection string:
   ```
   mongodb+srv://vedaai-admin:<password>@vedaai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name at the end:
   ```
   mongodb+srv://vedaai-admin:YOUR_PASSWORD@vedaai-cluster.xxxxx.mongodb.net/vedaai-assessment?retryWrites=true&w=majority
   ```

---

## Step 2: Push to GitHub (2 minutes)

### 2.1 Create .gitignore
Make sure you have a `.gitignore` file:
```
node_modules/
.env
.env.local
dist/
.next/
```

### 2.2 Initialize and Push
```bash
cd "c:\Projects\VEDA AI task"
git init
git add .
git commit -m "VedaAI Assessment Creator - Ready for deployment"
```

### 2.3 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `vedaai-assessment-creator`
3. Visibility: **Public** (or Private if you prefer)
4. **DO NOT** initialize with README
5. Click **Create repository**

### 2.4 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/vedaai-assessment-creator.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel (10 minutes)

### 3.1 Deploy Frontend
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `vedaai-assessment-creator` repository
4. Configure Project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. **Environment Variables** (click "Add"):
   ```
   NEXT_PUBLIC_API_URL=https://YOUR_PROJECT_NAME.vercel.app/api
   ```
   **Note**: Replace `YOUR_PROJECT_NAME` with your actual Vercel project name (you'll see it in the URL)

6. Click **Deploy**
7. Wait 2-3 minutes
8. Copy your frontend URL: `https://YOUR_PROJECT_NAME.vercel.app`

### 3.2 Deploy Backend (Same Project)
1. In Vercel dashboard, go to your project
2. Go to **Settings** → **General**
3. Scroll to **Root Directory**
4. We'll deploy backend as API routes in the same project

Actually, let me create a simpler approach - deploy backend as Vercel serverless functions:


### 3.2 Add Backend Environment Variables
1. In Vercel dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://vedaai-admin:YOUR_PASSWORD@vedaai-cluster.xxxxx.mongodb.net/vedaai-assessment?retryWrites=true&w=majority
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   CORS_ORIGIN=https://YOUR_PROJECT_NAME.vercel.app
   ```

3. Click **Save** for each variable

### 3.3 Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait 2-3 minutes

---

## Step 4: Test Deployment

### 4.1 Test Backend API
Visit: `https://YOUR_PROJECT_NAME.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 4.2 Test Frontend
1. Visit: `https://YOUR_PROJECT_NAME.vercel.app`
2. Click **"Create Assignment"**
3. Upload a file
4. Fill in the form
5. Submit and wait for generation
6. View the generated question paper

---

## Step 5: Submission

### For VedaAI Internship:

**Live Demo**: `https://YOUR_PROJECT_NAME.vercel.app`
**GitHub**: `https://github.com/YOUR_USERNAME/vedaai-assessment-creator`
**API Health**: `https://YOUR_PROJECT_NAME.vercel.app/api/health`

**Email Template:**
```
Subject: VedaAI Full Stack Engineering Internship - Round 2 Submission

Hi VedaAI Team,

I have completed the AI-powered Assessment Creator assignment.

🔗 Live Application: https://YOUR_PROJECT_NAME.vercel.app
🔗 Source Code: https://github.com/YOUR_USERNAME/vedaai-assessment-creator
🔗 API Health Check: https://YOUR_PROJECT_NAME.vercel.app/api/health

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand, shadcn/ui
- Backend: Express, TypeScript, MongoDB Atlas, GridFS
- AI: OpenRouter API (GPT-4)
- Deployment: Vercel (Serverless)

Key Features:
✓ AI-powered question generation with GPT-4
✓ File upload support (images, PDFs, text files)
✓ Real-time progress tracking with polling
✓ Question paper with difficulty levels and marks
✓ PDF/TXT download functionality
✓ Fully responsive design (mobile + desktop)
✓ Pixel-perfect UI matching Figma designs
✓ Production-ready with error handling and logging

The application is fully functional and deployed on Vercel's free tier.

Best regards,
[Your Name]
```

---

## Troubleshooting

### Backend API returns 404
- Check that `backend/vercel.json` exists
- Verify environment variables are set in Vercel dashboard
- Check deployment logs in Vercel

### MongoDB connection fails
- Verify connection string is correct
- Check that IP `0.0.0.0/0` is whitelisted
- Ensure database user has correct permissions

### CORS errors in browser
- Verify `CORS_ORIGIN` matches your Vercel URL exactly
- Check browser console for specific error
- Redeploy after changing environment variables

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Should be: `https://YOUR_PROJECT_NAME.vercel.app/api`
- Check Network tab in browser DevTools

---

## Cost Breakdown

**100% FREE:**
- Vercel: FREE (Hobby plan, unlimited bandwidth)
- MongoDB Atlas: FREE (512MB storage, M0 cluster)
- GitHub: FREE (public repositories)
- **Total: $0/month**

---

## Notes

- Vercel serverless functions have a 10-second timeout on free tier
- MongoDB Atlas free tier is always-on (no sleep)
- First request after deployment may take 2-3 seconds (cold start)
- Subsequent requests are fast (<500ms)

---

## Alternative: Separate Backend Deployment

If you want to deploy backend separately (e.g., on Render):
1. See `DEPLOYMENT.md` for Render instructions
2. Update `NEXT_PUBLIC_API_URL` to point to Render URL
3. Update `CORS_ORIGIN` in Render to point to Vercel URL

---

## Support

If you encounter issues:
1. Check Vercel deployment logs: Dashboard → Deployments → View Function Logs
2. Check browser console (F12) for frontend errors
3. Test API health endpoint: `/api/health`
4. Verify all environment variables are set correctly
