import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '@/utils/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute requests immediately if within the rate limit', async () => {
    const limiter = new RateLimiter(3);
    const request = vi.fn().mockResolvedValue('test');

    const promise1 = limiter.execute(request);
    const promise2 = limiter.execute(request);

    await Promise.all([promise1, promise2]);

    expect(request).toHaveBeenCalledTimes(2);
  });

  it('should delay requests that exceed the rate limit', async () => {
    const limiter = new RateLimiter(2);
    const request = vi.fn().mockResolvedValue('test');

    await limiter.execute(request);
    await limiter.execute(request);

    const p3 = limiter.execute(request);

    vi.advanceTimersByTimeAsync(1001);

    await p3;

    expect(request).toHaveBeenCalledTimes(3);
  });

  it('should reset the request count after the window expires', async () => {
    const limiter = new RateLimiter(2);
    const request = vi.fn().mockResolvedValue('test');

    // First window
    await limiter.execute(request);
    await limiter.execute(request);

    expect(request).toHaveBeenCalledTimes(2);

    // Advance time to the next window
    await vi.advanceTimersByTimeAsync(1001);

    // Second window
    await limiter.execute(request);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('should handle concurrent requests correctly', async () => {
    const limiter = new RateLimiter(2);
    const request = vi.fn().mockResolvedValue('test');

    const promises = Array.from({ length: 4 }, () => limiter.execute(request));

    vi.advanceTimersByTimeAsync(1001);

    await Promise.all(promises);

    expect(request).toHaveBeenCalledTimes(4);
  });

  it('should allow updating the max requests per second', async () => {
    const limiter = new RateLimiter(1);
    const request = vi.fn().mockResolvedValue('ok');

    await limiter.execute(request); // #1

    const p2 = limiter.execute(request); // #2 is queued

    limiter.setMaxRequestsPerSecond(3);

    await limiter.execute(request); // #3
    await limiter.execute(request); // #4

    expect(request).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(1001);
    await p2;

    expect(request).toHaveBeenCalledTimes(4);
  });
});
