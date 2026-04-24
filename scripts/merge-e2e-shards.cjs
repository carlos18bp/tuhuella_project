#!/usr/bin/env node
// Merge Playwright E2E shard artifacts into a single set of files that the
// coverage-summary pipeline expects at `coverage-artifacts/frontend-e2e/`.
//
// Inputs: one directory per shard, each containing:
//   - flow-coverage.json       (custom flow reporter)
//   - playwright-results.json  (built-in json reporter)
//
// Usage: node merge-e2e-shards.cjs <shards-dir> <out-dir>

const fs = require('fs');
const path = require('path');

const [, , shardsDir, outDir] = process.argv;
if (!shardsDir || !outDir) {
  console.error('usage: merge-e2e-shards.cjs <shards-dir> <out-dir>');
  process.exit(2);
}

if (!fs.existsSync(shardsDir)) {
  console.log(`no shard directory at ${shardsDir}, nothing to merge`);
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });

const shardDirs = fs
  .readdirSync(shardsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(shardsDir, d.name));

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

// ── Merge flow-coverage.json ──
// Each shard produces an independent view of the flow catalogue. Merge by
// preferring the "best" observed status for each flow across shards. Rebuild
// summary counters at the end.
const flowStatusPriority = { covered: 4, partial: 3, failing: 2, missing: 1 };
const mergedFlows = {};

for (const dir of shardDirs) {
  const fc = readJson(path.join(dir, 'flow-coverage.json'));
  if (!fc || !fc.flows) continue;
  for (const [id, flow] of Object.entries(fc.flows)) {
    const existing = mergedFlows[id];
    if (!existing) {
      mergedFlows[id] = flow;
      continue;
    }
    const existingRank = flowStatusPriority[existing.status] || 0;
    const candidateRank = flowStatusPriority[flow.status] || 0;
    if (candidateRank > existingRank) {
      mergedFlows[id] = flow;
    }
    mergedFlows[id].tests = {
      passed: (existing.tests?.passed || 0) + (flow.tests?.passed || 0),
      failed: (existing.tests?.failed || 0) + (flow.tests?.failed || 0),
      total: (existing.tests?.total || 0) + (flow.tests?.total || 0),
    };
  }
}

const summary = { total: 0, covered: 0, partial: 0, failing: 0, missing: 0 };
for (const flow of Object.values(mergedFlows)) {
  summary.total += 1;
  summary[flow.status] = (summary[flow.status] || 0) + 1;
}

fs.writeFileSync(
  path.join(outDir, 'flow-coverage.json'),
  JSON.stringify({ summary, flows: mergedFlows }, null, 2),
);

// ── Merge playwright-results.json ──
// Concatenate top-level suites and accumulate stats. The summary script walks
// `suites[]` recursively, so we only need a well-formed outer envelope.
const merged = { suites: [], stats: { expected: 0, unexpected: 0, flaky: 0, skipped: 0, duration: 0 } };

for (const dir of shardDirs) {
  const res = readJson(path.join(dir, 'playwright-results.json'));
  if (!res) continue;
  if (Array.isArray(res.suites)) merged.suites.push(...res.suites);
  if (res.stats) {
    merged.stats.expected += res.stats.expected || 0;
    merged.stats.unexpected += res.stats.unexpected || 0;
    merged.stats.flaky += res.stats.flaky || 0;
    merged.stats.skipped += res.stats.skipped || 0;
    merged.stats.duration += res.stats.duration || 0;
  }
}

fs.writeFileSync(
  path.join(outDir, 'playwright-results.json'),
  JSON.stringify(merged, null, 2),
);

console.log(`merged ${shardDirs.length} shard(s) → ${outDir}`);
