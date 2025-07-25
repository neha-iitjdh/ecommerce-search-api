/**
 * Environment Configuration
 * Validates and exports environment variables
 */

// Ensure dotenv is loaded
require('dotenv').config();

/**
 * Get environment variable with validation
 * @param {string} key - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @param {boolean} required - Whether this variable is required
 */
function getEnv(key, defaultValue = undefined, required = false) {
  const value = process.env[key] || defaultValue;

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Environment configuration object
 */
const config = {
  // Server
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('PORT', '3000')),
  apiVersion: getEnv('API_VERSION', 'v1'),

  // PostgreSQL
  database: {
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '5432')),
    name: getEnv('DB_NAME', 'ecommerce_search'),
    user: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD', 'postgres123'),
    poolMax: parseInt(getEnv('DB_POOL_MAX', '20')),
    poolMin: parseInt(getEnv('DB_POOL_MIN', '5'))
  },

  // Elasticsearch
  elasticsearch: {
    node: getEnv('ELASTIC_NODE', 'http://localhost:9200'),
    index: getEnv('ELASTIC_INDEX', 'products'),
    username: getEnv('ELASTIC_USERNAME'),
    password: getEnv('ELASTIC_PASSWORD')
  },

  // API Settings
  api: {
    rateLimitWindowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '60000')),
    rateLimitMaxRequests: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'))
  },

  // Logging
  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
    file: getEnv('LOG_FILE', 'logs/app.log')
  },

  // Performance
  performance: {
    enableCompression: getEnv('ENABLE_COMPRESSION', 'true') === 'true',
    enableQueryLogging: getEnv('ENABLE_QUERY_LOGGING', 'true') === 'true'
  }
};

/**
 * Validate critical configuration
 */
function validateConfig() {
  const errors = [];

  // Check port is valid
  if (config.port < 1 || config.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  // Check database configuration
  if (!config.database.host) {
    errors.push('DB_HOST is required');
  }

  // Check Elasticsearch configuration
  if (!config.elasticsearch.node) {
    errors.push('ELASTIC_NODE is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

// Validate on module load
validateConfig();

// Display configuration in development
if (config.nodeEnv === 'development') {
  console.log('Configuration loaded:');
  console.log({
    environment: config.nodeEnv,
    port: config.port,
    database: {
      host: config.database.host,
      port: config.database.port,
      name: config.database.name
    },
    elasticsearch: {
      node: config.elasticsearch.node,
      index: config.elasticsearch.index
    }
  });
  console.log('');
}

module.exports = config;