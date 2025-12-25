const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Global error handlers to improve stability during development
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import route handlers
const contactRoutes = require('./backend/routes/contact');
const inquiryRoutes = require('./backend/routes/inquiries');
const documentRoutes = require('./backend/routes/documents');
const securityRoutes = require('./backend/routes/security');

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

// If running behind a proxy (load balancer) in production, trust the first proxy
// so secure cookies and HSTS work correctly when TLS is terminated upstream.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);

    // Enable HSTS (Strict-Transport-Security) in production to instruct browsers
    // to only use HTTPS for future requests. maxAge is set to 1 year, includes
    // subdomains and requests preload. Only enable this when the site is served
    // over HTTPS (typical in production behind a TLS-terminating proxy).
    try {
        app.use(helmet.hsts({
            maxAge: 31536000, // 1 year in seconds
            includeSubDomains: true,
            preload: true
        }));
        console.log('🔐 HSTS enabled (production)');
    } catch (e) {
        // In case the installed helmet version doesn't expose hsts directly,
        // fall back to a manual header set as a safe alternative.
        app.use((req, res, next) => {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            next();
        });
        console.warn('⚠️ helmet.hsts not available; set HSTS header manually');
    }
}

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://websutech.com', 'https://www.websutech.com']
        : ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Global API rate limiter (protects all /api routes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

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
app.use('/api/security', securityRoutes);

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
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📁 Frontend: http://localhost:${PORT}`);
        console.log(`🔧 API: http://localhost:${PORT}/api/health`);
    });
}

// Export for Vercel
module.exports = app;