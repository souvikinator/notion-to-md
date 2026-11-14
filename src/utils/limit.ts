export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

/** Runs at most `concurrency` tasks at a time; the rest wait in order. */
export function createLimiter(concurrency: number): Limiter {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError(
      `concurrency must be a positive integer, got ${String(concurrency)}`,
    );
  }
  let active = 0;
  const waiting: (() => void)[] = [];

  return async (task) => {
    if (active < concurrency) active++;
    else await new Promise<void>((resolve) => waiting.push(resolve));

    try {
      return await task();
    } finally {
      // Hand the slot straight to the next task so no new caller can jump ahead of it.
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  };
}
