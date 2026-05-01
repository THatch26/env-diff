# env-diff

A CLI tool for comparing two `.env` files and identifying differences between them. It helps developers ensure environment consistency across different environments (development, staging, production) by highlighting missing keys, extra keys, and value mismatches.

## Installation

### Global Installation

Install the package globally using npm:

```bash
npm install -g env-diff
```

### Local Installation

Or install as a dev dependency in your project:

```bash
npm install --save-dev env-diff
```

## Usage

### Basic Usage

Compare two `.env` files:

```bash
env-diff .env.local .env.production
```

### JSON Output

For programmatic use (e.g., in CI scripts), use the `--json` flag to get structured output:

```bash
env-diff .env.local .env.production --json
```

This outputs a JSON object with three arrays:

```json
{
  "missing": ["DATABASE_URL"],
  "extra": ["DEBUG"],
  "different": ["API_KEY"]
}
```

### Exit Codes

- `0`: Files are identical (no differences)
- `1`: Files have differences or an error occurred

This makes env-diff suitable for CI pipelines where you want to fail the build when environment files differ unexpectedly.

## Examples

### Example 1: Compare Development and Production Environments

```bash
env-diff .env.development .env.production
```

Output:
```
Missing from second file:
  - DEBUG
Extra in second file:
  - VERBOSE
Different values:
  ~ API_KEY
```

### Example 2: Validate Environment Consistency in CI

Use in a CI script to ensure required variables exist:

```bash
#!/bin/bash
if ! env-diff .env.example .env; then
  echo "❌ .env is missing variables from .env.example"
  exit 1
fi
echo "✓ All required environment variables are present"
```

### Example 3: Compare with JSON for Custom Logic

```bash
#!/bin/bash
result=$(env-diff .env.dev .env.staging --json)

# Check if any differences exist
if echo "$result" | jq -e '.missing or .extra or .different' > /dev/null; then
  echo "⚠️  Environment files differ"
  echo "$result" | jq '.'
fi
```

## Use in CI

Add env-diff to your GitHub Actions workflow to validate environment consistency:

```yaml
name: Environment Check

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  env-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install env-diff
        run: npm install -g env-diff
        
      - name: Check environment consistency
        run: |
          env-diff .env.example .env
          
      - name: Validate production readiness
        if: github.ref == 'refs/heads/main'
        run: |
          env-diff .env.staging .env.production --json | \
            jq 'if .missing | length > 0 then error("Missing keys in production") else empty end'
```

## Development

Run tests with:

```bash
npm test
```

Lint the code with:

```bash
npm run lint
```

Source code is located in `src/index.js` and the CLI entry point is `bin/cli.js`.

## License

MIT