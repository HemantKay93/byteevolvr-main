import { describe, it, expect, vi, beforeEach } from 'vitest';

import { JobService } from '../jobService.js';
import { emailQueue, notificationQueue, analyticsQueue } from '../../core/queues/index.js';
// eslint-disable-line @typescript-eslint/no-unused-vars
// eslint-disable-line @typescript-eslint/no-unused-vars
import logger from '../logger.js';
import { redis } from '../../config/redis.js';

// Mock dependencies
vi.mock('../../core/queues/index.js', () => ({
  emailQueue: { add: vi.fn() },
  notificationQueue: { add: vi.fn() },
  analyticsQueue: { add: vi.fn() },
}));

vi.mock('../logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../../config/redis.js', () => ({
  redis: {
    status: 'ready',
  },
}));

describe('JobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue analytics event if Redis is ready', async () => {
    // redis.status is 'ready' by default in our mock
    // eslint-disable-line @typescript-eslint/no-explicit-any
    (analyticsQueue.add as any).mockResolvedValue(true);
    // eslint-disable-line @typescript-eslint/no-explicit-any

    await JobService.dispatchAnalyticsEvent('test_event', { foo: 'bar' });

    expect(analyticsQueue.add).toHaveBeenCalledWith(
      'record-event',
      { type: 'test_event', payload: { foo: 'bar' } },
      expect.any(Object)
    );
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('queued'));
  });

  it('should ignore analytics event if Redis is not ready', async () => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Change mock status
    (redis as any).status = 'end';
    // eslint-disable-line @typescript-eslint/no-explicit-any

    await JobService.dispatchAnalyticsEvent('test_event', { foo: 'bar' });

    expect(analyticsQueue.add).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Redis unavailable'));
    // eslint-disable-line @typescript-eslint/no-explicit-any

    // Revert mock status
    (redis as any).status = 'ready';
    // eslint-disable-line @typescript-eslint/no-explicit-any
  });
});
