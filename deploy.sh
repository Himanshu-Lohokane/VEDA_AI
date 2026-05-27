#!/bin/bash

# VedaAI Assessment Creator - Deployment Script

echo "🚀 VedaAI Assessment Creator - Deployment"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - VedaAI Assessment Creator"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if remote is set
if ! git remote | grep -q "origin"; then
    echo ""
    echo "❓ Enter your GitHub repository URL:"
    echo "   Example: https://github.com/username/vedaai-assessment-creator.git"
    read -p "URL: " REPO_URL
    
    git remote add origin "$REPO_URL"
    echo "✅ Remote added"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Ready for deployment" || echo "No changes to commit"
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Set Root Directory to: frontend"
echo "4. Add environment variables:"
echo "   - NEXT_PUBLIC_API_URL=https://YOUR_PROJECT.vercel.app/api"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - OPENROUTER_API_KEY=your_openrouter_key"
echo "   - CORS_ORIGIN=https://YOUR_PROJECT.vercel.app"
echo "5. Click Deploy!"
echo ""
echo "📖 See VERCEL_DEPLOYMENT.md for detailed instructions"
