import fs from 'fs';

export function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const env = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
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
    const inEnv1 = key in env1;
    const inEnv2 = key in env2;

    if (!inEnv2) {
      missing.push(key);
    } else if (!inEnv1) {
      extra.push(key);
    } else if (env1[key] !== env2[key]) {
      changed.push({ key, oldVal: env1[key], newVal: env2[key] });
    }
  }

  return { missing, extra, changed };
}
