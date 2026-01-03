# Quick Domain Setup: www.verseai.io

## 🚀 3-Step Setup (15 minutes)

### 1. Add Domain in Vercel (2 min)
```
Vercel Dashboard → Project → Settings → Domains
→ Add: www.verseai.io
```

### 2. Add DNS Record at Registrar (3 min)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Update Backend CORS (2 min)
```
Backend Environment Variable:
FRONTEND_URL = https://www.verseai.io
→ Redeploy backend
```

### 4. Wait & Test (10-30 min)
- Wait for DNS propagation (check: https://www.whatsmydns.net)
- Visit: https://www.verseai.io
- Vercel auto-provisions SSL (5-10 min)

## ✅ Done!

**Your site will be live at**: https://www.verseai.io

For detailed instructions, see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)

