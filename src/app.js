/**
 * Express Application Configuration
 * This file sets up all middleware and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes (we'll create these later)
const routes = require('./routes');

// Import middleware (we'll create these later)
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// ═══════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════

/**
 * 1. HELMET - Security headers
 * Protects against common web vulnerabilities
 */
app.use(helmet());

/**
 * 2. CORS - Cross-Origin Resource Sharing
 * Allows frontend applications to access this API
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * 3. COMPRESSION - Compress responses
 * Reduces response size for faster transmission
 */
app.use(compression());

/**
 * 4. BODY PARSERS - Parse incoming request bodies
 */
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (max 10MB)
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

/**
 * 5. RATE LIMITING - Prevent abuse
 * Limits each IP to 100 requests per minute
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

/**
 * 6. REQUEST LOGGING - Log incoming requests
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════

/**
 * Root endpoint - API information
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce Search API',
    version: '1.0.0',
    description: 'Comparing Elasticsearch vs SQL search performance',
    endpoints: {
      health: '/api/v1/admin/health',
      docs: '/api-docs',
      api: '/api/v1'
    },
    features: [
      'Dual search engines (SQL & Elasticsearch)',
      'Performance comparison',
      'Real-time analytics',
      'Advanced filtering',
      'Autocomplete'
    ]
  });
});

/**
 * Health check endpoint (no rate limiting)
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * API Routes
 * All API routes are prefixed with /api/v1
 */
app.use('/api/v1', routes);

// ═══════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════

/**
 * 404 - Route not found
 * This catches all requests that don't match any routes
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      api: '/api/v1',
      docs: '/api-docs'
    }
  });
});

/**
 * Global error handler
 * Catches all errors and sends appropriate response
 */
app.use(errorHandler);

// ═══════════════════════════════════════════════════
// EXPORT APP
// ═══════════════════════════════════════════════════

module.exports = app;