import fs from 'fs';

export function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  }
  return env;
}

export function diffEnvs(env1, env2) {
  const missing = [];
  const extra = [];
  const changed = [];

  const allKeys = new Set([...Object.keys(env1), ...Object.keys(env2)]);

  for (const key of allKeys) {
    if (!(key in env2)) {
      missing.push(key);
    } else if (!(key in env1)) {
      extra.push(key);
    } else if (env1[key] !== env2[key]) {
      changed.push({ key, oldVal: env1[key], newVal: env2[key] });
    }
  }

  return { missing, extra, changed };
}
