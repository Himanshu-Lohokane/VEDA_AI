# VedaAI Assessment Creator - Deployment Guide

## Quick Deployment (Free Tier)

### Prerequisites
- GitHub account
- Vercel account (sign up with GitHub at vercel.com)
- Render account (sign up with GitHub at render.com)

---

## Step 1: Prepare Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - VedaAI Assessment Creator"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `vedaai-assessment-creator`)
3. **DO NOT** initialize with README (we already have code)
4. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/vedaai-assessment-creator.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create MongoDB Atlas Database (Free)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster (M0 Sandbox - FREE)
3. Create a database user (username + password)
4. Whitelist all IPs: `0.0.0.0/0` (for Render to connect)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/vedaai-assessment`

### 2.2 Deploy Backend on Render
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `vedaai-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: `Free`

5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedaai-assessment
   OPENROUTER_API_KEY=your_openrouter_key_here
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
   
   **Note**: You'll update `CORS_ORIGIN` after deploying frontend

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. Copy your backend URL: `https://vedaai-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://vedaai-backend.onrender.com
   ```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. Copy your frontend URL: `https://vedaai-assessment.vercel.app`

### 3.2 Update Backend CORS
1. Go back to Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://vedaai-assessment.vercel.app
   ```
5. Save (backend will auto-redeploy)

---

## Step 4: Test Deployment

1. Visit your Vercel URL: `https://vedaai-assessment.vercel.app`
2. Try creating an assessment
3. Upload a file and generate questions
4. Verify everything works

---

## Step 5: Submission

### For VedaAI Internship Submission:

**Include these links:**
- **Live Demo**: `https://vedaai-assessment.vercel.app`
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/vedaai-assessment-creator`
- **Backend API**: `https://vedaai-backend.onrender.com/health`

**In your submission email/form:**
```
Live Application: https://vedaai-assessment.vercel.app
Source Code: https://github.com/YOUR_USERNAME/vedaai-assessment-creator
API Health Check: https://vedaai-backend.onrender.com/health

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand
- Backend: Express, TypeScript, MongoDB, GridFS
- AI: OpenRouter API (GPT-4)
- Deployment: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

Features:
✓ AI-powered question generation
✓ File upload (images, PDFs, text)
✓ Real-time progress tracking
✓ Question paper with difficulty levels
✓ PDF download
✓ Responsive design (mobile + desktop)
✓ Pixel-perfect UI matching Figma designs
```

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify `CORS_ORIGIN` in Render backend
- Check browser console for CORS errors

### MongoDB connection fails
- Verify IP whitelist includes `0.0.0.0/0`
- Check username/password in connection string
- Ensure database user has read/write permissions

### Render free tier sleeps after 15 minutes
- First request after sleep takes 30-60 seconds to wake up
- This is normal for free tier
- Upgrade to paid tier ($7/month) for always-on

---

## Alternative: Docker Deployment

If you prefer Docker, see `docker-compose.yml` in the root directory.

```bash
# Build and run with Docker
docker-compose up -d

# Access at http://localhost:3000
```

---

## Cost Breakdown

**Free Tier (Recommended for Submission):**
- Vercel: FREE (Hobby plan)
- Render: FREE (750 hours/month, sleeps after 15min inactivity)
- MongoDB Atlas: FREE (512MB storage)
- **Total: $0/month**

**Production Tier (If you want always-on):**
- Vercel: FREE (Hobby plan)
- Render: $7/month (always-on)
- MongoDB Atlas: FREE (512MB) or $9/month (2GB)
- **Total: $7-16/month**

---

## Notes

- **Render free tier** sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- For demo purposes, this is acceptable
- MongoDB Atlas free tier is always-on (no sleep)
- Vercel free tier is always-on (no sleep)

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console (F12) for frontend errors
4. Test backend health: `https://your-backend.onrender.com/health`
