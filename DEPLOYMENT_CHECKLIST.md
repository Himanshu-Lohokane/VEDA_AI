# 🚀 Deployment Checklist - VedaAI Assessment Creator

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Created free M0 cluster
- [ ] Created database user with read/write permissions
- [ ] Whitelisted IP `0.0.0.0/0` (allow from anywhere)
- [ ] Copied connection string
- [ ] Replaced `<password>` in connection string
- [ ] Added database name: `/vedaai-assessment`

### 2. OpenRouter API
- [ ] Have OpenRouter API key
- [ ] Tested API key locally
- [ ] Key has sufficient credits

### 3. GitHub Repository
- [ ] Created GitHub repository
- [ ] Repository is public (or private if preferred)
- [ ] Pushed all code to `main` branch

### 4. Environment Variables Ready
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `OPENROUTER_API_KEY` - OpenRouter API key
- [ ] `NEXT_PUBLIC_API_URL` - Will be Vercel URL + `/api`
- [ ] `CORS_ORIGIN` - Will be Vercel URL
- [ ] `NODE_ENV=production`

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub (5 minutes)
```powershell
# Run this in PowerShell
cd "c:\Projects\VEDA AI task"
.\deploy.ps1
```

Or manually:
```bash
git init
git add .
git commit -m "VedaAI Assessment Creator - Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/vedaai-assessment-creator.git
git branch -M main
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] Repository is accessible

### Step 2: Deploy to Vercel (10 minutes)

#### 2.1 Import Project
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Click "Import"

- [ ] Repository imported

#### 2.2 Configure Project
- **Framework Preset**: Next.js ✅ (auto-detected)
- **Root Directory**: `frontend` ⚠️ (IMPORTANT!)
- **Build Command**: `npm run build` ✅ (auto)
- **Output Directory**: `.next` ✅ (auto)
- **Install Command**: `npm install` ✅ (auto)

- [ ] Root directory set to `frontend`

#### 2.3 Add Environment Variables
Click "Environment Variables" and add:

```
NEXT_PUBLIC_API_URL=https://YOUR_PROJECT_NAME.vercel.app/api
MONGODB_URI=mongodb+srv://vedaai-admin:PASSWORD@cluster.mongodb.net/vedaai-assessment
OPENROUTER_API_KEY=sk-or-v1-xxxxx
CORS_ORIGIN=https://YOUR_PROJECT_NAME.vercel.app
NODE_ENV=production
```

⚠️ **IMPORTANT**: Replace `YOUR_PROJECT_NAME` with actual Vercel project name

- [ ] All 5 environment variables added
- [ ] MongoDB URI is correct
- [ ] OpenRouter key is correct

#### 2.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your Vercel URL

- [ ] Deployment successful
- [ ] Copied Vercel URL

#### 2.5 Update Environment Variables
1. Go to Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` with actual Vercel URL + `/api`
3. Update `CORS_ORIGIN` with actual Vercel URL
4. Click "Save"

- [ ] Environment variables updated with real URLs

#### 2.6 Redeploy
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

- [ ] Redeployed with correct URLs

---

## 🧪 Testing Deployment

### Test 1: API Health Check
Visit: `https://YOUR_PROJECT.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

- [ ] API health check returns "ok"
- [ ] Database shows "connected"

### Test 2: Frontend Loads
Visit: `https://YOUR_PROJECT.vercel.app`

- [ ] Home page loads
- [ ] No console errors (F12)
- [ ] "Create Assignment" button visible

### Test 3: Create Assessment
1. Click "Create Assignment"
2. Upload a test file (image or PDF)
3. Fill in the form:
   - Due date: Any future date
   - Question types: Select 2-3 types
   - Number of questions: 9
   - Marks per question: 3
4. Click "Generate Assessment"

- [ ] File uploads successfully
- [ ] Form submits without errors
- [ ] Redirects to progress page

### Test 4: Progress Tracking
- [ ] Progress page shows loading animation
- [ ] Progress updates (0% → 40% → 75% → 100%)
- [ ] Redirects to question paper when complete

### Test 5: Question Paper
- [ ] Question paper displays
- [ ] Shows correct number of questions
- [ ] Difficulty badges show (Easy, Moderate, Hard)
- [ ] Marks display correctly
- [ ] Student info fields are editable

### Test 6: Download
1. Click "Download PDF" button

- [ ] File downloads successfully
- [ ] File contains question paper content

### Test 7: Regenerate
1. Click "Regenerate" button
2. Wait for new generation

- [ ] Regeneration works
- [ ] New questions are different

---

## 📋 Submission Checklist

### URLs to Submit
- [ ] Live Application: `https://YOUR_PROJECT.vercel.app`
- [ ] GitHub Repository: `https://github.com/YOUR_USERNAME/vedaai-assessment-creator`
- [ ] API Health: `https://YOUR_PROJECT.vercel.app/api/health`

### Documentation
- [ ] README.md updated with live URLs
- [ ] Screenshots/video demo (optional but recommended)
- [ ] All features working

### Email/Form Submission
- [ ] Included all 3 URLs
- [ ] Described tech stack
- [ ] Listed key features
- [ ] Mentioned deployment platform (Vercel)

---

## 🐛 Troubleshooting

### Issue: API returns 404
**Solution**:
- Check that `backend/vercel.json` exists
- Verify `api/[...path].ts` exists
- Check Vercel deployment logs

### Issue: Database connection fails
**Solution**:
- Verify MongoDB URI is correct
- Check IP whitelist includes `0.0.0.0/0`
- Test connection string locally first

### Issue: CORS errors
**Solution**:
- Verify `CORS_ORIGIN` matches Vercel URL exactly
- No trailing slash in URL
- Redeploy after changing env vars

### Issue: Frontend can't reach backend
**Solution**:
- Check `NEXT_PUBLIC_API_URL` is correct
- Should end with `/api`
- Check browser Network tab for actual URL being called

### Issue: File upload fails
**Solution**:
- Check file size (max 10MB)
- Verify file type (JPEG, PNG, PDF, TXT only)
- Check backend logs in Vercel

---

## 📞 Support

If stuck:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Test API health endpoint
4. Verify all environment variables

---

## ✅ Final Checklist

- [ ] Application deployed and accessible
- [ ] All features tested and working
- [ ] URLs ready for submission
- [ ] README updated
- [ ] Submission email/form prepared

**Ready to submit! 🎉**
