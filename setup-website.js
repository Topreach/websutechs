// setup-website.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Websutech Commodity Brokerage Website...');

// Create directory structure
const directories = [
    // Root directories
    'src',
    'backend',
    
    // src/assets directories
    'src/assets/css/base',
    'src/assets/css/components',
    'src/assets/css/layout',
    'src/assets/css/pages',
    'src/assets/js',
    'src/assets/images/logo',
    'src/assets/images/products/petroleum',
    'src/assets/images/products/metals',
    'src/assets/images/products/diamonds',
    'src/assets/images/products/industrial',
    'src/assets/images/icons',
    'src/assets/fonts',
    
    // Product directories
    'src/products/petroleum',
    'src/products/precious-metals',
    'src/products/diamonds',
    'src/products/industrial',
    
    // Templates
    'src/templates',
    
    // Forms
    'src/forms',
    
    // Documents directories
    'src/documents/ndas',
    'src/documents/agreements',
    'src/documents/compliance',
    
    // Backend directories
    'backend/routes',
    'backend/controllers',
    'backend/models',
    'backend/middleware',
    'backend/config',
    'backend/utils',
    'backend/logs',
    
    // Other directories
    'email-templates',
    'seo',
    'security'
];

// Create directories
console.log('📂 Creating directory structure...');
directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  Created: ${dir}`);
    }
});

// Package.json
const packageJson = {
    name: "websutech",
    version: "1.0.0",
    description: "Commodity Brokerage Website with Node.js Backend",
    main: "server.js",
    scripts: {
        "dev": "nodemon server.js",
        "start": "node server.js",
        "build": "echo 'No build step required'",
        "vercel-build": "npm install",
        "setup": "node setup-website.js"
    },
    keywords: ["commodity", "brokerage", "trading"],
    author: "Websutech",
    license: "ISC",
    engines: {
        "node": ">=18.x"
    },
    dependencies: {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "express-rate-limit": "^6.10.0",
        "helmet": "^7.0.0",
        "multer": "^1.4.5-lts.1",
        "nodemailer": "^6.9.4",
        "validator": "^13.11.0",
        "uuid": "^9.0.0",
        "winston": "^3.10.0",
        "express-validator": "^7.0.1"
    },
    devDependencies: {
        "nodemon": "^3.0.1",
        "@vercel/node": "^3.0.0"
    }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('📦 Created: package.json');

// Server.js
const serverJs = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import route handlers
const contactRoutes = require('./backend/routes/contact');
const inquiryRoutes = require('./backend/routes/inquiries');
const documentRoutes = require('./backend/routes/documents');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com/ajax/libs"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://websutech.com', 'https://www.websutech.com']
        : ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (frontend)
app.use(express.static(path.join(__dirname, 'src'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    // Check if it's an API request
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve appropriate HTML file
    const filePath = path.join(__dirname, 'src', req.path === '/' ? 'index.html' : req.path);
    
    // Check if file exists
    if (require('fs').existsSync(filePath) && path.extname(filePath) === '.html') {
        res.sendFile(filePath);
    } else {
        // Default to index.html for client-side routing
        res.sendFile(path.join(__dirname, 'src', 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong!' 
        : err.message;
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(\`🚀 Server running on port \${PORT}\`);
        console.log(\`🌍 Environment: \${process.env.NODE_ENV || 'development'}\`);
        console.log(\`📁 Frontend: http://localhost:\${PORT}\`);
        console.log(\`🔧 API: http://localhost:\${PORT}/api/health\`);
    });
}

// Export for Vercel
module.exports = app;`;

fs.writeFileSync('server.js', serverJs);
console.log('⚡ Created: server.js');

// Create .env file
const envFile = `# Environment Configuration
NODE_ENV=development
PORT=3000

# Email Configuration
EMAIL_FROM=noreply@websutech.com
ADMIN_EMAIL=admin@websutech.com

# SMTP Configuration (for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid (for production on Vercel)
# SENDGRID_API_KEY=your-sendgrid-api-key

# Database (MongoDB - for Vercel)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/websutech

# PostgreSQL (for Vercel Postgres)
# POSTGRES_URL=postgresql://username:password@host:port/database

# Security
SESSION_SECRET=change-this-to-a-random-secret-key
JWT_SECRET=change-this-to-another-random-secret-key

# API Keys
# RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key`;

fs.writeFileSync('.env', envFile);
console.log('🔐 Created: .env');

// Create .gitignore
const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# TypeScript v1 declaration files
typings/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next

# vercel
.vercel

# macOS
.DS_Store

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~

# Vim swap files
*.swp
*.swo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~`;

fs.writeFileSync('.gitignore', gitignore);
console.log('👁️  Created: .gitignore');

// Create vercel.json
const vercelJson = {
    "version": 2,
    "builds": [
        {
            "src": "server.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/api/(.*)",
            "dest": "server.js"
        },
        {
            "src": "/(.*)",
            "dest": "server.js"
        }
    ],
    "env": {
        "NODE_ENV": "production"
    },
    "headers": [
        {
            "source": "/api/(.*)",
            "headers": [
                { "key": "Access-Control-Allow-Credentials", "value": "true" },
                { "key": "Access-Control-Allow-Origin", "value": "*" },
                { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
            ]
        },
        {
            "source": "/(.*)",
            "headers": [
                { "key": "X-Content-Type-Options", "value": "nosniff" },
                { "key": "X-Frame-Options", "value": "DENY" },
                { "key": "X-XSS-Protection", "value": "1; mode=block" },
                { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
            ]
        }
    ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelJson, null, 2));
console.log('▲ Created: vercel.json');

// Create README.md
const readme = `# Websutech - Commodity Brokerage Website

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

\`\`\`
websutech/
├── server.js                  # Main Express server
├── src/                       # Frontend source files
├── backend/                   # Backend API and logic
├── package.json              # Dependencies
├── vercel.json              # Vercel deployment config
└── .env                      # Environment variables
\`\`\`

## Quick Start

### 1. Installation
\`\`\`bash
# Install dependencies
npm install

# Or run setup script (if provided)
node setup-website.js
\`\`\`

### 2. Environment Setup
\`\`\`bash
# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Add email, database, and API keys
\`\`\`

### 3. Development
\`\`\`bash
# Start development server
npm run dev

# Server will run at http://localhost:3000
# API endpoints available at /api/*
\`\`\`

### 4. Production Deployment

#### Deploy to Vercel:
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repository to vercel.com
\`\`\`

## API Endpoints

- \`GET /api/health\` - Health check
- \`POST /api/contact/submit\` - Contact form
- \`POST /api/inquiries/buyer\` - Buyer inquiry
- \`POST /api/inquiries/seller\` - Seller inquiry
- \`GET /api/documents/list\` - Available documents

## Database Setup

### Option 1: MongoDB (Recommended)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to \`MONGODB_URI\` in .env

### Option 2: PostgreSQL
1. Use Vercel Postgres (free tier available)
2. Get connection string from Vercel dashboard
3. Add to \`POSTGRES_URL\` in .env

## Email Setup

### Option 1: SendGrid (Recommended for Vercel)
1. Create free account at [SendGrid](https://sendgrid.com)
2. Get API key
3. Add to \`SENDGRID_API_KEY\` in .env

### Option 2: SMTP (Development)
1. Use Gmail or other SMTP provider
2. Configure SMTP settings in .env

## Environment Variables

Required variables in \`.env\`:

\`\`\`
NODE_ENV=development
PORT=3000
EMAIL_FROM=noreply@websutech.com
ADMIN_EMAIL=admin@websutech.com
# Add database and email service variables
\`\`\`

## Development Commands

\`\`\`bash
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
\`\`\`

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
2. Create feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
5. Open Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email: support@websutech.com

---

**Websutech** - Global Commodity Trading Solutions
\`\`\`

All rights reserved. © ${new Date().getFullYear()} Websutech
\`\`\``;

fs.writeFileSync('README.md', readme);
console.log('📖 Created: README.md');

// Create backend files
console.log('\n🔧 Creating backend files...');

// backend/config/database.js
const databaseConfig = `// Database configuration
const mongoose = require('mongoose');

// MongoDB connection
const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/websutech', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// PostgreSQL connection (for Vercel Postgres)
const { Pool } = require('pg');

const pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const query = (text, params) => pgPool.query(text, params);

// In-memory storage for development (replace with database in production)
const memoryStorage = {
    inquiries: new Map(),
    contacts: new Map(),
    users: new Map()
};

module.exports = {
    connectMongoDB,
    query,
    pool: pgPool,
    memoryStorage
};`;

fs.writeFileSync('backend/config/database.js', databaseConfig);
console.log('  ✅ Created: backend/config/database.js');

// backend/config/mailer.js
const mailerConfig = `const nodemailer = require('nodemailer');

// Create transporter for development
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-password'
    }
});

// Mock email sending for development
const sendEmail = async (options) => {
    try {
        if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
            // Log email instead of sending in development
            console.log('📧 [DEV] Email would be sent:', {
                to: options.to,
                subject: options.subject,
                preview: options.html ? options.html.substring(0, 100) + '...' : 'No HTML content'
            });
            
            // Create a test email account on ethereal.email for development
            const testAccount = await nodemailer.createTestAccount();
            
            if (!process.env.SMTP_USER) {
                console.log('💡 Development tip: Use ethereal.email for testing');
                console.log('📧 Test account created:', testAccount.user);
                console.log('🔑 Password:', testAccount.pass);
                console.log('🌐 Web interface: https://ethereal.email');
            }
            
            return { success: true, devMode: true };
        }
        
        // Actual email sending
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@websutech.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
            ...(options.text && { text: options.text })
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);
        
        // Preview URL for ethereal emails
        if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
            console.log('👀 Preview URL:', nodemailer.getTestMessageUrl(info));
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending error:', error);
        return { success: false, error: error.message };
    }
};

// Email templates
const emailTemplates = {
    buyerInquiry: (data) => \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                <h1>Websutech</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2>New Buyer Inquiry Received</h2>
                <p><strong>Reference:</strong> #\${data.inquiryId}</p>
                <p><strong>Company:</strong> \${data.companyName}</p>
                <p><strong>Contact:</strong> \${data.contactPerson}</p>
                <p><strong>Product:</strong> \${data.specificProduct}</p>
                <p><strong>Quantity:</strong> \${data.quantity}</p>
                <p><strong>Submitted:</strong> \${new Date().toLocaleString()}</p>
            </div>
            <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px;">
                <p>This is an automated message from Websutech</p>
            </div>
        </div>
    \`,
    
    confirmationToBuyer: (data) => \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                <h1>Websutech</h1>
            </div>
            <div style="padding: 30px; background: white;">
                <h2>Thank You for Your Inquiry</h2>
                <p>Dear \${data.contactPerson},</p>
                <p>We have received your inquiry for <strong>\${data.specificProduct}</strong> and our team is reviewing it.</p>
                <p><strong>Inquiry Reference:</strong> #\${data.inquiryId}</p>
                <p>We will contact you within 24 hours to discuss your requirements.</p>
                <br>
                <p>Best regards,<br>The Websutech Team</p>
            </div>
            <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px;">
                <p>© \${new Date().getFullYear()} Websutech. All rights reserved.</p>
            </div>
        </div>
    \`
};

module.exports = { sendEmail, emailTemplates };`;

fs.writeFileSync('backend/config/mailer.js', mailerConfig);
console.log('  ✅ Created: backend/config/mailer.js');

// backend/routes/contact.js
const contactRoutes = `const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

// Rate limiting: 5 requests per 15 minutes
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many contact requests from this IP, please try again later.'
});

// Validation rules
const validateContact = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
    body('category').optional().isIn(['general', 'technical', 'compliance', 'sales']).withMessage('Invalid category')
];

// Routes
router.post('/submit', contactLimiter, validateContact, contactController.submitContact);
router.post('/newsletter', contactLimiter, contactController.subscribeNewsletter);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Contact API is working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;`;

fs.writeFileSync('backend/routes/contact.js', contactRoutes);
console.log('  ✅ Created: backend/routes/contact.js');

// backend/routes/inquiries.js
const inquiryRoutes = `const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const inquiryController = require('../controllers/inquiryController');

// Rate limiters
const buyerInquiryLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: 'Too many buyer inquiries. Please try again later.'
});

const sellerInquiryLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: 'Too many seller inquiries. Please try again later.'
});

// Validation rules
const validateBuyerInquiry = [
    body('companyName').trim().notEmpty().isLength({ min: 2, max: 200 }).withMessage('Valid company name is required'),
    body('contactPerson').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Valid contact person name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[\\+]?[1-9][\\d]{0,15}$/).withMessage('Valid phone number is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('productCategory').isIn(['petroleum', 'metals', 'diamonds', 'industrial']).withMessage('Invalid product category'),
    body('specificProduct').trim().notEmpty().withMessage('Specific product is required'),
    body('quantity').trim().notEmpty().withMessage('Quantity is required'),
    body('ndaAgreed').custom((value) => {
        if (value !== 'true' && value !== true) {
            throw new Error('You must agree to the NDA');
        }
        return true;
    })
];

const validateSellerInquiry = [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[\\+]?[1-9][\\d]{0,15}$/).withMessage('Valid phone number is required'),
    body('productDescription').trim().notEmpty().withMessage('Product description is required'),
    body('quantityAvailable').trim().notEmpty().withMessage('Quantity available is required'),
    body('certification').optional().trim()
];

// Routes
router.post('/buyer', buyerInquiryLimiter, validateBuyerInquiry, inquiryController.submitBuyerInquiry);
router.post('/seller', sellerInquiryLimiter, validateSellerInquiry, inquiryController.submitSellerInquiry);
router.post('/mandate', inquiryController.submitMandateApplication);
router.get('/status/:id', inquiryController.getInquiryStatus);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Inquiries API is working',
        endpoints: [
            'POST /api/inquiries/buyer',
            'POST /api/inquiries/seller',
            'POST /api/inquiries/mandate',
            'GET /api/inquiries/status/:id'
        ]
    });
});

module.exports = router;`;

fs.writeFileSync('backend/routes/inquiries.js', inquiryRoutes);
console.log('  ✅ Created: backend/routes/inquiries.js');

// backend/routes/documents.js
const documentRoutes = `const express = require('express');
const router = express.Router();
const path = require('path');

// Available documents
const documents = {
    ndas: [
        { id: 'mutual-nda', name: 'Mutual Non-Disclosure Agreement', file: 'mutual-nda.pdf', description: 'For mutual confidentiality between parties' },
        { id: 'seller-nda', name: 'Seller Non-Disclosure Agreement', file: 'seller-nda.pdf', description: 'For seller confidentiality' }
    ],
    agreements: [
        { id: 'ncnnda', name: 'Non-Circumvention Non-Disclosure Agreement', file: 'ncnnda.pdf', description: 'NCNDA for broker protection' },
        { id: 'imfpa', name: 'Irrevocable Master Fee Protection Agreement', file: 'imfpa.pdf', description: 'IMFPA for commission protection' },
        { id: 'broker-agreement', name: 'Broker Agreement', file: 'broker-agreement.pdf', description: 'Standard broker agreement' }
    ],
    compliance: [
        { id: 'kyc-policy', name: 'KYC Policy', file: 'kyc-policy.pdf', description: 'Know Your Customer policy' },
        { id: 'aml-policy', name: 'AML Policy', file: 'aml-policy.pdf', description: 'Anti-Money Laundering policy' },
        { id: 'sanctions-policy', name: 'Sanctions Policy', file: 'sanctions-policy.pdf', description: 'International sanctions compliance' }
    ],
    company: [
        { id: 'company-profile', name: 'Company Profile', file: 'company-profile.pdf', description: 'Websutech company overview' }
    ]
};

// Get all documents
router.get('/list', (req, res) => {
    res.json({
        success: true,
        documents,
        timestamp: new Date().toISOString()
    });
});

// Get specific document category
router.get('/category/:category', (req, res) => {
    const { category } = req.params;
    
    if (!documents[category]) {
        return res.status(404).json({
            success: false,
            message: 'Document category not found'
        });
    }
    
    res.json({
        success: true,
        category,
        documents: documents[category]
    });
});

// Request document access (simulated)
router.post('/request/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, company } = req.body;
    
    // Find document
    let foundDoc = null;
    for (const category in documents) {
        const doc = documents[category].find(d => d.id === id);
        if (doc) {
            foundDoc = { ...doc, category };
            break;
        }
    }
    
    if (!foundDoc) {
        return res.status(404).json({
            success: false,
            message: 'Document not found'
        });
    }
    
    // Log request (in production, save to database and send email)
    console.log('Document request:', {
        document: foundDoc.name,
        requestedBy: { name, email, company },
        timestamp: new Date().toISOString(),
        ip: req.ip
    });
    
    res.json({
        success: true,
        message: 'Document request received. You will receive an email with download instructions.',
        document: foundDoc.name,
        reference: \`DOC-\${Date.now()}\`
    });
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Documents API is working',
        availableCategories: Object.keys(documents)
    });
});

module.exports = router;`;

fs.writeFileSync('backend/routes/documents.js', documentRoutes);
console.log('  ✅ Created: backend/routes/documents.js');

// backend/controllers/contactController.js
const contactController = `const { validationResult } = require('express-validator');
const { sendEmail, emailTemplates } = require('../config/mailer');
const { v4: uuidv4 } = require('uuid');
const { memoryStorage } = require('../config/database');

exports.submitContact = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, subject, message, category = 'general' } = req.body;
        const messageId = \`CONTACT-\${Date.now()}-\${uuidv4().slice(0, 8)}\`;

        // Store in memory (replace with database in production)
        memoryStorage.contacts.set(messageId, {
            id: messageId,
            name,
            email,
            subject,
            message,
            category,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            createdAt: new Date().toISOString(),
            status: 'new'
        });

        console.log('📝 Contact form submitted:', {
            messageId,
            name,
            email,
            subject: subject.substring(0, 50) + (subject.length > 50 ? '...' : ''),
            category
        });

        // Send email to admin
        const adminEmailResult = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'contact@websutech.com',
            subject: \`New Contact Message: \${subject}\`,
            html: \`
                <h2>New Contact Message</h2>
                <p><strong>Message ID:</strong> \${messageId}</p>
                <p><strong>From:</strong> \${name} (\${email})</p>
                <p><strong>Category:</strong> \${category}</p>
                <p><strong>Subject:</strong> \${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    \${message.replace(/\\n/g, '<br>')}
                </div>
                <p><strong>Received:</strong> \${new Date().toLocaleString()}</p>
            \`
        });

        // Send confirmation to user
        const userEmailResult = await sendEmail({
            to: email,
                subject: \`New Contact Message: \${subject}\`,
                html: \`
            html: emailTemplates.confirmationToBuyer({
                contactPerson: name,
                specificProduct: 'General Inquiry',
                inquiryId: messageId
            })
        });

        res.status(200).json({
            success: true,
            message: 'Contact message sent successfully',
            messageId,
            nextSteps: [
                'We will respond to your message within 24 hours',
                'Check your email for confirmation'
            ]
        });

    } catch (error) {
        console.error('❌ Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send contact message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Valid email is required'
            });
        }

        // Store subscription
        const subscriptionId = \`NEWS-\${Date.now()}\`;
        memoryStorage.users.set(subscriptionId, {
            id: subscriptionId,
            email,
            name: name || '',
            type: 'newsletter',
            subscribedAt: new Date().toISOString(),
            active: true
        });

        console.log('📰 Newsletter subscription:', { email, name: name || 'Anonymous' });

        // Send welcome email
        await sendEmail({
            to: email,
            subject: 'Welcome to Websutech Newsletter',
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                        <h1>Websutech Newsletter</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Welcome to Our Community!</h2>
                        <p>Dear \${name || 'Subscriber'},</p>
                        <p>Thank you for subscribing to the Websutech newsletter. You'll now receive:</p>
                        <ul>
                            <li>📈 Market trends and commodity insights</li>
                            <li>🛢️ New product offerings and availability</li>
                            <li>🌍 Industry news and analysis</li>
                            <li>💎 Special offers and trading opportunities</li>
                            <li>🔒 Compliance and regulatory updates</li>
                        </ul>
                        <p>We respect your privacy. You can unsubscribe at any time by clicking the link in our emails.</p>
                        <br>
                        <p>Best regards,<br>The Websutech Team</p>
                    </div>
                    <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px;">
                        <p>© \${new Date().getFullYear()} Websutech. All rights reserved.</p>
                    </div>
                </div>
            \`
        });

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            subscriptionId
        });

    } catch (error) {
        console.error('❌ Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe to newsletter'
        });
    }
};`;

fs.writeFileSync('backend/controllers/contactController.js', contactController);
console.log('  ✅ Created: backend/controllers/contactController.js');

// backend/controllers/inquiryController.js
const inquiryController = `const { validationResult } = require('express-validator');
const { sendEmail, emailTemplates } = require('../config/mailer');
const { v4: uuidv4 } = require('uuid');
const { memoryStorage } = require('../config/database');

exports.submitBuyerInquiry = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const inquiryData = req.body;
        const inquiryId = \`BUY-\${Date.now()}-\${uuidv4().slice(0, 8)}\`;
        
        // Create inquiry record
        const inquiry = {
            id: inquiryId,
            type: 'buyer',
            ...inquiryData,
            status: 'received',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Store inquiry
        memoryStorage.inquiries.set(inquiryId, inquiry);

        // Log the inquiry
        console.log('🛒 Buyer inquiry submitted:', {
            inquiryId,
            company: inquiryData.companyName,
            product: inquiryData.specificProduct,
            quantity: inquiryData.quantity,
            contact: inquiryData.contactPerson
        });

        // Send emails
        const adminEmail = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'contact@websutech.com',
            subject: \`New Buyer Inquiry: \${inquiryData.specificProduct}\`,
            html: emailTemplates.buyerInquiry({
                inquiryId,
                companyName: inquiryData.companyName,
                contactPerson: inquiryData.contactPerson,
                specificProduct: inquiryData.specificProduct,
                quantity: inquiryData.quantity
            })
        });

        const buyerEmail = await sendEmail({
            to: inquiryData.email,
            subject: 'Websutech - Buyer Inquiry Received',
            html: emailTemplates.confirmationToBuyer({
                inquiryId,
                contactPerson: inquiryData.contactPerson,
                specificProduct: inquiryData.specificProduct
            })
        });

        res.status(201).json({
            success: true,
            message: 'Buyer inquiry submitted successfully',
            inquiryId,
            nextSteps: [
                'Our team will review your inquiry within 24 hours',
                'You will receive an NDA via email for signing',
                'After NDA execution, we will share available offers',
                'Check your email for confirmation'
            ],
            contactInfo: {
                email: inquiryData.email,
                phone: inquiryData.phone
            }
        });

    } catch (error) {
        console.error('❌ Buyer inquiry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit buyer inquiry',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.submitSellerInquiry = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const inquiryData = req.body;
        const inquiryId = \`SELL-\${Date.now()}-\${uuidv4().slice(0, 8)}\`;
        
        // Create seller inquiry record
        const inquiry = {
            id: inquiryId,
            type: 'seller',
            ...inquiryData,
            status: 'received',
            ipAddress: req.ip,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        memoryStorage.inquiries.set(inquiryId, inquiry);

        console.log('📦 Seller inquiry submitted:', {
            inquiryId,
            company: inquiryData.companyName,
            product: inquiryData.productDescription.substring(0, 50) + '...',
            contact: inquiryData.contactPerson
        });

        // Send emails
        await sendEmail({
            to: process.env.ADMIN_EMAIL || 'contact@websutech.com',
            subject: \`New Seller Inquiry: \${inquiryData.productDescription.substring(0, 50)}\${inquiryData.productDescription.length > 50 ? '...' : ''}\`,
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                        <h1>Websutech - Seller Inquiry</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2>New Seller Inquiry Received</h2>
                        <p><strong>ID:</strong> \${inquiryId}</p>
                        <p><strong>Company:</strong> \${inquiryData.companyName}</p>
                        <p><strong>Contact:</strong> \${inquiryData.contactPerson}</p>
                        <p><strong>Email:</strong> \${inquiryData.email}</p>
                        <p><strong>Phone:</strong> \${inquiryData.phone}</p>
                        <p><strong>Product:</strong> \${inquiryData.productDescription}</p>
                        <p><strong>Quantity Available:</strong> \${inquiryData.quantityAvailable}</p>
                        \${inquiryData.certification ? \`<p><strong>Certification:</strong> \${inquiryData.certification}</p>\` : ''}
                        <p><strong>Submitted:</strong> \${new Date().toLocaleString()}</p>
                    </div>
                </div>
            \`
        });

        await sendEmail({
            to: inquiryData.email,
            subject: 'Websutech - Seller Inquiry Received',
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                        <h1>Websutech</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Seller Inquiry Confirmation</h2>
                        <p>Dear \${inquiryData.contactPerson},</p>
                        <p>We have received your seller inquiry for <strong>\${inquiryData.productDescription}</strong>.</p>
                        <p><strong>Reference:</strong> \${inquiryId}</p>
                        <p>Our procurement team will review your offer and contact you within 2 business days.</p>
                        <br>
                        <p>Next Steps:</p>
                        <ol>
                            <li>Our team will verify product specifications</li>
                            <li>We will request supporting documents if needed</li>
                            <li>Quality assurance team will review</li>
                            <li>We will contact you with next steps</li>
                        </ol>
                        <br>
                        <p>Best regards,<br>The Websutech Team</p>
                    </div>
                </div>
            \`
        });

        res.status(201).json({
            success: true,
            message: 'Seller inquiry submitted successfully',
            inquiryId,
            nextSteps: [
                'Our procurement team will review within 2 business days',
                'We may request additional documentation',
                'Check your email for confirmation'
            ]
        });

    } catch (error) {
        console.error('❌ Seller inquiry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit seller inquiry'
        });
    }
};

exports.submitMandateApplication = async (req, res) => {
    try {
        const { companyName, contactPerson, email, phone, expertise, regions, experience } = req.body;
        
        if (!companyName || !contactPerson || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Company name, contact person, email, and phone are required'
            });
        }

        const mandateId = \`MANDATE-\${Date.now()}-\${uuidv4().slice(0, 8)}\`;

        // Store mandate application
        memoryStorage.inquiries.set(mandateId, {
            id: mandateId,
            type: 'mandate',
            companyName,
            contactPerson,
            email,
            phone,
            expertise: expertise || 'Not specified',
            regions: regions || 'Not specified',
            experience: experience || 'Not specified',
            status: 'received',
            createdAt: new Date().toISOString()
        });

        console.log('🤝 Mandate application submitted:', {
            mandateId,
            company: companyName,
            contact: contactPerson
        });

        // Send to admin
        await sendEmail({
            to: process.env.ADMIN_EMAIL || 'contact@websutech.com',
            subject: \`New Mandate Application: \${companyName}\`,
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                        <h1>Websutech - Mandate Application</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2>New Mandate Application</h2>
                        <p><strong>ID:</strong> \${mandateId}</p>
                        <p><strong>Company:</strong> \${companyName}</p>
                        <p><strong>Contact:</strong> \${contactPerson}</p>
                        <p><strong>Email:</strong> \${email}</p>
                        <p><strong>Phone:</strong> \${phone}</p>
                        <p><strong>Expertise:</strong> \${expertise || 'Not specified'}</p>
                        <p><strong>Regions:</strong> \${regions || 'Not specified'}</p>
                        <p><strong>Experience:</strong> \${experience || 'Not specified'}</p>
                        <p><strong>Submitted:</strong> \${new Date().toLocaleString()}</p>
                    </div>
                </div>
            \`
        });

        // Send confirmation to applicant
        await sendEmail({
            to: email,
            subject: 'Websutech - Mandate Application Received',
            html: \`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                        <h1>Websutech Mandate Program</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Mandate Application Received</h2>
                        <p>Dear \${contactPerson},</p>
                        <p>Thank you for your interest in becoming a Websutech mandate.</p>
                        <p><strong>Application Reference:</strong> \${mandateId}</p>
                        <p>Our mandate team will review your application and contact you within 3-5 business days.</p>
                        <br>
                        <p><strong>Review Process:</strong></p>
                        <ul>
                            <li>Background check and verification</li>
                            <li>Experience and expertise evaluation</li>
                            <li>Market presence assessment</li>
                            <li>Compliance and due diligence</li>
                        </ul>
                        <br>
                        <p>Best regards,<br>Websutech Mandate Department</p>
                    </div>
                </div>
            \`
        });

        res.status(201).json({
            success: true,
            message: 'Mandate application submitted successfully',
            mandateId,
            nextSteps: [
                'Our mandate team will review within 3-5 business days',
                'We will conduct background verification',
                'Check your email for confirmation'
            ]
        });

    } catch (error) {
        console.error('❌ Mandate application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit mandate application'
        });
    }
};

exports.getInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const inquiry = memoryStorage.inquiries.get(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Return minimal info for security
        res.json({
            success: true,
            status: inquiry.status,
            inquiryId: inquiry.id,
            type: inquiry.type,
            createdAt: inquiry.createdAt,
            lastUpdated: inquiry.updatedAt || inquiry.createdAt,
            nextSteps: getNextSteps(inquiry.type, inquiry.status)
        });

    } catch (error) {
        console.error('❌ Get inquiry status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get inquiry status'
        });
    }
};

// Helper function
function getNextSteps(type, status) {
    const steps = {
        buyer: {
            received: ['Review by trading desk', 'NDA preparation', 'Supplier matching'],
            reviewing: ['Supplier verification', 'Price negotiation', 'Document preparation'],
            contacted: ['Offer presentation', 'Contract negotiation', 'Payment terms finalization']
        },
        seller: {
            received: ['Product verification', 'Document review', 'Quality assessment'],
            reviewing: ['Market analysis', 'Buyer matching', 'Price evaluation'],
            contacted: ['Sample request', 'Contract discussion', 'Logistics planning']
        },
        mandate: {
            received: ['Background check', 'Experience verification', 'Market assessment'],
            reviewing: ['Interview scheduling', 'Document verification', 'Compliance check'],
            contacted: ['Agreement preparation', 'Training schedule', 'Onboarding process']
        }
    };
    
    return steps[type]?.[status] || ['Processing your request', 'Will update shortly'];
}`;

fs.writeFileSync('backend/controllers/inquiryController.js', inquiryController);
console.log('  ✅ Created: backend/controllers/inquiryController.js');

// backend/utils/logger.js
const loggerUtil = `const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = 'backend/logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'websutech-api' },
    transports: [
        // Error logs
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // All logs
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Logging functions
logger.apiLog = (req, message, level = 'info') => {
    const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        message
    };
    
    logger.log(level, logData);
};

logger.errorLog = (error, context = {}) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        ...context
    });
};

module.exports = logger;`;

fs.writeFileSync('backend/utils/logger.js', loggerUtil);
console.log('  ✅ Created: backend/utils/logger.js');

// Create frontend files
console.log('\n🎨 Creating frontend files...');

// src/index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Websutech - Global Commodity Brokerage for Petroleum, Metals, Diamonds & Industrial Products">
    <meta name="keywords" content="commodity trading, petroleum, precious metals, diamonds, industrial materials, global brokerage">
    <title>Websutech | Global Commodity Brokerage Solutions</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="icon" type="image/x-icon" href="assets/images/logo/favicon.ico">
</head>
<body>
    <!-- Header -->
    <div id="header"></div>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">Global Commodity Trading Excellence</h1>
                <p class="hero-subtitle">Connecting verified buyers with trusted suppliers worldwide. Your partner in petroleum, metals, diamonds, and industrial materials.</p>
                <div class="hero-buttons">
                    <a href="forms/buyer-inquiry.html" class="btn btn-primary">
                        <i class="fas fa-shopping-cart"></i> Buyer Inquiry
                    </a>
                    <a href="forms/seller-inquiry.html" class="btn btn-secondary">
                        <i class="fas fa-warehouse"></i> Seller Inquiry
                    </a>
                    <a href="#products" class="btn btn-outline">
                        <i class="fas fa-gem"></i> View Products
                    </a>
                </div>
            </div>
            <div class="hero-stats">
                <div class="stat">
                    <h3>500+</h3>
                    <p>Verified Suppliers</p>
                </div>
                <div class="stat">
                    <h3>47</h3>
                    <p>Countries Served</p>
                </div>
                <div class="stat">
                    <h3>$2B+</h3>
                    <p>Annual Trade Volume</p>
                </div>
                <div class="stat">
                    <h3>24/7</h3>
                    <p>Global Support</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section id="products" class="section products-section">
        <div class="container">
            <h2 class="section-title">Our Commodity Portfolio</h2>
            <p class="section-subtitle">Global sourcing and distribution of premium commodities with verified quality and compliance</p>
            
            <div class="product-categories">
                <div class="product-card">
                    <div class="product-icon" style="background: linear-gradient(135deg, #1a6a9e, #0d4d75);">
                        <i class="fas fa-gas-pump"></i>
                    </div>
                    <h3>Petroleum Products</h3>
                    <ul>
                        <li>EN590 Diesel</li>
                        <li>Jet A-1 Aviation Fuel</li>
                        <li>D2 Gas Oil</li>
                        <li>LPG & LNG</li>
                        <li>Crude Oil</li>
                    </ul>
                    <a href="products/petroleum/" class="btn-link">Explore Products <i class="fas fa-arrow-right"></i></a>
                </div>

                <div class="product-card">
                    <div class="product-icon" style="background: linear-gradient(135deg, #d4af37, #b8941f);">
                        <i class="fas fa-gem"></i>
                    </div>
                    <h3>Precious Metals</h3>
                    <ul>
                        <li>Gold Bars & Bullion</li>
                        <li>Silver Ingots</li>
                        <li>Platinum</li>
                        <li>Palladium</li>
                        <li>Rhodium</li>
                    </ul>
                    <a href="products/precious-metals/" class="btn-link">Explore Products <i class="fas fa-arrow-right"></i></a>
                </div>

                <div class="product-card">
                    <div class="product-icon" style="background: linear-gradient(135deg, #4cc9f0, #2a9dbb);">
                        <i class="fas fa-diamond"></i>
                    </div>
                    <h3>Diamonds</h3>
                    <ul>
                        <li>Rough Diamonds</li>
                        <li>Polished Diamonds</li>
                        <li>Industrial Diamonds</li>
                        <li>Gemstones</li>
                    </ul>
                    <a href="products/diamonds/" class="btn-link">Explore Products <i class="fas fa-arrow-right"></i></a>
                </div>

                <div class="product-card">
                    <div class="product-icon" style="background: linear-gradient(135deg, #38a169, #276749);">
                        <i class="fas fa-industry"></i>
                    </div>
                    <h3>Industrial Materials</h3>
                    <ul>
                        <li>Copper Cathodes</li>
                        <li>Aluminum Ingots</li>
                        <li>Steel Billets</li>
                        <li>Iron Ore</li>
                        <li>Cement</li>
                    </ul>
                    <a href="products/industrial/" class="btn-link">Explore Products <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    </section>

    <!-- Process Section -->
    <section class="section process-section" style="background: linear-gradient(135deg, #f7fafc, #e2e8f0);">
        <div class="container">
            <h2 class="section-title">Our Trading Process</h2>
            <p class="section-subtitle">Transparent, secure, and efficient trading from inquiry to delivery</p>
            
            <div class="process-steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <h3>Inquiry & NDA</h3>
                    <p>Submit requirements and sign mutual NDA for confidentiality</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <h3>Verification</h3>
                    <p>KYC compliance and document verification process</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <h3>Offer & FCO</h3>
                    <p>Receive formal offers and Full Corporate Offer (FCO)</p>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <h3>Contract & Payment</h3>
                    <p>Sign SPA and proceed with secure payment instruments</p>
                </div>
                <div class="step">
                    <div class="step-number">5</div>
                    <h3>Delivery</h3>
                    <p>Shipping, inspection, and final delivery with SGS certification</p>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <a href="process.html" class="btn btn-primary">
                    <i class="fas fa-play-circle"></i> View Detailed Process
                </a>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="section cta-section" style="background: linear-gradient(135deg, #1a365d, #2d3748); color: white;">
        <div class="container">
            <div class="cta-content">
                <h2>Ready to Start Trading?</h2>
                <p>Join hundreds of satisfied clients in our global trading network. Submit your inquiry today.</p>
                <div class="cta-buttons">
                    <a href="forms/buyer-inquiry.html" class="btn btn-primary" style="background: #d4af37; border-color: #d4af37;">
                        <i class="fas fa-file-signature"></i> Submit Buyer Inquiry
                    </a>
                    <a href="contact.html" class="btn btn-outline" style="color: white; border-color: white;">
                        <i class="fas fa-headset"></i> Contact Our Team
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <div id="footer"></div>

    <!-- JavaScript -->
    <script src="assets/js/main.js"></script>
    <script>
        // Load header and footer templates
        Promise.all([
            fetch('templates/header.html').then(r => r.text()),
            fetch('templates/footer.html').then(r => r.text())
        ]).then(([header, footer]) => {
            document.getElementById('header').innerHTML = header;
            document.getElementById('footer').innerHTML = footer;
            
            // Initialize any JavaScript that needs DOM elements
            if (typeof initMainJS === 'function') {
                initMainJS();
            }
        }).catch(error => {
            console.log('Error loading templates:', error);
            // Fallback content
            document.getElementById('header').innerHTML = '<header><nav class="container"><a href="/" class="logo">WEBSUTECH</a></nav></header>';
            document.getElementById('footer').innerHTML = '<footer class="container"><p>&copy; ' + new Date().getFullYear() + ' Websutech</p></footer>';
        });
        
        // Simple form handling for demo
        document.addEventListener('submit', function(e) {
            if (e.target.tagName === 'FORM') {
                e.preventDefault();
                const form = e.target;
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                console.log('Form submitted:', data);
                alert('Form submitted successfully! In production, this would be sent to the server.');
                form.reset();
            }
        });
    </script>
    
    <!-- Simple analytics for demo -->
    <script>
        console.log('Websutech website loaded successfully');
        console.log('API Health:', window.location.origin + '/api/health');
    </script>
</body>
</html>`;

fs.writeFileSync('src/index.html', indexHtml);
console.log('  ✅ Created: src/index.html');

// Create CSS files
console.log('\n🎨 Creating CSS files...');

// src/assets/css/main.css
const mainCss = `/* Main CSS File - Imports all styles */
@import url('base/reset.css');
@import url('layout/header.css');
@import url('layout/footer.css');
@import url('layout/grid.css');
@import url('components/buttons.css');
@import url('components/forms.css');
@import url('components/cards.css');
@import url('pages/home.css');
@import url('pages/products.css');
@import url('responsive.css');

/* Global Styles */
:root {
    /* Color Palette */
    --primary-color: #1a365d;
    --secondary-color: #d4af37;
    --accent-color: #2d3748;
    --success-color: #38a169;
    --danger-color: #e53e3e;
    --warning-color: #d69e2e;
    --info-color: #3182ce;
    
    /* Neutral Colors */
    --white: #ffffff;
    --light-gray: #f7fafc;
    --gray: #e2e8f0;
    --dark-gray: #4a5568;
    --black: #1a202c;
    
    /* Typography */
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-heading: 'Georgia', 'Times New Roman', serif;
    
    /* Spacing */
    --space-xs: 0.5rem;
    --space-sm: 1rem;
    --space-md: 1.5rem;
    --space-lg: 2rem;
    --space-xl: 3rem;
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
    --shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 300ms ease;
    --transition-slow: 500ms ease;
}

/* Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    font-size: 16px;
}

body {
    font-family: var(--font-primary);
    line-height: 1.6;
    color: var(--accent-color);
    background-color: var(--white);
    overflow-x: hidden;
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-md);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 700;
    line-height: 1.2;
    color: var(--primary-color);
    margin-bottom: var(--space-sm);
}

h1 { font-size: 3rem; }
h2 { font-size: 2.5rem; }
h3 { font-size: 2rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1rem; }

p {
    margin-bottom: var(--space-md);
    line-height: 1.7;
}

a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-normal);
}

a:hover {
    color: var(--secondary-color);
}

/* Utility Classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.text-justify { text-align: justify; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: var(--space-sm); }
.mt-2 { margin-top: var(--space-md); }
.mt-3 { margin-top: var(--space-lg); }
.mt-4 { margin-top: var(--space-xl); }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: var(--space-sm); }
.mb-2 { margin-bottom: var(--space-md); }
.mb-3 { margin-bottom: var(--space-lg); }
.mb-4 { margin-bottom: var(--space-xl); }

.p-0 { padding: 0; }
.p-1 { padding: var(--space-sm); }
.p-2 { padding: var(--space-md); }
.p-3 { padding: var(--space-lg); }
.p-4 { padding: var(--space-xl); }

.hidden { display: none !important; }
.visible { display: block !important; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

.grid { display: grid; }
.gap-1 { gap: var(--space-sm); }
.gap-2 { gap: var(--space-md); }
.gap-3 { gap: var(--space-lg); }

/* Loading Animation */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn var(--transition-normal) ease-out;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.spin {
    animation: spin 1s linear infinite;
}

/* Print Styles */
@media print {
    .no-print { display: none !important; }
    
    body {
        font-size: 12pt;
        line-height: 1.5;
    }
    
    a {
        text-decoration: none;
        color: black;
    }
    
    .container {
        max-width: 100%;
        padding: 0;
    }
}`;

fs.writeFileSync('src/assets/css/main.css', mainCss);
console.log('  ✅ Created: src/assets/css/main.css');

// Create a few more essential CSS files (abbreviated for brevity)
const cssFiles = {
    'base/reset.css': `/* CSS Reset */
*,
*::before,
*::after {
    box-sizing: border-box;
}

html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
    display: block;
}

body {
    line-height: 1;
}

ol,
ul {
    list-style: none;
}

blockquote,
q {
    quotes: none;
}

blockquote:before,
blockquote:after,
q:before,
q:after {
    content: '';
    content: none;
}

table {
    border-collapse: collapse;
    border-spacing: 0;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}

button {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
}

input,
textarea,
select {
    font: inherit;
}

:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

:focus:not(:focus-visible) {
    outline: none;
}`,

    'components/buttons.css': `/* Button Styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 2px solid transparent;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
}

.btn-primary {
    background-color: var(--primary-color);
    color: var(--white);
}

.btn-primary:hover {
    background-color: #0f2b5a;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background-color: var(--secondary-color);
    color: var(--white);
}

.btn-secondary:hover {
    background-color: #c19a2b;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-outline {
    background-color: transparent;
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.btn-outline:hover {
    background-color: var(--primary-color);
    color: var(--white);
    transform: translateY(-2px);
}

.btn-link {
    color: var(--primary-color);
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    background: none;
    border: none;
}

.btn-link:hover {
    color: var(--secondary-color);
    gap: 12px;
}

.btn-link i {
    transition: transform var(--transition-normal);
}

.btn-link:hover i {
    transform: translateX(4px);
}

/* Button Sizes */
.btn-sm {
    padding: 8px 16px;
    font-size: 0.875rem;
}

.btn-lg {
    padding: 16px 32px;
    font-size: 1.125rem;
}

.btn-xl {
    padding: 20px 40px;
    font-size: 1.25rem;
    font-weight: 700;
}

/* Button States */
.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.btn-loading {
    position: relative;
    color: transparent !important;
}

.btn-loading::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--white);
    animation: spin 1s linear infinite;
}

/* Floating Action Button */
.btn-fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-lg);
}

.btn-fab:hover {
    transform: scale(1.1);
}

/* Button Groups */
.btn-group {
    display: inline-flex;
    gap: 1px;
    border-radius: var(--radius-md);
    overflow: hidden;
}

.btn-group .btn {
    border-radius: 0;
    margin: 0;
}

.btn-group .btn:first-child {
    border-top-left-radius: var(--radius-md);
    border-bottom-left-radius: var(--radius-md);
}

.btn-group .btn:last-child {
    border-top-right-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
}`,

    'responsive.css': `/* Responsive Design */
/* Mobile First Approach */

/* Extra small devices (phones, less than 576px) */
@media (max-width: 575.98px) {
    html {
        font-size: 14px;
    }
    
    .container {
        padding: 0 15px;
    }
    
    h1 { font-size: 2rem; }
    h2 { font-size: 1.75rem; }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    
    .section {
        padding: 60px 0;
    }
    
    .hero-title {
        font-size: 2rem;
        line-height: 1.3;
    }
    
    .hero-subtitle {
        font-size: 1.1rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-sm);
    }
    
    .hero-buttons .btn {
        width: 100%;
        justify-content: center;
    }
    
    .product-categories {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
    }
    
    .process-steps {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
    }
    
    .step {
        padding-top: 80px;
    }
    
    .form-row {
        flex-direction: column;
    }
    
    .form-group {
        width: 100%;
    }
}

/* Small devices (tablets, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
    .container {
        padding: 0 20px;
    }
    
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.75rem; }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .product-categories {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .process-steps {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-lg);
    }
}

/* Medium devices (laptops, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
    .container {
        max-width: 960px;
    }
    
    .product-categories {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .process-steps {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .step:nth-child(4),
    .step:nth-child(5) {
        grid-column: span 1;
    }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
    .container {
        max-width: 1140px;
    }
    
    .product-categories {
        grid-template-columns: repeat(4, 1fr);
    }
    
    .process-steps {
        grid-template-columns: repeat(5, 1fr);
    }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
    .container {
        max-width: 1320px;
    }
}

/* Print specific styles */
@media print {
    .no-print {
        display: none !important;
    }
    
    body {
        font-size: 12pt;
        line-height: 1.5;
        color: black;
        background: white;
    }
    
    a {
        color: black;
        text-decoration: underline;
    }
    
    .container {
        max-width: 100%;
        padding: 0;
    }
    
    .page-break {
        page-break-before: always;
    }
    
    h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
    }
    
    img {
        max-width: 100% !important;
        page-break-inside: avoid;
    }
    
    table, figure {
        page-break-inside: avoid;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    :root {
        --primary-color: #4299e1;
        --secondary-color: #ecc94b;
        --accent-color: #cbd5e0;
        --white: #1a202c;
        --light-gray: #2d3748;
        --gray: #4a5568;
        --dark-gray: #cbd5e0;
        --black: #f7fafc;
    }
    
    body {
        color: var(--dark-gray);
        background-color: var(--white);
    }
    
    h1, h2, h3, h4, h5, h6 {
        color: var(--accent-color);
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* High contrast mode */
@media (prefers-contrast: high) {
    :root {
        --primary-color: #000000;
        --secondary-color: #000000;
        --accent-color: #000000;
        --white: #ffffff;
        --light-gray: #ffffff;
        --gray: #ffffff;
        --dark-gray: #000000;
        --black: #000000;
    }
    
    * {
        border-color: currentColor !important;
    }
}`,

    'pages/home.css': `/* Homepage Specific Styles */
.hero {
    background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
    color: var(--white);
    padding: 6rem 0;
    position: relative;
    overflow: hidden;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('../../images/backgrounds/world-map.svg') center/cover no-repeat;
    opacity: 0.1;
}

.hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 800px;
    margin: 0 auto 4rem;
}

.hero-title {
    font-size: 3.5rem;
    color: var(--white);
    margin-bottom: 1.5rem;
    line-height: 1.2;
    animation: fadeIn 1s ease-out;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    animation: fadeIn 1s ease-out 0.2s both;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    animation: fadeIn 1s ease-out 0.4s both;
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 4rem;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
    animation: fadeIn 1s ease-out 0.6s both;
}

.stat {
    text-align: center;
}

.stat h3 {
    font-size: 2.5rem;
    color: var(--secondary-color);
    margin-bottom: 0.5rem;
    font-weight: 700;
}

.stat p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0;
}

/* Products Section */
.products-section {
    padding: 5rem 0;
    background-color: var(--light-gray);
}

.section-title {
    text-align: center;
    margin-bottom: 1rem;
    position: relative;
}

.section-title::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: var(--secondary-color);
    margin: 1rem auto;
    border-radius: 2px;
}

.section-subtitle {
    text-align: center;
    color: var(--dark-gray);
    max-width: 600px;
    margin: 0 auto 3rem;
    font-size: 1.1rem;
}

.product-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.product-card {
    background-color: var(--white);
    border-radius: var(--radius-lg);
    padding: 2rem;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
    text-align: center;
    position: relative;
    overflow: hidden;
}

.product-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.product-card:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-lg);
}

.product-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--primary-color), var(--info-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    transition: transform var(--transition-normal);
}

.product-card:hover .product-icon {
    transform: scale(1.1) rotate(5deg);
}

.product-icon i {
    font-size: 2.5rem;
    color: var(--white);
}

.product-card h3 {
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-size: 1.5rem;
}

.product-card ul {
    list-style: none;
    margin-bottom: 1.5rem;
    text-align: left;
}

.product-card ul li {
    padding: 0.5rem 0;
    color: var(--dark-gray);
    border-bottom: 1px solid var(--gray);
    position: relative;
    padding-left: 1.5rem;
}

.product-card ul li:last-child {
    border-bottom: none;
}

.product-card ul li::before {
    content: '✓';
    color: var(--success-color);
    position: absolute;
    left: 0;
    font-weight: bold;
}

/* Process Section */
.process-section {
    padding: 5rem 0;
    background-color: var(--white);
}

.process-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    counter-reset: step-counter;
    position: relative;
}

.process-steps::before {
    content: '';
    position: absolute;
    top: 40px;
    left: 50px;
    right: 50px;
    height: 3px;
    background: var(--gray);
    z-index: 1;
}

@media (max-width: 768px) {
    .process-steps::before {
        display: none;
    }
}

.step {
    text-align: center;
    position: relative;
    padding-top: 4rem;
    z-index: 2;
}

.step::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background-color: var(--light-gray);
    border-radius: 50%;
    z-index: 1;
}

.step-number {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
    background-color: var(--primary-color);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    z-index: 2;
}

.step h3 {
    margin: 1.5rem 0 0.5rem;
    font-size: 1.25rem;
}

.step p {
    color: var(--dark-gray);
    font-size: 0.9rem;
    margin-bottom: 0;
}

/* CTA Section */
.cta-section {
    padding: 5rem 0;
    text-align: center;
}

.cta-content {
    max-width: 800px;
    margin: 0 auto;
}

.cta-content h2 {
    color: var(--white);
    margin-bottom: 1rem;
}

.cta-content p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

/* Animation for elements */
@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

.floating {
    animation: float 3s ease-in-out infinite;
}

/* Responsive adjustments for homepage */
@media (max-width: 768px) {
    .hero {
        padding: 4rem 0;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-subtitle {
        font-size: 1.1rem;
    }
    
    .hero-stats {
        gap: 2rem;
    }
    
    .stat h3 {
        font-size: 2rem;
    }
    
    .product-categories {
        grid-template-columns: 1fr;
    }
    
    .process-steps {
        grid-template-columns: 1fr;
    }
    
    .cta-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .cta-buttons .btn {
        width: 100%;
        max-width: 300px;
    }
}`,

    'layout/header.css': `/* Header Styles */
.main-header {
    background-color: var(--white);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 1rem 0;
    transition: all var(--transition-normal);
}

.main-header.scrolled {
    padding: 0.5rem 0;
    box-shadow: var(--shadow-md);
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    text-decoration: none;
}

.logo img {
    height: 40px;
    width: auto;
    transition: transform var(--transition-normal);
}

.logo:hover img {
    transform: scale(1.1);
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
    align-items: center;
}

.nav-menu li {
    position: relative;
}

.nav-menu a {
    color: var(--accent-color);
    font-weight: 500;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    gap: 5px;
}

.nav-menu a:hover {
    color: var(--primary-color);
    background-color: var(--light-gray);
}

.nav-menu a.active {
    color: var(--secondary-color);
    background-color: rgba(212, 175, 55, 0.1);
}

/* Dropdown Menu */
.dropdown {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var(--white);
    box-shadow: var(--shadow-lg);
    border-radius: var(--radius-md);
    min-width: 220px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all var(--transition-normal);
    z-index: 100;
    padding: 0.5rem 0;
}

.dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-menu a {
    display: block;
    padding: 12px 20px;
    border-bottom: 1px solid var(--gray);
    color: var(--accent-color);
    white-space: nowrap;
}

.dropdown-menu a:last-child {
    border-bottom: none;
}

.dropdown-menu a:hover {
    background-color: var(--light-gray);
    color: var(--primary-color);
    padding-left: 25px;
}

/* Mobile Menu Toggle */
.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
    gap: 4px;
    padding: 8px;
    background: none;
    border: none;
    z-index: 1001;
}

.nav-toggle span {
    width: 25px;
    height: 3px;
    background-color: var(--primary-color);
    border-radius: 2px;
    transition: 0.3s;
}

.nav-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
}

.nav-toggle.active span:nth-child(2) {
    opacity: 0;
}

.nav-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu */
.mobile-menu {
    display: none;
    background-color: var(--white);
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    box-shadow: var(--shadow-lg);
    z-index: 999;
    padding: 1rem;
    transform: translateY(-100%);
    transition: transform var(--transition-normal);
    max-height: calc(100vh - 70px);
    overflow-y: auto;
}

.mobile-menu.active {
    transform: translateY(0);
}

.mobile-menu a {
    display: block;
    padding: 12px 16px;
    color: var(--accent-color);
    border-bottom: 1px solid var(--gray);
    font-weight: 500;
}

.mobile-menu a:last-child {
    border-bottom: none;
}

.mobile-menu a:hover {
    background-color: var(--light-gray);
    color: var(--primary-color);
}

.mobile-dropdown-btn {
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    background: none;
    border: none;
    color: var(--accent-color);
    border-bottom: 1px solid var(--gray);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    font-size: 1rem;
}

.mobile-dropdown-content {
    display: none;
    padding-left: 20px;
    background-color: var(--light-gray);
}

.mobile-dropdown-content.active {
    display: block;
}

.mobile-dropdown-content a {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Responsive Header */
@media (max-width: 768px) {
    .nav-menu {
        display: none;
    }
    
    .nav-toggle {
        display: flex;
    }
    
    .mobile-menu {
        display: block;
    }
}

/* Header animations */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.main-header {
    animation: slideDown 0.5s ease-out;
}

/* Language selector (if needed) */
.language-selector {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    background: var(--light-gray);
    cursor: pointer;
    transition: all var(--transition-normal);
}

.language-selector:hover {
    background: var(--gray);
}

.language-selector img {
    width: 20px;
    height: 15px;
    border-radius: 2px;
}

.language-selector span {
    font-size: 0.875rem;
    font-weight: 500;
}`,

    'layout/footer.css': `/* Footer Styles */
.main-footer {
    background-color: var(--primary-color);
    color: var(--white);
    padding: 4rem 0 2rem;
    position: relative;
}

.main-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--secondary-color), var(--info-color));
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.footer-col h4 {
    color: var(--white);
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    position: relative;
    padding-bottom: 0.5rem;
}

.footer-col h4::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: var(--secondary-color);
    border-radius: 2px;
}

.footer-col ul {
    list-style: none;
}

.footer-col ul li {
    margin-bottom: 0.75rem;
}

.footer-col ul li a {
    color: rgba(255, 255, 255, 0.8);
    transition: all var(--transition-normal);
    display: inline-block;
}

.footer-col ul li a:hover {
    color: var(--secondary-color);
    transform: translateX(5px);
}

.footer-description {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
    line-height: 1.6;
    font-size: 0.95rem;
}

.social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.social-links a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: var(--white);
    transition: all var(--transition-normal);
}

.social-links a:hover {
    background-color: var(--secondary-color);
    transform: translateY(-3px) scale(1.1);
}

.contact-info li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.8);
}

.contact-info i {
    color: var(--secondary-color);
    margin-top: 4px;
    min-width: 20px;
}

.btn-footer {
    background-color: var(--secondary-color);
    color: var(--white);
    padding: 12px 24px;
    border-radius: var(--radius-md);
    display: inline-block;
    margin-top: var(--space-sm);
    font-weight: 600;
    transition: all var(--transition-normal);
}

.btn-footer:hover {
    background-color: #c19a2b;
    color: var(--white);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.footer-bottom-left {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.footer-bottom p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0;
    font-size: 0.9rem;
}

.footer-links {
    display: flex;
    gap: 1.5rem;
}

.footer-links a {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    transition: color var(--transition-normal);
}

.footer-links a:hover {
    color: var(--secondary-color);
}

.footer-bottom-right {
    text-align: right;
}

.certifications {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
}

.certifications span {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Back to top button */
.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background-color: var(--secondary-color);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
    z-index: 999;
    box-shadow: var(--shadow-lg);
}

.back-to-top.visible {
    opacity: 1;
    visibility: visible;
}

.back-to-top:hover {
    background-color: #c19a2b;
    transform: translateY(-5px);
}

/* Newsletter form in footer */
.newsletter-form {
    margin-top: 1rem;
}

.newsletter-form input {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: var(--radius-sm);
    margin-bottom: 0.5rem;
}

.newsletter-form input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.newsletter-form button {
    width: 100%;
    padding: 12px;
    background: var(--secondary-color);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-normal);
}

.newsletter-form button:hover {
    background: #c19a2b;
}

/* Responsive footer */
@media (max-width: 768px) {
    .footer-bottom {
        flex-direction: column;
        text-align: center;
    }
    
    .footer-bottom-left,
    .footer-bottom-right {
        width: 100%;
        justify-content: center;
    }
    
    .footer-links {
        justify-content: center;
        margin-top: 1rem;
    }
    
    .certifications {
        justify-content: center;
    }
    
    .footer-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
    }
    
    .footer-col {
        text-align: center;
    }
    
    .footer-col h4::after {
        left: 50%;
        transform: translateX(-50%);
    }
    
    .social-links {
        justify-content: center;
    }
    
    .contact-info li {
        justify-content: center;
    }
    
    .back-to-top {
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
    }
}

/* Animation for footer elements */
.footer-col {
    animation: fadeIn 0.8s ease-out;
}

.footer-col:nth-child(1) { animation-delay: 0.1s; }
.footer-col:nth-child(2) { animation-delay: 0.2s; }
.footer-col:nth-child(3) { animation-delay: 0.3s; }
.footer-col:nth-child(4) { animation-delay: 0.4s; }`
};

// Create all CSS files
Object.entries(cssFiles).forEach(([filePath, content]) => {
    fs.writeFileSync(`src/assets/css/${filePath}`, content);
    console.log(`  ✅ Created: src/assets/css/${filePath}`);
});

// Create template files
console.log('\n📄 Creating template files...');

const templates = {
    'header.html': `<header class="main-header">
    <div class="container">
        <nav class="navbar">
            <a href="/" class="logo">
                <!-- Add your logo here -->
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1a365d, #d4af37); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">W</div>
                <span>WEBSUTECH</span>
            </a>
            
            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            
            <ul class="nav-menu" id="navMenu">
                <li><a href="/" class="active"><i class="fas fa-home"></i> Home</a></li>
                <li class="dropdown">
                    <a href="#"><i class="fas fa-boxes"></i> Products <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-menu">
                        <a href="products/petroleum/"><i class="fas fa-gas-pump"></i> Petroleum Products</a>
                        <a href="products/precious-metals/"><i class="fas fa-gem"></i> Precious Metals</a>
                        <a href="products/diamonds/"><i class="fas fa-diamond"></i> Diamonds</a>
                        <a href="products/industrial/"><i class="fas fa-industry"></i> Industrial Materials</a>
                    </div>
                </li>
                <li><a href="services.html"><i class="fas fa-handshake"></i> Services</a></li>
                <li><a href="process.html"><i class="fas fa-sitemap"></i> Process</a></li>
                <li><a href="compliance.html"><i class="fas fa-shield-alt"></i> Compliance</a></li>
                <li><a href="about.html"><i class="fas fa-info-circle"></i> About</a></li>
                <li><a href="contact.html" class="btn-contact"><i class="fas fa-envelope"></i> Contact</a></li>
            </ul>
        </nav>
    </div>
</header>

<div class="mobile-menu" id="mobileMenu">
    <a href="/"><i class="fas fa-home"></i> Home</a>
    <div class="mobile-dropdown">
        <button class="mobile-dropdown-btn"><i class="fas fa-boxes"></i> Products <i class="fas fa-chevron-down"></i></button>
        <div class="mobile-dropdown-content">
            <a href="products/petroleum/"><i class="fas fa-gas-pump"></i> Petroleum</a>
            <a href="products/precious-metals/"><i class="fas fa-gem"></i> Precious Metals</a>
            <a href="products/diamonds/"><i class="fas fa-diamond"></i> Diamonds</a>
            <a href="products/industrial/"><i class="fas fa-industry"></i> Industrial</a>
        </div>
    </div>
    <a href="services.html"><i class="fas fa-handshake"></i> Services</a>
    <a href="process.html"><i class="fas fa-sitemap"></i> Process</a>
    <a href="compliance.html"><i class="fas fa-shield-alt"></i> Compliance</a>
    <a href="about.html"><i class="fas fa-info-circle"></i> About</a>
    <a href="contact.html"><i class="fas fa-envelope"></i> Contact</a>
</div>

<div class="back-to-top" id="backToTop">
    <i class="fas fa-arrow-up"></i>
</div>`,

    'footer.html': `<footer class="main-footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-col">
                <div class="logo" style="color: white; margin-bottom: 1rem;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #d4af37, #ffffff); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #1a365d; font-weight: bold;">W</div>
                    <span>WEBSUTECH</span>
                </div>
                <p class="footer-description">
                    Global commodity brokerage specializing in petroleum, metals, diamonds, 
                    and industrial materials. Connecting verified buyers with trusted suppliers worldwide.
                </p>
                <div class="social-links">
                    <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                </div>
            </div>

            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="/"><i class="fas fa-chevron-right"></i> Home</a></li>
                    <li><a href="about.html"><i class="fas fa-chevron-right"></i> About Us</a></li>
                    <li><a href="services.html"><i class="fas fa-chevron-right"></i> Our Services</a></li>
                    <li><a href="process.html"><i class="fas fa-chevron-right"></i> Trading Process</a></li>
                    <li><a href="compliance.html"><i class="fas fa-chevron-right"></i> Compliance</a></li>
                    <li><a href="contact.html"><i class="fas fa-chevron-right"></i> Contact Us</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Products</h4>
                <ul>
                    <li><a href="products/petroleum/"><i class="fas fa-chevron-right"></i> Petroleum</a></li>
                    <li><a href="products/precious-metals/"><i class="fas fa-chevron-right"></i> Precious Metals</a></li>
                    <li><a href="products/diamonds/"><i class="fas fa-chevron-right"></i> Diamonds</a></li>
                    <li><a href="products/industrial/"><i class="fas fa-chevron-right"></i> Industrial</a></li>
                    <li><a href="products.html"><i class="fas fa-chevron-right"></i> All Products</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Contact Info</h4>
                <ul class="contact-info">
                    <li><i class="fas fa-envelope"></i> contact@websutech.com</li>
                    <li><i class="fas fa-phone"></i> +1 (555) 123-4567</li>
                    <li><i class="fas fa-phone"></i> +44 20 1234 5678</li>
                    <li><i class="fas fa-map-marker-alt"></i> Global Headquarters</li>
                    <li>Dubai, UAE | Singapore | London, UK</li>
                </ul>
                <a href="contact.html" class="btn-footer">
                    <i class="fas fa-paper-plane"></i> Send Message
                </a>
                
                <div class="newsletter-form">
                    <h4 style="margin-top: 1.5rem;">Newsletter</h4>
                    <input type="email" placeholder="Your email address" id="newsletterEmail">
                    <button id="newsletterSubscribe">Subscribe</button>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="footer-bottom-left">
                <p>&copy; <span id="currentYear"></span> Websutech. All rights reserved.</p>
                <div class="footer-links">
                    <a href="disclaimer.html">Disclaimer</a>
                    <a href="privacy-policy.html">Privacy Policy</a>
                    <a href="terms.html">Terms of Service</a>
                    <a href="sitemap.html">Sitemap</a>
                </div>
            </div>
            <div class="footer-bottom-right">
                <p>Certified & Compliant</p>
                <div class="certifications">
                    <span>ISO 9001</span>
                    <span>AML/KYC</span>
                    <span>FCPA</span>
                    <span>GDPR</span>
                </div>
            </div>
        </div>
    </div>
</footer>

<script>
    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Newsletter subscription
    document.getElementById('newsletterSubscribe').addEventListener('click', function() {
        const email = document.getElementById('newsletterEmail').value;
        if (email && email.includes('@')) {
            fetch('/api/contact/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Subscribed successfully!');
                document.getElementById('newsletterEmail').value = '';
            })
            .catch(error => {
                console.error('Subscription error:', error);
                alert('Subscription failed. Please try again.');
            });
        } else {
            alert('Please enter a valid email address.');
        }
    });
    
    // Back to top functionality
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
</script>`
};

Object.entries(templates).forEach(([fileName, content]) => {
    fs.writeFileSync(`src/templates/${fileName}`, content);
    console.log(`  ✅ Created: src/templates/${fileName}`);
});

// Create JavaScript files
console.log('\n⚡ Creating JavaScript files...');

const jsFiles = {
    'main.js': `// Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Websutech main.js loaded');
    
    // Mobile Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileDropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Mobile Dropdown Toggle
    mobileDropdownBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            content.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    });
    
    // Close mobile menu when clicking outside or on a link
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar') && !event.target.closest('.mobile-menu')) {
            if (navToggle) navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Close mobile menu when clicking a link
        if (event.target.closest('.mobile-menu a')) {
            if (navToggle) navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (navToggle) navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Header scroll effect
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navToggle) navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Form validation and handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Basic validation
            const inputs = this.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'This field is required';
                    input.parentNode.appendChild(errorMsg);
                } else {
                    input.classList.remove('error');
                    const errorMsg = input.parentNode.querySelector('.error-message');
                    if (errorMsg) errorMsg.remove();
                }
            });
            
            if (!isValid) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }
            
            // Simulate API call
            try {
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                // Determine API endpoint based on form ID or action
                let endpoint = '/api/contact/submit';
                if (this.id === 'buyerInquiryForm') endpoint = '/api/inquiries/buyer';
                if (this.id === 'sellerInquiryForm') endpoint = '/api/inquiries/seller';
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    this.innerHTML = \`
                        <div class="form-success">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3>Successfully Submitted!</h3>
                            <p>\${result.message}</p>
                            \${result.inquiryId ? \`<p><strong>Reference:</strong> \${result.inquiryId}</p>\` : ''}
                            \${result.nextSteps ? \`
                                <div class="next-steps">
                                    <h4>Next Steps:</h4>
                                    <ul>
                                        \${result.nextSteps.map(step => \`<li>\${step}</li>\`).join('')}
                                    </ul>
                                </div>
                            \` : ''}
                            <button type="button" class="btn btn-primary" onclick="location.reload()">
                                Submit Another
                            </button>
                        </div>
                    \`;
                    
                    // Track conversion
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submission', {
                            'event_category': 'Form',
                            'event_label': this.id || 'form'
                        });
                    }
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Failed to submit form. Please try again or contact us directly.');
                
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    });
    
    // Product card animations
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'custom-tooltip';
            tooltipEl.textContent = tooltipText;
            document.body.appendChild(tooltipEl);
            
            const rect = this.getBoundingClientRect();
            tooltipEl.style.position = 'fixed';
            tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
            tooltipEl.style.top = (rect.top - tooltipEl.offsetHeight - 10) + 'px';
            tooltipEl.style.opacity = '1';
            
            this._tooltipElement = tooltipEl;
        });
        
        tooltip.addEventListener('mouseleave', function() {
            if (this._tooltipElement) {
                this._tooltipElement.remove();
            }
        });
    });
    
    // Initialize date pickers if any
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
        }
    });
    
    // Initialize select dropdowns with search if needed
    const selectElements = document.querySelectorAll('select');
    selectElements.forEach(select => {
        if (select.options.length > 10) {
            select.setAttribute('data-searchable', 'true');
        }
    });
    
    // Add CSS for tooltips
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = \`
        .custom-tooltip {
            position: absolute;
            background: var(--primary-color);
            color: white;
            padding: 8px 12px;
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            max-width: 200px;
            text-align: center;
            box-shadow: var(--shadow-md);
        }
        
        .custom-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: var(--primary-color) transparent transparent transparent;
        }
        
        .error-message {
            color: var(--danger-color);
            font-size: 0.875rem;
            margin-top: 4px;
        }
        
        input.error, textarea.error, select.error {
            border-color: var(--danger-color) !important;
        }
        
        .form-success {
            text-align: center;
            padding: 2rem;
            background: var(--light-gray);
            border-radius: var(--radius-lg);
        }
        
        .success-icon {
            font-size: 4rem;
            color: var(--success-color);
            margin-bottom: 1rem;
        }
        
        .next-steps {
            text-align: left;
            background: white;
            padding: 1rem;
            border-radius: var(--radius-md);
            margin: 1rem 0;
        }
        
        .next-steps ul {
            list-style: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
        }
        
        .next-steps li {
            margin-bottom: 0.5rem;
            color: var(--dark-gray);
        }
    \`;
    document.head.appendChild(tooltipStyle);
    
    // Test API connection
    testAPI();
});

async function testAPI() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('✅ API Health:', data);
    } catch (error) {
        console.log('⚠️  API not available, running in static mode');
    }
}

// Make functions available globally
window.initMainJS = function() {
    console.log('Main JS initialized');
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMainJS };
}`,

    'form-handler.js': `// Form Handler JavaScript
class FormHandler {
    constructor() {
        this.forms = [];
        this.init();
    }
    
    init() {
        // Initialize all forms on the page
        this.forms = document.querySelectorAll('form');
        this.forms.forEach(form => this.setupForm(form));
        
        // Setup multi-step forms
        this.setupMultiStepForms();
        
        // Setup file uploads
        this.setupFileUploads();
        
        console.log(\`Form handler initialized with \${this.forms.length} forms\`);
    }
    
    setupForm(form) {
        // Add honeypot field
        this.addHoneypot(form);
        
        // Add timestamp
        this.addTimestamp(form);
        
        // Add form validation
        this.addValidation(form);
        
        // Handle submission
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }
    
    setupMultiStepForms() {
        const multiStepForms = document.querySelectorAll('.multi-step-form');
        
        multiStepForms.forEach(form => {
            const steps = form.querySelectorAll('.form-step');
            const nextButtons = form.querySelectorAll('.next-step');
            const prevButtons = form.querySelectorAll('.prev-step');
            
            let currentStep = 0;
            
            // Initialize
            this.showStep(form, currentStep);
            
            // Next button
            nextButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (this.validateStep(form, currentStep)) {
                        currentStep++;
                        this.showStep(form, currentStep);
                        this.updateProgress(form, currentStep, steps.length);
                    }
                });
            });
            
            // Previous button
            prevButtons.forEach(button => {
                button.addEventListener('click', () => {
                    currentStep--;
                    this.showStep(form, currentStep);
                    this.updateProgress(form, currentStep, steps.length);
                });
            });
        });
    }
    
    setupFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const files = e.target.files;
                const maxSize = 10 * 1024 * 1024; // 10MB
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                
                // Validate each file
                for (let file of files) {
                    // Check size
                    if (file.size > maxSize) {
                        alert(\`File "\${file.name}" is too large. Maximum size is 10MB.\`);
                        input.value = '';
                        return;
                    }
                    
                    // Check type
                    if (!allowedTypes.includes(file.type)) {
                        alert(\`File "\${file.name}" has unsupported format. Please upload PDF, JPEG, PNG, GIF, or DOC files.\`);
                        input.value = '';
                        return;
                    }
                }
                
                // Show file names
                this.showFileNames(input, files);
            });
        });
    }
    
    addHoneypot(form) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.className = 'hp-field';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.setAttribute('tabindex', '-1');
        form.appendChild(honeypot);
    }
    
    addTimestamp(form) {
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'timestamp';
        timestamp.value = Date.now();
        form.appendChild(timestamp);
    }
    
    addValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => this.validateField(input));
            
            // Clear error on input
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.clearError(input);
                }
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        
        // Clear previous error
        this.clearError(field);
        
        // Required validation
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\\+]?[1-9][\\d]{0,15}$/;
            const cleaned = value.replace(/[\\s\\-\\(\\)]/g, '');
            if (!phoneRegex.test(cleaned)) {
                this.showError(field, 'Please enter a valid phone number');
                return false;
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                this.showError(field, 'Please enter a valid URL');
                return false;
            }
        }
        
        // Min length validation
        const minLength = field.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            this.showError(field, \`Minimum \${minLength} characters required\`);
            return false;
        }
        
        // Max length validation
        const maxLength = field.getAttribute('maxlength');
        if (maxLength && value.length > parseInt(maxLength)) {
            this.showError(field, \`Maximum \${maxLength} characters allowed\`);
            return false;
        }
        
        return true;
    }
    
    validateStep(form, stepIndex) {
        const step = form.querySelectorAll('.form-step')[stepIndex];
        if (!step) return true;
        
        const inputs = step.querySelectorAll('[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        // Scroll to error if needed
        const rect = errorElement.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    showStep(form, stepIndex) {
        const steps = form.querySelectorAll('.form-step');
        
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
                step.style.display = 'block';
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });
    }
    
    updateProgress(form, currentStep, totalSteps) {
        const progress = form.querySelector('.form-progress');
        if (progress) {
            const percent = (currentStep / (totalSteps - 1)) * 100;
            progress.style.width = percent + '%';
        }
        
        const stepIndicator = form.querySelector('.step-indicator');
        if (stepIndicator) {
            stepIndicator.textContent = \`Step \${currentStep + 1} of \${totalSteps}\`;
        }
    }
    
    showFileNames(input, files) {
        // Remove previous file display
        const existingDisplay = input.nextElementSibling;
        if (existingDisplay && existingDisplay.classList.contains('file-display')) {
            existingDisplay.remove();
        }
        
        if (files.length === 0) return;
        
        const fileDisplay = document.createElement('div');
        fileDisplay.className = 'file-display';
        
        const fileList = document.createElement('ul');
        fileList.style.marginTop = '8px';
        fileList.style.fontSize = '0.875rem';
        
        Array.from(files).forEach(file => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '4px';
            listItem.style.display = 'flex';
            listItem.style.alignItems = 'center';
            listItem.style.gap = '8px';
            
            const icon = document.createElement('i');
            icon.className = this.getFileIcon(file.type);
            
            const fileName = document.createElement('span');
            fileName.textContent = \`\${file.name} (\${this.formatFileSize(file.size)})\`;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.style.background = 'none';
            removeBtn.style.border = 'none';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.color = 'var(--danger-color)';
            removeBtn.addEventListener('click', () => {
                input.value = '';
                fileDisplay.remove();
            });
            
            listItem.appendChild(icon);
            listItem.appendChild(fileName);
            listItem.appendChild(removeBtn);
            fileList.appendChild(listItem);
        });
        
        fileDisplay.appendChild(fileList);
        input.parentNode.appendChild(fileDisplay);
    }
    
    getFileIcon(fileType) {
        if (fileType.includes('image/')) return 'fas fa-image';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word')) return 'fas fa-file-word';
        if (fileType.includes('excel')) return 'fas fa-file-excel';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async handleSubmit(event, form) {
        event.preventDefault();
        
        // Check honeypot
        const honeypot = form.querySelector('.hp-field');
        if (honeypot && honeypot.value) {
            console.log('Bot detected by honeypot');
            // Don't submit, but show success to confuse bots
            this.showSuccess(form, 'Form submitted successfully');
            return;
        }
        
        // Check submission time (if less than 2 seconds, likely bot)
        const timestamp = form.querySelector('input[name="timestamp"]');
        if (timestamp) {
            const submitTime = Date.now();
            const startTime = parseInt(timestamp.value);
            if (submitTime - startTime < 2000) {
                console.log('Form submitted too quickly');
                // Still allow, but log for monitoring
            }
        }
        
        // Validate all fields
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            // Prepare form data
            const formData = new FormData(form);
            const data = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    // Convert to array if multiple values
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            
            // Determine API endpoint
            let endpoint = form.getAttribute('action') || '/api/contact/submit';
            if (form.id === 'buyerInquiryForm') endpoint = '/api/inquiries/buyer';
            if (form.id === 'sellerInquiryForm') endpoint = '/api/inquiries/seller';
            if (form.id === 'mandateApplicationForm') endpoint = '/api/inquiries/mandate';
            
            // Send to API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(form, result);
                
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'Form',
                        'event_label': form.id || 'form',
                        'value': 1
                    });
                }
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Fallback: Show error and suggest email
            this.showErrorFallback(form, error.message);
            
            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = originalContent;
        }
    }
    
    showSuccess(form, result) {
        form.innerHTML = \`
            <div class="form-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Successfully Submitted!</h3>
                <p>\${result.message || 'Thank you for your submission.'}</p>
                
                \${result.inquiryId ? \`
                    <div class="reference-number">
                        <p><strong>Reference Number:</strong></p>
                        <div class="ref-id">\${result.inquiryId}</div>
                    </div>
                \` : ''}
                
                \${result.nextSteps ? \`
                    <div class="next-steps">
                        <h4>What happens next?</h4>
                        <ul>
                            \${result.nextSteps.map(step => \`<li>\${step}</li>\`).join('')}
                        </ul>
                    </div>
                \` : ''}
                
                <div class="success-actions">
                    <button type="button" class="btn btn-primary" onclick="location.reload()">
                        Submit Another
                    </button>
                    <a href="/" class="btn btn-outline">
                        Return to Home
                    </a>
                </div>
                
                <div class="contact-info">
                    <p><strong>Need immediate assistance?</strong></p>
                    <p>Email: <a href="mailto:contact@websutech.com">contact@websutech.com</a></p>
                    <p>Phone: +1 (555) 123-4567</p>
                </div>
            </div>
        \`;
        
        // Add some CSS for the success state
        const style = document.createElement('style');
        style.textContent = \`
            .form-success {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #f7fafc, #e2e8f0);
                border-radius: var(--radius-lg);
                animation: fadeIn 0.5s ease-out;
            }
            
            .success-icon {
                font-size: 4rem;
                color: var(--success-color);
                margin-bottom: 1rem;
            }
            
            .reference-number {
                background: white;
                padding: 1rem;
                border-radius: var(--radius-md);
                margin: 1rem 0;
                border: 2px solid var(--success-color);
            }
            
            .ref-id {
                font-family: monospace;
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-color);
                letter-spacing: 1px;
            }
            
            .next-steps {
                text-align: left;
                background: white;
                padding: 1.5rem;
                border-radius: var(--radius-md);
                margin: 1.5rem 0;
            }
            
            .next-steps h4 {
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            
            .next-steps ul {
                list-style: disc;
                padding-left: 1.5rem;
            }
            
            .next-steps li {
                margin-bottom: 0.5rem;
                color: var(--dark-gray);
            }
            
            .success-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
            }
            
            .contact-info {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray);
                font-size: 0.9rem;
                color: var(--dark-gray);
            }
            
            .contact-info a {
                color: var(--primary-color);
                font-weight: 600;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        \`;
        document.head.appendChild(style);
    }
    
    showErrorFallback(form, errorMessage) {
        const errorHTML = \`
            <div class="form-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <h3>Submission Failed</h3>
                <p>\${errorMessage || 'There was an error submitting your form.'}</p>
                <p>Please try one of these alternatives:</p>
                
                <div class="alternative-options">
                    <div class="option">
                        <h4>Email Us Directly</h4>
                        <a href="mailto:contact@websutech.com" class="btn btn-primary">
                            <i class="fas fa-envelope"></i> Send Email
                        </a>
                    </div>
                    
                    <div class="option">
                        <h4>Call Us</h4>
                        <a href="tel:+15551234567" class="btn btn-secondary">
                            <i class="fas fa-phone"></i> +1 (555) 123-4567
                        </a>
                    </div>
                </div>
                
                <div class="retry-section">
                    <p>Or try submitting again:</p>
                    <button type="button" class="btn btn-outline" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            </div>
        \`;
        
        form.innerHTML = errorHTML;
        
        // Add CSS for error state
        const style = document.createElement('style');
        style.textContent = \`
            .form-error {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #fff5f5, #fed7d7);
                border-radius: var(--radius-lg);
                animation: fadeIn 0.5s ease-out;
            }
            
            .error-icon {
                font-size: 4rem;
                color: var(--danger-color);
                margin-bottom: 1rem;
            }
            
            .alternative-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            
            .option {
                background: white;
                padding: 1.5rem;
                border-radius: var(--radius-md);
                border: 1px solid var(--gray);
            }
            
            .option h4 {
                margin-bottom: 1rem;
                color: var(--primary-color);
            }
            
            .retry-section {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray);
            }
        \`;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}`,

    'security.js': `// Security JavaScript
class SecurityManager {
    constructor() {
        this.botDetected = false;
        this.init();
    }
    
    init() {
        this.detectBots();
        this.addFormProtection();
        this.preventInspection();
        this.addCopyProtection();
        this.rateLimitForms();
        this.monitorActivity();
        
        console.log('🔒 Security manager initialized');
    }
    
    detectBots() {
        // Check user agent for bot indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const botIndicators = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python', 'java', 'php', 'ruby', 'perl', 'go-http-client',
            'okhttp', 'requests', 'scrapy', 'headless', 'phantomjs',
            'selenium', 'puppeteer', 'playwright'
        ];
        
        if (botIndicators.some(indicator => userAgent.includes(indicator))) {
            this.botDetected = true;
            this.logSuspiciousActivity('Bot detected by user agent: ' + userAgent);
        }
        
        // Check for automation tools
        if (typeof window.__nightmare !== 'undefined' ||
            typeof window._selenium !== 'undefined' ||
            typeof window.callPhantom !== 'undefined') {
            this.botDetected = true;
            this.logSuspiciousActivity('Automation tool detected');
        }
        
        // Check screen properties
        if (screen.width === 0 || screen.height === 0 ||
            (screen.width < 200 && screen.height < 200)) {
            this.botDetected = true;
            this.logSuspiciousActivity('Suspicious screen size: ' + screen.width + 'x' + screen.height);
        }
        
        // Check for headless browser
        this.detectHeadless();
    }
    
    detectHeadless() {
        // Check for headless browser indicators
        const tests = {
            // Chrome headless
            chrome: () => {
                if (!window.chrome) return false;
                if (navigator.plugins.length === 0) return true;
                if (navigator.languages.length === 0) return true;
                return false;
            },
            
            // Firefox headless
            firefox: () => {
                if (!window.InstallTrigger) return false;
                if (navigator.plugins.length === 0) return true;
                return false;
            },
            
            // WebDriver property
            webdriver: () => {
                return navigator.webdriver === true;
            },
            
            // Languages property
            languages: () => {
                return navigator.languages === undefined;
            },
            
            // Permissions API
            permissions: () => {
                if (!navigator.permissions) return false;
                return new Promise(resolve => {
                    navigator.permissions.query({ name: 'notifications' })
                        .then(permissionStatus => {
                            if (permissionStatus.state === 'prompt' && 
                                Notification.permission === 'denied') {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch(() => resolve(false));
                });
            }
        };
        
        // Run tests
        let headlessDetected = false;
        
        // Synchronous tests
        if (tests.chrome() || tests.firefox() || tests.webdriver() || tests.languages()) {
            headlessDetected = true;
        }
        
        // Async test
        if (tests.permissions) {
            tests.permissions().then(isHeadless => {
                if (isHeadless) {
                    headlessDetected = true;
                    this.logSuspiciousActivity('Headless browser detected');
                }
            });
        }
        
        if (headlessDetected) {
            this.botDetected = true;
        }
    }
    
    addFormProtection() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add honeypot field
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.cssText = 'position: absolute; left: -9999px;';
            honeypot.setAttribute('aria-hidden', 'true');
            honeypot.setAttribute('tabindex', '-1');
            form.appendChild(honeypot);
            
            // Add time-based token
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'security_token';
            tokenInput.value = this.generateToken();
            form.appendChild(tokenInput);
            
            // Add submission timestamp
            const timestampInput = document.createElement('input');
            timestampInput.type = 'hidden';
            timestampInput.name = 'submission_time';
            timestampInput.value = Date.now();
            form.appendChild(timestampInput);
            
            // Add mouse movement detection
            let mouseMoved = false;
            document.addEventListener('mousemove', () => {
                mouseMoved = true;
            });
            
            form.addEventListener('submit', (e) => {
                // Check honeypot
                if (honeypot.value) {
                    e.preventDefault();
                    this.logSuspiciousActivity('Form submission blocked by honeypot');
                    this.showFakeSuccess(form);
                    return false;
                }
                
                // Check token
                const currentToken = tokenInput.value;
                const expectedToken = this.generateToken();
                if (currentToken !== expectedToken) {
                    e.preventDefault();
                    this.logSuspiciousActivity('Invalid security token');
                    return false;
                }
                
                // Check submission time (if less than 1 second, likely bot)
                const submitTime = Date.now();
                const startTime = parseInt(timestampInput.value);
                if (submitTime - startTime < 1000) {
                    this.logSuspiciousActivity('Form submitted too quickly: ' + (submitTime - startTime) + 'ms');
                    // Still allow, but log it
                }
                
                // Check if mouse moved (basic human interaction)
                if (!mouseMoved) {
                    this.logSuspiciousActivity('Form submitted without mouse movement');
                    // Still allow, but log it
                }
                
                // Rate limiting check
                if (!this.checkRateLimit(form)) {
                    e.preventDefault();
                    alert('Please wait before submitting another form.');
                    return false;
                }
                
                // Update rate limit
                this.updateRateLimit(form);
            });
        });
    }
    
    generateToken() {
        const timestamp = Math.floor(Date.now() / 1000 / 60); // Change every minute
        const secret = 'websutech-security-' + timestamp;
        return btoa(secret).replace(/=/g, '');
    }
    
    showFakeSuccess(form) {
        // Show fake success to confuse bots
        form.innerHTML = \`
            <div class="fake-success">
                <h3>Thank You!</h3>
                <p>Your form has been submitted successfully.</p>
                <p>We will contact you shortly.</p>
            </div>
        \`;
        
        // Add some styling
        const style = document.createElement('style');
        style.textContent = \`
            .fake-success {
                text-align: center;
                padding: 2rem;
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 0.25rem;
                color: #155724;
            }
        \`;
        document.head.appendChild(style);
    }
    
    preventInspection() {
        // Disable right-click on sensitive elements
        const sensitiveElements = document.querySelectorAll('.price, .contact-info, [data-sensitive], input[type="email"]');
        
        sensitiveElements.forEach(el => {
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
            
            // Prevent text selection
            el.style.userSelect = 'none';
            el.style.webkitUserSelect = 'none';
            el.style.msUserSelect = 'none';
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+U
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
        });
        
        // Disable view source
        Object.defineProperty(document, 'onselectstart', {
            get: function() {},
            set: function() {}
        });
    }
    
    addCopyProtection() {
        // Add copyright notice on copy
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            if (selection.length > 50) {
                const copyright = \`\\n\\n---\\nSource: Websutech (https://websutech.com)\\n© \${new Date().getFullYear()} Websutech. All rights reserved.\\n\\n\`;
                e.clipboardData.setData('text/plain', selection + copyright);
                e.preventDefault();
                
                // Show notification
                this.showCopyNotification();
            }
        });
        
        // Prevent drag and drop of images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
    }
    
    showCopyNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = \`
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        \`;
        
        notification.innerHTML = \`
            <i class="fas fa-copyright"></i>
            <span>Content copied with copyright notice</span>
        \`;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    }
    
    rateLimitForms() {
        this.rateLimits = new Map();
        
        // Clean up old entries every minute
        setInterval(() => {
            const now = Date.now();
            for (const [key, timestamps] of this.rateLimits.entries()) {
                const recent = timestamps.filter(time => now - time < 300000); // 5 minutes
                if (recent.length === 0) {
                    this.rateLimits.delete(key);
                } else {
                    this.rateLimits.set(key, recent);
                }
            }
        }, 60000);
    }
    
    checkRateLimit(form) {
        const key = form.id || form.action || 'default';
        const now = Date.now();
        const timestamps = this.rateLimits.get(key) || [];
        
        // Remove timestamps older than 5 minutes
        const recent = timestamps.filter(time => now - time < 300000);
        
        // Check rate: maximum 3 submissions per 5 minutes
        if (recent.length >= 3) {
            return false;
        }
        
        return true;
    }
    
    updateRateLimit(form) {
        const key = form.id || form.action || 'default';
        const now = Date.now();
        const timestamps = this.rateLimits.get(key) || [];
        
        timestamps.push(now);
        this.rateLimits.set(key, timestamps);
    }
    
    monitorActivity() {
        // Track rapid clicks (bot-like behavior)
        let clickCount = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            
            if (now - lastClickTime < 100) { // Less than 100ms between clicks
                clickCount++;
                
                if (clickCount > 10) { // More than 10 rapid clicks
                    this.botDetected = true;
                    this.logSuspiciousActivity('Rapid clicking detected: ' + clickCount + ' clicks');
                }
            } else {
                clickCount = 0;
            }
            
            lastClickTime = now;
        });
        
        // Track mouse movement patterns
        let mousePositions = [];
        let lastPosition = { x: 0, y: 0 };
        
        document.addEventListener('mousemove', (e) => {
            const position = { x: e.clientX, y: e.clientY };
            mousePositions.push(position);
            
            // Keep only last 50 positions
            if (mousePositions.length > 50) {
                mousePositions.shift();
            }
            
            // Check for linear movement (bot-like)
            if (mousePositions.length >= 10) {
                const isLinear = this.checkLinearMovement(mousePositions);
                if (isLinear) {
                    this.logSuspiciousActivity('Linear mouse movement detected (possible bot)');
                }
            }
            
            lastPosition = position;
        });
        
        // Track keyboard patterns
        let keystrokes = [];
        
        document.addEventListener('keydown', (e) => {
            keystrokes.push({
                key: e.key,
                time: Date.now(),
                code: e.code
            });
            
            // Keep only last 100 keystrokes
            if (keystrokes.length > 100) {
                keystrokes.shift();
            }
            
            // Check for rapid typing
            if (keystrokes.length >= 10) {
                const recent = keystrokes.slice(-10);
                const times = recent.map(k => k.time);
                const intervals = [];
                
                for (let i = 1; i < times.length; i++) {
                    intervals.push(times[i] - times[i - 1]);
                }
                
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                
                if (avgInterval < 50) { // Less than 50ms between keystrokes
                    this.logSuspiciousActivity('Rapid typing detected: ' + avgInterval.toFixed(2) + 'ms average');
                }
            }
        });
    }
    
    checkLinearMovement(positions) {
        // Simple check for linear movement
        if (positions.length < 3) return false;
        
        const dx1 = positions[1].x - positions[0].x;
        const dy1 = positions[1].y - positions[0].y;
        
        for (let i = 2; i < positions.length; i++) {
            const dx2 = positions[i].x - positions[i - 1].x;
            const dy2 = positions[i].y - positions[i - 1].y;
            
            // Check if direction is similar
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            const angleDiff = Math.abs(angle1 - angle2);
            
            if (angleDiff > 0.1) { // More than 0.1 radian difference
                return false;
            }
        }
        
        return true;
    }
    
    logSuspiciousActivity(message) {
        console.warn('🔒 Security Alert:', message);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'security_alert', {
                'event_category': 'Security',
                'event_label': message,
                'non_interaction': true
            });
        }
        
        // Send to server if API is available
        this.reportToServer({
            type: 'security_alert',
            message: message,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            botDetected: this.botDetected
        });
    }
    
    async reportToServer(data) {
        try {
            await fetch('/api/security/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (error) {
            // Silent fail - it's okay if logging fails
        }
    }
    
    // Utility functions for frontend use
    static validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }
    
    static validatePhone(phone) {
        const re = /^[\\+]?[1-9][\\d]{0,15}$/;
        return re.test(String(phone).replace(/[\\s\\-\\(\\)]/g, ''));
    }
    
    static obfuscateEmail(email) {
        if (!email || !email.includes('@')) return email;
        
        const [local, domain] = email.split('@');
        const obfuscatedLocal = local.length > 2 
            ? local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
            : local;
        
        return obfuscatedLocal + '@' + domain;
    }
    
    static generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
        password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
        password += '0123456789'.charAt(Math.floor(Math.random() * 10));
        password += '!@#$%^&*'.charAt(Math.floor(Math.random() * 8));
        
        // Fill the rest
        for (let i = 4; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Shuffle
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
}

// Initialize security manager
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
    
    // Make utility functions available globally
    window.WebsutechSecurity = {
        validateEmail: SecurityManager.validateEmail,
        validatePhone: SecurityManager.validatePhone,
        obfuscateEmail: SecurityManager.obfuscateEmail,
        generatePassword: SecurityManager.generatePassword
    };
    
    console.log('🔒 Security utilities available as window.WebsutechSecurity');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}`
};

Object.entries(jsFiles).forEach(([fileName, content]) => {
    fs.writeFileSync(`src/assets/js/${fileName}`, content);
    console.log(`  ✅ Created: src/assets/js/${fileName}`);
});

// Create some basic HTML pages
console.log('\n📄 Creating basic HTML pages...');

const basicPages = {
    'about.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us | Websutech</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="header"></div>
    
    <section class="page-hero">
        <div class="container">
            <h1>About Websutech</h1>
            <p>Trusted global commodity brokerage since 2010</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <div class="about-content">
                <h2>Our Story</h2>
                <p>Founded in 2010, Websutech has grown from a small trading firm into a globally recognized commodity brokerage. Our journey began with a simple mission: to create transparent, efficient, and reliable trading solutions for both buyers and sellers in the international commodity markets.</p>
                
                <p>Today, we operate across 47 countries and have facilitated over $2 billion in trade volume. Our success is built on three pillars: integrity, expertise, and client satisfaction.</p>
                
                <div class="mission-vision">
                    <div class="mission">
                        <h3><i class="fas fa-bullseye"></i> Our Mission</h3>
                        <p>To bridge the gap between commodity producers and consumers through innovative trading solutions, ensuring fair pricing, reliable supply chains, and mutually beneficial partnerships.</p>
                    </div>
                    <div class="vision">
                        <h3><i class="fas fa-eye"></i> Our Vision</h3>
                        <p>To be the world's most trusted commodity brokerage, setting industry standards for transparency, compliance, and client satisfaction in global commodity trading.</p>
                    </div>
                </div>
                
                <h2>Why Choose Websutech?</h2>
                <div class="features-grid">
                    <div class="feature">
                        <i class="fas fa-shield-alt"></i>
                        <h3>Verified Counterparties</h3>
                        <p>All buyers and sellers undergo rigorous KYC/AML verification and due diligence.</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-globe"></i>
                        <h3>Global Network</h3>
                        <p>Access to suppliers and buyers in over 47 countries worldwide with local market expertise.</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-file-contract"></i>
                        <h3>Secure Documentation</h3>
                        <p>Comprehensive NDA, NCNDA, IMFPA, and SPA protection with legal compliance.</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-headset"></i>
                        <h3>24/7 Support</h3>
                        <p>Round-the-clock multilingual support for all trading operations across time zones.</p>
                    </div>
                </div>
                
                <h2>Our Values</h2>
                <div class="values">
                    <div class="value">
                        <h3><i class="fas fa-handshake"></i> Integrity</h3>
                        <p>We conduct business with honesty, transparency, and ethical standards.</p>
                    </div>
                    <div class="value">
                        <h3><i class="fas fa-users"></i> Partnership</h3>
                        <p>We build long-term relationships based on mutual trust and success.</p>
                    </div>
                    <div class="value">
                        <h3><i class="fas fa-lightbulb"></i> Innovation</h3>
                        <p>We continuously improve our processes and adopt new technologies.</p>
                    </div>
                    <div class="value">
                        <h3><i class="fas fa-trophy"></i> Excellence</h3>
                        <p>We strive for the highest standards in everything we do.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <div id="footer"></div>
    
    <script src="assets/js/main.js"></script>
    <script>
        fetch('templates/header.html')
            .then(response => response.text())
            .then(data => document.getElementById('header').innerHTML = data);
        
        fetch('templates/footer.html')
            .then(response => response.text())
            .then(data => document.getElementById('footer').innerHTML = data);
    </script>
    
    <style>
        .mission-vision {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .mission, .vision {
            background: var(--light-gray);
            padding: 2rem;
            border-radius: var(--radius-lg);
            border-left: 4px solid var(--secondary-color);
        }
        
        .mission h3, .vision h3 {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--primary-color);
        }
        
        .features-grid, .values {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .feature, .value {
            text-align: center;
            padding: 1.5rem;
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            transition: transform var(--transition-normal);
        }
        
        .feature:hover, .value:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }
        
        .feature i, .value i {
            font-size: 2.5rem;
            color: var(--secondary-color);
            margin-bottom: 1rem;
        }
        
        .feature h3, .value h3 {
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }
    </style>
</body>
</html>`,

    'contact.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us | Websutech</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="header"></div>
    
    <section class="page-hero">
        <div class="container">
            <h1>Contact Us</h1>
            <p>Get in touch with our global trading team</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <div class="contact-grid">
                <div class="contact-info">
                    <h2>Get in Touch</h2>
                    <p>Have questions about our services or ready to start trading? Our team is here to help.</p>
                    
                    <div class="contact-details">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <h3>Email</h3>
                                <p>contact@websutech.com</p>
                                <p>contact@websutech.com</p>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <div>
                                <h3>Phone</h3>
                                <p>+1 (555) 123-4567 (Americas)</p>
                                <p>+44 20 1234 5678 (Europe)</p>
                                <p>+971 4 123 4567 (Middle East)</p>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <h3>Global Offices</h3>
                                <p><strong>Dubai, UAE:</strong> Business Bay, Dubai</p>
                                <p><strong>Singapore:</strong> Raffles Place, Singapore</p>
                                <p><strong>London, UK:</strong> City of London, UK</p>
                                <p><strong>Houston, USA:</strong> Texas, USA</p>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <h3>Business Hours</h3>
                                <p>24/7 Trading Desk</p>
                                <p>Monday - Friday: 9:00 AM - 6:00 PM (Local)</p>
                                <p>Emergency support available 24/7</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="emergency-contact">
                        <h3><i class="fas fa-exclamation-triangle"></i> Emergency Contact</h3>
                        <p>For urgent matters outside business hours:</p>
                        <p><strong>Phone:</strong> +1 (555) 987-6543</p>
                        <p><strong>Email:</strong> contact@websutech.com</p>
                    </div>
                </div>
                
                <div class="contact-form">
                    <h2>Send Message</h2>
                    <form id="contactForm" class="contact-form">
                        <div class="form-group">
                            <label for="name">Full Name *</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="company">Company Name</label>
                            <input type="text" id="company" name="company">
                        </div>
                        
                        <div class="form-group">
                            <label for="subject">Subject *</label>
                            <select id="subject" name="subject" required>
                                <option value="">Select a subject</option>
                                <option value="general">General Inquiry</option>
                                <option value="buyer">Buyer Inquiry</option>
                                <option value="seller">Seller Inquiry</option>
                                <option value="mandate">Mandate Application</option>
                                <option value="technical">Technical Support</option>
                                <option value="compliance">Compliance Question</option>
                                <option value="partnership">Partnership Opportunity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="message">Message *</label>
                            <textarea id="message" name="message" rows="6" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox">
                                <input type="checkbox" name="newsletter" value="yes">
                                <span>Subscribe to our newsletter for market insights</span>
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section" style="background: var(--light-gray);">
        <div class="container">
            <h2 class="text-center">Departments</h2>
            <p class="text-center section-subtitle">Contact the right department for faster response</p>
            
            <div class="departments-grid">
                <div class="department">
                    <h3><i class="fas fa-shopping-cart"></i> Buyer Inquiries</h3>
                    <p>contact@websutech.com</p>
                    <p>+1 (555) 123-4501</p>
                </div>
                
                <div class="department">
                    <h3><i class="fas fa-warehouse"></i> Seller Inquiries</h3>
                    <p>contact@websutech.com</p>
                    <p>+1 (555) 123-4502</p>
                </div>
                
                <div class="department">
                    <h3><i class="fas fa-file-contract"></i> Compliance</h3>
                    <p>contact@websutech.com</p>
                    <p>+1 (555) 123-4503</p>
                </div>
                
                <div class="department">
                    <h3><i class="fas fa-handshake"></i> Partnerships</h3>
                    <p>contact@websutech.com</p>
                    <p>+1 (555) 123-4504</p>
                </div>
            </div>
        </div>
    </section>
    
    <div id="footer"></div>
    
    <script src="assets/js/main.js"></script>
    <script src="assets/js/form-handler.js"></script>
    <script>
        fetch('templates/header.html')
            .then(response => response.text())
            .then(data => document.getElementById('header').innerHTML = data);
        
        fetch('templates/footer.html')
            .then(response => response.text())
            .then(data => document.getElementById('footer').innerHTML = data);
    </script>
    
    <style>
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 3rem;
        }
        
        .contact-details {
            margin: 2rem 0;
        }
        
        .contact-item {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-sm);
        }
        
        .contact-item i {
            font-size: 1.5rem;
            color: var(--secondary-color);
            margin-top: 0.5rem;
        }
        
        .contact-item h3 {
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }
        
        .emergency-contact {
            background: linear-gradient(135deg, #fff5f5, #fed7d7);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            border-left: 4px solid var(--danger-color);
            margin-top: 2rem;
        }
        
        .emergency-contact h3 {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--danger-color);
            margin-bottom: 1rem;
        }
        
        .departments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .department {
            text-align: center;
            padding: 1.5rem;
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
        }
        
        .department h3 {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .department p {
            margin-bottom: 0.5rem;
            color: var(--dark-gray);
        }
        
        .contact-form {
            background: white;
            padding: 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--gray);
            border-radius: var(--radius-sm);
            font-size: 1rem;
            transition: border-color var(--transition-normal);
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
        }
        
        .checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        
        .checkbox input {
            width: auto;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</body>
</html>`,

    'services.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our Services | Websutech</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="header"></div>
    
    <section class="page-hero">
        <div class="container">
            <h1>Our Services</h1>
            <p>Comprehensive commodity trading and brokerage solutions</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <h2 class="text-center">Brokerage Services</h2>
            <p class="text-center section-subtitle">End-to-end trading solutions for global commodity markets</p>
            
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-search-dollar"></i>
                    </div>
                    <h3>Buyer Representation</h3>
                    <ul>
                        <li>Sourcing of verified products worldwide</li>
                        <li>Price negotiation and market analysis</li>
                        <li>Supplier verification and due diligence</li>
                        <li>Contract negotiation and management</li>
                        <li>Quality assurance and inspection coordination</li>
                    </ul>
                </div>
                
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3>Seller Representation</h3>
                    <ul>
                        <li>Market access to global buyers</li>
                        <li>Price optimization and market positioning</li>
                        <li>Buyer verification and credit checks</li>
                        <li>Sales strategy and contract management</li>
                        <li>Payment security and collection</li>
                    </ul>
                </div>
                
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-file-contract"></i>
                    </div>
                    <h3>Mandate Services</h3>
                    <ul>
                        <li>Exclusive buying/selling mandates</li>
                        <li>Strategic partnership development</li>
                        <li>Market intelligence and research</li>
                        <li>Risk management and mitigation</li>
                        <li>Long-term supply chain solutions</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section" style="background: var(--light-gray);">
        <div class="container">
            <h2 class="text-center">Value-Added Services</h2>
            
            <div class="value-services">
                <div class="value-service">
                    <h3><i class="fas fa-shield-alt"></i> Compliance & Due Diligence</h3>
                    <p>Comprehensive KYC/AML verification, sanctions screening, and regulatory compliance checks for all counterparties.</p>
                </div>
                
                <div class="value-service">
                    <h3><i class="fas fa-balance-scale"></i> Contract Management</h3>
                    <p>Drafting, negotiation, and management of SPAs, NDAs, NCNDAs, IMFPAs, and other trading agreements.</p>
                </div>
                
                <div class="value-service">
                    <h3><i class="fas fa-ship"></i> Logistics Coordination</h3>
                    <p>End-to-end logistics planning, shipping coordination, insurance, and customs clearance support.</p>
                </div>
                
                <div class="value-service">
                    <h3><i class="fas fa-file-invoice-dollar"></i> Payment Solutions</h3>
                    <p>Secure payment structuring, escrow services, letter of credit facilitation, and payment verification.</p>
                </div>
                
                <div class="value-service">
                    <h3><i class="fas fa-clipboard-check"></i> Quality Assurance</h3>
                    <p>Third-party inspection coordination (SGS, Bureau Veritas), quality certification, and sample testing.</p>
                </div>
                
                <div class="value-service">
                    <h3><i class="fas fa-chart-bar"></i> Market Intelligence</h3>
                    <p>Real-time market analysis, price forecasting, supply-demand analysis, and strategic advisory.</p>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <h2 class="text-center">Trading Process</h2>
            
            <div class="process-details">
                <div class="process-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Initial Inquiry & NDA</h3>
                        <p>Submit your requirements and sign a mutual Non-Disclosure Agreement to protect confidential information.</p>
                        <ul>
                            <li>Buyer/Seller registration</li>
                            <li>Mutual NDA execution</li>
                            <li>Initial requirements assessment</li>
                        </ul>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Verification & Due Diligence</h3>
                        <p>Comprehensive KYC/AML verification, document validation, and counterparty due diligence.</p>
                        <ul>
                            <li>Company registration verification</li>
                            <li>Banking references check</li>
                            <li>Trade history validation</li>
                            <li>Compliance screening</li>
                        </ul>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Offer & Negotiation</h3>
                        <p>Receive formal offers, negotiate terms, and finalize pricing and contract conditions.</p>
                        <ul>
                            <li>Formal Corporate Offer (FCO)</li>
                            <li>Price and terms negotiation</li>
                            <li>Contract drafting</li>
                            <li>Payment terms finalization</li>
                        </ul>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Contract Execution</h3>
                        <p>Sign Sales and Purchase Agreement (SPA) and proceed with payment instrument setup.</p>
                        <ul>
                            <li>SPA signing</li>
                            <li>Payment instrument setup</li>
                            <li>Performance bond issuance</li>
                            <li>Escrow arrangement</li>
                        </ul>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h3>Delivery & Settlement</h3>
                        <p>Product delivery, inspection, documentation, and final payment settlement.</p>
                        <ul>
                            <li>Shipping and logistics</li>
                            <li>Third-party inspection</li>
                            <li>Document presentation</li>
                            <li>Final payment release</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <a href="process.html" class="btn btn-primary">
                    <i class="fas fa-info-circle"></i> View Detailed Process
                </a>
                <a href="contact.html" class="btn btn-outline">
                    <i class="fas fa-headset"></i> Contact for Services
                </a>
            </div>
        </div>
    </section>
    
    <div id="footer"></div>
    
    <script src="assets/js/main.js"></script>
    <script>
        fetch('templates/header.html')
            .then(response => response.text())
            .then(data => document.getElementById('header').innerHTML = data);
        
        fetch('templates/footer.html')
            .then(response => response.text())
            .then(data => document.getElementById('footer').innerHTML = data);
    </script>
    
    <style>
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .service-card {
            background: white;
            padding: 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            transition: transform var(--transition-normal);
        }
        
        .service-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-lg);
        }
        
        .service-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }
        
        .service-icon i {
            font-size: 2rem;
            color: white;
        }
        
        .service-card h3 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .service-card ul {
            list-style: none;
        }
        
        .service-card ul li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--gray);
            position: relative;
            padding-left: 1.5rem;
        }
        
        .service-card ul li:last-child {
            border-bottom: none;
        }
        
        .service-card ul li::before {
            content: '✓';
            color: var(--success-color);
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        
        .value-services {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .value-service {
            background: white;
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            border-left: 4px solid var(--secondary-color);
        }
        
        .value-service h3 {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .value-service i {
            color: var(--secondary-color);
        }
        
        .process-details {
            max-width: 800px;
            margin: 2rem auto;
        }
        
        .process-step {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--gray);
        }
        
        .process-step:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .step-number {
            min-width: 60px;
            height: 60px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .step-content h3 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .step-content ul {
            list-style: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
        }
        
        .step-content li {
            margin-bottom: 0.25rem;
            color: var(--dark-gray);
        }
        
        @media (max-width: 768px) {
            .process-step {
                flex-direction: column;
                gap: 1rem;
            }
            
            .step-number {
                align-self: flex-start;
            }
        }
    </style>
</body>
</html>`
};

Object.entries(basicPages).forEach(([fileName, content]) => {
    fs.writeFileSync(`src/${fileName}`, content);
    console.log(`  ✅ Created: src/${fileName}`);
});

// Create a simple products page
const productsPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our Products | Websutech</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="header"></div>
    
    <section class="page-hero">
        <div class="container">
            <h1>Our Products</h1>
            <p>Global commodity portfolio with verified quality and compliance</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <div class="products-overview">
                <h2 class="text-center">Commodity Categories</h2>
                <p class="text-center section-subtitle">Browse our comprehensive range of globally traded commodities</p>
                
                <div class="category-grid">
                    <a href="products/petroleum/" class="category-card">
                        <div class="category-icon">
                            <i class="fas fa-gas-pump"></i>
                        </div>
                        <h3>Petroleum Products</h3>
                        <p>Refined petroleum products including diesel, jet fuel, and crude oil</p>
                        <span class="category-link">View Products <i class="fas fa-arrow-right"></i></span>
                    </a>
                    
                    <a href="products/precious-metals/" class="category-card">
                        <div class="category-icon">
                            <i class="fas fa-gem"></i>
                        </div>
                        <h3>Precious Metals</h3>
                        <p>Gold, silver, platinum, and other precious metals in various forms</p>
                        <span class="category-link">View Products <i class="fas fa-arrow-right"></i></span>
                    </a>
                    
                    <a href="products/diamonds/" class="category-card">
                        <div class="category-icon">
                            <i class="fas fa-diamond"></i>
                        </div>
                        <h3>Diamonds</h3>
                        <p>Rough and polished diamonds, gemstones, and industrial diamonds</p>
                        <span class="category-link">View Products <i class="fas fa-arrow-right"></i></span>
                    </a>
                    
                    <a href="products/industrial/" class="category-card">
                        <div class="category-icon">
                            <i class="fas fa-industry"></i>
                        </div>
                        <h3>Industrial Materials</h3>
                        <p>Base metals, minerals, and industrial raw materials</p>
                        <span class="category-link">View Products <i class="fas fa-arrow-right"></i></span>
                    </a>
                </div>
            </div>
        </div>
    </section>
    
    <section class="section" style="background: var(--light-gray);">
        <div class="container">
            <h2 class="text-center">Product Specifications</h2>
            
            <div class="specs-table">
                <table>
                    <thead>
                        <tr>
                            <th>Product Category</th>
                            <th>Available Products</th>
                            <th>Specifications</th>
                            <th>Minimum Quantity</th>
                            <th>Origin</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Petroleum</td>
                            <td>EN590, Jet A-1, D2, LPG, Crude</td>
                            <td>Euro 5, ASTM D1655, GOST 305-82</td>
                            <td>25,000 MT</td>
                            <td>Middle East, Asia, Europe</td>
                        </tr>
                        <tr>
                            <td>Precious Metals</td>
                            <td>Gold, Silver, Platinum, Palladium</td>
                            <td>99.99% purity, LBMA certified</td>
                            <td>1 kg</td>
                            <td>Global</td>
                        </tr>
                        <tr>
                            <td>Diamonds</td>
                            <td>Rough, Polished, Industrial</td>
                            <td>GIA certified, Kimberley Process</td>
                            <td>10 carats</td>
                            <td>Africa, Canada, Russia</td>
                        </tr>
                        <tr>
                            <td>Industrial</td>
                            <td>Copper, Aluminum, Steel, Iron Ore</td>
                            <td>LME registered, ISO standards</td>
                            <td>500 MT</td>
                            <td>Global</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
    
    <div id="footer"></div>
    
    <script src="assets/js/main.js"></script>
    <script>
        fetch('templates/header.html')
            .then(response => response.text())
            .then(data => document.getElementById('header').innerHTML = data);
        
        fetch('templates/footer.html')
            .then(response => response.text())
            .then(data => document.getElementById('footer').innerHTML = data);
    </script>
    
    <style>
        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .category-card {
            background: white;
            padding: 2rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            transition: all var(--transition-normal);
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .category-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-lg);
            background: linear-gradient(135deg, var(--primary-color), #2d3748);
            color: white;
        }
        
        .category-card:hover h3,
        .category-card:hover p,
        .category-card:hover .category-link {
            color: white;
        }
        
        .category-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, var(--primary-color), var(--info-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }
        
        .category-card:hover .category-icon {
            background: white;
        }
        
        .category-card:hover .category-icon i {
            color: var(--primary-color);
        }
        
        .category-icon i {
            font-size: 2rem;
            color: white;
        }
        
        .category-card h3 {
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .category-card p {
            margin-bottom: 1.5rem;
            color: var(--dark-gray);
            line-height: 1.6;
        }
        
        .category-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--primary-color);
            font-weight: 600;
        }
        
        .specs-table {
            overflow-x: auto;
            margin: 2rem 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        
        th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--gray);
        }
        
        th {
            background: var(--primary-color);
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background: var(--light-gray);
        }
        
        @media (max-width: 768px) {
            .category-grid {
                grid-template-columns: 1fr;
            }
            
            table {
                font-size: 0.875rem;
            }
            
            th, td {
                padding: 0.75rem;
            }
        }
    </style>
</body>
</html>`;

fs.writeFileSync('src/products.html', productsPage);
console.log('  ✅ Created: src/products.html');

// Create empty files for other required pages
const emptyFiles = [
    'src/process.html',
    'src/compliance.html',
    'src/disclaimer.html',
    'src/forms/buyer-inquiry.html',
    'src/forms/seller-inquiry.html',
    'src/forms/mandate-application.html',
    'src/products/petroleum/en590.html',
    'src/products/petroleum/jet-a1.html',
    'src/products/petroleum/d2.html',
    'src/products/petroleum/lpg.html',
    'src/products/precious-metals/index.html',
    'src/products/precious-metals/gold.html',
    'src/products/precious-metals/silver.html',
    'src/products/precious-metals/platinum.html',
    'src/products/diamonds/index.html',
    'src/products/diamonds/rough-diamond.html',
    'src/products/diamonds/polished-diamond.html',
    'src/products/industrial/index.html',
    'src/products/industrial/copper-cathode.html',
    'src/products/industrial/aluminum-ingot.html',
    'src/products/industrial/steel-billets.html'
];

emptyFiles.forEach(file => {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    const basicContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Under Development | Websutech</title>
    <link rel="stylesheet" href="${file.includes('products/') ? '../../' : ''}assets/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="header"></div>
    
    <section class="page-hero">
        <div class="container">
            <h1>Coming Soon</h1>
            <p>This page is currently under development</p>
        </div>
    </section>
    
    <section class="section">
        <div class="container">
            <div class="text-center">
                <div style="font-size: 5rem; color: var(--secondary-color); margin-bottom: 2rem;">
                    <i class="fas fa-tools"></i>
                </div>
                <h2>Page Under Construction</h2>
                <p>We're working hard to bring you this content. Please check back soon!</p>
                <a href="/" class="btn btn-primary mt-3">
                    <i class="fas fa-home"></i> Return to Homepage
                </a>
            </div>
        </div>
    </section>
    
    <div id="footer"></div>
    
    <script src="${file.includes('products/') ? '../../' : ''}assets/js/main.js"></script>
    <script>
        fetch('${file.includes('products/') ? '../../' : ''}templates/header.html')
            .then(response => response.text())
            .then(data => document.getElementById('header').innerHTML = data);
        
        fetch('${file.includes('products/') ? '../../' : ''}templates/footer.html')
            .then(response => response.text())
            .then(data => document.getElementById('footer').innerHTML = data);
    </script>
</body>
</html>`;
    
    fs.writeFileSync(file, basicContent);
    console.log(`  ✅ Created: ${file}`);
});

// Create placeholder images
console.log('\n🖼️  Creating placeholder images...');

// Create a simple logo SVG
const logoSvg = `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a365d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect x="10" y="10" width="40" height="40" rx="8" fill="url(#gradient)" />
    <text x="60" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a365d">WEBSUTECH</text>
    <text x="60" y="50" font-family="Arial, sans-serif" font-size="12" fill="#4a5568">Global Commodity Trading</text>
</svg>`;

fs.writeFileSync('src/assets/images/logo/logo.svg', logoSvg);
console.log('  ✅ Created: src/assets/images/logo/logo.svg');

// Create favicon
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#1a365d"/>
    <rect x="20" y="20" width="60" height="60" rx="12" fill="#d4af37"/>
    <text x="50" y="65" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#1a365d">W</text>
</svg>`;

fs.writeFileSync('src/assets/images/logo/favicon.svg', favicon);
console.log('  ✅ Created: src/assets/images/logo/favicon.svg');

// Create a simple README.txt for images
const imagesReadme = `Websutech Images Directory

Place your images in the following directories:

1. Logo Images:
   - src/assets/images/logo/logo.svg (main logo)
   - src/assets/images/logo/logo-white.svg (for dark backgrounds)
   - src/assets/images/logo/favicon.ico (browser favicon)
   - src/assets/images/logo/favicon.svg (SVG favicon)

2. Product Images:
   - src/assets/images/products/petroleum/ (Petroleum product images)
   - src/assets/images/products/metals/ (Precious metals images)
   - src/assets/images/products/diamonds/ (Diamond images)
   - src/assets/images/products/industrial/ (Industrial materials images)

3. Background Images:
   - src/assets/images/backgrounds/ (Hero backgrounds, patterns)

4. Icons:
   - src/assets/images/icons/ (Custom icons if needed)

Recommended image sizes:
- Logo: 200x60px (SVG recommended)
- Favicon: 32x32px or 64x64px
- Product images: 800x600px (webp format recommended)
- Hero images: 1920x1080px (optimized for web)

For development, you can use placeholder images from:
- https://placeholder.com
- https://unsplash.com
- https://pixabay.com

Remember to optimize images for web:
- Compress images (use tools like tinypng.com)
- Use WebP format when possible
- Implement lazy loading for better performance
`;

fs.writeFileSync('src/assets/images/README.txt', imagesReadme);
console.log('  ✅ Created: src/assets/images/README.txt');

// Create a simple .env.example
const envExample = `# Copy this file to .env and fill in your values
NODE_ENV=development
PORT=3000

# Email Configuration
EMAIL_FROM=noreply@websutech.com
ADMIN_EMAIL=admin@websutech.com

# SMTP Configuration (for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid (for production on Vercel)
# SENDGRID_API_KEY=your-sendgrid-api-key

# Database (MongoDB - for Vercel)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/websutech

# PostgreSQL (for Vercel Postgres)
# POSTGRES_URL=postgresql://username:password@host:port/database

# Security
SESSION_SECRET=change-this-to-a-random-secret-key
JWT_SECRET=change-this-to-another-random-secret-key

# API Keys
# RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Analytics (optional)
# GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
# GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX`;

fs.writeFileSync('.env.example', envExample);
console.log('  ✅ Created: .env.example');

// Create installation instructions
console.log('\n📦 Installation complete!');
console.log('\n🚀 NEXT STEPS:');
console.log('1. Install dependencies:');
console.log('   npm install');
console.log('\n2. Set up environment variables:');
console.log('   cp .env.example .env');
console.log('   # Edit .env with your configuration');
console.log('\n3. Start development server:');
console.log('   npm run dev');
console.log('\n4. Open in browser:');
console.log('   http://localhost:3000');
console.log('\n5. Test API endpoints:');
console.log('   http://localhost:3000/api/health');
console.log('   http://localhost:3000/api/contact/test');
console.log('   http://localhost:3000/api/inquiries/test');
console.log('   http://localhost:3000/api/documents/test');
console.log('\n📁 Project Structure Created:');
console.log('- Frontend: src/');
console.log('- Backend: backend/');
console.log('- Templates: src/templates/');
console.log('- Assets: src/assets/');
console.log('- Forms: src/forms/');
console.log('- Products: src/products/');
console.log('- Documents: src/documents/');
console.log('\n✅ Setup complete! Your Websutech website is ready for development.');

// Run npm install automatically
console.log('\n🔧 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
} catch (error) {
    console.log('⚠️  Could not install dependencies automatically.');
    console.log('💡 Please run: npm install');
}