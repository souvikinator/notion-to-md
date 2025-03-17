export class RateLimiter {
  private requests: number = 0;
  private startTime: number = Date.now();

  constructor(private maxRequestsPerSecond: number = 3) {}

  /**
   * Execute a request with rate limiting applied
   */
  async execute<T>(request: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const windowSize = 1000; // 1 second window

    // Reset window if it's expired
    if (now - this.startTime >= windowSize) {
      this.requests = 0;
      this.startTime = now;
    }

    // Wait if we've hit the rate limit
    if (this.requests >= this.maxRequestsPerSecond) {
      const waitTime = windowSize - (now - this.startTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requests = 0;
      this.startTime = Date.now();
    }

    this.requests++;
    return request();
  }

  /**
   * Update the rate limit configuration
   */
  setMaxRequestsPerSecond(maxRequests: number): void {
    this.maxRequestsPerSecond = maxRequests;
  }
}
