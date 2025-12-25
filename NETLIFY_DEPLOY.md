# Netlify Deployment Instructions

## Quick Deploy Steps:

1. **Replace package.json**:
   ```bash
   mv package-netlify.json package.json
   ```

2. **Update main.js**:
   ```bash
   mv src/assets/js/main-netlify.js src/assets/js/main.js
   ```

3. **Set Environment Variables in Netlify**:
   - SMTP_HOST=smtp.zohopro.com
   - SMTP_PORT=587
   - SMTP_SECURE=false
   - SMTP_USER=contact@websutech.com
   - SMTP_PASS=your-app-password
   - EMAIL_FROM=noreply@websutech.com
   - ADMIN_EMAIL=admin@websutech.com

4. **Deploy Settings**:
   - Build command: `npm run build`
   - Publish directory: `src`
   - Functions directory: `netlify/functions`

## Files Created:
- `netlify.toml` - Netlify configuration
- `netlify/functions/contact.js` - Contact form handler
- `netlify/functions/buyer-inquiry.js` - Buyer inquiry handler
- `netlify/functions/seller-inquiry.js` - Seller inquiry handler

## Form Endpoints:
- Contact: `/.netlify/functions/contact`
- Buyer Inquiry: `/.netlify/functions/buyer-inquiry`
- Seller Inquiry: `/.netlify/functions/seller-inquiry`

## Deploy to Netlify:
1. Push to GitHub
2. Connect repository to Netlify
3. Set environment variables
4. Deploy

Your site will be available at: `https://your-site-name.netlify.app`