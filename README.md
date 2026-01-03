# ResultBroker - Commodity Brokerage Website

A professional commodity brokerage website for trading petroleum, precious metals, diamonds, and industrial materials.

## Features
- 🛢️ **Product Catalog**: Detailed listings for all commodity categories
- 🤝 **Trading Platform**: Buyer/Seller inquiry management
- 📄 **Document Management**: NDA, NCNDA, IMFPA handling
- 🔒 **Secure Backend**: Node.js/Express with security best practices
- 📱 **Responsive Design**: Mobile-first approach
- ✉️ **Email Integration**: Automated email notifications
- 🚀 **Vercel Ready**: Serverless deployment optimized

## Project Structure

```
resultbroker/
├── server.js                  # Main Express server
├── src/                       # Frontend source files
├── backend/                   # Backend API and logic
├── package.json              # Dependencies
├── vercel.json              # Vercel deployment config
└── .env                      # Environment variables
```

## Quick Start

### 1. Installation
```bash
# Install dependencies
npm install

# Or run setup script (if provided)
node setup-website.js
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Add email, database, and API keys
```

### 3. Development
```bash
# Start development server
npm run dev

# Server will run at http://localhost:3000
# API endpoints available at /api/*
```

### 4. Production Deployment

#### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repository to vercel.com
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/contact/submit` - Contact form
- `POST /api/inquiries/buyer` - Buyer inquiry
- `POST /api/inquiries/seller` - Seller inquiry
- `GET /api/documents/list` - Available documents

## Database Setup

### Option 1: MongoDB (Recommended)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `MONGODB_URI` in .env

### Option 2: PostgreSQL
1. Use Vercel Postgres (free tier available)
2. Get connection string from Vercel dashboard
3. Add to `POSTGRES_URL` in .env

## Email Setup

### Option 1: SendGrid (Recommended for Vercel)
1. Create free account at [SendGrid](https://sendgrid.com)
2. Get API key
3. Add to `SENDGRID_API_KEY` in .env

### Option 2: SMTP (Development)
1. Use Gmail or other SMTP provider
2. Configure SMTP settings in .env

## Environment Variables

Required variables in `.env`:

```
NODE_ENV=development
PORT=3000
EMAIL_FROM=noreply@resultbroker.org
ADMIN_EMAIL=admin@resultbroker.org
# Add database and email service variables
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests (when available)
npm test

# Check for security vulnerabilities
npm audit
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: MongoDB / PostgreSQL
- **Email**: Nodemailer, SendGrid
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Vercel (Serverless)
- **Logging**: Winston

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email: support@resultbroker.org

---

**ResultBroker** - Global Commodity Trading Solutions
```

All rights reserved. © 2025 ResultBroker
```