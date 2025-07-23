# E-Commerce Search API: Elasticsearch vs SQL

A comprehensive RESTful API demonstrating the performance and feature advantages of Elasticsearch over traditional SQL-based search in e-commerce applications.

## Project Overview

This project implements a dual-engine product search system that allows direct comparison between:
- **Traditional SQL Search** (PostgreSQL with LIKE queries and full-text search)
- **Modern Search Engine** (Elasticsearch with advanced features)

## Features

### Core Functionality
- Product CRUD operations with dual-database sync
- Side-by-side search comparison (SQL vs Elasticsearch)
- Advanced filtering and sorting
- Real-time performance metrics
- Automated benchmarking suite

### Elasticsearch Advantages Demonstrated
- Fuzzy matching for typo tolerance
- Sub-100ms search response times
- Real-time analytics and aggregations
- Autocomplete suggestions
- Relevance scoring and ranking
- Search-as-you-type functionality

## Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- Git

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ecommerce-search-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration if needed
```

### 4. Start the databases
```bash
docker-compose up -d
```

Wait for services to be healthy (check with `docker-compose ps`)

### 5. Initialize databases
```bash
npm run setup
```

### 6. Load sample data
```bash
npm run seed
```

### 7. Start the application
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/v1/admin/health

## Project Structure

```
ecommerce-search-api/
├── src/
│   ├── config/          # Database and service configurations
│   ├── models/          # Data models
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── utils/           # Helper functions
├── scripts/             # Setup and utility scripts
├── tests/               # Test files
└── docs/                # Additional documentation
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Running Benchmarks

```bash
npm run benchmark
```

This will generate a performance comparison report.

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart postgres
docker-compose restart elasticsearch
```

## Key Endpoints

### Product Management
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Search
- `GET /api/v1/search/sql?q=laptop` - SQL-based search
- `GET /api/v1/search/elastic?q=laptop` - Elasticsearch search
- `GET /api/v1/search/compare?q=laptop` - Side-by-side comparison

### Analytics
- `GET /api/v1/analytics/popular-searches` - Most searched terms
- `GET /api/v1/analytics/trending-products` - Trending products

### Benchmarks
- `POST /api/v1/benchmark/run` - Run performance tests
- `GET /api/v1/benchmark/results/:id` - Get results

## Learning Resources

- [Elasticsearch Official Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize ORM](https://sequelize.org/docs/v6/)

## License

MIT License - feel free to use this project for learning and development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or feedback, please open an issue in the repository.