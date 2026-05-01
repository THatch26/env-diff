import fs from 'fs/promises';
import path from 'path';

/**
 * Parse an env file and return key-value pairs
 * @param {string} filepath - Path to the .env file
 * @returns {Promise<{[key: string]: string}>} Parsed key-value pairs
 */
export async function parseEnv(filepath) {
  const content = await fs.readFile(filepath, 'utf-8');
  const lines = content.split('\n');
  const result = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // Split on first = sign
    const eqIndex = trimmedLine.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmedLine.substring(0, eqIndex).trim();
    const value = trimmedLine.substring(eqIndex + 1).trim();

    // Remove surrounding quotes from value if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      result[key] = value.slice(1, -1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Compare two env objects and find differences
 * @param {Object} a - First env object
 * @param {Object} b - Second env object
 * @returns {{missing: string[], extra: string[], different: string[]}} Differences between envs
 */
export function diffEnvs(a, b) {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));

  const missing = [];
  const extra = [];
  const different = [];

  // Find keys in A but not in B (missing from B)
  for (const key of keysA) {
    if (!keysB.has(key)) {
      missing.push(key);
    }
  }

  // Find keys in B but not in A (extra in B)
  for (const key of keysB) {
    if (!keysA.has(key)) {
      extra.push(key);
    }
  }

  // Find keys that exist in both but have different values
  for (const key of keysA) {
    if (keysB.has(key) && a[key] !== b[key]) {
      different.push(key);
    }
  }

  return { missing, extra, different };
}