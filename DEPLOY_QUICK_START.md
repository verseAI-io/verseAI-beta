# Quick Start: Deploy VerseAI to Vercel

## 🚀 Fast Deployment Steps

### 1. Deploy Frontend to Vercel (5 minutes)

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click **Deploy** (Vercel auto-detects Create React App)
4. Wait for deployment to complete

**Option B: Via CLI**
```bash
npm i -g vercel
vercel login
vercel
```

### 2. Deploy Backend (Choose one)

#### 🚂 Railway (Recommended - Easiest)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo → Add Service → Select `backend` folder
4. Add environment variables:
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app`
   - `GCP_PROJECT_ID` = (your project ID)
   - `VERTEX_AI_LOCATION` = `us-central1`
   - `VERTEX_AI_MODEL` = `gemini-pro`
5. Upload `cred.json` or add GCP credentials
6. Deploy!

#### ☁️ Render
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Root Directory: `backend`
4. Build: `npm install`
5. Start: `npm start`
6. Add same environment variables as above
7. Deploy!

### 3. Connect Frontend to Backend

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   REACT_APP_API_URL = https://your-backend-url.railway.app/api
   ```
3. Redeploy frontend

### 4. Test

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend-url.com/health`

## ✅ Done!

Your app is now live! 🎉

For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

