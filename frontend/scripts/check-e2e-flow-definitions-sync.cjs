#!/usr/bin/env node
'use strict';

/**
 * Ensures flow-definitions.json keys match the set of @flow:<id> tokens in every e2e .ts file.
 * Usage: node scripts/check-e2e-flow-definitions-sync.cjs [--definitions PATH] [--e2e-dir PATH]
 */

const fs = require('fs');
const path = require('path');

const FLOW_TAG_RE = /@flow:([a-z0-9-]+)/g;

function parseArgs(argv) {
  let definitionsPath = path.resolve(__dirname, '..', 'e2e', 'flow-definitions.json');
  let e2eDir = path.resolve(__dirname, '..', 'e2e');
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--definitions' && argv[i + 1]) {
      definitionsPath = path.resolve(argv[++i]);
    } else if (argv[i] === '--e2e-dir' && argv[i + 1]) {
      e2eDir = path.resolve(argv[++i]);
    }
  }
  return { definitionsPath, e2eDir };
}

function collectTsFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) {
    return acc;
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      collectTsFiles(full, acc);
    } else if (ent.isFile() && ent.name.endsWith('.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function extractFlowIdsFromSource(content) {
  const ids = new Set();
  let m;
  const re = new RegExp(FLOW_TAG_RE.source, 'g');
  while ((m = re.exec(content)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

function loadDefinitionIds(definitionsPath) {
  const raw = fs.readFileSync(definitionsPath, 'utf8');
  const data = JSON.parse(raw);
  const flows = data.flows;
  if (!flows || typeof flows !== 'object' || Array.isArray(flows)) {
    throw new Error('flow-definitions.json: missing or invalid "flows" object');
  }
  return new Set(Object.keys(flows));
}

function collectTagIdsFromE2eDir(e2eDir) {
  const files = collectTsFiles(e2eDir);
  const ids = new Set();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const id of extractFlowIdsFromSource(content)) {
      ids.add(id);
    }
  }
  return ids;
}

/**
 * @param {string} definitionsPath
 * @param {string} e2eDir
 * @returns {{ ok: boolean, onlyInDefinitions: string[], onlyInTags: string[] }}
 */
function compareFlowDefinitionsSync(definitionsPath, e2eDir) {
  const defIds = loadDefinitionIds(definitionsPath);
  const tagIds = collectTagIdsFromE2eDir(e2eDir);

  const onlyInDefinitions = [...defIds].filter((id) => !tagIds.has(id)).sort();
  const onlyInTags = [...tagIds].filter((id) => !defIds.has(id)).sort();

  return {
    ok: onlyInDefinitions.length === 0 && onlyInTags.length === 0,
    onlyInDefinitions,
    onlyInTags,
    flowCount: defIds.size,
  };
}

function printReport(result, definitionsPath, e2eDir) {
  const lines = [];
  lines.push('flow-definitions.json is out of sync with @flow: tags under e2e/**/*.ts.');
  lines.push('');
  lines.push(`  definitions: ${definitionsPath}`);
  lines.push(`  e2e dir:     ${e2eDir}`);
  lines.push('');
  if (result.onlyInDefinitions.length > 0) {
    lines.push(`Flows in JSON but not referenced in any .ts file (${result.onlyInDefinitions.length}):`);
    for (const id of result.onlyInDefinitions) {
      lines.push(`  - ${id}`);
    }
    lines.push('');
  }
  if (result.onlyInTags.length > 0) {
    lines.push(`@flow: tags in .ts but missing from JSON (${result.onlyInTags.length}):`);
    for (const id of result.onlyInTags) {
      lines.push(`  - ${id}`);
    }
    lines.push('');
  }
  lines.push('Fix: add matching entries to flow-definitions.json and flow-tags.ts / specs, then update lastUpdated.');
  return lines.join('\n');
}

function main() {
  const { definitionsPath, e2eDir } = parseArgs(process.argv);

  try {
    if (!fs.existsSync(definitionsPath)) {
      console.error(`check-e2e-flow-definitions-sync: file not found: ${definitionsPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(e2eDir)) {
      console.error(`check-e2e-flow-definitions-sync: directory not found: ${e2eDir}`);
      process.exit(1);
    }

    const result = compareFlowDefinitionsSync(definitionsPath, e2eDir);
    if (!result.ok) {
      console.error(printReport(result, definitionsPath, e2eDir));
      process.exit(1);
    }
    console.log(`check-e2e-flow-definitions-sync: OK (${result.flowCount} flows)`);
  } catch (err) {
    console.error(`check-e2e-flow-definitions-sync: ${err.message || err}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  compareFlowDefinitionsSync,
  loadDefinitionIds,
  collectTagIdsFromE2eDir,
  parseArgs,
};
