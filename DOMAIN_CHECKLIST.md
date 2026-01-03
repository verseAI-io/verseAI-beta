# Domain Setup Checklist: www.verseai.io

Follow these steps in order to set up your custom domain.

## ✅ Pre-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render/etc.)
- [ ] Domain purchased: `verseai.io`
- [ ] Access to domain registrar/DNS provider

## 📋 Step-by-Step Setup

### Step 1: Add Domain to Vercel (2 minutes)

- [ ] Go to Vercel Dashboard → Your Project → Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter: `www.verseai.io`
- [ ] Click "Add"
- [ ] Note the DNS instructions shown

### Step 2: Configure DNS at Your Registrar (5 minutes)

**Find your domain registrar** (where you bought the domain):
- Namecheap, GoDaddy, Google Domains, Cloudflare, etc.

**Add CNAME Record:**
```
Type: CNAME
Name/Host: www
Value/Target: cname.vercel-dns.com
TTL: Auto or 3600
```

**Where to add:**
- [ ] Login to domain registrar
- [ ] Find DNS Management / Advanced DNS
- [ ] Add the CNAME record above
- [ ] Save changes

### Step 3: Wait for DNS Propagation (15-30 minutes)

- [ ] Check DNS propagation: https://www.whatsmydns.net/#CNAME/www.verseai.io
- [ ] Wait until it shows `cname.vercel-dns.com` globally
- [ ] Check Vercel Dashboard - domain status should change to "Valid"

### Step 4: SSL Certificate (Automatic - 5-10 minutes)

- [ ] Vercel automatically provisions SSL
- [ ] Wait 5-10 minutes after DNS verification
- [ ] Check Vercel Dashboard → Domains for SSL status
- [ ] Should show "Valid" with green checkmark

### Step 5: Update Backend Environment Variables

**In your backend deployment (Railway/Render/etc.):**

- [ ] Go to Environment Variables
- [ ] Update or add: `FRONTEND_URL = https://www.verseai.io`
- [ ] Save and redeploy backend

### Step 6: Update Frontend Environment Variables (If needed)

**In Vercel Dashboard:**

- [ ] Settings → Environment Variables
- [ ] Verify `REACT_APP_API_URL` points to your backend
- [ ] Should be: `https://your-backend-url.com/api`
- [ ] Redeploy if you made changes

### Step 7: Test Your Domain

- [ ] Visit: `https://www.verseai.io`
- [ ] Check browser shows green lock (HTTPS)
- [ ] Test login/features
- [ ] Check browser console for errors
- [ ] Test API calls work correctly

### Step 8: Optional - Set Up Apex Domain Redirect

If you want `verseai.io` (without www) to redirect to `www.verseai.io`:

- [ ] Add `verseai.io` to Vercel domains
- [ ] Follow DNS instructions (A record)
- [ ] Or use redirect in vercel.json (already configured)

## 🔍 Verification Checklist

After setup, verify:

- [ ] `https://www.verseai.io` loads correctly
- [ ] SSL certificate is valid (green lock)
- [ ] No CORS errors in browser console
- [ ] API calls work from frontend
- [ ] All features function correctly
- [ ] Mobile responsive (test on phone)

## 🐛 Troubleshooting

**Domain not resolving?**
- Wait longer (up to 48 hours, usually 15-30 min)
- Check DNS propagation: https://www.whatsmydns.net
- Verify CNAME record is correct

**SSL issues?**
- Wait 10 minutes after DNS verification
- Remove and re-add domain in Vercel if needed

**CORS errors?**
- Verify `FRONTEND_URL` in backend = `https://www.verseai.io`
- Redeploy backend after changing environment variable
- Check backend logs

## 📞 Quick Reference

- **Your Domain**: www.verseai.io
- **Vercel Dashboard**: https://vercel.com/dashboard
- **DNS Check**: https://www.whatsmydns.net
- **Backend URL**: (your backend deployment URL)

## 🎉 Success Criteria

✅ Domain resolves to your Vercel deployment  
✅ HTTPS/SSL working (green lock)  
✅ No CORS errors  
✅ All features working  
✅ Fast loading times  

---

**Estimated Total Time**: 30-60 minutes (mostly waiting for DNS)

