# Websutech - Production Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Pre-Deployment Checklist

- [x] ✅ Build script created and tested
- [x] ✅ Package.json updated with build scripts
- [x] ✅ Vercel configuration ready
- [ ] Set up environment variables
- [ ] Configure SMTP credentials
- [ ] Test locally with `npm start`

### 2. Build for Production

```bash
# Run the production build
npm run build

# This will:
# - Validate all required files
# - Optionally minify CSS/JS (if dependencies installed)
# - Prepare the application for deployment
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration
6. Add environment variables (see below)
7. Deploy!

### 4. Environment Variables

**Required in Vercel Dashboard:**

Go to: Project Settings → Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Email Configuration (Zoho Mail)
EMAIL_FROM=noreply@websutech.com
ADMIN_EMAIL=admin@websutech.com
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@websutech.com
SMTP_PASS=your-zoho-app-password

# Optional: Security (if implementing later)
SESSION_SECRET=generate-random-string-here
JWT_SECRET=generate-random-string-here
```

**How to get Zoho App Password:**
1. Log in to Zoho Mail
2. Go to Security → App Passwords
3. Generate a new app password
4. Use that password in `SMTP_PASS`

### 5. Post-Deployment Testing

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Test contact form
curl -X POST https://your-domain.vercel.app/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test message"}'

# Test buyer inquiry
curl -X POST https://your-domain.vercel.app/api/inquiries/buyer \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Co","contactPerson":"Test","email":"test@example.com","phone":"+1234567890","country":"US","specificProduct":"EN590 Diesel","quantity":"1000 MT","ndaAgreed":true}'
```

### 6. Domain Configuration (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., websutech.com)
3. Update DNS records as instructed by Vercel
4. Update CORS settings in `server.js` if needed

### 7. Monitoring & Maintenance

**Check Logs:**
- Vercel Dashboard → Your Project → Logs
- Monitor for errors and performance

**Monitor:**
- Form submissions
- Email delivery
- API response times
- Error rates

## 📋 Build Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm run build        # Build and validate
npm start            # Start production server

# Vercel (automatic)
npm run vercel-build # Runs: npm install && npm run build
```

## ⚠️ Important Notes

### Database Storage

**Current:** File-based JSON storage (`data/storage.json`)

**⚠️ Warning:** This is NOT suitable for production with high traffic!

**Recommendation:**
- For production, migrate to MongoDB Atlas or Vercel Postgres
- See `APPLICATION_ANALYSIS.md` for migration guide

### Minification

Minification is **optional** because:
- Vercel automatically compresses assets
- Gzip/Brotli compression is enabled by default
- Build script validates the application

To enable minification:
```bash
npm install --save-dev clean-css terser
npm run build
```

### Environment Variables

**Never commit `.env` file to Git!**

- Use Vercel's environment variables dashboard
- Keep `.env` in `.gitignore`
- Document required variables in this guide

## 🔧 Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Should be >= 18.x

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run build again
npm run build
```

### Email Not Sending

1. Check SMTP credentials in Vercel environment variables
2. Verify Zoho Mail app password is correct
3. Check Vercel logs for email errors
4. Test with: `node tools/send_test_email.js`

### API Errors

1. Check Vercel function logs
2. Verify environment variables are set
3. Test endpoints with curl or Postman
4. Check CORS settings if accessing from different domain

### Deployment Issues

1. Check `vercel.json` configuration
2. Verify `server.js` exports the app correctly
3. Check Vercel build logs
4. Ensure all dependencies are in `package.json`

## 📊 Performance Optimization

Vercel automatically provides:
- ✅ CDN for static assets
- ✅ Edge caching
- ✅ Automatic compression (Gzip/Brotli)
- ✅ Serverless function optimization

Additional optimizations (optional):
- Enable minification (see above)
- Optimize images
- Use Vercel Analytics
- Implement caching headers

## 🔒 Security Checklist

Before going live:
- [ ] All environment variables set in Vercel
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled (✅ already configured)
- [ ] Security headers enabled (✅ Helmet.js configured)
- [ ] HTTPS enabled (✅ Vercel default)
- [ ] No sensitive data in code
- [ ] `.env` in `.gitignore`

## 📞 Support

If you encounter issues:
1. Check Vercel logs
2. Review `APPLICATION_ANALYSIS.md`
3. Check `QUICK_REFERENCE.md`
4. Test locally first: `npm start`

---

**Ready to deploy?** Run `npm run build` and then `vercel --prod`! 🚀

