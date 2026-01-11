import { createClient } from 'redis';
import { config } from './config';

export const redis = createClient({ url: config.redisUrl });

redis.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error('Redis error', error);
});

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
