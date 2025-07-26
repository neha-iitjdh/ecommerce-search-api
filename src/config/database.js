/**
 * PostgreSQL Database Configuration
 * Using Sequelize ORM (Object-Relational Mapping)
 */

const { Sequelize } = require('sequelize');
const config = require('./env');

/**
 * Create Sequelize instance
 * Sequelize is an ORM that lets us work with SQL databases using JavaScript objects
 */
const sequelize = new Sequelize(
  config.database.name,     // Database name
  config.database.user,     // Username
  config.database.password, // Password
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres', // Type of SQL database
    
    // Connection pool configuration
    // A pool maintains multiple database connections for better performance
    pool: {
      max: config.database.poolMax,     // Maximum number of connections
      min: config.database.poolMin,     // Minimum number of connections
      acquire: 30000,                   // Maximum time (ms) to get a connection
      idle: 10000                       // Maximum time (ms) a connection can be idle
    },

    // Logging
    logging: config.performance.enableQueryLogging 
      ? (msg) => console.log('SQL:', msg)  // Log SQL queries in development
      : false,                                 // Disable in production

    // Timezone
    timezone: '+00:00', // Use UTC

    // Other options
    define: {
      timestamps: true,        // Automatically add createdAt and updatedAt
      underscored: false,      // Use camelCase instead of snake_case
      freezeTableName: true    // Don't pluralize table names
    }
  }
);

/**
 * Test database connection
 * This function is called when the server starts
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    throw error;
  }
}

/**
 * Close database connection
 * Called during graceful shutdown
 */
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('🔌 PostgreSQL connection closed');
  } catch (error) {
    console.error('Error closing PostgreSQL connection:', error.message);
    throw error;
  }
}

// Export sequelize instance and helper functions
module.exports = {
  sequelize,
  testConnection,
  closeConnection
};