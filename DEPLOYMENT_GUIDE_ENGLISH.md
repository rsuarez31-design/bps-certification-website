# 🚀 DEPLOYMENT GUIDE - BPS Website
## How to Publish Your Website Online

---

## 🌟 **RECOMMENDED: VERCEL (FREE & EASIEST)**

Vercel is the best option for Next.js projects. It's:
- ✅ **100% FREE** for personal projects
- ✅ **Deploy in 5 minutes**
- ✅ **Automatic HTTPS/SSL**
- ✅ **Free subdomain**: yoursite.vercel.app
- ✅ **Auto-updates** when you push changes
- ✅ **No credit card required**

---

## 📋 **QUICK START (3 STEPS)**

### **STEP 1: Push to GitHub (5 minutes)**

#### 1.1 Initialize Git

Open Terminal and run:

```bash
# Navigate to your project
cd /Users/ramonsuarez/Desktop/BPS/bps-website

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - BPS Certification Website"
```

#### 1.2 Create GitHub Account & Repository

1. Go to: **https://github.com**
2. Click **"Sign up"** (if you don't have an account)
3. Click **"New repository"** (+ button, top right)
4. Configure:
   - **Name:** `bps-certification-website`
   - **Description:** "Navigation Certification System - Puerto Rico Law 430"
   - **Visibility:** Private or Public (your choice)
   - ❌ **Don't check** "Add a README file"
5. Click **"Create repository"**

#### 1.3 Connect Local Project to GitHub

GitHub will show you commands. Copy and run in Terminal:

```bash
# Add remote (replace 'your-username' with your GitHub username)
git remote add origin https://github.com/your-username/bps-certification-website.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

---

### **STEP 2: Deploy to Vercel (3 minutes)**

#### 2.1 Go to Vercel
Visit: **https://vercel.com**

#### 2.2 Sign Up
- Click **"Sign Up"**
- Select **"Continue with GitHub"**
- Authorize Vercel

#### 2.3 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository: `bps-certification-website`
3. Click **"Import"**
4. Configure (leave defaults):
   - Framework: Next.js ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
5. Click **"Deploy"**

#### 2.4 Wait for Deployment (1-2 minutes)

Vercel will build and deploy automatically.

#### 2.5 Your Site is LIVE! 🎉

You'll get a URL like:
```
https://bps-certification-website.vercel.app
```

**You can now access it from ANY computer/phone/tablet!**

---

### **STEP 3: Access Your Live Site**

Your website is now online at:
```
https://your-project.vercel.app
```

Share this link with:
- ✅ Students
- ✅ Instructors
- ✅ Club members
- ✅ Anyone with internet access

---

## 🔄 **UPDATE YOUR WEBSITE**

Whenever you make changes:

```bash
# 1. Save changes to Git
git add .
git commit -m "Description of changes"

# 2. Push to GitHub
git push

# 3. Vercel updates AUTOMATICALLY (no extra steps needed!)
```

Vercel detects changes and updates your live site automatically!

---

## 🎨 **CUSTOM DOMAIN (OPTIONAL)**

### **Option 1: Use Free Vercel Domain**
Already included: `your-project.vercel.app`

### **Option 2: Use Your Own Domain**

If you own a domain (e.g., boqueronpowersquadron.com):

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **"Settings"**
   - Click **"Domains"**
   - Add your custom domain

2. **In Your Domain Provider:**
   - Add the DNS records Vercel provides
   - Wait 24-48 hours for propagation

---

## 📊 **MONITORING & ANALYTICS**

### **Add Google Analytics:**

1. Create account at: https://analytics.google.com
2. Get your tracking ID
3. Add to your site (I can help with this)

---

## ⚠️ **IMPORTANT FOR PRODUCTION**

Before using with real students:

### **1. Set Up Real Database:**
Currently using localStorage (browser storage). For production:
- Use PostgreSQL, MongoDB, or Firebase
- Store student data securely

### **2. Secure Authentication:**
Currently has hardcoded credentials (BPS/2026). For production:
- Use NextAuth.js or similar
- Use environment variables
- Hash passwords

### **3. Environment Variables in Vercel:**

In Vercel Dashboard:
- Settings → Environment Variables
- Add sensitive data:
  ```
  ADMIN_USERNAME=youruser
  ADMIN_PASSWORD=securepassword
  DATABASE_URL=your_database_connection
  ```

---

## 🛠️ **OTHER HOSTING OPTIONS**

### **Netlify** (Also Free & Easy)
- Similar to Vercel
- Good alternative
- https://netlify.com

### **Railway** (Free Tier)
- Includes database
- Good for full-stack apps
- https://railway.app

### **AWS/Google Cloud** (Advanced)
- More control
- Requires technical knowledge
- Can have costs

---

## 🔧 **TROUBLESHOOTING**

### **Build Failed Error**
1. Test locally first:
   ```bash
   npm run build
   ```
2. Fix any errors
3. Push to GitHub
4. Vercel will retry automatically

### **Site is Blank**
1. Open browser console (F12)
2. Look for errors
3. Usually image paths or API issues

### **"Cannot find module" Error**
1. Verify all dependencies are in `package.json`
2. Delete and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

Before deploying, verify:

- [ ] Project works locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] All images are in `public/` folder
- [ ] No sensitive data in code
- [ ] `.gitignore` is configured
- [ ] All pages tested locally

---

## 🎯 **QUICK REFERENCE**

### **Initial Deployment:**
```bash
# 1. Git Setup
git init
git add .
git commit -m "Initial commit"

# 2. Connect to GitHub (create repo first on github.com)
git remote add origin https://github.com/username/repo.git
git push -u origin main

# 3. Deploy on Vercel (do this on vercel.com)
```

### **Updates:**
```bash
git add .
git commit -m "Update: description"
git push
```

Vercel auto-deploys! ✨

---

## 📞 **USEFUL RESOURCES**

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **GitHub Guides:** https://guides.github.com/

---

## 🎉 **CONGRATULATIONS!**

Once deployed, your site will be accessible from anywhere in the world!

**Your URL will be:**
```
https://your-project-name.vercel.app
```

**Access from:**
- ✅ Any computer
- ✅ Mobile phones
- ✅ Tablets
- ✅ Anywhere with internet

---

## 💡 **NEXT STEPS**

After deployment:

1. ✅ Share the link with your team
2. ✅ Test on different devices
3. ✅ Set up custom domain (optional)
4. ✅ Add analytics
5. ✅ Configure real database (for production)
6. ✅ Implement secure authentication

---

**Your navigation certification website is now in the cloud! 🌊⚓**

*Need help? Check the Spanish guide (GUIA_DE_DEPLOYMENT.md) for more details or ask in Vercel/Next.js community.*
