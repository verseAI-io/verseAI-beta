# Deploy Your Project to Vercel First

You need to deploy your project to Vercel before you can add a domain. Follow these steps:

## Option 1: Deploy via Vercel Dashboard (Easiest - Recommended)

### Step 1: Connect Your GitHub Repository

1. Go to https://vercel.com/new
2. Sign in with GitHub (if not already)
3. Click **"Import Git Repository"**
4. Select your repository (verseAI-beta or verseai)
5. If you don't see it, click **"Adjust GitHub App Permissions"** and grant access

### Step 2: Configure Project

Vercel will auto-detect Create React App, but verify:

- **Framework Preset**: Create React App ✅
- **Root Directory**: `./` (leave as is, or if your React app is in a subfolder, set it)
- **Build Command**: `npm run build` ✅
- **Output Directory**: `build` ✅
- **Install Command**: `npm install` ✅

### Step 3: Add Environment Variables (Important!)

Before deploying, click **"Environment Variables"** and add:

```
REACT_APP_API_URL = https://your-backend-url.com/api
```

Replace with your actual backend URL (Railway, Render, etc.)

If you haven't deployed backend yet, you can add this later and redeploy.

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://verseai-xyz.vercel.app`

### Step 5: Now Add Your Domain

After deployment completes:

1. Go to your project dashboard
2. Click **Settings** → **Domains**
3. Now you should see your project when adding a domain!

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

Navigate to your project root (where package.json is):

```bash
cd /Users/georgian/verseAI-beta/verseAI
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time)
- Project name? (Press Enter for default or type a name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Production Deploy

```bash
vercel --prod
```

---

## Troubleshooting: Project Not Found

### If repository not showing in Vercel:

1. **Check GitHub connection:**
   - Vercel Dashboard → Settings → Git
   - Make sure GitHub is connected
   - Click "Connect Git Provider" if needed

2. **Check repository visibility:**
   - Repository must be on GitHub (not just local)
   - If private, make sure Vercel has access

3. **Grant permissions:**
   - Go to GitHub → Settings → Applications → Authorized OAuth Apps
   - Find Vercel and ensure it has repository access

### If project name is different:

- The project might be named "verseai" (from package.json) instead of "verseai-beta"
- Search for "verseai" in the Vercel project search
- Or check your Vercel dashboard for all projects

---

## After Deployment

Once deployed, you'll see:
- ✅ Project in Vercel dashboard
- ✅ Deployment URL (e.g., `https://verseai.vercel.app`)
- ✅ Can now add custom domain `www.verseai.io`

Then follow the domain setup guide!

