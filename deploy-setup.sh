#!/bin/bash

# ========================================
# BPS Website - Quick Deployment Setup
# ========================================

echo "🚀 BPS Website - Deployment Setup"
echo "===================================="
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed."
    echo "Please install Git first:"
    echo "  - macOS: Git should be pre-installed, or run: brew install git"
    echo "  - Windows: Download from https://git-scm.com/"
    echo ""
    exit 1
fi

echo "✅ Git is installed: $(git --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the bps-website directory:"
    echo "  cd /Users/ramonsuarez/Desktop/BPS/bps-website"
    echo "  bash deploy-setup.sh"
    echo ""
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check if Git is already initialized
if [ -d ".git" ]; then
    echo "✅ Git already initialized"
else
    echo "📦 Initializing Git..."
    git init
    echo "✅ Git initialized"
fi
echo ""

# Check if remote exists
if git remote -v | grep -q "origin"; then
    echo "✅ Git remote already configured:"
    git remote -v
else
    echo "⚠️  Git remote not configured yet"
    echo ""
    echo "Next steps:"
    echo "1. Create a repository on GitHub: https://github.com/new"
    echo "2. Run these commands (replace YOUR-USERNAME with your GitHub username):"
    echo ""
    echo "   git remote add origin https://github.com/YOUR-USERNAME/bps-certification-website.git"
    echo "   git branch -M main"
    echo "   git add ."
    echo "   git commit -m \"Initial commit - BPS Website\""
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "=========================================="
echo "📝 NEXT STEPS:"
echo "=========================================="
echo ""
echo "1. Create GitHub Account (if you don't have one):"
echo "   https://github.com"
echo ""
echo "2. Create new repository:"
echo "   https://github.com/new"
echo "   Name: bps-certification-website"
echo ""
echo "3. Push your code to GitHub (commands above)"
echo ""
echo "4. Deploy to Vercel:"
echo "   https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Import your repository"
echo "   - Click Deploy"
echo ""
echo "5. Your site will be live at:"
echo "   https://your-project.vercel.app"
echo ""
echo "=========================================="
echo "📖 For detailed instructions, read:"
echo "   - DEPLOYMENT_GUIDE_ENGLISH.md"
echo "   - GUIA_DE_DEPLOYMENT.md (Spanish)"
echo "=========================================="
echo ""
