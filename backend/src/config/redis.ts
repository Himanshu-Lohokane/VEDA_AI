import { createClient, RedisClientType } from 'redis';

/**
 * Redis connection configuration
 * Implements connection with error handling and logging
 * Supports both local development and production (Redis Cloud)
 */

let redisClient: RedisClientType | null = null;

/**
 * Creates and establishes connection to Redis
 * @returns Promise that resolves to the Redis client instance
 * @throws Error if connection fails
 */
export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (!redisHost || !redisPort) {
      throw new Error('REDIS_HOST and REDIS_PORT environment variables are not defined');
    }

    // Create Redis client
    redisClient = createClient({
      socket: {
        host: redisHost,
        port: parseInt(redisPort, 10),
        reconnectStrategy: (retries) => {
          // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1000ms (max)
          const delay = Math.min(50 * Math.pow(2, retries), 1000);
          return delay;
        },
        connectTimeout: 10000, // 10 seconds
      },
    });

    // Handle connection events
    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis connected successfully');
    });

    redisClient.on('ready', () => {
      console.log('✓ Redis client ready');
    });

    redisClient.on('reconnecting', () => {
      console.warn('Redis reconnecting...');
    });

    redisClient.on('end', () => {
      console.warn('Redis connection ended');
    });

    // Connect to Redis
    await redisClient.connect();

    console.log(`✓ Redis connected to ${redisHost}:${redisPort}`);

    return redisClient;
  } catch (error) {
    console.error('✗ Redis connection failed:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }

    // Exit process with failure code
    process.exit(1);
  }
};

/**
 * Returns the Redis client instance
 * @returns Redis client instance or null if not connected
 */
export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

/**
 * Checks if Redis is connected
 * @returns true if connected, false otherwise
 */
export const isRedisConnected = (): boolean => {
  return redisClient !== null && redisClient.isOpen;
};

/**
 * Gracefully closes the Redis connection
 * @returns Promise that resolves when connection is closed
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      console.log('✓ Redis connection closed gracefully');
    }
  } catch (error) {
    console.error('✗ Error closing Redis connection:', error);
    throw error;
  }
};

/**
 * Performs a health check on Redis connection
 * @returns Promise that resolves to true if Redis is healthy
 */
export const healthCheckRedis = async (): Promise<boolean> => {
  try {
    if (!redisClient) {
      return false;
    }

    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};
