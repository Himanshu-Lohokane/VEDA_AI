# 🚀 Quick Start - Deploy in 15 Minutes

## What You Need
1. GitHub account
2. Vercel account (free - sign up with GitHub)
3. MongoDB Atlas account (free)
4. OpenRouter API key

---

## Step-by-Step (15 minutes)

### 1. MongoDB Atlas (5 min)
1. Go to https://mongodb.com/cloud/atlas/register
2. Create FREE cluster
3. Create database user (save password!)
4. Network Access → Add IP → Allow from Anywhere (`0.0.0.0/0`)
5. Copy connection string, replace `<password>`, add `/vedaai-assessment` at end

**Result**: `mongodb+srv://user:pass@cluster.mongodb.net/vedaai-assessment`

---

### 2. Push to GitHub (2 min)
```powershell
cd "c:\Projects\VEDA AI task"
git init
git add .
git commit -m "VedaAI Assessment Creator"
```

Go to https://github.com/new → Create repository → Copy commands:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/vedaai-assessment-creator.git
git branch -M main
git push -u origin main
```

---

### 3. Deploy to Vercel (8 min)

#### 3.1 Import (2 min)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **IMPORTANT**: Set Root Directory to `frontend`

#### 3.2 Environment Variables (3 min)
Add these 5 variables:
```
NEXT_PUBLIC_API_URL=https://YOUR_PROJECT.vercel.app/api
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vedaai-assessment
OPENROUTER_API_KEY=your_key_here
CORS_ORIGIN=https://YOUR_PROJECT.vercel.app
NODE_ENV=production
```

#### 3.3 Deploy (1 min)
Click "Deploy" → Wait 2-3 minutes

#### 3.4 Update URLs (2 min)
1. Copy your Vercel URL (e.g., `https://vedaai-abc123.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to `https://vedaai-abc123.vercel.app/api`
4. Update `CORS_ORIGIN` to `https://vedaai-abc123.vercel.app`
5. Go to Deployments → Redeploy

---

## ✅ Test It

1. Visit: `https://YOUR_PROJECT.vercel.app/api/health`
   - Should show: `{"status":"ok","database":"connected"}`

2. Visit: `https://YOUR_PROJECT.vercel.app`
   - Click "Create Assignment"
   - Upload a file
   - Generate questions
   - View question paper

---

## 📤 Submit

**Live Demo**: `https://YOUR_PROJECT.vercel.app`  
**GitHub**: `https://github.com/YOUR_USERNAME/vedaai-assessment-creator`  
**API Health**: `https://YOUR_PROJECT.vercel.app/api/health`

---

## 🆘 Problems?

### API returns 404
- Check Root Directory is set to `frontend` in Vercel

### Database won't connect
- Verify MongoDB URI is correct
- Check IP whitelist includes `0.0.0.0/0`

### CORS errors
- Make sure `CORS_ORIGIN` matches your Vercel URL exactly
- Redeploy after changing environment variables

### Need detailed help?
See `VERCEL_DEPLOYMENT.md` or `DEPLOYMENT_CHECKLIST.md`

---

**That's it! You're deployed! 🎉**
