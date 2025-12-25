# Websutech Application - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev          # Runs on http://localhost:3000

# Production
npm start

# Setup
node setup-website.js
```

## 📁 Project Structure

```
websutech/
├── server.js              # Main Express server
├── backend/
│   ├── config/           # Database & Email config
│   ├── controllers/      # Business logic
│   ├── routes/          # API routes
│   └── utils/           # Logger
├── src/                  # Frontend (HTML/CSS/JS)
│   ├── assets/          # CSS, JS, images
│   ├── forms/           # Inquiry forms
│   └── products/       # Product pages
└── data/                # JSON storage
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Server status

### Contact
- `POST /api/contact/submit` - Contact form (Rate: 5/15min)
- `POST /api/contact/newsletter` - Newsletter (Rate: 5/15min)

### Inquiries
- `POST /api/inquiries/buyer` - Buyer inquiry (Rate: 3/30min)
- `POST /api/inquiries/seller` - Seller inquiry (Rate: 3/30min)
- `POST /api/inquiries/mandate` - Mandate application
- `GET /api/inquiries/status/:id` - Check status

### Security
- `POST /api/security/log` - Security event logging

## 🔐 Environment Variables

```bash
# Required
NODE_ENV=production
PORT=3000
EMAIL_FROM=noreply@websutech.com
ADMIN_EMAIL=admin@websutech.com

# Email (Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@websutech.com
SMTP_PASS=your-app-password
```

## 📊 Data Storage

**Current:** File-based JSON (`data/storage.json`)

**Structure:**
- `inquiries` - Buyer/Seller/Mandate inquiries
- `contacts` - Contact form submissions
- `users` - Newsletter subscriptions
- `documents` - Document requests

**⚠️ Note:** Migrate to MongoDB/PostgreSQL for production

## 🎨 Frontend Pages

- `/` - Homepage
- `/about.html` - About page
- `/contact.html` - Contact page
- `/products.html` - Product catalog
- `/services.html` - Services
- `/process.html` - Trading process
- `/compliance.html` - Compliance info
- `/disclaimer.html` - Legal disclaimer

## 📝 Forms

- `/forms/buyer-inquiry.html` - Buyer inquiry form
- `/forms/seller-inquiry.html` - Seller registration
- `/forms/mandate-application.html` - Mandate application

## 🔒 Security Features

- ✅ Helmet.js (Security headers)
- ✅ CORS (Restricted origins)
- ✅ Rate limiting (API & forms)
- ✅ Input validation (express-validator)
- ✅ XSS protection
- ✅ HSTS (Production)

## 📧 Email System

**Provider:** Zoho Mail (SMTP)

**Email Types:**
1. Buyer inquiry confirmations
2. Seller registration confirmations
3. Mandate application confirmations
4. Contact form notifications
5. Newsletter welcome emails
6. Admin notifications

**Dev Mode:** Logs emails instead of sending (if SMTP not configured)

## 🚢 Deployment

**Platform:** Vercel (Serverless)

**Configuration:** `vercel.json`

**Deploy:**
```bash
vercel
# Or connect GitHub repo to Vercel dashboard
```

## 🐛 Common Issues

### Issue: Email not sending
- Check SMTP credentials in `.env`
- Verify Zoho Mail app password
- Check logs in `backend/logs/`

### Issue: Data not persisting
- Check `data/storage.json` permissions
- Verify file write access
- Check disk space

### Issue: CORS errors
- Verify origin in `server.js` CORS config
- Check Vercel environment variables

## 📈 Monitoring

**Logs:**
- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Errors only
- `backend/logs/server_start.log` - Startup logs

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

## 🔧 Development Tools

**Test Scripts:**
- `tools/post_test_inquiry.js` - Test buyer inquiry
- `tools/send_test_email.js` - Test email sending
- `tools/test_security_post.js` - Test security logging

## 📚 Key Files

- `server.js` - Main server entry
- `package.json` - Dependencies
- `vercel.json` - Deployment config
- `README.md` - Full documentation
- `APPLICATION_ANALYSIS.md` - Detailed analysis

## ⚠️ Known Issues

1. **Database:** Using file storage (not production-ready)
2. **Inconsistency:** `contactController` uses `memoryStorage`, `inquiryController` uses `db`
3. **Naming:** Route imports `inquiryController.fixed.js`
4. **Testing:** No automated tests
5. **Monitoring:** Limited error tracking

## ✅ Production Checklist

- [ ] Migrate to MongoDB/PostgreSQL
- [ ] Fix code inconsistencies
- [ ] Set up environment variables in Vercel
- [ ] Configure SMTP credentials
- [ ] Add error tracking (Sentry)
- [ ] Set up monitoring
- [ ] Add automated tests
- [ ] Review security settings
- [ ] Test all forms
- [ ] Verify email delivery
- [ ] Set up backups

## 📞 Support

- **Email:** support@websutech.com
- **Documentation:** See `README.md` and `APPLICATION_ANALYSIS.md`

---

**Last Updated:** December 2024

