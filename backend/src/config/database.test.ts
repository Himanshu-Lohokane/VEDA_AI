/**
 * Manual test script for database connection
 * Run this with: npx ts-node src/config/database.test.ts
 * 
 * Prerequisites:
 * - Docker must be running
 * - MongoDB container must be started (docker-compose up -d mongodb)
 */

import { connectDatabase, disconnectDatabase, isConnected, getConnectionState } from './database';

const testDatabaseConnection = async () => {
  console.log('=== Testing MongoDB Connection ===\n');

  try {
    // Test 1: Initial connection state
    console.log('Test 1: Checking initial connection state...');
    const initialState = getConnectionState();
    console.log(`Initial state: ${initialState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    console.log(`Is connected: ${isConnected()}`);
    console.log('✓ Test 1 passed\n');

    // Test 2: Connect to database
    console.log('Test 2: Connecting to database...');
    await connectDatabase();
    console.log('✓ Test 2 passed\n');

    // Test 3: Verify connection state after connecting
    console.log('Test 3: Verifying connection state...');
    const connectedState = getConnectionState();
    console.log(`Connected state: ${connectedState}`);
    console.log(`Is connected: ${isConnected()}`);
    
    if (!isConnected()) {
      throw new Error('Database should be connected but isConnected() returned false');
    }
    console.log('✓ Test 3 passed\n');

    // Test 4: Disconnect from database
    console.log('Test 4: Disconnecting from database...');
    await disconnectDatabase();
    console.log('✓ Test 4 passed\n');

    // Test 5: Verify disconnection
    console.log('Test 5: Verifying disconnection...');
    const disconnectedState = getConnectionState();
    console.log(`Disconnected state: ${disconnectedState}`);
    console.log(`Is connected: ${isConnected()}`);
    
    if (isConnected()) {
      throw new Error('Database should be disconnected but isConnected() returned true');
    }
    console.log('✓ Test 5 passed\n');

    console.log('=== All tests passed! ===');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testDatabaseConnection();
