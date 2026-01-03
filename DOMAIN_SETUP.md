# Custom Domain Setup Guide: verseai.io

This guide will help you connect your purchased domain `www.verseai.io` to your Vercel deployment.

## Prerequisites

✅ Domain purchased: `verseai.io` (www.verseai.io)
✅ Vercel account and project deployed
✅ Backend deployed separately

## Step 1: Add Domain to Vercel

### Via Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Domains** in the left sidebar
4. Enter your domain: `www.verseai.io`
5. Click **Add**
6. Vercel will show you DNS configuration instructions

### Via Vercel CLI

```bash
vercel domains add www.verseai.io
```

## Step 2: Configure DNS Records

You need to add DNS records at your domain registrar. The exact steps depend on where you purchased the domain.

### Option A: Using CNAME (Recommended for www subdomain)

Add a **CNAME** record:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Option B: Using A Record (For apex domain - verseai.io)

If you also want `verseai.io` (without www), add an **A** record:

```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600
```

**Note**: Vercel also supports apex domains via ALIAS/ANAME records if your DNS provider supports it.

### Option B Alternative: Redirect apex to www

Many registrars allow you to redirect `verseai.io` → `www.verseai.io`. This is often easier.

## Step 3: DNS Provider Specific Instructions

### If domain is at:
- **Namecheap**: Go to Domain List → Manage → Advanced DNS
- **GoDaddy**: Go to DNS Management
- **Google Domains**: Go to DNS settings
- **Cloudflare**: Go to DNS → Records (see Cloudflare section below)
- **Route 53**: Go to Hosted Zones → Create Record

### Example: Namecheap Setup

1. Login to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add CNAME Record:
   - Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic
4. Save changes

### Example: GoDaddy Setup

1. Login to GoDaddy
2. My Products → DNS
3. Add Record:
   - Type: CNAME
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 1 Hour
4. Save

## Step 4: Cloudflare Setup (If using Cloudflare)

If your domain uses Cloudflare:

1. Go to Cloudflare Dashboard → DNS → Records
2. Add CNAME:
   - Type: CNAME
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - Proxy status: DNS only (gray cloud) - **Important!**
3. For apex domain (`verseai.io`), Cloudflare supports CNAME flattening automatically

**Important**: Set proxy to "DNS only" (gray cloud) initially. After verification, you can enable proxy (orange cloud) if desired.

## Step 5: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes** for most providers
- Check propagation: https://www.whatsmydns.net/#CNAME/www.verseai.io

## Step 6: Verify Domain in Vercel

1. Go back to Vercel Dashboard → Settings → Domains
2. Vercel will automatically detect when DNS is configured correctly
3. Status will change from "Pending" to "Valid"
4. SSL certificate will be automatically provisioned (takes a few minutes)

## Step 7: Update Environment Variables

### Update Frontend Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

1. Update `REACT_APP_API_URL` for production:
   ```
   REACT_APP_API_URL = https://your-backend-url.com/api
   ```
   (Keep your backend URL - this doesn't change)

2. Add new variable (optional, for app configuration):
   ```
   REACT_APP_DOMAIN = https://www.verseai.io
   ```

### Update Backend CORS

In your backend deployment (Railway/Render/etc.), update environment variable:

```
FRONTEND_URL = https://www.verseai.io
```

Or if you want to support both:
```
FRONTEND_URL = https://www.verseai.io,https://verseai.io
```

Then update `backend/server.js` to handle multiple origins:

```javascript
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## Step 8: Redeploy

After updating environment variables:

1. **Frontend**: Vercel will auto-redeploy, or manually trigger in Deployments tab
2. **Backend**: Redeploy your backend service with new `FRONTEND_URL`

## Step 9: Test Your Domain

1. Visit `https://www.verseai.io` (wait a few minutes after DNS propagation)
2. Check SSL: Should show green lock (Vercel provides free SSL)
3. Test API calls from the frontend
4. Check browser console for any CORS errors

## Step 10: Set Up Redirects (Optional)

If you want `verseai.io` to redirect to `www.verseai.io`:

### In Vercel Dashboard:
1. Settings → Domains
2. Add `verseai.io` (apex domain)
3. Vercel will provide A record instructions

### Or in vercel.json:
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://www.verseai.io/$1",
      "permanent": true,
      "has": [
        {
          "type": "host",
          "value": "verseai.io"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Domain Not Resolving

1. **Check DNS propagation**: https://www.whatsmydns.net
2. **Verify CNAME record**: Should point to `cname.vercel-dns.com`
3. **Wait longer**: Can take up to 48 hours (usually much faster)
4. **Check DNS provider**: Make sure changes are saved

### SSL Certificate Issues

1. Wait 5-10 minutes after DNS verification
2. Vercel automatically provisions SSL (Let's Encrypt)
3. Check Vercel Dashboard → Domains for SSL status
4. If issues persist, remove and re-add domain

### CORS Errors

1. Verify `FRONTEND_URL` in backend matches exactly: `https://www.verseai.io`
2. Check backend logs for CORS errors
3. Ensure backend is redeployed with new environment variable
4. Check browser console for exact error message

### Site Not Loading

1. Check Vercel deployment status (should be "Ready")
2. Verify domain is "Valid" in Vercel Dashboard
3. Clear browser cache
4. Try incognito/private browsing mode
5. Check Vercel deployment logs

## Security Checklist

- ✅ HTTPS enabled (automatic with Vercel)
- ✅ SSL certificate valid (automatic)
- ✅ CORS configured correctly
- ✅ Environment variables set
- ✅ Backend URL is HTTPS
- ✅ No hardcoded localhost URLs in production

## Next Steps After Domain Setup

1. ✅ Test all features work with custom domain
2. ✅ Update any documentation with new URL
3. ✅ Set up analytics (optional)
4. ✅ Configure email (if needed)
5. ✅ Set up monitoring/alerts

## Support

- Vercel Domain Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support

---

**Your domain**: `www.verseai.io`  
**Vercel provides**: Free SSL, CDN, and automatic HTTPS

