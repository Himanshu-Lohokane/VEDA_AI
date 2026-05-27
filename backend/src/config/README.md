# Backend Configuration

This directory contains configuration files for backend services.

## Database Configuration (`database.ts`)

MongoDB connection configuration using Mongoose with connection pooling and error handling.

### Features

- **Async/Await Connection**: Uses modern async/await pattern for database connection
- **Connection Pooling**: Configured with min/max pool sizes for optimal performance
- **Error Handling**: Comprehensive error handling with graceful failure
- **Connection Events**: Monitors connection, disconnection, and reconnection events
- **Logging**: Detailed logging of connection status and errors
- **Graceful Shutdown**: Proper cleanup on application termination

### Configuration Options

The connection uses the following pooling configuration:

- `maxPoolSize: 10` - Maximum number of connections in the pool
- `minPoolSize: 2` - Minimum number of connections maintained
- `serverSelectionTimeoutMS: 5000` - Timeout for selecting a server
- `socketTimeoutMS: 45000` - Timeout for socket operations

### Environment Variables

Required environment variable:

```env
MONGODB_URI=mongodb://localhost:27017/vedaai-assessment
```

For production (MongoDB Atlas):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedaai-assessment
```

### Usage

```typescript
import { connectDatabase, disconnectDatabase, isConnected } from './config/database';

// Connect to database
await connectDatabase();

// Check connection status
if (isConnected()) {
  console.log('Database is connected');
}

// Disconnect (usually on app shutdown)
await disconnectDatabase();
```

### Testing

To test the database connection:

1. Start MongoDB using Docker:
   ```bash
   docker-compose up -d mongodb
   ```

2. Run the test script:
   ```bash
   npx ts-node src/config/database.test.ts
   ```

3. Or start the server and check the health endpoint:
   ```bash
   npm run dev
   curl http://localhost:3001/health
   ```

### Error Handling

The connection will:
- Log detailed error messages if connection fails
- Exit the process with code 1 on connection failure
- Automatically attempt to reconnect if disconnected
- Log reconnection events

### Connection Events

The following events are monitored:

- `error` - Logs any connection errors
- `disconnected` - Warns when connection is lost
- `reconnected` - Confirms successful reconnection

### Requirements Satisfied

- **Requirement 9.2**: Backend connects to MongoDB for persistent data storage
- **Requirement 10.5**: Backend connects to MongoDB using Docker service hostname

## Redis Configuration (`redis.ts`)

Redis connection configuration with error handling, reconnection strategy, and health checks.

### Features

- **Async/Await Connection**: Uses modern async/await pattern for Redis connection
- **Error Handling**: Comprehensive error handling with graceful failure
- **Reconnection Strategy**: Exponential backoff strategy for automatic reconnection
- **Connection Events**: Monitors connection, disconnection, and reconnection events
- **Logging**: Detailed logging of connection status and errors
- **Health Checks**: Built-in health check functionality using PING command
- **Graceful Shutdown**: Proper cleanup on application termination
- **Production Support**: Works with both local Redis and Redis Cloud

### Configuration Options

The connection uses the following configuration:

- `connectTimeout: 10000` - 10 second timeout for initial connection
- **Reconnection Strategy**: Exponential backoff with max delay of 1000ms
  - 1st retry: 50ms
  - 2nd retry: 100ms
  - 3rd retry: 200ms
  - 4th retry: 400ms
  - 5th retry: 800ms
  - 6th+ retries: 1000ms (max)

### Environment Variables

Required environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

For production (Redis Cloud):

```env
REDIS_HOST=your-redis-cloud-host.redis.cloud.com
REDIS_PORT=your-redis-cloud-port
```

### Usage

```typescript
import { 
  connectRedis, 
  getRedisClient, 
  isRedisConnected,
  healthCheckRedis,
  disconnectRedis 
} from './config/redis';

// Connect to Redis
const client = await connectRedis();

// Check connection status
if (isRedisConnected()) {
  console.log('Redis is connected');
}

// Perform health check
const isHealthy = await healthCheckRedis();

// Get client instance for operations
const redisClient = getRedisClient();
if (redisClient) {
  await redisClient.set('key', 'value');
  const value = await redisClient.get('key');
}

// Disconnect (usually on app shutdown)
await disconnectRedis();
```

### Testing

To test the Redis connection:

1. Start Redis using Docker:
   ```bash
   docker-compose up -d redis
   ```

2. Or start both MongoDB and Redis:
   ```bash
   docker-compose up -d
   ```

3. Run the server and check the logs:
   ```bash
   npm run dev
   ```

### Error Handling

The connection will:
- Log detailed error messages if connection fails
- Exit the process with code 1 on connection failure
- Automatically attempt to reconnect with exponential backoff
- Log reconnection events
- Handle connection timeouts gracefully

### Connection Events

The following events are monitored:

- `error` - Logs any connection errors
- `connect` - Confirms successful connection
- `ready` - Indicates client is ready for operations
- `reconnecting` - Warns when attempting to reconnect
- `end` - Logs when connection is ended

### Requirements Satisfied

- **Requirement 9.3**: Backend connects to Redis for caching and job state management
- **Requirement 10.6**: Backend connects to Redis using Docker service hostname
