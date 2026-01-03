# Vercel Deployment Guide for VerseAI

This guide will help you deploy the VerseAI frontend to Vercel. Note that the backend needs to be deployed separately.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub account (for connecting your repository)
3. Backend deployment (see Backend Deployment section)

## Frontend Deployment to Vercel

### Step 1: Prepare Your Repository

1. Make sure all changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (e.g., `verseai` or press Enter for default)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. For production deployment:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

   ```
   REACT_APP_API_URL = https://your-backend-url.com/api
   ```

   Replace `https://your-backend-url.com/api` with your actual backend deployment URL.

3. For different environments:
   - **Production**: Your production backend URL
   - **Preview**: Your staging/development backend URL (optional)
   - **Development**: `http://localhost:5000/api` (for local development)

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

## Backend Deployment

The backend Express server **cannot** be deployed directly to Vercel. You need to deploy it separately. Here are recommended options:

### Option 1: Railway (Recommended - Easy Setup)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub**
4. Select your repository
5. Add service → Select `backend` directory
6. Add environment variables:
   - `PORT` (Railway will auto-assign, but you can set it)
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app`
   - `GCP_PROJECT_ID` = (your GCP project ID)
   - `GCP_CREDENTIALS_PATH` = `./cred.json`
   - `VERTEX_AI_LOCATION` = (e.g., `us-central1`)
   - `VERTEX_AI_MODEL` = `gemini-pro`
7. Upload `cred.json` file (or use Railway's secrets)
8. Deploy!

### Option 2: Render

1. Go to https://render.com
2. Sign up and connect GitHub
3. Create new **Web Service**
4. Connect your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add environment variables (same as Railway)
7. Deploy!

### Option 3: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create verseai-backend`
4. Set environment variables:
   ```bash
   heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app
   heroku config:set GCP_PROJECT_ID=your-project-id
   # ... add other variables
   ```
5. Deploy: `git push heroku main`

### Option 4: Google Cloud Run (Since you're using GCP)

1. Create a Dockerfile in `backend/`:
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy verseai-backend \
     --source ./backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Update Frontend Environment Variable

After deploying the backend, update your Vercel environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `REACT_APP_API_URL` to your backend URL:
   ```
   REACT_APP_API_URL = https://your-backend-url.railway.app/api
   ```
   (or your actual backend URL)

3. Redeploy the frontend

## Testing Your Deployment

1. **Frontend**: Visit your Vercel URL (e.g., `https://verseai.vercel.app`)
2. **Backend Health Check**: Visit `https://your-backend-url.com/health`
3. **API Test**: Visit `https://your-backend-url.com/` to see API info

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
2. Check backend CORS configuration in `backend/server.js`
3. Ensure backend is running and accessible

### Environment Variables Not Working

1. Make sure variable names start with `REACT_APP_` for frontend
2. Redeploy after adding/changing variables
3. Check variable names match exactly (case-sensitive)

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript/ESLint errors locally first

## Project Structure

```
verseAI-beta/
├── src/              # React frontend (deployed to Vercel)
├── public/           # Static assets
├── backend/          # Express backend (deploy separately)
├── vercel.json       # Vercel configuration
└── package.json      # Frontend dependencies
```

## Quick Deploy Commands

```bash
# Frontend to Vercel
vercel --prod

# Backend to Railway (after setup)
railway up

# Backend to Render (after setup)
# Automatic via GitHub integration
```

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

