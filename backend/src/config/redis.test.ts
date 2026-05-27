/**
 * Manual test script for Redis connection
 * Run this with: npx ts-node src/config/redis.test.ts
 * 
 * Prerequisites:
 * - Docker must be running
 * - Redis container must be started (docker-compose up -d redis)
 */

import { 
  connectRedis, 
  disconnectRedis, 
  isRedisConnected, 
  getRedisClient,
  healthCheckRedis 
} from './redis';

const testRedisConnection = async () => {
  console.log('=== Testing Redis Connection ===\n');

  try {
    // Test 1: Initial connection state
    console.log('Test 1: Checking initial connection state...');
    console.log(`Is connected: ${isRedisConnected()}`);
    console.log('✓ Test 1 passed\n');

    // Test 2: Connect to Redis
    console.log('Test 2: Connecting to Redis...');
    const client = await connectRedis();
    console.log('✓ Test 2 passed\n');

    // Test 3: Verify connection state after connecting
    console.log('Test 3: Verifying connection state...');
    console.log(`Is connected: ${isRedisConnected()}`);
    
    if (!isRedisConnected()) {
      throw new Error('Redis should be connected but isRedisConnected() returned false');
    }
    console.log('✓ Test 3 passed\n');

    // Test 4: Get client instance
    console.log('Test 4: Getting client instance...');
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      throw new Error('Redis client should not be null');
    }
    console.log('✓ Test 4 passed\n');

    // Test 5: Perform health check
    console.log('Test 5: Performing health check...');
    const isHealthy = await healthCheckRedis();
    console.log(`Health check result: ${isHealthy}`);
    
    if (!isHealthy) {
      throw new Error('Redis health check failed');
    }
    console.log('✓ Test 5 passed\n');

    // Test 6: Test basic operations
    console.log('Test 6: Testing basic Redis operations...');
    const testKey = 'test-key';
    const testValue = 'test-value';
    
    await redisClient.set(testKey, testValue);
    const retrievedValue = await redisClient.get(testKey);
    
    if (retrievedValue !== testValue) {
      throw new Error(`Expected "${testValue}" but got "${retrievedValue}"`);
    }
    
    await redisClient.del(testKey);
    console.log('✓ Test 6 passed\n');

    // Test 7: Disconnect from Redis
    console.log('Test 7: Disconnecting from Redis...');
    await disconnectRedis();
    console.log('✓ Test 7 passed\n');

    // Test 8: Verify disconnection
    console.log('Test 8: Verifying disconnection...');
    console.log(`Is connected: ${isRedisConnected()}`);
    
    if (isRedisConnected()) {
      throw new Error('Redis should be disconnected but isRedisConnected() returned true');
    }
    console.log('✓ Test 8 passed\n');

    console.log('=== All tests passed! ===');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testRedisConnection();
