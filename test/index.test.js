import { describe, it, expect } from 'vitest';
import { parseEnv, diffEnvs } from '../src/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('parseEnv', () => {
  it('should parse a valid .env file', async () => {
    const testPath = path.join(__dirname, 'test.env');
    await fs.writeFile(testPath, 'KEY1=value1\nKEY2=value2\n');
    
    const result = await parseEnv(testPath);
    expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    
    await fs.unlink(testPath);
  });

  it('should skip empty lines and comments', async () => {
    const testPath = path.join(__dirname, 'test.env');
    await fs.writeFile(testPath, '# comment\n\nKEY=value\n\n# another comment\n');
    
    const result = await parseEnv(testPath);
    expect(result).toEqual({ KEY: 'value' });
    
    await fs.unlink(testPath);
  });

  it('should handle quoted values', async () => {
    const testPath = path.join(__dirname, 'test.env');
    await fs.writeFile(testPath, `KEY1="value with spaces"\nKEY2='single quoted'\n`);
    
    const result = await parseEnv(testPath);
    expect(result).toEqual({ KEY1: 'value with spaces', KEY2: 'single quoted' });
    
    await fs.unlink(testPath);
  });

  it('should throw error for invalid file path', async () => {
    await expect(parseEnv('/nonexistent/path/file.env')).rejects.toThrow();
  });

  it('should handle empty .env file', async () => {
    const testPath = path.join(__dirname, 'empty.env');
    await fs.writeFile(testPath, '');
    
    const result = await parseEnv(testPath);
    expect(result).toEqual({});
    
    await fs.unlink(testPath);
  });
});

describe('diffEnvs', () => {
  it('should return empty arrays for identical envs', () => {
    const result = diffEnvs({ KEY1: 'value1' }, { KEY1: 'value1' });
    expect(result).toEqual({ missing: [], extra: [], different: [] });
  });

  it('should detect missing keys in second file', () => {
    const result = diffEnvs({ KEY1: 'value1', KEY2: 'value2' }, { KEY1: 'value1' });
    expect(result).toEqual({ missing: ['KEY2'], extra: [], different: [] });
  });

  it('should detect extra keys in second file', () => {
    const result = diffEnvs({ KEY1: 'value1' }, { KEY1: 'value1', KEY2: 'value2' });
    expect(result).toEqual({ missing: [], extra: ['KEY2'], different: [] });
  });

  it('should detect different values', () => {
    const result = diffEnvs({ KEY1: 'value1' }, { KEY1: 'value2' });
    expect(result).toEqual({ missing: [], extra: [], different: ['KEY1'] });
  });

  it('should handle complex scenarios with multiple differences', () => {
    const result = diffEnvs(
      { KEY1: 'value1', KEY2: 'value2', KEY3: 'value3' },
      { KEY1: 'different', KEY2: 'value2', KEY4: 'value4' }
    );
    expect(result).toEqual({
      missing: ['KEY3'],
      extra: ['KEY4'],
      different: ['KEY1']
    });
  });

  it('should handle empty objects', () => {
    const result = diffEnvs({}, {});
    expect(result).toEqual({ missing: [], extra: [], different: [] });
  });
});