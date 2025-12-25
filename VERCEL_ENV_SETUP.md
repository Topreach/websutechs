# Vercel Environment Variables Setup

## 🔐 Setting Environment Variables in Vercel

Your `.env` file is configured locally. Now you need to add these same variables to Vercel for production deployment.

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account

2. **Select Your Project**
   - If project doesn't exist yet, create it first
   - Go to Project Settings → Environment Variables

3. **Add Each Variable**

   Click "Add New" and add these variables one by one:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NODE_ENV` | `production` | Production, Preview, Development |
   | `PORT` | `3000` | Production, Preview, Development |
   | `EMAIL_FROM` | `noreply@websutech.com` | Production, Preview, Development |
   | `ADMIN_EMAIL` | `admin@websutech.com` | Production, Preview, Development |
   | `SMTP_HOST` | `smtp.zoho.com` | Production, Preview, Development |
   | `SMTP_PORT` | `587` | Production, Preview, Development |
   | `SMTP_SECURE` | `false` | Production, Preview, Development |
   | `SMTP_USER` | `contact@websutech.com` | Production, Preview, Development |
   | `SMTP_PASS` | `SP198693mne&` | Production, Preview, Development |

   **Important:** For each variable:
   - Select all three environments: **Production**, **Preview**, and **Development**
   - Click "Save" after each variable

### Quick Copy-Paste Values

```
NODE_ENV=production
PORT=3000
EMAIL_FROM=noreply@websutech.com
ADMIN_EMAIL=admin@websutech.com
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@websutech.com
SMTP_PASS=SP198693mne&
```

### ⚠️ Security Reminders

1. **Never commit `.env` to Git** ✅ (Already in .gitignore)
2. **Never share your SMTP password publicly**
3. **Use Vercel's secure environment variables** (encrypted at rest)
4. **Rotate passwords regularly**

### Verification

After adding all variables:

1. Go to your project in Vercel
2. Click "Deployments"
3. Create a new deployment or redeploy
4. Check the build logs to ensure variables are loaded

### Testing Email Configuration

After deployment, test email sending:

```bash
# Test endpoint (replace with your Vercel URL)
curl -X POST https://your-app.vercel.app/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Email",
    "message": "Testing email configuration"
  }'
```

Or use the test script:
```bash
node tools/send_test_email.js
```

---

**Next Step:** Deploy your application to Vercel! 🚀

