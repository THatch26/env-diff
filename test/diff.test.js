import { describe, it, expect, afterAll } from 'vitest';
import { parseEnv, diffEnvs } from '../src/diff.js';
import fs from 'fs';
import path from 'path';

describe('env-diff logic', () => {
  const testFile1 = path.join(process.cwd(), 'test-env1');
  const testFile2 = path.join(process.cwd(), 'test-env2');

  it('should parse env files correctly', () => {
    fs.writeFileSync(testFile1, 'KEY1=VALUE1\nKEY2=VALUE2\n# Comment\n  KEY3 = VALUE3  \n');
    const env = parseEnv(testFile1);
    expect(env).toEqual({
      KEY1: 'VALUE1',
      KEY2: 'VALUE2',
      KEY3: 'VALUE3'
    });
  });

  it('should detect missing keys', () => {
    const env1 = { A: '1', B: '2' };
    const env2 = { A: '1' };
    const { missing, extra, changed } = diffEnvs(env1, env2);
    expect(missing).toEqual(['B']);
    expect(extra).toEqual([]);
    expect(changed).toEqual([]);
  });

  it('should detect extra keys', () => {
    const env1 = { A: '1' };
    const env2 = { A: '1', B: '2' };
    const { missing, extra, changed } = diffEnvs(env1, env2);
    expect(missing).toEqual([]);
    expect(extra).toEqual(['B']);
    expect(changed).toEqual([]);
  });

  it('should detect changed values', () => {
    const env1 = { A: '1', B: '2' };
    const env2 = { A: '1', B: '3' };
    const { missing, extra, changed } = diffEnvs(env1, env2);
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
    expect(changed).toEqual([{ key: 'B', oldVal: '2', newVal: '3' }]);
  });

  it('should detect no differences', () => {
    const env1 = { A: '1', B: '2' };
    const env2 = { A: '1', B: '2' };
    const { missing, extra, changed } = diffEnvs(env1, env2);
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
    expect(changed).toEqual([]);
  });

  afterAll(() => {
    if (fs.existsSync(testFile1)) fs.unlinkSync(testFile1);
    if (fs.existsSync(testFile2)) fs.unlinkSync(testFile2);
  });
});
