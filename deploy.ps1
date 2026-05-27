# VedaAI Assessment Creator - Deployment Script (PowerShell)

Write-Host "🚀 VedaAI Assessment Creator - Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - VedaAI Assessment Creator"
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Check if remote is set
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host ""
    Write-Host "❓ Enter your GitHub repository URL:" -ForegroundColor Yellow
    Write-Host "   Example: https://github.com/username/vedaai-assessment-creator.git" -ForegroundColor Gray
    $repoUrl = Read-Host "URL"
    
    git remote add origin $repoUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Ready for deployment" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "No changes to commit" -ForegroundColor Gray
}
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com/new"
Write-Host "2. Import your GitHub repository"
Write-Host "3. Set Root Directory to: frontend"
Write-Host "4. Add environment variables:"
Write-Host "   - NEXT_PUBLIC_API_URL=https://YOUR_PROJECT.vercel.app/api"
Write-Host "   - MONGODB_URI=your_mongodb_connection_string"
Write-Host "   - OPENROUTER_API_KEY=your_openrouter_key"
Write-Host "   - CORS_ORIGIN=https://YOUR_PROJECT.vercel.app"
Write-Host "5. Click Deploy!"
Write-Host ""
Write-Host "📖 See VERCEL_DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow
