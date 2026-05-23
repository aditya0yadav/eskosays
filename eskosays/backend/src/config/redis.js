const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
        // Exponential backoff for redis connection
        return Math.min(times * 50, 2000);
    }
};

const redis = new Redis(redisConfig);

// Connected to server


redis.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
});

module.exports = redis;
