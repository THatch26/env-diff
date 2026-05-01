import { describe, it, expect } from 'vitest';
import { parseEnv, diffEnvs } from '../src/diff.js';
import fs from 'fs';
import path from 'path';

function writeTempFile(name, content) {
  const filePath = path.join(process.cwd(), name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function cleanupFile(name) {
  const p = path.join(process.cwd(), name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

describe('parseEnv', () => {
  it('parses simple key=value pairs', () => {
    const fp = writeTempFile('test-simple.env', 'KEY1=VALUE1\nKEY2=VALUE2\n');
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY1: 'VALUE1', KEY2: 'VALUE2' });
    cleanupFile('test-simple.env');
  });

  it('ignores blank lines and comments', () => {
    const fp = writeTempFile('test-comments.env', '# this is a comment\nKEY=VALUE\n\n# another comment\nKEY2=VALUE2');
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY: 'VALUE', KEY2: 'VALUE2' });
    cleanupFile('test-comments.env');
  });

  it('trims whitespace around keys and values', () => {
    const fp = writeTempFile('test-trim.env', '  KEY1  =  VALUE1  \n  KEY2 = VALUE2');
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY1: 'VALUE1', KEY2: 'VALUE2' });
    cleanupFile('test-trim.env');
  });

  it('strips surrounding double quotes from values', () => {
    const fp = writeTempFile('test-dq.env', 'KEY="quoted value"');
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY: 'quoted value' });
    cleanupFile('test-dq.env');
  });

  it('strips surrounding single quotes from values', () => {
    const fp = writeTempFile('test-sq.env', "KEY='quoted value'");
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY: 'quoted value' });
    cleanupFile('test-sq.env');
  });

  it('preserves quotes that are not matching', () => {
    const fp = writeTempFile('test-mixed.env', "KEY=\"start'");
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY: "\"start'" });
    cleanupFile('test-mixed.env');
  });

  it('throws on missing file', () => {
    expect(() => parseEnv('nonexistent-file.env')).toThrow('File not found');
  });

  it('handles empty values', () => {
    const fp = writeTempFile('test-empty-val.env', 'KEY=\nKEY2=someval');
    const env = parseEnv(fp);
    expect(env).toEqual({ KEY: '', KEY2: 'someval' });
    cleanupFile('test-empty-val.env');
  });

  it('handles values with equals signs', () => {
    const fp = writeTempFile('test-equals.env', 'CONN=postgres://user:pass@localhost:5432/db');
    const env = parseEnv(fp);
    expect(env).toEqual({ CONN: 'postgres://user:pass@localhost:5432/db' });
    cleanupFile('test-equals.env');
  });
});

describe('diffEnvs', () => {
  it('detects missing keys (in env1 but not env2)', () => {
    const result = diffEnvs({ A: '1', B: '2' }, { A: '1' });
    expect(result).toEqual({ missing: ['B'], extra: [], changed: [] });
  });

  it('detects extra keys (in env2 but not env1)', () => {
    const result = diffEnvs({ A: '1' }, { A: '1', B: '2' });
    expect(result).toEqual({ missing: [], extra: ['B'], changed: [] });
  });

  it('detects changed values', () => {
    const result = diffEnvs({ A: '1', B: '2' }, { A: '1', B: '3' });
    expect(result).toEqual({
      missing: [],
      extra: [],
      changed: [{ key: 'B', oldVal: '2', newVal: '3' }],
    });
  });

  it('detects no differences when identical', () => {
    const result = diffEnvs({ A: '1', B: '2' }, { A: '1', B: '2' });
    expect(result).toEqual({ missing: [], extra: [], changed: [] });
  });

  it('detects multiple categories simultaneously', () => {
    const result = diffEnvs(
      { A: '1', B: '2', C: '3' },
      { A: '1', C: '99', D: '4' }
    );
    expect(result.missing).toEqual(['B']);
    expect(result.extra).toEqual(['D']);
    expect(result.changed).toEqual([{ key: 'C', oldVal: '3', newVal: '99' }]);
  });

  it('handles empty objects', () => {
    const result = diffEnvs({}, {});
    expect(result).toEqual({ missing: [], extra: [], changed: [] });
  });

  it('handles one empty object', () => {
    const result = diffEnvs({ A: '1' }, {});
    expect(result).toEqual({ missing: ['A'], extra: [], changed: [] });
  });

  it('detects all keys missing when second is empty', () => {
    const result = diffEnvs({}, { A: '1' });
    expect(result).toEqual({ missing: [], extra: ['A'], changed: [] });
  });

  it('treats empty string and different string as changed', () => {
    const result = diffEnvs({ A: 'hello' }, { A: '' });
    expect(result.changed).toEqual([{ key: 'A', oldVal: 'hello', newVal: '' }]);
  });

  it('handles keys with special characters', () => {
    const result = diffEnvs(
      { 'MY-KEY': 'val1', 'my_key': 'val2' },
      { 'MY-KEY': 'val1', 'my_key': 'changed' }
    );
    expect(result.changed).toEqual([{ key: 'my_key', oldVal: 'val2', newVal: 'changed' }]);
  });
});
