/**
 * Server Entry Point
 * This file starts the Express server and handles graceful shutdown
 */

// Load environment variables first (must be at the top)
require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const { testElasticsearchConnection } = require('./src/config/elasticsearch');

// Get port from environment variables or use default
const PORT = process.env.PORT || 3000;

// Server instance (we'll use this for graceful shutdown)
let server;

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('Starting E-Commerce Search API...\n');

    // Step 1: Test PostgreSQL connection
    console.log('Testing PostgreSQL connection...');
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully\n');

    // Step 2: Sync database models (create tables if they don't exist)
    console.log('Syncing database models...');
    await sequelize.sync({ alter: false }); // alter: false means don't modify existing tables
    console.log('Database models synced\n');

    // Step 3: Test Elasticsearch connection
    console.log('Testing Elasticsearch connection...');
    await testElasticsearchConnection();
    console.log('Elasticsearch connected successfully\n');

    // Step 4: Start Express server
    server = app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`Health Check: http://localhost:${PORT}/api/v1/admin/health`);
      console.log('═══════════════════════════════════════════════════\n');
      console.log('Press CTRL+C to stop the server\n');
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   1. Check if Docker containers are running: docker-compose ps');
    console.error('   2. Check if .env file exists and has correct values');
    console.error('   3. Try restarting containers: docker-compose restart\n');
    process.exit(1); // Exit with error code
  }
}

/**
 * Graceful Shutdown
 * This function runs when you press CTRL+C or the process is terminated
 */
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close the server (stop accepting new connections)
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');

      try {
        // Close database connections
        await sequelize.close();
        console.log('PostgreSQL connection closed');

        console.log('Graceful shutdown completed');
        process.exit(0); // Exit successfully
      } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1); // Exit with error
      }
    });

    // Force shutdown after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown after 10 seconds');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kubernetes/Docker stop
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // CTRL+C

// Handle uncaught errors (shouldn't happen, but safety net)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();