import { describe, it, expect } from '@jest/globals';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';

const flowSync = require('../check-e2e-flow-definitions-sync.cjs');

const SCRIPT = path.join(__dirname, '..', 'check-e2e-flow-definitions-sync.cjs');

function writeDefinitions(dir: string, flowIds: string[]) {
  const flows: Record<string, { module: string }> = {};
  for (const id of flowIds) {
    flows[id] = { module: 'test' };
  }
  const filePath = path.join(dir, 'flow-definitions.json');
  fs.writeFileSync(
    filePath,
    JSON.stringify({ version: '1.0.0', lastUpdated: '2026-03-31', flows }),
    'utf8'
  );
  return filePath;
}

function writeTs(dir: string, relPath: string, content: string) {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

describe('check-e2e-flow-definitions-sync', () => {
  it('compareFlowDefinitionsSync returns ok when sets match', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
    try {
      const defPath = writeDefinitions(root, ['alpha-flow', 'beta-flow']);
      const e2eDir = path.join(root, 'e2e');
      writeTs(e2eDir, 'spec.ts', "tag: ['@flow:alpha-flow', '@flow:beta-flow']");
      const result = flowSync.compareFlowDefinitionsSync(defPath, e2eDir);
      expect(result.ok).toBe(true);
      expect(result.onlyInDefinitions).toEqual([]);
      expect(result.onlyInTags).toEqual([]);
      expect(result.flowCount).toBe(2);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('compareFlowDefinitionsSync lists flows only in JSON', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
    try {
      const defPath = writeDefinitions(root, ['in-json-only', 'shared']);
      const e2eDir = path.join(root, 'e2e');
      writeTs(e2eDir, 'a.ts', '@flow:shared');
      const result = flowSync.compareFlowDefinitionsSync(defPath, e2eDir);
      expect(result.ok).toBe(false);
      expect(result.onlyInDefinitions).toEqual(['in-json-only']);
      expect(result.onlyInTags).toEqual([]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('compareFlowDefinitionsSync lists @flow ids only in TS', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
    try {
      const defPath = writeDefinitions(root, ['only-json']);
      const e2eDir = path.join(root, 'e2e');
      writeTs(e2eDir, 'a.ts', '@flow:only-json\n@flow:orphan-tag');
      const result = flowSync.compareFlowDefinitionsSync(defPath, e2eDir);
      expect(result.ok).toBe(false);
      expect(result.onlyInTags).toEqual(['orphan-tag']);
      expect(result.onlyInDefinitions).toEqual([]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('loadDefinitionIds throws when flows is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
    try {
      const defPath = path.join(root, 'flow-definitions.json');
      fs.writeFileSync(defPath, JSON.stringify({ version: '1' }), 'utf8');
      expect(() => flowSync.loadDefinitionIds(defPath)).toThrow(/flows/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('parseArgs reads --definitions and --e2e-dir', () => {
    const opts = flowSync.parseArgs([
      'node',
      'script',
      '--definitions',
      '/tmp/defs.json',
      '--e2e-dir',
      '/tmp/e2e',
    ]);
    expect(opts.definitionsPath).toBe(path.resolve('/tmp/defs.json'));
    expect(opts.e2eDir).toBe(path.resolve('/tmp/e2e'));
  });

  it('CLI exits 0 when sync and 1 when mismatch', () => {
    const okRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
    const badRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
    try {
      const okDef = writeDefinitions(okRoot, ['x']);
      const okE2e = path.join(okRoot, 'e2e');
      writeTs(okE2e, 't.ts', '@flow:x');
      const okRun = spawnSync(process.execPath, [SCRIPT, '--definitions', okDef, '--e2e-dir', okE2e], {
        encoding: 'utf8',
      });
      expect(okRun.status).toBe(0);

      const badDef = writeDefinitions(badRoot, ['missing-in-ts']);
      const badE2e = path.join(badRoot, 'e2e');
      fs.mkdirSync(badE2e, { recursive: true });
      writeTs(badE2e, 'empty.ts', '// no flow tags');
      const badRun = spawnSync(process.execPath, [SCRIPT, '--definitions', badDef, '--e2e-dir', badE2e], {
        encoding: 'utf8',
      });
      expect(badRun.status).toBe(1);
      expect(badRun.stderr).toContain('missing-in-ts');
    } finally {
      fs.rmSync(okRoot, { recursive: true, force: true });
      fs.rmSync(badRoot, { recursive: true, force: true });
    }
  });
});
