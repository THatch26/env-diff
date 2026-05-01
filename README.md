# env-diff

A CLI tool that compares two `.env` files and reports missing keys, extra keys, and keys present in both but with different values. Colored terminal output. Exits with code 1 if any diffs are found — perfect for CI pipelines.

## Installation

```bash
npm install -g env-diff
```

## Usage

```bash
# Compare two files
env-diff .env .env.example

# Strict mode — treat extra keys as errors
env-diff .env.staging .env.production --strict

# JSON output for piping
env-diff .env .env.example --json
```

## Help Output

```
$ env-diff --help

Usage: env-diff [options] <file1> <file2>

Compare two .env files and report differences

Arguments:
  file1          first .env file
  file2          second .env file

Options:
  --strict       treat extra keys as errors (exit code 1)
  --json         output diff as JSON
  -V, --version  output the version number
  -h, --help     display help for command
```

## Terminal Output

Here's what you'll see when differences are found:

```
$ env-diff .env .env.example

  Missing keys in .env.example:                    [RED text]
    - API_KEY                                      [RED text]
    - DB_PASSWORD                                  [RED text]

  Extra keys in .env.example:                      [YELLOW text]
    - DEBUG                                        [YELLOW text]
    - LOG_LEVEL                                    [YELLOW text]

  Changed values:                                  [BLUE text]
    - PORT: 3000 -> 8080                  [RED oldVal] [GREEN newVal]
    - NODE_ENV: development -> production  [RED oldVal] [GREEN newVal]

  Differences found.
```

```
$ env-diff .env .env.example

  No differences found. Files are identical.       [GREEN text]

```

ASCII art visual:

```
  ┌──────────────────────────────────────────────────────────┐
  │  env-diff .env .env.example                             │
  ├──────────────────────────────────────────────────────────┤
  │  Missing keys in .env.example:                          │
  │    - API_KEY                                            │
  │    - DB_PASSWORD                                        │
  │                                                         │
  │  Extra keys in .env.example:                            │
  │    - DEBUG                                              │
  │                                                         │
  │  Changed values:                                        │
  │    - PORT: 3000 -> 8080                                 │
  │    - NODE_ENV: development -> production                │
  │                                                         │
  │  Differences found.                                     │
  └──────────────────────────────────────────────────────────┘
```

## JSON Output

```
$ env-diff .env .env.example --json
```

```json
{
  "file1": ".env",
  "file2": ".env.example",
  "missing": ["API_KEY"],
  "extra": ["DEBUG"],
  "changed": [
    { "key": "PORT", "oldVal": "3000", "newVal": "8080" }
  ],
  "has_diffs": true
}
```

## Use in CI

Add this step to your GitHub Actions workflow to ensure your `.env` files stay in sync with your template:

```yaml
- name: Check .env sync
  run: npx env-diff .env .env.example --strict
```

If any keys are missing from `.env.example` or values have diverged, the step fails and your CI pipeline halts. This prevents deploying with stale or incomplete environment configuration.

### Example workflow

```yaml
name: Validate Env Files

on:
  push:
    branches: [main]
  pull_request:

jobs:
  env-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Verify env files match template
        run: npx env-diff .env .env.example --strict
```

## Exit Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 0    | No differences found                 |
| 1    | Differences found (or strict mode)   |
| 2    | Runtime error (missing file, etc.)   |

## License

MIT
