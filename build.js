#!/usr/bin/env node

/**
 * Production Build Script for Websutech
 * Validates and prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Try to load minification libraries (optional)
let CleanCSS, terser;
try {
    CleanCSS = require('clean-css');
} catch (e) {
    // clean-css not available - minification will be skipped
}

try {
    terser = require('terser');
} catch (e) {
    // terser not available - minification will be skipped
}

async function minifyCSS(inputPath) {
    if (!CleanCSS) return false;
    
    try {
        const cssContent = fs.readFileSync(inputPath, 'utf8');
        const minifier = new CleanCSS({ 
            level: 2,
            returnPromise: true 
        });
        
        const result = await minifier.minify(cssContent);
        const minPath = inputPath.replace('.css', '.min.css');
        fs.writeFileSync(minPath, result.styles);
        
        const originalSize = fs.statSync(inputPath).size;
        const minSize = fs.statSync(minPath).size;
        const savings = ((1 - minSize / originalSize) * 100).toFixed(1);
        
        log(`    ✓ Minified (${savings}% smaller: ${(originalSize/1024).toFixed(1)}KB → ${(minSize/1024).toFixed(1)}KB)`, 'green');
        return true;
    } catch (error) {
        log(`    ❌ Error: ${error.message}`, 'red');
        return false;
    }
}

async function minifyJS(inputPath) {
    if (!terser) return false;
    
    try {
        const jsContent = fs.readFileSync(inputPath, 'utf8');
        const result = await terser.minify(jsContent, {
            compress: {
                drop_console: false,
                passes: 2
            },
            mangle: {
                toplevel: false
            },
            format: {
                comments: false
            }
        });
        
        if (result.error) {
            throw result.error;
        }
        
        const minPath = inputPath.replace('.js', '.min.js');
        fs.writeFileSync(minPath, result.code);
        
        const originalSize = fs.statSync(inputPath).size;
        const minSize = fs.statSync(minPath).size;
        const savings = ((1 - minSize / originalSize) * 100).toFixed(1);
        
        log(`    ✓ Minified (${savings}% smaller: ${(originalSize/1024).toFixed(1)}KB → ${(minSize/1024).toFixed(1)}KB)`, 'green');
        return true;
    } catch (error) {
        log(`    ❌ Error: ${error.message}`, 'red');
        return false;
    }
}

function getAllFiles(dir, extension, fileList = []) {
    if (!fs.existsSync(dir)) {
        return fileList;
    }
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                getAllFiles(filePath, extension, fileList);
            } else if (file.endsWith(extension) && !file.includes('.min.')) {
                fileList.push(filePath);
            }
        } catch (e) {
            // Skip files that can't be accessed
        }
    });
    
    return fileList;
}

function validateBuild() {
    log('🔍 Validating build...', 'yellow');
    const errors = [];
    
    // Check required files
    const requiredFiles = [
        'server.js',
        'package.json',
        'vercel.json',
        'src/index.html',
        'backend/routes/contact.js',
        'backend/routes/inquiries.js'
    ];
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            errors.push(`Missing required file: ${file}`);
        }
    });
    
    // Check environment variables (warn only)
    const envExample = path.join(__dirname, '.env.example');
    if (!fs.existsSync(envExample)) {
        log('  ⚠️  .env.example not found (optional)', 'yellow');
    }
    
    if (errors.length > 0) {
        errors.forEach(error => log(`  ❌ ${error}`, 'red'));
        return false;
    }
    
    log('  ✓ All required files present', 'green');
    return true;
}

async function build() {
    log('\n🚀 Starting production build...\n', 'blue');
    
    const srcDir = path.join(__dirname, 'src');
    const assetsDir = path.join(srcDir, 'assets');
    
    // Validate build
    if (!validateBuild()) {
        log('\n❌ Build validation failed!', 'red');
        process.exit(1);
    }
    
    // Check if src directory exists
    if (!fs.existsSync(srcDir)) {
        log('❌ src directory not found!', 'red');
        process.exit(1);
    }
    
    let cssCount = 0;
    let jsCount = 0;
    let errors = 0;
    
    // Minify CSS files (if clean-css is available)
    if (CleanCSS) {
        log('\n📦 Minifying CSS files...', 'yellow');
        const cssFiles = getAllFiles(path.join(assetsDir, 'css'), '.css');
        
        for (const cssFile of cssFiles) {
            const relativePath = path.relative(__dirname, cssFile);
            log(`  → ${relativePath}`, 'blue');
            
            if (await minifyCSS(cssFile)) {
                cssCount++;
            } else {
                errors++;
            }
        }
    } else {
        log('\n⚠️  CSS minification skipped (clean-css not installed)', 'yellow');
        log('   Install with: npm install --save-dev clean-css', 'yellow');
    }
    
    // Minify JavaScript files (if terser is available)
    if (terser) {
        log('\n📦 Minifying JavaScript files...', 'yellow');
        const jsFiles = getAllFiles(path.join(assetsDir, 'js'), '.js');
        
        for (const jsFile of jsFiles) {
            const relativePath = path.relative(__dirname, jsFile);
            log(`  → ${relativePath}`, 'blue');
            
            if (await minifyJS(jsFile)) {
                jsCount++;
            } else {
                errors++;
            }
        }
    } else {
        log('\n⚠️  JS minification skipped (terser not installed)', 'yellow');
        log('   Install with: npm install --save-dev terser', 'yellow');
    }
    
    // Summary
    log('\n' + '='.repeat(50), 'blue');
    log('📊 Build Summary:', 'blue');
    log('  ✓ Build validation passed', 'green');
    if (cssCount > 0) {
        log(`  ✓ CSS files minified: ${cssCount}`, 'green');
    }
    if (jsCount > 0) {
        log(`  ✓ JS files minified: ${jsCount}`, 'green');
    }
    if (cssCount === 0 && jsCount === 0) {
        log('  ℹ️  Minification skipped (dependencies not installed)', 'yellow');
        log('     This is optional - Vercel handles compression automatically', 'yellow');
    }
    if (errors > 0) {
        log(`  ❌ Errors: ${errors}`, 'red');
    }
    log('='.repeat(50) + '\n', 'blue');
    
    log('✅ Build completed successfully!', 'green');
    log('\n📋 Next steps for deployment:', 'blue');
    log('  1. Set environment variables in Vercel dashboard', 'yellow');
    log('  2. Configure SMTP credentials for email', 'yellow');
    log('  3. Deploy: vercel or connect GitHub repo', 'yellow');
    log('  4. Test all forms and API endpoints', 'yellow');
    log('\n');
}

// Run build
if (require.main === module) {
    build().catch(error => {
        log(`\n❌ Build failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = { build };
