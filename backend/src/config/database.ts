import mongoose from 'mongoose';

/**
 * MongoDB connection configuration with Mongoose
 * Implements connection pooling and error handling
 */

interface ConnectionOptions {
  maxPoolSize?: number;
  minPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
}

/**
 * Establishes connection to MongoDB using Mongoose
 * @returns Promise that resolves when connection is successful
 * @throws Error if connection fails
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connection options with pooling configuration
    const options: ConnectionOptions = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
    };

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database: ${mongoose.connection.name}`);
    console.log(`✓ Host: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    throw error;
  }
};

/**
 * Gracefully closes the MongoDB connection
 * @returns Promise that resolves when connection is closed
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed gracefully');
  } catch (error) {
    console.error('✗ Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Returns the current connection state
 * @returns Connection state (0: disconnected, 1: connected, 2: connecting, 3: disconnecting)
 */
export const getConnectionState = (): number => {
  return mongoose.connection.readyState;
};

/**
 * Checks if database is connected
 * @returns true if connected, false otherwise
 */
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
