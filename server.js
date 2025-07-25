/**
 * Elasticsearch Configuration
 * Sets up connection to Elasticsearch
 */

require("dotenv").config();

const { Client } = require("@elastic/elasticsearch");
const config = require("./env");

/**
 * Create Elasticsearch client
 */
const elasticsearchClient = new Client({
  node: config.elasticsearch.node,

  // Authentication (if enabled)
  ...(config.elasticsearch.username &&
    config.elasticsearch.password && {
      auth: {
        username: config.elasticsearch.username,
        password: config.elasticsearch.password,
      },
    }),

  // Request timeout
  requestTimeout: 30000, // 30 seconds

  // Retry on connection failure
  maxRetries: 3,

  // Log levels
  log: config.nodeEnv === "development" ? "info" : "error",
});

/**
 * Test Elasticsearch connection
 */
async function testElasticsearchConnection() {
  try {
    // Ping Elasticsearch to check if it's alive
    const ping = await elasticsearchClient.ping();

    if (!ping) {
      throw new Error("Elasticsearch ping failed");
    }

    // Get cluster info
    const info = await elasticsearchClient.info();

    console.log("Elasticsearch connected successfully");
    console.log(`   Version: ${info.version.number}`);
    console.log(`   Cluster: ${info.cluster_name}`);

    return true;
  } catch (error) {
    console.error("Unable to connect to Elasticsearch:", error.message);
    throw error;
  }
}

/**
 * Check if index exists
 * @param {string} indexName - Name of the index
 */
async function indexExists(indexName) {
  try {
    return await elasticsearchClient.indices.exists({
      index: indexName,
    });
  } catch (error) {
    console.error(
      `Error checking if index ${indexName} exists:`,
      error.message
    );
    return false;
  }
}

/**
 * Create index with mapping
 * @param {string} indexName - Name of the index
 * @param {object} mapping - Index mapping/schema
 */
async function createIndex(indexName, mapping) {
  try {
    const exists = await indexExists(indexName);

    if (exists) {
      console.log(`Index ${indexName} already exists`);
      return;
    }

    await elasticsearchClient.indices.create({
      index: indexName,
      body: mapping,
    });

    console.log(`Index ${indexName} created successfully`);
  } catch (error) {
    console.error(`Error creating index ${indexName}:`, error.message);
    throw error;
  }
}

/**
 * Delete index
 * @param {string} indexName - Name of the index
 */
async function deleteIndex(indexName) {
  try {
    const exists = await indexExists(indexName);

    if (!exists) {
      console.log(`Index ${indexName} does not exist`);
      return;
    }

    await elasticsearchClient.indices.delete({
      index: indexName,
    });

    console.log(`Index ${indexName} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting index ${indexName}:`, error.message);
    throw error;
  }
}

/**
 * Get index statistics
 * @param {string} indexName - Name of the index
 */
async function getIndexStats(indexName) {
  try {
    const stats = await elasticsearchClient.indices.stats({
      index: indexName,
    });

    return {
      documentCount: stats._all.primaries.docs.count,
      storeSize: stats._all.primaries.store.size_in_bytes,
      indexingTotal: stats._all.primaries.indexing.index_total,
      searchTotal: stats._all.primaries.search.query_total,
    };
  } catch (error) {
    console.error(`Error getting stats for index ${indexName}:`, error.message);
    throw error;
  }
}

/**
 * Refresh index
 * Makes recent changes searchable immediately
 * @param {string} indexName - Name of the index
 */
async function refreshIndex(indexName) {
  try {
    await elasticsearchClient.indices.refresh({
      index: indexName,
    });
    console.log(`Index ${indexName} refreshed`);
  } catch (error) {
    console.error(`Error refreshing index ${indexName}:`, error.message);
    throw error;
  }
}

// Export client and helper functions
module.exports = {
  elasticsearchClient,
  testElasticsearchConnection,
  indexExists,
  createIndex,
  deleteIndex,
  getIndexStats,
  refreshIndex,
};
