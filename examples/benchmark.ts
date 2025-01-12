import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { BlockFetcher } from "../src/core/block-fetcher";

// Statistics helper functions
function calculateStats(times: number[]) {
  // Sort times for calculating median
  const sortedTimes = [...times].sort((a, b) => a - b);

  // Calculate mean
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;

  // Calculate median
  const median =
    times.length % 2 === 0
      ? (sortedTimes[times.length / 2 - 1] + sortedTimes[times.length / 2]) / 2
      : sortedTimes[Math.floor(times.length / 2)];

  // Calculate standard deviation
  const variance =
    times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
    times.length;
  const stdDev = Math.sqrt(variance);

  // Find min and max
  const min = Math.min(...times);
  const max = Math.max(...times);

  return {
    mean: mean.toFixed(2),
    median: median.toFixed(2),
    stdDev: stdDev.toFixed(2),
    min: min.toFixed(2),
    max: max.toFixed(2),
    samples: times.length,
  };
}

async function runBenchmark({
  pageId,
  iterations = 5,
  cooldownMs = 3000,
  warmup = 1,
}: {
  pageId: string;
  iterations?: number;
  cooldownMs?: number;
  warmup?: number;
}) {
  // Initialize clients
  const notion = new Client({
    auth: "",
  });

  const blockFetcher = new BlockFetcher(notion, {
    maxRequestsPerSecond: 5,
  });

  const notionToMd = new NotionToMarkdown({
    notionClient: notion,
  });

  // Arrays to store timing results
  const v3Times: number[] = [];
  const v4Times: number[] = [];

  console.log(
    `\nStarting benchmark with ${iterations} iterations (${warmup} warmup)...`,
  );
  console.log("Page ID:", pageId);
  console.log("Cooldown between runs:", cooldownMs + "ms");

  // Run warmup iterations first
  console.log("\nRunning warmup iterations...");
  for (let i = 0; i < warmup; i++) {
    try {
      await blockFetcher.getBlocks(pageId);
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));
      await notionToMd.pageToMarkdown(pageId);
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));
    } catch (error) {
      console.error("Error during warmup:", error);
    }
  }

  // Run actual benchmark iterations
  console.log("\nRunning benchmark iterations...");
  for (let i = 0; i < iterations; i++) {
    console.log(`\nIteration ${i + 1}/${iterations}`);

    try {
      // Test v4 implementation
      const v4Start = performance.now();
      await blockFetcher.getBlocks(pageId);
      const v4End = performance.now();
      v4Times.push(v4End - v4Start);
      console.log(`V4 time: ${(v4End - v4Start).toFixed(2)}ms`);

      // Cooldown
      console.log(`Cooling down for ${cooldownMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));

      // Test v3 implementation
      const v3Start = performance.now();
      await notionToMd.pageToMarkdown(pageId);
      const v3End = performance.now();
      v3Times.push(v3End - v3Start);
      console.log(`V3 time: ${(v3End - v3Start).toFixed(2)}ms`);

      // Cooldown before next iteration
      if (i < iterations - 1) {
        console.log(`Cooling down for ${cooldownMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, cooldownMs));
      }
    } catch (error) {
      console.error(`Error in iteration ${i + 1}:`, error);
    }
  }

  // Calculate and display statistics
  const v3Stats = calculateStats(v3Times);
  const v4Stats = calculateStats(v4Times);

  console.log("\n=== Benchmark Results ===");
  console.log("\nV3 Statistics:");
  console.log(`Mean: ${v3Stats.mean}ms`);
  console.log(`Median: ${v3Stats.median}ms`);
  console.log(`Std Dev: ${v3Stats.stdDev}ms`);
  console.log(`Min: ${v3Stats.min}ms`);
  console.log(`Max: ${v3Stats.max}ms`);

  console.log("\nV4 Statistics:");
  console.log(`Mean: ${v4Stats.mean}ms`);
  console.log(`Median: ${v4Stats.median}ms`);
  console.log(`Std Dev: ${v4Stats.stdDev}ms`);
  console.log(`Min: ${v4Stats.min}ms`);
  console.log(`Max: ${v4Stats.max}ms`);

  // Calculate improvement percentage
  const improvement =
    ((Number(v3Stats.mean) - Number(v4Stats.mean)) / Number(v3Stats.mean)) *
    100;
  console.log(
    `\nV4 is ${improvement.toFixed(2)}% ${improvement > 0 ? "faster" : "slower"} than V3 on average`,
  );
}

// Run the benchmark
(async () => {
  await runBenchmark({
    pageId: "1404171b8be680c2be8eec44d264c8e9",
    iterations: 5, // Number of test iterations
    cooldownMs: 3000, // Cooldown time between runs
    warmup: 1, // Number of warmup iterations
  });
})();
